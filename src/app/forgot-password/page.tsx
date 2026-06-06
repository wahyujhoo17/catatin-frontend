"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
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
            <Image
              src="/logo/logo.png"
              alt="Catetin"
              width={180}
              height={60}
              style={{
                objectFit: "contain",
                marginBottom: 8,
                width: "auto",
                height: "auto",
              }}
              priority
            />
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
                <button type="submit" className="btn-primary">
                  Kirim Tautan Reset
                  <span
                    className="material-symbols-outlined"
                    style={{ transition: "transform 0.2s" }}
                  >
                    send
                  </span>
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
                  Anda akan dialihkan ke halaman Login dalam beberapa saat...
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
        <Image
          src="/logo/logo.png"
          alt="Catetin Logo"
          width={100}
          height={32}
          style={{ width: "auto", height: "auto" }}
          priority
        />
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
