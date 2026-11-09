// Remembers which language of the landing page was last read, so the sign-up and
// sign-in pages (the React app, src/lib/lang.tsx) open in the same one.
try {
  window.localStorage.setItem("jb_lang", document.documentElement.lang === "en" ? "en" : "ko");
} catch (e) {
  // Storage can be blocked; the React pages then default to Korean.
}
