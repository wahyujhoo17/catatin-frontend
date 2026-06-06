"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password baru harus minimal 6 karakter.");
      return;
    }

    setError("");
    setSuccess(true);
    setTimeout(() => {
      router.push("/settings");
    }, 1200);
  };

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(207, 188, 255, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(231, 195, 101, 0.1) 0px, transparent 50%)
        `,
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        minHeight: "100dvh",
        paddingBottom: 40,
      }}
    >
      {/* Header */}
      <header className="top-app-bar" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/settings" style={{ display: "flex", alignItems: "center", color: "var(--primary)", textDecoration: "none" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>arrow_back</span>
        </Link>
        <h2 className="text-headline-md" style={{ color: "var(--on-surface)", margin: 0, fontSize: 18, fontWeight: 700 }}>Ganti Kata Sandi</h2>
      </header>

      <main style={{ marginTop: 72, padding: "20px var(--container-margin)", maxWidth: 672, margin: "72px auto 0" }}>
        <div className="glass-card animate-fade-slide-up" style={{ padding: "var(--card-padding)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {error && (
              <div style={{ color: "var(--error)", fontSize: 13, background: "var(--error-container)", padding: "10px 14px", borderRadius: 12 }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ color: "var(--primary)", fontSize: 13, background: "rgba(79, 55, 138, 0.08)", padding: "10px 14px", borderRadius: 12, fontWeight: 500 }}>
                Password berhasil diperbarui! Mengalihkan...
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Kata Sandi Lama</label>
              <input
                type="password"
                className="glass-input"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", fontSize: 13, height: 42 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Kata Sandi Baru</label>
              <input
                type="password"
                className="glass-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Minimal 6 karakter"
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", fontSize: 13, height: 42 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Konfirmasi Kata Sandi Baru</label>
              <input
                type="password"
                className="glass-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Ulangi kata sandi baru"
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", fontSize: 13, height: 42 }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <Link
                href="/settings"
                className="btn-secondary"
                style={{ flex: 1, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                Batal
              </Link>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: "none" }}
                disabled={success}
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
