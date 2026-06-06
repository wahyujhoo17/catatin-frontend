"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TopAppBar from "@/components/layout/TopAppBar";
import BottomNav from "@/components/layout/BottomNav";
import AIProviderLogo from "@/components/AIProviderLogo";

export default function SettingsPage() {
  // Toggle states
  const [notifTransaksi, setNotifTransaksi] = useState(true);
  const [notifBudget, setNotifBudget] = useState(false);
  const [biometricSec, setBiometricSec] = useState(true);
  
  // Custom Dropdown states
  const [activeLang, setActiveLang] = useState("id");
  const [isLangOpen, setIsLangOpen] = useState(false);
  
  const [activeAI, setActiveAI] = useState("catetin");
  const [isAIOpen, setIsAIOpen] = useState(false);

  const [activeWS, setActiveWS] = useState("personal");
  const [isWSOpen, setIsWSOpen] = useState(false);

  // Profile states
  const [profileName, setProfileName] = useState("Budi Santoso");
  const [profileEmail, setProfileEmail] = useState("budi.santoso@gmail.com");

  // Read/Save settings & default workspace to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWS = localStorage.getItem("active_dashboard");
      if (savedWS === "/dashboard/pos") {
        setActiveWS("pos");
      } else {
        setActiveWS("personal");
      }

      // Load profile info
      const savedName = localStorage.getItem("profile_name");
      const savedEmail = localStorage.getItem("profile_email");
      if (savedName) setProfileName(savedName);
      if (savedEmail) setProfileEmail(savedEmail);
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
    { value: "catetin", label: "Catetin AI (Default)", detail: "Respon cepat, integrasi keuangan pintar" },
    { value: "gemini", label: "Google Gemini", detail: "Integrasi model Google" },
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
              {profileName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h3 className="text-headline-sm" style={{ fontSize: 16, color: "var(--on-surface)", margin: 0, fontWeight: 700 }}>{profileName}</h3>
              <p className="text-body-sm" style={{ color: "var(--on-surface-variant)", margin: "2px 0 6px 0" }}>{profileEmail}</p>
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
            <div className="settings-row" style={{ borderBottom: "none" }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, marginRight: 12, minWidth: 0 }}>
                <AIProviderLogo provider={activeAI} containerSize={36} size={20} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="text-body-md" style={{ fontWeight: 600, margin: 0 }}>Provider AI Aktif</p>
                  <p className="text-body-sm" style={{ color: "var(--on-surface-variant)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentAI.label}</p>
                </div>
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
                  gap: 4,
                  flexShrink: 0
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
                    width: 270,
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
                        transition: "background 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: 10
                      }}
                    >
                      <AIProviderLogo provider={a.value} containerSize={28} size={15} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, margin: 0, fontWeight: activeAI === a.value ? 600 : 500 }}>{a.label}</p>
                        <p style={{ fontSize: 10, color: "var(--outline)", margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.detail}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom AI Provider Link Row */}
            <Link
              href="/settings/custom-ai"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none", color: "inherit", width: "100%" }}
            >
              <div className="settings-row" style={{ borderBottom: "none", width: "100%" }}>
                <div>
                  <p className="text-body-md" style={{ fontWeight: 600 }}>Kunci API & Provider Kustom</p>
                  <p className="text-body-sm" style={{ color: "var(--on-surface-variant)" }}>
                    Atur model Teks Utama, Gambar, dan Voice sendiri
                  </p>
                </div>
                <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>chevron_right</span>
              </div>
            </Link>

          </section>

          {/* Section: Akun & Keamanan */}
          <h4 className="settings-section-title animate-fade-slide-up">Akun & Keamanan</h4>
          <section
            className="glass-card animate-fade-slide-up"
            style={{
              padding: "0 16px",
              position: "relative",
              zIndex: 1
            }}
          >
            {/* Ubah Profil Link */}
            <Link
              href="/settings/profile"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none", color: "inherit", width: "100%" }}
            >
              <div className="settings-row" style={{ width: "100%" }}>
                <div>
                  <p className="text-body-md" style={{ fontWeight: 600 }}>Ubah Informasi Profil</p>
                  <p className="text-body-sm" style={{ color: "var(--on-surface-variant)" }}>Nama, email, dan detail akun Anda</p>
                </div>
                <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>chevron_right</span>
              </div>
            </Link>

            {/* Ganti Password Link */}
            <Link
              href="/settings/password"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none", color: "inherit", width: "100%" }}
            >
              <div className="settings-row" style={{ width: "100%" }}>
                <div>
                  <p className="text-body-md" style={{ fontWeight: 600 }}>Ganti Kata Sandi</p>
                  <p className="text-body-sm" style={{ color: "var(--on-surface-variant)" }}>Perbarui password untuk keamanan akun</p>
                </div>
                <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>chevron_right</span>
              </div>
            </Link>

            {/* Security Toggle */}
            <div className="settings-row" style={{ borderBottom: "none" }}>
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
          </section>

          {/* Section: Informasi & Bantuan */}
          <h4 className="settings-section-title animate-fade-slide-up">Informasi & Bantuan</h4>
          <section
            className="glass-card animate-fade-slide-up"
            style={{
              padding: "0 16px",
              position: "relative",
              zIndex: 1
            }}
          >
            {/* About App Link */}
            <Link
              href="/settings/about"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none", color: "inherit", width: "100%" }}
            >
              <div className="settings-row" style={{ width: "100%" }}>
                <div>
                  <p className="text-body-md" style={{ fontWeight: 600 }}>Tentang Aplikasi</p>
                  <p className="text-body-sm" style={{ color: "var(--on-surface-variant)" }}>Catetin v0.1.0 Beta (PWA)</p>
                </div>
                <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>chevron_right</span>
              </div>
            </Link>

            {/* Help Support */}
            <div
              className="settings-row"
              style={{ cursor: "pointer", borderBottom: "none" }}
            >
              <div>
                <p className="text-body-md" style={{ fontWeight: 600 }}>Hubungi Bantuan</p>
                <p className="text-body-sm" style={{ color: "var(--on-surface-variant)" }}>Pusat bantuan dan FAQ pengguna</p>
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
    </div>
  );
}
