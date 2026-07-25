"use client";

import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "success",
  isOpen,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const getBgColor = () => {
    if (type === "error") return "rgba(239, 68, 68, 0.95)";
    if (type === "info") return "rgba(59, 130, 246, 0.95)";
    return "rgba(16, 185, 129, 0.95)"; // success emerald
  };

  const getIcon = () => {
    if (type === "error") return "error";
    if (type === "info") return "info";
    return "check_circle";
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 20px",
        borderRadius: 99,
        background: getBgColor(),
        color: "#ffffff",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "toastSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: "auto",
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
        {getIcon()}
      </span>
      <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.8)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: 0,
          marginLeft: 4,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
          close
        </span>
      </button>

      <style jsx>{`
        @keyframes toastSlideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}
