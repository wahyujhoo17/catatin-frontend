"use client";

import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/layout/BottomNav";

export default function AboutAppPage() {
  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(207, 188, 255, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(231, 195, 101, 0.1) 0px, transparent 50%)
        `,
        minHeight: "100dvh",
        paddingBottom: 128,
      }}
    >
      {/* Header */}
      <header className="top-app-bar" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/settings" style={{ display: "flex", alignItems: "center", color: "var(--primary)", textDecoration: "none" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>arrow_back</span>
        </Link>
        <h2 className="text-headline-md" style={{ color: "var(--on-surface)", margin: 0, fontSize: 18, fontWeight: 700 }}>Tentang Aplikasi</h2>
      </header>

      <main style={{ marginTop: 72, padding: "20px var(--container-margin)", maxWidth: 672, margin: "72px auto 0" }}>
        <div className="glass-card animate-fade-slide-up" style={{ padding: "var(--card-padding)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, color: "var(--on-surface)" }}>
            
            {/* Branding Logo Block */}
            <div style={{ textAlign: "center", padding: "24px 0", borderBottom: "1px dashed rgba(203, 196, 210, 0.3)" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <Image
                  src="/logo/logo.png"
                  alt="Catetin Logo"
                  width={160}
                  height={50}
                  style={{ height: "50px", width: "auto", objectFit: "contain" }}
                  priority
                />
              </div>
              <p style={{ fontSize: 12, color: "var(--outline)", margin: "4px 0 0 0", fontWeight: 500 }}>
                Versi 0.1.0 (Beta Build 2026.06)
              </p>
            </div>

            {/* Description */}
            <p className="text-body-md" style={{ lineHeight: "24px", textAlign: "justify", margin: 0 }}>
              **Catetin** adalah asisten pencatatan keuangan pintar bertenaga AI yang dirancang untuk membantu Anda memantau pengeluaran pribadi serta mengelola penjualan kasir (POS) bisnis secara simultan dengan bahasa sehari-hari.
            </p>

            {/* PWA Status Badge Container */}
            <div style={{ background: "rgba(79, 55, 138, 0.04)", padding: 16, borderRadius: 16, border: "1px solid rgba(79, 55, 138, 0.08)" }}>
              <p className="text-label-md" style={{ margin: 0, fontWeight: 700, color: "var(--primary)" }}>Status Progressive Web App (PWA):</p>
              <ul style={{ margin: "10px 0 0 16px", padding: 0, display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--on-surface-variant)" }}>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--primary)" }}>check_circle</span>
                  Penyimpanan Cache Offline Aktif
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--primary)" }}>check_circle</span>
                  Kompatibel dengan Pintasan Home Screen
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--primary)" }}>check_circle</span>
                  Push Notification Siap Digunakan
                </li>
              </ul>
            </div>

            {/* Back CTA Button */}
            <Link
              href="/settings"
              className="btn-primary"
              style={{ padding: 14, fontSize: 16, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "none", marginTop: 12 }}
            >
              Kembali Ke Pengaturan
            </Link>

          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
