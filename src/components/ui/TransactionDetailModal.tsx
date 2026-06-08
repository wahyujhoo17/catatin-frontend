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

function getFallbackIcon(
  type: string,
  description: string | null,
  categoryName: string | null,
): string {
  const desc = (description || "").toLowerCase();
  const cat = (categoryName || "").toLowerCase();
  const combined = desc + " " + cat;

  // ── Income ──
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
  if (combined.includes("refund")) return "currency_exchange";
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
  if (combined.includes("telp") || combined.includes("seluler"))
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

  // ── Debt ──
  if (type === "DEBT") return "real_estate_agent";
  if (type === "DEBT_PAYMENT") return "payments";

  // ── Fallback ──
  if (type === "INCOME") return "trending_up";
  return "credit_card";
}

export default function TransactionDetailModal({
  isOpen,
  transactionId,
  onClose,
}: Props) {
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
          const res = await fetch(
            `${API_BASE}/api/transactions/${transactionId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h3 className="text-headline-sm" style={{ margin: 0 }}>
            Detail Transaksi
          </h3>
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

        {isLoading ? (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              color: "var(--on-surface-variant)",
            }}
          >
            Memuat detail...
          </div>
        ) : error ? (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              color: "var(--error)",
            }}
          >
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
                  background:
                    tx.type === "EXPENSE"
                      ? "rgba(244, 67, 54, 0.1)"
                      : "rgba(76, 175, 80, 0.1)",
                  color:
                    tx.type === "EXPENSE"
                      ? "rgba(229, 57, 53, 1)"
                      : "rgba(67, 160, 71, 1)",
                  marginBottom: 16,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 32 }}
                >
                  {tx.category?.icon &&
                  tx.category.icon !== "receipt_long" &&
                  tx.category.icon !== "category"
                    ? tx.category.icon
                    : getFallbackIcon(
                        tx.type,
                        tx.description,
                        tx.category?.name || null,
                      )}
                </span>
              </div>
              <h2
                style={{
                  margin: "0 0 8px 0",
                  fontSize: 32,
                  color:
                    tx.type === "EXPENSE" ? "var(--error)" : "var(--primary)",
                }}
              >
                {tx.type === "EXPENSE" ? "-" : "+"}
                {formatRupiah(tx.amount)}
              </h2>
              <p
                className="text-body-lg"
                style={{
                  margin: 0,
                  fontWeight: 600,
                  color: "var(--on-surface)",
                }}
              >
                {tx.description || "Tanpa deskripsi"}
              </p>
            </div>

            <div
              style={{
                borderTop: "1px dashed var(--outline-variant)",
                margin: "8px 0",
              }}
            />

            {/* Info Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <InfoRow
                label="Tanggal"
                value={format(new Date(tx.date), "dd MMMM yyyy, HH:mm", {
                  locale: idLocale,
                })}
              />
              <InfoRow label="Kategori" value={tx.category?.name || "Umum"} />
              <InfoRow
                label="Rekening/Dompet"
                value={tx.account?.name || "Tidak ada"}
              />

              {tx.customer && (
                <InfoRow label="Pelanggan" value={tx.customer.name} />
              )}

              <InfoRow
                label="Metode Pembayaran"
                value={
                  tx.method ? methodLabels[tx.method] || tx.method : "Lainnya"
                }
              />
              <InfoRow
                label="Sumber Pencatatan"
                value={
                  tx.source === "AI" || tx.source === "SCAN"
                    ? "AI / Scanner"
                    : "Manual"
                }
              />

              {tx.note && (
                <div>
                  <p
                    className="text-label-md"
                    style={{
                      color: "var(--on-surface-variant)",
                      marginBottom: 4,
                    }}
                  >
                    Catatan
                  </p>
                  <p
                    className="text-body-md"
                    style={{
                      color: "var(--on-surface)",
                      background: "var(--surface-variant)",
                      padding: "12px 16px",
                      borderRadius: 12,
                    }}
                  >
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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
      }}
    >
      <span
        className="text-body-md"
        style={{ color: "var(--on-surface-variant)", flexShrink: 0 }}
      >
        {label}
      </span>
      <span
        className="text-body-md"
        style={{
          color: "var(--on-surface)",
          fontWeight: 500,
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
}
