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
                    Gunakan Catatin AI atau pasang API Key Anda sendiri (OpenRouter, Groq, dll)
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
            <div className="settings-row" style={{ borderBottom: "none" }}>
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
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="btn-primary"
            style={{
              background: "var(--error)",
              color: "white",
              boxShadow: "none",
              marginTop: 16,
              fontSize: 16,
              padding: 14,
              borderRadius: 16,
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
