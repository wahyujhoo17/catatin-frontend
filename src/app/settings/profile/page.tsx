"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("Budi Santoso");
  const [email, setEmail] = useState("budi.santoso@gmail.com");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("profile_name");
      const savedEmail = localStorage.getItem("profile_email");
      const savedImage = localStorage.getItem("profile_image");
      
      if (savedName) setName(savedName);
      if (savedEmail) setEmail(savedEmail);
      if (savedImage) setProfileImage(savedImage);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("profile_name", name);
      localStorage.setItem("profile_email", email);
      if (profileImage) {
        localStorage.setItem("profile_image", profileImage);
      }
    }
    setIsSaved(true);
    setTimeout(() => {
      router.push("/settings");
    }, 1000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        minHeight: "100dvh",
        paddingBottom: 40,
      }}
    >
      {/* Header */}
      <header className="top-app-bar" style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 12 }}>
        <button onClick={() => router.push("/settings")} style={{ background: "none", border: "none", padding: 0, display: "flex", alignItems: "center", color: "var(--primary)", cursor: "pointer" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>arrow_back</span>
        </button>
        <h2 className="text-headline-md" style={{ color: "var(--on-surface)", margin: 0, fontSize: 16, fontWeight: 700 }}>Ubah Profil</h2>
      </header>

      <main className="settings-main-container">
        <div className="glass-card animate-fade-slide-up" style={{ padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          {/* Avatar / Profile Picture Section */}
          <div style={{ position: "relative", marginBottom: 32 }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary-fixed-dim), var(--primary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                fontWeight: 700,
                color: "white",
                boxShadow: "0 8px 24px rgba(79, 55, 138, 0.2)",
                overflow: "hidden",
                border: "4px solid rgba(255, 255, 255, 0.5)"
              }}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <button
              type="button"
              onClick={triggerFileInput}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "var(--primary)",
                border: "3px solid var(--surface-container-highest)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                padding: 0
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>photo_camera</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
            {isSaved && (
              <div className="animate-fade-in" style={{ color: "var(--primary)", fontSize: 13, background: "rgba(79, 55, 138, 0.08)", padding: "12px 16px", borderRadius: 12, fontWeight: 600, textAlign: "center", marginBottom: 8 }}>
                Profil berhasil disimpan! Mengalihkan...
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.08em", paddingLeft: 4 }}>Nama Lengkap</label>
              <input
                type="text"
                className="glass-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Budi Santoso"
                style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", fontSize: 14, height: 48, borderRadius: 16, backgroundColor: "rgba(255, 255, 255, 0.6)" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.08em", paddingLeft: 4 }}>Alamat Email</label>
              <input
                type="email"
                className="glass-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="budi.santoso@email.com"
                style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", fontSize: 14, height: 48, borderRadius: 16, backgroundColor: "rgba(255, 255, 255, 0.6)" }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => router.push("/settings")}
                className="btn-secondary"
                style={{ flex: 1, padding: "14px 16px", borderRadius: 16, fontSize: 14, fontWeight: 600, border: "1px solid rgba(203, 196, 210, 0.5)", background: "rgba(255, 255, 255, 0.4)" }}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1, padding: "14px 16px", borderRadius: 16, fontSize: 14, fontWeight: 600, boxShadow: "0 8px 20px rgba(79, 55, 138, 0.25)" }}
                disabled={isSaved}
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
