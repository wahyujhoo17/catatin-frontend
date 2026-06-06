"use client";

import Image from "next/image";
import Link from "next/link";

interface TopAppBarProps {
  showProfile?: boolean;
  showNotification?: boolean;
}

export default function TopAppBar({
  showProfile = true,
  showNotification = true,
}: TopAppBarProps) {
  return (
    <header className="top-app-bar">
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
        <Image
          src="/logo/logo.png"
          alt="Catetin Logo"
          width={100}
          height={32}
          style={{ width: "auto", height: "auto" }}
          priority
        />
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {showNotification && (
          <button className="btn-icon" aria-label="Notifikasi">
            <span className="material-symbols-outlined" style={{ color: "var(--on-surface-variant)" }}>
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
              background: "linear-gradient(135deg, var(--primary-fixed-dim), var(--primary-fixed))",
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
            B
          </div>
        )}
      </div>
    </header>
  );
}
