"use client";

import React, { useState, useRef } from "react";

interface SwipeableMutasiCardProps {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  onClickDetail: () => void;
}

export default function SwipeableMutasiCard({
  children,
  onEdit,
  onDelete,
  onClickDetail,
}: SwipeableMutasiCardProps) {
  const [offsetX, setOffsetX] = useState(0); // 0 to -120px
  const [isOpen, setIsOpen] = useState(false);
  const startXRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX;
    isDraggingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (startXRef.current === null) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - startXRef.current;
    if (Math.abs(diff) > 5) {
      isDraggingRef.current = true;
    }
    if (isOpen) {
      const newOffset = Math.max(Math.min(-120 + diff, 0), -140);
      setOffsetX(newOffset);
    } else {
      const newOffset = Math.max(Math.min(diff, 0), -140);
      setOffsetX(newOffset);
    }
  };

  const handleTouchEnd = () => {
    startXRef.current = null;
    if (offsetX < -40) {
      setOffsetX(-120);
      setIsOpen(true);
    } else {
      setOffsetX(0);
      setIsOpen(false);
    }
  };

  const toggleSwipe = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setOffsetX(0);
      setIsOpen(false);
    } else {
      setOffsetX(-120);
      setIsOpen(true);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        userSelect: "none",
        background: "var(--surface)",
      }}
    >
      {/* Action Buttons Revealed on Swipe Left (Positioned on the RIGHT) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-evenly",
          padding: "0 8px",
          zIndex: 1,
          opacity: isOpen || offsetX !== 0 ? 1 : 0,
          transition: "opacity 0.15s ease",
          pointerEvents: isOpen || offsetX !== 0 ? "auto" : "none",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOffsetX(0);
            setIsOpen(false);
            onEdit();
          }}
          title="Edit Transaksi"
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            edit
          </span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setOffsetX(0);
            setIsOpen(false);
            onDelete();
          }}
          title="Hapus Transaksi"
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "#ef4444",
            color: "#fff",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            delete
          </span>
        </button>
      </div>

      {/* Foreground Main Card Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={(e) => {
          if (startXRef.current !== null) handleTouchMove(e);
        }}
        onMouseUp={() => {
          if (startXRef.current !== null) handleTouchEnd();
        }}
        onClick={() => {
          if (isDraggingRef.current) return;
          if (isOpen) {
            setOffsetX(0);
            setIsOpen(false);
          } else {
            onClickDetail();
          }
        }}
        style={{
          position: "relative",
          zIndex: 2,
          transform: `translateX(${offsetX}px)`,
          transition: startXRef.current
            ? "none"
            : "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
          background: "var(--surface)",
          borderRadius: 16,
        }}
      >
        {children}

        {/* Swipe Indicator Chevron Inside Card Right Edge */}
        <div
          onClick={toggleSwipe}
          title={isOpen ? "Tutup Aksi" : "Geser Kiri untuk Aksi"}
          style={{
            position: "absolute",
            top: "50%",
            right: 10,
            transform: `translateY(-50%) ${isOpen ? "rotate(180deg)" : "rotate(0deg)"}`,
            transition: "transform 0.25s ease, opacity 0.2s ease",
            cursor: "pointer",
            color: "var(--on-surface-variant)",
            opacity: 0.4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            zIndex: 3,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 18, color: "var(--on-surface-variant)" }}
          >
            chevron_left
          </span>
        </div>
      </div>
    </div>
  );
}
