"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import TopAppBar from "@/components/layout/TopAppBar";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// ─── Config ──────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ─── Helpers ──────────────────────────────────────────────────
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

// ─── Types ───────────────────────────────────────────────────
interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE" | "DEBT" | "DEBT_PAYMENT";
  amount: number;
  description: string;
  date: string;
  category?: { name: string; icon: string; color: string };
  account?: { name: string };
}

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [filterType, setFilterType] = useState<string>("");
  const [filterSearch, setFilterSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Edit Modal State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Date Filter Modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const fetchTransactions = useCallback(async (
    pageNum: number = 1, 
    type: string = "", 
    search: string = "", 
    startDate: string = "", 
    endDate: string = ""
  ) => {
    const token = getToken();
    if (!token) return;
    setIsLoading(true);
    try {
      const url = new URL(`${API_BASE}/api/transactions`);
      url.searchParams.append("page", pageNum.toString());
      url.searchParams.append("limit", "20");
      if (type) url.searchParams.append("type", type);
      if (search) url.searchParams.append("search", search);
      if (startDate) url.searchParams.append("startDate", startDate);
      if (endDate) url.searchParams.append("endDate", endDate);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal memuat transaksi");
      const data = await res.json();
      setTransactions(data.transactions || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const startStr = dateRange?.from ? dateRange.from.toISOString() : "";
      const endStr = dateRange?.to ? dateRange.to.toISOString() : "";
      fetchTransactions(1, filterType, filterSearch, startStr, endStr);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterType, filterSearch, dateRange, fetchTransactions]);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini? Saldo akan disesuaikan kembali.")) return;
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus transaksi");
      const startStr = dateRange?.from ? dateRange.from.toISOString() : "";
      const endStr = dateRange?.to ? dateRange.to.toISOString() : "";
      fetchTransactions(page, filterType, filterSearch, startStr, endStr);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setEditAmount(tx.amount.toString());
    setEditDesc(tx.description || "");
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    const token = getToken();
    if (!token) return;
    setIsSaving(true);
    try {
      const amountNum = parseFloat(editAmount.replace(/[^0-9]/g, ""));
      const res = await fetch(`${API_BASE}/api/transactions/${editingTx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount: amountNum,
          description: editDesc,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan perubahan");
      setEditingTx(null);
      const startStr = dateRange?.from ? dateRange.from.toISOString() : "";
      const endStr = dateRange?.to ? dateRange.to.toISOString() : "";
      fetchTransactions(page, filterType, filterSearch, startStr, endStr);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadCSV = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const url = new URL(`${API_BASE}/api/transactions`);
      url.searchParams.append("limit", "10000"); 
      if (filterType) url.searchParams.append("type", filterType);
      if (filterSearch) url.searchParams.append("search", filterSearch);
      if (dateRange?.from) url.searchParams.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to) url.searchParams.append("endDate", dateRange.to.toISOString());

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil data untuk export");
      const data = await res.json();
      
      const rows = [
        ["Tanggal", "Tipe", "Kategori", "Deskripsi", "Akun", "Jumlah"]
      ];
      
      data.transactions.forEach((tx: Transaction) => {
        rows.push([
          new Date(tx.date).toLocaleDateString("id-ID"),
          tx.type,
          tx.category?.name || "-",
          `"${tx.description || "-"}"`,
          tx.account?.name || "-",
          tx.amount.toString()
        ]);
      });
      
      const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `transaksi_catetin_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ backgroundColor: "var(--surface)", minHeight: "100dvh", paddingBottom: 100 }}>
      <TopAppBar />

      <main style={{ marginTop: 72, padding: "0 var(--container-margin)", maxWidth: 672, margin: "72px auto 0" }}>
        <header className="animate-fade-slide-up" style={{ paddingTop: 16, marginBottom: 24 }}>
          <h1 className="text-headline-lg" style={{ color: "var(--on-surface)" }}>Riwayat Transaksi</h1>
          <p className="text-body-md" style={{ color: "var(--on-surface-variant)", marginTop: 4 }}>
            Kelola semua riwayat pemasukan dan pengeluaran Anda.
          </p>
        </header>

        {/* Action & Filter Bar */}
        <div className="animate-fade-slide-up" style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          
          {/* Search & Download */}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <span className="material-symbols-outlined" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--on-surface-variant)" }}>search</span>
              <input 
                type="text" 
                placeholder="Cari deskripsi..." 
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="glass-input"
                style={{ padding: "12px 16px 12px 48px", width: "100%", borderRadius: 16 }}
              />
            </div>
            <button
              onClick={handleDownloadCSV}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "0 16px", borderRadius: 16,
                background: "var(--secondary-container)", color: "var(--on-secondary-container)",
                border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", flexShrink: 0
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
              CSV
            </button>
          </div>

          {/* Date Range & Type */}
          <div style={{ display: "flex", gap: 12, overflowX: "visible", paddingBottom: 4 }}>
            
            <div style={{ position: "relative" }} ref={popoverRef}>
              <button
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 16px", borderRadius: 16,
                  border: `1px solid ${dateRange?.from || dateRange?.to ? "var(--primary)" : "var(--outline-variant)"}`,
                  background: dateRange?.from || dateRange?.to ? "var(--primary-container)" : "rgba(255,255,255,0.5)",
                  color: dateRange?.from || dateRange?.to ? "var(--on-primary-container)" : "var(--on-surface-variant)",
                  fontWeight: 600, fontSize: 14, cursor: "pointer", flexShrink: 0
                }}
              >
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>{format(dateRange.from, "d / M / yyyy")} - {format(dateRange.to, "d / M / yyyy")}</>
                  ) : (
                    <>{format(dateRange.from, "d / M / yyyy")}</>
                  )
                ) : (
                  <span>Pilih Tanggal</span>
                )}
                <span className="material-symbols-outlined" style={{ fontSize: 18, marginLeft: 4 }}>calendar_month</span>
              </button>

              {isDatePickerOpen && (
                <div className="date-picker-popover-content animate-fade-slide-up">
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    locale={id}
                    showOutsideDays
                  />
                </div>
              )}
            </div>

            {[{ label: "Semua Tipe", val: "" }, { label: "Pemasukan", val: "INCOME" }, { label: "Pengeluaran", val: "EXPENSE" }].map(f => (
              <button
                key={f.val}
                onClick={() => setFilterType(f.val)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 12,
                  border: `1px solid ${filterType === f.val ? "var(--primary)" : "var(--outline-variant)"}`,
                  background: filterType === f.val ? "var(--primary-container)" : "rgba(255,255,255,0.5)",
                  color: filterType === f.val ? "var(--on-primary-container)" : "var(--on-surface-variant)",
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

        {error && <div style={{ color: "var(--error)", marginBottom: 16 }}>{error}</div>}

        {/* List */}
        <div className="animate-fade-slide-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: 32, color: "var(--on-surface-variant)" }}>Memuat...</div>
          ) : transactions.length === 0 ? (
            <div className="glass-card" style={{ textAlign: "center", padding: 32 }}>Belum ada transaksi.</div>
          ) : (
            transactions.map((tx) => {
              const isExpense = tx.type === "EXPENSE";
              return (
                <div
                  key={tx.id}
                  className="glass-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                    gap: 12,
                  }}
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
                        {(() => {
                          if (tx.category?.icon && tx.category.icon !== "receipt_long" && tx.category.icon !== "category") return tx.category.icon;
                          const desc = (tx.description || "").toLowerCase();
                          const cat = (tx.category?.name || "").toLowerCase();
                          if (desc.includes("makan") || desc.includes("minum") || cat.includes("makanan")) return "restaurant";
                          if (desc.includes("gaji") || cat.includes("gaji")) return "payments";
                          if (desc.includes("belanja") || desc.includes("beli") || desc.includes("casing") || cat.includes("belanja")) return "shopping_bag";
                          if (desc.includes("pulsa") || desc.includes("listrik") || desc.includes("token")) return "bolt";
                          if (desc.includes("transport") || desc.includes("gojek") || desc.includes("grab") || desc.includes("bensin")) return "local_taxi";
                          if (desc.includes("kesehatan") || desc.includes("obat")) return "medical_services";
                          if (desc.includes("hutang") || desc.includes("bayar")) return "handshake";
                          return isExpense ? "shopping_cart" : "account_balance_wallet";
                        })()}
                      </span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p className="text-body-md" style={{ fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {tx.description || "Tanpa deskripsi"}
                      </p>
                      <p className="text-body-sm" style={{ color: "var(--on-surface-variant)", margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {new Date(tx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} • {tx.category?.name || "Umum"} • {tx.account?.name}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{ color: isExpense ? "var(--error)" : "var(--primary)", fontWeight: 600, fontSize: "15px", whiteSpace: "nowrap" }}>
                      {isExpense ? "-" : "+"}{formatRupiah(tx.amount)}
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={() => openEditModal(tx)}
                        style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "var(--primary)", opacity: 0.7 }}
                        title="Edit"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "var(--error)", opacity: 0.7 }}
                        title="Hapus"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 32 }}>
            <button
              disabled={page <= 1}
              onClick={() => {
                const startStr = dateRange?.from ? dateRange.from.toISOString() : "";
                const endStr = dateRange?.to ? dateRange.to.toISOString() : "";
                fetchTransactions(page - 1, filterType, filterSearch, startStr, endStr);
              }}
              style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--outline-variant)", background: "var(--surface)", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}
            >
              Sebelumnya
            </button>
            <span style={{ alignSelf: "center", fontWeight: 600, color: "var(--on-surface)" }}>Hal {page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => {
                const startStr = dateRange?.from ? dateRange.from.toISOString() : "";
                const endStr = dateRange?.to ? dateRange.to.toISOString() : "";
                fetchTransactions(page + 1, filterType, filterSearch, startStr, endStr);
              }}
              style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--outline-variant)", background: "var(--surface)", cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.5 : 1 }}
            >
              Selanjutnya
            </button>
          </div>
        )}
      </main>

      {/* Floating Back Button */}
      <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 50 }}>
        <button
          onClick={() => router.back()}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 24px", borderRadius: 9999,
            background: "var(--primary)", color: "var(--on-primary)",
            boxShadow: "0 4px 12px rgba(103, 80, 164, 0.3)",
            border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer"
          }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Kembali
        </button>
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div className="glass-card animate-fade-slide-up" style={{ width: "100%", maxWidth: 400, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 className="text-headline-sm">Edit Transaksi</h3>
              <button onClick={() => setEditingTx(null)} style={{ cursor: "pointer", color: "var(--on-surface-variant)", border: "none", background: "none" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="text-label-md" style={{ display: "block", marginBottom: 6, color: "var(--on-surface-variant)" }}>Deskripsi</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="glass-input"
                  style={{ padding: "12px 16px", width: "100%" }}
                  required
                />
              </div>
              <div>
                <label className="text-label-md" style={{ display: "block", marginBottom: 6, color: "var(--on-surface-variant)" }}>Jumlah (Rp)</label>
                <input
                  type="text"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="glass-input"
                  style={{ padding: "12px 16px", width: "100%" }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setEditingTx(null)} style={{ flex: 1, padding: 12, borderRadius: 16, background: "rgba(0,0,0,0.05)", color: "var(--on-surface-variant)", fontWeight: 600, border: "none", cursor: "pointer" }}>Batal</button>
                <button type="submit" className="btn-primary" disabled={isSaving} style={{ flex: 1, padding: 12, fontSize: 16, boxShadow: "none", opacity: isSaving ? 0.7 : 1 }}>{isSaving ? "Menyimpan..." : "Simpan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
