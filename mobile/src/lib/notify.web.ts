import type { Planned } from "./reminders";

/*
 * Delivering notifications in the browser (the web build). Same exports as
 * notify.ts, which is the installed app's version.
 *
 * A web page cannot ask the browser to show something later: that takes a
 * server sending a push at the right moment, which this build does not have
 * (mobile/README.md, "Not done yet"). So here a reminder is shown when its time
 * comes while the app is open in a tab, and not otherwise. The app says this
 * plainly where the student switches reminders on.
 *
 * Notifications are shown through the site's service worker (/sw.js), which is
 * what phones' browsers require, and which opens the right screen when pressed.
 */

export type Permission = "granted" | "denied" | "undetermined" | "unsupported";
export type Daily = { hour: number; title: string; body: string; url: string };

/** False here: only while the app is open in a tab. */
export const DELIVERS_WHEN_CLOSED = false;
export const CAN_OPEN_SETTINGS = false;

/** The web build lives under /m; a notification's link has to say so. */
const BASE = "/m";
const SHOWN_KEY = "preplit.notified";
const CHECK_EVERY_MS = 20000;
/** A reminder whose moment passed longer ago than this is left to the Home screen. */
const LATE_MS = 10 * 60000;

const supported = () => typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;

let worker: Promise<ServiceWorkerRegistration> | null = null;
function registration() {
  worker ??= navigator.serviceWorker.register("/sw.js").then(() => navigator.serviceWorker.ready);
  return worker;
}

const read = (value: NotificationPermission): Permission => (value === "default" ? "undetermined" : value);

export async function permission(): Promise<Permission> {
  return supported() ? read(Notification.permission) : "unsupported";
}

export async function ask(): Promise<Permission> {
  if (!supported()) return "unsupported";
  try {
    return read(await Notification.requestPermission());
  } catch {
    return "unsupported";
  }
}

export async function showNow(note: { title: string; body: string; url: string; tag?: string }): Promise<boolean> {
  if (!supported() || Notification.permission !== "granted") return false;
  try {
    const reg = await registration();
    await reg.showNotification(note.title, { body: note.body, icon: "/icon-192.png", badge: "/icon-192.png", tag: note.tag, data: { url: `${BASE}${note.url}` } });
    return true;
  } catch {
    return false;
  }
}

// ── While the app is open ────────────────────────────────────────────────────
let plan: Planned[] = [];
let everyDay: Daily | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

/** What has been shown already, so a reload does not show it twice. */
function shown(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(SHOWN_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function markShown(key: string) {
  try {
    window.localStorage.setItem(SHOWN_KEY, JSON.stringify([...shown(), key].slice(-200)));
  } catch {
    // Storage is blocked: at worst a reminder shows again after a reload.
  }
}

function check() {
  const now = Date.now();
  const already = shown();
  const due: (Planned | (Daily & { id: string; at: Date }))[] = plan.filter((note) => note.at.getTime() <= now && now - note.at.getTime() < LATE_MS);
  if (everyDay) {
    const today = new Date();
    today.setHours(everyDay.hour, 0, 0, 0);
    if (today.getTime() <= now && now - today.getTime() < LATE_MS) due.push({ ...everyDay, id: "daily", at: today });
  }
  for (const note of due) {
    const key = `${note.id}:${note.at.getTime()}`;
    if (already.includes(key)) continue;
    markShown(key);
    showNow({ title: note.title, body: note.body, url: note.url, tag: key });
  }
}

// In a browser only the evening reminder is kept: nudges through the day need the installed app.
export async function replaceSchedule(planned: Planned[], daily: Daily | null, _nudges: Daily[] = []): Promise<number> {
  plan = planned;
  everyDay = daily;
  if (timer) clearInterval(timer);
  timer = setInterval(check, CHECK_EVERY_MS);
  check();
  return planned.length + (daily ? 1 : 0);
}

export async function clearSchedule(): Promise<void> {
  plan = [];
  everyDay = null;
  if (timer) clearInterval(timer);
  timer = null;
}

/** The service worker opens the notification's own address, so there is nothing to listen for here. */
export function onOpen(_open: (url: string) => void): () => void {
  return () => {};
}

export function openSystemSettings() {}
