"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const mode = searchParams.get("mode");

    if (token && refreshToken) {
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("profile_name", name || "");
      localStorage.setItem("profile_email", email || "");

      const IS_PROD = window.location.protocol === "https:";
      const COOKIE_FLAGS = `path=/; SameSite=Lax${IS_PROD ? "; Secure" : ""}`;

      document.cookie = `auth=1; ${COOKIE_FLAGS}; max-age=${60 * 60 * 24 * 7}`;

      if (mode) {
        document.cookie = `catatin-mode=${mode === "POS" ? "pos" : "personal"}; ${COOKIE_FLAGS}; max-age=2592000`;
      }

      router.replace("/workspace");
    } else {
      const error = searchParams.get("error") || "Google login gagal";
      router.replace(`/login?error=${encodeURIComponent(error)}`);
    }
  }, [router, searchParams]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{
          animation: "spin 1s linear infinite",
          fontSize: 48,
          color: "var(--primary)",
        }}
      >
        progress_activity
      </span>
      <p
        className="text-body-md"
        style={{ color: "var(--on-surface-variant)" }}
      >
        Menyelesaikan login...
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              animation: "spin 1s linear infinite",
              fontSize: 48,
              color: "var(--primary)",
            }}
          >
            progress_activity
          </span>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
