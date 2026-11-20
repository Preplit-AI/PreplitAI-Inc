import { Platform } from "react-native";
import type { ChatEvent, User } from "./types";

/*
 * The API client. The same API as the website (server/, live at www.preplitai.com/api).
 *
 * The access token lives only in memory and lasts fifteen minutes. The session
 * itself is an httpOnly cookie scoped to /api/auth: the web build sends it as
 * the same site, the phone app through the system's cookie store. On start, and
 * whenever a request comes back 401, the client asks /api/auth/refresh for a
 * new access token; concurrent callers share one refresh.
 *
 * No secret is in this app: every key (model, e-mail, Google) stays on the server.
 */

/** Where the API is. The web build is served from the same site; the phone app calls it by name. */
export const API_ORIGIN = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === "web" ? "" : "https://www.preplitai.com");
const credentials: RequestCredentials = Platform.OS === "web" ? "same-origin" : "include";

export class ApiError extends Error {
  status: number;
  code: string;
  field?: string;

  constructor(status: number, code: string, message: string, field?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

export type Session = { accessToken: string; user: User };

let accessToken: string | null = null;
let refreshInFlight: Promise<Session | null> | null = null;
const listeners = new Set<(session: Session | null) => void>();

export function onSessionChange(listener: (session: Session | null) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setSession(session: Session | null) {
  accessToken = session ? session.accessToken : null;
  listeners.forEach((listener) => listener(session));
}

type Body = { success?: boolean; error?: string; message?: string; field?: string; [key: string]: unknown } | null;

async function readBody(res: Response): Promise<Body> {
  try {
    return (await res.json()) as Body;
  } catch {
    return null;
  }
}

function toError(status: number, body: Body) {
  // A host's own refusal (a file too large for it) is not JSON; name it by its status.
  const code = body?.error ?? (status === 413 ? "FileTooLarge" : status >= 500 ? "ServerError" : "Unknown");
  return new ApiError(status, code, body?.message ?? "", body?.field);
}

/** Restores or renews the session from the refresh cookie. Resolves null when signed out. */
export function refreshSession(): Promise<Session | null> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_ORIGIN}/api/auth/refresh`, { method: "POST", credentials })
      .then(async (res) => {
        const body = res.status === 204 ? null : await readBody(res);
        if (!res.ok || !body?.accessToken) {
          setSession(null);
          return null;
        }
        const session = { accessToken: body.accessToken as string, user: body.user as User };
        setSession(session);
        return session;
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

const NO_RETRY = new Set(["/auth/login", "/auth/signup", "/auth/refresh", "/auth/logout"]);

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  form?: FormData;
  /** Bytes sent as they are (a slice of a recording). */
  raw?: Blob;
  signal?: AbortSignal;
};

export async function request<T>(path: string, options: RequestOptions = {}, retried = false): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let payload: BodyInit | undefined;
  if (options.form) payload = options.form;
  else if (options.raw) {
    headers["Content-Type"] = "application/octet-stream";
    payload = options.raw;
  }
  else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(options.body);
  }

  let res: Response;
  try {
    res = await fetch(`${API_ORIGIN}/api${path}`, {
      method: options.method ?? "GET",
      headers,
      body: payload,
      credentials,
      signal: options.signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError(0, "Network", "");
  }

  if (res.status === 401 && !retried && !NO_RETRY.has(path)) {
    const session = await refreshSession();
    if (session) return request<T>(path, options, true);
  }

  const body = await readBody(res);
  if (!res.ok) throw toError(res.status, body);
  return body as T;
}

/** Where "Continue with Google" sends the browser. The server runs the whole sign-in and comes back to the app. */
export function googleStartUrl(intent: "login" | "signup") {
  return `${API_ORIGIN}/api/auth/google/start?intent=${intent}&next=${encodeURIComponent("/m")}`;
}

export type ChatRequest = {
  question: string;
  conversationId?: string | null;
  courseId?: string | null;
  lectureId?: string | null;
  mode?: "career" | "companion" | null;
};

/**
 * Asks Juno a question and reports the answer as it is written. The server
 * answers with server-sent events: status (a tool is in use), delta (text),
 * reset (discard the text so far), then done or error.
 */
export async function streamChat(body: ChatRequest, onEvent: (event: ChatEvent) => void, signal?: AbortSignal, retried = false): Promise<void> {
  // The phone needs Expo's fetch to read a response while it is still arriving.
  const streamFetch: typeof fetch = Platform.OS === "web" ? fetch : (require("expo/fetch").fetch as typeof fetch);
  let res: Response;
  try {
    res = await streamFetch(`${API_ORIGIN}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify(body),
      credentials,
      signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError(0, "Network", "");
  }

  if (res.status === 401 && !retried) {
    const session = await refreshSession();
    if (session) return streamChat(body, onEvent, signal, true);
  }
  if (!res.ok || !res.body) throw toError(res.status, await readBody(res));

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let cut = buffer.indexOf("\n\n");
    while (cut !== -1) {
      const event = parseChatEvent(buffer.slice(0, cut));
      buffer = buffer.slice(cut + 2);
      if (event) onEvent(event);
      cut = buffer.indexOf("\n\n");
    }
  }
}

/** One server-sent event block → a chat event, or null for a comment (the heartbeat) or anything malformed. */
export function parseChatEvent(block: string): ChatEvent | null {
  let name = "";
  let data = "";
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) name = line.slice(6).trim();
    else if (line.startsWith("data:")) data += line.slice(5).trim();
  }
  if (!name || !data) return null;
  try {
    const payload = JSON.parse(data);
    if (name === "status") return { type: "status", tool: String(payload.tool) };
    if (name === "delta") return { type: "delta", text: String(payload.text) };
    if (name === "reset") return { type: "reset" };
    if (name === "action") return { type: "action", action: payload };
    if (name === "done") return { type: "done", conversation: payload.conversation, messages: payload.messages };
    if (name === "error") return { type: "error", code: String(payload.error), message: String(payload.message ?? "") };
  } catch {
    return null;
  }
  return null;
}
