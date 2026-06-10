"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface CategoryBreakdownItem {
  name: string;
  icon: string;
  color: string;
  amount: number;
  count: number;
  percentage: number;
}

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  expenseRatio: number;
  avgDailyExpense: number;
  recommendation: string;
}

interface AccountItem {
  id: string;
  name: string;
  type: "CASH" | "BANK" | "E_WALLET";
  balance: number;
  icon: string | null;
  color: string | null;
}

interface StatsBreakdownDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SummaryData | null;
  categoryBreakdown: CategoryBreakdownItem[];
  accounts: AccountItem[];
  rangeLabel: string;
}

function formatRupiahFull(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function getAccountIcon(type: string, customIcon: string | null): string {
  if (customIcon && customIcon !== "wallet" && customIcon !== "payments") return customIcon;
  if (type === "BANK") return "account_balance";
  if (type === "E_WALLET") return "account_balance_wallet";
  return "payments";
}

function getAccountTypeLabel(type: string): string {
  if (type === "BANK") return "Bank";
  if (type === "E_WALLET") return "E-Wallet";
  return "Tunai / Cash";
}

export default function StatsBreakdownDrawer({
  isOpen,
  onClose,
  summary,
  categoryBreakdown,
  accounts,
  rangeLabel,
}: StatsBreakdownDrawerProps) {
  // Client-side portal mounting check
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Self-contained scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
        onClick={onClose}
        className="animate-fade-in"
      />

      {/* Modal Content */}
      <div
        className="animate-fade-slide-up"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 500,
          background: "var(--surface)",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: "24px 24px 32px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <h3 className="text-headline-sm" style={{ margin: 0 }}>
              Detail Statistik
            </h3>
            <p className="text-body-sm" style={{ color: "var(--on-surface-variant)", margin: "4px 0 0 0" }}>
              Periode: {rangeLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--surface-variant)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--on-surface-variant)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20 }}
            >
              close
            </span>
          </button>
        </div>

        {/* Body (Scrollable container items) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {summary && (
            <>
              {/* Financial Metrics Summary */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: "rgba(33, 150, 243, 0.08)",
                    border: "1px solid rgba(33, 150, 243, 0.15)",
                    padding: 16,
                    borderRadius: 16,
                  }}
                >
                  <p className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>
                    Total Pemasukan
                  </p>
                  <p className="text-title-lg" style={{ color: "#1976d2", fontWeight: 700, marginTop: 4 }}>
                    {formatRupiahFull(summary.totalIncome)}
                  </p>
                </div>
                <div
                  style={{
                    background: "rgba(244, 67, 54, 0.08)",
                    border: "1px solid rgba(244, 67, 54, 0.15)",
                    padding: 16,
                    borderRadius: 16,
                  }}
                >
                  <p className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>
                    Total Pengeluaran
                  </p>
                  <p className="text-title-lg" style={{ color: "#c62828", fontWeight: 700, marginTop: 4 }}>
                    {formatRupiahFull(summary.totalExpense)}
                  </p>
                </div>
                <div
                  style={{
                    background: "rgba(33, 150, 243, 0.08)",
                    border: "1px solid rgba(33, 150, 243, 0.15)",
                    padding: 16,
                    borderRadius: 16,
                    gridColumn: "span 2",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>
                        Sisa Uang (Net)
                      </p>
                      <p
                        className="text-headline-sm"
                        style={{
                          color: summary.netSavings >= 0 ? "var(--primary)" : "var(--error)",
                          fontWeight: 700,
                          marginTop: 4,
                        }}
                      >
                        {formatRupiahFull(summary.netSavings)}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>
                        Rata-rata Pengeluaran
                      </p>
                      <p className="text-title-md" style={{ color: "var(--on-surface)", fontWeight: 600 }}>
                        {formatRupiahFull(summary.avgDailyExpense)} /hari
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expense Ratio Progress Bar */}
              <div
                style={{
                  background: "rgba(0,0,0,0.02)",
                  border: "1px solid rgba(0,0,0,0.05)",
                  padding: 16,
                  borderRadius: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span className="text-label-lg" style={{ fontWeight: 600 }}>
                    Rasio Pengeluaran
                  </span>
                  <span
                    className="text-label-lg"
                    style={{
                      color: summary.expenseRatio > 80 ? "var(--error)" : "var(--on-surface-variant)",
                      fontWeight: 700,
                    }}
                  >
                    {summary.expenseRatio}%
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 4,
                    background: "rgba(0,0,0,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(summary.expenseRatio, 100)}%`,
                      background: summary.expenseRatio > 80 ? "var(--error)" : "var(--primary)",
                      borderRadius: 4,
                      transition: "width 0.5s ease-out",
                    }}
                  />
                </div>
                <p className="text-body-sm" style={{ color: "var(--on-surface-variant)", marginTop: 8 }}>
                  Persentase pemasukan yang kamu habiskan untuk pengeluaran.
                </p>
              </div>
            </>
          )}

          {/* Account Balance Breakdown */}
          {accounts && accounts.length > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h4 className="text-title-sm" style={{ margin: 0, color: "var(--on-surface)", fontWeight: 700 }}>
                  Rincian Saldo Akun & Dompet
                </h4>
                <span className="text-body-md" style={{ color: "var(--primary)", fontWeight: 700 }}>
                  Total: {formatRupiahFull(accounts.reduce((sum, a) => sum + a.balance, 0))}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      borderRadius: 16,
                      background: "var(--surface-variant)",
                      border: "1px solid var(--outline-variant)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: acc.color ? acc.color + "15" : "rgba(103, 80, 164, 0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ color: acc.color || "var(--primary)", fontSize: 20 }}
                        >
                          {getAccountIcon(acc.type, acc.icon)}
                        </span>
                      </div>
                      <div>
                        <span className="text-body-md" style={{ fontWeight: 600, display: "block", color: "var(--on-surface)" }}>
                          {acc.name}
                        </span>
                        <span className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>
                          {getAccountTypeLabel(acc.type)}
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-body-md"
                      style={{
                        fontWeight: 700,
                        color: acc.balance >= 0 ? "var(--on-surface)" : "var(--error)",
                      }}
                    >
                      {formatRupiahFull(acc.balance)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Breakdown list */}
          <div>
            <h4 className="text-title-sm" style={{ marginBottom: 16, color: "var(--on-surface)" }}>
              Breakdown Kategori Pengeluaran
            </h4>
            {categoryBreakdown.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {categoryBreakdown.map((cat) => (
                  <div key={cat.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor: cat.color + "15", // add opacity
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ color: cat.color, fontSize: 18 }}
                          >
                            {cat.icon || "category"}
                          </span>
                        </div>
                        <div>
                          <span className="text-body-md" style={{ fontWeight: 600 }}>
                            {cat.name}
                          </span>
                          <span
                            className="text-label-sm"
                            style={{ color: "var(--on-surface-variant)", marginLeft: 8 }}
                          >
                            ({cat.count} tx)
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span className="text-body-md" style={{ fontWeight: 700 }}>
                          {formatRupiahFull(cat.amount)}
                        </span>
                        <span
                          className="text-label-sm"
                          style={{ color: "var(--on-surface-variant)", display: "block" }}
                        >
                          {cat.percentage}% dari total
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: "rgba(0,0,0,0.04)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)", textAlign: "center", padding: "16px 0" }}>
                Tidak ada pengeluaran pada periode ini.
              </p>
            )}
          </div>

          {/* AI Recommendation Card */}
          {summary && (
            <div
              style={{
                background: "linear-gradient(135deg, rgba(79, 55, 138, 0.08) 0%, rgba(103, 80, 164, 0.05) 100%)",
                border: "1px solid rgba(79, 55, 138, 0.15)",
                padding: "20px",
                borderRadius: 20,
                display: "flex",
                gap: 16,
                marginTop: 8,
              }}
            >
              <span
                className="material-symbols-outlined filled"
                style={{ color: "var(--primary)", fontSize: 28, flexShrink: 0, marginTop: 2 }}
              >
                auto_awesome
              </span>
              <div>
                <h5 className="text-title-sm" style={{ color: "var(--primary)", fontWeight: 700 }}>
                  Rekomendasi Pintar AI
                </h5>
                <p className="text-body-md" style={{ color: "var(--on-surface-variant)", marginTop: 6, lineHeight: 1.4 }}>
                  {summary.recommendation}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CSS Animations (embedded style tag since we want this self-contained) */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}} />
      </div>
    </div>,
    document.body
  );
}
