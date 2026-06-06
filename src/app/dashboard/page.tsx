"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import TopAppBar from "@/components/layout/TopAppBar";
import BottomNav from "@/components/layout/BottomNav";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

// ─── Config ──────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface DashboardData {
  aiInsight: string;
  balance: number;
  incomeThisMonth: number;
  expenseThisMonth: number;
  budgetHealth: number;
  healthLabel: string;
  recentTransactions: {
    id: string;
    type: string;
    amount: number;
    description: string;
    category: string;
    categoryIcon: string;
    categoryColor: string;
    date: string;
    isExpense: boolean;
  }[];
  topCategories: {
    name: string;
    icon: string;
    color: string;
    amount: number;
    percentage: number;
  }[];
}

// ─── Helpers ──────────────────────────────────────────────────
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function formatRupiah(n: number): string {
  if (n >= 1_000_000) {
    return `Rp ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}jt`;
  }
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function formatRupiahFull(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 60) return diffMin <= 1 ? "Baru saja" : `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay === 1) return "Kemarin";
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

const CATEGORY_COLORS: Record<string, string> = {
  primary: "var(--primary)",
  secondary: "var(--secondary)",
  tertiary: "var(--tertiary)",
};

const CATEGORY_BG: Record<string, string> = {
  primary: "var(--primary-container)",
  secondary: "var(--secondary-container)",
  tertiary: "var(--tertiary-container)",
};

// ─── Page ─────────────────────────────────────────────────────
export default function DashboardPersonalPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [fetchError, setFetchError] = useState("");
  const displayName = user?.name?.split(" ")[0] || "";

  // Redirect to workspace if mode not set or to POS dashboard if POS mode
  useEffect(() => {
    if (isLoading) return;
    if (!user?.mode) router.replace("/workspace");
    else if (user.mode === "POS") router.replace("/dashboard/pos");
  }, [user?.mode, isLoading, router]);

  // ─── Fetch dashboard data ──────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal memuat data");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setFetchError(err.message);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && user) fetchDashboard();

    const handleTransactionSaved = () => {
      fetchDashboard();
    };

    window.addEventListener("transactionSaved", handleTransactionSaved);
    return () => {
      window.removeEventListener("transactionSaved", handleTransactionSaved);
    };
  }, [isLoading, user, fetchDashboard]);

  const currentMonth = new Date().toLocaleDateString("id-ID", {
    month: "long",
  });

  // ─── Gauge rotation based on health percentage ─────────────
  // 0% = -45deg (left), 100% = 135deg (right)
  const gaugeRotation = data ? -45 + (data.budgetHealth / 100) * 180 : -45;

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        minHeight: "100dvh",
        paddingBottom: 128,
      }}
    >
      <TopAppBar />

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
          {/* Welcome */}
          <header className="animate-fade-slide-up" style={{ paddingTop: 16 }}>
            <h1
              className="text-headline-lg"
              style={{ color: "var(--on-surface)" }}
            >
              Halo, {displayName} 👋
            </h1>
            <p
              className="text-body-md"
              style={{ color: "var(--on-surface-variant)", marginTop: 4 }}
            >
              Ini status keuanganmu bulan {currentMonth}.
            </p>
          </header>

          {fetchError && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: "var(--error-container)",
                color: "var(--on-error-container)",
                fontSize: 14,
              }}
            >
              {fetchError}
            </div>
          )}

          {/* Bento Grid */}
          <div
            className="animate-fade-slide-up"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              gap: "var(--stack-gap-md)",
              animationDelay: "0.1s",
            }}
          >
            {/* Budget Health Gauge */}
            <div
              className="glass-card col-span-8-desktop"
              style={{
                padding: "var(--card-padding)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <h3
                className="text-headline-sm"
                style={{ alignSelf: "flex-start" }}
              >
                Kesehatan Budget
              </h3>

              {/* Gauge */}
              <div style={{ position: "relative", padding: "16px 0" }}>
                <div
                  style={{
                    position: "relative",
                    width: 200,
                    height: 100,
                    overflow: "hidden",
                  }}
                >
                  {/* Background arc */}
                  <div
                    style={{
                      width: 200,
                      height: 200,
                      borderWidth: "18px",
                      borderStyle: "solid",
                      borderTopColor: "var(--secondary-container)",
                      borderRightColor: "var(--secondary-container)",
                      borderBottomColor: "transparent",
                      borderLeftColor: "transparent",
                      borderRadius: "50%",
                      transform: "rotate(-45deg)",
                    }}
                  />
                  {/* Fill arc */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: 200,
                      height: 200,
                      borderWidth: "18px",
                      borderStyle: "solid",
                      borderTopColor: "var(--primary)",
                      borderRightColor: "var(--primary)",
                      borderBottomColor: "transparent",
                      borderLeftColor: "transparent",
                      borderRadius: "50%",
                      transform: `rotate(${gaugeRotation}deg)`,
                      transition: "transform 1s ease-out",
                    }}
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingBottom: 8,
                  }}
                >
                  <span className="text-headline-md">
                    {data ? `${data.budgetHealth}%` : "—"}
                  </span>
                  <span
                    className="text-label-md"
                    style={{
                      color: "var(--on-surface-variant)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {data?.healthLabel || "Memuat…"}
                  </span>
                </div>
              </div>

              <div
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: "rgba(79, 55, 138, 0.06)",
                    border: "1px solid rgba(79, 55, 138, 0.12)",
                  }}
                >
                  <p
                    className="text-label-md"
                    style={{ color: "var(--on-surface-variant)" }}
                  >
                    Pemasukan
                  </p>
                  <p
                    className="text-headline-sm"
                    style={{ color: "var(--primary)" }}
                  >
                    {data ? formatRupiah(data.incomeThisMonth) : "—"}
                  </p>
                </div>
                <div
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: "rgba(186, 26, 26, 0.06)",
                    border: "1px solid rgba(186, 26, 26, 0.12)",
                  }}
                >
                  <p
                    className="text-label-md"
                    style={{ color: "var(--on-surface-variant)" }}
                  >
                    Pengeluaran
                  </p>
                  <p
                    className="text-headline-sm"
                    style={{ color: "var(--error)" }}
                  >
                    {data ? formatRupiah(data.expenseThisMonth) : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Categories */}
            <div
              className="glass-card col-span-4-desktop"
              style={{
                padding: "var(--card-padding)",
              }}
            >
              <h3 className="text-headline-sm" style={{ marginBottom: 24 }}>
                Kategori Teratas
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 24,
                }}
              >
                {/* Pie chart representation */}
                <div
                  style={{
                    position: "relative",
                    width: 128,
                    height: 128,
                    borderRadius: "50%",
                    borderWidth: "14px",
                    borderStyle: "solid",
                    borderTopColor: data?.topCategories.length
                      ? "var(--primary)"
                      : "var(--secondary-container)",
                    borderRightColor:
                      data?.topCategories.length &&
                      data.topCategories.length > 1
                        ? "var(--tertiary)"
                        : "transparent",
                    borderBottomColor:
                      data?.topCategories.length &&
                      data.topCategories.length > 2
                        ? "var(--secondary-fixed-dim)"
                        : "transparent",
                    borderLeftColor: data?.topCategories.length
                      ? "var(--primary)"
                      : "var(--secondary-container)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span className="text-headline-sm">
                      {data ? data.topCategories.length : 0}
                    </span>
                  </div>
                </div>

                {data && data.topCategories.length > 0 ? (
                  <ul
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {data.topCategories.map((cat, i) => (
                      <li
                        key={cat.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background:
                                CATEGORY_COLORS[
                                  i === 0
                                    ? "primary"
                                    : i === 1
                                      ? "tertiary"
                                      : "secondary"
                                ] || "var(--secondary)",
                            }}
                          />
                          <span className="text-body-sm">{cat.name}</span>
                        </div>
                        <span
                          className="text-label-md"
                          style={{ fontWeight: 700 }}
                        >
                          {cat.percentage}%
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p
                    className="text-body-sm"
                    style={{ color: "var(--on-surface-variant)" }}
                  >
                    Belum ada pengeluaran bulan ini
                  </p>
                )}
              </div>
            </div>

            {/* Smart AI Insight */}
            <div
              className="mesh-gradient-insight glass-card"
              style={{
                gridColumn: "span 12",
                padding: "var(--card-padding)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div
                  className="insight-icon-container"
                  style={{
                    background: "rgba(79, 55, 138, 0.1)",
                    padding: 16,
                    borderRadius: 16,
                  }}
                >
                  <span
                    className="material-symbols-outlined filled auto-awesome-icon"
                    style={{ color: "var(--primary)", fontSize: 32 }}
                  >
                    auto_awesome
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h4
                    className="text-headline-sm"
                    style={{ color: "var(--primary)" }}
                  >
                    Insight AI Pintar
                  </h4>
                  {data ? (
                    <p
                      className="text-body-md"
                      style={{
                        color: "var(--on-surface-variant)",
                        marginTop: 8,
                      }}
                    >
                      {data.aiInsight}
                    </p>
                  ) : (
                    <p
                      className="text-body-md"
                      style={{
                        color: "var(--on-surface-variant)",
                        marginTop: 8,
                      }}
                    >
                      Memuat insight…
                    </p>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Link
                  href="/chat"
                  style={{
                    background: "var(--primary)",
                    color: "var(--on-primary)",
                    padding: "8px 16px",
                    borderRadius: 9999,
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: "center",
                    textDecoration: "none",
                    transition: "opacity 0.2s",
                  }}
                >
                  Tanya AI Catatin
                </Link>
              </div>
            </div>

            {/* Recent Transactions */}
            <div
              className="glass-card"
              style={{
                gridColumn: "span 12",
                padding: "var(--card-padding)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <h3 className="text-headline-sm">Transaksi Terbaru</h3>
                <Link
                  href="/transactions"
                  className="text-label-md"
                  style={{ color: "var(--primary)" }}
                >
                  Lihat Semua
                </Link>
              </div>

              {data && data.recentTransactions.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  {data.recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="dashboard-tx-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 16,
                        background: "rgba(255, 255, 255, 0.4)",
                        borderRadius: 16,
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          className="dashboard-tx-avatar"
                          style={{
                            width: 48,
                            height: 48,
                            background: tx.isExpense
                              ? "rgba(244, 67, 54, 0.1)" // Lighter Red for expense
                              : "rgba(76, 175, 80, 0.1)", // Lighter Green for income
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 12,
                            flexShrink: 0,
                          }}
                        >
                          <span
                            className="material-symbols-outlined dashboard-tx-icon"
                            style={{
                              color: tx.isExpense
                                ? "rgba(229, 57, 53, 1)" // Red for expense
                                : "rgba(67, 160, 71, 1)", // Green for income
                            }}
                          >
                            {(() => {
                              if (tx.categoryIcon && tx.categoryIcon !== "receipt_long" && tx.categoryIcon !== "category") return tx.categoryIcon;
                              const desc = (tx.description || "").toLowerCase();
                              const cat = (tx.category || "").toLowerCase();
                              if (desc.includes("makan") || desc.includes("minum") || cat.includes("makanan")) return "restaurant";
                              if (desc.includes("gaji") || cat.includes("gaji")) return "payments";
                              if (desc.includes("belanja") || desc.includes("beli") || desc.includes("casing") || cat.includes("belanja")) return "shopping_bag";
                              if (desc.includes("pulsa") || desc.includes("listrik") || desc.includes("token")) return "bolt";
                              if (desc.includes("transport") || desc.includes("gojek") || desc.includes("grab") || desc.includes("bensin")) return "local_taxi";
                              if (desc.includes("kesehatan") || desc.includes("obat")) return "medical_services";
                              if (desc.includes("hutang") || desc.includes("bayar")) return "handshake";
                              return tx.isExpense ? "shopping_cart" : "account_balance_wallet";
                            })()}
                          </span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p
                            className="text-body-md"
                            style={{
                              fontWeight: 700,
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {tx.description}
                          </p>
                          <p
                            className="text-body-sm"
                            style={{
                              color: "var(--on-surface-variant)",
                              margin: "2px 0 0 0",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {new Date(tx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} • {tx.category} • {timeAgo(tx.date)}
                          </p>
                        </div>
                      </div>
                      <span
                        style={{
                          color: tx.isExpense
                            ? "var(--error)"
                            : "var(--primary)",
                          fontWeight: 600,
                          fontSize: "15px",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {tx.isExpense ? "-" : "+"}
                        {formatRupiahFull(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px 16px",
                    color: "var(--on-surface-variant)",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 48, marginBottom: 12 }}
                  >
                    receipt_long
                  </span>
                  <p className="text-body-md">
                    Belum ada transaksi. Mulai catat lewat chat AI!
                  </p>
                  <Link
                    href="/chat"
                    style={{
                      display: "inline-block",
                      marginTop: 12,
                      color: "var(--primary)",
                      fontWeight: 600,
                    }}
                  >
                    Mulai Catat →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />

      {/* Background Atmospheric Elements */}
      <div
        style={{
          position: "fixed",
          top: "10%",
          right: "15%",
          width: 256,
          height: 256,
          background: "rgba(103, 80, 164, 0.12)",
          filter: "blur(100px)",
          borderRadius: "50%",
          zIndex: -1,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "20%",
          left: "10%",
          width: 320,
          height: 320,
          background: "rgba(201, 167, 77, 0.08)",
          filter: "blur(120px)",
          borderRadius: "50%",
          zIndex: -1,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
