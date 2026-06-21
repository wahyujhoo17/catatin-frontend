"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import loadingJson from "../../../public/797bcec6-1174-11ee-9f70-5b99a7148b86.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// ─── Config ──────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ─── Lightweight Markdown → HTML parser ──────────────────────
function renderMarkdown(text: string): string {
  let html = text
    // Escape HTML entities first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Bold: **text**
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic: *text* (but not inside bold, require no space after first * and no space before last *)
    .replace(/(?<!\*)\*(?!\s|\*)(.+?)(?<!\s|\*)\*(?!\*)/g, "<em>$1</em>")
    // Inline code: `code`
    .replace(
      /`([^`]+)`/g,
      "<code style='background:rgba(0,0,0,0.06);padding:1px 5px;border-radius:4px;font-size:0.9em'>$1</code>",
    )
    // Horizontal rule: ---
    .replace(
      /^---$/gm,
      "<hr style='border:none;border-top:1px solid rgba(0,0,0,0.1);margin:8px 0'>",
    )
    // Headers: ### h3, ## h2, # h1
    .replace(
      /^### (.+)$/gm,
      "<strong style='font-size:1em;display:block;margin:6px 0 2px'>$1</strong>",
    )
    .replace(
      /^## (.+)$/gm,
      "<strong style='font-size:1.05em;display:block;margin:8px 0 2px'>$1</strong>",
    )
    .replace(
      /^# (.+)$/gm,
      "<strong style='font-size:1.1em;display:block;margin:8px 0 4px'>$1</strong>",
    );

  // ── Pre-process: merge numbered list markers on their own line with their subsequent text line ──
  {
    const lines = html.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (/^\d+\.$/.test(line)) {
        // Find next non-empty line that doesn't start with another number or bullet
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === "") {
          j++;
        }
        if (j < lines.length) {
          const nextLineTrimmed = lines[j].trim();
          if (!/^\d+\./.test(nextLineTrimmed) && !/^[-*•]\s+/.test(nextLineTrimmed)) {
            lines[i] = line + " " + lines[j].trim();
            lines[j] = "";
          }
        }
      }
    }
    html = lines.join("\n");
  }

  // ── Ordered list: group consecutive list items and their sub-lines (such as bullets/details) ──
  {
    const lines = html.split("\n");
    const output: string[] = [];
    let i = 0;
    while (i < lines.length) {
      if (/^\d+\.\s+/.test(lines[i])) {
        const items: { title: string; subLines: string[] }[] = [];
        
        while (i < lines.length) {
          if (/^\d+\.\s+/.test(lines[i])) {
            const title = lines[i].replace(/^\d+\.\s+/, "");
            items.push({ title, subLines: [] });
            i++;
          } else if (items.length > 0) {
            if (/^(###|##|#|---)/.test(lines[i])) {
              break;
            }
            items[items.length - 1].subLines.push(lines[i]);
            i++;
          } else {
            break;
          }
        }

        const renderedItems = items.map((item, idx) => {
          let subContent = item.subLines.join("\n");
          
          // Render bullets inside subContent
          subContent = subContent.replace(/(?:^|\n)((?:[-*•] .+?(?:\n|$))+)/g, (match) => {
            const bulletItems = match
              .split("\n")
              .filter(Boolean)
              .map((line) => {
                const content = line.replace(/^[-*•] /, "");
                return `<span style="display:flex;gap:5px;align-items:flex-start;margin-bottom:3px;margin-left:12px"><span style="flex-shrink:0;line-height:1.4;color:var(--text-muted,#6b7280)">•</span><span style="line-height:1.4">${content}</span></span>`;
              });
            return `\n<div style="display:flex;flex-direction:column;margin:2px 0">${bulletItems.join("")}</div>`;
          });
          
          subContent = subContent.replace(/\n{2,}/g, "<br>").replace(/\n/g, " ");

          return `<div style="margin-bottom:8px">
            <span style="display:flex;gap:6px;align-items:flex-start">
              <span style="flex-shrink:0;min-width:18px;font-weight:600;color:var(--primary,#2563eb);line-height:1.4">${idx + 1}.</span>
              <span style="line-height:1.4">${item.title}</span>
            </span>
            ${subContent.trim() ? `<div style="margin-top:4px;padding-left:24px">${subContent}</div>` : ""}
          </div>`;
        });

        output.push(`<div style="display:flex;flex-direction:column;margin:6px 0">${renderedItems.join("")}</div>`);
      } else {
        output.push(lines[i]);
        i++;
      }
    }
    html = output.join("\n");
  }

  // ── Unordered list: group consecutive bullet lines ──────
  html = html.replace(/(?:^|\n)((?:[-*•] .+?(?:\n|$))+)/g, (match) => {
    const items = match
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const content = line.replace(/^[-*•] /, "");
        return `<span style="display:flex;gap:5px;align-items:flex-start;margin-bottom:3px"><span style="flex-shrink:0;line-height:1.4">•</span><span style="line-height:1.4">${content}</span></span>`;
      });
    return `\n<div style="display:flex;flex-direction:column;margin:4px 0">${items.join("")}</div>`;
  });

  // Newlines: double (or more) → paragraph break, single → space (prose flows naturally)
  html = html.replace(/\n{2,}/g, "<br>").replace(/\n/g, " ");
  // Collapse consecutive <br> tags and trim
  html = html.replace(/(<br>\s*){2,}/g, "<br>").trim();

  return html;
}

interface Message {
  id: string;
  type: "user" | "bot" | "error";
  text: string;
  time: string;
  isStreaming?: boolean;
  isHistory?: boolean;
  isNew?: boolean;
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
    .replace(
      /\[ACTION:(record_transaction|update_transaction|delete_transaction)\][\s\S]*?\[\/ACTION\]/g,
      "",
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Chart Widget (Inline) ────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  primary: "var(--primary)",
  secondary: "var(--secondary)",
  tertiary: "var(--tertiary)",
};

function ChartWidget({ type }: { type: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_BASE}/api/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [type]);

  if (!data)
    return (
      <div style={{ fontStyle: "italic", opacity: 0.6 }}>Memuat grafik...</div>
    );
  if (!data.topCategories || data.topCategories.length === 0)
    return <div>Belum ada pengeluaran bulan ini.</div>;

  return (
    <div
      style={{
        marginTop: 12,
        padding: 16,
        background: "var(--surface)",
        borderRadius: 16,
        border: "1px solid var(--outline-variant)",
      }}
    >
      <h4 style={{ margin: "0 0 16px 0", fontSize: 14 }}>
        Kategori Pengeluaran Bulan Ini
      </h4>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div
          style={{
            position: "relative",
            width: 80,
            height: 80,
            borderRadius: "50%",
            borderWidth: "10px",
            borderStyle: "solid",
            borderTopColor: data.topCategories.length
              ? "var(--primary)"
              : "var(--secondary-container)",
            borderRightColor:
              data.topCategories.length > 1 ? "var(--tertiary)" : "transparent",
            borderBottomColor:
              data.topCategories.length > 2
                ? "var(--secondary-fixed-dim)"
                : "transparent",
            borderLeftColor: data.topCategories.length
              ? "var(--primary)"
              : "var(--secondary-container)",
            flexShrink: 0,
          }}
        />
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {data.topCategories.map((cat: any, i: number) => (
            <li
              key={cat.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      CATEGORY_COLORS[
                        i === 0 ? "primary" : i === 1 ? "tertiary" : "secondary"
                      ] || "var(--secondary)",
                  }}
                />
                <span>{cat.name}</span>
              </div>
              <span style={{ fontWeight: 600 }}>{cat.percentage}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastScrollTime = useRef<number>(0);
  const isInitialScrollDone = useRef(false);

  // Voice Chat States
  const [isListening, setIsListening] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Ref to hold scrollHeight before new messages render
  const previousScrollHeightRef = useRef<number | null>(null);

  // Filter out scanner conversations (the prompt and the immediate AI reply)
  const displayMessages = useMemo(() => {
    const filtered = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (
        msg.type === "user" &&
        msg.text.includes("Tolong analisis struk/gambar ini dengan detail")
      ) {
        // Skip this scanner prompt
        // Also skip the immediate next bot response
        if (i + 1 < messages.length && messages[i + 1].type === "bot") {
          i++; // increment i to skip the bot message too
        }
        continue;
      }
      filtered.push(msg);
    }
    return filtered;
  }, [messages]);

  const scrollToBottom = useCallback(
    (behavior: "smooth" | "auto" = "smooth", force = false) => {
      const now = Date.now();
      // Only throttle smooth scrolling to prevent animation cancellation. Instant scrolling ("auto") has no animation and can be called as fast as needed.
      if (behavior === "smooth" && !force && now - lastScrollTime.current < 100)
        return;

      if (behavior === "smooth") {
        lastScrollTime.current = now;
      }

      // Defer the scroll calculation to next frame to ensure browser has updated layout height
      setTimeout(() => {
        const scrollContainer = document.documentElement || document.body;
        const targetScrollTop = scrollContainer.scrollHeight;

        const originalScrollBehavior =
          document.documentElement.style.scrollBehavior;
        if (behavior === "auto") {
          document.documentElement.style.scrollBehavior = "auto";
        }

        window.scrollTo({
          top: targetScrollTop,
          behavior,
        });

        if (behavior === "auto") {
          document.documentElement.style.scrollBehavior =
            originalScrollBehavior;
        }
      }, 0);
    },
    [],
  );

  useEffect(() => {
    // Only scroll to bottom automatically if we are NOT loading history
    // (so we don't jump to bottom when older messages are loaded)
    if (!isLoadingHistory && page === 1) {
      const isStreaming = messages.some((m) => m.isStreaming);
      if (isStreaming) {
        // Snaps instantly during text stream to avoid animation lags and getting stuck
        scrollToBottom("auto", false);
      } else {
        // Force a final scroll when loading or streaming finishes
        if (!isInitialScrollDone.current && messages.length > 0) {
          // On first load/refresh, give it a 200ms delay to let fonts, markdown, and layouts completely settle
          setTimeout(() => {
            scrollToBottom("auto", true);
          }, 200);
          isInitialScrollDone.current = true;
        } else {
          scrollToBottom("smooth", true);
        }
      }
    }
  }, [messages, isLoadingHistory, page, scrollToBottom]);
  const isFetchingRef = useRef(false);
  const isRestoringScrollRef = useRef(false);

  // Fetch history function
  const fetchHistory = useCallback(
    async (pageToLoad: number) => {
      if (!hasMore || isFetchingRef.current) return;

      const token = getToken();
      if (!token) return;

      try {
        isFetchingRef.current = true;
        setIsLoadingHistory(true);
        const res = await fetch(
          `${API_BASE}/api/ai/chat/history?page=${pageToLoad}&limit=6`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) throw new Error("Failed to fetch history");

        const data = await res.json();
        const fetchedMessages: Message[] = (data.messages || []).map(
          (m: any) => ({
            ...m,
            isHistory: pageToLoad > 1, // only mark older pages as history to bypass animations
          }),
        );

        if (fetchedMessages.length > 0) {
          setMessages((prev) => {
            if (pageToLoad === 1) {
              const filtered = prev.filter((m) => m.id !== "welcome");
              if (filtered.length === 0) return fetchedMessages;
              return [...fetchedMessages, ...filtered];
            } else {
              // Save scrollHeight synchronously before React renders the new elements
              previousScrollHeightRef.current =
                document.documentElement.scrollHeight ||
                document.body.scrollHeight;
              return [...fetchedMessages, ...prev];
            }
          });
        } else if (pageToLoad === 1) {
          setMessages((prev) => {
            if (prev.length === 0) {
              return [
                {
                  id: "welcome",
                  type: "bot",
                  text: 'Hai! 👋 Aku Catatin AI, asisten keuangan pribadimu.\n\nKamu bisa:\n• Catat pengeluaran: "Makan siang 50rb"\n• Catat pemasukan: "Gaji 5jt masuk"\n• Tanya saldo: "Berapa sisa saldo saya?"\n• Minta analisis keuangan\n\n⚠️ Aku hanya bisa bantu urusan keuangan dan aplikasi Catatin ya!',
                  time: new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
              ];
            }
            return prev;
          });
        }

        setHasMore(data.pagination.page < data.pagination.totalPages);
        setPage(pageToLoad);
      } catch (err: any) {
      console.error("Image upload failed:", err);
      // Removed alert, we can fail silently or show an inline error if needed
    } finally {
      setIsTyping(false);
      setIsLoadingHistory(false);
      setInitialLoadDone(true);
      // Defer resetting fetch guard until after React commits DOM and
      // useLayoutEffect has restored scroll position, so the scroll handler
      // doesn't immediately trigger another fetch during restoration.
      setTimeout(() => {
        isFetchingRef.current = false;
      }, 0);
    }
  },
  [hasMore]
  );

  // ─── Voice Input (Web Speech API) ───────────────────────────
  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Browser Anda tidak mendukung fitur Voice Input.");
      return;
    }
    
    if (isListening) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    speechRecognitionRef.current = recognition;
    recognition.lang = "id-ID";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? prev + " " + transcript : transcript));
      setIsVoiceMode(true);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        alert("Akses mikrofon ditolak. Mohon izinkan akses mikrofon di pengaturan browser (klik ikon di sebelah kiri URL browser).");
      } else if (event.error !== "no-speech") {
        console.error("Speech recognition error:", event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleStopMic = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // ─── Voice Output (ElevenLabs TTS) ──────────────────────────
  const playAudio = async (messageId: string, text: string) => {
    // If clicking the same message that's currently playing, stop it
    if (playingAudioId === messageId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingAudioId(null);
      return;
    }

    try {
      const token = getToken();
      setPlayingAudioId(messageId + "_loading");
      const res = await fetch(`${API_BASE}/api/ai/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: stripActions(text) }),
      });

      if (!res.ok) {
        setPlayingAudioId(null);
        if (res.status === 400) {
          alert("API Key ElevenLabs belum diatur. Silakan atur di menu Pengaturan > Konfigurasi Provider AI.");
        } else {
          alert("Gagal menghasilkan suara.");
        }
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => {
        setPlayingAudioId(null);
      };
      
      await audio.play();
      setPlayingAudioId(messageId);
    } catch (err) {
      console.error("TTS Error:", err);
      setPlayingAudioId(null);
    }
  };

  // Initial load
  useEffect(() => {
    if (!initialLoadDone) {
      fetchHistory(1);
    }
  }, [fetchHistory, initialLoadDone]);

  // Synchronously restore scroll position after messages update but BEFORE browser paints
  useLayoutEffect(() => {
    if (previousScrollHeightRef.current !== null) {
      const scrollContainer = document.documentElement || document.body;
      const newScrollHeight = scrollContainer.scrollHeight;

      // Flag to prevent scroll handler from triggering during restoration
      isRestoringScrollRef.current = true;

      // Temporarily disable smooth scrolling to prevent bouncy animated scroll
      const originalScrollBehavior =
        document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";

      window.scrollBy({
        top: newScrollHeight - previousScrollHeightRef.current,
        left: 0,
        behavior: "instant" as any,
      });

      // Restore original scroll behavior
      document.documentElement.style.scrollBehavior = originalScrollBehavior;

      previousScrollHeightRef.current = null;

      // Clear restoration flag after a short macrotask delay so both the
      // synchronous scroll event AND the React useEffect callbacks have processed
      setTimeout(() => {
        isRestoringScrollRef.current = false;
      }, 150);
    }
  }, [messages]);

  // Infinite scroll listener based on exact coordinates (100% reliable)
  useEffect(() => {
    const handleScroll = () => {
      // Skip if we're in the middle of restoring scroll position or fetching history
      if (isRestoringScrollRef.current || isFetchingRef.current) return;
      // If we are within 250px of the top, trigger fetch
      if (
        window.scrollY <= 250 &&
        !isLoadingHistory &&
        hasMore &&
        initialLoadDone
      ) {
        fetchHistory(page + 1);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Also check immediately in case the screen is already at the top
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoadingHistory, hasMore, initialLoadDone, fetchHistory, page]);

  // Handle scanned image from BottomNav
  useEffect(() => {
    if (typeof window !== "undefined") {
      const scannedImage = localStorage.getItem("scanned_image");
      if (scannedImage) {
        localStorage.removeItem("scanned_image");
        setCapturedImage(scannedImage);
        setInput("Tolong analisis gambar struk ini dan catat transaksinya.");
      }
    }
  }, []);

  // ─── Send message to AI backend with SSE streaming ─────────
  const sendToAI = useCallback(
    async (text: string, imageBase64?: string | null, shouldAutoPlay?: boolean) => {
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
        isNew: true,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      setInput("");
      setSelectedAccount(null);

      // Scroll immediately when bot starts replying
      setTimeout(() => {
        scrollToBottom("auto", true);
      }, 50);

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
            history: messages
              .slice(-10)
              .map((m) => ({ type: m.type, text: m.text })),
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
                // Backend now streams the formatted text as token events
              } else if (event.type === "transaction_updated") {
                // Backend now streams the formatted text as token events
              } else if (event.type === "transaction_deleted") {
                // Backend now streams the formatted text as token events
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
        let finalBotText = "";
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === botId) {
              finalBotText = stripActions(m.text);
              return {
                ...m,
                isStreaming: false,
                text: finalBotText,
              };
            }
            return m;
          }),
        );
        abortRef.current = null;

        if (shouldAutoPlay && finalBotText) {
          playAudio(botId, finalBotText);
        }

        // Scroll to bottom after state settles
        setTimeout(() => {
          scrollToBottom("smooth", true);
        }, 100);
      }
    },
    [router, messages],
  );

  // ─── Send text message ─────────────────────────────────────
  const sendMessage = (text: string, isVoice: boolean = false) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      text: text.trim(),
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isNew: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Scroll immediately to ensure bubble is visible and above bottom input
    setTimeout(() => {
      scrollToBottom("auto", true);
    }, 50);

    if (capturedImage) {
      sendToAI(text, capturedImage, isVoice);
      setCapturedImage(null);
    } else {
      sendToAI(text, null, isVoice);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentVoiceMode = isVoiceMode;
    setIsVoiceMode(false); // Reset voice mode for next input

    if (capturedImage && !input.trim()) {
      sendMessage("Analisis gambar ini dan catat transaksinya", currentVoiceMode);
    } else {
      sendMessage(input, currentVoiceMode);
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

  // ─── Stop Streaming ────────────────────────────────────────
  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setIsTyping(false);
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
          <div
            style={{
              position: "relative",
              width: 120,
              height: 32,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Image
              src="/logo/logo.png"
              alt="Catatin"
              width={120}
              height={120}
              style={{ objectFit: "contain", height: "auto" }}
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
          paddingBottom: 20,
          overflowAnchor: "none", // explicitly DISABLE native scroll anchoring to avoid glitz when we manually calculate
        }}
      >
        <div ref={topRef} />
        {isLoadingHistory && page > 1 && (
          <div
            style={{
              position: "absolute",
              top: 96,
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--surface-container)",
              border: "1px solid var(--outline-variant)",
              backdropFilter: "blur(8px)",
              padding: "8px 16px",
              borderRadius: "100px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              zIndex: 40,
              color: "var(--on-surface)",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <style>{`
              @keyframes loader-spin {
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 16,
                animation: "loader-spin 1s linear infinite",
                color: "var(--primary)",
              }}
            >
              sync
            </span>
            Memuat riwayat...
          </div>
        )}

        {/* Loading Skeleton & Welcome Screen */}
        {!initialLoadDone ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              padding: "40px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                alignSelf: "flex-end",
                opacity: 0.4,
              }}
            >
              <div
                style={{
                  width: 180,
                  height: 48,
                  borderRadius: 16,
                  background: "var(--outline-variant)",
                  animation: "pulse 1.5s infinite",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignSelf: "flex-start",
                opacity: 0.4,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--outline-variant)",
                  animation: "pulse 1.5s infinite",
                }}
              />
              <div
                style={{
                  width: 220,
                  height: 60,
                  borderRadius: 16,
                  background: "var(--outline-variant)",
                  animation: "pulse 1.5s infinite",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignSelf: "flex-end",
                opacity: 0.4,
              }}
            >
              <div
                style={{
                  width: 140,
                  height: 48,
                  borderRadius: 16,
                  background: "var(--outline-variant)",
                  animation: "pulse 1.5s infinite",
                }}
              />
            </div>
          </div>
        ) : (
          displayMessages.length === 0 && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                padding: 24,
                marginTop: "10vh",
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
                Halo, Saya Catatin AI
              </h1>
              <p
                className="text-body-md"
                style={{ color: "var(--on-surface-variant)", maxWidth: 320 }}
              >
                Membantu kamu mencatat keuangan dengan bahasa sehari-hari. Cukup
                ketik atau kirim foto struk.
              </p>
            </div>
          )
        )}

        {/* Messages */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {displayMessages.map((msg, idx) => (
            <div
              key={msg.id}
              className={msg.isHistory ? "" : "animate-fade-slide-up"}
              style={
                msg.isHistory || msg.isNew
                  ? {}
                  : { animationDelay: `${idx * 0.05}s` }
              }
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
                    <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                      {msg.text.includes(
                        "Tolong analisis struk/gambar ini dengan detail",
                      )
                        ? msg.text
                            .replace(
                              /Tolong analisis struk.*?sesuai aturan\.?/g,
                              "📷 Mengirimkan struk untuk dianalisis...\n",
                            )
                            .trim()
                        : msg.text}
                    </p>
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
                  }}
                >
                  {msg.type === "bot" && (
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
                      <Image
                        src="/logo/logo.png"
                        alt="Bot"
                        width={70}
                        height={70}
                        style={{ objectFit: "contain", height: "auto" }}
                        priority
                      />
                    </div>
                  )}
                  {(() => {
                    const askMatch = msg.text.match(/\[ASK_ACCOUNT:(.*?)\]/);
                    const options = askMatch ? askMatch[1].split(",") : [];

                    const chartMatch = msg.text.match(/\[SHOW_CHART:(.*?)\]/);
                    const chartType = chartMatch ? chartMatch[1] : null;

                    let cleanText = msg.text
                      .replace(/\[ACTION[\s\S]*?(?:\[\/ACTION\]|$)/g, "")
                      .replace(/\[ASK_ACCOUNT[\s\S]*?(?:\]|$)/g, "")
                      .replace(/\[SHOW_CHART[\s\S]*?(?:\]|$)/g, "")
                      .trim();

                    const isProcessing =
                      msg.isStreaming && cleanText.length === 0 && !chartType;

                    return (
                      <>
                        <div
                          className="bubble-bot"
                          style={isProcessing ? { padding: "6px 12px" } : {}}
                        >
                          {isProcessing ? (
                            <div
                              style={{
                                width: 70,
                                height: 22,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                              }}
                            >
                              <Lottie
                                animationData={loadingJson}
                                loop={true}
                                style={{
                                  width: 220,
                                  height: 124,
                                  flexShrink: 0,
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="chat-md"
                              style={{ margin: 0 }}
                              dangerouslySetInnerHTML={{
                                __html: renderMarkdown(cleanText),
                              }}
                            />
                          )}
                          {msg.isStreaming && !isProcessing && (
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
                          {chartType && !msg.isStreaming && (
                            <ChartWidget type={chartType} />
                          )}
                        </div>
                        {options.length > 0 &&
                          !msg.isStreaming &&
                          idx === displayMessages.length - 1 && (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 8,
                                marginTop: 8,
                                marginLeft: 8,
                              }}
                            >
                              {options.map((opt) => {
                                const isSelected =
                                  selectedAccount === opt.trim();
                                return (
                                  <button
                                    key={opt}
                                    onClick={() => {
                                      sendToAI(opt.trim());
                                    }}
                                    style={{
                                      padding: "6px 16px",
                                      fontSize: 13,
                                      fontWeight: 500,
                                      borderRadius: 20,
                                      border:
                                        "1px solid var(--outline-variant)",
                                      background: "rgba(255,255,255,0.7)",
                                      color: "var(--on-surface-variant)",
                                      cursor: "pointer",
                                      boxShadow: "none",
                                      transition: "all 0.15s ease",
                                    }}
                                  >
                                    {opt.trim()}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        {options.length > 0 &&
                          !msg.isStreaming &&
                          selectedAccount && (
                            <button
                              onClick={() => {
                                sendMessage(`Gunakan akun ${selectedAccount}`);
                                setSelectedAccount(null);
                              }}
                              style={{
                                marginTop: 12,
                                marginLeft: 8,
                                padding: "10px 32px",
                                fontSize: 14,
                                fontWeight: 600,
                                borderRadius: 24,
                                border: "none",
                                background:
                                  "linear-gradient(135deg, var(--primary), var(--primary-container))",
                                color: "white",
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(79,55,138,0.3)",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: 18 }}
                              >
                                check
                              </span>
                              Selesai — Pakai {selectedAccount}
                            </button>
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
                      style={{
                        color: "rgba(73, 69, 81, 0.6)",
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        transform: "translateY(1px)",
                      }}
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
                  padding: "6px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 70,
                    height: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <Lottie
                    animationData={loadingJson}
                    loop={true}
                    style={{ width: 220, height: 124, flexShrink: 0 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Invisible spacer to ensure last message clears the fixed input box when scrolled into view */}
          <div
            ref={messagesEndRef}
            style={{ height: 160, flexShrink: 0, width: "100%" }}
          />
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
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setIsVoiceMode(false); }}
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
                padding: "8px 4px 8px 16px",
              }}
              id="chat-input"
            />
            {/* Mic Button */}
            {!input.trim() && !capturedImage && !isTyping && !messages.some(m => m.isStreaming) && (
              <button
                type="button"
                onClick={handleMicClick}
                style={{
                  background: isListening ? "rgba(255, 0, 0, 0.1)" : "transparent",
                  color: isListening ? "var(--error)" : "var(--on-surface-variant)",
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                aria-label="Voice Input"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 24, fontVariationSettings: isListening ? "'FILL' 1" : "'FILL' 0" }}>
                  {isListening ? "mic" : "mic_none"}
                </span>
              </button>
            )}
            
            {isTyping || messages.some((m) => m.isStreaming) ? (
              <button
                type="button"
                onClick={handleStop}
                style={{
                  background: "#ece6ee", // light gray matching var(--surface-container-high)
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease",
                }}
                aria-label="Batal"
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: "#1d1b20", // dark charcoal / on-surface
                    borderRadius: 2,
                  }}
                />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() && !capturedImage}
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
                }}
                aria-label="Kirim"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20 }}
                >
                  send
                </span>
              </button>
            )}
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

      {/* ─── Voice Input Modal ─── */}
      {isListening && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          animation: "fadeIn 0.2s ease-out"
        }}>
          <style>{`
            @keyframes pulseRing {
              0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
              70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(76, 175, 80, 0); }
              100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
          
          <div style={{
            background: "var(--surface)",
            padding: "32px",
            borderRadius: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            minWidth: "280px"
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(76, 175, 80, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
              animation: "pulseRing 2s infinite"
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#4CAF50", fontVariationSettings: "'FILL' 1" }}>
                mic
              </span>
            </div>
            
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem", color: "var(--on-surface)" }}>Mendengarkan...</h3>
            <p style={{ margin: "0 0 24px 0", fontSize: "0.9rem", color: "var(--on-surface-variant)", textAlign: "center" }}>
              Silakan bicara sekarang.<br/>(Contoh: "Beli kopi 25rb")
            </p>
            
            <button
              onClick={handleStopMic}
              style={{
                background: "var(--error)",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "100px",
                fontSize: "0.95rem",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "background 0.2s"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>stop_circle</span>
              Berhenti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
