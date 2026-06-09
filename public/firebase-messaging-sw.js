// ═══════════════════════════════════════════════════════════════
// Firebase Cloud Messaging — Service Worker
// 
// Firebase SDK akan otomatis mencari file ini saat menerima
// push notification di background (app tidak dibuka).
// ═══════════════════════════════════════════════════════════════

// Import Firebase from CDN (SW cannot use npm modules directly)
importScripts("https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyAo72OAOIW0a38f7NWOVO8gI5pN9OvKsz4",
    authDomain: "catatin-df193.firebaseapp.com",
    projectId: "catatin-df193",
    storageBucket: "catatin-df193.firebasestorage.app",
    messagingSenderId: "544942083337",
    appId: "1:544942083337:web:a81708fcd86768db4457d8",
});

const messaging = firebase.messaging();

// ─── Background message handler ──────────────────────────────
// HANYA dipanggil untuk data-only messages.
// Jika message punya `notification` / `webpush.notification`, Firebase SDK
// akan auto-display dan handler ini TIDAK dipanggil — jadi tidak double.
messaging.onBackgroundMessage((payload) => {
    console.log("[FCM SW] Pesan background data-only diterima:", payload);

    // Safety guard: jika payload.notification sudah ada, Firebase sudah handle
    if (payload.notification) {
        console.log("[FCM SW] Skip — notifikasi sudah ditampilkan otomatis oleh Firebase SDK.");
        return;
    }

    const { title, body, icon, data } = payload.data || {};
    const clickAction = data?.click_action || "/dashboard";

    const options = {
        body: body || "Ada update baru dari Catatin.",
        icon: icon || "/icon-192.png",
        badge: "/icon-192.png",
        data: data || {},
        requireInteraction: true,
        actions: [
            { action: "open", title: "Buka" },
            { action: "dismiss", title: "Tutup" },
        ],
    };

    self.registration.showNotification(title || "Catatin", options);
});

// ─── Notification click handler ──────────────────────────────
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const clickAction = event.notification.data?.click_action || "/dashboard";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            // Jika sudah ada tab Catatin terbuka, fokus ke tab itu
            for (const client of clientList) {
                if (client.url.includes(self.location.hostname) && "focus" in client) {
                    return client.focus();
                }
            }
            // Jika tidak, buka tab baru
            if (clients.openWindow) {
                return clients.openWindow(clickAction);
            }
        }),
    );
});
