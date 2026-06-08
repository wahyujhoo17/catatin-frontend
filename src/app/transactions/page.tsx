"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import TopAppBar from "@/components/layout/TopAppBar";
import { DateRange } from "react-day-picker";
import PeriodSelector from "@/components/ui/PeriodSelector";
import TransactionDetailModal from "@/components/ui/TransactionDetailModal";
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit Modal State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Detail Modal State
  const [selectedDetailTxId, setSelectedDetailTxId] = useState<string | null>(
    null,
  );

  // Date Filter Modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const fetchTransactions = useCallback(
    async (
      pageNum: number = 1,
      type: string = "",
      search: string = "",
      startDate: string = "",
      endDate: string = "",
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
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const startStr = dateRange?.from ? dateRange.from.toISOString() : "";
      const endStr = dateRange?.to ? dateRange.to.toISOString() : "";
      fetchTransactions(1, filterType, filterSearch, startStr, endStr);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterType, filterSearch, dateRange, fetchTransactions]);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    const token = getToken();
    if (!token) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/transactions/${deleteTargetId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Gagal menghapus transaksi");
      setDeleteTargetId(null);
      const startStr = dateRange?.from ? dateRange.from.toISOString() : "";
      const endStr = dateRange?.to ? dateRange.to.toISOString() : "";
      fetchTransactions(page, filterType, filterSearch, startStr, endStr);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
      if (dateRange?.from)
        url.searchParams.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to)
        url.searchParams.append("endDate", dateRange.to.toISOString());

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil data untuk export");
      const data = await res.json();

      const rows = [
        ["Tanggal", "Tipe", "Kategori", "Deskripsi", "Akun", "Jumlah"],
      ];

      data.transactions.forEach((tx: Transaction) => {
        rows.push([
          new Date(tx.date).toLocaleDateString("id-ID"),
          tx.type,
          tx.category?.name || "-",
          `"${tx.description || "-"}"`,
          tx.account?.name || "-",
          tx.amount.toString(),
        ]);
      });

      const csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `transaksi_catatin_${new Date().getTime()}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        minHeight: "100dvh",
        paddingBottom: 100,
        overflowX: "hidden",
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
        <header
          className="animate-fade-slide-up mobile-header-with-back"
          style={{ paddingTop: 16, marginBottom: 24 }}
        >
          <h1
            className="text-headline-lg"
            style={{ color: "var(--on-surface)" }}
          >
            Riwayat Transaksi
          </h1>
          <p
            className="text-body-md"
            style={{ color: "var(--on-surface-variant)", marginTop: 4 }}
          >
            Kelola semua riwayat pemasukan dan pengeluaran Anda.
          </p>
        </header>

        {/* Action & Filter Bar */}
        <div
          className="animate-fade-slide-up"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* Search & Download */}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--on-surface-variant)",
                }}
              >
                search
              </span>
              <input
                type="text"
                placeholder="Cari deskripsi..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="glass-input"
                style={{
                  padding: "12px 16px 12px 48px",
                  width: "100%",
                  borderRadius: 16,
                }}
              />
            </div>
            <button
              onClick={handleDownloadCSV}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                borderRadius: 12,
                background: "var(--secondary-container)",
                color: "var(--on-secondary-container)",
                border: "none",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.15s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                download
              </span>
              CSV
            </button>
          </div>

          {/* Date Range & Type */}
          <div
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              paddingBottom: 12,
              width: "100%",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none" /* Firefox */,
              msOverflowStyle: "none" /* IE 10+ */,
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

            <button
              onClick={() => setIsDatePickerOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 12,
                border: `1.5px solid ${dateRange?.from || dateRange?.to ? "var(--primary)" : "var(--outline-variant)"}`,
                background:
                  dateRange?.from || dateRange?.to
                    ? "var(--primary-container)"
                    : "rgba(255,255,255,0.5)",
                color:
                  dateRange?.from || dateRange?.to
                    ? "var(--on-primary-container)"
                    : "var(--on-surface-variant)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.15s ease",
              }}
            >
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "d/M/yy")} -{" "}
                    {format(dateRange.to, "d/M/yy")}
                  </>
                ) : (
                  <>{format(dateRange.from, "d/M/yy")}</>
                )
              ) : (
                <span>Pilih Periode</span>
              )}
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, marginLeft: 4 }}
              >
                calendar_month
              </span>
            </button>

            {[
              { label: "Semua Tipe", val: "" },
              { label: "Pemasukan", val: "INCOME" },
              { label: "Pengeluaran", val: "EXPENSE" },
            ].map((f) => (
              <button
                key={f.val}
                onClick={() => setFilterType(f.val)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  border: `1.5px solid ${filterType === f.val ? "var(--primary)" : "var(--outline-variant)"}`,
                  background:
                    filterType === f.val
                      ? "var(--primary-container)"
                      : "rgba(255,255,255,0.5)",
                  color:
                    filterType === f.val
                      ? "var(--on-primary-container)"
                      : "var(--on-surface-variant)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ color: "var(--error)", marginBottom: 16 }}>{error}</div>
        )}

        {/* List */}
        <div
          className="animate-fade-slide-up"
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {isLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: 32,
                color: "var(--on-surface-variant)",
              }}
            >
              Memuat...
            </div>
          ) : transactions.length === 0 ? (
            <div
              className="glass-card"
              style={{ textAlign: "center", padding: 32 }}
            >
              Belum ada transaksi.
            </div>
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
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedDetailTxId(tx.id)}
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
                          if (
                            tx.category?.icon &&
                            tx.category.icon !== "receipt_long" &&
                            tx.category.icon !== "category"
                          )
                            return tx.category.icon;
                          const desc = (tx.description || "").toLowerCase();
                          const cat = (tx.category?.name || "").toLowerCase();
                          if (
                            desc.includes("makan") ||
                            desc.includes("minum") ||
                            cat.includes("makanan")
                          )
                            return "restaurant";
                          if (desc.includes("gaji") || cat.includes("gaji"))
                            return "payments";
                          if (
                            desc.includes("belanja") ||
                            desc.includes("beli") ||
                            desc.includes("casing") ||
                            cat.includes("belanja")
                          )
                            return "shopping_bag";
                          if (
                            desc.includes("pulsa") ||
                            desc.includes("listrik") ||
                            desc.includes("token")
                          )
                            return "bolt";
                          if (
                            desc.includes("transport") ||
                            desc.includes("gojek") ||
                            desc.includes("grab") ||
                            desc.includes("bensin")
                          )
                            return "local_taxi";
                          if (
                            desc.includes("kesehatan") ||
                            desc.includes("obat")
                          )
                            return "medical_services";
                          if (desc.includes("hutang") || desc.includes("bayar"))
                            return "handshake";
                          return isExpense
                            ? "shopping_cart"
                            : "account_balance_wallet";
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
                        {tx.category?.name || "Umum"}{" "}
                        {tx.account?.name ? `• ${tx.account.name}` : ""}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        color: isExpense ? "var(--error)" : "var(--primary)",
                        fontWeight: 600,
                        fontSize: "15px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isExpense ? "-" : "+"}
                      {formatRupiah(tx.amount)}
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTx(tx);
                          setEditAmount(tx.amount.toString());
                          setEditDesc(tx.description);
                        }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: "rgba(103, 80, 164, 0.06)",
                          border: "none",
                          color: "var(--primary)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s ease",
                        }}
                        aria-label="Edit transaksi"
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 18 }}
                        >
                          edit
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTargetId(tx.id);
                        }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: "rgba(186, 26, 26, 0.06)",
                          border: "none",
                          color: "var(--error)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s ease",
                        }}
                        aria-label="Hapus transaksi"
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 18 }}
                        >
                          delete
                        </span>
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
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              marginTop: 32,
            }}
          >
            <button
              disabled={page <= 1}
              onClick={() => {
                const startStr = dateRange?.from
                  ? dateRange.from.toISOString()
                  : "";
                const endStr = dateRange?.to ? dateRange.to.toISOString() : "";
                fetchTransactions(
                  page - 1,
                  filterType,
                  filterSearch,
                  startStr,
                  endStr,
                );
              }}
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 14,
                border: "1px solid var(--outline-variant)",
                background:
                  page <= 1
                    ? "rgba(0,0,0,0.03)"
                    : "var(--surface-container-low)",
                color:
                  page <= 1 ? "var(--on-surface-variant)" : "var(--on-surface)",
                cursor: page <= 1 ? "not-allowed" : "pointer",
                opacity: page <= 1 ? 0.5 : 1,
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                chevron_left
              </span>
              Sebelumnya
            </button>
            <span
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "var(--on-surface)",
                padding: "8px 16px",
                borderRadius: 10,
                background: "var(--primary-container)",
                color: "var(--on-primary-container)",
              }}
            >
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => {
                const startStr = dateRange?.from
                  ? dateRange.from.toISOString()
                  : "";
                const endStr = dateRange?.to ? dateRange.to.toISOString() : "";
                fetchTransactions(
                  page + 1,
                  filterType,
                  filterSearch,
                  startStr,
                  endStr,
                );
              }}
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 14,
                border: "1px solid var(--outline-variant)",
                background:
                  page >= totalPages
                    ? "rgba(0,0,0,0.03)"
                    : "var(--surface-container-low)",
                color:
                  page >= totalPages
                    ? "var(--on-surface-variant)"
                    : "var(--on-surface)",
                cursor: page >= totalPages ? "not-allowed" : "pointer",
                opacity: page >= totalPages ? 0.5 : 1,
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Selanjutnya
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                chevron_right
              </span>
            </button>
          </div>
        )}
      </main>

      {/* Top Floating Back Button */}
      <button
        onClick={() => router.back()}
        style={{
          position: "fixed",
          top: 88 /* Positioned slightly below TopAppBar */,
          left: "var(--container-margin)",
          zIndex: 90 /* Below overlay 1000 but above content */,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          cursor: "pointer",
        }}
        aria-label="Kembali"
      >
        <span
          className="material-symbols-outlined"
          style={{ color: "var(--on-surface-variant)", fontSize: 22 }}
        >
          arrow_back
        </span>
      </button>

      {/* Edit Modal */}
      {editingTx && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 24,
          }}
        >
          <div
            className="glass-card animate-fade-slide-up"
            style={{ width: "100%", maxWidth: 400, padding: 24 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3 className="text-headline-sm">Edit Transaksi</h3>
              <button
                onClick={() => setEditingTx(null)}
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
              onSubmit={handleEditSave}
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
                  Deskripsi
                </label>
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
                <label
                  className="text-label-md"
                  style={{
                    display: "block",
                    marginBottom: 6,
                    color: "var(--on-surface-variant)",
                  }}
                >
                  Jumlah (Rp)
                </label>
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
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid var(--outline-variant)",
                    background: "transparent",
                    color: "var(--on-surface-variant)",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: 12,
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 12,
                    border: "none",
                    background: "var(--primary)",
                    color: "white",
                    cursor: isSaving ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(79, 55, 138, 0.2)",
                    opacity: isSaving ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.15s ease",
                  }}
                >
                  {isSaving ? (
                    <>
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: 18,
                          animation: "spin 1s linear infinite",
                        }}
                      >
                        progress_activity
                      </span>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Put Modals outside main to avoid transform breaking position: fixed */}
      <PeriodSelector
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelectRange={(range) => {
          setDateRange(range);
          setPage(1); // reset to page 1 when filter changes
        }}
        initialRange={dateRange}
      />

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={!!selectedDetailTxId}
        transactionId={selectedDetailTxId}
        onClose={() => setSelectedDetailTxId(null)}
      />

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(29, 27, 32, 0.5)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 24,
          }}
        >
          <div
            className="glass-card animate-fade-slide-up"
            style={{
              padding: 24,
              width: "100%",
              maxWidth: 380,
              background: "white",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              border: "1px solid rgba(203, 196, 210, 0.4)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(186, 26, 26, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px auto",
                  color: "var(--error)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 32 }}
                >
                  delete_forever
                </span>
              </div>
              <h3
                className="text-headline-sm"
                style={{
                  fontSize: 18,
                  color: "var(--on-surface)",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Hapus Transaksi?
              </h3>
              <p
                className="text-body-sm"
                style={{
                  color: "var(--on-surface-variant)",
                  marginTop: 10,
                  lineHeight: "20px",
                }}
              >
                Apakah Anda yakin ingin menghapus transaksi ini? Saldo akan
                disesuaikan kembali. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 12,
                  border: "1px solid var(--outline-variant)",
                  background: "transparent",
                  color: "var(--on-surface-variant)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.15s ease",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 12,
                  border: "none",
                  background: "var(--error)",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(186, 26, 26, 0.2)",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {isDeleting ? (
                  <>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 18,
                        animation: "spin 1s linear infinite",
                      }}
                    >
                      progress_activity
                    </span>
                    Menghapus...
                  </>
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
