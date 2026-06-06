"use client";

import TopAppBar from "@/components/layout/TopAppBar";
import BottomNav from "@/components/layout/BottomNav";
import Link from "next/link";

const stats = [
  { icon: "payments", label: "Pendapatan", value: "Rp 8,4Jt", badge: "+12%", badgeBg: "rgba(201, 167, 77, 0.15)", badgeColor: "var(--on-tertiary-container)", iconColor: "var(--primary)" },
  { icon: "shopping_cart", label: "Pesanan", value: "156", badge: "48", badgeBg: "rgba(233, 221, 255, 0.3)", badgeColor: "var(--primary)", iconColor: "var(--secondary)" },
  { icon: "group", label: "Pelanggan Baru", value: "24", badge: null, badgeBg: null, badgeColor: null, iconColor: "var(--tertiary)" },
  { icon: "inventory_2", label: "Stok", value: "1,2Rb", badge: null, badgeBg: null, badgeColor: null, iconColor: "var(--error)" },
];

const barData = [
  { day: "Sen", height: 40 },
  { day: "Sel", height: 60 },
  { day: "Rab", height: 45 },
  { day: "Kam", height: 90, isPeak: true },
  { day: "Jum", height: 75 },
  { day: "Sab", height: 50 },
  { day: "Min", height: 65 },
];

const alerts = [
  {
    name: "Indomie Goreng",
    detail: "Tersisa 3 pcs",
    bg: "rgba(255, 218, 214, 0.2)",
    border: "rgba(186, 26, 26, 0.1)",
    textColor: "var(--on-error-container)",
    action: "Restock",
    actionBg: "var(--error)",
    actionColor: "var(--on-error)",
    icon: "🍜",
  },
  {
    name: "Rokok Surya",
    detail: "8 bungkus tersisa (Restock disarankan)",
    bg: "rgba(201, 167, 77, 0.08)",
    border: "rgba(118, 91, 0, 0.1)",
    textColor: "var(--on-tertiary-container)",
    action: "Cek Riwayat",
    actionBg: "transparent",
    actionColor: "var(--tertiary)",
    actionBorder: "var(--tertiary)",
    icon: "🚬",
  },
];

export default function DashboardPOSPage() {
  return (
    <div
      className="mesh-bg"
      style={{ minHeight: "100dvh", paddingBottom: 128 }}
    >
      <TopAppBar />

      <main style={{ paddingTop: 88, padding: "88px var(--container-margin) 0", maxWidth: 896, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-gap-lg)" }}>
          {/* Welcome */}
          <section className="animate-fade-slide-up">
            <h1 className="text-headline-lg-mobile" style={{ color: "var(--on-surface)" }}>
              Selamat Pagi, Budi 👋
            </h1>
            <p className="text-body-md" style={{ color: "var(--on-surface-variant)", marginTop: 4 }}>
              Ini yang terjadi di tokomu hari ini.
            </p>
          </section>

          {/* 2x2 Stats Grid */}
          <section
            className="animate-fade-slide-up"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 16,
              animationDelay: "0.1s",
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass-card"
                style={{
                  padding: "var(--card-padding)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: 144,
                  transition: "all 0.3s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span className="material-symbols-outlined" style={{ color: stat.iconColor }}>{stat.icon}</span>
                  {stat.badge && (
                    <span
                      className="text-label-md"
                      style={{
                        padding: "2px 8px",
                        borderRadius: 9999,
                        background: stat.badgeBg!,
                        color: stat.badgeColor!,
                      }}
                    >
                      {stat.badge}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-label-md" style={{ color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {stat.label}
                  </p>
                  <p className="text-headline-sm" style={{ color: "var(--on-surface)" }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </section>

          {/* Sales Trends */}
          <section
            className="glass-card animate-fade-slide-up"
            style={{
              padding: "var(--card-padding)",
              position: "relative",
              overflow: "hidden",
              animationDelay: "0.15s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 className="text-headline-sm">Tren Penjualan</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{
                    background: "var(--primary)",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Mingguan
                </button>
                <button
                  style={{
                    padding: "4px 12px",
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--on-surface-variant)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Bulanan
                </button>
              </div>
            </div>

            {/* Bar Chart */}
            <div
              style={{
                height: 192,
                width: "100%",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                padding: "0 8px",
                filter: "drop-shadow(0 4px 12px rgba(79, 55, 138, 0.15))",
              }}
            >
              {barData.map((bar) => (
                <div key={bar.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <div style={{ position: "relative", width: "100%", maxWidth: 32, display: "flex", justifyContent: "center" }}>
                    {bar.isPeak && (
                      <div
                        style={{
                          position: "absolute",
                          top: -40,
                          background: "var(--inverse-surface)",
                          color: "var(--inverse-on-surface)",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Tertinggi
                      </div>
                    )}
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 32,
                        height: `${(bar.height / 100) * 192}px`,
                        background: bar.isPeak ? "var(--primary)" : "rgba(79, 55, 138, 0.2)",
                        borderRadius: "8px 8px 0 0",
                        transition: "all 0.3s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        if (!bar.isPeak) (e.currentTarget as HTMLElement).style.background = "rgba(79, 55, 138, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        if (!bar.isPeak) (e.currentTarget as HTMLElement).style.background = "rgba(79, 55, 138, 0.2)";
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, padding: "0 8px" }}>
              {barData.map((bar) => (
                <span key={bar.day} className="text-label-md" style={{ color: "var(--outline)", flex: 1, textAlign: "center" }}>
                  {bar.day}
                </span>
              ))}
            </div>
          </section>

          {/* Inventory Alerts */}
          <section className="animate-fade-slide-up" style={{ display: "flex", flexDirection: "column", gap: 16, animationDelay: "0.2s" }}>
            <h2 className="text-headline-sm" style={{ paddingLeft: 4 }}>Peringatan Inventaris</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {alerts.map((alert) => (
                <div
                  key={alert.name}
                  style={{
                    background: alert.bg,
                    border: `1px solid ${alert.border}`,
                    borderRadius: 24,
                    padding: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backdropFilter: "blur(12px)",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: "rgba(255, 255, 255, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                    >
                      {alert.icon}
                    </div>
                    <div>
                      <p className="text-body-md" style={{ fontWeight: 600, color: alert.textColor }}>{alert.name}</p>
                      <p className="text-body-sm" style={{ color: "var(--on-surface-variant)" }}>{alert.detail}</p>
                    </div>
                  </div>
                  <button
                    style={{
                      background: alert.actionBg,
                      color: alert.actionColor,
                      padding: "8px 16px",
                      borderRadius: 9999,
                      fontSize: 12,
                      fontWeight: 600,
                      border: alert.actionBorder ? `1px solid ${alert.actionBorder}` : "none",
                      cursor: "pointer",
                      boxShadow: alert.actionBg !== "transparent" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                      transition: "transform 0.2s",
                    }}
                  >
                    {alert.action}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
