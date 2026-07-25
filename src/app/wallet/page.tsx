"use client";

import { useEffect, useState, useCallback } from "react";
import TopAppBar from "@/components/layout/TopAppBar";
import BottomNav from "@/components/layout/BottomNav";
import { DateRange } from "react-day-picker";
import PeriodSelector from "@/components/ui/PeriodSelector";
import TransactionDetailModal from "@/components/ui/TransactionDetailModal";
import SwipeableMutasiCard from "@/components/ui/SwipeableMutasiCard";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import Toast from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// ─── Config ──────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ─── Types ───────────────────────────────────────────────────
interface BackendAccount {
  id: string;
  name: string;
  type: string; // CASH | BANK | E_WALLET
  balance: number;
  icon: string | null;
  color: string | null;
}

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE" | "DEBT" | "DEBT_PAYMENT";
  amount: number;
  description: string;
  date: string;
  category?: { name: string; icon: string; color: string };
}

const TYPE_MAP: Record<
  string,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  CASH: {
    label: "Uang Tunai (Cash)",
    icon: "payments",
    color: "var(--primary)",
    bgColor: "var(--primary-fixed)",
  },
  BANK: {
    label: "Bank Account",
    icon: "account_balance",
    color: "var(--secondary)",
    bgColor: "var(--secondary-container)",
  },
  E_WALLET: {
    label: "Dompet Digital / E-Wallet",
    icon: "wallet",
    color: "var(--tertiary)",
    bgColor: "var(--tertiary-container)",
  },
};

const dropdownOptions = [
  { value: "BANK", label: "Bank Account", icon: "account_balance" },
  { value: "E_WALLET", label: "Dompet Digital / E-Wallet", icon: "wallet" },
  { value: "CASH", label: "Uang Tunai (Cash)", icon: "payments" },
];

// ─── Helpers ──────────────────────────────────────────────────
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function mapAccount(a: BackendAccount) {
  const t = TYPE_MAP[a.type] || TYPE_MAP.CASH;
  return {
    ...a,
    label: t.label,
    icon: t.icon,
    color: t.color,
    bgColor: t.bgColor,
  };
}

// ─── Page ─────────────────────────────────────────────────────
export default function WalletPage() {
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState<BackendAccount[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Details Modal
  const [selectedAccount, setSelectedAccount] = useState<BackendAccount | null>(
    null,
  );
  const [accountTx, setAccountTx] = useState<Transaction[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);

  // Tx Filters inside modal
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txFilterType, setTxFilterType] = useState<string>("");
  const [txSearch, setTxSearch] = useState("");
  const [txDateRange, setTxDateRange] = useState<DateRange | undefined>();
  const [isTxDatePickerOpen, setIsTxDatePickerOpen] = useState(false);
  const [selectedDetailTxId, setSelectedDetailTxId] = useState<string | null>(
    null,
  );

  // Edit Tx State
  const [editingTx, setEditingTx] = useState<any>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Toast State
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isToastOpen, setIsToastOpen] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setIsToastOpen(true);
  };

  // Confirm Delete State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "TRANSACTION" | "ACCOUNT" } | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const handleDeleteTransaction = (id: string) => {
    setDeleteTarget({ id, type: "TRANSACTION" });
  };

  const handleDelete = (id: string) => {
    setDeleteTarget({ id, type: "ACCOUNT" });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const token = getToken();
    if (!token) return;
    setIsDeletingLoading(true);
    const targetType = deleteTarget.type;
    try {
      if (targetType === "TRANSACTION") {
        const res = await fetch(`${API_BASE}/api/transactions/${deleteTarget.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal menghapus transaksi");
        if (selectedAccount) {
          fetchAccountTransactions(
            selectedAccount.id,
            txPage,
            txFilterType,
            txSearch,
            txDateRange?.from?.toISOString() || "",
            txDateRange?.to?.toISOString() || ""
          );
          fetchAccounts();
        }
        showToast("Transaksi mutasi berhasil dihapus", "success");
      } else if (targetType === "ACCOUNT") {
        const res = await fetch(`${API_BASE}/api/wallet/${deleteTarget.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal menghapus akun");
        await fetchAccounts();
        showToast("Rekening berhasil dihapus", "success");
      }
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus data", "error");
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleOpenEditModal = (tx: any) => {
    setEditingTx(tx);
    setEditAmount(tx.amount.toString());
    setEditDesc(tx.description || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    const token = getToken();
    if (!token) return;
    setIsSavingEdit(true);
    try {
      const amountNum = parseFloat(editAmount.replace(/[^0-9]/g, ""));
      const res = await fetch(`${API_BASE}/api/transactions/${editingTx.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amountNum,
          description: editDesc,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan perubahan transaksi");
      setEditingTx(null);
      if (selectedAccount) {
        fetchAccountTransactions(
          selectedAccount.id,
          txPage,
          txFilterType,
          txSearch,
          txDateRange?.from?.toISOString() || "",
          txDateRange?.to?.toISOString() || ""
        );
        fetchAccounts();
      }
      showToast("Perubahan transaksi berhasil disimpan", "success");
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan transaksi", "error");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Form
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("BANK");
  const [newBalance, setNewBalance] = useState("");

  const selectedDropdown =
    dropdownOptions.find((o) => o.value === newType) || dropdownOptions[0];

  // ─── Fetch accounts ───────────────────────────────────────
  const fetchAccounts = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal memuat data");
      const json = await res.json();
      setAccounts(json.accounts || []);
      setTotalBalance(json.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // ─── Fetch transactions for account ───────────────────────
  const fetchAccountTransactions = useCallback(
    async (
      accountId: string,
      pageNum: number = 1,
      type: string = "",
      search: string = "",
      startDate: string = "",
      endDate: string = "",
    ) => {
      const token = getToken();
      if (!token) return;
      setIsLoadingTx(true);
      try {
        const url = new URL(`${API_BASE}/api/transactions`);
        url.searchParams.append("accountId", accountId);
        url.searchParams.append("page", pageNum.toString());
        url.searchParams.append("limit", "15");
        if (type) url.searchParams.append("type", type);
        if (search) url.searchParams.append("search", search);
        if (startDate) url.searchParams.append("startDate", startDate);
        if (endDate) url.searchParams.append("endDate", endDate);

        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal memuat mutasi");
        const json = await res.json();
        setAccountTx(json.transactions || []);
        setTxTotalPages(json.pagination?.totalPages || 1);
        setTxPage(pageNum);
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsLoadingTx(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!selectedAccount) return;
    const timer = setTimeout(() => {
      const startStr = txDateRange?.from ? txDateRange.from.toISOString() : "";
      const endStr = txDateRange?.to ? txDateRange.to.toISOString() : "";
      fetchAccountTransactions(
        selectedAccount.id,
        1,
        txFilterType,
        txSearch,
        startStr,
        endStr,
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [
    selectedAccount,
    txFilterType,
    txSearch,
    txDateRange,
    fetchAccountTransactions,
  ]);

  const handleOpenAccountDetails = (acc: BackendAccount) => {
    setSelectedAccount(acc);
    setAccountTx([]);
    setTxPage(1);
    setTxFilterType("");
    setTxSearch("");
    setTxDateRange(undefined);
  };

  // ─── Add account ──────────────────────────────────────────
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBalance) return;
    setSaving(true);
    setError("");

    const token = getToken();
    if (!token) return;

    const balanceNum = parseFloat(newBalance.replace(/[^0-9]/g, "")) || 0;

    try {
      const res = await fetch(`${API_BASE}/api/wallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName.trim(),
          type: newType,
          initialBalance: balanceNum,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menambahkan akun");
      }

      // Refresh list
      await fetchAccounts();

      // Reset form
      setNewName("");
      setNewType("BANK");
      setNewBalance("");
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };



  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        minHeight: "100dvh",
        paddingBottom: 160,
      }}
    >
      <TopAppBar />

      <main
        style={{
          padding: "calc(96px + env(safe-area-inset-top, 0px)) 16px 120px 16px",
          maxWidth: 640,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Header */}
          <header className="animate-fade-slide-up" style={{ marginBottom: 4 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                margin: 0,
                color: "var(--on-surface)",
                letterSpacing: "-0.5px",
              }}
            >
              {t("wallet.title")}
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "var(--on-surface-variant)",
                margin: "4px 0 0 0",
              }}
            >
              {t("wallet.subtitle")}
            </p>
          </header>

          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                background: "var(--error-container)",
                color: "var(--on-error-container)",
                fontSize: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                style={{
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  color: "inherit",
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Total Balance Hero Card */}
          <section
            className="glass-card animate-fade-slide-up"
            style={{
              padding: "24px 20px",
              borderRadius: 24,
              background:
                "linear-gradient(135deg, var(--surface), rgba(79, 55, 138, 0.06))",
              border: "1px solid var(--outline-variant)",
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--on-surface-variant)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    margin: 0,
                  }}
                >
                  {t("wallet.total_balance")}
                </p>
                <h2
                  style={{
                    fontSize: 34,
                    fontWeight: 800,
                    color: "var(--on-surface)",
                    margin: "6px 0 0 0",
                    letterSpacing: "-0.8px",
                  }}
                >
                  {isLoading ? "..." : formatRupiah(totalBalance)}
                </h2>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 16px",
                  borderRadius: 14,
                  background: "var(--primary)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(79, 55, 138, 0.3)",
                  transition: "transform 0.15s ease",
                  flexShrink: 0,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                >
                  add
                </span>
                {t("wallet.add_account")}
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "var(--on-surface-variant)",
                background: "rgba(0,0,0,0.03)",
                padding: "8px 14px",
                borderRadius: 12,
                width: "fit-content",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, color: "var(--primary)" }}
              >
                account_balance
              </span>
              {accounts.length} {t("wallet.active_accounts")}
            </div>
          </section>

          {/* Accounts List */}
          <section
            className="animate-fade-slide-up"
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 4px",
              }}
            >
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  margin: 0,
                  color: "var(--on-surface)",
                }}
              >
                {t("wallet.account_list")}
              </h3>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--on-surface-variant)",
                  background: "rgba(0,0,0,0.05)",
                  padding: "2px 8px",
                  borderRadius: 8,
                }}
              >
                {accounts.length}
              </span>
            </div>

            {isLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 32,
                  color: "var(--on-surface-variant)",
                }}
              >
                {t("wallet.loading")}
              </div>
            ) : accounts.length === 0 ? (
              <div
                className="glass-card"
                style={{
                  textAlign: "center",
                  padding: "40px 24px",
                  borderRadius: 20,
                  color: "var(--on-surface-variant)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 48, opacity: 0.4 }}
                >
                  account_balance
                </span>
                <p style={{ marginTop: 12, fontSize: 14, fontWeight: 500 }}>
                  {t("wallet.empty")}
                </p>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {accounts.map((acc) => {
                  const m = mapAccount(acc);
                  return (
                    <div
                      key={acc.id}
                      className="glass-card"
                      style={{
                        padding: 16,
                        borderRadius: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        transition: "all 0.2s ease",
                        border: "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          flex: 1,
                          minWidth: 0,
                          cursor: "pointer",
                        }}
                        onClick={() => handleOpenAccountDetails(acc)}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 16,
                            background: m.bgColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ color: m.color, fontSize: 24 }}
                          >
                            {m.icon}
                          </span>
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <p
                              style={{
                                fontWeight: 700,
                                fontSize: 15,
                                margin: 0,
                                color: "var(--on-surface)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {acc.name}
                            </p>
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "var(--on-surface-variant)",
                              margin: "2px 0 0 0",
                              display: "block",
                            }}
                          >
                            {m.label}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: 15,
                            color: "var(--on-surface)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatRupiah(acc.balance)}
                        </span>

                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <button
                            onClick={() => handleDelete(acc.id)}
                            title="Hapus rekening"
                            style={{
                              cursor: "pointer",
                              color: "#ef4444",
                              border: "none",
                              background: "rgba(239, 68, 68, 0.08)",
                              width: 34,
                              height: 34,
                              borderRadius: 10,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: 18 }}
                            >
                              delete
                            </span>
                          </button>

                          <button
                            onClick={() => handleOpenAccountDetails(acc)}
                            title="Lihat mutasi"
                            style={{
                              cursor: "pointer",
                              color: "var(--on-surface-variant)",
                              border: "none",
                              background: "rgba(0,0,0,0.04)",
                              width: 34,
                              height: 34,
                              borderRadius: 10,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: 18 }}
                            >
                              chevron_right
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <BottomNav />

      {/* Add Account Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 24,
          }}
        >
          <div className="glass-card animate-fade-slide-up wallet-modal">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3 className="text-headline-sm">Tambah Rekening Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  cursor: "pointer",
                  color: "var(--on-surface-variant)",
                  border: "none",
                  background: "none",
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              onSubmit={handleAddAccount}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div>
                <label
                  className="text-label-md"
                  style={{
                    display: "block",
                    marginBottom: 6,
                    color: "var(--on-surface-variant)",
                  }}
                >
                  Nama Rekening / Akun
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Misal: Bank Mandiri Utama, LinkAja"
                  className="glass-input"
                  style={{ padding: "12px 16px" }}
                  required
                />
              </div>

              {/* Custom High-Fidelity Dropdown */}
              <div style={{ position: "relative" }}>
                <label
                  className="text-label-md"
                  style={{
                    display: "block",
                    marginBottom: 6,
                    color: "var(--on-surface-variant)",
                  }}
                >
                  Tipe Rekening
                </label>

                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 16,
                    border: "1px solid rgba(203, 196, 210, 0.5)",
                    background: "rgba(255, 255, 255, 0.9)",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "var(--on-surface)",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 20, color: "var(--primary)" }}
                    >
                      {selectedDropdown.icon}
                    </span>
                    <span>{selectedDropdown.label}</span>
                  </div>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      transition: "transform 0.2s",
                      transform: isDropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0)",
                    }}
                  >
                    keyboard_arrow_down
                  </span>
                </button>

                {/* Option Menu Overlay */}
                {isDropdownOpen && (
                  <div
                    className="glass-card animate-fade-in"
                    style={{
                      position: "absolute",
                      width: "100%",
                      zIndex: 100,
                      marginTop: 6,
                      padding: 8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      background: "rgba(255, 255, 255, 0.95)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                      border: "1px solid rgba(203, 196, 210, 0.4)",
                    }}
                  >
                    {dropdownOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setNewType(opt.value);
                          setIsDropdownOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 12px",
                          borderRadius: 12,
                          textAlign: "left",
                          width: "100%",
                          border: "none",
                          cursor: "pointer",
                          background:
                            newType === opt.value
                              ? "rgba(103, 80, 164, 0.08)"
                              : "transparent",
                          color:
                            newType === opt.value
                              ? "var(--primary)"
                              : "var(--on-surface)",
                          fontWeight: newType === opt.value ? 600 : 500,
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (newType !== opt.value)
                            e.currentTarget.style.backgroundColor =
                              "rgba(103, 80, 164, 0.03)";
                        }}
                        onMouseLeave={(e) => {
                          if (newType !== opt.value)
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 20 }}
                        >
                          {opt.icon}
                        </span>
                        <span style={{ fontSize: 15 }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label
                  className="text-label-md"
                  style={{
                    display: "block",
                    marginBottom: 6,
                    color: "var(--on-surface-variant)",
                  }}
                >
                  Saldo Awal (Rp)
                </label>
                <input
                  type="text"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  placeholder="Misal: 1.500.000"
                  className="glass-input"
                  style={{ padding: "12px 16px" }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 16,
                    background: "rgba(0,0,0,0.05)",
                    color: "var(--on-surface-variant)",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: 12,
                    fontSize: 16,
                    boxShadow: "none",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "Menyimpan…" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Account Details / Mutation Modal */}
      {selectedAccount && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--surface)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
          className="animate-fade-slide-up"
        >
          {/* Header */}
          <header
            style={{
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              borderBottom: "1px solid var(--outline-variant)",
              background: "var(--surface)",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <button
              onClick={() => setSelectedAccount(null)}
              style={{
                background: "rgba(0, 0, 0, 0.04)",
                border: "none",
                borderRadius: 12,
                width: 40,
                height: 40,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s ease",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 22, color: "var(--on-surface)" }}
              >
                arrow_back
              </span>
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 800,
                    color: "var(--on-surface)",
                    letterSpacing: "-0.4px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedAccount.name}
                </h2>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 8,
                    background: "var(--primary-container)",
                    color: "var(--on-primary-container)",
                    textTransform: "uppercase",
                  }}
                >
                  {selectedAccount.type}
                </span>
              </div>
              <p
                style={{
                  margin: "2px 0 0 0",
                  fontSize: 13,
                  color: "var(--on-surface-variant)",
                }}
              >
                {t("wallet.mutasi_sub")}
              </p>
            </div>
          </header>

          <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            {/* Saldo Hero Card */}
            <div
              className="glass-card"
              style={{
                padding: "24px 20px",
                borderRadius: 24,
                marginBottom: 24,
                position: "relative",
                overflow: "hidden",
                background:
                  "linear-gradient(135deg, var(--surface), rgba(79, 55, 138, 0.05))",
                border: "1px solid var(--outline-variant)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--on-surface-variant)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      margin: 0,
                    }}
                  >
                    {t("wallet.total_balance")}
                  </p>
                  <h2
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      color: "var(--on-surface)",
                      margin: "4px 0 0 0",
                      letterSpacing: "-0.8px",
                    }}
                  >
                    {formatRupiah(selectedAccount.balance)}
                  </h2>
                </div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    background: "var(--primary-container)",
                    color: "var(--on-primary-container)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 26 }}
                  >
                    account_balance_wallet
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "var(--on-surface-variant)",
                  background: "rgba(0,0,0,0.03)",
                  padding: "6px 12px",
                  borderRadius: 10,
                  width: "fit-content",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 16, color: "var(--primary)" }}
                >
                  sync_alt
                </span>
                {t("wallet.mutasi_connected")}
              </div>
            </div>

            <h3
              className="text-headline-sm"
              style={{ fontSize: 16, marginBottom: 12 }}
            >
              {t("wallet.mutasi_title")}
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 16,
              }}
            >
              {/* Search & Date */}
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--on-surface-variant)",
                      fontSize: 20,
                    }}
                  >
                    search
                  </span>
                  <input
                    type="text"
                    placeholder={t("wallet.search_placeholder")}
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="glass-input"
                    style={{
                      padding: "10px 12px 10px 40px",
                      width: "100%",
                      borderRadius: 16,
                      fontSize: 14,
                    }}
                  />
                </div>

                <button
                  onClick={() => setIsTxDatePickerOpen(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "0 12px",
                    borderRadius: 16,
                    border: `1px solid ${txDateRange?.from || txDateRange?.to ? "var(--primary)" : "var(--outline-variant)"}`,
                    background:
                      txDateRange?.from || txDateRange?.to
                        ? "var(--primary-container)"
                        : "rgba(255,255,255,0.5)",
                    color:
                      txDateRange?.from || txDateRange?.to
                        ? "var(--on-primary-container)"
                        : "var(--on-surface-variant)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18 }}
                  >
                    calendar_month
                  </span>
                </button>
              </div>

              {/* Filters */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  width: "100%",
                  paddingBottom: 4,
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
                className="hide-scrollbar-inline"
              >
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                  .hide-scrollbar-inline::-webkit-scrollbar {
                    display: none;
                  }
                `,
                  }}
                />
                {[
                  { label: t("wallet.filter_all"), val: "" },
                  { label: t("wallet.filter_income"), val: "INCOME" },
                  { label: t("wallet.filter_expense"), val: "EXPENSE" },
                ].map((f) => (
                  <button
                    key={f.val}
                    onClick={() => setTxFilterType(f.val)}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 12,
                      border: `1px solid ${txFilterType === f.val ? "var(--primary)" : "var(--outline-variant)"}`,
                      background:
                        txFilterType === f.val
                          ? "var(--primary-container)"
                          : "rgba(255,255,255,0.5)",
                      color:
                        txFilterType === f.val
                          ? "var(--on-primary-container)"
                          : "var(--on-surface-variant)",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingTx ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 32,
                  color: "var(--on-surface-variant)",
                }}
              >
                Memuat mutasi...
              </div>
            ) : accountTx.length === 0 ? (
              <div
                className="glass-card"
                style={{
                  textAlign: "center",
                  padding: 32,
                  color: "var(--on-surface-variant)",
                }}
              >
                Belum ada transaksi di rekening ini.
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {accountTx.map((tx) => {
                  const isExpense = tx.type === "EXPENSE";
                  return (
                    <SwipeableMutasiCard
                      key={tx.id}
                      onEdit={() => handleOpenEditModal(tx)}
                      onDelete={() => handleDeleteTransaction(tx.id)}
                      onClickDetail={() => setSelectedDetailTxId(tx.id)}
                    >
                      <div
                        className="glass-card"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "16px 38px 16px 16px",
                          gap: 12,
                          cursor: "pointer",
                        }}
                      >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isExpense
                              ? "rgba(244, 67, 54, 0.1)"
                              : "rgba(76, 175, 80, 0.1)",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{
                              color: isExpense
                                ? "rgba(229, 57, 53, 1)"
                                : "rgba(67, 160, 71, 1)",
                            }}
                          >
                            {(() => {
                              const desc = (tx.description || "").toLowerCase();
                              const cat = (
                                tx.category?.name || ""
                              ).toLowerCase();
                              const combined = desc + " " + cat;

                              // ── Income types ──
                              if (
                                combined.includes("gaji") ||
                                combined.includes("upah") ||
                                combined.includes("honor") ||
                                combined.includes("freelance")
                              )
                                return "payments";
                              if (
                                combined.includes("bonus") ||
                                combined.includes("thr") ||
                                combined.includes("hadiah") ||
                                combined.includes("giveaway")
                              )
                                return "redeem";
                              if (combined.includes("refund"))
                                return "currency_exchange";
                              if (
                                combined.includes("investasi") ||
                                combined.includes("saham") ||
                                combined.includes("crypto") ||
                                combined.includes("reksadana") ||
                                combined.includes("dividen")
                              )
                                return "trending_up";
                              if (
                                combined.includes("tabungan") ||
                                combined.includes("nabung") ||
                                combined.includes("menabung")
                              )
                                return "savings";

                              // ── Food & Drink ──
                              if (
                                combined.includes("makan") ||
                                combined.includes("minum") ||
                                combined.includes("makanan") ||
                                combined.includes("ngemil") ||
                                combined.includes("catering")
                              )
                                return "restaurant";
                              if (
                                combined.includes("kopi") ||
                                combined.includes("ngopi") ||
                                combined.includes("kafe") ||
                                combined.includes("starbucks") ||
                                combined.includes("coffee")
                              )
                                return "coffee";
                              if (
                                combined.includes("bakso") ||
                                combined.includes("mie") ||
                                combined.includes("soto") ||
                                combined.includes("nasi") ||
                                combined.includes("ayam") ||
                                combined.includes("martabak")
                              )
                                return "ramen_dining";

                              // ── Shopping ──
                              if (
                                combined.includes("belanja") ||
                                combined.includes("beli") ||
                                combined.includes("casing") ||
                                combined.includes("marketplace") ||
                                combined.includes("tokped") ||
                                combined.includes("shopee") ||
                                combined.includes("tokopedia") ||
                                combined.includes("bukalapak")
                              )
                                return "shopping_bag";
                              if (
                                combined.includes("baju") ||
                                combined.includes("pakaian") ||
                                combined.includes("sepatu") ||
                                combined.includes("fashion") ||
                                combined.includes("celana")
                              )
                                return "checkroom";
                              if (
                                combined.includes("gadget") ||
                                combined.includes("hp") ||
                                combined.includes("laptop") ||
                                combined.includes("elektronik")
                              )
                                return "devices";
                              if (
                                combined.includes("grocer") ||
                                combined.includes("sembako") ||
                                combined.includes("supermarket") ||
                                combined.includes("indomaret") ||
                                combined.includes("alfamart")
                              )
                                return "grocery";

                              // ── Utilities ──
                              if (
                                combined.includes("pulsa") ||
                                combined.includes("listrik") ||
                                combined.includes("token") ||
                                combined.includes("pln")
                              )
                                return "bolt";
                              if (
                                combined.includes("internet") ||
                                combined.includes("wifi") ||
                                combined.includes("indihome") ||
                                combined.includes("biznet")
                              )
                                return "wifi";
                              if (
                                combined.includes("air") ||
                                combined.includes("pdam") ||
                                combined.includes("ledeng")
                              )
                                return "water_drop";
                              if (
                                combined.includes("telp") ||
                                combined.includes("seluler")
                              )
                                return "phone_iphone";

                              // ── Transport ──
                              if (
                                combined.includes("transport") ||
                                combined.includes("gojek") ||
                                combined.includes("grab") ||
                                combined.includes("ojek") ||
                                combined.includes("taxi") ||
                                combined.includes("maxim")
                              )
                                return "directions_car";
                              if (
                                combined.includes("bensin") ||
                                combined.includes("bbm") ||
                                combined.includes("pertamina") ||
                                combined.includes("pertamax") ||
                                combined.includes("spbu")
                              )
                                return "local_gas_station";
                              if (
                                combined.includes("parkir") ||
                                combined.includes("tol") ||
                                combined.includes("etoll")
                              )
                                return "local_parking";
                              if (
                                combined.includes("kereta") ||
                                combined.includes("mrt") ||
                                combined.includes("lrt") ||
                                combined.includes("commuter")
                              )
                                return "train";
                              if (
                                combined.includes("pesawat") ||
                                combined.includes("tiket") ||
                                combined.includes("travel") ||
                                combined.includes("liburan") ||
                                combined.includes("hotel")
                              )
                                return "flight";

                              // ── Health ──
                              if (
                                combined.includes("kesehatan") ||
                                combined.includes("obat") ||
                                combined.includes("rs ") ||
                                combined.includes("rumah sakit") ||
                                combined.includes("apotek") ||
                                combined.includes("dokter") ||
                                combined.includes("klinik") ||
                                combined.includes("bpjs")
                              )
                                return "medical_services";
                              if (
                                combined.includes("gym") ||
                                combined.includes("fitness") ||
                                combined.includes("olahraga")
                              )
                                return "fitness_center";

                              // ── Bills & Subscriptions ──
                              if (
                                combined.includes("langganan") ||
                                combined.includes("subscription") ||
                                combined.includes("netflix") ||
                                combined.includes("spotify") ||
                                combined.includes("disney") ||
                                combined.includes("youtube") ||
                                combined.includes("hbo") ||
                                combined.includes("vidio")
                              )
                                return "subscriptions";
                              if (
                                combined.includes("tagihan") ||
                                combined.includes("invoice") ||
                                combined.includes("bill")
                              )
                                return "receipt_long";

                              // ── Housing ──
                              if (
                                combined.includes("sewa") ||
                                combined.includes("kost") ||
                                combined.includes("kontrak") ||
                                combined.includes("kos ")
                              )
                                return "bed";
                              if (
                                combined.includes("rumah") ||
                                combined.includes("renovasi") ||
                                combined.includes("perbaikan") ||
                                combined.includes("service") ||
                                combined.includes("tukang")
                              )
                                return "home";

                              // ── Education ──
                              if (
                                combined.includes("sekolah") ||
                                combined.includes("kuliah") ||
                                combined.includes("buku") ||
                                combined.includes("kursus") ||
                                combined.includes("les ") ||
                                combined.includes("spp") ||
                                combined.includes("ujian")
                              )
                                return "school";

                              // ── Entertainment ──
                              if (
                                combined.includes("game") ||
                                combined.includes("steam") ||
                                combined.includes("playstation") ||
                                combined.includes("top up game") ||
                                combined.includes("mlbb")
                              )
                                return "sports_esports";
                              if (
                                combined.includes("film") ||
                                combined.includes("nonton") ||
                                combined.includes("bioskop") ||
                                combined.includes("cinema")
                              )
                                return "movie";
                              if (
                                combined.includes("musik") ||
                                combined.includes("konser") ||
                                combined.includes("festival")
                              )
                                return "music_note";

                              // ── Financial ──
                              if (
                                combined.includes("transfer") ||
                                combined.includes("tf ") ||
                                combined.includes("kirim") ||
                                combined.includes("antar bank")
                              )
                                return "sync_alt";
                              if (
                                combined.includes("pinjam") ||
                                combined.includes("hutang") ||
                                combined.includes("utang") ||
                                combined.includes("kredit") ||
                                combined.includes("pinjaman")
                              )
                                return "handshake";
                              if (
                                combined.includes("cicilan") ||
                                combined.includes("angsuran") ||
                                combined.includes("kpr") ||
                                combined.includes("leasing")
                              )
                                return "schedule";
                              if (
                                combined.includes("topup") ||
                                combined.includes("top up") ||
                                combined.includes("e-wallet") ||
                                combined.includes("gopay") ||
                                combined.includes("ovo") ||
                                combined.includes("dana") ||
                                combined.includes("shopeepay")
                              )
                                return "account_balance_wallet";
                              if (
                                combined.includes("donasi") ||
                                combined.includes("sedekah") ||
                                combined.includes("sumbangan") ||
                                combined.includes("zakat") ||
                                combined.includes("infaq")
                              )
                                return "volunteer_activism";
                              if (
                                combined.includes("pajak") ||
                                combined.includes("npwp") ||
                                combined.includes("pbb")
                              )
                                return "account_balance";

                              // ── Beauty ──
                              if (
                                combined.includes("salon") ||
                                combined.includes("barber") ||
                                combined.includes("cukur") ||
                                combined.includes("skincare") ||
                                combined.includes("makeup")
                              )
                                return "content_cut";

                              // ── Pet ──
                              if (
                                combined.includes("kucing") ||
                                combined.includes("anjing") ||
                                combined.includes("peliharaan") ||
                                combined.includes("pet")
                              )
                                return "pets";

                              // ── Debt specific defaults ──
                              if (tx.type === "DEBT")
                                return "real_estate_agent";
                              if (tx.type === "DEBT_PAYMENT") return "payments";

                              // ── Fallback ──
                              if (tx.type === "INCOME") return "trending_up";
                              return "credit_card";
                            })()}
                          </span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p
                            className="text-body-md"
                            style={{
                              fontWeight: 700,
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {tx.description || "Tanpa deskripsi"}
                          </p>
                          <p
                            className="text-body-sm"
                            style={{
                              color: "var(--on-surface-variant)",
                              margin: "2px 0 0 0",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {new Date(tx.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}{" "}
                            • {tx.category?.name || "Umum"}
                          </p>
                        </div>
                      </div>
                      <span
                        style={{
                          color: isExpense ? "var(--error)" : "var(--primary)",
                          fontWeight: 600,
                          fontSize: "15px",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {isExpense ? "-" : "+"}
                        {formatRupiah(tx.amount)}
                      </span>
                    </div>
                  </SwipeableMutasiCard>
                );
                })}
              </div>
            )}

            {/* Pagination */}
            {txTotalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 16,
                  marginTop: 24,
                  paddingBottom: 24,
                }}
              >
                <button
                  disabled={txPage <= 1}
                  onClick={() =>
                    fetchAccountTransactions(
                      selectedAccount.id,
                      txPage - 1,
                      txFilterType,
                      txSearch,
                      txDateRange?.from?.toISOString() || "",
                      txDateRange?.to?.toISOString() || "",
                    )
                  }
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--outline-variant)",
                    background: "var(--surface)",
                    cursor: txPage <= 1 ? "not-allowed" : "pointer",
                    opacity: txPage <= 1 ? 0.5 : 1,
                  }}
                >
                  Sebelumnya
                </button>
                <span
                  style={{
                    alignSelf: "center",
                    fontWeight: 600,
                    color: "var(--on-surface)",
                  }}
                >
                  Hal {txPage} / {txTotalPages}
                </span>
                <button
                  disabled={txPage >= txTotalPages}
                  onClick={() =>
                    fetchAccountTransactions(
                      selectedAccount.id,
                      txPage + 1,
                      txFilterType,
                      txSearch,
                      txDateRange?.from?.toISOString() || "",
                      txDateRange?.to?.toISOString() || "",
                    )
                  }
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--outline-variant)",
                    background: "var(--surface)",
                    cursor: txPage >= txTotalPages ? "not-allowed" : "pointer",
                    opacity: txPage >= txTotalPages ? 0.5 : 1,
                  }}
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Date Picker Modal for Tx Filter */}
      <PeriodSelector
        isOpen={isTxDatePickerOpen}
        onClose={() => setIsTxDatePickerOpen(false)}
        onSelectRange={setTxDateRange}
        initialRange={txDateRange}
      />

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={!!selectedDetailTxId}
        transactionId={selectedDetailTxId}
        onClose={() => setSelectedDetailTxId(null)}
      />

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          <div
            className="animate-fade-slide-up"
            style={{
              width: "100%",
              maxWidth: 420,
              background: "var(--surface)",
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--on-surface)",
                }}
              >
                Edit Transaksi Mutasi
              </h3>
              <button
                onClick={() => setEditingTx(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--on-surface-variant)",
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              onSubmit={handleSaveEdit}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--on-surface-variant)",
                    marginBottom: 6,
                  }}
                >
                  Deskripsi / Keterangan
                </label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--outline-variant)",
                    background: "var(--surface)",
                    color: "var(--on-surface)",
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--on-surface-variant)",
                    marginBottom: 6,
                  }}
                >
                  Nominal (Rp)
                </label>
                <input
                  type="text"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--outline-variant)",
                    background: "var(--surface)",
                    color: "var(--on-surface)",
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 12,
                    border: "1px solid var(--outline-variant)",
                    background: "var(--surface)",
                    color: "var(--on-surface)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 12,
                    border: "none",
                    background: "var(--primary)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: isSavingEdit ? "not-allowed" : "pointer",
                    opacity: isSavingEdit ? 0.7 : 1,
                  }}
                >
                  {isSavingEdit ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.type === "ACCOUNT" ? "Hapus Rekening?" : "Hapus Transaksi?"}
        description={
          deleteTarget?.type === "ACCOUNT"
            ? "Apakah Anda yakin ingin menghapus rekening ini? Semua data mutasi di dalamnya juga akan terhapus."
            : "Apakah Anda yakin ingin menghapus transaksi mutasi ini? Saldo rekening Anda akan otomatis disesuaikan."
        }
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isLoading={isDeletingLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Toast Notification */}
      <Toast
        isOpen={isToastOpen}
        message={toastMsg}
        type={toastType}
        onClose={() => setIsToastOpen(false)}
      />
    </div>
  );
}
