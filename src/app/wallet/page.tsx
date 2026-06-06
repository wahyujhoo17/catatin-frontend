"use client";

import { useState } from "react";
import TopAppBar from "@/components/layout/TopAppBar";
import BottomNav from "@/components/layout/BottomNav";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  icon: string;
  color: string;
  bgColor: string;
}

const initialAccounts: Account[] = [
  { id: "1", name: "Uang Tunai (Cash)", type: "Cash", balance: 450000, icon: "payments", color: "var(--primary)", bgColor: "var(--primary-fixed)" },
  { id: "2", name: "Bank BCA", type: "Bank", balance: 8500000, icon: "account_balance", color: "var(--secondary)", bgColor: "var(--secondary-container)" },
  { id: "3", name: "Bank Mandiri", type: "Bank", balance: 4800000, icon: "account_balance", color: "var(--tertiary)", bgColor: "var(--tertiary-container)" },
  { id: "4", name: "GoPay", type: "E-Wallet", balance: 500000, icon: "wallet", color: "var(--primary-container)", bgColor: "rgba(103, 80, 164, 0.15)" },
];

const dropdownOptions = [
  { value: "Bank", label: "Bank Account", icon: "account_balance" },
  { value: "E-Wallet", label: "Dompet Digital / E-Wallet", icon: "wallet" },
  { value: "Cash", label: "Uang Tunai (Cash)", icon: "payments" },
];

export default function WalletPage() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Custom dropdown select state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Form state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Bank");
  const [newBalance, setNewBalance] = useState("");

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const selectedDropdown = dropdownOptions.find(opt => opt.value === newType) || dropdownOptions[0];

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBalance) return;

    const balanceNum = parseFloat(newBalance.replace(/\D/g, "")) || 0;
    
    // Choose icon based on type
    let icon = "account_balance";
    let color = "var(--primary)";
    let bgColor = "var(--primary-fixed)";
    
    if (newType === "Cash") {
      icon = "payments";
      color = "var(--secondary)";
      bgColor = "var(--secondary-container)";
    } else if (newType === "E-Wallet") {
      icon = "wallet";
      color = "var(--tertiary)";
      bgColor = "var(--tertiary-container)";
    }

    const newAcc: Account = {
      id: Date.now().toString(),
      name: newName,
      type: newType,
      balance: balanceNum,
      icon,
      color,
      bgColor,
    };

    setAccounts([...accounts, newAcc]);
    
    // Reset form
    setNewName("");
    setNewType("Bank");
    setNewBalance("");
    setIsModalOpen(false);
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

      <main style={{ marginTop: 72, padding: "0 var(--container-margin)", maxWidth: 672, margin: "72px auto 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-gap-lg)" }}>
          
          {/* Header */}
          <header className="animate-fade-slide-up" style={{ paddingTop: 16 }}>
            <h1 className="text-headline-lg" style={{ color: "var(--on-surface)" }}>Dompet & Rekening</h1>
            <p className="text-body-md" style={{ color: "var(--on-surface-variant)", marginTop: 4 }}>
              Kelola semua saldo dan rekening Anda dalam satu dashboard terpusat.
            </p>
          </header>

          {/* Total Balance Card */}
          <section className="glass-card animate-fade-slide-up wallet-balance-card">
            <p className="text-label-md" style={{ color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em" }}>TOTAL SALDO gabungan</p>
            <h2 className="wallet-balance-amount">
              Rp {totalBalance.toLocaleString("id-ID")}
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
                marginRight: "auto"
              }}
            >
              <span className="material-symbols-outlined">add</span>
              Tambah Rekening
            </button>
          </section>

          {/* Accounts List */}
          <section className="animate-fade-slide-up" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 className="text-headline-sm" style={{ paddingLeft: 4 }}>Daftar Akun ({accounts.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="glass-card wallet-account-item"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: acc.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ color: acc.color }}>{acc.icon}</span>
                    </div>
                    <div>
                      <p className="wallet-account-name">{acc.name}</p>
                      <p className="wallet-account-type">{acc.type}</p>
                    </div>
                  </div>
                  <span className="wallet-account-balance">
                    Rp {acc.balance.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 className="text-headline-sm">Tambah Rekening Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ cursor: "pointer", color: "var(--on-surface-variant)", border: "none", background: "none" }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddAccount} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="text-label-md" style={{ display: "block", marginBottom: 6, color: "var(--on-surface-variant)" }}>Nama Rekening / Akun</label>
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
                <label className="text-label-md" style={{ display: "block", marginBottom: 6, color: "var(--on-surface-variant)" }}>Tipe Rekening</label>
                
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
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)" }}>{selectedDropdown.icon}</span>
                    <span>{selectedDropdown.label}</span>
                  </div>
                  <span className="material-symbols-outlined" style={{
                    transition: "transform 0.2s",
                    transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0)"
                  }}>
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
                          background: newType === opt.value ? "rgba(103, 80, 164, 0.08)" : "transparent",
                          color: newType === opt.value ? "var(--primary)" : "var(--on-surface)",
                          fontWeight: newType === opt.value ? 600 : 500,
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (newType !== opt.value) e.currentTarget.style.backgroundColor = "rgba(103, 80, 164, 0.03)";
                        }}
                        onMouseLeave={(e) => {
                          if (newType !== opt.value) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{opt.icon}</span>
                        <span style={{ fontSize: 15 }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-label-md" style={{ display: "block", marginBottom: 6, color: "var(--on-surface-variant)" }}>Saldo Awal (Rp)</label>
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
                  style={{
                    flex: 1,
                    padding: 12,
                    fontSize: 16,
                    boxShadow: "none",
                  }}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
