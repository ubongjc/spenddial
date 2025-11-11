// Service Worker for SpendDial PWA
const CACHE_NAME = "spenddial-v1";
const RUNTIME_CACHE = "spenddial-runtime-v1";

// Assets to cache on install
const PRECACHE_URLS = [
  "/",
  "/dashboard",
  "/transactions",
  "/categories",
  "/bills",
  "/offline",
];

// Install event - precache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Precaching core assets");
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Claim all clients immediately
  return self.clients.claim();
});

// Fetch event - network first, falling back to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API requests from caching (always fetch fresh)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response for caching
          const responseToCache = response.clone();

          // Cache successful API responses for offline fallback
          if (response.ok) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // Return cached API response if available (offline mode)
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline response for API calls
            return new Response(
              JSON.stringify({
                error: "You are offline. Please check your connection.",
                offline: true,
              }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              }
            );
          });
        })
    );
    return;
  }

  // For navigation requests, use network first, fall back to cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the response
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Try to return cached page
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page
            return caches.match("/offline");
          });
        })
    );
    return;
  }

  // For other requests (images, styles, scripts), use cache first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Don't cache if not a successful response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Handle background sync
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-transactions") {
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  try {
    const response = await fetch("/api/plaid/sync-transactions", {
      method: "POST",
    });
    return response.ok;
  } catch (error) {
    console.error("[SW] Background sync failed:", error);
    return false;
  }
}

// Handle push notifications
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || "You have a new notification",
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || "1",
    },
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/icon-check.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icon-close.png",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "SpendDial",
      options
    )
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "view") {
    event.waitUntil(
      clients.openWindow("/dashboard")
    );
  }
});

// Handle messages from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
