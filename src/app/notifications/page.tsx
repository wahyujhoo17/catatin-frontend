"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

import TopAppBar from "@/components/layout/TopAppBar";

export default function NotificationsPage() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

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
        setNotifications((prev) => 
          p === 1 ? (data.notifications || []) : [...prev, ...(data.notifications || [])]
        );
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && page < totalPages) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, loading, page, totalPages]);

  const handleNotificationClick = async (notif: NotificationItem) => {
    setSelectedNotif(notif);
    if (!notif.isRead && token) {
      try {
        await fetch(`${API}/api/notifications/${notif.id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error("[Notifications] Mark read error:", err);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (
        urlParams.get("openLatest") === "1" &&
        notifications.length > 0 &&
        !loading &&
        !selectedNotif
      ) {
        handleNotificationClick(notifications[0]);
        // Hapus parameter query tanpa me-reload halaman agar tidak terbuka berulang kali
        const newUrl =
          window.location.protocol +
          "//" +
          window.location.host +
          window.location.pathname;
        window.history.replaceState({ path: newUrl }, "", newUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, loading, selectedNotif]);

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
      <TopAppBar showNotification={false} />

      <main
        style={{
          marginTop: 72,
          padding: "0 var(--container-margin)",
          maxWidth: 896,
          margin: "72px auto 0",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--stack-gap-lg)",
          }}
        >
          {/* Header */}
          <header
            className="animate-fade-slide-up"
            style={{
              paddingTop: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1
                className="text-headline-lg"
                style={{ color: "var(--on-surface)" }}
              >
                {t("notif.title")}
              </h1>
            </div>
            
            {hasUnread && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: "var(--primary-container)",
                  border: "none",
                  borderRadius: 20,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--on-primary-container)",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                {t("notif.mark_all_read")}
              </button>
            )}
          </header>

      {/* Content */}
      <div
        style={{
          padding: "8px 0",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 8,
            }}
          >
            {notifications.map((notif) => {
              const meta = TYPE_ICONS[notif.type] || TYPE_ICONS.SYSTEM;
              return (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className="animate-fade-slide-up"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    width: "100%",
                    padding: "16px",
                    border: "1px solid rgba(203, 196, 210, 0.2)",
                    borderRadius: 16,
                    background: notif.isRead
                      ? "var(--surface-container-low)"
                      : "var(--surface-container-high)",
                    boxShadow: notif.isRead
                      ? "none"
                      : "0 4px 12px rgba(0,0,0,0.03)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s cubic-bezier(0.2, 0, 0, 1)",
                    transform: "scale(1)",
                  }}
                  onMouseDown={(e) =>
                    (e.currentTarget.style.transform = "scale(0.98)")
                  }
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
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
                      style={{ fontSize: 24, color: meta.color }}
                    >
                      {meta.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <p
                        className="text-body-lg"
                        style={{
                          fontWeight: notif.isRead ? 600 : 700,
                          color: notif.isRead
                            ? "var(--on-surface-variant)"
                            : "var(--on-surface)",
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
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: "var(--primary)",
                            flexShrink: 0,
                            boxShadow: "0 0 0 4px rgba(103, 80, 164, 0.1)",
                          }}
                        />
                      )}
                    </div>
                    <p
                      className="text-body-md"
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
                        margin: "8px 0 0",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 14 }}
                      >
                        schedule
                      </span>
                      {timeAgo(notif.createdAt, t)}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Infinite Scroll Observer Target */}
            <div ref={observerTarget} style={{ height: 20, width: "100%" }} />

            {/* Loading Indicator at Bottom */}
            {loading && page > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "24px 0",
                }}
              >
                <div className="loading-spinner" />
              </div>
            )}
          </div>
        )}
        </div>
        </div>

        {/* Custom Styles for Modal */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes modalSlideUp {
            0% {
              transform: translateY(100%);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .modal-slide-up-enhanced {
            animation: modalSlideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
        `}} />

        {/* Notification Detail Modal (Bottom Sheet style) */}
        {selectedNotif && (
          <div
            className="animate-fade-in"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 9999,
              display: "flex",
              alignItems: "flex-end", // Bottom sheet style
              justifyContent: "center",
            }}
            onClick={() => setSelectedNotif(null)}
          >
            <div
              className="modal-slide-up-enhanced"
              style={{
                background: "var(--surface)",
                width: "100%",
                maxWidth: 600,
                minHeight: "55vh",
                maxHeight: "90vh",
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                padding: "12px 24px 32px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                overflowY: "auto",
                boxShadow: "0 -8px 30px rgba(0,0,0,0.15)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle Indicator */}
              <div style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: 4 }}>
                <div style={{ width: 40, height: 5, borderRadius: 3, background: "var(--outline-variant)", opacity: 0.8 }} />
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: (TYPE_ICONS[selectedNotif.type] || TYPE_ICONS.SYSTEM).bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: (TYPE_ICONS[selectedNotif.type] || TYPE_ICONS.SYSTEM).color, fontSize: 22 }}>
                    {(TYPE_ICONS[selectedNotif.type] || TYPE_ICONS.SYSTEM).icon}
                  </span>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.4, color: "var(--on-surface)", margin: 0 }}>
                    {selectedNotif.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedNotif(null)}
                  style={{
                    background: "var(--surface-container-high)",
                    border: "none",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--on-surface-variant)",
                    flexShrink: 0,
                    marginTop: -4,
                    marginRight: -4,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                </button>
              </div>
              
              <p className="text-body-lg" style={{ color: "var(--on-surface-variant)", whiteSpace: "pre-wrap", lineHeight: 1.6, margin: 0 }}>
                {selectedNotif.body}
              </p>
              
              <p className="text-label-sm" style={{ color: "var(--outline)", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                {timeAgo(selectedNotif.createdAt, t)}
              </p>

              {selectedNotif.clickAction && selectedNotif.clickAction !== "/dashboard" && (
                <button
                  onClick={() => router.push(selectedNotif.clickAction!)}
                  style={{
                    marginTop: 8,
                    background: "var(--primary)",
                    color: "var(--on-primary)",
                    border: "none",
                    borderRadius: 24,
                    padding: "14px 24px",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Lihat Detail Terkait
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
