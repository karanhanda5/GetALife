// GetALife — Push Notification Service Worker

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};

  event.waitUntil(
    self.registration.showNotification(data.title ?? "🌿 GetALife", {
      body: data.body ?? "Your daily challenges are ready!",
      icon: data.icon ?? "/logo.png",
      badge: "/logo.png",
      tag: "getalife-daily",          // replaces any previous daily notification
      renotify: false,
      vibrate: [100, 50, 100],
      data: { url: data.url ?? "/dashboard" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If the app is already open, focus it and navigate
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          client.navigate?.(url);
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
