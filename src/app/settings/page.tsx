"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import TopAppBar from "@/components/layout/TopAppBar";
import BottomNav from "@/components/layout/BottomNav";

export default function SettingsPage() {
  // Toggle states
  const [notifTransaksi, setNotifTransaksi] = useState(true);
  const [notifBudget, setNotifBudget] = useState(false);
  const [biometricSec, setBiometricSec] = useState(true);
  
  // Custom Dropdown states
  const [activeLang, setActiveLang] = useState("id");
  const [isLangOpen, setIsLangOpen] = useState(false);
  
  const [activeAI, setActiveAI] = useState("gemini");
  const [isAIOpen, setIsAIOpen] = useState(false);

  const [activeWS, setActiveWS] = useState("personal");
  const [isWSOpen, setIsWSOpen] = useState(false);

  // About Modal state
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Read/Save default workspace to localStorage if on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWS = localStorage.getItem("active_dashboard");
      if (savedWS === "/dashboard/pos") {
        setActiveWS("pos");
      } else {
        setActiveWS("personal");
      }
    }
  }, []);

  const handleWorkspaceChange = (mode: string) => {
    setActiveWS(mode);
    if (typeof window !== "undefined") {
      const path = mode === "pos" ? "/dashboard/pos" : "/dashboard";
      localStorage.setItem("active_dashboard", path);
    }
  };

  const languages = [
    { value: "id", label: "Bahasa Indonesia" },
    { value: "en", label: "English (US)" }
  ];

  const aiProviders = [
    { value: "gemini", label: "Google Gemini (Default)", detail: "Respon cepat, integrasi pintar" },
    { value: "openai", label: "OpenAI GPT-4o", detail: "Analisis keuangan mendalam" },
    { value: "claude", label: "Claude 3.5 Sonnet", detail: "Gaya penulisan natural" },
    { value: "deepseek", label: "DeepSeek-V3", detail: "Efisiensi tinggi" }
  ];

  const workspaces = [
    { value: "personal", label: "Dashboard Personal" },
    { value: "pos", label: "Dashboard POS Usaha" }
  ];

  const currentLang = languages.find(l => l.value === activeLang) || languages[0];
  const currentAI = aiProviders.find(a => a.value === activeAI) || aiProviders[0];
  const currentWS = workspaces.find(w => w.value === activeWS) || workspaces[0];

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(207, 188, 255, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(231, 195, 101, 0.1) 0px, transparent 50%)
        `,
        minHeight: "100dvh",
        paddingBottom: 160,
      }}
    >
      <TopAppBar />

      <main style={{ marginTop: 72, padding: "0 var(--container-margin)", maxWidth: 672, margin: "72px auto 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-gap-sm)" }}>
          
          {/* Header */}
          <header className="animate-fade-slide-up" style={{ paddingTop: 16, marginBottom: 12 }}>
            <h1 className="text-headline-lg" style={{ color: "var(--on-surface)" }}>Pengaturan</h1>
            <p className="text-body-md" style={{ color: "var(--on-surface-variant)", marginTop: 4 }}>
              Atur akun, bahasa, notifikasi, dan model kecerdasan buatan Anda.
            </p>
          </header>

          {/* Profile Card */}
          <section className="glass-card animate-fade-slide-up" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary-fixed-dim), var(--primary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
                color: "white",
                boxShadow: "0 4px 15px rgba(79, 55, 138, 0.15)"
              }}
            >
              B
            </div>
            <div style={{ flex: 1 }}>
              <h3 className="text-headline-sm" style={{ fontSize: 16, color: "var(--on-surface)", margin: 0, fontWeight: 700 }}>Budi Santoso</h3>
              <p className="text-body-sm" style={{ color: "var(--on-surface-variant)", margin: "2px 0 6px 0" }}>budi.santoso@gmail.com</p>
              <span className="text-label-md" style={{ background: "rgba(79, 55, 138, 0.1)", color: "var(--primary)", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600 }}>Premium User</span>
            </div>
          </section>

          {/* Section: Preferensi Aplikasi */}
          <h4 className="settings-section-title animate-fade-slide-up">Preferensi Aplikasi</h4>
          <section
            className="glass-card animate-fade-slide-up"
            style={{
              padding: "0 16px",
              position: "relative",
              zIndex: (isLangOpen || isWSOpen) ? 10 : 1
            }}
          >
            
            {/* Lang Dropdown */}
            <div className="settings-row" style={{ position: "relative" }}>
              <div>
                <p className="text-body-md" style={{ fontWeight: 600 }}>Bahasa Aplikasi</p>
                <p className="text-body-sm" style={{ color: "var(--on-surface-variant)" }}>{currentLang.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                style={{
                  background: "rgba(103, 80, 164, 0.06)",
                  padding: "8px 12px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                Ubah
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>keyboard_arrow_down</span>
              </button>

              {isLangOpen && (
                <div
                  className="glass-card animate-fade-in"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    zIndex: 100,
                    marginTop: 6,
                    padding: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    width: 200,
                    background: "white",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(203, 196, 210, 0.4)"
                  }}
                >
                  {languages.map(l => (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() => {
                        setActiveLang(l.value);
                        setIsLangOpen(false);
                      }}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        fontSize: 14,
                        textAlign: "left",
                        width: "100%",
                        border: "none",
                        background: activeLang === l.value ? "rgba(103, 80, 164, 0.08)" : "transparent",
                        color: activeLang === l.value ? "var(--primary)" : "var(--on-surface)",
                        fontWeight: activeLang === l.value ? 600 : 500,
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Default Workspace */}
            <div className="settings-row" style={{ position: "relative" }}>
              <div>
                <p className="text-body-md" style={{ fontWeight: 600 }}>Default Workspace</p>
                <p className="text-body-sm" style={{ color: "var(--on-surface-variant)" }}>{currentWS.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsWSOpen(!isWSOpen)}
                style={{
                  background: "rgba(103, 80, 164, 0.06)",
                  padding: "8px 12px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                Atur
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>keyboard_arrow_down</span>
              </button>

              {isWSOpen && (
                <div
                  className="glass-card animate-fade-in"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    zIndex: 100,
                    marginTop: 6,
                    padding: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    width: 220,
                    background: "white",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(203, 196, 210, 0.4)"
                  }}
                >
                  {workspaces.map(w => (
                    <button
                      key={w.value}
                      type="button"
                      onClick={() => {
                        handleWorkspaceChange(w.value);
                        setIsWSOpen(false);
                      }}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        fontSize: 14,
                        textAlign: "left",
                        width: "100%",
                        border: "none",
                        background: activeWS === w.value ? "rgba(103, 80, 164, 0.08)" : "transparent",
                        color: activeWS === w.value ? "var(--primary)" : "var(--on-surface)",
                        fontWeight: activeWS === w.value ? 600 : 500,
                      }}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Toggle 1 */}
            <div className="settings-row">
              <div>
                <p className="text-body-md" style={{ fontWeight: 600 }}>Notifikasi Transaksi</p>
                <p className="text-body-sm" style={{ color: "var(--on-surface-variant)" }}>Kirim ringkasan transaksi via PWA push</p>
              </div>
              <button
                type="button"
                className={`settings-toggle ${notifTransaksi ? "active" : ""}`}
                onClick={() => setNotifTransaksi(!notifTransaksi)}
                aria-label="Toggle notifikasi transaksi"
              />
            </div>

            {/* Notification Toggle 2 */}
            <div className="settings-row">
              <div>
                <p className="text-body-md" style={{ fontWeight: 600 }}>Pengingat Budgeting</p>
                <p className="text-body-sm" style={{ color: "var(--on-surface-variant)" }}>Peringatan jika melebihi batas bulanan</p>
              </div>
              <button
                type="button"
                className={`settings-toggle ${notifBudget ? "active" : ""}`}
                onClick={() => setNotifBudget(!notifBudget)}
                aria-label="Toggle pengingat budgeting"
              />
            </div>

          </section>

          {/* Section: Konfigurasi AI */}
          <h4 className="settings-section-title animate-fade-slide-up">Konektivitas & AI</h4>
          <section
            className="glass-card animate-fade-slide-up"
            style={{
              padding: "0 16px",
              position: "relative",
              zIndex: isAIOpen ? 10 : 1
            }}
          >
            
            {/* AI Provider Dropdown */}
            <div className="settings-row" style={{ position: "relative" }}>
              <div style={{ marginRight: 12, flex: 1 }}>
                <p className="text-body-md" style={{ fontWeight: 600 }}>Provider AI Aktif</p>
                <p className="text-body-sm" style={{ color: "var(--on-surface-variant)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 240 }}>{currentAI.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAIOpen(!isAIOpen)}
                style={{
                  background: "rgba(103, 80, 164, 0.06)",
                  padding: "8px 12px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                Pilih
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>keyboard_arrow_down</span>
              </button>

              {isAIOpen && (
                <div
                  className="glass-card animate-fade-in"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    zIndex: 100,
                    marginTop: 6,
                    padding: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    width: 260,
                    background: "white",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(203, 196, 210, 0.4)"
                  }}
                >
                  {aiProviders.map(a => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => {
                        setActiveAI(a.value);
                        setIsAIOpen(false);
                      }}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        textAlign: "left",
                        width: "100%",
                        border: "none",
                        background: activeAI === a.value ? "rgba(103, 80, 164, 0.08)" : "transparent",
                        color: activeAI === a.value ? "var(--primary)" : "var(--on-surface)",
                        fontWeight: activeAI === a.value ? 600 : 500,
                        transition: "background 0.2s"
                      }}
                    >
                      <p style={{ fontSize: 14, margin: 0 }}>{a.label}</p>
                      <p style={{ fontSize: 10, color: "var(--outline)", margin: "2px 0 0 0" }}>{a.detail}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </section>

          {/* Section: Keamanan & Info */}
          <h4 className="settings-section-title animate-fade-slide-up">Keamanan & Informasi</h4>
          <section
            className="glass-card animate-fade-slide-up"
            style={{
              padding: "0 16px",
              position: "relative",
              zIndex: 1
            }}
          >
            
            {/* Security Toggle */}
            <div className="settings-row">
              <div>
                <p className="text-body-md" style={{ fontWeight: 600 }}>Keamanan Biometrik</p>
                <p className="text-body-sm" style={{ color: "var(--on-surface-variant)" }}>Gunakan FaceID / Sidik Jari untuk membuka PWA</p>
              </div>
              <button
                type="button"
                className={`settings-toggle ${biometricSec ? "active" : ""}`}
                onClick={() => setBiometricSec(!biometricSec)}
                aria-label="Toggle keamanan biometrik"
              />
            </div>

            {/* About App */}
            <div
              className="settings-row"
              onClick={() => setIsAboutOpen(true)}
              style={{ cursor: "pointer" }}
            >
              <div>
                <p className="text-body-md" style={{ fontWeight: 600 }}>Tentang Aplikasi</p>
                <p className="text-body-sm" style={{ color: "var(--on-surface-variant)" }}>Catetin v0.1.0 Beta (PWA)</p>
              </div>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>chevron_right</span>
            </div>

          </section>

          {/* Log Out Button */}
          <button
            onClick={() => window.location.href = "/login"}
            className="btn-primary"
            style={{
              background: "var(--error)",
              color: "white",
              boxShadow: "none",
              marginTop: 16,
              fontSize: 16,
              padding: 14,
              borderRadius: 16
            }}
          >
            Keluar dari Akun
          </button>

        </div>
      </main>

      <BottomNav />

      {/* About Application Modal */}
      {isAboutOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 24,
          }}
        >
          <div className="glass-card wallet-modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 className="text-headline-sm" style={{ fontWeight: 700 }}>Tentang Catetin</h3>
              <button
                onClick={() => setIsAboutOpen(false)}
                style={{ cursor: "pointer", color: "var(--on-surface-variant)", border: "none", background: "none" }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, color: "var(--on-surface)", paddingBottom: 16 }}>
              <div style={{ textAlign: "center", padding: "16px 0", borderBottom: "1px dashed rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                  <Image
                    src="/logo/logo.png"
                    alt="Catetin Logo"
                    width={120}
                    height={38}
                    style={{ height: "38px", width: "auto", objectFit: "contain" }}
                    priority
                  />
                </div>
                <p style={{ fontSize: 12, color: "var(--outline)", margin: "4px 0 0 0" }}>Versi 0.1.0 (Beta Build 2026.06)</p>
              </div>
              
              <p className="text-body-sm" style={{ lineHeight: "22px", textAlign: "justify" }}>
                **Catetin** adalah asisten pencatatan keuangan pintar bertenaga AI yang dirancang untuk membantu Anda memantau pengeluaran pribadi serta mengelola penjualan kasir (POS) bisnis secara simultan dengan bahasa sehari-hari.
              </p>

              <div style={{ background: "rgba(79, 55, 138, 0.04)", padding: 12, borderRadius: 12, fontSize: 12 }}>
                <p style={{ margin: 0, fontWeight: 600 }}>Status Progressive Web App (PWA):</p>
                <ul style={{ margin: "6px 0 0 16px", padding: 0 }}>
                  <li>Penyimpanan Cache Offline Aktif</li>
                  <li>Kompatibel dengan Pintasan Home Screen</li>
                  <li>Push Notification Siap Digunakan</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setIsAboutOpen(false)}
              className="btn-primary"
              style={{ padding: 12, fontSize: 16, boxShadow: "none" }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
