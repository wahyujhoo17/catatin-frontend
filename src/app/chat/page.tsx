"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Message {
  id: string;
  type: "user" | "bot" | "confirmation";
  text: string;
  time: string;
  data?: {
    category?: string;
    amount?: string;
    method?: string;
    status?: "success" | "pending";
  };
}

const initialMessages: Message[] = [
  {
    id: "1",
    type: "bot",
    text: 'Hai! Ada yang ingin dicatat hari ini? Kamu bisa bilang "Makan siang 50rb" atau tanya "Berapa sisa saldo saya?".',
    time: "10:02",
  },
  {
    id: "2",
    type: "user",
    text: "Tadi beli kopi di Starbucks 45.000 pake kartu debit",
    time: "10:05",
  },
  {
    id: "3",
    type: "confirmation",
    text: "Berhasil Dicatat",
    time: "10:05",
    data: {
      category: "Makanan & Minuman",
      amount: "Rp 45.000",
      method: "Debit Card",
      status: "success",
    },
  },
];

const suggestions = [
  { icon: "outbox", label: "Catat Pengeluaran" },
  { icon: "inbox", label: "Catat Pemasukan" },
  { icon: "account_balance_wallet", label: "Cek Saldo" },
];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScanReceipt = () => {
    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      text: "[Mengunggah Foto Struk Kopi Sejahtera]",
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "confirmation",
        text: "Struk Berhasil Dipindai oleh AI",
        time: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        data: {
          category: "Makanan & Minuman",
          amount: "Rp 98.000",
          method: "Tunai",
          status: "success",
        },
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 2000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("scan") === "success") {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        setTimeout(handleScanReceipt, 500);
      }
    }
  }, []);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

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
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);

      // Parse simple amount patterns
      const amountMatch = text.match(/(\d+[\.,]?\d*)\s*(rb|ribu|k|jt|juta)?/i);
      let amount = "Rp 0";
      if (amountMatch) {
        let num = parseFloat(amountMatch[1].replace(",", "."));
        const suffix = amountMatch[2]?.toLowerCase();
        if (suffix === "rb" || suffix === "ribu" || suffix === "k") num *= 1000;
        if (suffix === "jt" || suffix === "juta") num *= 1000000;
        amount = `Rp ${num.toLocaleString("id-ID")}`;
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "confirmation",
        text: "Berhasil Dicatat",
        time: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        data: {
          category: "Pengeluaran Umum",
          amount,
          method: "Tunai",
          status: "success",
        },
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

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
          <Image
            src="/logo/logo.png"
            alt="Catetin"
            width={100}
            height={32}
            style={{ width: "auto", height: "auto", objectFit: "contain" }}
            priority
          />
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

      {/* Floating Back Button below top app bar */}
      <button
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push("/dashboard");
          }
        }}
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
          transition: "transform 0.2s",
        }}
        aria-label="Kembali ke Dashboard"
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
            ketik atau bicara.
          </p>
        </div>

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
                  <div className="bubble-bot">
                    <p style={{ margin: 0 }}>{msg.text}</p>
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

              {msg.type === "confirmation" && msg.data && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    maxWidth: "90%",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.85)",
                      backdropFilter: "blur(24px)",
                      WebkitBackdropFilter: "blur(24px)",
                      padding: 16,
                      borderRadius: 20,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.6)",
                      position: "relative",
                      overflow: "hidden",
                      width: "100%",
                    }}
                  >
                    {/* Left accent bar */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: 4,
                        height: "100%",
                        background: "var(--primary)",
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          background: "rgba(79, 55, 138, 0.1)",
                          padding: 6,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ color: "var(--primary)", fontSize: 20 }}
                        >
                          check_circle
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--on-surface)",
                        }}
                      >
                        {msg.text}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderBottom: "1px solid rgba(203, 196, 210, 0.1)",
                          paddingBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: "rgba(73, 69, 81, 0.6)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            fontWeight: 600,
                          }}
                        >
                          Kategori
                        </span>
                        <span
                          className="text-body-sm"
                          style={{ fontWeight: 600 }}
                        >
                          {msg.data.category}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderBottom: "1px solid rgba(203, 196, 210, 0.1)",
                          paddingBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: "rgba(73, 69, 81, 0.6)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            fontWeight: 600,
                          }}
                        >
                          Jumlah
                        </span>
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: "var(--error)",
                          }}
                        >
                          {msg.data.amount}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: "rgba(73, 69, 81, 0.6)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            fontWeight: 600,
                          }}
                        >
                          Metode
                        </span>
                        <span
                          className="text-body-sm"
                          style={{ fontWeight: 600 }}
                        >
                          {msg.data.method}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: 12,
                          background: "rgba(230, 224, 233, 0.3)",
                          color: "var(--on-surface-variant)",
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: 12,
                          background: "var(--primary)",
                          color: "white",
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          border: "none",
                          boxShadow: "0 4px 15px rgba(79, 55, 138, 0.2)",
                          cursor: "pointer",
                        }}
                      >
                        Selesai
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Suggestion Chips (show after first bot message) */}
          {messages.length <= 3 && (
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

          {/* Typing Indicator */}
          {isTyping && (
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

      {/* Bottom Input Dock */}
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
              style={{
                padding: 8,
                color: "var(--primary)",
                borderRadius: "50%",
                transition: "all 0.2s",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              aria-label="Voice input"
            >
              <span className="material-symbols-outlined">mic</span>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan atau tanya sesuatu..."
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
              style={{
                background: "var(--primary)",
                color: "white",
                width: 44,
                height: 44,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 15px rgba(79, 55, 138, 0.3)",
                border: "none",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              aria-label="Kirim"
              id="chat-send"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </form>
      </div>

      {/* Background Decorative */}
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
          zIndex: -1,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "25%",
          right: -96,
          width: 320,
          height: 320,
          background: "rgba(118, 91, 0, 0.05)",
          filter: "blur(120px)",
          borderRadius: "50%",
          zIndex: -1,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
