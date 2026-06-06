"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError("");
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal mengirim tautan reset",
      );
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
            maxWidth: 480,
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
                alt="Catatin"
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
              Lupa Kata Sandi
            </h1>
            <p
              className="text-body-lg"
              style={{ color: "var(--on-surface-variant)", maxWidth: 320 }}
            >
              Masukkan email yang terdaftar untuk menerima tautan pemulihan kata
              sandi.
            </p>
          </div>

          {/* Form Card */}
          <div
            className="glass-card-elevated"
            style={{
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            {!submitted ? (
              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
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
                      {error}
                    </span>
                  </div>
                )}

                {/* Email Field */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <label
                    className="text-label-md"
                    style={{
                      color: "var(--on-surface-variant)",
                      textTransform: "uppercase",
                      marginLeft: 4,
                    }}
                  >
                    Alamat Email
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        position: "absolute",
                        left: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--outline)",
                      }}
                    >
                      mail
                    </span>
                    <input
                      className="glass-input"
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                  style={{ opacity: isLoading ? 0.7 : 1 }}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="material-symbols-outlined"
                        style={{ animation: "spin 1s linear infinite" }}
                      >
                        progress_activity
                      </span>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      Kirim Tautan Reset
                      <span
                        className="material-symbols-outlined"
                        style={{ transition: "transform 0.2s" }}
                      >
                        send
                      </span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div
                className="animate-fade-in"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  textAlign: "center",
                  padding: "16px 0",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 48, color: "#34A853" }}
                >
                  check_circle
                </span>
                <p
                  className="text-body-lg"
                  style={{ color: "var(--on-surface)" }}
                >
                  Tautan pemulihan telah dikirim ke <strong>{email}</strong>.
                </p>
                <p
                  className="text-body-sm"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  Cek kotak masuk (dan folder spam) email Anda. Klik tautan di
                  dalamnya untuk membuat kata sandi baru.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center" }}>
            <Link
              href="/login"
              className="text-body-md"
              style={{
                color: "var(--outline)",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                arrow_back
              </span>
              Kembali ke Halaman Login
            </Link>
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
        <div style={{ position: "relative", width: 100, height: 32, overflow: "hidden", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <Image
            src="/logo/logo.png"
            alt="Catatin Logo"
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
