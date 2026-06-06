"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect kalau tidak ada token
  useEffect(() => {
    if (!token) {
      router.push("/forgot-password");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("Harap isi semua field");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return null;

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
              Buat Kata Sandi Baru
            </h1>
            <p
              className="text-body-lg"
              style={{ color: "var(--on-surface-variant)", maxWidth: 320 }}
            >
              Masukkan kata sandi baru untuk akun Anda.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="glass-card-elevated"
            style={{
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 28,
            }}
          >
            {/* Success Message */}
            {success && (
              <div
                className="animate-fade-in"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  textAlign: "center",
                  padding: "8px 0",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 48, color: "#34A853" }}
                >
                  check_circle
                </span>
                <p
                  className="text-body-md"
                  style={{ color: "var(--on-surface)" }}
                >
                  Password berhasil direset! Anda akan dialihkan ke halaman
                  login...
                </p>
              </div>
            )}

            {!success && (
              <>
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

                {/* New Password Field */}
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
                    Kata Sandi Baru
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
                      lock
                    </span>
                    <input
                      className="glass-input"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Minimal 6 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        color: "var(--outline)",
                      }}
                      aria-label="Toggle password visibility"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
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
                    Konfirmasi Kata Sandi
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
                      lock_reset
                    </span>
                    <input
                      className="glass-input"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Masukkan ulang kata sandi"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Mereset...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <span
                        className="material-symbols-outlined"
                        style={{ transition: "transform 0.2s" }}
                      >
                        check
                      </span>
                    </>
                  )}
                </button>
              </>
            )}
          </form>

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
              Kembali ke Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ animation: "spin 1s linear infinite", fontSize: 32 }}
          >
            progress_activity
          </span>
        </div>
      }
    >
      <ResetForm />
    </Suspense>
  );
}
