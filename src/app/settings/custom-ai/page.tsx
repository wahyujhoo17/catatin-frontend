"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";

interface AIProviderItem {
  id: string;
  name: string;
  type: string; // 'text' | 'image' | 'voice'
  provider: string; // 'openai' | 'gemini' | 'claude' | 'ollama' | 'whisper' | 'google' | 'custom'
  key: string;
  url: string;
  active: boolean;
}

const defaultProviders: AIProviderItem[] = [
  { id: "1", name: "Default Text AI", type: "text", provider: "openai", key: "••••••••••••", url: "https://api.openai.com/v1", active: true },
  { id: "2", name: "Gemini Vision Scanner", type: "image", provider: "gemini", key: "••••••••••••", url: "", active: true },
  { id: "3", name: "Whisper Audio Input", type: "voice", provider: "whisper", key: "••••••••••••", url: "", active: true }
];

export default function CustomAIPage() {
  const [providers, setProviders] = useState<AIProviderItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("text"); // 'text' | 'image' | 'voice'
  const [formProvider, setFormProvider] = useState("openai");
  const [formKey, setFormKey] = useState("");
  const [formUrl, setFormUrl] = useState("");

  // Custom Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("custom_ai_providers_list");
      if (saved) {
        try {
          setProviders(JSON.parse(saved));
        } catch (e) {
          setProviders(defaultProviders);
        }
      } else {
        setProviders(defaultProviders);
        localStorage.setItem("custom_ai_providers_list", JSON.stringify(defaultProviders));
      }
    }
  }, []);

  const saveToStorage = (updatedList: AIProviderItem[]) => {
    setProviders(updatedList);
    if (typeof window !== "undefined") {
      localStorage.setItem("custom_ai_providers_list", JSON.stringify(updatedList));
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = providers.map(p => {
      // If we activate a provider, we might want to deactivate others of the same type
      if (p.id === id) {
        const nextActive = !p.active;
        return { ...p, active: nextActive };
      }
      return p;
    });
    
    // Auto deactivate other providers of the same type if this one becomes active
    const activeItem = updated.find(p => p.id === id);
    if (activeItem && activeItem.active) {
      updated.forEach(p => {
        if (p.id !== id && p.type === activeItem.type) {
          p.active = false;
        }
      });
    }
    
    saveToStorage(updated);
  };

  const handleDelete = (id: string) => {
    const updated = providers.filter(p => p.id !== id);
    saveToStorage(updated);
  };

  const handleAddOrEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let updated: AIProviderItem[];
    if (editingId) {
      updated = providers.map(p => {
        if (p.id === editingId) {
          return {
            ...p,
            name: formName,
            type: formType,
            provider: formProvider,
            key: formKey || p.key,
            url: formUrl
          };
        }
        return p;
      });
      setSuccessMsg("Provider berhasil diperbarui!");
    } else {
      const newItem: AIProviderItem = {
        id: Date.now().toString(),
        name: formName,
        type: formType,
        provider: formProvider,
        key: formKey || "••••••••••••",
        url: formUrl,
        active: false // inactive by default until toggled
      };
      updated = [...providers, newItem];
      setSuccessMsg("Provider berhasil ditambahkan!");
    }

    saveToStorage(updated);
    setTimeout(() => {
      setSuccessMsg("");
      resetForm();
    }, 1000);
  };

  const handleStartEdit = (item: AIProviderItem) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormType(item.type);
    setFormProvider(item.provider);
    setFormKey(""); // Let key be blank if not editing it
    setFormUrl(item.url);
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormName("");
    setFormType("text");
    setFormProvider("openai");
    setFormKey("");
    setFormUrl("");
    setEditingId(null);
    setIsAdding(false);
  };

  const providerOptions = [
    { value: "openai", label: "OpenAI Compatible API" },
    { value: "gemini", label: "Google Gemini API" },
    { value: "claude", label: "Anthropic Claude API" },
    { value: "ollama", label: "Ollama (Local LLM)" },
    { value: "whisper", label: "Whisper Speech API" },
    { value: "google", label: "Google Speech-to-Text" },
    { value: "custom", label: "Custom Endpoints" }
  ];

  const currentOption = providerOptions.find(o => o.value === formProvider) || providerOptions[0];

  const getTypeName = (type: string) => {
    switch (type) {
      case "text": return "Teks Utama";
      case "image": return "Gambar / OCR";
      case "voice": return "Voice / STT";
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "text": return "var(--primary)";
      case "image": return "var(--tertiary)";
      case "voice": return "var(--secondary-fixed-dim)";
      default: return "var(--outline)";
    }
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
        paddingBottom: 140,
      }}
    >
      {/* Header */}
      <header className="top-app-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: "var(--container-margin)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/settings" style={{ display: "flex", alignItems: "center", color: "var(--primary)", textDecoration: "none" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>arrow_back</span>
          </Link>
          <h2 className="text-headline-md" style={{ color: "var(--on-surface)", margin: 0, fontSize: 18, fontWeight: 700 }}>Provider AI Kustom</h2>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary"
            style={{ padding: "8px 16px", borderRadius: 12, fontSize: 13, boxShadow: "none" }}
          >
            Tambah
          </button>
        )}
      </header>

      <main style={{ marginTop: 72, padding: "20px var(--container-margin)", maxWidth: 672, margin: "72px auto 0" }}>
        {successMsg && (
          <div className="glass-card animate-fade-in" style={{ padding: "12px 16px", marginBottom: 16, color: "var(--primary)", background: "rgba(79, 55, 138, 0.08)", fontWeight: 600, fontSize: 14, borderRadius: 16 }}>
            {successMsg}
          </div>
        )}

        {isAdding ? (
          /* Add / Edit Form Card */
          <div className="glass-card animate-fade-slide-up" style={{ padding: "var(--card-padding)" }}>
            <h3 className="text-headline-sm" style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
              {editingId ? "Edit Provider AI Kustom" : "Tambah Provider AI Kustom"}
            </h3>

            <form onSubmit={handleAddOrEditSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>Nama Provider</label>
                <input
                  type="text"
                  className="glass-input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="Contoh: OpenAI GPT-4o Kustom"
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>

              {/* Type selector (Tombol tab kustom - NO HTML default radio) */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>Tipe Model / Sensor</label>
                <div style={{ display: "flex", gap: 8, background: "rgba(103, 80, 164, 0.04)", padding: 4, borderRadius: 14 }}>
                  {["text", "image", "voice"].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormType(type)}
                      style={{
                        flex: 1,
                        padding: "10px 0",
                        borderRadius: 10,
                        border: "none",
                        background: formType === type ? "var(--primary)" : "transparent",
                        color: formType === type ? "white" : "var(--on-surface-variant)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {getTypeName(type)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider Platform Dropdown (Custom Dropdown Selector - NO HTML select) */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative" }}>
                <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>Model Platform</label>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 16,
                    border: "1px solid var(--glass-border)",
                    background: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    fontSize: 14,
                    color: "var(--on-surface)"
                  }}
                >
                  {currentOption.label}
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--outline)" }}>
                    {isDropdownOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                  </span>
                </button>

                {isDropdownOpen && (
                  <div
                    className="glass-card animate-fade-in"
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: "100%",
                      zIndex: 100,
                      marginTop: 6,
                      padding: 6,
                      background: "white",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      border: "1px solid rgba(203, 196, 210, 0.4)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4
                    }}
                  >
                    {providerOptions.map(o => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => {
                          setFormProvider(o.value);
                          setIsDropdownOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: 10,
                          textAlign: "left",
                          background: formProvider === o.value ? "rgba(103, 80, 164, 0.06)" : "transparent",
                          color: formProvider === o.value ? "var(--primary)" : "var(--on-surface)",
                          border: "none",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: formProvider === o.value ? 600 : 500,
                          cursor: "pointer"
                        }}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* API Key */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>API Key / Token Kredensial</label>
                <input
                  type="password"
                  className="glass-input"
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value)}
                  placeholder={editingId ? "Tinggalkan kosong jika tidak ingin diubah" : "Masukkan API key"}
                  required={!editingId}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>

              {/* Base URL */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>Base URL / Custom Endpoint</label>
                <input
                  type="text"
                  className="glass-input"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1 (opsional)"
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>

              {/* Form buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                  style={{ flex: 1, padding: 14 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: 14, boxShadow: "none" }}
                >
                  {editingId ? "Simpan Perubahan" : "Tambah Provider"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* List of custom AI Providers */
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {providers.length === 0 ? (
              <div className="glass-card" style={{ padding: 32, textAlign: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--outline)", opacity: 0.5 }}>dns</span>
                <p className="text-body-md" style={{ marginTop: 12, color: "var(--on-surface-variant)", fontWeight: 500 }}>Belum ada provider kustom.</p>
                <p className="text-body-sm" style={{ color: "var(--outline)", marginTop: 4 }}>Klik tombol Tambah di pojok kanan atas untuk menambahkan provider AI milik sendiri.</p>
              </div>
            ) : (
              providers.map(item => (
                <div
                  key={item.id}
                  className="glass-card"
                  style={{
                    padding: 18,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderLeft: `5px solid ${getTypeColor(item.type)}`
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0, marginRight: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <h4 className="text-headline-sm" style={{ fontSize: 15, fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</h4>
                      <span
                        className="text-label-md"
                        style={{
                          background: `${getTypeColor(item.type)}12`,
                          color: getTypeColor(item.type),
                          padding: "1px 8px",
                          borderRadius: 6,
                          fontSize: 9,
                          fontWeight: 700
                        }}
                      >
                        {getTypeName(item.type)}
                      </span>
                    </div>
                    <p className="text-body-sm" style={{ color: "var(--outline)", margin: 0, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Model: {item.provider.toUpperCase()} {item.url ? `• Endpt: ${item.url}` : ""}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                    {/* Action buttons (Edit & Delete) */}
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => handleStartEdit(item)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}
                        title="Edit"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)" }}>edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}
                        title="Hapus"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--error)" }}>delete</span>
                      </button>
                    </div>

                    {/* Active toggle */}
                    <button
                      type="button"
                      className={`settings-toggle ${item.active ? "active" : ""}`}
                      onClick={() => handleToggleActive(item.id)}
                      aria-label={`Aktifkan provider ${item.name}`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
