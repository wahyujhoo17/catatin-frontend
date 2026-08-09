"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopAppBar from "@/components/layout/TopAppBar";
import BottomNav from "@/components/layout/BottomNav";
import AIProviderLogo from "@/components/AIProviderLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function SettingsPage() {
  const { user, updateMode, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();
  // Toggle states
  const [notifTransaksi, setNotifTransaksi] = useState(true);
  const [notifBudget, setNotifBudget] = useState(false);
  const [biometricSec, setBiometricSec] = useState(true);

  const [activeLang, setActiveLang] = useState("id");
  const [isLangOpen, setIsLangOpen] = useState(false);

  const [activeWS, setActiveWS] = useState("personal");
  const [isWSOpen, setIsWSOpen] = useState(false);

  const [cycleStartDay, setCycleStartDay] = useState(1);
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [tempSelectedDay, setTempSelectedDay] = useState(1);
  const [isSavingCycleDay, setIsSavingCycleDay] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  // Profile states
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Load preferences & sync user data from AuthContext / localStorage
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
      if (user.mode) {
        setActiveWS(user.mode.toLowerCase() === "pos" ? "pos" : "personal");
      }
    } else if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("app_user_mode");
      if (savedMode === "pos") {
        setActiveWS("pos");
      } else {
        setActiveWS("personal");
      }
    }

    if (typeof window !== "undefined") {
      const savedImage = localStorage.getItem("profile_image");
      if (savedImage) setProfileImage(savedImage);

      const savedLang = localStorage.getItem("pref_app_lang");
      if (savedLang) setActiveLang(savedLang);

      const savedNotifTrans = localStorage.getItem("pref_notif_transaksi");
      if (savedNotifTrans !== null) setNotifTransaksi(savedNotifTrans === "true");

      const savedNotifBudget = localStorage.getItem("pref_notif_budgeting");
      if (savedNotifBudget !== null) setNotifBudget(savedNotifBudget === "true");

      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      if (token) {
        fetch(`${API_BASE}/api/settings/preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.financialCycleStartDay) {
              setCycleStartDay(data.financialCycleStartDay);
            }
          })
          .catch(() => {});
      }
    }
  }, [user]);

  const handleCycleDayChange = async (day: number) => {
    setIsSavingCycleDay(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || localStorage.getItem("auth_token")
          : null;

      if (!token) {
        triggerToast("Sesi login tidak ditemukan, silakan login ulang.");
        setIsSavingCycleDay(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/settings/preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ financialCycleStartDay: day }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setCycleStartDay(day);
        setIsCycleModalOpen(false);
        triggerToast(
          lang === "en"
            ? `Financial cycle reset day updated to date ${day}`
            : `Tanggal reset siklus keuangan diset ke tanggal ${day}`
        );
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("financial_cycle_changed"));
        }
      } else {
        triggerToast(data.error || "Gagal menyimpan tanggal reset");
      }
    } catch (err: any) {
      console.error("Failed to save financial cycle start day:", err);
      triggerToast("Gagal menyimpan tanggal reset");
    } finally {
      setIsSavingCycleDay(false);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => setShowSuccessToast(false), 400);
    }, 2500);
  };

  const handleLangChange = (newLang: string) => {
    const target = newLang === "en" ? "en" : "id";
    setActiveLang(target);
    setLang(target);
    triggerToast(target === "en" ? "App language set to English" : "Bahasa aplikasi diset ke Bahasa Indonesia");
  };

  const handleToggleNotifTransaksi = (val: boolean) => {
    setNotifTransaksi(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("pref_notif_transaksi", String(val));
    }
    triggerToast(`Notifikasi transaksi ${val ? "diaktifkan" : "dinonaktifkan"}`);
  };

  const handleToggleNotifBudget = (val: boolean) => {
    setNotifBudget(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("pref_notif_budgeting", String(val));
    }
    triggerToast(`Pengingat budgeting ${val ? "diaktifkan" : "dinonaktifkan"}`);
  };

  const handleWorkspaceChange = async (mode: string) => {
    if (mode === "pos") {
      setToastMessage("Fitur Dashboard POS Usaha Segera Hadir (Coming Soon)!");
      setShowSuccessToast(true);
      setToastVisible(true);
      return;
    }
    const targetMode = "personal";
    setActiveWS(targetMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("app_user_mode", targetMode);
      localStorage.setItem("active_dashboard", "/dashboard");
    }
    try {
      await updateMode("PERSONAL");
    } catch (e: any) {
      console.error("Gagal mengubah mode workspace:", e);
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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus riwayat chat");

      setToastMessage("Riwayat chat AI berhasil dibersihkan");
      setShowSuccessToast(true);
      setToastVisible(true);
    } catch (err: any) {
      setToastMessage(err.message || "Gagal menghapus riwayat chat");
      setShowSuccessToast(true);
      setToastVisible(true);
    } finally {
      setIsClearingChat(false);
      setIsConfirmOpen(false);
    }
  };

  const languages = [
    { value: "id", label: "Bahasa Indonesia" },
    { value: "en", label: "English (US)" },
  ];

  const workspaces = [
    { value: "personal", label: "Dashboard Personal", disabled: false },
    { value: "pos", label: "Dashboard POS Usaha (Coming Soon)", disabled: true },
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
              {t("settings.title")}
            </h1>
            <p
              className="text-body-md"
              style={{ color: "var(--on-surface-variant)", marginTop: 4 }}
            >
              {t("settings.subtitle")}
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  margin: 0,
                  color: "var(--on-surface)",
                }}
              >
                {profileName}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--on-surface-variant)",
                  margin: "2px 0 6px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
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
            {t("settings.app_prefs")}
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
                  {t("settings.app_lang")}
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
                {t("common.edit")}
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
                        handleLangChange(l.value);
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
                {lang === "en" ? "Manage" : "Atur"}
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

            {/* Tanggal Reset Siklus Keuangan (Tanggal Gajian) */}
            <div className="settings-row" style={{ position: "relative" }}>
              <div>
                <p className="text-body-md" style={{ fontWeight: 600 }}>
                  {lang === "en" ? "Financial Cycle Reset Day (Payday)" : "Tanggal Reset Siklus (Gajian)"}
                </p>
                <p
                  className="text-body-sm"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  {cycleStartDay === 1
                    ? (lang === "en" ? "Every 1st of month (Calendar)" : "Setiap tanggal 1 (Awal Bulan)")
                    : (lang === "en" ? `Every ${cycleStartDay}th of month` : `Setiap tanggal ${cycleStartDay} (Siklus: Tgl ${cycleStartDay} s.d. ${cycleStartDay - 1})`)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTempSelectedDay(cycleStartDay);
                  setIsCycleModalOpen(true);
                }}
                style={{
                  background: "rgba(103, 80, 164, 0.06)",
                  padding: "8px 14px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  calendar_month
                </span>
                {t("common.edit")}
              </button>
            </div>

            {/* Notification Toggle 1 */}
            <div className="settings-row">
              <div>
                <p className="text-body-md" style={{ fontWeight: 600 }}>
                  {t("settings.notif_trans")}
                </p>
                <p
                  className="text-body-sm"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  {t("settings.notif_trans_sub")}
                </p>
              </div>
              <button
                type="button"
                className={`settings-toggle ${notifTransaksi ? "active" : ""}`}
                onClick={() => handleToggleNotifTransaksi(!notifTransaksi)}
                aria-label="Toggle notifikasi transaksi"
              />
            </div>

            {/* Notification Toggle 2 */}
            <div className="settings-row" style={{ borderBottom: "none" }}>
              <div>
                <p className="text-body-md" style={{ fontWeight: 600 }}>
                  {t("settings.notif_budget")}
                </p>
                <p
                  className="text-body-sm"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  {t("settings.notif_budget_sub")}
                </p>
              </div>
              <button
                type="button"
                className={`settings-toggle ${notifBudget ? "active" : ""}`}
                onClick={() => handleToggleNotifBudget(!notifBudget)}
                aria-label="Toggle pengingat budgeting"
              />
            </div>
          </section>

          {/* Section: Konfigurasi AI */}
          <h4 className="settings-section-title animate-fade-slide-up">
            {t("settings.ai_connectivity")}
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
                    {t("settings.ai_provider_config")}
                  </p>
                  <p
                    className="text-body-sm"
                    style={{ color: "var(--on-surface-variant)" }}
                  >
                    {t("settings.ai_provider_config_sub")}
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
            {t("settings.account_security")}
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
                    {t("settings.profile_info")}
                  </p>
                  <p
                    className="text-body-sm"
                    style={{ color: "var(--on-surface-variant)" }}
                  >
                    {t("settings.profile_sub")}
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
                    {t("settings.change_pw")}
                  </p>
                  <p
                    className="text-body-sm"
                    style={{ color: "var(--on-surface-variant)" }}
                  >
                    {t("settings.change_pw_sub")}
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
                  {t("settings.chat_history")}
                </p>
                <p
                  className="text-body-sm"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  {t("settings.chat_history_sub")}
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
            {t("settings.info_help")}
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
                    {t("settings.about")}
                  </p>
                  <p
                    className="text-body-sm"
                    style={{ color: "var(--on-surface-variant)" }}
                  >
                    {t("settings.about_sub")}
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
                  {t("settings.contact_support")}
                </p>
                <p
                  className="text-body-sm"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  {t("settings.contact_support_sub")}
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
              t("settings.logout")
            )}
          </button>
        </div>
      </main>

      <BottomNav />

      {/* Modal Pilih Tanggal Reset Siklus Keuangan / Gajian */}
      {isCycleModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(29, 27, 32, 0.55)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
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
              maxWidth: 420,
              background: "var(--surface-container-lowest, #ffffff)",
              borderRadius: 28,
              boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
              border: "1px solid rgba(203, 196, 210, 0.4)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* ── Modal Header ── */}
            <div
              style={{
                padding: "24px 24px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: "rgba(103, 80, 164, 0.1)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>calendar_month</span>
                </div>
                <div>
                  <h3 className="text-title-md" style={{ fontWeight: 700, margin: 0 }}>
                    {lang === "en" ? "Reset Date (Payday)" : "Tanggal Reset Siklus (Gajian)"}
                  </h3>
                  <p
                    className="text-body-xs"
                    style={{ color: "var(--on-surface-variant)", margin: 0, marginTop: 2 }}
                  >
                    {lang === "en"
                      ? "Select salary / reset date (1 to 28)"
                      : "Pilih tanggal gajian / reset bulanan (1 s.d. 28)"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCycleModalOpen(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,0.04)",
                  color: "var(--on-surface-variant)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            {/* ── Modal Body / Info & Grid ── */}
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Info Box Preview */}
              <div
                style={{
                  background: "rgba(103, 80, 164, 0.06)",
                  border: "1px solid rgba(103, 80, 164, 0.18)",
                  borderRadius: 16,
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>
                    {lang === "en" ? "Selected Cycle Start:" : "Tanggal Terpilih:"}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--primary)",
                      background: "white",
                      padding: "2px 10px",
                      borderRadius: 20,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                    }}
                  >
                    Tanggal {tempSelectedDay}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "var(--on-surface-variant)", margin: 0, marginTop: 4, lineHeight: 1.4 }}>
                  {tempSelectedDay === 1
                    ? (lang === "en" ? "Standard monthly calendar (1st - End of Month)." : "Siklus bulanan standar kalender (Tgl 1 s.d. Akhir Bulan).")
                    : (lang === "en"
                        ? `Monthly report & budget: ${tempSelectedDay}th of this month until ${tempSelectedDay - 1}th of next month.`
                        : `Laporan & budget bulanan: Tgl ${tempSelectedDay} bulan ini s.d. Tgl ${tempSelectedDay - 1} bulan depan.`)}
                </p>
              </div>

              {/* 7 Columns Calendar Day Grid (1 - 28) */}
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--on-surface)",
                    marginBottom: 10,
                  }}
                >
                  {lang === "en" ? "Pick a date (1 to 28):" : "Pilih Tanggal (1 - 28):"}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 8,
                  }}
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => {
                    const isSelected = tempSelectedDay === day;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setTempSelectedDay(day)}
                        style={{
                          aspectRatio: "1",
                          borderRadius: 14,
                          border: isSelected ? "none" : "1px solid rgba(203, 196, 210, 0.5)",
                          background: isSelected
                            ? "linear-gradient(135deg, var(--primary, #6750a4) 0%, #4f378b 100%)"
                            : "white",
                          color: isSelected ? "#ffffff" : "var(--on-surface)",
                          fontSize: 14,
                          fontWeight: isSelected ? 700 : 500,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: isSelected ? "0 4px 12px rgba(103, 80, 164, 0.35)" : "none",
                          transform: isSelected ? "scale(1.06)" : "scale(1)",
                          transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Modal Footer Buttons ── */}
            <div
              style={{
                padding: "16px 24px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 12,
                borderTop: "1px solid rgba(0,0,0,0.06)",
                background: "rgba(0,0,0,0.015)",
              }}
            >
              <button
                type="button"
                onClick={() => setIsCycleModalOpen(false)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 14,
                  border: "1px solid rgba(203, 196, 210, 0.5)",
                  background: "white",
                  color: "var(--on-surface-variant)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                disabled={isSavingCycleDay}
                onClick={() => handleCycleDayChange(tempSelectedDay)}
                style={{
                  padding: "10px 22px",
                  borderRadius: 14,
                  border: "none",
                  background: isSavingCycleDay
                    ? "rgba(103, 80, 164, 0.5)"
                    : "linear-gradient(135deg, var(--primary, #6750a4) 0%, #4f378b 100%)",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isSavingCycleDay ? "not-allowed" : "pointer",
                  boxShadow: isSavingCycleDay ? "none" : "0 4px 14px rgba(103, 80, 164, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {isSavingCycleDay ? (
                  <>
                    <span
                      className="material-symbols-outlined animate-spin"
                      style={{ fontSize: 18 }}
                    >
                      progress_activity
                    </span>
                    {lang === "en" ? "Saving..." : "Menyimpan..."}
                  </>
                ) : (
                  t("common.save")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
                {toastMessage || "Notifikasi"}
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
