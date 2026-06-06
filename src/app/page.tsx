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
      }}
    >
      <img
        src="/icon-192.png"
        alt="Catatin Logo"
        style={{ 
          width: 80, 
          height: 80, 
          marginBottom: 32,
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" 
        }}
      />
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "3px solid var(--surface-container-highest)",
          borderTopColor: "var(--primary)",
          animation: "spin 1s linear infinite",
        }}
      />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
      `}} />
    </div>
  );
}
