"use client";

import { useEffect, useState } from "react";

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidManual, setShowAndroidManual] = useState(false);

  useEffect(() => {
    // 1. SSR check (ensure runs only on client side)
    if (typeof window === "undefined") return;

    // 2. Check if already running in standalone PWA mode
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true;

    // 3. Check if permanently dismissed by user
    const isDismissed = localStorage.getItem("pwa-prompt-dismissed") === "true";

    if (isStandalone || isDismissed) {
      return;
    }

    // 4. Identify Device OS
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isiOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /Android/i.test(userAgent);

    // If not mobile, do not show PWA prompt
    if (!isiOS && !isAndroid) {
      return;
    }

    if (isiOS) {
      setDeviceType("ios");
      // Delay prompt appearance for smooth UX
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (isAndroid) {
      // Listen for browser PWA prompt event (Android/Chrome)
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setDeviceType("android");
        
        // Delay prompt appearance
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 1500);
        return () => clearTimeout(timer);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      // Fallback: if browser doesn't trigger beforeinstallprompt within 5 seconds,
      // but it is an Android device, show the manual guide
      const fallbackTimer = setTimeout(() => {
        if (!deferredPrompt && !showPrompt) {
          setDeviceType("android");
          setShowPrompt(true);
          setShowAndroidManual(true);
        }
      }, 5000);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        clearTimeout(fallbackTimer);
      };
    }
  }, [deferredPrompt, showPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show native prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      // User accepted, dismiss PWA prompt permanently
      localStorage.setItem("pwa-prompt-dismissed", "true");
      setShowPrompt(false);
    }
    
    // Clear deferredPrompt
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    // Dismiss temporarily for this session (close prompt now)
    setShowPrompt(false);
  };

  const handleDismissPermanent = () => {
    // Dismiss permanently
    localStorage.setItem("pwa-prompt-dismissed", "true");
    setShowPrompt(false);
  };

  if (!showPrompt || !deviceType) return null;

  return (
    <>
      <style>{`
        @keyframes pwa-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pwa-slide-up {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .pwa-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          z-index: 9999;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 16px;
          animation: pwa-fade-in 0.25s ease-out forwards;
        }
        .pwa-card {
          background: var(--surface-container-lowest, #ffffff);
          border: 1px solid var(--outline-variant, rgba(0, 0, 0, 0.08));
          border-radius: 24px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: pwa-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          color: var(--on-surface, #1d1b20);
        }
        .pwa-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .pwa-logo {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(0, 0, 0, 0.04);
        }
        .pwa-title-container {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .pwa-title {
          font-family: 'Geist', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: var(--on-surface, #1d1b20);
          line-height: 1.25;
        }
        .pwa-subtitle {
          font-size: 13px;
          color: var(--on-surface-variant, #494551);
          margin-top: 2px;
          line-height: 1.35;
        }
        .pwa-close-btn {
          background: transparent;
          border: none;
          color: var(--on-surface-variant, #494551);
          padding: 4px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .pwa-close-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        .pwa-steps {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: var(--surface-container-low, #f8f2fa);
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.02);
        }
        .pwa-steps-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--primary, #4f378a);
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-bottom: 4px;
        }
        .pwa-step-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 13px;
          line-height: 1.45;
          color: var(--on-surface, #1d1b20);
        }
        .pwa-step-number {
          background: var(--primary, #4f378a);
          color: var(--on-primary, #ffffff);
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .pwa-step-text {
          flex: 1;
        }
        .pwa-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          margin-top: 4px;
        }
        .pwa-btn-primary {
          background: linear-gradient(135deg, #6750a4 0%, #4f378a 100%);
          color: var(--on-primary, #ffffff);
          border: none;
          border-radius: 14px;
          padding: 12px 20px;
          font-family: 'Geist', sans-serif;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(79, 55, 138, 0.2);
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
        }
        .pwa-btn-primary:hover {
          opacity: 0.95;
        }
        .pwa-btn-primary:active {
          transform: scale(0.98);
        }
        .pwa-btn-secondary {
          background: transparent;
          border: 1px solid var(--outline-variant, #cbc4d2);
          color: var(--on-surface-variant, #494551);
          border-radius: 14px;
          padding: 11px 20px;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .pwa-btn-secondary:hover {
          background: rgba(0, 0, 0, 0.02);
        }
        .pwa-footer-links {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
          padding: 0 4px;
        }
        .pwa-btn-text {
          background: transparent;
          border: none;
          color: var(--on-surface-variant, #494551);
          font-size: 11px;
          font-weight: 500;
          text-decoration: underline;
          cursor: pointer;
          transition: color 0.2s;
        }
        .pwa-btn-text:hover {
          color: var(--primary, #4f378a);
        }
      `}</style>

      <div className="pwa-overlay" onClick={handleDismiss}>
        <div className="pwa-card" onClick={(e) => e.stopPropagation()}>
          <div className="pwa-header">
            <img src="/icon-192.png" alt="Catatin Logo" className="pwa-logo" />
            <div className="pwa-title-container">
              <span className="pwa-title">Pasang Aplikasi Catatin</span>
              <span className="pwa-subtitle">
                Akses pencatatan keuangan Anda lebih cepat dan mudah dari layar utama.
              </span>
            </div>
            <button className="pwa-close-btn" onClick={handleDismiss} aria-label="Tutup">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>
          </div>

          {/* iOS Tutorial */}
          {deviceType === "ios" && (
            <div className="pwa-steps">
              <div className="pwa-steps-title">Panduan Instalasi iOS</div>
              <div className="pwa-step-item">
                <div className="pwa-step-number">1</div>
                <div className="pwa-step-text">
                  Buka aplikasi ini menggunakan browser <strong>Safari</strong> bawaan.
                </div>
              </div>
              <div className="pwa-step-item">
                <div className="pwa-step-number">2</div>
                <div className="pwa-step-text">
                  Ketuk tombol <strong>Bagikan (Share)</strong>{" "}
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--primary)", verticalAlign: "middle" }}>
                    share
                  </span>{" "}
                  di bar menu Safari bawah.
                </div>
              </div>
              <div className="pwa-step-item">
                <div className="pwa-step-number">3</div>
                <div className="pwa-step-text">
                  Gulir ke bawah dan ketuk opsi <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>{" "}
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--primary)", verticalAlign: "middle" }}>
                    add_to_home_screen
                  </span>.
                </div>
              </div>
              <div className="pwa-step-item">
                <div className="pwa-step-number">4</div>
                <div className="pwa-step-text">
                  Ketuk tombol <strong>Tambah (Add)</strong> di pojok kanan atas untuk menyelesaikan.
                </div>
              </div>
            </div>
          )}

          {/* Android: Quick Install (when beforeinstallprompt was fired) */}
          {deviceType === "android" && !showAndroidManual && deferredPrompt && (
            <div className="pwa-actions">
              <button className="pwa-btn-primary" onClick={handleInstallClick}>
                <span className="material-symbols-outlined">download</span>
                Instal Sekarang
              </button>
              <button className="pwa-btn-secondary" onClick={handleDismiss}>
                Nanti Saja
              </button>
            </div>
          )}

          {/* Android: Manual Guide (fallback or when requested) */}
          {deviceType === "android" && (showAndroidManual || !deferredPrompt) && (
            <div className="pwa-steps">
              <div className="pwa-steps-title">Panduan Instalasi Android</div>
              <div className="pwa-step-item">
                <div className="pwa-step-number">1</div>
                <div className="pwa-step-text">
                  Ketuk tombol <strong>Menu Tiga Titik</strong>{" "}
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--primary)", verticalAlign: "middle" }}>
                    more_vert
                  </span>{" "}
                  di pojok kanan atas browser (Chrome).
                </div>
              </div>
              <div className="pwa-step-item">
                <div className="pwa-step-number">2</div>
                <div className="pwa-step-text">
                  Pilih menu <strong>Instal aplikasi</strong> atau <strong>Tambahkan ke Layar Utama</strong>{" "}
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--primary)", verticalAlign: "middle" }}>
                    add_to_home_screen
                  </span>.
                </div>
              </div>
              <div className="pwa-step-item">
                <div className="pwa-step-number">3</div>
                <div className="pwa-step-text">
                  Konfirmasi penginstalan pada pop-up dialog yang muncul.
                </div>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="pwa-footer-links">
            {deviceType === "android" && deferredPrompt && (
              <button 
                className="pwa-btn-text" 
                onClick={() => setShowAndroidManual(!showAndroidManual)}
              >
                {showAndroidManual ? "Kembali ke Instalasi Cepat" : "Lihat Panduan Manual"}
              </button>
            )}
            {!(deviceType === "android" && deferredPrompt) && <div />}
            
            <button className="pwa-btn-text" onClick={handleDismissPermanent}>
              Jangan ingatkan lagi
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
