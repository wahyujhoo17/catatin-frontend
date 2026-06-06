"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { verifyOtp } = useAuth();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const MAX_ATTEMPTS = 3;
  const [attempts, setAttempts] = useState(0);

  // Get email and registration type from localStorage (set during registration)
  const [email, setEmail] = useState("");
  const [registrationType, setRegistrationType] = useState<"email" | "phone">(
    "email",
  );
  const [registrationInput, setRegistrationInput] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("pending_email");
    if (stored) setEmail(stored);
    const type = localStorage.getItem("registration_type");
    if (type === "phone") setRegistrationType("phone");
    const input = localStorage.getItem("registration_input");
    if (input) setRegistrationInput(input);
    // Auto focus first input on load
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (error) setError("");
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== "" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (isLocked || code.length < 4 || !email) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= MAX_ATTEMPTS) {
      setIsLocked(true);
      setError(
        `Anda telah mencapai ${MAX_ATTEMPTS}x percobaan. Akun Anda terkunci sementara. Silakan coba lagi nanti.`,
      );
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      await verifyOtp(email, code);
      localStorage.removeItem("pending_email");
      localStorage.removeItem("registration_type");
      localStorage.removeItem("registration_input");
      router.push("/workspace");
    } catch (err: unknown) {
      const remaining = MAX_ATTEMPTS - newAttempts;
      setError(
        err instanceof Error
          ? err.message
          : `Kode OTP salah. Sisa percobaan: ${remaining}x`,
      );
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="mesh-bg"
      style={{ minHeight: "100dvh", position: "relative", overflow: "hidden" }}
    >
      {/* Ambient Background Spheres */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          className="ambient-sphere"
          style={{
            width: 500,
            height: 500,
            background: "rgba(79, 55, 138, 0.1)",
            top: -100,
            left: -100,
          }}
        />
        <div
          className="ambient-sphere"
          style={{
            width: 600,
            height: 600,
            background: "rgba(99, 89, 124, 0.1)",
            bottom: -150,
            right: -150,
            animationDelay: "1s",
          }}
        />
        <div
          className="ambient-sphere"
          style={{
            width: 300,
            height: 300,
            background: "rgba(118, 91, 0, 0.08)",
            top: "20%",
            right: "10%",
            animationDelay: "2s",
          }}
        />
      </div>

      <main
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="animate-fade-slide-up"
          style={{
            width: "100%",
            maxWidth: 448,
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ position: "relative", width: "100%", height: 60, marginBottom: 16, overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Image
                src="/logo/logo.png"
                alt="Catetin"
                width={240}
                height={240}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
            <h1
              className="text-headline-lg-mobile"
              style={{ color: "var(--on-surface)" }}
            >
              {registrationType === "phone"
                ? "Verifikasi Telepon"
                : "Verifikasi Email"}
            </h1>
            <p
              className="text-body-lg"
              style={{ color: "var(--on-surface-variant)", maxWidth: 320 }}
            >
              {registrationType === "phone"
                ? `Masukkan 4 digit kode OTP yang telah kami kirimkan ke ${registrationInput || "WhatsApp Anda"}.`
                : "Masukkan 4 digit kode OTP yang telah kami kirimkan ke email Anda."}
            </p>
          </div>

          {/* OTP Form */}
          <form
            onSubmit={handleSubmit}
            className="glass-card-elevated"
            style={{
              padding: "var(--card-padding)",
              display: "flex",
              flexDirection: "column",
              gap: 32,
            }}
          >
            {/* Error Message */}
            {error && (
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
                  style={{ fontSize: 20, color: "var(--error)", flexShrink: 0 }}
                >
                  {isLocked ? "lock" : "warning"}
                </span>
                <p
                  className="text-body-sm"
                  style={{ color: "var(--on-error-container)", margin: 0 }}
                >
                  {error}
                </p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  style={{
                    width: 60,
                    height: 72,
                    fontSize: 28,
                    fontWeight: 700,
                    textAlign: "center",
                    borderRadius: 16,
                    border: error
                      ? "2px solid var(--error)"
                      : "2px solid var(--outline-variant)",
                    background: "var(--surface-container-lowest)",
                    color: "var(--on-surface)",
                    boxShadow: error
                      ? "0 0 0 4px rgba(186, 26, 26, 0.08)"
                      : "0 2px 8px rgba(0,0,0,0.04)",
                    outline: "none",
                    transition:
                      "border-color 0.2s, box-shadow 0.2s, background 0.2s",
                  }}
                  className="focus-ring"
                  disabled={isLocked}
                />
              ))}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={otp.join("").length < 4 || isLocked || isLoading}
              style={{
                opacity:
                  otp.join("").length < 4 || isLocked || isLoading ? 0.7 : 1,
                cursor: isLocked ? "not-allowed" : undefined,
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
                  Memverifikasi...
                </>
              ) : (
                <>
                  Verifikasi Kode
                  <span className="material-symbols-outlined">
                    check_circle
                  </span>
                </>
              )}
            </button>

            {/* Resend Code */}
            <div style={{ textAlign: "center", marginTop: -8 }}>
              <p
                className="text-body-sm"
                style={{ color: "var(--on-surface-variant)" }}
              >
                Belum menerima kode?{" "}
                <button
                  type="button"
                  disabled={isLocked}
                  style={{
                    background: "none",
                    border: "none",
                    color: isLocked ? "var(--outline)" : "var(--primary)",
                    fontWeight: 600,
                    cursor: isLocked ? "not-allowed" : "pointer",
                    padding: 0,
                    opacity: isLocked ? 0.5 : 1,
                  }}
                  onClick={async () => {
                    if (!email) {
                      alert("Email tidak ditemukan. Silakan daftar ulang.");
                      router.push("/register");
                      return;
                    }
                    try {
                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/auth/forgot-password`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email }),
                        },
                      );
                      const data = await res.json();
                      if (res.ok) {
                        alert("Kode OTP baru telah dikirim ke email Anda!");
                      } else {
                        alert(data.error || "Gagal mengirim ulang OTP");
                      }
                    } catch {
                      alert("Gagal mengirim ulang OTP. Periksa koneksi Anda.");
                    }
                  }}
                >
                  Kirim ulang
                </button>
              </p>
            </div>
          </form>

          {/* Footer */}
          <p
            className="text-body-md"
            style={{ textAlign: "center", color: "var(--on-surface-variant)" }}
          >
            <Link
              href="/login"
              style={{
                color: "var(--outline)",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                arrow_back
              </span>
              Kembali ke Login
            </Link>
          </p>
        </div>
      </main>

      {/* Desktop Watermark */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 6,
          opacity: 0.4,
        }}
        className="hidden-mobile"
      >
        <div style={{ position: "relative", width: 100, height: 32, overflow: "hidden", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <Image
            src="/logo/logo.png"
            alt="Catetin Logo"
            width={120}
            height={120}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
        <p
          className="text-label-md"
          style={{ color: "var(--outline)", margin: 0 }}
        >
          Financial Intelligence
        </p>
      </div>
    </div>
  );
}
