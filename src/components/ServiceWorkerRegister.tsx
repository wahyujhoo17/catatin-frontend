"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // ─── PWA Service Worker (caching) ─────────────────────────
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silently fail — SW is optional
      });

      // ─── Firebase Messaging Service Worker ────────────────────
      // Daftarkan SW terpisah untuk FCM background messages.
      // Scope menggunakan path agar tidak bentrok dengan SW utama.
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((reg) => {
          console.log("[SW] Firebase Messaging SW terdaftar:", reg.scope);
        })
        .catch((err) => {
          console.warn("[SW] Gagal mendaftarkan Firebase Messaging SW:", err);
        });
    }
  }, []);

  return null;
}
