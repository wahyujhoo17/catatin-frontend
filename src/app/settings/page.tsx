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
  
  const [activeAI, setActiveAI] = useState("catetin");
  const [isAIOpen, setIsAIOpen] = useState(false);

  const [activeWS, setActiveWS] = useState("personal");
  const [isWSOpen, setIsWSOpen] = useState(false);

  // Profile states
  const [profileName, setProfileName] = useState("Budi Santoso");
  const [profileEmail, setProfileEmail] = useState("budi.santoso@gmail.com");

  // Modals state
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isCustomAIConfigFileOpen, setIsCustomAIConfigFileOpen] = useState(false);

  // Edit Profile Form state
  const [tempName, setTempName] = useState("Budi Santoso");
  const [tempEmail, setTempEmail] = useState("budi.santoso@gmail.com");

  // Change Password Form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Custom AI Config Form state
  const [customAITab, setCustomAITab] = useState("text"); // 'text' | 'image' | 'voice'
  
  // Text AI config
  const [customTextProvider, setCustomTextProvider] = useState("openai");
  const [customTextKey, setCustomTextKey] = useState("");
  const [customTextUrl, setCustomTextUrl] = useState("");
  
  // Image AI config
  const [customImageProvider, setCustomImageProvider] = useState("openai");
  const [customImageKey, setCustomImageKey] = useState("");
  const [customImageUrl, setCustomImageUrl] = useState("");
  
  // Voice AI config
  const [customVoiceProvider, setCustomVoiceProvider] = useState("whisper");
  const [customVoiceKey, setCustomVoiceKey] = useState("");
  const [customVoiceUrl, setCustomVoiceUrl] = useState("");
  
  const [aiConfigSuccess, setAiConfigSuccess] = useState(false);

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
      if (savedName) {
        setProfileName(savedName);
        setTempName(savedName);
      }
      if (savedEmail) {
        setProfileEmail(savedEmail);
        setTempEmail(savedEmail);
      }

      // Load custom AI configs
      const textProv = localStorage.getItem("custom_text_provider");
      const textKey = localStorage.getItem("custom_text_key");
      const textUrl = localStorage.getItem("custom_text_url");
      if (textProv) setCustomTextProvider(textProv);
      if (textKey) setCustomTextKey(textKey);
      if (textUrl) setCustomTextUrl(textUrl);
      
      const imgProv = localStorage.getItem("custom_image_provider");
      const imgKey = localStorage.getItem("custom_image_key");
      const imgUrl = localStorage.getItem("custom_image_url");
      if (imgProv) setCustomImageProvider(imgProv);
      if (imgKey) setCustomImageKey(imgKey);
      if (imgUrl) setCustomImageUrl(imgUrl);
      
      const voiceProv = localStorage.getItem("custom_voice_provider");
      const voiceKey = localStorage.getItem("custom_voice_key");
      const voiceUrl = localStorage.getItem("custom_voice_url");
      if (voiceProv) setCustomVoiceProvider(voiceProv);
      if (voiceKey) setCustomVoiceKey(voiceKey);
      if (voiceUrl) setCustomVoiceUrl(voiceUrl);
    }
  }, []);

  const handleWorkspaceChange = (mode: string) => {
    setActiveWS(mode);
    if (typeof window !== "undefined") {
      const path = mode === "pos" ? "/dashboard/pos" : "/dashboard";
      localStorage.setItem("active_dashboard", path);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileName(tempName);
    setProfileEmail(tempEmail);
    if (typeof window !== "undefined") {
      localStorage.setItem("profile_name", tempName);
      localStorage.setItem("profile_email", tempEmail);
    }
    setIsEditProfileOpen(false);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Password konfirmasi tidak cocok.");
      setPasswordSuccess(false);
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password baru harus minimal 6 karakter.");
      setPasswordSuccess(false);
      return;
    }
    setPasswordError("");
    setPasswordSuccess(true);
    setTimeout(() => {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(false);
      setIsChangePasswordOpen(false);
    }, 1200);
  };

  const handleSaveAIConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("custom_text_provider", customTextProvider);
      localStorage.setItem("custom_text_key", customTextKey);
      localStorage.setItem("custom_text_url", customTextUrl);
      
      localStorage.setItem("custom_image_provider", customImageProvider);
      localStorage.setItem("custom_image_key", customImageKey);
      localStorage.setItem("custom_image_url", customImageUrl);
      
      localStorage.setItem("custom_voice_provider", customVoiceProvider);
      localStorage.setItem("custom_voice_key", customVoiceKey);
      localStorage.setItem("custom_voice_url", customVoiceUrl);
    }
    setAiConfigSuccess(true);
    setTimeout(() => {
      setAiConfigSuccess(false);
      setIsCustomAIConfigFileOpen(false);
    }, 1200);
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
              zIndex: (isAIOpen || isCustomAIConfigFileOpen) ? 10 : 1
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

            {/* Custom AI Provider Key Setting Row */}
            <div
              className="settings-row"
              onClick={() => setIsCustomAIConfigFileOpen(true)}
              style={{ cursor: "pointer", borderBottom: "none" }}
            >
              <div>
                <p className="text-body-md" style={{ fontWeight: 600 }}>Kunci API & Provider Kustom</p>
                <p className="text-body-sm" style={{ color: "var(--on-surface-variant)" }}>
                  Atur model Teks Utama, Gambar, dan Voice sendiri
                </p>
              </div>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>chevron_right</span>
            </div>

          </section>

          {/* Section: Akun & Keamanan */}
          <h4 className="settings-section-title animate-fade-slide-up">Akun & Keamanan</h4>
          <section
            className="glass-card animate-fade-slide-up"
            style={{
              padding: "0 16px",
              position: "relative",
              zIndex: (isEditProfileOpen || isChangePasswordOpen) ? 10 : 1
            }}
          >
            {/* Ubah Profil */}
            <div
              className="settings-row"
              onClick={() => {
                setTempName(profileName);
                setTempEmail(profileEmail);
                setIsEditProfileOpen(true);
              }}
              style={{ cursor: "pointer" }}
            >
              <div>
                <p className="text-body-md" style={{ fontWeight: 600 }}>Ubah Informasi Profil</p>
                <p className="text-body-sm" style={{ color: "var(--on-surface-variant)" }}>Nama, email, dan detail akun Anda</p>
              </div>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>chevron_right</span>
            </div>

            {/* Ganti Password */}
            <div
              className="settings-row"
              onClick={() => {
                setPasswordError("");
                setPasswordSuccess(false);
                setIsChangePasswordOpen(true);
              }}
              style={{ cursor: "pointer" }}
            >
              <div>
                <p className="text-body-md" style={{ fontWeight: 600 }}>Ganti Kata Sandi</p>
                <p className="text-body-sm" style={{ color: "var(--on-surface-variant)" }}>Perbarui password untuk keamanan akun</p>
              </div>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>chevron_right</span>
            </div>

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

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
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
              <h3 className="text-headline-sm" style={{ fontWeight: 700 }}>Ubah Informasi Profil</h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                style={{ cursor: "pointer", color: "var(--on-surface-variant)", border: "none", background: "none" }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>Nama Lengkap</label>
                <input
                  type="text"
                  className="glass-input"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  required
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>Email</label>
                <input
                  type="email"
                  className="glass-input"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  required
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: 12 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: 12, boxShadow: "none" }}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
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
              <h3 className="text-headline-sm" style={{ fontWeight: 700 }}>Ganti Kata Sandi</h3>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                style={{ cursor: "pointer", color: "var(--on-surface-variant)", border: "none", background: "none" }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSavePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {passwordError && (
                <div style={{ color: "var(--error)", fontSize: 12, background: "var(--error-container)", padding: "8px 12px", borderRadius: 8 }}>
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div style={{ color: "var(--primary)", fontSize: 12, background: "rgba(79, 55, 138, 0.08)", padding: "8px 12px", borderRadius: 8 }}>
                  Password berhasil diperbarui!
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>Kata Sandi Lama</label>
                <input
                  type="password"
                  className="glass-input"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>Kata Sandi Baru</label>
                <input
                  type="password"
                  className="glass-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Minimal 6 karakter"
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  className="glass-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Ulangi kata sandi baru"
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: 12 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: 12, boxShadow: "none" }}
                  disabled={passwordSuccess}
                >
                  {passwordSuccess ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom AI Provider Configuration Modal */}
      {isCustomAIConfigFileOpen && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
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
          <div className="glass-card wallet-modal" style={{ maxWidth: 440 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 className="text-headline-sm" style={{ fontWeight: 700 }}>Provider AI Kustom</h3>
              <button
                onClick={() => setIsCustomAIConfigFileOpen(false)}
                style={{ cursor: "pointer", color: "var(--on-surface-variant)", border: "none", background: "none" }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Config Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,0.06)", marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => setCustomAITab("text")}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "none",
                  border: "none",
                  borderBottom: customAITab === "text" ? "2px solid var(--primary)" : "none",
                  color: customAITab === "text" ? "var(--primary)" : "var(--on-surface-variant)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                Text Utama
              </button>
              <button
                type="button"
                onClick={() => setCustomAITab("image")}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "none",
                  border: "none",
                  borderBottom: customAITab === "image" ? "2px solid var(--primary)" : "none",
                  color: customAITab === "image" ? "var(--primary)" : "var(--on-surface-variant)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                Gambar
              </button>
              <button
                type="button"
                onClick={() => setCustomAITab("voice")}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "none",
                  border: "none",
                  borderBottom: customAITab === "voice" ? "2px solid var(--primary)" : "none",
                  color: customAITab === "voice" ? "var(--primary)" : "var(--on-surface-variant)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                Voice
              </button>
            </div>

            <form onSubmit={handleSaveAIConfig} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {aiConfigSuccess && (
                <div style={{ color: "var(--primary)", fontSize: 12, background: "rgba(79, 55, 138, 0.08)", padding: "8px 12px", borderRadius: 8 }}>
                  Kunci API & konfigurasi berhasil disimpan!
                </div>
              )}

              {/* Tab: Text Utama */}
              {customAITab === "text" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>Provider Text Utama</label>
                    <select
                      className="glass-input"
                      value={customTextProvider}
                      onChange={(e) => setCustomTextProvider(e.target.value)}
                      style={{ width: "100%", background: "white", padding: 12, borderRadius: 12 }}
                    >
                      <option value="openai">Custom OpenAI GPT</option>
                      <option value="gemini">Custom Gemini Pro</option>
                      <option value="claude">Custom Claude Sonnet</option>
                      <option value="ollama">Local Ollama / Llama</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>API Key / Kredensial</label>
                    <input
                      type="password"
                      className="glass-input"
                      value={customTextKey}
                      onChange={(e) => setCustomTextKey(e.target.value)}
                      placeholder="sk-..."
                      style={{ width: "100%", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>Custom Base URL (Opsional)</label>
                    <input
                      type="text"
                      className="glass-input"
                      value={customTextUrl}
                      onChange={(e) => setCustomTextUrl(e.target.value)}
                      placeholder="https://api.openai.com/v1"
                      style={{ width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              )}

              {/* Tab: Gambar */}
              {customAITab === "image" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>Provider Gambar (OCR Receipt)</label>
                    <select
                      className="glass-input"
                      value={customImageProvider}
                      onChange={(e) => setCustomImageProvider(e.target.value)}
                      style={{ width: "100%", background: "white", padding: 12, borderRadius: 12 }}
                    >
                      <option value="openai">OpenAI GPT-4o / Vision</option>
                      <option value="gemini">Gemini Flash / Vision</option>
                      <option value="custom">Custom OCR Model</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>API Key / Kredensial</label>
                    <input
                      type="password"
                      className="glass-input"
                      value={customImageKey}
                      onChange={(e) => setCustomImageKey(e.target.value)}
                      placeholder="sk-..."
                      style={{ width: "100%", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>Custom Base URL (Opsional)</label>
                    <input
                      type="text"
                      className="glass-input"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="https://api.gemini.com/v1"
                      style={{ width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              )}

              {/* Tab: Voice */}
              {customAITab === "voice" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>Provider Voice (Speech-to-Text)</label>
                    <select
                      className="glass-input"
                      value={customVoiceProvider}
                      onChange={(e) => setCustomVoiceProvider(e.target.value)}
                      style={{ width: "100%", background: "white", padding: 12, borderRadius: 12 }}
                    >
                      <option value="whisper">OpenAI Whisper API</option>
                      <option value="google">Google Speech-to-Text</option>
                      <option value="elevenlabs">ElevenLabs TTS/STT</option>
                      <option value="custom">Custom Speech API</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>API Key / Kredensial</label>
                    <input
                      type="password"
                      className="glass-input"
                      value={customVoiceKey}
                      onChange={(e) => setCustomVoiceKey(e.target.value)}
                      placeholder="sk-..."
                      style={{ width: "100%", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>Custom Base URL (Opsional)</label>
                    <input
                      type="text"
                      className="glass-input"
                      value={customVoiceUrl}
                      onChange={(e) => setCustomVoiceUrl(e.target.value)}
                      placeholder="https://api.openai.com/v1/audio"
                      style={{ width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsCustomAIConfigFileOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: 12 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: 12, boxShadow: "none" }}
                  disabled={aiConfigSuccess}
                >
                  {aiConfigSuccess ? "Menyimpan..." : "Simpan Konfigurasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
