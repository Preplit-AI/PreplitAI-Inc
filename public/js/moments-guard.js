// The kit's moment guard (references/moments.md): marks that scripts run, and
// shows every moment's finished state if its module has not started in 2.5 s.
// A file rather than an inline script, so the Content-Security-Policy can stay script-src 'self'.
document.documentElement.classList.add("mo-js");
setTimeout(function () {
  document.documentElement.classList.add("mo-safe");
}, 2500);
