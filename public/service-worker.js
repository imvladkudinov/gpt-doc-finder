// __SW_BUILD_HASH__ is replaced with a unique value at build time by the
// serviceWorkerHashPlugin in vite.config.ts. In dev it stays as the literal
// placeholder, which is fine because the SW is unregistered outside PROD.
const BUILD_HASH = "__SW_BUILD_HASH__";
const CACHE_NAME = `planty-static-${BUILD_HASH}`;
const RUNTIME_CACHE_NAME = `planty-runtime-${BUILD_HASH}`;
const CURRENT_CACHES = [CACHE_NAME, RUNTIME_CACHE_NAME];
const STATIC_ASSETS = ["/index.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !CURRENT_CACHES.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put("/index.html", responseClone).catch(() => {
              // Ignore cache put failures to keep navigation resilient.
            });
          });
          return response;
        })
        .catch(() => caches.match("/index.html")),
    );
    return;
  }

  if (url.origin === self.location.origin && ["script", "style", "font", "image"].includes(request.destination)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE_NAME);
      const cached = await cache.match(request);
      const networkRequest = fetch(request)
        .then((response) => {
          if (response.ok) {
            cache.put(request, response.clone()).catch(() => {
              // Ignore cache write failures to keep asset loading resilient.
            });
          }
          return response;
        });

      if (cached) {
        event.waitUntil(networkRequest.catch(() => {
          // Ignore refresh failures when a cached asset is already available.
        }));
        return cached;
      }

      return networkRequest;
    })());
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});

self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};
  const title = payload.title ?? "Planty";
  const body = payload.body ?? "You have a new reminder.";
  const targetUrl = payload.url ?? "/plants";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      data: { url: targetUrl },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/plants";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});
