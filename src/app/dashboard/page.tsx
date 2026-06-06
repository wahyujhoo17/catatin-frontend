"use client";

import TopAppBar from "@/components/layout/TopAppBar";
import BottomNav from "@/components/layout/BottomNav";
import Link from "next/link";

const transactions = [
  { icon: "shopping_bag", name: "Toko Elektronik", category: "Belanja", time: "Hari ini", amount: "-Rp 129.000", color: "var(--secondary)", bgColor: "var(--secondary-container)", isExpense: true },
  { icon: "restaurant", name: "Warung Sushi", category: "Makanan", time: "Kemarin", amount: "-Rp 84.500", color: "var(--tertiary)", bgColor: "var(--tertiary-container)", isExpense: true },
  { icon: "payments", name: "Gaji Bulan Ini", category: "Pemasukan", time: "2 hari lalu", amount: "+Rp 5.000.000", color: "var(--on-primary)", bgColor: "var(--primary-container)", isExpense: false },
];

const categories = [
  { name: "Kebutuhan Hidup", color: "var(--primary)", pct: 45 },
  { name: "Makan & Hiburan", color: "var(--tertiary)", pct: 30 },
  { name: "Langganan", color: "var(--secondary-fixed-dim)", pct: 25 },
];

export default function DashboardPersonalPage() {
  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        minHeight: "100dvh",
        paddingBottom: 128,
      }}
    >
      <TopAppBar />

      <main style={{ marginTop: 72, padding: "0 var(--container-margin)", maxWidth: 896, margin: "72px auto 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-gap-lg)" }}>
          {/* Welcome */}
          <header className="animate-fade-slide-up" style={{ paddingTop: 16 }}>
            <h1 className="text-headline-lg" style={{ color: "var(--on-surface)" }}>Halo, Budi 👋</h1>
            <p className="text-body-md" style={{ color: "var(--on-surface-variant)", marginTop: 4 }}>
              Ini status keuanganmu bulan Juni.
            </p>
          </header>

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
              <h3 className="text-headline-sm" style={{ alignSelf: "flex-start" }}>Kesehatan Budget</h3>

              {/* Gauge */}
              <div style={{ position: "relative", padding: "16px 0" }}>
                <div style={{ position: "relative", width: 200, height: 100, overflow: "hidden" }}>
                  {/* Background arc */}
                  <div
                    style={{
                      width: 200,
                      height: 200,
                      border: "18px solid var(--secondary-container)",
                      borderRadius: "50%",
                      borderBottomColor: "transparent",
                      borderLeftColor: "transparent",
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
                      border: "18px solid var(--primary)",
                      borderRadius: "50%",
                      borderBottomColor: "transparent",
                      borderLeftColor: "transparent",
                      transform: "rotate(85deg)",
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
                  <span className="text-headline-md">72%</span>
                  <span className="text-label-md" style={{ color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Sangat Baik
                  </span>
                </div>
              </div>

              <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ padding: 12, borderRadius: 12, background: "rgba(79, 55, 138, 0.06)", border: "1px solid rgba(79, 55, 138, 0.12)" }}>
                  <p className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>Budget Bulanan</p>
                  <p className="text-headline-sm" style={{ color: "var(--primary)" }}>Rp 4.500.000</p>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: "rgba(118, 91, 0, 0.06)", border: "1px solid rgba(118, 91, 0, 0.12)" }}>
                  <p className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>Tersisa</p>
                  <p className="text-headline-sm" style={{ color: "var(--tertiary)" }}>Rp 1.260.000</p>
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
              <h3 className="text-headline-sm" style={{ marginBottom: 24 }}>Kategori Teratas</h3>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                {/* Pie chart representation */}
                <div
                  style={{
                    position: "relative",
                    width: 128,
                    height: 128,
                    borderRadius: "50%",
                    border: "14px solid var(--primary)",
                    borderRightColor: "var(--tertiary)",
                    borderBottomColor: "var(--secondary-fixed-dim)",
                  }}
                >
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="text-headline-sm">3</span>
                  </div>
                </div>

                <ul style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                  {categories.map((cat) => (
                    <li key={cat.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color }} />
                        <span className="text-body-sm">{cat.name}</span>
                      </div>
                      <span className="text-label-md" style={{ fontWeight: 700 }}>{cat.pct}%</span>
                    </li>
                  ))}
                </ul>
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
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div className="insight-icon-container" style={{ background: "rgba(79, 55, 138, 0.1)", padding: 16, borderRadius: 16 }}>
                  <span className="material-symbols-outlined filled auto-awesome-icon" style={{ color: "var(--primary)", fontSize: 32 }}>
                    auto_awesome
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h4 className="text-headline-sm" style={{ color: "var(--primary)" }}>Insight AI Pintar</h4>
                  <p className="text-body-md" style={{ color: "var(--on-surface-variant)", marginTop: 8 }}>
                    Pengeluaran hiburanmu 12% lebih rendah dari bulan lalu. Kamu on track untuk menabung Rp 400.000 ekstra untuk dana liburanmu!
                  </p>
                </div>
              </div>
              <Link
                href="/chat"
                style={{
                  background: "var(--primary)",
                  color: "var(--on-primary)",
                  padding: "12px 24px",
                  borderRadius: 9999,
                  fontSize: 16,
                  fontWeight: 600,
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "opacity 0.2s",
                  alignSelf: "flex-start",
                }}
              >
                Lihat Detail
              </Link>
            </div>

            {/* Recent Transactions */}
            <div
              className="glass-card"
              style={{
                gridColumn: "span 12",
                padding: "var(--card-padding)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 className="text-headline-sm">Transaksi Terbaru</h3>
                <Link href="/chat" className="text-label-md" style={{ color: "var(--primary)" }}>Lihat Semua</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {transactions.map((tx) => (
                  <div
                    key={tx.name}
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
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                      <div
                        className="dashboard-tx-avatar"
                        style={{
                          width: 48,
                          height: 48,
                          background: tx.bgColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 12,
                          flexShrink: 0,
                        }}
                      >
                        <span className="material-symbols-outlined dashboard-tx-icon" style={{ color: tx.color }}>{tx.icon}</span>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p className="text-body-md" style={{ fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.name}</p>
                        <p className="text-body-sm" style={{ color: "var(--on-surface-variant)", margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {tx.category} • {tx.time}
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        color: tx.isExpense ? "var(--error)" : "var(--primary)",
                        fontWeight: 600,
                        fontSize: "15px",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />

      {/* Background Atmospheric Elements */}
      <div style={{ position: "fixed", top: "10%", right: "15%", width: 256, height: 256, background: "rgba(103, 80, 164, 0.12)", filter: "blur(100px)", borderRadius: "50%", zIndex: -1, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "20%", left: "10%", width: 320, height: 320, background: "rgba(201, 167, 77, 0.08)", filter: "blur(120px)", borderRadius: "50%", zIndex: -1, pointerEvents: "none" }} />
    </div>
  );
}
