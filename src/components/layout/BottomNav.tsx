"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const navItems = [
  { icon: "dashboard", href: "/dashboard", label: "Dashboard" },
  { icon: "chat_bubble", href: "/chat", label: "Chat" },
  { icon: "photo_camera", href: "#scan", label: "Scan" }, // Special item
  { icon: "account_balance_wallet", href: "/wallet", label: "Dompet" },
  { icon: "settings", href: "/settings", label: "Pengaturan" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Dynamic dashboard path based on workspace selection
  const [dashboardHref, setDashboardHref] = useState("/dashboard");
  
  // Camera Modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn("Camera access denied or unavailable. Running in simulation mode.", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleOpenScan = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCameraOpen(true);
    startCamera();
  };

  const handleCloseScan = () => {
    stopCamera();
    setIsCameraOpen(false);
    setIsScanning(false);
    setIsFlashing(false);
  };

  const handleCapture = () => {
    // 1. Shutter flash effect
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
      // 2. Start laser scanning animation
      setIsScanning(true);
      
      // 3. After scan finishes, redirect to chat with query parameters
      setTimeout(() => {
        stopCamera();
        setIsCameraOpen(false);
        setIsScanning(false);
        router.push("/chat?scan=success");
      }, 2000);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

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
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: "white" }}>
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
              <span className={`material-symbols-outlined ${isActive ? "filled" : ""}`}>
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
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 420, alignItems: "center" }}>
            <div>
              <h3 className="text-headline-sm" style={{ color: "white", fontWeight: 700 }}>AI Struk Scanner</h3>
              <p className="text-body-sm" style={{ color: "rgba(255,255,255,0.6)", marginTop: 2 }}>Ambil foto struk belanja Anda</p>
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
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Viewfinder Target Container */}
          <div className="camera-viewfinder">
            {/* Real Camera Video Feed */}
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 24 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 64, color: "var(--primary-fixed-dim)", opacity: 0.6 }}>receipt_long</span>
                <p className="text-body-sm" style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", marginTop: 12, lineHeight: "20px" }}>
                  Kamera tidak aktif/tersedia.<br />Menggunakan demonstrasi struk belanja.
                </p>

                {/* Simulated Receipt Preview */}
                <div 
                  className="glass-card" 
                  style={{ 
                    width: "90%", 
                    padding: 16, 
                    background: "rgba(255,255,255,0.06)", 
                    border: "1px solid rgba(255,255,255,0.1)", 
                    borderRadius: 16, 
                    marginTop: 12 
                  }}
                >
                  <div style={{ borderBottom: "1px dashed rgba(255,255,255,0.15)", paddingBottom: 8, marginBottom: 8, textAlign: "center" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "white" }}>TOKO KOPI SEJAHTERA</p>
                    <p style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>Mampang Prapatan, Jakarta</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4, color: "rgba(255,255,255,0.8)" }}>
                    <span>2x Ice Latte Premium</span>
                    <span>Rp 70.000</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 12, color: "rgba(255,255,255,0.8)" }}>
                    <span>1x Croissant Coklat</span>
                    <span>Rp 28.000</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "white" }}>
                    <span>TOTAL</span>
                    <span>Rp 98.000</span>
                  </div>
                </div>
              </div>
            )}

            {/* Target Alignment Guide Corners */}
            <div style={{ position: "absolute", top: 20, left: 20, width: 24, height: 24, borderTop: "4px solid white", borderLeft: "4px solid white", borderRadius: "6px 0 0 0" }} />
            <div style={{ position: "absolute", top: 20, right: 20, width: 24, height: 24, borderTop: "4px solid white", borderRight: "4px solid white", borderRadius: "0 6px 0 0" }} />
            <div style={{ position: "absolute", bottom: 20, left: 20, width: 24, height: 24, borderBottom: "4px solid white", borderLeft: "4px solid white", borderRadius: "0 0 0 6px" }} />
            <div style={{ position: "absolute", bottom: 20, right: 20, width: 24, height: 24, borderBottom: "4px solid white", borderRight: "4px solid white", borderRadius: "0 0 6px 0" }} />

            {/* Scanning Line Laser effect */}
            {isScanning && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  width: "100%",
                  height: 4,
                  background: "linear-gradient(90deg, transparent, rgba(207, 188, 255, 0.9), transparent)",
                  boxShadow: "0 0 15px rgba(207, 188, 255, 0.9), 0 0 30px var(--primary)",
                  zIndex: 10,
                  animation: "laser-scan 1.5s ease-in-out infinite",
                }}
              />
            )}

            {/* Flash Effect on Capture */}
            {isFlashing && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "white",
                  zIndex: 20,
                  animation: "camera-flash 0.15s ease-out forwards",
                }}
              />
            )}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%" }}>
            {isScanning ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", margin: "8px 0" }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--primary-fixed-dim)",
                        animation: `typing-dot 1s ease-in-out ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-body-md" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>AI sedang memproses struk...</p>
              </div>
            ) : (
              <>
                <button
                  onClick={handleCapture}
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    background: "white",
                    border: "6px solid rgba(255,255,255,0.25)",
                    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
                    cursor: "pointer",
                    transition: "transform 0.1s active",
                  }}
                  aria-label="Ambil foto"
                />
                <p className="text-label-md" style={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
                  Posisikan struk dalam kotak petunjuk untuk pemindaian otomatis
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
