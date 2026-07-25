"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ServiceWorkerRegister() {
  const router = useRouter();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // ─── PWA Service Worker (caching) ─────────────────────────
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silently fail — SW is optional
      });

      // Firebase Messaging SW didaftarkan otomatis oleh Firebase SDK
      // saat getToken() dipanggil — tidak perlu registrasi manual di sini
      // karena akan konflik scope dengan Firebase SDK.
      
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'FCM_NOTIFICATION_CLICK') {
          console.log('[Frontend] Menerima event navigasi dari SW:', event.data.url);
          const targetUrl = new URL(event.data.url);
          router.push(targetUrl.pathname + targetUrl.search);
        }
      };

      navigator.serviceWorker.addEventListener("message", handleMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener("message", handleMessage);
      };
    }
  }, [router]);

  return null;
}
