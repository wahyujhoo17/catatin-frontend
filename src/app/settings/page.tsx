"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopAppBar from "@/components/layout/TopAppBar";
import BottomNav from "@/components/layout/BottomNav";
import AIProviderLogo from "@/components/AIProviderLogo";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { user, updateMode, logout } = useAuth();
  const router = useRouter();
  // Toggle states
  const [notifTransaksi, setNotifTransaksi] = useState(true);
  const [notifBudget, setNotifBudget] = useState(false);
  const [biometricSec, setBiometricSec] = useState(true);

  const [activeLang, setActiveLang] = useState("id");
  const [isLangOpen, setIsLangOpen] = useState(false);

  const [activeWS, setActiveWS] = useState("personal");
  const [isWSOpen, setIsWSOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  // Profile states
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Sync user data from AuthContext
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  // Read/Save settings & default workspace to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWS = localStorage.getItem("active_dashboard");
      if (savedWS === "/dashboard/pos") {
        setActiveWS("pos");
      } else {
        setActiveWS("personal");
      }

      // Load saved profile image
      const savedImage = localStorage.getItem("profile_image");
      if (savedImage) setProfileImage(savedImage);
    }
  }, []);

  const handleWorkspaceChange = async (mode: string) => {
    setActiveWS(mode);
    if (typeof window !== "undefined") {
      const path = mode === "pos" ? "/dashboard/pos" : "/dashboard";
      localStorage.setItem("active_dashboard", path);
    }
    // Sync mode to backend
    try {
      await updateMode(mode === "pos" ? "POS" : "PERSONAL");
    } catch {
      // silently fail - localStorage is the fallback
    }
  };

  const handleClearChat = async () => {
    setIsClearingChat(true);
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/api/ai/chat/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Gagal menghapus riwayat chat");
      }

      // Show success toast with animation
      setIsConfirmOpen(false);
      setShowSuccessToast(true);
      // Delay sedikit agar modal close dulu sebelum toast muncul
      setTimeout(() => setToastVisible(true), 150);
      // Auto-dismiss setelah 4 detik
      setTimeout(() => {
        setToastVisible(false);
        setTimeout(() => setShowSuccessToast(false), 400);
      }, 4000);
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat menghapus chat.");
    } finally {
      setIsClearingChat(false);
    }
  };

  const languages = [
    { value: "id", label: "Bahasa Indonesia" },
    { value: "en", label: "English (US)" },
  ];

  const workspaces = [
    { value: "personal", label: "Dashboard Personal" },
    { value: "pos", label: "Dashboard POS Usaha" },
  ];

  const currentLang =
    languages.find((l) => l.value === activeLang) || languages[0];
  const currentWS =
    workspaces.find((w) => w.value === activeWS) || workspaces[0];

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        minHeight: "100dvh",
        paddingBottom: 160,
      }}
    >
      <TopAppBar />

      <main className="settings-home-container">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--stack-gap-sm)",
          }}
        >
          {/* Header */}
          <header
            className="animate-fade-slide-up"
            style={{ paddingTop: 16, marginBottom: 12 }}
          >
            <h1
              className="text-headline-lg"
              style={{ color: "var(--on-surface)" }}
            >
              Pengaturan
            </h1>
            <p
              className="text-body-md"
              style={{ color: "var(--on-surface-variant)", marginTop: 4 }}
            >
              Atur akun, bahasa, notifikasi, dan model kecerdasan buatan Anda.
            </p>
          </header>

          {/* Profile Card */}
          <section
            className="glass-card animate-fade-slide-up"
            style={{
              padding: 20,
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--primary-fixed-dim), var(--primary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
                color: "white",
                boxShadow: "0 4px 15px rgba(79, 55, 138, 0.15)",
                overflow: "hidden",
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                profileName.charAt(0).toUpperCase()
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h3
                className="text-headline-sm"
                style={{
                  fontSize: 16,
                  color: "var(--on-surface)",
                  margin: 0,
                  fontWeight: 700,
                }}
              >
                {profileName}
              </h3>
              <p
                className="text-body-sm"
                style={{
                  color: "var(--on-surface-variant)",
                  margin: "2px 0 6px 0",
                }}
              >
                {profileEmail}
              </p>
              <span
                className="text-label-md"
                style={{
                  background: "rgba(79, 55, 138, 0.1)",
                  color: "var(--primary)",
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                Premium User
              </span>
            </div>
          </section>

          {/* Section: Preferensi Aplikasi */}
          <h4 className="settings-section-title animate-fade-slide-up">
            Preferensi Aplikasi
          </h4>
          <section
            className="glass-card animate-fade-slide-up"
            style={{
              padding: "0 16px",
              position: "relative",
              zIndex: isLangOpen || isWSOpen ? 10 : 1,
            }}
          >
            {/* Lang Dropdown */}
            <div className="settings-row" style={{ position: "relative" }}>
              <div>
                <p className="text-body-md" style={{ fontWeight: 600 }}>
                  Bahasa Aplikasi
                </p>
                <p
                  className="text-body-sm"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  {currentLang.label}
                </p>
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
                  gap: 4,
                }}
              >
                Ubah
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                >
                  keyboard_arrow_down
                </span>
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
                    border: "1px solid rgba(203, 196, 210, 0.4)",
                  }}
                >
                  {languages.map((l) => (
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
                        background:
                          activeLang === l.value
                            ? "rgba(103, 80, 164, 0.08)"
                            : "transparent",
                        color:
                          activeLang === l.value
                            ? "var(--primary)"
                            : "var(--on-surface)",
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
                <p className="text-body-md" style={{ fontWeight: 600 }}>
                  Default Workspace
                </p>
                <p
                  className="text-body-sm"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  {currentWS.label}
                </p>
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
                  gap: 4,
                }}
              >
                Atur
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                >
                  keyboard_arrow_down
                </span>
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
                    border: "1px solid rgba(203, 196, 210, 0.4)",
                  }}
                >
                  {workspaces.map((w) => (
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
                        background:
                          activeWS === w.value
                            ? "rgba(103, 80, 164, 0.08)"
                            : "transparent",
                        color:
                          activeWS === w.value
                            ? "var(--primary)"
                            : "var(--on-surface)",
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
                <p className="text-body-md" style={{ fontWeight: 600 }}>
                  Notifikasi Transaksi
                </p>
                <p
                  className="text-body-sm"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  Kirim ringkasan transaksi via PWA push
                </p>
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
                <p className="text-body-md" style={{ fontWeight: 600 }}>
                  Pengingat Budgeting
                </p>
                <p
                  className="text-body-sm"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  Peringatan jika melebihi batas bulanan
                </p>
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
          <h4 className="settings-section-title animate-fade-slide-up">
            Konektivitas & AI
          </h4>
          <section
            className="glass-card animate-fade-slide-up"
            style={{
              padding: "0 16px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Link
              href="/settings/custom-ai"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
                width: "100%",
              }}
            >
              <div
                className="settings-row"
                style={{ borderBottom: "none", width: "100%" }}
              >
                <div>
                  <p className="text-body-md" style={{ fontWeight: 600 }}>
                    Konfigurasi Provider AI
                  </p>
                  <p
                    className="text-body-sm"
                    style={{ color: "var(--on-surface-variant)" }}
                  >
                    Gunakan Catatin AI atau pasang API Key Anda sendiri
                    (OpenRouter, Groq, dll)
                  </p>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--primary)" }}
                >
                  chevron_right
                </span>
              </div>
            </Link>
          </section>

          {/* Section: Akun & Keamanan */}
          <h4 className="settings-section-title animate-fade-slide-up">
            Akun & Keamanan
          </h4>
          <section
            className="glass-card animate-fade-slide-up"
            style={{
              padding: "0 16px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Ubah Profil Link */}
            <Link
              href="/settings/profile"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
                width: "100%",
              }}
            >
              <div className="settings-row" style={{ width: "100%" }}>
                <div>
                  <p className="text-body-md" style={{ fontWeight: 600 }}>
                    Ubah Informasi Profil
                  </p>
                  <p
                    className="text-body-sm"
                    style={{ color: "var(--on-surface-variant)" }}
                  >
                    Nama, email, dan detail akun Anda
                  </p>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--primary)" }}
                >
                  chevron_right
                </span>
              </div>
            </Link>

            {/* Ganti Password Link */}
            <Link
              href="/settings/password"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
                width: "100%",
              }}
            >
              <div className="settings-row" style={{ width: "100%" }}>
                <div>
                  <p className="text-body-md" style={{ fontWeight: 600 }}>
                    Ganti Kata Sandi
                  </p>
                  <p
                    className="text-body-sm"
                    style={{ color: "var(--on-surface-variant)" }}
                  >
                    Perbarui password untuk keamanan akun
                  </p>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--primary)" }}
                >
                  chevron_right
                </span>
              </div>
            </Link>

            {/* Security Toggle */}
            <div className="settings-row">
              <div>
                <p className="text-body-md" style={{ fontWeight: 600 }}>
                  Keamanan Biometrik
                </p>
                <p
                  className="text-body-sm"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  Gunakan FaceID / Sidik Jari untuk membuka PWA
                </p>
              </div>
              <button
                type="button"
                className={`settings-toggle ${biometricSec ? "active" : ""}`}
                onClick={() => setBiometricSec(!biometricSec)}
                aria-label="Toggle keamanan biometrik"
              />
            </div>

            {/* Chat History */}
            <div
              className="settings-row"
              style={{ borderBottom: "none", cursor: "pointer" }}
              onClick={() => setIsConfirmOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") setIsConfirmOpen(true);
              }}
              aria-label="Buka pengaturan riwayat chat"
            >
              <div style={{ flex: 1 }}>
                <p className="text-body-md" style={{ fontWeight: 600 }}>
                  Riwayat Chat
                </p>
                <p
                  className="text-body-sm"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  Kelola riwayat obrolan dengan Catatin AI
                </p>
              </div>
              <span
                className="material-symbols-outlined"
                style={{
                  color: "var(--primary)",
                  fontSize: 24,
                }}
              >
                chevron_right
              </span>
            </div>
          </section>

          {/* Section: Informasi & Bantuan */}
          <h4 className="settings-section-title animate-fade-slide-up">
            Informasi & Bantuan
          </h4>
          <section
            className="glass-card animate-fade-slide-up"
            style={{
              padding: "0 16px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* About App Link */}
            <Link
              href="/settings/about"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
                width: "100%",
              }}
            >
              <div className="settings-row" style={{ width: "100%" }}>
                <div>
                  <p className="text-body-md" style={{ fontWeight: 600 }}>
                    Tentang Aplikasi
                  </p>
                  <p
                    className="text-body-sm"
                    style={{ color: "var(--on-surface-variant)" }}
                  >
                    Catatin v0.1.0 Beta (PWA)
                  </p>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--primary)" }}
                >
                  chevron_right
                </span>
              </div>
            </Link>

            {/* Help Support */}
            <div
              className="settings-row"
              style={{ cursor: "pointer", borderBottom: "none" }}
            >
              <div>
                <p className="text-body-md" style={{ fontWeight: 600 }}>
                  Hubungi Bantuan
                </p>
                <p
                  className="text-body-sm"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  Pusat bantuan dan FAQ pengguna
                </p>
              </div>
              <span
                className="material-symbols-outlined"
                style={{ color: "var(--primary)" }}
              >
                chevron_right
              </span>
            </div>
          </section>

          {/* Log Out Button */}
          <button
            onClick={async () => {
              setIsLoggingOut(true);
              // Tambahkan sedikit delay agar animasi loading terlihat
              await new Promise((resolve) => setTimeout(resolve, 800));
              logout();
              router.push("/login");
            }}
            disabled={isLoggingOut}
            className="btn-primary"
            style={{
              background: "var(--error)",
              color: "white",
              boxShadow: "none",
              marginTop: 16,
              fontSize: 16,
              padding: 14,
              borderRadius: 16,
              opacity: isLoggingOut ? 0.7 : 1,
            }}
          >
            {isLoggingOut ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  className="material-symbols-outlined"
                  style={{ animation: "spin 1s linear infinite" }}
                >
                  progress_activity
                </span>
                Keluar...
              </div>
            ) : (
              "Keluar dari Akun"
            )}
          </button>
        </div>
      </main>

      <BottomNav />

      {/* Chat History Modal */}
      {isConfirmOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(29, 27, 32, 0.5)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            className="animate-fade-slide-up"
            style={{
              width: "100%",
              maxWidth: 400,
              maxHeight: "88dvh",
              background: "var(--surface-container-lowest)",
              borderRadius: 28,
              boxShadow: "0 20px 48px rgba(0,0,0,0.18)",
              border: "1px solid var(--outline-variant)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* ── Header ── */}
            <div
              style={{
                padding: "28px 24px 8px",
                textAlign: "center",
                flexShrink: 0,
              }}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "none",
                  background: "var(--surface-container-high)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--on-surface-variant)",
                }}
                aria-label="Tutup"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                >
                  close
                </span>
              </button>

              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, rgba(186, 26, 26, 0.08), rgba(186, 26, 26, 0.15))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px auto",
                  color: "var(--error)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 36 }}
                >
                  delete_forever
                </span>
              </div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--on-surface)",
                  margin: "0 0 6px 0",
                  letterSpacing: "-0.3px",
                }}
              >
                Hapus Riwayat Chat
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--on-surface-variant)",
                  margin: 0,
                  lineHeight: "22px",
                  padding: "0 8px",
                }}
              >
                Semua percakapan dengan AI akan dihapus secara permanen dan
                tidak dapat dikembalikan.
              </p>
            </div>

            {/* ── Scrollable content ── */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                padding: "8px 24px 4px",
              }}
            >
              {/* Info card: What gets deleted */}
              <div
                style={{
                  background: "var(--surface-container-low)",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: "rgba(79, 55, 138, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "var(--primary)",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18 }}
                  >
                    chat_bubble
                  </span>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--on-surface)",
                      margin: "0 0 6px",
                    }}
                  >
                    Data yang akan dihapus:
                  </p>
                  <ul
                    style={{
                      fontSize: 13,
                      color: "var(--on-surface-variant)",
                      margin: 0,
                      paddingLeft: 18,
                      lineHeight: "24px",
                      listStyleType: "disc",
                    }}
                  >
                    <li>Semua pesan dan balasan chat</li>
                    <li>Riwayat percakapan dengan AI</li>
                    <li>Konteks &amp; memori percakapan</li>
                  </ul>
                </div>
              </div>

              {/* Info card: What stays */}
              <div
                style={{
                  background: "var(--surface-container-low)",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: "rgba(56, 142, 60, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "#388e3c",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18 }}
                  >
                    shield
                  </span>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--on-surface)",
                      margin: "0 0 6px",
                    }}
                  >
                    Data yang tetap aman:
                  </p>
                  <ul
                    style={{
                      fontSize: 13,
                      color: "var(--on-surface-variant)",
                      margin: 0,
                      paddingLeft: 18,
                      lineHeight: "24px",
                      listStyleType: "disc",
                    }}
                  >
                    <li>Akun &amp; data profil Anda</li>
                    <li>Transaksi &amp; keuangan</li>
                    <li>Pengaturan &amp; preferensi</li>
                  </ul>
                </div>
              </div>

              {/* Warning card */}
              <div
                style={{
                  background: "rgba(186, 26, 26, 0.05)",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 8,
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  border: "1px solid rgba(186, 26, 26, 0.15)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    color: "var(--error)",
                    fontSize: 20,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  warning
                </span>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--on-surface-variant)",
                    margin: 0,
                    lineHeight: "20px",
                  }}
                >
                  <strong style={{ color: "var(--error)" }}>
                    Tindakan ini tidak dapat dibatalkan.
                  </strong>{" "}
                  Setelah dihapus, seluruh riwayat chat akan hilang selamanya.
                  Pastikan Anda sudah menyimpan informasi penting sebelum
                  melanjutkan.
                </p>
              </div>
            </div>

            {/* ── Bottom actions ── */}
            <div
              style={{
                padding: "12px 20px 20px",
                borderTop: "1px solid var(--outline-variant)",
                display: "flex",
                gap: 10,
                flexShrink: 0,
                background: "var(--surface-container-lowest)",
                borderBottomLeftRadius: 28,
                borderBottomRightRadius: 28,
              }}
            >
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid var(--outline-variant)",
                  background: "transparent",
                  color: "var(--on-surface-variant)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.15s ease",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleClearChat}
                disabled={isClearingChat}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg, #ba1a1a, #d32f2f)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: isClearingChat ? "not-allowed" : "pointer",
                  textAlign: "center",
                  boxShadow: "0 2px 8px rgba(186, 26, 26, 0.2)",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: isClearingChat ? 0.7 : 1,
                }}
              >
                {isClearingChat ? (
                  <>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 16,
                        animation: "spin 1s linear infinite",
                      }}
                    >
                      progress_activity
                    </span>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16 }}
                    >
                      delete
                    </span>
                    Hapus Semua
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Toast ── */}
      {showSuccessToast && (
        <div
          style={{
            position: "fixed",
            bottom: 96,
            left: 16,
            right: 16,
            transform: toastVisible
              ? "translateY(0) scale(1)"
              : "translateY(20px) scale(0.94)",
            opacity: toastVisible ? 1 : 0,
            transition: "all 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
            zIndex: 2000,
            pointerEvents: "none",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "var(--surface-container-lowest)",
              borderRadius: 18,
              padding: "14px 18px",
              boxShadow:
                "0 8px 30px rgba(79, 55, 138, 0.18), 0 2px 6px rgba(0,0,0,0.04)",
              border: "1px solid var(--outline-variant)",
              maxWidth: 380,
              width: "100%",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "linear-gradient(135deg, #4f378a, #6750a4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(79, 55, 138, 0.25)",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 20,
                  color: "white",
                }}
              >
                check
              </span>
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--on-surface)",
                  letterSpacing: "-0.2px",
                }}
              >
                Riwayat berhasil dibersihkan
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 12,
                  color: "var(--on-surface-variant)",
                  lineHeight: "16px",
                }}
              >
                Semua chat telah dihapus permanen
              </p>
            </div>

            {/* Progress bar */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 18,
                right: 18,
                height: 3,
                background: "var(--surface-container-highest)",
                borderRadius: "0 0 18px 18px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #4f378a, #6750a4)",
                  borderRadius: "0 0 18px 18px",
                  animation: "toastProgress 3.8s linear forwards",
                  width: "100%",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
