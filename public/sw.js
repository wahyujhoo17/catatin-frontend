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

    const url = new URL(event.request.url);

    // Bypass Service Worker cache for:
    // 1. Cloudflare Turnstile scripts and iframes (must be fresh)
    // 2. Dynamic API backend endpoints (/api/)
    // 3. Dynamic authentication routes (/auth/ or google callback)
    // 4. Any other external domains (like Firebase, Google APIs)
    const isSelfOrigin = url.origin === self.location.origin;
    const isApiOrAuth = url.pathname.includes("/api/") || url.pathname.includes("/auth/");
    const isCloudflare = url.hostname.includes("challenges.cloudflare.com") || url.hostname.includes("cloudflare.com");

    if (!isSelfOrigin || isApiOrAuth || isCloudflare) {
        // Fetch directly from network and do not cache
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
