"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const navItems = [
  { icon: "dashboard", href: "/dashboard", label: "Dashboard" },
  { icon: "chat_bubble", href: "/chat", label: "Chat" },
  { icon: "photo_camera", href: "#scan", label: "Scan" }, // Special item
  { icon: "account_balance_wallet", href: "/wallet", label: "Dompet" },
  { icon: "settings", href: "/settings", label: "Pengaturan" },
];

// ─── Lightweight Markdown → HTML (reused from chat) ──────────
function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic: require no space after first * and no space before last *
    .replace(/(?<!\*)\*(?!\s|\*)(.+?)(?<!\s|\*)\*(?!\*)/g, "<em>$1</em>")
    .replace(
      /`([^`]+)`/g,
      "<code style='background:rgba(0,0,0,0.06);padding:1px 5px;border-radius:4px;font-size:0.9em'>$1</code>",
    )
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
    )
    .replace(/\n/g, "<br>");

  html = html.replace(
    /(?:<br>|^)(?:- |\* |• )(.+?)(?=<br>|$)/g,
    (_, content) => {
      return `<br><span style="display:flex;gap:6px;align-items:flex-start;margin:2px 0"><span style="flex-shrink:0;margin-top:2px">•</span><span>${content}</span></span>`;
    },
  );

  return html;
}

// ─── Types ────────────────────────────────────────────────────
interface ScanResult {
  content: string;
  transactions?: {
    id: string;
    type: string;
    amount: number;
    description: string;
    category?: string;
  }[];
  error?: string;
}

type ScanPhase = "camera" | "preview" | "processing" | "result" | "success";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Dynamic dashboard path based on workspace selection
  const [dashboardHref, setDashboardHref] = useState("/dashboard");

  // Camera/Scanner state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [scanPhase, setScanPhase] = useState<ScanPhase>("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [userAccounts, setUserAccounts] = useState<{id: string, name: string}[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (pathname === "/dashboard" || pathname === "/dashboard/pos") {
        localStorage.setItem("active_dashboard", pathname);
        setDashboardHref(pathname);
      } else {
        const saved = localStorage.getItem("active_dashboard");
        if (saved) {
          setDashboardHref(saved);
        }
      }
    }
  }, [pathname]);


  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.accounts) setUserAccounts(data.accounts);
    } catch (e) {
      console.warn("Failed to fetch accounts", e);
    }
  };

  const handleOpenScan = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCloseScan = () => {
    setIsCameraOpen(false);
    setScanPhase("camera");
    setCapturedImage(null);
    setScanResult(null);
    setScanError(null);
    setSelectedAccount(null);
    setIsSaving(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Process receipt with AI ────────────────────────────────
  const processReceipt = async (
    base64Image: string,
    extraInstruction?: string,
  ) => {
    if (extraInstruction) {
      setIsRefining(true);
    } else {
      setScanPhase("processing");
    }
    setScanError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setScanError("Anda harus login terlebih dahulu.");
      setScanPhase("result");
      return;
    }

    try {
      let promptMsg =
        "Tolong analisis struk/gambar ini dengan detail. Ekstrak total akhir belanja sebagai transaksi. Tentukan secara mandiri jenisnya (Pengeluaran/Pemasukan, struk belanja biasanya Pengeluaran). Pastikan nominal 'amount' akurat. Jika ada logo/nama bank/dompet yang cocok dengan akun saya, asumsikan akun tersebut otomatis tanpa bertanya. Jika tidak ada petunjuk dompet di struk, bertanyalah dompet mana yang akan digunakan sesuai aturan.";
      if (extraInstruction) {
        promptMsg += " " + extraInstruction;
      }

      // Reset account selection before processing
      setSelectedAccount(null);

      const res = await fetch(`${API_BASE}/api/ai/chat/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: promptMsg,
          image: base64Image,
          draft: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setScanError(data.error || "Gagal memproses struk.");
        setScanPhase("result");
        return;
      }

      setScanResult({
        content: data.content,
        transactions: data.transactions,
      });
      setScanPhase("result");
    } catch (err: any) {
      setScanError(err.message || "Terjadi kesalahan saat menghubungi AI.");
      setScanPhase("result");
    } finally {
      setIsRefining(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCapturedImage(base64);
        setIsCameraOpen(true);
        setScanPhase("processing");
        fetchAccounts();
        processReceipt(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    handleCloseScan();
    setTimeout(() => {
      if (fileInputRef.current) fileInputRef.current.click();
    }, 100);
  };


  const handleConfirmAndSave = async () => {
    if (!scanResult || !scanResult.transactions || scanResult.transactions.length === 0) {
      handleCloseScan();
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem("token");
    
    // Resolve account ID if user selected one from the UI options
    let finalAccountId: string | undefined;
    if (selectedAccount) {
      const acc = userAccounts.find(a => a.name.toLowerCase() === selectedAccount.toLowerCase());
      if (acc) finalAccountId = acc.id;
    }

    try {
      for (const tx of scanResult.transactions) {
        const res = await fetch(`${API_BASE}/api/transactions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: tx.type,
            amount: tx.amount,
            description: tx.description,
            categoryId: (tx as any).categoryId,
            accountId: finalAccountId || (tx as any).accountId,
            date: (tx as any).date || new Date().toISOString(),
          }),
        });
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Gagal menyimpan transaksi dari server");
        }
      }
      // Transition smoothly to success phase
      setIsSaving(false);
      setScanPhase("success");
      
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("transactionSaved"));
      }
      
      // Auto-close after animation
      setTimeout(() => {
        handleCloseScan();
      }, 2500);

    } catch (e: any) {
      setScanError(e.message || "Gagal menyimpan transaksi");
      setIsSaving(false);
    }
  };

  return (
    <>
      <nav className="bottom-nav">
        {navItems.map((item, index) => {
          // Special center button for Scan
          if (item.label === "Scan") {
            return (
              <button
                key={item.label}
                onClick={handleOpenScan}
                className="bottom-nav-center-btn"
                aria-label="Scan struk belanja"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 32, color: "white" }}
                >
                  photo_camera
                </span>
              </button>
            );
          }

          let href = item.href;
          if (item.label === "Dashboard") {
            href = dashboardHref;
          }

          const isActive =
            pathname === href ||
            (item.label === "Dashboard" && pathname.startsWith("/dashboard")) ||
            (item.label === "Pengaturan" && pathname.startsWith("/settings"));

          return (
            <Link
              key={item.label}
              href={href}
              className={`bottom-nav-item ${isActive ? "active" : ""}`}
              aria-label={item.label}
              style={{
                marginRight: index === 1 ? "16px" : "0",
                marginLeft: index === 3 ? "16px" : "0",
              }}
            >
              <span
                className={`material-symbols-outlined ${isActive ? "filled" : ""}`}
              >
                {item.icon}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Camera Scanner View Overlay */}
      {isCameraOpen && (
        <div className="camera-overlay">
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              maxWidth: 420,
              alignItems: "center",
            }}
          >
            <div>
              <h3
                className="text-headline-sm"
                style={{ color: "white", fontWeight: 700 }}
              >
                AI Struk Scanner
              </h3>
              <p
                className="text-body-sm"
                style={{ color: "rgba(255,255,255,0.6)", marginTop: 2 }}
              >
                {scanPhase === "camera" && "Ambil foto struk belanja Anda"}
                {scanPhase === "preview" && "Periksa foto struk Anda"}
                {scanPhase === "processing" && "AI sedang membaca struk..."}
                {scanPhase === "result" && "Hasil pemindaian"}
              </p>
            </div>
            <button
              onClick={handleCloseScan}
              style={{
                color: "white",
                cursor: "pointer",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                transition: "background 0.2s",
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* ─── PHASE: Preview / Processing ─── */}
          {(scanPhase === "preview" || scanPhase === "processing") && (
            <div className="camera-viewfinder">
              {/* Frozen Captured Image */}
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Captured receipt"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}

              {/* Processing overlay on frozen image */}
              {scanPhase === "processing" && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    zIndex: 30,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      border: "4px solid rgba(207,188,255,0.3)",
                      borderTopColor: "var(--primary-fixed-dim)",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <p
                    className="text-body-md"
                    style={{ color: "white", fontWeight: 600 }}
                  >
                    AI sedang membaca struk...
                  </p>
                  <p
                    className="text-body-sm"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Harap tunggu beberapa detik
                  </p>
                </div>
              )}

              {/* Scanning laser line during processing */}
              {scanPhase === "processing" && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    width: "100%",
                    height: 4,
                    background:
                      "linear-gradient(90deg, transparent, rgba(207, 188, 255, 0.9), transparent)",
                    boxShadow:
                      "0 0 15px rgba(207, 188, 255, 0.9), 0 0 30px var(--primary)",
                    zIndex: 31,
                    animation: "laser-scan 1.5s ease-in-out infinite",
                  }}
                />
              )}
            </div>
          )}

          {/* ─── PHASE: Result & Success ─── */}
          {(scanPhase === "result" || scanPhase === "success") && (
            <div
              style={{
                width: "calc(100% + 40px)", // counteract the 20px padding of camera-overlay
                maxWidth: 460,
                flex: 1,
                minHeight: 0, // Fix flex overflow bug
                display: "flex",
                flexDirection: "column",
                borderRadius: "24px 24px 0 0",
                background: "var(--surface)",
                boxShadow: "0 -8px 32px rgba(0,0,0,0.2)",
                margin: "16px -20px -24px -20px", // pulls the sheet to bottom and edges
                overflow: "hidden",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  flex: 1,
                  minHeight: 0, // Fix flex overflow bug
                  overflowY: "auto",
                  WebkitOverflowScrolling: "touch",
                  padding: "24px 20px 32px 20px", // Extra padding at bottom for breathing room
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                {scanError ? (
                  /* Error State */
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 12,
                      padding: "32px 16px",
                      textAlign: "center",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 48, color: "#ef5350" }}
                    >
                      error_outline
                    </span>
                    <p
                      className="text-body-md"
                      style={{ color: "var(--on-surface)", lineHeight: 1.5 }}
                    >
                      {scanError}
                    </p>
                  </div>
                ) : scanPhase === "success" ? (
                  /* Success State Overlay */
                  <div
                    className="animate-fade-in"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 24,
                      padding: "60px 16px",
                      textAlign: "center",
                      height: "100%",
                    }}
                  >
                    <div style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "rgba(76, 175, 80, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: "pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                    }}>
                      <span
                        className="material-symbols-outlined"
                        style={{ 
                          fontSize: 48, 
                          color: "#4CAF50",
                        }}
                      >
                        check_circle
                      </span>
                    </div>
                    <div>
                      <h3 className="text-headline-sm" style={{ color: "var(--on-surface)", marginBottom: 8, fontWeight: 700 }}>
                        Berhasil Disimpan!
                      </h3>
                      <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>
                        Transaksi Anda sudah aman tercatat.
                      </p>
                    </div>
                  </div>
                ) : scanResult ? (
                  /* Success State */
                  (() => {
                    const askMatch = scanResult.content.match(
                      /\[ASK_ACCOUNT:(.*?)\]/,
                    );
                    const options = askMatch ? askMatch[1].split(",") : [];

                    const cleanText = scanResult.content
                      .replace(/\[ACTION[\s\S]*?(?:\[\/ACTION\]|$)/g, "")
                      .replace(/\[ASK_ACCOUNT[\s\S]*?(?:\]|$)/g, "")
                      .replace(/\[SHOW_CHART[\s\S]*?(?:\]|$)/g, "")
                      .trim();

                    return (
                      <>
                        {/* AI Response */}
                        <div
                          style={{
                            background: "var(--surface-container-low)",
                            borderRadius: 20,
                            padding: 20,
                            border: "1px solid var(--outline-variant)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 12,
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{
                                fontSize: 20,
                                color: "var(--primary)",
                              }}
                            >
                              smart_toy
                            </span>
                            <span
                              className="text-label-md"
                              style={{
                                color: "var(--primary)",
                                fontWeight: 700,
                              }}
                            >
                              Catatin AI
                            </span>
                          </div>
                          <div
                            className="chat-md"
                            style={{
                              color: "var(--on-surface)",
                              fontSize: 14,
                              lineHeight: 1.7,
                            }}
                            dangerouslySetInnerHTML={{
                              __html: renderMarkdown(cleanText),
                            }}
                          />

                          {/* Account Selection Options or Refining Loader */}
                          {isRefining ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                marginTop: 20,
                              }}
                            >
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  border: "3px solid var(--outline-variant)",
                                  borderTopColor: "var(--primary)",
                                  animation: "spin 1s linear infinite",
                                }}
                              />
                              <span
                                className="text-body-sm"
                                style={{ color: "var(--on-surface-variant)" }}
                              >
                                Mencatat transaksi...
                              </span>
                            </div>
                          ) : (
                            options.length > 0 &&
                            capturedImage && (
                              <>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 12,
                                    marginTop: 20,
                                  }}
                                >
                                  {options.map((opt) => {
                                    const isSelected =
                                      selectedAccount === opt.trim();
                                    return (
                                      <button
                                        key={opt}
                                        onClick={() =>
                                          setSelectedAccount(
                                            isSelected ? null : opt.trim(),
                                          )
                                        }
                                        disabled={isRefining}
                                        style={{
                                          padding: "10px 20px",
                                          fontSize: 14,
                                          fontWeight: isSelected ? 600 : 500,
                                          borderRadius: 24,
                                          border: isSelected
                                            ? "2px solid var(--primary)"
                                            : "1px solid var(--outline-variant)",
                                          background: isSelected
                                            ? "var(--primary-container)"
                                            : "rgba(255,255,255,0.7)",
                                          color: isSelected
                                            ? "var(--on-primary-container)"
                                            : "var(--on-surface-variant)",
                                          cursor: "pointer",
                                          boxShadow: isSelected
                                            ? "0 2px 8px rgba(79,55,138,0.2)"
                                            : "none",
                                          transition: "all 0.15s ease",
                                          opacity: isRefining ? 0.5 : 1,
                                        }}
                                      >
                                        Pakai {opt.trim()}
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            )
                          )}
                        </div>

                        {/* Transactions created */}
                        {scanResult.transactions &&
                          scanResult.transactions.length > 0 && (
                            <div
                              style={{
                                background: "rgba(76, 175, 80, 0.1)",
                                borderRadius: 16,
                                padding: 16,
                                border: "1px solid rgba(76, 175, 80, 0.2)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  marginBottom: 12,
                                }}
                              >
                                <span
                                  className="material-symbols-outlined"
                                  style={{ fontSize: 20, color: "#66BB6A" }}
                                >
                                  check_circle
                                </span>
                                <span
                                  className="text-label-md"
                                  style={{ color: "#66BB6A", fontWeight: 700 }}
                                >
                                  {scanResult.transactions.length} transaksi
                                  siap dicatat
                                </span>
                              </div>
                              {scanResult.transactions.map((tx, i) => (
                                <div
                                  key={tx.id || i}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "8px 0",
                                    borderTop:
                                      i > 0
                                        ? "1px solid rgba(102, 187, 106, 0.2)"
                                        : "none",
                                  }}
                                >
                                  <span
                                    className="text-body-sm"
                                    style={{
                                      color: "var(--on-surface-variant)",
                                    }}
                                  >
                                    {tx.description}
                                  </span>
                                  <span
                                    className="text-body-sm"
                                    style={{
                                      color:
                                        tx.type === "INCOME"
                                          ? "#66BB6A"
                                          : "#ef5350",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {tx.type === "INCOME" ? "+" : "-"}Rp
                                    {tx.amount.toLocaleString("id-ID")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                      </>
                    );
                  })()
                ) : null}
              </div>

              {/* Bottom Action Bar inside the sheet */}
              {scanPhase === "result" && (
                <div
                  style={{
                    padding: "12px 16px 24px",
                    background: "var(--surface)",
                    borderTop: "1px solid var(--outline-variant)",
                    display: "flex",
                    gap: 10,
                    width: "100%",
                  }}
                >
                  <button
                    onClick={handleRetake}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      borderRadius: 20,
                      background: "var(--surface-container-highest)",
                      border: "none",
                      color: "var(--on-surface)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 18 }}
                    >
                      photo_camera
                    </span>
                    Scan Lagi
                  </button>
                  {(() => {
                    const askMatch = scanResult?.content?.match(/\[ASK_ACCOUNT:(.*?)\]/);
                    const needsAccount = askMatch && askMatch[1].split(",").length > 0;
                    const isReady = !needsAccount || selectedAccount !== null;

                    return (
                      <button
                        onClick={handleConfirmAndSave}
                        disabled={isSaving || !isReady}
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          borderRadius: 20,
                          background: "var(--primary)",
                          border: "none",
                          color: "var(--on-primary)",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: isReady ? "pointer" : "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          boxShadow: isReady ? "0 4px 16px rgba(79, 55, 138, 0.4)" : "none",
                          transition: "opacity 0.2s",
                          opacity: isSaving || !isReady ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = isSaving || !isReady ? "0.5" : "0.9")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = isSaving || !isReady ? "0.5" : "1")}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 18 }}
                        >
                          {isSaving ? "hourglass_empty" : "check"}
                        </span>
                        {isSaving ? "Menyimpan..." : "Konfirmasi & Simpan"}
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

            {/* Processing Phase: just a subtle hint */}
            {scanPhase === "processing" && (
              <p
                className="text-body-sm"
                style={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}
              >
                Sedang menganalisa struk dengan AI Vision...
              </p>
            )}
        </div>
      )}

      {/* Hidden Native Camera/Gallery Picker */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        style={{ display: "none" }} 
      />
    </>
  );
}
