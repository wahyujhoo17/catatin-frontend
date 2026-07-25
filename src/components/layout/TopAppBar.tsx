"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";

interface TopAppBarProps {
  showProfile?: boolean;
  showNotification?: boolean;
}

export default function TopAppBar({
  showProfile = true,
  showNotification = true,
}: TopAppBarProps) {
  const { user, token } = useAuth();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "B";
  const [unreadCount, setUnreadCount] = useState(0);

  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count || 0);
      }
    } catch {
      // Silently fail
    }
  }, [token, API]);

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds for unread count
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

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
        <div
          style={{
            position: "relative",
            width: 120,
            height: 32,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Image
            src="/logo/logo.png"
            alt="Catatin Logo"
            fill
            sizes="120px"
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {showNotification && (
          <Link
            href="/notifications"
            className="btn-icon"
            aria-label="Notifikasi"
            style={{ position: "relative", textDecoration: "none" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "var(--on-surface-variant)" }}
            >
              notifications
            </span>
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  background: "#d32f2f",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                  lineHeight: 1,
                  border: "2px solid var(--surface)",
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
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
