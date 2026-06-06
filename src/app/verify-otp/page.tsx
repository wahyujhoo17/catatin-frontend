"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Auto focus first input on load
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to focus previous input
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 4) {
      // Logic for verifying OTP here
      router.push("/workspace");
    }
  };

  return (
    <div className="mesh-bg" style={{ minHeight: "100dvh", position: "relative", overflow: "hidden" }}>
      {/* Ambient Background Spheres */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div
          className="ambient-sphere"
          style={{ width: 500, height: 500, background: "rgba(79, 55, 138, 0.1)", top: -100, left: -100 }}
        />
        <div
          className="ambient-sphere"
          style={{ width: 600, height: 600, background: "rgba(99, 89, 124, 0.1)", bottom: -150, right: -150, animationDelay: "1s" }}
        />
        <div
          className="ambient-sphere"
          style={{ width: 300, height: 300, background: "rgba(118, 91, 0, 0.08)", top: "20%", right: "10%", animationDelay: "2s" }}
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
          style={{ width: "100%", maxWidth: 448, display: "flex", flexDirection: "column", gap: 32 }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Image
              src="/logo/logo.png"
              alt="Catetin"
              width={180}
              height={60}
              style={{ objectFit: "contain", marginBottom: 8, width: "auto", height: "auto" }}
              priority
            />
            <div style={{
              width: 64, height: 64, borderRadius: "50%", background: "var(--surface-container-high)", 
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8,
              border: "1px solid rgba(203, 196, 210, 0.3)"
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--primary)" }}>
                mark_email_read
              </span>
            </div>
            <h1 className="text-headline-lg-mobile" style={{ color: "var(--on-surface)" }}>
              Verifikasi Email
            </h1>
            <p className="text-body-lg" style={{ color: "var(--on-surface-variant)", maxWidth: 320 }}>
              Masukkan 4 digit kode OTP yang telah kami kirimkan ke email Anda.
            </p>
          </div>

          {/* OTP Form */}
          <form
            onSubmit={handleSubmit}
            className="glass-card-elevated"
            style={{ padding: "var(--card-padding)", display: "flex", flexDirection: "column", gap: 32 }}
          >
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
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
                    border: "1px solid var(--glass-border)",
                    background: "rgba(255, 255, 255, 0.5)",
                    color: "var(--on-surface)",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
                  }}
                  className="focus-ring"
                />
              ))}
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={otp.join("").length < 4}
              style={{ opacity: otp.join("").length < 4 ? 0.7 : 1 }}
            >
              Verifikasi Kode
              <span className="material-symbols-outlined">check_circle</span>
            </button>
            
            {/* Resend Code */}
            <div style={{ textAlign: "center", marginTop: -8 }}>
              <p className="text-body-sm" style={{ color: "var(--on-surface-variant)" }}>
                Belum menerima kode?{" "}
                <button 
                  type="button"
                  style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", padding: 0 }}
                  onClick={() => alert("Kode OTP baru telah dikirim!")}
                >
                  Kirim ulang
                </button>
              </p>
            </div>
          </form>

          {/* Footer */}
          <p className="text-body-md" style={{ textAlign: "center", color: "var(--on-surface-variant)" }}>
            <Link href="/login" style={{ color: "var(--outline)", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
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
        <Image
          src="/logo/logo.png"
          alt="Catetin Logo"
          width={100}
          height={32}
          style={{ width: "auto", height: "auto" }}
          priority
        />
        <p className="text-label-md" style={{ color: "var(--outline)", margin: 0 }}>Financial Intelligence</p>
      </div>
    </div>
  );
}
