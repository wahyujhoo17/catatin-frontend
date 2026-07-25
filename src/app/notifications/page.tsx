"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  clickAction: string | null;
  createdAt: string;
}

const TYPE_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  EXPENSE_ALERT: { icon: "warning", color: "#d32f2f", bg: "rgba(211,47,47,0.08)" },
  BUDGET_EXCEEDED: { icon: "account_balance_wallet", color: "#e65100", bg: "rgba(230,81,0,0.08)" },
  SUBSCRIPTION_REMINDER: { icon: "event", color: "#1565c0", bg: "rgba(21,101,192,0.08)" },
  DAILY_RECAP: { icon: "bar_chart", color: "#2e7d32", bg: "rgba(46,125,50,0.08)" },
  ADMIN_BROADCAST: { icon: "campaign", color: "#6a1b9a", bg: "rgba(106,27,154,0.08)" },
  SYSTEM: { icon: "notifications", color: "#546e7a", bg: "rgba(84,110,122,0.08)" },
};

function timeAgo(dateStr: string, t: (key: string) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t("notif.just_now");
  if (minutes < 60) return `${minutes} ${t("notif.minutes_ago")}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${t("notif.hours_ago")}`;
  const days = Math.floor(hours / 24);
  return `${days} ${t("notif.days_ago")}`;
}

export default function NotificationsPage() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const fetchNotifications = useCallback(async (p: number) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/notifications?page=${p}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("[Notifications] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, API]);

  useEffect(() => {
    fetchNotifications(page);
  }, [page, fetchNotifications]);

  const markAsRead = async (id: string, clickAction?: string | null) => {
    if (!token) return;
    try {
      await fetch(`${API}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      if (clickAction && clickAction !== "/dashboard") {
        router.push(clickAction);
      }
    } catch (err) {
      console.error("[Notifications] Mark read error:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await fetch(`${API}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("[Notifications] Mark all read error:", err);
    }
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--surface)",
        paddingBottom: 100,
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(203, 196, 210, 0.3)",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="btn-icon"
            onClick={() => router.back()}
            aria-label="Back"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1
            className="text-title-lg"
            style={{ margin: 0, color: "var(--on-surface)" }}
          >
            {t("notif.title")}
          </h1>
        </div>

        {hasUnread && (
          <button
            onClick={markAllAsRead}
            style={{
              background: "rgba(103, 80, 164, 0.08)",
              border: "none",
              borderRadius: 12,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--primary)",
              cursor: "pointer",
            }}
          >
            {t("notif.mark_all_read")}
          </button>
        )}
      </header>

      {/* Content */}
      <div style={{ padding: "8px 0" }}>
        {loading && notifications.length === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: 60,
            }}
          >
            <div className="loading-spinner" />
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 32px",
              gap: 16,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(103,80,164,0.08), rgba(103,80,164,0.16))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 36, color: "var(--primary)" }}
              >
                notifications_off
              </span>
            </div>
            <p
              className="text-title-md"
              style={{ color: "var(--on-surface)", margin: 0 }}
            >
              {t("notif.empty")}
            </p>
            <p
              className="text-body-md"
              style={{
                color: "var(--on-surface-variant)",
                margin: 0,
                maxWidth: 280,
              }}
            >
              {t("notif.empty_sub")}
            </p>
          </div>
        ) : (
          /* Notification List */
          <>
            {notifications.map((notif) => {
              const meta = TYPE_ICONS[notif.type] || TYPE_ICONS.SYSTEM;
              return (
                <button
                  key={notif.id}
                  onClick={() => markAsRead(notif.id, notif.clickAction)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    width: "100%",
                    padding: "16px 20px",
                    border: "none",
                    borderBottom: "1px solid rgba(203, 196, 210, 0.15)",
                    background: notif.isRead
                      ? "transparent"
                      : "rgba(103, 80, 164, 0.04)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.2s",
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: meta.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 22, color: meta.color }}
                    >
                      {meta.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <p
                        className="text-body-md"
                        style={{
                          fontWeight: notif.isRead ? 500 : 700,
                          color: "var(--on-surface)",
                          margin: 0,
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "var(--primary)",
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                    <p
                      className="text-body-sm"
                      style={{
                        color: "var(--on-surface-variant)",
                        margin: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: "1.5",
                      }}
                    >
                      {notif.body}
                    </p>
                    <p
                      className="text-label-sm"
                      style={{
                        color: "var(--outline)",
                        margin: "6px 0 0",
                      }}
                    >
                      {timeAgo(notif.createdAt, t)}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 12,
                  padding: "20px 0",
                }}
              >
                <button
                  className="btn-icon"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                </button>
                <span
                  className="text-body-md"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "var(--on-surface-variant)",
                  }}
                >
                  {page} / {totalPages}
                </span>
                <button
                  className="btn-icon"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
