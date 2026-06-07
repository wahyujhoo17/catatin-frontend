import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface TransactionDetail {
  id: string;
  type: "INCOME" | "EXPENSE" | "DEBT" | "DEBT_PAYMENT";
  amount: number;
  description: string | null;
  note: string | null;
  method: string | null;
  source: string | null;
  date: string;
  createdAt: string;
  category?: { name: string; icon: string; color: string };
  account?: { name: string };
  customer?: { name: string };
}

interface Props {
  isOpen: boolean;
  transactionId: string | null;
  onClose: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

const methodLabels: Record<string, string> = {
  cash: "Tunai",
  debit_card: "Kartu Debit",
  credit_card: "Kartu Kredit",
  e_wallet: "E-Wallet",
  transfer: "Transfer",
};

export default function TransactionDetailModal({ isOpen, transactionId, onClose }: Props) {
  const [tx, setTx] = useState<TransactionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && transactionId) {
      const fetchTx = async () => {
        setIsLoading(true);
        setError("");
        const token = getToken();
        if (!token) return;
        try {
          const res = await fetch(`${API_BASE}/api/transactions/${transactionId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error("Gagal memuat detail transaksi");
          const json = await res.json();
          setTx(json.transaction);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTx();
    } else {
      setTx(null);
      setError("");
    }
  }, [isOpen, transactionId]);

  if (!isOpen) return null;

  return (
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 className="text-headline-sm" style={{ margin: 0 }}>Detail Transaksi</h3>
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
              color: "var(--on-surface-variant)"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--on-surface-variant)" }}>
            Memuat detail...
          </div>
        ) : error ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--error)" }}>
            {error}
          </div>
        ) : tx ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Amount & Description Header */}
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div 
                style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  width: 56, 
                  height: 56, 
                  borderRadius: 16, 
                  background: tx.type === "EXPENSE" ? "rgba(244, 67, 54, 0.1)" : "rgba(76, 175, 80, 0.1)",
                  color: tx.type === "EXPENSE" ? "rgba(229, 57, 53, 1)" : "rgba(67, 160, 71, 1)",
                  marginBottom: 16
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                  {tx.category?.icon || (tx.type === "EXPENSE" ? "shopping_cart" : "account_balance_wallet")}
                </span>
              </div>
              <h2 style={{ 
                margin: "0 0 8px 0", 
                fontSize: 32, 
                color: tx.type === "EXPENSE" ? "var(--error)" : "var(--primary)" 
              }}>
                {tx.type === "EXPENSE" ? "-" : "+"}{formatRupiah(tx.amount)}
              </h2>
              <p className="text-body-lg" style={{ margin: 0, fontWeight: 600, color: "var(--on-surface)" }}>
                {tx.description || "Tanpa deskripsi"}
              </p>
            </div>

            <div style={{ borderTop: "1px dashed var(--outline-variant)", margin: "8px 0" }} />

            {/* Info Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <InfoRow label="Tanggal" value={format(new Date(tx.date), "dd MMMM yyyy, HH:mm", { locale: idLocale })} />
              <InfoRow label="Kategori" value={tx.category?.name || "Umum"} />
              <InfoRow label="Rekening/Dompet" value={tx.account?.name || "Tidak ada"} />
              
              {tx.customer && (
                <InfoRow label="Pelanggan" value={tx.customer.name} />
              )}
              
              <InfoRow label="Metode Pembayaran" value={tx.method ? (methodLabels[tx.method] || tx.method) : "Lainnya"} />
              <InfoRow label="Sumber Pencatatan" value={tx.source === "AI" || tx.source === "SCAN" ? "AI / Scanner" : "Manual"} />
              
              {tx.note && (
                <div>
                  <p className="text-label-md" style={{ color: "var(--on-surface-variant)", marginBottom: 4 }}>Catatan</p>
                  <p className="text-body-md" style={{ color: "var(--on-surface)", background: "var(--surface-variant)", padding: "12px 16px", borderRadius: 12 }}>
                    {tx.note}
                  </p>
                </div>
              )}
            </div>
            
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
      <span className="text-body-md" style={{ color: "var(--on-surface-variant)", flexShrink: 0 }}>{label}</span>
      <span className="text-body-md" style={{ color: "var(--on-surface)", fontWeight: 500, textAlign: "right", wordBreak: "break-word" }}>{value}</span>
    </div>
  );
}
