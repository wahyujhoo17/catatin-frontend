"use client";

import React from "react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title = "Hapus Transaksi?",
  description = "Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan dan saldo akan otomatis disesuaikan.",
  confirmLabel = "Ya, Hapus",
  cancelLabel = "Batal",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 350,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        className="animate-fade-slide-up"
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--surface)",
          borderRadius: 24,
          padding: 24,
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Warning Badge Icon */}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 20,
            background: "rgba(239, 68, 68, 0.12)",
            color: "#ef4444",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
            delete_forever
          </span>
        </div>

        <h3
          style={{
            fontSize: 19,
            fontWeight: 800,
            color: "var(--on-surface)",
            margin: "0 0 8px 0",
            letterSpacing: "-0.3px",
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontSize: 13,
            color: "var(--on-surface-variant)",
            margin: "0 0 24px 0",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 14,
              border: "1px solid var(--outline-variant)",
              background: "var(--surface)",
              color: "var(--on-surface)",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 14,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              boxShadow: "0 4px 14px rgba(239, 68, 68, 0.35)",
              transition: "transform 0.15s ease",
            }}
          >
            {isLoading ? "Menghapus..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
