const CACHE_NAME = "catetin-v1";

const ASSETS_TO_CACHE = [
    "/",
    "/login",
    "/register",
    "/manifest.json",
    "/icon-192.png",
    "/icon-512.png",
];

// Install event — cache core assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate event — clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch event — network-first strategy
self.addEventListener("fetch", (event) => {
    // Only intercept GET requests
    if (event.request.method !== "GET") {
        return;
    }

    // Only intercept HTTP/HTTPS schemes (avoid chrome-extension:// etc.)
    if (!event.request.url.startsWith("http")) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful responses
                if (response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Fallback to cache
                return caches.match(event.request);
            })
    );
});
