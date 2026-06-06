"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("Budi Santoso");
  const [email, setEmail] = useState("budi.santoso@gmail.com");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("profile_name");
      const savedEmail = localStorage.getItem("profile_email");
      if (savedName) setName(savedName);
      if (savedEmail) setEmail(savedEmail);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("profile_name", name);
      localStorage.setItem("profile_email", email);
    }
    setIsSaved(true);
    setTimeout(() => {
      router.push("/settings");
    }, 1000);
  };

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(207, 188, 255, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(231, 195, 101, 0.1) 0px, transparent 50%)
        `,
        minHeight: "100dvh",
        paddingBottom: 128,
      }}
    >
      {/* Header */}
      <header className="top-app-bar" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/settings" style={{ display: "flex", alignItems: "center", color: "var(--primary)", textDecoration: "none" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>arrow_back</span>
        </Link>
        <h2 className="text-headline-md" style={{ color: "var(--on-surface)", margin: 0, fontSize: 18, fontWeight: 700 }}>Ubah Profil</h2>
      </header>

      <main style={{ marginTop: 72, padding: "20px var(--container-margin)", maxWidth: 672, margin: "72px auto 0" }}>
        <div className="glass-card animate-fade-slide-up" style={{ padding: "var(--card-padding)" }}>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {isSaved && (
              <div style={{ color: "var(--primary)", fontSize: 13, background: "rgba(79, 55, 138, 0.08)", padding: "10px 14px", borderRadius: 12, fontWeight: 500 }}>
                Profil berhasil disimpan! Mengalihkan...
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label className="text-label-md" style={{ color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Nama Lengkap</label>
              <input
                type="text"
                className="glass-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Budi Santoso"
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label className="text-label-md" style={{ color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Alamat Email</label>
              <input
                type="email"
                className="glass-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="budi.santoso@email.com"
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <Link
                href="/settings"
                className="btn-secondary"
                style={{ flex: 1, padding: 14, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                Batal
              </Link>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1, padding: 14, boxShadow: "none" }}
                disabled={isSaved}
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
