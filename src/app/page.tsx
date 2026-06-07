"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // Wait until auth check is done
    if (isLoggedIn) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  // Show splash screen while determining auth state
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background ambient glow */}
      <div 
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60vw",
          height: "60vw",
          background: "radial-gradient(circle, rgba(103, 80, 164, 0.15) 0%, rgba(255,255,255,0) 70%)",
          borderRadius: "50%",
          zIndex: 0,
          animation: "pulse-glow 3s ease-in-out infinite alternate"
        }}
      />
      
      <img
        src="/logo/logo.png"
        alt="Catatin Logo"
        style={{ 
          width: 200, 
          height: "auto", 
          marginBottom: 40,
          zIndex: 1,
          animation: "float 3s ease-in-out infinite" 
        }}
        onError={(e) => {
          // Fallback to icon-192.png if logo.png is missing or failing
          (e.target as HTMLImageElement).src = "/icon-192.png";
        }}
      />
      
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "3px solid var(--surface-container-highest)",
          borderTopColor: "var(--primary)",
          animation: "spin 1s linear infinite",
          zIndex: 1
        }}
      />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.9); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}} />
    </div>
  );
}
