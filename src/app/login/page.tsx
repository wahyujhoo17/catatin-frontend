"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/workspace");
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

      {/* Main Content */}
      <main
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="animate-fade-slide-up"
          style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 32 }}
        >
          {/* Brand Anchor */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>
            <Image
              src="/logo/logo.png"
              alt="Catetin"
              width={180}
              height={60}
              style={{ objectFit: "contain", marginBottom: 8 }}
              priority
            />
            <h1 className="text-headline-lg-mobile" style={{ color: "var(--on-surface)" }}>
              Selamat Datang Kembali
            </h1>
            <p className="text-body-lg" style={{ color: "var(--on-surface-variant)", maxWidth: 320 }}>
              Masuk untuk mengelola keuangan bisnis dan pribadimu
            </p>
          </div>

          {/* Login Card */}
          <div className="glass-card-elevated" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Email Field */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label className="text-label-md" style={{ color: "var(--on-surface-variant)", textTransform: "uppercase", marginLeft: 4 }}>
                  Email atau No. Telepon
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--outline)" }}
                  >
                    mail
                  </span>
                  <input
                    className="glass-input"
                    type="text"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="login-email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
                  <label className="text-label-md" style={{ color: "var(--on-surface-variant)", textTransform: "uppercase" }}>
                    Kata Sandi
                  </label>
                  <Link
                    href="#"
                    className="text-label-md"
                    style={{ color: "var(--primary)" }}
                  >
                    Lupa Password?
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--outline)" }}
                  >
                    lock
                  </span>
                  <input
                    className="glass-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: 48 }}
                    id="login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--outline)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    aria-label="Toggle password"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-primary" id="login-submit">
                Masuk
                <span className="material-symbols-outlined" style={{ transition: "transform 0.2s" }}>
                  arrow_forward
                </span>
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(203, 196, 210, 0.3)" }} />
              <span className="text-label-md" style={{ color: "var(--outline)" }}>
                atau masuk dengan
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(203, 196, 210, 0.3)" }} />
            </div>

            {/* Google Login */}
            <button
              className="btn-secondary"
              style={{ width: "100%", padding: "16px 24px", borderRadius: 16 }}
              id="login-google"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Masuk dengan Google
            </button>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 16 }}>
            <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>
              Belum punya akun?{" "}
              <Link href="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>
                Daftar sekarang
              </Link>
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, paddingTop: 8 }}>
              <Link href="#" className="text-label-md" style={{ color: "var(--outline)" }}>Privasi</Link>
              <Link href="#" className="text-label-md" style={{ color: "var(--outline)" }}>Syarat & Ketentuan</Link>
              <Link href="#" className="text-label-md" style={{ color: "var(--outline)" }}>Bantuan</Link>
            </div>
          </div>
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
