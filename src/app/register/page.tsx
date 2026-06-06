"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/workspace");
  };

  return (
    <div style={{ minHeight: "100dvh", position: "relative", overflow: "hidden" }}>
      {/* Mesh Gradient Background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          background: `
            radial-gradient(at 0% 0%, rgba(207, 188, 255, 0.3) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(225, 212, 253, 0.3) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(233, 221, 255, 0.2) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(207, 188, 255, 0.2) 0px, transparent 50%)
          `,
          backgroundColor: "var(--surface)",
        }}
      />

      {/* Decorative Background Blurs */}
      <div
        style={{
          position: "fixed", top: 80, right: -80, width: 320, height: 320,
          background: "rgba(79, 55, 138, 0.1)", borderRadius: "50%",
          filter: "blur(100px)", pointerEvents: "none", zIndex: -1,
        }}
      />
      <div
        style={{
          position: "fixed", bottom: -80, left: -80, width: 320, height: 320,
          background: "rgba(99, 89, 124, 0.1)", borderRadius: "50%",
          filter: "blur(100px)", pointerEvents: "none", zIndex: -1,
        }}
      />

      <main
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
        }}
      >
        <div
          className="animate-fade-slide-up"
          style={{ width: "100%", maxWidth: 448, display: "flex", flexDirection: "column", gap: 32 }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Image
              src="/logo/logo.png"
              alt="Catetin"
              width={180}
              height={60}
              style={{ objectFit: "contain", marginBottom: 8 }}
              priority
            />
            <h1 className="text-headline-lg-mobile" style={{ color: "var(--on-surface)" }}>
              Mulai Catat Sekarang
            </h1>
            <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>
              Satu akun untuk semua kebutuhan finansialmu
            </p>
          </div>

          {/* Register Form */}
          <form
            onSubmit={handleSubmit}
            className="glass-card"
            style={{ padding: "var(--card-padding)", display: "flex", flexDirection: "column", gap: 24 }}
          >
            {/* Nama Lengkap */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label className="text-label-md" style={{ color: "var(--on-surface-variant)", textTransform: "uppercase", marginLeft: 4 }}>
                Nama Lengkap
              </label>
              <div style={{ position: "relative" }}>
                <span className="material-symbols-outlined" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--outline)" }}>
                  person
                </span>
                <input
                  className="glass-input"
                  type="text"
                  placeholder="Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  id="register-name"
                />
              </div>
            </div>

            {/* Email / Telepon */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label className="text-label-md" style={{ color: "var(--on-surface-variant)", textTransform: "uppercase", marginLeft: 4 }}>
                Email atau Nomor Telepon
              </label>
              <div style={{ position: "relative" }}>
                <span className="material-symbols-outlined" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--outline)" }}>
                  alternate_email
                </span>
                <input
                  className="glass-input"
                  type="text"
                  placeholder="contoh@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="register-email"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label className="text-label-md" style={{ color: "var(--on-surface-variant)", textTransform: "uppercase", marginLeft: 4 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <span className="material-symbols-outlined" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--outline)" }}>
                  lock
                </span>
                <input
                  className="glass-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: 48 }}
                  id="register-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "var(--outline)", background: "none", border: "none", cursor: "pointer" }}
                  aria-label="Toggle password"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* T&C Checkbox */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "4px 0" }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{
                  width: 20, height: 20, borderRadius: 4,
                  accentColor: "var(--primary)", cursor: "pointer",
                  marginTop: 2,
                }}
                id="register-terms"
              />
              <label htmlFor="register-terms" className="text-body-sm" style={{ color: "var(--on-surface-variant)", cursor: "pointer" }}>
                Saya menyetujui{" "}
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>Syarat & Ketentuan</span>{" "}
                serta{" "}
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>Kebijakan Privasi</span>{" "}
                yang berlaku.
              </label>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-primary" id="register-submit">
              Daftar
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(203, 196, 210, 0.3)" }} />
              <span className="text-label-md" style={{ color: "var(--outline)", textTransform: "uppercase" }}>
                Atau Daftar Dengan
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(203, 196, 210, 0.3)" }} />
            </div>

            {/* Social Registration */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <button type="button" className="btn-secondary" style={{ borderRadius: 12 }} id="register-google">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-label-md">Google</span>
              </button>
              <button type="button" className="btn-secondary" style={{ borderRadius: 12 }} id="register-apple">
                <span className="material-symbols-outlined">apps</span>
                <span className="text-label-md">Apple</span>
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="text-body-md" style={{ textAlign: "center", color: "var(--on-surface-variant)" }}>
            Sudah punya akun?{" "}
            <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>
              Masuk
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
          style={{ height: "32px", width: "auto", objectFit: "contain" }}
          priority
        />
        <p className="text-label-md" style={{ color: "var(--outline)", margin: 0 }}>Financial Intelligence</p>
      </div>
    </div>
  );
}
