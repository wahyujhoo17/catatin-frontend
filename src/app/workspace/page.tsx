"use client";

import { useRouter } from "next/navigation";
import TopAppBar from "@/components/layout/TopAppBar";
import BottomNav from "@/components/layout/BottomNav";

const workspaces = [
  {
    id: "pos",
    title: "POS Operations",
    subtitle: "Kelola penjualan, inventaris, dan transaksi bisnis dengan tools profesional bertenaga AI.",
    badge: "Business Mode",
    icon: "point_of_sale",
    color: "#2196F3",
    bgLight: "rgba(33, 150, 243, 0.05)",
    chips: [
      { icon: "inventory_2", label: "Inventory" },
      { icon: "receipt_long", label: "Invoices" },
      { icon: "analytics", label: "Reports" },
    ],
    cta: "Buka Workspace Bisnis",
    href: "/dashboard/pos",
  },
  {
    id: "personal",
    title: "Personal Management",
    subtitle: "Catat pengeluaran, target tabungan, dan budgeting keluarga di lingkungan yang nyaman.",
    badge: "Financial Mode",
    icon: "account_balance_wallet",
    color: "var(--primary)",
    bgLight: "rgba(79, 55, 138, 0.05)",
    chips: [
      { icon: "savings", label: "Savings" },
      { icon: "payments", label: "Budgeting" },
      { icon: "family_restroom", label: "Family" },
    ],
    cta: "Buka Workspace Pribadi",
    href: "/dashboard",
  },
];

export default function WorkspacePage() {
  const router = useRouter();

  return (
    <div style={{ background: "var(--surface)", minHeight: "100dvh", position: "relative", overflow: "hidden" }}>
      {/* Atmospheric Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "50%", height: "50%", borderRadius: "50%", background: "rgba(224, 210, 255, 0.3)", filter: "blur(120px)" }} />
        <div style={{ position: "absolute", top: "40%", right: "-5%", width: "40%", height: "40%", borderRadius: "50%", background: "rgba(178, 235, 242, 0.2)", filter: "blur(100px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "20%", width: "60%", height: "40%", borderRadius: "50%", background: "rgba(255, 249, 196, 0.2)", filter: "blur(120px)" }} />
      </div>

      <TopAppBar />

      {/* Main Content */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          paddingTop: 96,
          paddingBottom: 128,
          paddingLeft: "var(--container-margin)",
          paddingRight: "var(--container-margin)",
          maxWidth: 1120,
          margin: "0 auto",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Welcome Header */}
        <div className="animate-fade-slide-up" style={{ textAlign: "center", marginBottom: "var(--stack-gap-lg)", maxWidth: 640 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 9999,
              background: "rgba(79, 55, 138, 0.05)",
              border: "1px solid rgba(79, 55, 138, 0.1)",
              color: "var(--primary)",
              marginBottom: 16,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>waving_hand</span>
            <span className="text-label-md">Selamat datang, Budi</span>
          </div>
          <h1 className="text-display-lg" style={{ color: "var(--on-surface)", marginBottom: 8 }}>
            Pilih Workspace
          </h1>
          <p className="text-body-lg" style={{ color: "var(--on-surface-variant)" }}>
            Pilih konteks workspace untuk personalisasi pengalamanmu dan optimalkan alur kerja hari ini.
          </p>
        </div>

        {/* Workspace Cards Grid */}
        <div
          className="animate-fade-slide-up"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
            gap: "var(--stack-gap-md)",
            width: "100%",
            maxWidth: 960,
            animationDelay: "0.1s",
          }}
        >
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => router.push(ws.href)}
              className="glass-card"
              style={{
                padding: "var(--card-padding)",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.5s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-8px)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 40px rgba(0,0,0,0.08), 0 0 20px ${ws.id === "pos" ? "rgba(33,150,243,0.15)" : "rgba(79,55,138,0.15)"}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 30px rgba(0,0,0,0.04)";
              }}
              id={`workspace-${ws.id}`}
            >
              {/* Left accent bar on hover - CSS handled */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 8,
                  height: "100%",
                  background: ws.color,
                  borderRadius: "24px 0 0 24px",
                  opacity: 0,
                  transition: "opacity 0.3s",
                }}
                className="accent-bar"
              />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: ws.bgLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: ws.color,
                    transition: "all 0.3s",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 32 }}>{ws.icon}</span>
                </div>
                <span
                  className="text-label-md"
                  style={{
                    padding: "4px 12px",
                    borderRadius: 9999,
                    background: ws.bgLight,
                    color: ws.color,
                  }}
                >
                  {ws.badge}
                </span>
              </div>

              <div style={{ marginTop: "auto" }}>
                <h3 className="text-headline-md" style={{ color: "var(--on-surface)", marginBottom: 8 }}>
                  {ws.title}
                </h3>
                <p className="text-body-md" style={{ color: "var(--on-surface-variant)", marginBottom: 24 }}>
                  {ws.subtitle}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
                  {ws.chips.map((chip) => (
                    <span
                      key={chip.label}
                      className="text-label-md"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 12px",
                        borderRadius: 8,
                        background: "var(--surface-container)",
                        color: "var(--on-surface-variant)",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{chip.icon}</span>
                      {chip.label}
                    </span>
                  ))}
                </div>
                <div
                  className="text-label-md"
                  style={{ display: "flex", alignItems: "center", color: ws.color, gap: 4 }}
                >
                  {ws.cta}
                  <span className="material-symbols-outlined" style={{ marginLeft: 4 }}>arrow_forward</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Secondary Actions */}
        <div
          className="animate-fade-slide-up"
          style={{ marginTop: "var(--stack-gap-lg)", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, animationDelay: "0.2s" }}
        >
          <button className="btn-secondary" style={{ borderRadius: 9999, padding: "12px 24px" }}>
            <span className="material-symbols-outlined">add_circle</span>
            Buat Workspace Baru
          </button>
          <p className="text-label-md" style={{ color: "var(--outline)" }}>
            Terakhir digunakan: Personal Workspace (2 jam lalu)
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
