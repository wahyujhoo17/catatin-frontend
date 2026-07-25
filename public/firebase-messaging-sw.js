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

self.addEventListener('notificationclick', function(event) {
    console.log('[FCM SW] Notification click received.', event);
    event.notification.close();

    // Default target URL
    let click_action = "/notifications?openLatest=1";
    
    // Check if URL is provided in the notification payload
    if (event.notification.data && event.notification.data.click_action) {
        click_action = event.notification.data.click_action;
    } else if (event.notification.data && event.notification.data.FCM_MSG && event.notification.data.FCM_MSG.notification && event.notification.data.FCM_MSG.notification.click_action) {
        click_action = event.notification.data.FCM_MSG.notification.click_action;
    } else if (event.action === "open" && event.notification.data && event.notification.data.link) {
        click_action = event.notification.data.link;
    }

    const targetUrl = new URL(click_action, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            // Jika ada tab/window PWA yang sudah terbuka
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if ('focus' in client) {
                    client.focus();
                }
                // Kirim pesan ke client untuk soft-navigation via router Next.js
                client.postMessage({
                    type: 'FCM_NOTIFICATION_CLICK',
                    url: targetUrl
                });
                return; // Cukup tangani satu window saja
            }
            // Jika tidak ada tab terbuka, buka window baru
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
