"use client";

import { useEffect, useState, useCallback } from "react";
import TopAppBar from "@/components/layout/TopAppBar";
import BottomNav from "@/components/layout/BottomNav";
import { DateRange } from "react-day-picker";
import PeriodSelector from "@/components/ui/PeriodSelector";
import TransactionDetailModal from "@/components/ui/TransactionDetailModal";
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
  const [accounts, setAccounts] = useState<BackendAccount[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Details Modal
  const [selectedAccount, setSelectedAccount] = useState<BackendAccount | null>(null);
  const [accountTx, setAccountTx] = useState<Transaction[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);

  // Tx Filters inside modal
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txFilterType, setTxFilterType] = useState<string>("");
  const [txSearch, setTxSearch] = useState("");
  const [txDateRange, setTxDateRange] = useState<DateRange | undefined>();
  const [isTxDatePickerOpen, setIsTxDatePickerOpen] = useState(false);
  const [selectedDetailTxId, setSelectedDetailTxId] = useState<string | null>(null);

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
  const fetchAccountTransactions = useCallback(async (
    accountId: string,
    pageNum: number = 1,
    type: string = "",
    search: string = "",
    startDate: string = "",
    endDate: string = ""
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
  }, []);

  useEffect(() => {
    if (!selectedAccount) return;
    const timer = setTimeout(() => {
      const startStr = txDateRange?.from ? txDateRange.from.toISOString() : "";
      const endStr = txDateRange?.to ? txDateRange.to.toISOString() : "";
      fetchAccountTransactions(selectedAccount.id, 1, txFilterType, txSearch, startStr, endStr);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedAccount, txFilterType, txSearch, txDateRange, fetchAccountTransactions]);

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

  // ─── Delete account ───────────────────────────────────────
  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/wallet/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus akun");
      await fetchAccounts();
    } catch (err: any) {
      setError(err.message);
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
          marginTop: 72,
          padding: "0 var(--container-margin)",
          maxWidth: 672,
          margin: "72px auto 0",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--stack-gap-lg)",
          }}
        >
          {/* Header */}
          <header className="animate-fade-slide-up" style={{ paddingTop: 16 }}>
            <h1
              className="text-headline-lg"
              style={{ color: "var(--on-surface)" }}
            >
              Dompet & Rekening
            </h1>
            <p
              className="text-body-md"
              style={{ color: "var(--on-surface-variant)", marginTop: 4 }}
            >
              Kelola semua saldo dan rekening Anda dalam satu dashboard
              terpusat.
            </p>
          </header>

          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: "var(--error-container)",
                color: "var(--on-error-container)",
                fontSize: 14,
              }}
            >
              {error}
              <button
                onClick={() => setError("")}
                style={{
                  marginLeft: 12,
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

          {/* Total Balance Card */}
          <section className="glass-card animate-fade-slide-up wallet-balance-card">
            <p
              className="text-label-md"
              style={{
                color: "var(--on-surface-variant)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              TOTAL SALDO gabungan
            </p>
            <h2 className="wallet-balance-amount">
              {isLoading ? "Memuat…" : formatRupiah(totalBalance)}
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
              style={{
                marginTop: 24,
                padding: "12px 24px",
                fontSize: 16,
                maxWidth: 240,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <span className="material-symbols-outlined">add</span>
              Tambah Rekening
            </button>
          </section>

          {/* Accounts List */}
          <section
            className="animate-fade-slide-up"
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <h3 className="text-headline-sm" style={{ paddingLeft: 4 }}>
              Daftar Akun ({accounts.length})
            </h3>
            {isLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 24,
                  color: "var(--on-surface-variant)",
                }}
              >
                Memuat…
              </div>
            ) : accounts.length === 0 ? (
              <div
                className="glass-card"
                style={{
                  textAlign: "center",
                  padding: 32,
                  color: "var(--on-surface-variant)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 48, opacity: 0.4 }}
                >
                  account_balance
                </span>
                <p style={{ marginTop: 12 }}>
                  Belum ada rekening. Tambahkan rekening pertama Anda!
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
                      className="glass-card wallet-account-item"
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          flex: 1,
                          minWidth: 0,
                          cursor: "pointer"
                        }}
                        onClick={() => handleOpenAccountDetails(acc)}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: m.bgColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ color: m.color }}
                          >
                            {m.icon}
                          </span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p
                            className="wallet-account-name"
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {acc.name}
                          </p>
                          <p className="wallet-account-type">{m.label}</p>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexShrink: 0,
                        }}
                      >
                        <span
                          className="wallet-account-balance"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          {formatRupiah(acc.balance)}
                        </span>
                        <button
                          onClick={() => handleDelete(acc.id)}
                          title="Hapus akun"
                          style={{
                            cursor: "pointer",
                            color: "var(--error)",
                            border: "none",
                            background: "none",
                            padding: 4,
                            display: "flex",
                            alignItems: "center",
                            opacity: 0.6,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.opacity = "1")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.opacity = "0.6")
                          }
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 20 }}
                          >
                            delete
                          </span>
                        </button>
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
            overflow: "hidden"
          }}
          className="animate-fade-slide-up"
        >
          {/* Header */}
          <header style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid var(--outline-variant)" }}>
            <button
              onClick={() => setSelectedAccount(null)}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--on-surface)" }}>arrow_back</span>
            </button>
            <div>
              <h2 className="text-headline-sm" style={{ margin: 0, fontSize: 18 }}>{selectedAccount.name}</h2>
              <p className="text-body-sm" style={{ margin: 0, color: "var(--on-surface-variant)" }}>Detail Mutasi Rekening</p>
            </div>
          </header>

          <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            <div className="glass-card" style={{ padding: 24, textAlign: "center", marginBottom: 24 }}>
              <p className="text-label-md" style={{ color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Saldo Saat Ini</p>
              <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--on-surface)", margin: 0 }}>{formatRupiah(selectedAccount.balance)}</h2>
            </div>

            <h3 className="text-headline-sm" style={{ fontSize: 16, marginBottom: 12 }}>Riwayat Transaksi</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {/* Search & Date */}
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <span className="material-symbols-outlined" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--on-surface-variant)", fontSize: 20 }}>search</span>
                  <input 
                    type="text" 
                    placeholder="Cari deskripsi..." 
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="glass-input"
                    style={{ padding: "10px 12px 10px 40px", width: "100%", borderRadius: 16, fontSize: 14 }}
                  />
                </div>
                
                <button
                  onClick={() => setIsTxDatePickerOpen(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "0 12px", borderRadius: 16,
                    border: `1px solid ${txDateRange?.from || txDateRange?.to ? "var(--primary)" : "var(--outline-variant)"}`,
                    background: txDateRange?.from || txDateRange?.to ? "var(--primary-container)" : "rgba(255,255,255,0.5)",
                    color: txDateRange?.from || txDateRange?.to ? "var(--on-primary-container)" : "var(--on-surface-variant)",
                    fontWeight: 600, fontSize: 13, cursor: "pointer", flexShrink: 0
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_month</span>
                </button>
              </div>

              {/* Filters */}
              <div style={{ 
                display: "flex", 
                gap: 8, 
                overflowX: "auto", 
                width: "100%",
                paddingBottom: 4,
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none"
              }} className="hide-scrollbar-inline">
                <style dangerouslySetInnerHTML={{__html: `
                  .hide-scrollbar-inline::-webkit-scrollbar {
                    display: none;
                  }
                `}} />
                {[{ label: "Semua", val: "" }, { label: "Pemasukan", val: "INCOME" }, { label: "Pengeluaran", val: "EXPENSE" }].map(f => (
                  <button
                    key={f.val}
                    onClick={() => setTxFilterType(f.val)}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 12,
                      border: `1px solid ${txFilterType === f.val ? "var(--primary)" : "var(--outline-variant)"}`,
                      background: txFilterType === f.val ? "var(--primary-container)" : "rgba(255,255,255,0.5)",
                      color: txFilterType === f.val ? "var(--on-primary-container)" : "var(--on-surface-variant)",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            
            {isLoadingTx ? (
              <div style={{ textAlign: "center", padding: 32, color: "var(--on-surface-variant)" }}>Memuat mutasi...</div>
            ) : accountTx.length === 0 ? (
              <div className="glass-card" style={{ textAlign: "center", padding: 32, color: "var(--on-surface-variant)" }}>
                Belum ada transaksi di rekening ini.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {accountTx.map((tx) => {
                  const isExpense = tx.type === "EXPENSE";
                  return (
                    <div 
                      key={tx.id} 
                      className="glass-card" 
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, gap: 12, cursor: "pointer" }}
                      onClick={() => setSelectedDetailTxId(tx.id)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: isExpense ? "rgba(244, 67, 54, 0.1)" : "rgba(76, 175, 80, 0.1)",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ color: isExpense ? "rgba(229, 57, 53, 1)" : "rgba(67, 160, 71, 1)" }}
                          >
                            {isExpense ? "shopping_cart" : "account_balance_wallet"}
                          </span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p className="text-body-md" style={{ fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {tx.description || "Tanpa deskripsi"}
                          </p>
                          <p className="text-body-sm" style={{ color: "var(--on-surface-variant)", margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {new Date(tx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} • {tx.category?.name || "Umum"}
                          </p>
                        </div>
                      </div>
                      <span style={{ color: isExpense ? "var(--error)" : "var(--primary)", fontWeight: 600, fontSize: "15px", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {isExpense ? "-" : "+"}{formatRupiah(tx.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {txTotalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 24, paddingBottom: 24 }}>
                <button
                  disabled={txPage <= 1}
                  onClick={() => fetchAccountTransactions(selectedAccount.id, txPage - 1, txFilterType, txSearch, txDateRange?.from?.toISOString() || "", txDateRange?.to?.toISOString() || "")}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--outline-variant)", background: "var(--surface)", cursor: txPage <= 1 ? "not-allowed" : "pointer", opacity: txPage <= 1 ? 0.5 : 1 }}
                >
                  Sebelumnya
                </button>
                <span style={{ alignSelf: "center", fontWeight: 600, color: "var(--on-surface)" }}>Hal {txPage} / {txTotalPages}</span>
                <button
                  disabled={txPage >= txTotalPages}
                  onClick={() => fetchAccountTransactions(selectedAccount.id, txPage + 1, txFilterType, txSearch, txDateRange?.from?.toISOString() || "", txDateRange?.to?.toISOString() || "")}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--outline-variant)", background: "var(--surface)", cursor: txPage >= txTotalPages ? "not-allowed" : "pointer", opacity: txPage >= txTotalPages ? 0.5 : 1 }}
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
    </div>
  );
}
