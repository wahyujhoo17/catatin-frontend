"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Turnstile } from "@marsidev/react-turnstile";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sentVia, setSentVia] = useState<"email" | "phone">("email");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setError("");
    setIsLoading(true);
    try {
      const result = await forgotPassword(
        input.trim(),
        turnstileToken || undefined,
      );
      setSentVia(result.type || "email");
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
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 60,
                marginBottom: 16,
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                src="/logo/logo.png"
                alt="Catatin"
                fill
                sizes="240px"
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
              Masukkan email atau nomor telepon yang terdaftar untuk memulihkan
              kata sandi Anda.
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

                {/* Email / Phone Field */}
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
                    Email atau Nomor Telepon
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
                      alternate_email
                    </span>
                    <input
                      className="glass-input"
                      type="text"
                      required
                      placeholder="nama@email.com atau 0812xxxx"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                  </div>
                </div>

                {/* Turnstile — only in production */}
                {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Turnstile
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                      onSuccess={setTurnstileToken}
                      onError={() => setTurnstileToken(null)}
                      onExpire={() => setTurnstileToken(null)}
                      options={{ theme: "auto", size: "normal" }}
                    />
                  </div>
                )}

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
              /* ─── Success Step ──────────────────────────── */
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
                  Tautan pemulihan telah dikirim
                  {sentVia === "phone" ? " via WhatsApp" : ""} ke{" "}
                  <strong>{input}</strong>.
                </p>
                <p
                  className="text-body-sm"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  {sentVia === "phone"
                    ? "Cek WhatsApp Anda. Klik tautan di dalamnya untuk membuat kata sandi baru."
                    : "Cek kotak masuk (dan folder spam) email Anda. Klik tautan di dalamnya untuk membuat kata sandi baru."}
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
        <div
          style={{
            position: "relative",
            width: 100,
            height: 32,
            overflow: "hidden",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Image
            src="/logo/logo.png"
            alt="Catatin Logo"
            fill
            sizes="100px"
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
