"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AIProviderLogo from "@/components/AIProviderLogo";

// ─── Config ──────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ─── Types ────────────────────────────────────────────────────
interface CustomAI {
  enabled: boolean;
  provider: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

const EMPTY_CONFIG: CustomAI = {
  enabled: false,
  provider: "openai",
  baseUrl: "",
  apiKey: "",
  model: "",
};

const providerOptions = [
  {
    value: "openai",
    label: "OpenAI Compatible API",
    baseUrl: "https://api.openai.com/v1",
  },
  {
    value: "deepseek",
    label: "DeepSeek API",
    baseUrl: "https://api.deepseek.com",
  },
  {
    value: "groq",
    label: "Groq API",
    baseUrl: "https://api.groq.com/openai/v1",
  },
  {
    value: "openrouter",
    label: "OpenRouter API",
    baseUrl: "https://openrouter.ai/api/v1",
  },
  {
    value: "gemini",
    label: "Google Gemini API",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
  },
  {
    value: "ollama",
    label: "Ollama (Local)",
    baseUrl: "http://localhost:11434/v1",
  },
  { value: "custom", label: "Custom Endpoint", baseUrl: "" },
];

// ─── Helpers ──────────────────────────────────────────────────
function getToken(): string | null {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export default function CustomAIPage() {
  const router = useRouter();
  const [config, setConfig] = useState<CustomAI>(EMPTY_CONFIG);
  const [formProvider, setFormProvider] = useState("openai");
  const [formBaseUrl, setFormBaseUrl] = useState("");
  const [formApiKey, setFormApiKey] = useState("");
  const [formModel, setFormModel] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // ─── Load config dari backend ──────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${API_BASE}/api/settings/ai-config`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: CustomAI) => {
        setConfig(data);
        setFormProvider(data.provider || "openai");
        setFormBaseUrl(data.baseUrl || "");
        setFormApiKey(data.apiKey || "");
        setFormModel(data.model || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  // ─── Auto-fill base URL when provider changes ──────────────
  const handleProviderChange = (value: string) => {
    setFormProvider(value);
    setIsDropdownOpen(false);
    const opt = providerOptions.find((o) => o.value === value);
    if (opt?.baseUrl) setFormBaseUrl(opt.baseUrl);
  };

  // ─── Toggle Catetin AI / Custom AI (simpan ke backend) ────
  const handleToggleMode = async (useCustom: boolean) => {
    const token = getToken();
    if (!token) return;

    const updated = { ...config, enabled: useCustom };

    // Jika switch ke Catetin AI — langsung reset
    if (!useCustom) {
      try {
        const res = await fetch(`${API_BASE}/api/settings/ai-config`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(EMPTY_CONFIG),
        });
        if (res.ok) {
          setConfig(EMPTY_CONFIG);
          setSuccessMsg("Beralih ke Catetin AI (Default) ✅");
          setTimeout(() => setSuccessMsg(""), 2000);
        }
      } catch {
        /* ignore */
      }
      return;
    }

    // Switch ke Custom AI — simpan form saat ini
    setConfig(updated);
  };

  // ─── Save custom AI config ke backend ─────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    if (!formApiKey.trim()) {
      setSuccessMsg("API Key wajib diisi.");
      return;
    }

    const updated: CustomAI = {
      enabled: true,
      provider: formProvider,
      baseUrl: formBaseUrl.trim(),
      apiKey: formApiKey.trim(),
      model: formModel.trim(),
    };

    try {
      const res = await fetch(`${API_BASE}/api/settings/ai-config`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Gagal" }));
        setSuccessMsg(err.error || "Gagal menyimpan.");
        return;
      }

      setConfig(updated);
      setSuccessMsg("Konfigurasi AI kustom berhasil disimpan! ✅");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch {
      setSuccessMsg("Gagal terhubung ke server.");
    }
  };

  const currentOption =
    providerOptions.find((o) => o.value === formProvider) || providerOptions[0];

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        minHeight: "100dvh",
        paddingBottom: 40,
      }}
    >
      {/* Header */}
      <header
        className="top-app-bar"
        style={{ display: "flex", alignItems: "center", gap: 12 }}
      >
        <button
          onClick={() => router.push("/settings")}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            alignItems: "center",
            color: "var(--primary)",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
            arrow_back
          </span>
        </button>
        <h2
          className="text-headline-md"
          style={{
            color: "var(--on-surface)",
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          Provider AI Aktif
        </h2>
      </header>

      <main className="settings-main-container">
        {successMsg && (
          <div
            className="glass-card animate-fade-in"
            style={{
              padding: "12px 16px",
              marginBottom: 16,
              color: config.enabled ? "var(--primary)" : "var(--tertiary)",
              background: config.enabled
                ? "rgba(79,55,138,0.08)"
                : "rgba(118,91,0,0.08)",
              fontWeight: 600,
              fontSize: 14,
              borderRadius: 16,
            }}
          >
            {successMsg}
          </div>
        )}

        {/* ─── TOGGLE CARD ─────────────────────────────── */}
        <div
          className="glass-card"
          style={{ padding: "var(--card-padding)", marginBottom: 20 }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--on-surface-variant)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: "0 0 16px 0",
            }}
          >
            Pilih Provider AI
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            {/* Catetin AI (Default) */}
            <button
              onClick={() => handleToggleMode(false)}
              style={{
                flex: 1,
                padding: "16px 12px",
                borderRadius: 16,
                border: config.enabled
                  ? "1px solid var(--outline)"
                  : "2px solid var(--primary)",
                background: config.enabled
                  ? "transparent"
                  : "rgba(79,55,138,0.06)",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
              }}
            >
              <span
                className="material-symbols-outlined filled"
                style={{
                  fontSize: 32,
                  color: "var(--primary)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                auto_awesome
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--on-surface)",
                }}
              >
                Catetin AI
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 11,
                  color: "var(--outline)",
                }}
              >
                Default
              </p>
              {!config.enabled && (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 8,
                    padding: "2px 10px",
                    borderRadius: 99,
                    background: "var(--primary)",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  AKTIF
                </span>
              )}
            </button>

            {/* Custom AI */}
            <button
              onClick={() => handleToggleMode(true)}
              style={{
                flex: 1,
                padding: "16px 12px",
                borderRadius: 16,
                border: config.enabled
                  ? "2px solid var(--primary)"
                  : "1px solid var(--outline)",
                background: config.enabled
                  ? "rgba(79,55,138,0.06)"
                  : "transparent",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 32,
                  color: "var(--tertiary)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                dns
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--on-surface)",
                }}
              >
                Custom AI
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 11,
                  color: "var(--outline)",
                }}
              >
                API sendiri
              </p>
              {config.enabled && (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 8,
                    padding: "2px 10px",
                    borderRadius: 99,
                    background: "var(--primary)",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  AKTIF
                </span>
              )}
            </button>
          </div>

          {/* Info Catetin AI */}
          {!config.enabled && (
            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 12,
                background: "rgba(79,55,138,0.04)",
                border: "1px solid rgba(79,55,138,0.08)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--primary)",
                }}
              >
                🔄 3-Layer Auto-Failover
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 12,
                  color: "var(--on-surface-variant)",
                  lineHeight: 1.6,
                }}
              >
                Groq (gratis, cepat) → DeepSeek v4 Flash → OpenRouter Gemini 2.5
                Flash. Otomatis switch jika ada yang error atau rate-limit.
              </p>
            </div>
          )}
        </div>

        {/* ─── CUSTOM AI FORM (muncul jika enabled) ──────── */}
        {config.enabled && (
          <div
            className="glass-card animate-fade-slide-up"
            style={{ padding: "var(--card-padding)" }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--on-surface-variant)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: "0 0 16px 0",
              }}
            >
              Konfigurasi Custom AI
            </p>

            <form
              onSubmit={handleSave}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {/* Provider dropdown */}
              <div style={{ position: "relative" }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--on-surface-variant)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Provider
                </label>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    width: "100%",
                    height: 44,
                    padding: "0 14px",
                    borderRadius: 12,
                    border: "1px solid var(--glass-border)",
                    background: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    fontSize: 14,
                    color: "var(--on-surface)",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <AIProviderLogo
                      provider={formProvider}
                      containerSize={28}
                      size={16}
                    />
                    <span>{currentOption.label}</span>
                  </div>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20, color: "var(--outline)" }}
                  >
                    {isDropdownOpen
                      ? "keyboard_arrow_up"
                      : "keyboard_arrow_down"}
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
                      boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                      border: "1px solid rgba(203,196,210,0.4)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {providerOptions.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => handleProviderChange(o.value)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          textAlign: "left",
                          background:
                            formProvider === o.value
                              ? "rgba(103,80,164,0.06)"
                              : "transparent",
                          color:
                            formProvider === o.value
                              ? "var(--primary)"
                              : "var(--on-surface)",
                          border: "none",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: formProvider === o.value ? 600 : 500,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <AIProviderLogo
                          provider={o.value}
                          containerSize={26}
                          size={15}
                        />
                        <span>{o.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Base URL */}
              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--on-surface-variant)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Base URL
                </label>
                <input
                  type="text"
                  className="glass-input"
                  value={formBaseUrl}
                  onChange={(e) => setFormBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    fontSize: 14,
                    height: 44,
                  }}
                />
              </div>

              {/* API Key */}
              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--on-surface-variant)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  API Key
                </label>
                <input
                  type="password"
                  className="glass-input"
                  value={formApiKey}
                  onChange={(e) => setFormApiKey(e.target.value)}
                  placeholder="sk-..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    fontSize: 14,
                    height: 44,
                  }}
                />
              </div>

              {/* Model */}
              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--on-surface-variant)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Model (opsional)
                </label>
                <input
                  type="text"
                  className="glass-input"
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                  placeholder="gpt-4o (kosongkan untuk default)"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    fontSize: 14,
                    height: 44,
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  marginTop: 8,
                  padding: "12px 20px",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: "none",
                }}
              >
                💾 Simpan Konfigurasi
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
