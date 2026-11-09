import { ApiError, request } from "./api";

/*
 * Phone notifications: registering this browser so Juno can reach the student
 * when the app is closed. Permission is only ever asked for after they press a
 * button. iPhones allow this only once Preplit AI is added to the home screen.
 */

export type PushState = "unavailable" | "needs-install" | "denied" | "off" | "on";

const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent);
const isInstalled = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;

const browserSupportsPush = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

function keyToBytes(base64: string) {
  const normalized = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0));
}

type PushConfig = { enabled: boolean; publicKey: string | null };

export async function pushState(): Promise<PushState> {
  if (!browserSupportsPush()) return isIos() && !isInstalled() ? "needs-install" : "unavailable";
  const config = await request<PushConfig>("/push/config").catch(() => null);
  if (!config?.enabled) return "unavailable";
  if (Notification.permission === "denied") return "denied";
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  return subscription ? "on" : "off";
}

/** Must be called from a button press, or the browser refuses to ask. */
export async function enablePush(): Promise<PushState> {
  const config = await request<PushConfig>("/push/config");
  if (!config.enabled || !config.publicKey) throw new ApiError(503, "PushOff", "지금은 알림을 켤 수 없어요.");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "off";

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(config.publicKey) }));
  await request("/push/subscribe", { method: "POST", body: subscription.toJSON() });
  return "on";
}

export async function disablePush(): Promise<void> {
  if (!browserSupportsPush()) return;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  await request("/push/unsubscribe", { method: "POST", body: { endpoint: subscription.endpoint } }).catch(() => {});
  await subscription.unsubscribe();
}
