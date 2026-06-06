"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// ─── Config ──────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Message {
  id: string;
  type: "user" | "bot" | "error";
  text: string;
  time: string;
  isStreaming?: boolean;
}

const suggestions = [
  { icon: "outbox", label: "Catat Pengeluaran" },
  { icon: "inbox", label: "Catat Pemasukan" },
  { icon: "account_balance_wallet", label: "Cek Saldo" },
];

// ─── Get auth token ──────────────────────────────────────────
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

// ─── Strip [ACTION] blocks from AI response ──────────────────
function stripActions(text: string): string {
  return text
    .replace(/\[ACTION:record_transaction\][\s\S]*?\[\/ACTION\]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      text: 'Hai! 👋 Aku Catetin AI, asisten keuangan pribadimu.\n\nKamu bisa:\n• Catat pengeluaran: "Makan siang 50rb"\n• Catat pemasukan: "Gaji 5jt masuk"\n• Tanya saldo: "Berapa sisa saldo saya?"\n• Minta analisis keuangan\n\n⚠️ Aku hanya bisa bantu urusan keuangan dan aplikasi Catetin ya!',
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ─── Send message to AI backend with SSE streaming ─────────
  const sendToAI = useCallback(
    async (text: string, imageBase64?: string) => {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const botId = (Date.now() + 1).toString();
      const botMsg: Message = {
        id: botId,
        type: "bot",
        text: "",
        time: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      setInput("");

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${API_BASE}/api/ai/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: text,
            image: imageBase64 || undefined,
            history: messages.slice(-10).map(m => ({ type: m.type, text: m.text })),
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res
            .json()
            .catch(() => ({ error: `HTTP ${res.status}` }));
          throw new Error(err.error || `Gagal (${res.status})`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("Tidak ada response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;

            const payload = trimmed.slice(6);
            if (payload === "[DONE]") continue;

            try {
              const event = JSON.parse(payload);

              if (event.type === "token" && event.content) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botId
                      ? {
                          ...m,
                          text: m.text + event.content,
                        }
                      : m,
                  ),
                );
              } else if (event.type === "transaction_created") {
                // Transaksi berhasil tercatat — gabungkan ke dalam bubble AI
                const tx = event.transaction;
                const formatted = `✅ Transaksi tercatat: ${tx.type === "INCOME" ? "+" : "-"}Rp ${tx.amount.toLocaleString("id-ID")} — ${tx.description} (${tx.category})\n`;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botId
                      ? {
                          ...m,
                          text: m.text + formatted,
                        }
                      : m,
                  ),
                );
              } else if (event.type === "error") {
                throw new Error(event.error);
              }
            } catch {
              // skip
            }
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId
              ? { ...m, type: "error", text: err.message, isStreaming: false }
              : m,
          ),
        );
      } finally {
        // Strip [ACTION] blocks dari teks yang ditampilkan
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId
              ? {
                  ...m,
                  isStreaming: false,
                  text: stripActions(m.text),
                }
              : m,
          ),
        );
        abortRef.current = null;
      }
    },
    [router, messages],
  );

  // ─── Send text message ─────────────────────────────────────
  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      text: text.trim(),
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    if (capturedImage) {
      sendToAI(text, capturedImage);
      setCapturedImage(null);
    } else {
      sendToAI(text);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (capturedImage && !input.trim()) {
      sendMessage("Analisis gambar ini dan catat transaksinya");
    } else {
      sendMessage(input);
    }
  };

  // ─── Image compression utility ─────────────────────────────
  const compressImage = (
    file: File,
    maxW = 1024,
    quality = 0.7,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        // Downscale if exceeds max
        if (width > maxW || height > maxW) {
          const ratio = Math.min(maxW / width, maxW / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Gagal memuat gambar"));
      };
    });
  };

  // ─── Image attachment ──────────────────────────────────────
  const handleAttachImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe & ukuran sebelum kompresi
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang didukung");
      e.target.value = "";
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 20 MB");
      e.target.value = "";
      return;
    }

    try {
      const compressed = await compressImage(file);
      setCapturedImage(compressed);
    } catch {
      alert("Gagal memproses gambar. Coba lagi.");
    }
    e.target.value = "";
  };

  // ─── Cleanup ───────────────────────────────────────────────
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return (
    <div
      className="mesh-bg"
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}
    >
      {/* Top App Bar */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px var(--container-margin)",
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <div style={{ position: "relative", width: 120, height: 32, overflow: "hidden", display: "flex", alignItems: "center" }}>
            <Image
              src="/logo/logo.png"
              alt="Catetin"
              width={120}
              height={120}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </Link>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, var(--primary-fixed-dim), var(--primary-fixed))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(79, 55, 138, 0.2)",
            fontSize: 16,
            fontWeight: 600,
            color: "var(--primary)",
          }}
        >
          B
        </div>
      </header>

      {/* Back Button */}
      <button
        onClick={() =>
          window.history.length > 1 ? router.back() : router.push("/dashboard")
        }
        style={{
          position: "fixed",
          top: 80,
          left: "var(--container-margin)",
          zIndex: 100,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          cursor: "pointer",
        }}
        aria-label="Kembali"
      >
        <span
          className="material-symbols-outlined"
          style={{ color: "var(--on-surface-variant)", fontSize: 22 }}
        >
          arrow_back
        </span>
      </button>

      {/* Chat Canvas */}
      <main
        style={{
          paddingTop: 96,
          paddingLeft: "var(--container-margin)",
          paddingRight: "var(--container-margin)",
          maxWidth: 672,
          margin: "0 auto",
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          paddingBottom: 100,
        }}
      >
        {/* Welcome Section */}
        {messages.length <= 1 && (
          <div
            className="animate-fade-slide-up"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              marginBottom: "var(--stack-gap-lg)",
            }}
          >
            <div
              className="glass-card"
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
                marginBottom: 16,
              }}
            >
              <span
                className="material-symbols-outlined filled"
                style={{ color: "var(--primary)", fontSize: 40 }}
              >
                auto_awesome
              </span>
            </div>
            <h1
              className="text-headline-md"
              style={{ color: "var(--on-surface)", marginBottom: 8 }}
            >
              Halo, Saya Catetin AI
            </h1>
            <p
              className="text-body-md"
              style={{ color: "var(--on-surface-variant)", maxWidth: 320 }}
            >
              Membantu kamu mencatat keuangan dengan bahasa sehari-hari. Cukup
              ketik atau kirim foto struk.
            </p>
          </div>
        )}

        {/* Messages */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              className="animate-fade-slide-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {msg.type === "user" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <div className="bubble-user">
                    <p style={{ margin: 0 }}>{msg.text}</p>
                  </div>
                  <span
                    className="text-label-md"
                    style={{
                      color: "rgba(73, 69, 81, 0.6)",
                      marginTop: 4,
                      marginRight: 8,
                    }}
                  >
                    {msg.time}
                  </span>
                </div>
              )}
              {msg.type === "bot" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    maxWidth: "85%",
                  }}
                >
                  {!msg.isStreaming && msg.type === "bot" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: 70,
                        height: 70,
                        margin: "-20px 0 -20px -5px",
                        opacity: 1,
                      }}
                    >
                      <Image src="/logo/logo.png" alt="Bot" width={70} height={70} style={{ objectFit: "contain" }} priority />
                    </div>
                  )}
                  {(() => {
                    const askMatch = msg.text.match(/\[ASK_ACCOUNT:(.*?)\]/);
                    const options = askMatch ? askMatch[1].split(",") : [];
                    const cleanText = msg.text.replace(/\[ASK_ACCOUNT:.*?\]/g, "").trim();

                    return (
                      <>
                        <div className="bubble-bot">
                          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                            {cleanText}
                            {msg.isStreaming && (
                              <span
                                style={{
                                  display: "inline-block",
                                  width: 8,
                                  height: 16,
                                  background: "var(--primary)",
                                  marginLeft: 2,
                                  animation: "blink 1s step-end infinite",
                                }}
                              />
                            )}
                          </p>
                        </div>
                        {options.length > 0 && !msg.isStreaming && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, marginLeft: 8 }}>
                            {options.map((opt) => (
                              <button
                                key={opt}
                                onClick={() => sendMessage(`Gunakan akun ${opt.trim()}`)}
                                style={{
                                  padding: "6px 16px",
                                  fontSize: 13,
                                  fontWeight: 500,
                                  borderRadius: 20,
                                  border: "1px solid var(--primary)",
                                  background: "var(--primary-container)",
                                  color: "var(--on-primary-container)",
                                  cursor: "pointer",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                                }}
                              >
                                {opt.trim()}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 4,
                      marginLeft: 8,
                    }}
                  >
                    <span
                      className="text-label-md"
                      style={{ color: "rgba(73, 69, 81, 0.6)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.5px", transform: "translateY(1px)" }}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              )}
              {msg.type === "error" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    maxWidth: "85%",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(186, 26, 26, 0.08)",
                      padding: "12px 16px",
                      borderRadius: 16,
                      border: "1px solid rgba(186, 26, 26, 0.15)",
                    }}
                  >
                    <p
                      style={{ margin: 0, color: "var(--error)", fontSize: 14 }}
                    >
                      ⚠️ {msg.text}
                    </p>
                  </div>
                  <span
                    className="text-label-md"
                    style={{
                      color: "rgba(73, 69, 81, 0.6)",
                      marginTop: 4,
                      marginLeft: 8,
                    }}
                  >
                    {msg.time}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                padding: "8px 0",
              }}
            >
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  className="chip"
                  onClick={() => sendMessage(s.label)}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18 }}
                  >
                    {s.icon}
                  </span>
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Loading dots */}
          {isTyping && !messages.some((m) => m.isStreaming) && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div
                className="bubble-bot"
                style={{
                  padding: "16px 24px",
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--primary)",
                      animation: `typing-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageSelect}
        style={{ display: "none" }}
      />

      {/* Bottom Input */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "var(--container-margin)",
          paddingBottom: 24,
          zIndex: 50,
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{ maxWidth: 672, margin: "0 auto" }}
        >
          {capturedImage && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                marginBottom: 8,
                background: "rgba(255,255,255,0.85)",
                borderRadius: 12,
                backdropFilter: "blur(16px)",
              }}
            >
              <img
                src={capturedImage}
                alt="Preview"
                style={{
                  width: 40,
                  height: 40,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
              <span
                className="text-body-sm"
                style={{ color: "var(--on-surface-variant)", flex: 1 }}
              >
                Gambar terpasang — AI akan menganalisis
              </span>
              <button
                type="button"
                onClick={() => setCapturedImage(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--on-surface-variant)",
                  padding: 4,
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}
          <div
            className="glass-card"
            style={{
              padding: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow:
                "0 -4px 30px rgba(0,0,0,0.06), 0 10px 40px rgba(0,0,0,0.06)",
            }}
          >
            <button
              type="button"
              onClick={handleAttachImage}
              style={{
                padding: 8,
                color: capturedImage
                  ? "var(--primary)"
                  : "var(--on-surface-variant)",
                borderRadius: "50%",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              aria-label="Lampirkan gambar"
            >
              <span className="material-symbols-outlined">image</span>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                capturedImage
                  ? "Deskripsi gambar (opsional)..."
                  : "Ketik pesan..."
              }
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--on-surface)",
                fontSize: 16,
                lineHeight: "24px",
                padding: "8px 4px",
              }}
              id="chat-input"
            />
            <button
              type="submit"
              disabled={isTyping || (!input.trim() && !capturedImage)}
              style={{
                background: isTyping
                  ? "rgba(79, 55, 138, 0.3)"
                  : "var(--primary)",
                color: "white",
                width: 44,
                height: 44,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isTyping
                  ? "none"
                  : "0 4px 15px rgba(79, 55, 138, 0.3)",
                border: "none",
                cursor: isTyping ? "not-allowed" : "pointer",
              }}
              aria-label="Kirim"
            >
              <span className="material-symbols-outlined">
                {isTyping ? "more_horiz" : "send"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Decorative */}
      <div
        style={{
          position: "fixed",
          top: "25%",
          left: -96,
          width: 256,
          height: 256,
          background: "rgba(79, 55, 138, 0.05)",
          filter: "blur(120px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
