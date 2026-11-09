import type { ChatEvent, User } from "./types";

/*
 * The API client.
 *
 * The access token lives only in this module's memory: never in localStorage,
 * where any injected script could read it. It lasts fifteen minutes. The
 * session itself is an httpOnly cookie scoped to /api/auth that JavaScript
 * cannot see; on load, and whenever a request comes back 401, the client asks
 * /api/auth/refresh for a new access token. Concurrent callers share one
 * refresh, so two tabs or two requests never rotate the cookie twice.
 */

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
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

const NO_RETRY = new Set(["/auth/login", "/auth/signup", "/auth/refresh", "/auth/logout"]);

type Body = { success?: boolean; error?: string; message?: string; [key: string]: unknown } | null;

async function readBody(res: Response): Promise<Body> {
  try {
    return (await res.json()) as Body;
  } catch {
    return null;
  }
}

function toError(status: number, body: Body) {
  return new ApiError(status, body?.error ?? "Unknown", body?.message ?? "요청을 처리하지 못했어요.");
}

/** Restores or renews the session from the refresh cookie. Resolves null when signed out. */
export function refreshSession(): Promise<Session | null> {
  if (!refreshInFlight) {
    refreshInFlight = fetch("/api/auth/refresh", { method: "POST", credentials: "same-origin" })
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

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  form?: FormData;
  signal?: AbortSignal;
};

export async function request<T>(path: string, options: RequestOptions = {}, retried = false): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let payload: BodyInit | undefined;
  if (options.form) payload = options.form;
  else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(options.body);
  }

  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method: options.method ?? "GET",
      headers,
      body: payload,
      credentials: "same-origin",
      signal: options.signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError(0, "Network", "인터넷 연결을 확인해 주세요.");
  }

  if (res.status === 401 && !retried && !NO_RETRY.has(path)) {
    const session = await refreshSession();
    if (session) return request<T>(path, options, true);
  }

  const body = await readBody(res);
  if (!res.ok) throw toError(res.status, body);
  return body as T;
}

/** Reads one server-sent event, or returns null for a heartbeat comment or anything unreadable. */
export function parseChatEvent(block: string): ChatEvent | null {
  let event = "";
  let data = "";
  for (const line of block.split("\n")) {
    if (line.startsWith("event: ")) event = line.slice(7).trim();
    else if (line.startsWith("data: ")) data += line.slice(6);
  }
  if (!event || !data) return null;
  try {
    return { event, data: JSON.parse(data) } as ChatEvent;
  } catch {
    return null;
  }
}

/**
 * Posts and reads the answer as a stream of events. EventSource cannot be used:
 * it cannot send the access token, which by design is only in this module.
 * Errors before the stream opens throw like any other request.
 */
export async function streamChat(
  body: unknown,
  onEvent: (event: ChatEvent) => void,
  signal: AbortSignal,
  retried = false,
): Promise<void> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      credentials: "same-origin",
      signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError(0, "Network", "인터넷 연결을 확인해 주세요.");
  }

  if (res.status === 401 && !retried) {
    const session = await refreshSession();
    if (session) return streamChat(body, onEvent, signal, true);
  }
  if (!res.ok || !res.body) throw toError(res.status, await readBody(res));

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    let chunk: ReadableStreamReadResult<string>;
    try {
      chunk = await reader.read();
    } catch (err) {
      if ((err as Error).name === "AbortError") throw err;
      throw new ApiError(0, "Network", "인터넷 연결을 확인해 주세요.");
    }
    if (chunk.done) return;
    buffer += chunk.value;
    let end = buffer.indexOf("\n\n");
    while (end !== -1) {
      const event = parseChatEvent(buffer.slice(0, end));
      buffer = buffer.slice(end + 2);
      if (event) onEvent(event);
      end = buffer.indexOf("\n\n");
    }
  }
}

/**
 * Uploads a lecture with real progress reporting (fetch cannot report upload
 * progress). The session is renewed first so a long upload does not start on
 * a token about to expire.
 */
export async function uploadWithProgress<T>(path: string, form: FormData, onProgress: (fraction: number) => void): Promise<T> {
  await refreshSession();
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api${path}`);
    if (accessToken) xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      let body: Body = null;
      try {
        body = JSON.parse(xhr.responseText) as Body;
      } catch {
        body = null;
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(body as T);
      else reject(toError(xhr.status, body));
    };
    xhr.onerror = () => reject(new ApiError(0, "Network", "인터넷 연결을 확인해 주세요."));
    xhr.send(form);
  });
}
