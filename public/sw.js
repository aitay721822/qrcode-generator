const VERSION = "v7";
const CACHE_NAME = `qrcode-generator-${VERSION}`;
const urlsToCache = [
  "/",
  "/en",
  "/zh-Hant",
  "/en/qrcode",
  "/zh-Hant/qrcode",
  "/en/guid-generator",
  "/zh-Hant/guid-generator",
  "/en/b64viewer",
  "/zh-Hant/b64viewer",
  "/en/paste",
  "/zh-Hant/paste",
  "/en/password-generator",
  "/zh-Hant/password-generator",
  "/offline.html",
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  console.log(`[Service Worker] Installing new version - ${VERSION}`);
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Opened cache:", CACHE_NAME);
        return cache.addAll(
          urlsToCache.map((url) => new Request(url, { cache: "reload" })),
        );
      })
      .catch((error) => {
        console.error("[Service Worker] Cache addAll failed:", error);
      }),
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log(`[Service Worker] Activating new version - ${VERSION}`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
          return undefined;
        }),
      );
    }),
  );
  console.log("[Service Worker] Taking control of all pages");
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          // Check if we received a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            // Only cache same-origin GET requests
            if (event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, responseToCache);
            }
          });

          return response;
        })
        .catch(() => {
          // Network failed, try to return offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html");
          }
          return new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({
              "Content-Type": "text/plain",
            }),
          });
        });
    }),
  );
});
