"use client";

import { useEffect, useState, useCallback } from "react";
import TopAppBar from "@/components/layout/TopAppBar";
import BottomNav from "@/components/layout/BottomNav";

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
                        }}
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
    </div>
  );
}
