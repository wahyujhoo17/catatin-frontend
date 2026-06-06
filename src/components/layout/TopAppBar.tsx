"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface TopAppBarProps {
  showProfile?: boolean;
  showNotification?: boolean;
}

export default function TopAppBar({
  showProfile = true,
  showNotification = true,
}: TopAppBarProps) {
  const { user } = useAuth();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "B";

  return (
    <header className="top-app-bar">
      <Link
        href="/dashboard"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          textDecoration: "none",
        }}
      >
        <div style={{ position: "relative", width: 120, height: 32, overflow: "hidden", display: "flex", alignItems: "center" }}>
          <Image
            src="/logo/logo.png"
            alt="Catetin Logo"
            width={120}
            height={120}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {showNotification && (
          <button className="btn-icon" aria-label="Notifikasi">
            <span
              className="material-symbols-outlined"
              style={{ color: "var(--on-surface-variant)" }}
            >
              notifications
            </span>
          </button>
        )}
        {showProfile && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--primary-fixed-dim), var(--primary-fixed))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid rgba(79, 55, 138, 0.2)",
              overflow: "hidden",
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--primary)",
            }}
          >
            {initial}
          </div>
        )}
      </div>
    </header>
  );
}
