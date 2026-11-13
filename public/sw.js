/* Shows Juno's notifications when Preplit AI is closed, and opens the right screen when one is pressed. Used by the website and by the mobile app's web build (/m). */

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Preplit AI", {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      lang: "ko",
      data: { url: typeof data.url === "string" && data.url.startsWith("/") ? data.url : "/workspace" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/workspace";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if ("focus" in client) {
          if ("navigate" in client) client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
