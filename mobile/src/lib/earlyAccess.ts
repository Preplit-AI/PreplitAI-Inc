/*
 * The web build of the app is a preview and sits behind the same early-access
 * pass as the website's workspace (src/lib/earlyAccess.ts at the repo root):
 * open any page once with ?dev=1 and this device is remembered; ?dev=0 undoes it.
 * Only called on the web; the installed app has no such wall.
 */
const KEY = "preplit.devAccess";

export function hasDevAccess(): boolean {
  try {
    const query = new URLSearchParams(window.location.search);
    if (query.has("dev")) window.localStorage.setItem(KEY, query.get("dev") === "0" ? "0" : "1");
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
