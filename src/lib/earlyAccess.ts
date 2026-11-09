/*
 * Preplit AI isn't public yet. Signing up, logging in and the app itself show the
 * early-access note instead (src/site/EarlyAccess.tsx; public/js/early.js on the
 * static pages). Nothing in the backend changes.
 *
 * A developer passes once by opening any page with ?dev=1; this device then
 * remembers it. ?dev=0 removes the pass again.
 */

const KEY = "preplit.devAccess";

export function hasDevAccess(): boolean {
  // Tests render the real screens, not the note.
  if (import.meta.env.MODE === "test") return true;
  try {
    const query = new URLSearchParams(window.location.search);
    if (query.has("dev")) window.localStorage.setItem(KEY, query.get("dev") === "0" ? "0" : "1");
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    // Storage can be blocked; the note then shows.
    return false;
  }
}
