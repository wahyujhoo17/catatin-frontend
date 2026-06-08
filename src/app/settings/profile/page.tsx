"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, token, updateUser } = useAuth();

  // ─── Profile state ──────────────────────────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── OTP flow state ─────────────────────────────────────
  const [step, setStep] = useState<"edit" | "otp">("edit");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [otpChannel, setOtpChannel] = useState<"email" | "whatsapp">("email");
  const [otpMasked, setOtpMasked] = useState("");
  const [otpError, setOtpError] = useState("");
  const [savedChanges, setSavedChanges] = useState<Record<string, string>>({});
  const [availableChannels, setAvailableChannels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setOriginalEmail(user.email || "");
      setOriginalPhone(user.phone || "");
    }
    if (typeof window !== "undefined") {
      const savedImage = localStorage.getItem("profile_image");
      if (savedImage) setProfileImage(savedImage);
    }
  }, [user]);

  const hasEmailChanged = email.trim() !== originalEmail;
  const hasPhoneChanged = phone.trim() !== originalPhone;
  const hasNameChanged = name.trim() !== (user?.name || "");

  // ─── Image handlers ─────────────────────────────────────
  const triggerFileInput = () => fileInputRef.current?.click();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem("profile_image", reader.result as string);
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── Save profile (request OTP) ─────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasNameChanged && !hasEmailChanged && !hasPhoneChanged) {
      setSuccessMsg("Tidak ada perubahan");
      setTimeout(() => setSuccessMsg(""), 2000);
      return;
    }

    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/settings/profile/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: hasNameChanged ? name.trim() : undefined,
          email: hasEmailChanged ? email.trim() : undefined,
          phone: hasPhoneChanged ? phone.trim() : undefined,
          channel: "email", // default, user bisa kirim ulang ke WA
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses permintaan");
      }

      if (data.directUpdate) {
        setSuccessMsg("Nama berhasil diubah!");
        setTimeout(() => router.push("/settings"), 1000);
        return;
      }

      setOtpChannel(data.channel);
      setOtpMasked(data.maskedTarget);
      setSavedChanges(data.changes);
      setAvailableChannels(data.availableChannels || []);
      setStep("otp");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan profil");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── OTP digit input handlers ───────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    setOtpError("");
    if (value && index < 3) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    if (!pasted) return;
    const next = [...otpDigits];
    for (let i = 0; i < 4; i++) next[i] = pasted[i] || "";
    setOtpDigits(next);
    setOtpError("");
    otpInputRefs.current[Math.min(pasted.length, 3)]?.focus();
  };

  // ─── Resend OTP to other channel ────────────────────────
  const handleResendOtp = async (newChannel: "email" | "whatsapp") => {
    setOtpError("");
    setOtpDigits(["", "", "", ""]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/settings/profile/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: hasNameChanged ? name.trim() : undefined,
          email: hasEmailChanged ? email.trim() : undefined,
          phone: hasPhoneChanged ? phone.trim() : undefined,
          channel: newChannel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim ulang OTP");
      }

      setOtpChannel(data.channel);
      setOtpMasked(data.maskedTarget);
      setSavedChanges(data.changes || {});
      setAvailableChannels(data.availableChannels || []);
      setSuccessMsg(
        `OTP telah dikirim ulang ke ${data.channel === "email" ? "email" : "WhatsApp"}`,
      );
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "Gagal mengirim ulang");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Verify OTP & confirm change ────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== 4) {
      setOtpError("Kode OTP harus 4 digit");
      return;
    }

    setOtpError("");
    setIsLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/settings/profile/confirm-change`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code, changes: savedChanges }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        const attemptsMsg =
          data.attemptsLeft !== undefined
            ? ` (${data.attemptsLeft}x tersisa)`
            : "";
        throw new Error(`${data.error}${attemptsMsg}`);
      }

      setSuccessMsg("Profil berhasil diperbarui!");
      // Perbarui AuthContext dan localStorage
      if (data.user) {
        updateUser(data.user);
      }
      setTimeout(() => router.push("/settings"), 1000);
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "Verifikasi gagal");
    } finally {
      setIsLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // OTP VERIFICATION SCREEN
  // ════════════════════════════════════════════════════════════
  if (step === "otp") {
    return (
      <div
        style={{
          backgroundColor: "var(--surface)",
          minHeight: "100dvh",
          paddingBottom: 40,
        }}
      >
        <header
          className="top-app-bar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 12,
          }}
        >
          <button
            onClick={() => setStep("edit")}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              display: "flex",
              alignItems: "center",
              color: "var(--primary)",
              cursor: "pointer",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 24 }}
            >
              arrow_back
            </span>
          </button>
          <h2
            className="text-headline-md"
            style={{
              color: "var(--on-surface)",
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            Verifikasi OTP
          </h2>
        </header>

        <main className="settings-main-container">
          <div
            className="glass-card animate-fade-slide-up"
            style={{
              padding: "32px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 48,
                color: "var(--primary)",
                marginBottom: 16,
              }}
            >
              {otpChannel === "whatsapp" ? "chat" : "mail"}
            </span>
            <p
              className="text-body-lg"
              style={{
                color: "var(--on-surface)",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Masukkan kode OTP untuk mengonfirmasi perubahan
            </p>
            <p
              className="text-body-sm"
              style={{
                color: "var(--on-surface-variant)",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              Kode dikirim via{" "}
              <strong>
                {otpChannel === "whatsapp" ? "WhatsApp" : "Email"}
              </strong>{" "}
              ke {otpMasked}
            </p>

            {successMsg && (
              <div
                className="animate-fade-in"
                style={{
                  color: "#34A853",
                  fontSize: 13,
                  background: "rgba(52, 168, 83, 0.08)",
                  padding: "12px 16px",
                  borderRadius: 12,
                  fontWeight: 600,
                  textAlign: "center",
                  marginBottom: 16,
                  width: "100%",
                }}
              >
                {successMsg}
              </div>
            )}

            <form
              onSubmit={handleVerifyOtp}
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {otpError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "var(--error-container)",
                    border: "1px solid rgba(186, 26, 26, 0.15)",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 20,
                      color: "var(--error)",
                      flexShrink: 0,
                    }}
                  >
                    error
                  </span>
                  <span
                    className="text-body-sm"
                    style={{ color: "var(--on-error-container)" }}
                  >
                    {otpError}
                  </span>
                </div>
              )}

              <div
                style={{ display: "flex", justifyContent: "center", gap: 12 }}
              >
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    autoFocus={index === 0}
                    style={{
                      width: 56,
                      height: 64,
                      fontSize: 28,
                      fontWeight: 700,
                      textAlign: "center",
                      borderRadius: 16,
                      border: otpError
                        ? "2px solid var(--error)"
                        : "2px solid var(--outline-variant)",
                      background: "rgba(255, 255, 255, 0.6)",
                      color: "var(--on-surface)",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      caretColor: "var(--primary)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--primary)";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(79, 55, 138, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = otpError
                        ? "var(--error)"
                        : "var(--outline-variant)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
                style={{
                  opacity: isLoading ? 0.7 : 1,
                  padding: "14px 16px",
                  borderRadius: 16,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {isLoading ? (
                  <>
                    <span
                      className="material-symbols-outlined"
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      progress_activity
                    </span>
                    Verifikasi...
                  </>
                ) : (
                  "Verifikasi OTP"
                )}
              </button>

              {/* Channel switcher — kirim ulang ke channel lain */}
              {availableChannels.length > 1 && (
                <div style={{ marginTop: 8, textAlign: "center" }}>
                  <span
                    className="text-body-sm"
                    style={{ color: "var(--on-surface-variant)", fontSize: 12 }}
                  >
                    Tidak menerima kode?{" "}
                  </span>
                  {availableChannels
                    .filter((ch) => ch !== otpChannel)
                    .map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() =>
                          handleResendOtp(ch as "email" | "whatsapp")
                        }
                        disabled={isLoading}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--primary)",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          textDecoration: "underline",
                          padding: "4px 8px",
                        }}
                      >
                        Kirim via {ch === "whatsapp" ? "WhatsApp" : "Email"}
                      </button>
                    ))}
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // EDIT PROFILE SCREEN
  // ════════════════════════════════════════════════════════════
  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        minHeight: "100dvh",
        paddingBottom: 40,
      }}
    >
      <header
        className="top-app-bar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 12,
        }}
      >
        <button
          onClick={() => router.push("/settings")}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            display: "flex",
            alignItems: "center",
            color: "var(--primary)",
            cursor: "pointer",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
            arrow_back
          </span>
        </button>
        <h2
          className="text-headline-md"
          style={{
            color: "var(--on-surface)",
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          Ubah Profil
        </h2>
      </header>

      <main className="settings-main-container">
        <div
          className="glass-card animate-fade-slide-up"
          style={{
            padding: "32px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Avatar */}
          <div style={{ position: "relative", marginBottom: 32 }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--primary-fixed-dim), var(--primary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                fontWeight: 700,
                color: "white",
                boxShadow: "0 8px 24px rgba(79, 55, 138, 0.2)",
                overflow: "hidden",
                border: "4px solid rgba(255, 255, 255, 0.5)",
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <button
              type="button"
              onClick={triggerFileInput}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "var(--primary)",
                border: "3px solid var(--surface-container-highest)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                padding: 0,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                photo_camera
              </span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>

          <form
            onSubmit={handleSave}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              width: "100%",
            }}
          >
            {successMsg && (
              <div
                className="animate-fade-in"
                style={{
                  color: successMsg.includes("berhasil")
                    ? "#34A853"
                    : "var(--primary)",
                  fontSize: 13,
                  background: successMsg.includes("berhasil")
                    ? "rgba(52, 168, 83, 0.08)"
                    : "rgba(79, 55, 138, 0.08)",
                  padding: "12px 16px",
                  borderRadius: 12,
                  fontWeight: 600,
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                {successMsg}
              </div>
            )}

            {/* Nama */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--on-surface-variant)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  paddingLeft: 4,
                }}
              >
                Nama Lengkap
              </label>
              <input
                type="text"
                className="glass-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Budi Santoso"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "14px 16px",
                  fontSize: 14,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                }}
              />
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--on-surface-variant)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  paddingLeft: 4,
                }}
              >
                Alamat Email
              </label>
              <input
                type="email"
                className="glass-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="budi.santoso@email.com"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "14px 16px",
                  fontSize: 14,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  borderColor: hasEmailChanged ? "var(--primary)" : undefined,
                }}
              />
              {hasEmailChanged && (
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--primary)",
                    paddingLeft: 4,
                  }}
                >
                  ⚡ Verifikasi identitas diperlukan
                </span>
              )}
            </div>

            {/* Phone */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--on-surface-variant)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  paddingLeft: 4,
                }}
              >
                Nomor Telepon
              </label>
              <input
                type="tel"
                className="glass-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "14px 16px",
                  fontSize: 14,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  borderColor: hasPhoneChanged ? "var(--primary)" : undefined,
                }}
              />
              {hasPhoneChanged && (
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--primary)",
                    paddingLeft: 4,
                  }}
                >
                  ⚡ Verifikasi identitas diperlukan
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => router.push("/settings")}
                className="btn-secondary"
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: 16,
                  fontSize: 14,
                  fontWeight: 600,
                  border: "1px solid rgba(203, 196, 210, 0.5)",
                  background: "rgba(255, 255, 255, 0.4)",
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: 16,
                  fontSize: 14,
                  fontWeight: 600,
                  boxShadow: "0 8px 20px rgba(79, 55, 138, 0.25)",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? "Mengirim..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
