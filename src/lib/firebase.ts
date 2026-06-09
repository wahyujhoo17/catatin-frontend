"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  type Messaging,
} from "firebase/messaging";

// ─── Firebase Web Config ──────────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// ─── Singleton Firebase App ───────────────────────────────────
let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;

  // Check config completeness
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn(
      "[Firebase] Config tidak lengkap — push notification dinonaktifkan.",
    );
    return null;
  }

  if (getApps().length > 0) {
    return getApps()[0];
  }

  try {
    app = initializeApp(firebaseConfig);
    return app;
  } catch (err) {
    console.error("[Firebase] Gagal inisialisasi:", err);
    return null;
  }
}

function getFirebaseMessaging(): Messaging | null {
  if (messaging) return messaging;
  const fbApp = getFirebaseApp();
  if (!fbApp) return null;

  try {
    messaging = getMessaging(fbApp);
    return messaging;
  } catch (err) {
    console.error("[Firebase] Gagal inisialisasi Messaging:", err);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

/**
 * Minta izin notifikasi SAJA — HARUS dipanggil langsung dari
 * user gesture (click/tap handler), SEBELUM await fetch() apapun.
 * Jika dipanggil setelah await, browser akan silent-ignore.
 *
 * Return value: "granted" | "denied" | "default" | null
 * null artinya browser tidak support / terjadi error.
 */
export function requestPermissionOnly(): NotificationPermission | null {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window)) return null;

  // Already granted — no need to ask again
  if (Notification.permission === "granted") return "granted";

  // Already denied — return as-is, browser won't show popup again
  if (Notification.permission === "denied") return "denied";

  // "default" — browser hasn't been asked yet, this will trigger popup
  // (dies inside the sync call, which is why this MUST be in a user gesture)
  return Notification.permission; // tetap "default", caller akan trigger requestPermission()
}

/**
 * Trigger popup izin notifikasi — HARUS dipanggil dalam user gesture.
 * Panggil ini di dalam click handler, SEBELUM await fetch().
 */
export async function requestAndGetPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined") return "denied";
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";

  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

/**
 * Dapatkan FCM token (asumsi izin notifikasi sudah granted).
 * Bisa dipanggil kapan saja — tidak perlu user gesture.
 */
export async function getFCMToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window)) {
    console.warn("[FCM] Browser tidak support Notification API.");
    return null;
  }
  if (Notification.permission !== "granted") {
    console.warn(
      "[FCM] Izin notifikasi belum diberikan (status: %s).\n" +
        "🔧 Cara reset di Chrome: klik gembok di address bar → Notifications → Allow\n" +
        "   Atau buka: chrome://settings/content/siteDetails?site=%s",
      Notification.permission,
      window.location.origin,
    );
    return null;
  }

  const msg = getFirebaseMessaging();
  if (!msg) return null;

  try {
    const currentToken = await getToken(msg, {
      vapidKey: VAPID_KEY,
    });

    if (currentToken) {
      console.log("[FCM] Token didapat:", currentToken.slice(0, 20) + "...");
      return currentToken;
    } else {
      console.warn("[FCM] Gagal mendapatkan token — coba refresh permission.");
      return null;
    }
  } catch (err) {
    console.error("[FCM] Error getToken:", err);
    return null;
  }
}

/**
 * Kirim FCM token ke backend untuk disimpan.
 */
export async function sendTokenToBackend(
  token: string,
  authToken: string,
  apiBase: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase}/api/auth/device-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("[FCM] Gagal menyimpan token ke backend:", data.error);
      return false;
    }

    console.log("[FCM] Token berhasil disimpan di backend.");
    return true;
  } catch (err) {
    console.error("[FCM] Error menyimpan token:", err);
    return false;
  }
}

/**
 * Hapus FCM token saat logout (di-backend).
 */
export async function removeTokenFromBackend(
  token: string,
  authToken: string,
  apiBase: string,
): Promise<void> {
  try {
    await fetch(`${apiBase}/api/auth/device-token`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token }),
    });
  } catch {
    // best-effort
  }
}

/**
 * Dengarkan pesan push saat app di foreground (opsional).
 * Callback dipanggil dengan payload notifikasi.
 */
export function onForegroundMessage(
  callback: (payload: any) => void,
): () => void {
  const msg = getFirebaseMessaging();
  if (!msg) return () => {};

  const unsubscribe = onMessage(msg, (payload) => {
    console.log("[FCM] Pesan foreground:", payload);
    callback(payload);
  });

  return unsubscribe;
}
