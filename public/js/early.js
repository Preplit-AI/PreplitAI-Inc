// Preplit AI isn't public yet. On the static pages, every way into the product (sign-up, log-in,
// the workspace) opens the early-access note instead; the backend is unchanged.
// A developer passes once with ?dev=1 on any page (remembered on this device; ?dev=0 undoes it).
// The React app reads the same key (src/lib/earlyAccess.ts).
(function () {
  var KEY = "preplit.devAccess";
  try {
    var query = new URLSearchParams(window.location.search);
    if (query.has("dev")) window.localStorage.setItem(KEY, query.get("dev") === "0" ? "0" : "1");
    if (window.localStorage.getItem(KEY) === "1") return;
  } catch (e) {
    // Storage can be blocked; the note then shows for everyone.
  }

  var dialog = document.getElementById("early");
  if (!dialog || typeof dialog.showModal !== "function") return;
  var feature = dialog.querySelector("[data-early-feature]");
  var GATED = /^\/(signup|login|workspace|app)(\/|$)/;

  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return;
    var url;
    try {
      url = new URL(link.getAttribute("href"), window.location.href);
    } catch (e) {
      return;
    }
    if (url.origin !== window.location.origin || !GATED.test(url.pathname)) return;
    event.preventDefault();
    feature.textContent = (link.textContent || "").replace(/\s+/g, " ").trim();
    dialog.showModal();
  });

  dialog.addEventListener("click", function (event) {
    // The card fills the dialog, so a click on the dialog itself is a click on the dimmed page around it.
    if (event.target === dialog || (event.target.closest && event.target.closest("[data-early-close]"))) dialog.close();
  });
})();
