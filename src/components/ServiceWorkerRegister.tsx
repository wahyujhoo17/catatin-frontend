"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // ─── PWA Service Worker (caching) ─────────────────────────
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silently fail — SW is optional
      });

      // Firebase Messaging SW didaftarkan otomatis oleh Firebase SDK
      // saat getToken() dipanggil — tidak perlu registrasi manual di sini
      // karena akan konflik scope dengan Firebase SDK.
    }
  }, []);

  return null;
}
