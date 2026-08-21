"use client";

import { FormEvent, memo, useCallback, useDeferredValue, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopAppBar from "@/components/layout/TopAppBar";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./pos.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Tab = "cashier" | "overview" | "products" | "customers" | "sales" | "reports" | "settings";
type PaymentMethod = "CASH" | "BANK_TRANSFER" | "E_WALLET" | "CARD" | "CREDIT";

interface Product { id: string; name: string; sku?: string | null; barcode?: string | null; price: number; costPrice?: number | null; category?: string | null; unit: string; stock: number; minStock: number; image?: string | null; isActive: boolean; }
interface StockMovement { id: string; type: "INITIAL" | "PURCHASE" | "SALE" | "ADJUSTMENT" | "RETURN" | "VOID"; quantity: number; stockBefore: number; stockAfter: number; note?: string | null; createdAt: string; }
interface ProductDetail extends Product { stockMovements: StockMovement[]; }
interface Customer { id: string; name: string; phone?: string | null; debt: number; maxDebt?: number | null; notes?: string | null; isActive: boolean; }
interface ReceivableEntry { id: string; type: "CHARGE" | "PAYMENT" | "ADJUSTMENT"; amount: number; method?: PaymentMethod | null; note?: string | null; createdAt: string; }
interface CustomerDetail extends Customer { receivables: ReceivableEntry[]; sales: { id: string; invoiceNumber: string; total: number; outstandingAmount: number; createdAt: string }[]; }
interface SaleItem { id: string; productId?: string | null; productName: string; quantity: number; unit: string; unitPrice: number; unitCost: number; subtotal: number; }
interface SalePayment { id: string; method: PaymentMethod; amount: number; reference?: string | null; }
interface Sale { id: string; invoiceNumber: string; status: "COMPLETED" | "VOIDED"; subtotal: number; discount: number; tax: number; total: number; paidAmount: number; creditAmount: number; outstandingAmount: number; changeAmount: number; createdAt: string; notes?: string | null; voidReason?: string | null; customer?: { id: string; name: string } | null; items: SaleItem[]; payments: SalePayment[]; }
interface Session { id: string; openingCash: number; expectedCash?: number | null; closingCash?: number | null; openedAt: string; }
interface Profile { businessName: string; address?: string | null; phone?: string | null; receiptFooter?: string | null; taxPercent: number; }
interface Dashboard { profile: Profile | null; session: Session | null; metrics: { salesTotal: number; cashIn: number; transactionCount: number; totalDebt: number; grossProfit: number }; salesChart: { date: string; total: number }[]; lowStock: { id: string; name: string; stock: number; minStock: number; unit: string }[]; recentSales: Sale[]; topItems: { productId?: string | null; name: string; quantity: number; revenue: number }[]; }
interface Report { period: "day" | "week" | "month"; range: { start: string; end: string }; metrics: { revenue: number; cashIn: number; transactionCount: number; cost: number; grossProfit: number; discount: number; tax: number; credit: number; totalDebt: number }; topItems: { productId?: string | null; name: string; quantity: number; revenue: number }[]; sales: Sale[]; }
interface PaymentDraft { method: PaymentMethod; amount: string; reference?: string; }
interface AssistantDraft { items?: { productId: string; quantity: number }[]; customerId?: string | null; customerName?: string | null; paymentMethod?: PaymentMethod; productId?: string; productName?: string; quantity?: number; amount?: number; }
interface AssistantResponse { reply: string; intent: string; draft?: AssistantDraft; }

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "cashier", label: "Kasir", icon: "point_of_sale" },
  { id: "overview", label: "Ringkasan", icon: "dashboard" },
  { id: "products", label: "Produk", icon: "inventory_2" },
  { id: "customers", label: "Kasbon", icon: "group" },
  { id: "sales", label: "Penjualan", icon: "receipt_long" },
  { id: "reports", label: "Laporan", icon: "monitoring" },
  { id: "settings", label: "Usaha", icon: "storefront" },
];

const paymentLabels: Record<PaymentMethod, string> = { CASH: "Tunai", BANK_TRANSFER: "Transfer bank", E_WALLET: "E-wallet", CARD: "Kartu", CREDIT: "Kasbon" };

function money(value: number) { return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0); }
function dateTime(value: string) { return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function csvCell(value: string | number) {
  let text = String(value ?? "");
  if (/^[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const csv = `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function api<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "x-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jakarta", ...init?.headers },
  });
  const data = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Permintaan gagal diproses");
  return data;
}

const Icon = memo(function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: size }}>{name}</span>;
});

function Modal({ title, children, onClose, wide = false }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return <div className={styles.overlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className={`${styles.modal} ${wide ? styles.modalWide : ""}`} role="dialog" aria-modal="true" aria-label={title}>
      <header className={styles.modalHeader}><div><h2>{title}</h2></div><button className={styles.iconButton} onClick={onClose} aria-label="Tutup"><Icon name="close" /></button></header>
      {children}
    </section>
  </div>;
}

const EmptyState = memo(function EmptyState({ icon, text }: { icon: string; text: string }) {
  return <div className={styles.empty}><div><Icon name={icon} /><p>{text}</p></div></div>;
});

const Metric = memo(function Metric({ label, value, icon }: { label: string; value: string; icon: string }) {
  return <div className={styles.metric}><div className={styles.metricLabel}><Icon name={icon} size={17} />{label}</div><div className={styles.metricValue}>{value}</div></div>;
});

function Receipt({ sale, profile }: { sale: Sale; profile: Profile | null }) {
  return <div className={styles.receipt}>
    <div className={styles.receiptHead}><h2>{profile?.businessName || "Usaha Saya"}</h2>{profile?.address ? <p>{profile.address}</p> : null}{profile?.phone ? <p>{profile.phone}</p> : null}</div>
    <div className={styles.receiptLine}><span>No.</span><strong>{sale.invoiceNumber}</strong></div>
    <div className={styles.receiptLine}><span>Waktu</span><span>{dateTime(sale.createdAt)}</span></div>
    {sale.customer ? <div className={styles.receiptLine}><span>Pelanggan</span><span>{sale.customer.name}</span></div> : null}
    <hr className={styles.receiptRule} />
    {sale.items.map((item) => <div key={item.id}><strong>{item.productName}</strong><div className={styles.receiptLine}><span>{item.quantity} {item.unit} x {money(item.unitPrice)}</span><span>{money(item.subtotal)}</span></div></div>)}
    <hr className={styles.receiptRule} />
    <div className={styles.receiptLine}><span>Subtotal</span><span>{money(sale.subtotal)}</span></div>
    {sale.discount > 0 ? <div className={styles.receiptLine}><span>Diskon</span><span>-{money(sale.discount)}</span></div> : null}
    {sale.tax > 0 ? <div className={styles.receiptLine}><span>Pajak</span><span>{money(sale.tax)}</span></div> : null}
    <div className={styles.receiptLine}><strong>Total</strong><strong>{money(sale.total)}</strong></div>
    {sale.payments.map((payment) => <div className={styles.receiptLine} key={payment.id}><span>{paymentLabels[payment.method]}</span><span>{money(payment.amount)}</span></div>)}
    {sale.changeAmount > 0 ? <div className={styles.receiptLine}><span>Kembalian</span><span>{money(sale.changeAmount)}</span></div> : null}
    <hr className={styles.receiptRule} />
    <p style={{ textAlign: "center" }}>{profile?.receiptFooter || "Terima kasih sudah berbelanja."}</p>
  </div>;
}

export default function POSDashboard() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window === "undefined") return "cashier";
    const value = new URLSearchParams(window.location.search).get("tab") as Tab | null;
    return tabs.some((item) => item.id === value) ? value! : "cashier";
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [reportPeriod, setReportPeriod] = useState<"day" | "week" | "month">("day");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [modal, setModal] = useState<"product" | "productDetail" | "customer" | "customerDetail" | "stock" | "debt" | "checkout" | "sessionOpen" | "sessionClose" | "sale" | "void" | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [targetCustomer, setTargetCustomer] = useState<Customer | null>(null);
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [payments, setPayments] = useState<PaymentDraft[]>([{ method: "CASH", amount: "" }]);
  const [discount, setDiscount] = useState("0");
  const [taxPercent, setTaxPercent] = useState("0");
  const [command, setCommand] = useState("");
  const [assistantReply, setAssistantReply] = useState("");
  const [busy, setBusy] = useState(false);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [productData, customerData, dashboardData, saleData] = await Promise.all([
        api<{ products: Product[] }>("/api/products?limit=200&status=active", token),
        api<{ customers: Customer[] }>("/api/customers", token),
        api<Dashboard>("/api/pos/dashboard", token),
        api<{ sales: Sale[] }>("/api/pos/sales?limit=60", token),
      ]);
      setProducts(productData.products);
      setCustomers(customerData.customers);
      setDashboard(dashboardData);
      setSales(saleData.sales);
      setTaxPercent(String(dashboardData.profile?.taxPercent || 0));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Data POS gagal dimuat");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return; }
    if (user && user.mode !== "POS") { router.replace("/dashboard"); return; }
    const timer = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(timer);
  }, [authLoading, user, router, refresh]);

  useEffect(() => {
    if (!token || activeTab !== "reports") return;
    let active = true;
    void api<Report>(`/api/pos/report?period=${reportPeriod}`, token)
      .then((data) => { if (active) setReport(data); })
      .catch((cause) => { if (active) showToast(cause instanceof Error ? cause.message : "Laporan gagal dimuat"); });
    return () => { active = false; };
  }, [activeTab, reportPeriod, token, showToast]);

  const filteredProducts = useMemo(() => {
    const query = deferredSearch.trim().toLocaleLowerCase("id-ID");
    if (!query) return products;
    return products.filter((product) => [product.name, product.sku || "", product.barcode || "", product.category || ""].some((value) => value.toLocaleLowerCase("id-ID").includes(query)));
  }, [products, deferredSearch]);

  const cartLines = useMemo(() => products.flatMap((product) => cart[product.id] ? [{ product, quantity: cart[product.id], subtotal: cart[product.id] * product.price }] : []), [products, cart]);
  const subtotal = useMemo(() => cartLines.reduce((sum, line) => sum + line.subtotal, 0), [cartLines]);
  const total = useMemo(() => Math.max(0, subtotal - Number(discount || 0)) * (1 + Number(taxPercent || 0) / 100), [subtotal, discount, taxPercent]);

  const addToCart = useCallback((product: Product) => {
    if (product.stock <= 0) return;
    setCart((current) => ({ ...current, [product.id]: Math.min(product.stock, (current[product.id] || 0) + 1) }));
  }, []);
  const changeQuantity = useCallback((product: Product, delta: number) => {
    setCart((current) => {
      const next = Math.max(0, Math.min(product.stock, (current[product.id] || 0) + delta));
      const copy = { ...current };
      if (next === 0) delete copy[product.id]; else copy[product.id] = next;
      return copy;
    });
  }, []);

  const openCheckout = useCallback((method: PaymentMethod = "CASH", customerId = "", amount?: number) => {
    if (!dashboard?.session) { setModal("sessionOpen"); return; }
    if (cartLines.length === 0) { showToast("Keranjang masih kosong"); return; }
    const defaultTax = dashboard.profile?.taxPercent || 0;
    const checkoutTotal = amount ?? subtotal * (1 + defaultTax / 100);
    setSelectedCustomerId(customerId);
    setPayments([{ method, amount: String(Math.round(checkoutTotal)) }]);
    setDiscount("0");
    setTaxPercent(String(defaultTax));
    setModal("checkout");
  }, [dashboard, cartLines.length, subtotal, showToast]);

  const submitAssistant = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !command.trim()) return;
    setBusy(true);
    try {
      const result = await api<AssistantResponse>("/api/pos/assistant", token, { method: "POST", body: JSON.stringify({ message: command }) });
      setAssistantReply(result.reply);
      const draft = result.draft;
      if (result.intent === "SALE" && draft?.items) {
        const nextCart = Object.fromEntries(draft.items.map((item) => [item.productId, item.quantity]));
        setCart(nextCart);
        const draftTotal = draft.items.reduce((sum, item) => sum + (products.find((product) => product.id === item.productId)?.price || 0) * item.quantity, 0);
        if (dashboard?.session) {
          setSelectedCustomerId(draft.customerId || "");
          setPayments([{ method: draft.paymentMethod || "CASH", amount: String(Math.round(draftTotal)) }]);
          setDiscount("0");
          setTaxPercent(String(dashboard.profile?.taxPercent || 0));
          setModal("checkout");
        } else setModal("sessionOpen");
      }
      if (result.intent === "DEBT_PAYMENT" && draft?.customerId) {
        const customer = customers.find((item) => item.id === draft.customerId) || null;
        setTargetCustomer(customer);
        setModal("debt");
      }
      if (result.intent === "STOCK_ADJUST" && draft?.productId) {
        setTargetProduct(products.find((item) => item.id === draft.productId) || null);
        setModal("stock");
      }
    } catch (cause) { showToast(cause instanceof Error ? cause.message : "Perintah gagal diproses"); }
    finally { setBusy(false); }
  };

  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!token) return;
    const form = new FormData(event.currentTarget);
    const body = { name: String(form.get("name") || ""), sku: String(form.get("sku") || "") || null, barcode: String(form.get("barcode") || "") || null, price: Number(form.get("price")), costPrice: form.get("costPrice") ? Number(form.get("costPrice")) : null, category: String(form.get("category") || "") || null, unit: String(form.get("unit") || "pcs"), stock: Number(form.get("stock") || 0), minStock: Number(form.get("minStock") || 0), image: String(form.get("image") || "") || null };
    setBusy(true);
    try {
      await api(editingProduct ? `/api/products/${editingProduct.id}` : "/api/products", token, { method: editingProduct ? "PUT" : "POST", body: JSON.stringify(body) });
      setModal(null); setEditingProduct(null); await refresh(); showToast("Produk berhasil disimpan");
    } catch (cause) { showToast(cause instanceof Error ? cause.message : "Produk gagal disimpan"); } finally { setBusy(false); }
  };

  const submitCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!token) return;
    const form = new FormData(event.currentTarget);
    const body = { name: String(form.get("name") || ""), phone: String(form.get("phone") || "") || null, maxDebt: form.get("maxDebt") ? Number(form.get("maxDebt")) : undefined, notes: String(form.get("notes") || "") || null };
    setBusy(true);
    try {
      await api(editingCustomer ? `/api/customers/${editingCustomer.id}` : "/api/customers", token, { method: editingCustomer ? "PUT" : "POST", body: JSON.stringify(body) });
      setModal(null); setEditingCustomer(null); await refresh(); showToast("Pelanggan berhasil disimpan");
    } catch (cause) { showToast(cause instanceof Error ? cause.message : "Pelanggan gagal disimpan"); } finally { setBusy(false); }
  };

  const openCustomerDetail = async (customer: Customer) => {
    if (!token) return;
    setTargetCustomer(customer);
    setCustomerDetail(null);
    setModal("customerDetail");
    try {
      const result = await api<{ customer: CustomerDetail }>(`/api/customers/${customer.id}`, token);
      setCustomerDetail(result.customer);
    } catch (cause) {
      setModal(null);
      showToast(cause instanceof Error ? cause.message : "Riwayat pelanggan gagal dimuat");
    }
  };

  const submitStock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!token || !targetProduct) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await api(`/api/products/${targetProduct.id}/stock`, token, { method: "POST", body: JSON.stringify({ quantity: Number(form.get("quantity")), type: form.get("type"), note: form.get("note") }) });
      setModal(null); setTargetProduct(null); await refresh(); showToast("Stok berhasil diperbarui");
    } catch (cause) { showToast(cause instanceof Error ? cause.message : "Stok gagal diperbarui"); } finally { setBusy(false); }
  };

  const openProductDetail = async (product: Product) => {
    if (!token) return;
    setTargetProduct(product);
    setProductDetail(null);
    setModal("productDetail");
    try {
      const result = await api<{ product: ProductDetail }>(`/api/products/${product.id}`, token);
      setProductDetail(result.product);
    } catch (cause) {
      setModal(null);
      showToast(cause instanceof Error ? cause.message : "Riwayat stok gagal dimuat");
    }
  };

  const submitDebtPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!token || !targetCustomer) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await api(`/api/customers/${targetCustomer.id}/payments`, token, { method: "POST", body: JSON.stringify({ amount: Number(form.get("amount")), method: form.get("method"), note: form.get("note") }) });
      setModal(null); setTargetCustomer(null); await refresh(); showToast("Pembayaran kasbon berhasil dicatat");
    } catch (cause) { showToast(cause instanceof Error ? cause.message : "Pembayaran gagal disimpan"); } finally { setBusy(false); }
  };

  const submitCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!token) return;
    setBusy(true);
    try {
      const result = await api<{ sale: Sale }>("/api/pos/checkout", token, { method: "POST", body: JSON.stringify({ idempotencyKey: crypto.randomUUID(), customerId: selectedCustomerId || null, items: cartLines.map((line) => ({ productId: line.product.id, quantity: line.quantity })), payments: payments.map((payment) => ({ ...payment, amount: Number(payment.amount) })), discount: Number(discount || 0), taxPercent: Number(taxPercent || 0), notes: new FormData(event.currentTarget).get("notes") }) });
      setSelectedSale(result.sale); setCart({}); setModal("sale"); await refresh(); showToast("Penjualan berhasil disimpan");
    } catch (cause) { showToast(cause instanceof Error ? cause.message : "Checkout gagal"); } finally { setBusy(false); }
  };

  const submitSession = async (event: FormEvent<HTMLFormElement>, close: boolean) => {
    event.preventDefault(); if (!token) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await api(close ? "/api/pos/session/close" : "/api/pos/session/open", token, { method: "POST", body: JSON.stringify(close ? { closingCash: Number(form.get("cash")), notes: form.get("notes") } : { openingCash: Number(form.get("cash")), notes: form.get("notes") }) });
      setModal(null); await refresh(); showToast(close ? "Shift kasir ditutup" : "Shift kasir dibuka");
    } catch (cause) { showToast(cause instanceof Error ? cause.message : "Shift gagal diperbarui"); } finally { setBusy(false); }
  };

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!token) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await api("/api/pos/profile", token, { method: "PUT", body: JSON.stringify({ businessName: form.get("businessName"), address: form.get("address") || null, phone: form.get("phone") || null, receiptFooter: form.get("receiptFooter") || null, taxPercent: Number(form.get("taxPercent") || 0) }) });
      await refresh(); showToast("Profil usaha berhasil disimpan");
    } catch (cause) { showToast(cause instanceof Error ? cause.message : "Profil gagal disimpan"); } finally { setBusy(false); }
  };

  const submitVoid = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!token || !selectedSale) return;
    const reason = String(new FormData(event.currentTarget).get("reason") || "");
    setBusy(true);
    try { await api(`/api/pos/sales/${selectedSale.id}/void`, token, { method: "POST", body: JSON.stringify({ reason }) }); setModal(null); setSelectedSale(null); await refresh(); showToast("Penjualan dibatalkan dan stok dikembalikan"); }
    catch (cause) { showToast(cause instanceof Error ? cause.message : "Penjualan gagal dibatalkan"); } finally { setBusy(false); }
  };

  const exportSales = () => {
    if (!report) return;
    downloadCsv(
      `laporan-penjualan-${report.period}-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Invoice", "Waktu", "Pelanggan", "Produk", "Subtotal", "Diskon", "Pajak", "Total", "Tunai masuk", "Kasbon", "Status"],
      report.sales.map((sale) => [
        sale.invoiceNumber,
        dateTime(sale.createdAt),
        sale.customer?.name || "Umum",
        sale.items.map((item) => `${item.productName} x${item.quantity}`).join("; "),
        sale.subtotal,
        sale.discount,
        sale.tax,
        sale.total,
        sale.paidAmount,
        sale.creditAmount,
        sale.status,
      ]),
    );
    showToast("Laporan penjualan berhasil diekspor");
  };

  const exportInventory = () => {
    downloadCsv(
      `laporan-stok-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Produk", "SKU", "Barcode", "Kategori", "Harga jual", "HPP", "Stok", "Satuan", "Stok minimum", "Status"],
      products.map((product) => [product.name, product.sku || "", product.barcode || "", product.category || "", product.price, product.costPrice || 0, product.stock, product.unit, product.minStock, product.stock <= 0 ? "Habis" : product.stock <= product.minStock ? "Menipis" : "Aman"]),
    );
    showToast("Laporan stok berhasil diekspor");
  };

  if (authLoading || (loading && !dashboard)) return <><TopAppBar /><main className={styles.page}><div className={styles.shell}><div className={styles.metrics}>{Array.from({ length: 5 }, (_, index) => <div className={styles.skeleton} key={index} />)}</div><div className={styles.skeleton} style={{ minHeight: 420 }} /></div></main></>;

  const metrics = dashboard?.metrics;
  const maxChart = Math.max(1, ...(dashboard?.salesChart.map((item) => item.total) || [1]));

  return <div><TopAppBar /><main className={styles.page}><div className={styles.shell}>
    <header className={styles.header}><div><h1>{dashboard?.profile?.businessName || "POS Catatin"}</h1><p>Kasir, stok, kasbon, dan laporan usaha dalam satu tempat.</p></div><div className={styles.headerActions}><div className={styles.sessionBadge} data-open={Boolean(dashboard?.session)}><Icon name={dashboard?.session ? "lock_open" : "lock"} size={18} />{dashboard?.session ? `Shift dibuka ${dateTime(dashboard.session.openedAt)}` : "Shift belum dibuka"}</div><button className={styles.buttonSecondary} onClick={() => setModal(dashboard?.session ? "sessionClose" : "sessionOpen")}><Icon name={dashboard?.session ? "logout" : "login"} size={18} />{dashboard?.session ? "Tutup shift" : "Buka shift"}</button></div></header>
    <nav className={styles.tabs} aria-label="Menu POS">{tabs.map((item) => <button key={item.id} className={`${styles.tab} ${activeTab === item.id ? styles.tabActive : ""}`} onClick={() => setActiveTab(item.id)}><Icon name={item.icon} size={18} />{item.label}</button>)}</nav>
    {error ? <div className={styles.error}>{error} <button onClick={() => void refresh()}><strong>Coba lagi</strong></button></div> : null}
    {!dashboard?.session ? <div className={styles.notice}><div><strong>Shift kasir belum dibuka</strong><p>Buka shift untuk mulai menerima penjualan dan pembayaran kasbon.</p></div><button className={styles.button} onClick={() => setModal("sessionOpen")}>Buka shift</button></div> : null}

    {activeTab === "cashier" ? <>
      <form className={styles.assistant} onSubmit={submitAssistant}><input className={styles.assistantInput} value={command} onChange={(event) => setCommand(event.target.value)} placeholder="Contoh: Indomie 2 Akbar kasbon" aria-label="Perintah cepat POS" /><button className={styles.button} disabled={busy}><Icon name="auto_awesome" />Proses</button></form>
      {assistantReply ? <div className={styles.assistantReply}>{assistantReply}</div> : null}
      <div className={styles.checkoutLayout}><section className={styles.panel}><div className={styles.productToolbar}><input className={styles.input} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, SKU, atau barcode" aria-label="Cari produk" /><button className={styles.buttonSecondary} onClick={() => { setEditingProduct(null); setModal("product"); }}><Icon name="add" />Produk</button></div>{filteredProducts.length ? <div className={styles.productGrid}>{filteredProducts.map((product) => <button className={styles.productCard} key={product.id} onClick={() => addToCart(product)} disabled={product.stock <= 0}><div><div className={styles.productName}>{product.name}</div><div className={`${styles.stock} ${product.stock <= product.minStock ? styles.stockLow : ""}`}>{product.stock <= 0 ? "Stok habis" : `${product.stock} ${product.unit}`}</div></div><div className={styles.price}>{money(product.price)}</div></button>)}</div> : <EmptyState icon="inventory_2" text="Belum ada produk. Tambahkan produk pertama untuk mulai berjualan." />}</section>
      <aside className={`${styles.panel} ${styles.cart}`}><div className={styles.panelHeader}><div><h2>Keranjang</h2><span className={styles.muted}>{cartLines.length} produk</span></div>{cartLines.length ? <button className={styles.iconButton} onClick={() => setCart({})} aria-label="Kosongkan keranjang"><Icon name="delete_sweep" /></button> : null}</div>{cartLines.length ? <div className={styles.cartItems}>{cartLines.map((line) => <div className={styles.cartItem} key={line.product.id}><div><strong>{line.product.name}</strong><div className={styles.muted}>{money(line.subtotal)}</div></div><div className={styles.qty}><button onClick={() => changeQuantity(line.product, -1)} aria-label="Kurangi">-</button><strong>{line.quantity}</strong><button onClick={() => changeQuantity(line.product, 1)} aria-label="Tambah">+</button></div></div>)}</div> : <EmptyState icon="shopping_cart" text="Pilih produk untuk menambahkannya ke keranjang." />}<div className={styles.cartTotal}><span>Total</span><span>{money(subtotal)}</span></div><button className={styles.button} style={{ width: "100%", marginTop: 14 }} disabled={!cartLines.length || !dashboard?.session} onClick={() => openCheckout()}><Icon name="payments" />Bayar</button></aside></div>
    </> : null}

    {activeTab === "overview" ? <><section className={styles.metrics}><Metric label="Penjualan hari ini" value={money(metrics?.salesTotal || 0)} icon="point_of_sale" /><Metric label="Uang masuk" value={money(metrics?.cashIn || 0)} icon="payments" /><Metric label="Transaksi" value={String(metrics?.transactionCount || 0)} icon="receipt" /><Metric label="Kasbon aktif" value={money(metrics?.totalDebt || 0)} icon="pending_actions" /><Metric label="Laba kotor" value={money(metrics?.grossProfit || 0)} icon="trending_up" /></section><div className={styles.overviewGrid}><section className={styles.panel}><div className={styles.panelHeader}><h2>Penjualan 7 hari</h2><span className={styles.muted}>Berdasarkan transaksi selesai</span></div><div className={styles.bars}>{dashboard?.salesChart.map((item) => <div className={styles.barColumn} key={item.date} title={`${item.date}: ${money(item.total)}`}><div className={styles.bar} style={{ height: `${Math.max(3, item.total / maxChart * 100)}%` }} /><span className={styles.barLabel}>{item.date.split("-").slice(1).reverse().join("/")}</span></div>)}</div></section><div className={styles.stack}><section className={styles.panel}><div className={styles.panelHeader}><h2>Produk terlaris</h2></div>{dashboard?.topItems.length ? dashboard.topItems.map((item, index) => <div className={styles.receiptLine} key={`${item.productId}-${item.name}`}><span>{index + 1}. {item.name}</span><strong>{item.quantity}</strong></div>) : <EmptyState icon="leaderboard" text="Belum ada data penjualan minggu ini." />}</section><section className={styles.panel}><div className={styles.panelHeader}><h2>Stok perlu perhatian</h2><button className={styles.iconButton} onClick={() => setActiveTab("products")} aria-label="Buka produk"><Icon name="arrow_forward" /></button></div>{dashboard?.lowStock.length ? dashboard.lowStock.map((item) => <div className={styles.receiptLine} key={item.id}><span>{item.name}</span><strong className={styles.stockLow}>{item.stock} {item.unit}</strong></div>) : <p className={styles.muted}>Semua stok dalam kondisi aman.</p>}</section></div></div></> : null}

    {activeTab === "reports" ? <div className={styles.reportPrint}><section className={`${styles.panel} ${styles.noPrint}`} style={{ marginBottom: 18 }}><div className={styles.toolbar} style={{ marginBottom: 0 }}><div><h2>Laporan usaha</h2><span className={styles.muted}>Pilih periode, cetak PDF, atau buka CSV di Excel.</span></div><div className={styles.tableActions}><select className={styles.select} value={reportPeriod} onChange={(event) => setReportPeriod(event.target.value as "day" | "week" | "month")} aria-label="Periode laporan"><option value="day">Hari ini</option><option value="week">7 hari</option><option value="month">Bulan ini</option></select><button className={styles.buttonSecondary} onClick={exportInventory}><Icon name="inventory_2" size={17} />CSV stok</button><button className={styles.buttonSecondary} onClick={exportSales} disabled={!report}><Icon name="table_view" size={17} />CSV penjualan</button><button className={styles.button} onClick={() => window.print()} disabled={!report}><Icon name="picture_as_pdf" size={17} />Cetak / PDF</button></div></div></section>{report ? <><header className={styles.printHeader}><h2>{dashboard?.profile?.businessName || "Usaha Saya"}</h2><p>Laporan {reportPeriod === "day" ? "harian" : reportPeriod === "week" ? "7 hari" : "bulanan"} • {dateTime(report.range.start)}–{dateTime(report.range.end)}</p></header><section className={styles.metrics}><Metric label="Omzet" value={money(report.metrics.revenue)} icon="point_of_sale" /><Metric label="Uang masuk" value={money(report.metrics.cashIn)} icon="payments" /><Metric label="Transaksi" value={String(report.metrics.transactionCount)} icon="receipt" /><Metric label="HPP" value={money(report.metrics.cost)} icon="shopping_cart" /><Metric label="Laba kotor" value={money(report.metrics.grossProfit)} icon="trending_up" /></section><div className={styles.overviewGrid}><section className={styles.panel}><div className={styles.panelHeader}><div><h2>Rincian penjualan</h2><span className={styles.muted}>{report.sales.length} transaksi selesai</span></div></div>{report.sales.length ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Invoice</th><th>Waktu</th><th>Pelanggan</th><th>Total</th><th>Kasbon</th></tr></thead><tbody>{report.sales.map((sale) => <tr key={sale.id}><td>{sale.invoiceNumber}</td><td>{dateTime(sale.createdAt)}</td><td>{sale.customer?.name || "Umum"}</td><td>{money(sale.total)}</td><td>{money(sale.creditAmount)}</td></tr>)}</tbody></table></div> : <EmptyState icon="receipt_long" text="Tidak ada transaksi pada periode ini." />}</section><div className={styles.stack}><section className={styles.panel}><div className={styles.panelHeader}><h2>Produk terlaris</h2></div>{report.topItems.length ? report.topItems.map((item, index) => <div className={styles.receiptLine} key={`${item.productId}-${item.name}`}><span>{index + 1}. {item.name}</span><strong>{item.quantity}</strong></div>) : <p className={styles.muted}>Belum ada data.</p>}</section><section className={styles.panel}><div className={styles.receiptLine}><span>Diskon</span><strong>{money(report.metrics.discount)}</strong></div><div className={styles.receiptLine}><span>Pajak</span><strong>{money(report.metrics.tax)}</strong></div><div className={styles.receiptLine}><span>Penjualan kasbon</span><strong>{money(report.metrics.credit)}</strong></div><div className={styles.receiptLine}><span>Total kasbon aktif</span><strong>{money(report.metrics.totalDebt)}</strong></div></section></div></div></> : <div className={styles.skeleton} style={{ minHeight: 360 }} />}</div> : null}

    {activeTab === "products" ? <section className={styles.panel}><div className={styles.toolbar}><input className={`${styles.input} ${styles.toolbarSearch}`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari produk" /><button className={styles.button} onClick={() => { setEditingProduct(null); setModal("product"); }}><Icon name="add" />Tambah produk</button></div>{filteredProducts.length ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Produk</th><th>SKU</th><th>Harga</th><th>HPP</th><th>Stok</th><th>Status</th><th /></tr></thead><tbody>{filteredProducts.map((product) => <tr key={product.id}><td><strong>{product.name}</strong><div className={styles.muted}>{product.category || "Tanpa kategori"}</div></td><td>{product.sku || "-"}</td><td>{money(product.price)}</td><td>{money(product.costPrice || 0)}</td><td>{product.stock} {product.unit}</td><td><span className={`${styles.status} ${product.stock <= 0 ? styles.statusBad : product.stock <= product.minStock ? styles.statusWarn : styles.statusGood}`}>{product.stock <= 0 ? "Habis" : product.stock <= product.minStock ? "Menipis" : "Aman"}</span></td><td><div className={styles.tableActions}><button className={styles.iconButton} onClick={() => void openProductDetail(product)} aria-label="Lihat riwayat stok"><Icon name="history" /></button><button className={styles.iconButton} onClick={() => { setTargetProduct(product); setModal("stock"); }} aria-label="Ubah stok"><Icon name="inventory" /></button><button className={styles.iconButton} onClick={() => { setEditingProduct(product); setModal("product"); }} aria-label="Edit produk"><Icon name="edit" /></button></div></td></tr>)}</tbody></table></div> : <EmptyState icon="inventory_2" text="Belum ada produk yang cocok." />}</section> : null}

    {activeTab === "customers" ? <section className={styles.panel}><div className={styles.toolbar}><div><h2>Kasbon pelanggan</h2><span className={styles.muted}>{customers.filter((item) => item.debt > 0).length} pelanggan memiliki kasbon aktif</span></div><button className={styles.button} onClick={() => { setEditingCustomer(null); setModal("customer"); }}><Icon name="person_add" />Tambah pelanggan</button></div>{customers.length ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Pelanggan</th><th>Telepon</th><th>Kasbon</th><th>Batas</th><th /></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id}><td><strong>{customer.name}</strong></td><td>{customer.phone || "-"}</td><td><strong className={customer.debt > 0 ? styles.stockLow : ""}>{money(customer.debt)}</strong></td><td>{customer.maxDebt ? money(customer.maxDebt) : "Tanpa batas"}</td><td><div className={styles.tableActions}>{customer.debt > 0 ? <button className={styles.buttonSecondary} onClick={() => { setTargetCustomer(customer); setModal("debt"); }}><Icon name="payments" size={17} />Bayar</button> : null}<button className={styles.iconButton} onClick={() => void openCustomerDetail(customer)} aria-label="Lihat riwayat pelanggan"><Icon name="history" /></button><button className={styles.iconButton} onClick={() => { setEditingCustomer(customer); setModal("customer"); }} aria-label="Edit pelanggan"><Icon name="edit" /></button></div></td></tr>)}</tbody></table></div> : <EmptyState icon="group" text="Belum ada pelanggan. Tambahkan pelanggan untuk transaksi kasbon." />}</section> : null}

    {activeTab === "sales" ? <section className={styles.panel}><div className={styles.panelHeader}><div><h2>Riwayat penjualan</h2><span className={styles.muted}>Transaksi terbaru beserta pembayaran dan item</span></div></div>{sales.length ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Invoice</th><th>Waktu</th><th>Pelanggan</th><th>Total</th><th>Status</th><th /></tr></thead><tbody>{sales.map((sale) => <tr key={sale.id}><td><strong>{sale.invoiceNumber}</strong></td><td>{dateTime(sale.createdAt)}</td><td>{sale.customer?.name || "Umum"}</td><td>{money(sale.total)}</td><td><span className={`${styles.status} ${sale.status === "COMPLETED" ? styles.statusGood : styles.statusBad}`}>{sale.status === "COMPLETED" ? "Selesai" : "Dibatalkan"}</span></td><td><div className={styles.tableActions}><button className={styles.iconButton} onClick={() => { setSelectedSale(sale); setModal("sale"); }} aria-label="Lihat struk"><Icon name="visibility" /></button>{sale.status === "COMPLETED" ? <button className={styles.iconButton} onClick={() => { setSelectedSale(sale); setModal("void"); }} aria-label="Batalkan transaksi"><Icon name="cancel" /></button> : null}</div></td></tr>)}</tbody></table></div> : <EmptyState icon="receipt_long" text="Belum ada penjualan." />}</section> : null}

    {activeTab === "settings" ? <section className={styles.panel}><div className={styles.panelHeader}><div><h2>Profil usaha dan struk</h2><span className={styles.muted}>Informasi ini tampil pada struk penjualan.</span></div></div><form onSubmit={submitProfile}><div className={styles.formGrid}><div className={`${styles.field} ${styles.fieldFull}`}><label htmlFor="businessName">Nama usaha</label><input id="businessName" name="businessName" className={styles.input} required defaultValue={dashboard?.profile?.businessName || "Usaha Saya"} /></div><div className={styles.field}><label htmlFor="businessPhone">Telepon</label><input id="businessPhone" name="phone" className={styles.input} defaultValue={dashboard?.profile?.phone || ""} /></div><div className={styles.field}><label htmlFor="taxPercent">Pajak default (%)</label><input id="taxPercent" name="taxPercent" className={styles.input} type="number" min="0" max="100" step="0.01" defaultValue={dashboard?.profile?.taxPercent || 0} /></div><div className={`${styles.field} ${styles.fieldFull}`}><label htmlFor="address">Alamat</label><textarea id="address" name="address" className={styles.textarea} defaultValue={dashboard?.profile?.address || ""} /></div><div className={`${styles.field} ${styles.fieldFull}`}><label htmlFor="receiptFooter">Pesan penutup struk</label><input id="receiptFooter" name="receiptFooter" className={styles.input} defaultValue={dashboard?.profile?.receiptFooter || ""} /></div></div><div className={styles.formActions}><button className={styles.button} disabled={busy}>Simpan profil</button></div></form></section> : null}
  </div></main>

  {modal === "product" ? <Modal title={editingProduct ? "Edit produk" : "Tambah produk"} onClose={() => { setModal(null); setEditingProduct(null); }}><form onSubmit={submitProduct}><div className={styles.formGrid}><div className={`${styles.field} ${styles.fieldFull}`}><label>Nama produk</label><input name="name" className={styles.input} required defaultValue={editingProduct?.name} /></div><div className={styles.field}><label>SKU</label><input name="sku" className={styles.input} defaultValue={editingProduct?.sku || ""} /></div><div className={styles.field}><label>Barcode</label><input name="barcode" className={styles.input} defaultValue={editingProduct?.barcode || ""} /></div><div className={styles.field}><label>Harga jual</label><input name="price" className={styles.input} type="number" min="1" required defaultValue={editingProduct?.price} /></div><div className={styles.field}><label>HPP</label><input name="costPrice" className={styles.input} type="number" min="0" defaultValue={editingProduct?.costPrice || 0} /></div><div className={styles.field}><label>Kategori</label><input name="category" className={styles.input} defaultValue={editingProduct?.category || ""} /></div><div className={styles.field}><label>Satuan</label><input name="unit" className={styles.input} required defaultValue={editingProduct?.unit || "pcs"} /></div><div className={styles.field}><label>Stok</label><input name="stock" className={styles.input} type="number" min="0" step="0.001" required defaultValue={editingProduct?.stock || 0} /></div><div className={styles.field}><label>Batas stok minimum</label><input name="minStock" className={styles.input} type="number" min="0" step="0.001" required defaultValue={editingProduct?.minStock ?? 5} /></div><div className={`${styles.field} ${styles.fieldFull}`}><label>URL foto produk</label><input name="image" className={styles.input} type="url" defaultValue={editingProduct?.image || ""} /></div></div><div className={styles.formActions}><button type="button" className={styles.buttonSecondary} onClick={() => setModal(null)}>Batal</button><button className={styles.button} disabled={busy}>Simpan</button></div></form></Modal> : null}

  {modal === "productDetail" && targetProduct ? <Modal title={`Riwayat stok ${targetProduct.name}`} onClose={() => { setModal(null); setProductDetail(null); }} wide>{productDetail ? <><section className={styles.metrics} style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}><Metric label="Stok saat ini" value={`${productDetail.stock} ${productDetail.unit}`} icon="inventory_2" /><Metric label="Batas minimum" value={`${productDetail.minStock} ${productDetail.unit}`} icon="warning" /></section><div className={styles.panelHeader}><div><h2>Pergerakan stok</h2><span className={styles.muted}>50 mutasi terbaru, termasuk penjualan dan pembatalan</span></div><button className={styles.button} onClick={() => setModal("stock")}><Icon name="inventory" size={17} />Ubah stok</button></div>{productDetail.stockMovements.length ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Waktu</th><th>Jenis</th><th>Catatan</th><th>Perubahan</th><th>Stok akhir</th></tr></thead><tbody>{productDetail.stockMovements.map((movement) => <tr key={movement.id}><td>{dateTime(movement.createdAt)}</td><td>{movement.type}</td><td>{movement.note || "-"}</td><td><strong>{movement.quantity > 0 ? "+" : ""}{movement.quantity}</strong></td><td>{movement.stockAfter} {productDetail.unit}</td></tr>)}</tbody></table></div> : <EmptyState icon="history" text="Belum ada pergerakan stok untuk produk ini." />}</> : <div className={styles.skeleton} style={{ minHeight: 280 }} />}</Modal> : null}

  {modal === "customer" ? <Modal title={editingCustomer ? "Edit pelanggan" : "Tambah pelanggan"} onClose={() => { setModal(null); setEditingCustomer(null); }}><form onSubmit={submitCustomer}><div className={styles.formGrid}><div className={`${styles.field} ${styles.fieldFull}`}><label>Nama pelanggan</label><input name="name" className={styles.input} required defaultValue={editingCustomer?.name} /></div><div className={styles.field}><label>Telepon</label><input name="phone" className={styles.input} defaultValue={editingCustomer?.phone || ""} /></div><div className={styles.field}><label>Batas kasbon</label><input name="maxDebt" className={styles.input} type="number" min="1" defaultValue={editingCustomer?.maxDebt || ""} /></div><div className={`${styles.field} ${styles.fieldFull}`}><label>Catatan</label><textarea name="notes" className={styles.textarea} defaultValue={editingCustomer?.notes || ""} /></div></div><div className={styles.formActions}><button type="button" className={styles.buttonSecondary} onClick={() => setModal(null)}>Batal</button><button className={styles.button} disabled={busy}>Simpan</button></div></form></Modal> : null}

  {modal === "customerDetail" && targetCustomer ? <Modal title={`Riwayat ${targetCustomer.name}`} onClose={() => { setModal(null); setCustomerDetail(null); }} wide>{customerDetail ? <><section className={styles.metrics} style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}><Metric label="Kasbon aktif" value={money(customerDetail.debt)} icon="pending_actions" /><Metric label="Total transaksi" value={String(customerDetail.sales.length)} icon="receipt_long" /></section><div className={styles.panelHeader}><div><h2>Mutasi kasbon</h2><span className={styles.muted}>Tagihan, pembayaran, dan penyesuaian terbaru</span></div>{customerDetail.debt > 0 ? <button className={styles.button} onClick={() => setModal("debt")}><Icon name="payments" size={17} />Bayar kasbon</button> : null}</div>{customerDetail.receivables.length ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Waktu</th><th>Jenis</th><th>Catatan</th><th>Nominal</th></tr></thead><tbody>{customerDetail.receivables.map((entry) => <tr key={entry.id}><td>{dateTime(entry.createdAt)}</td><td>{entry.type === "CHARGE" ? "Kasbon" : entry.type === "PAYMENT" ? "Pembayaran" : "Penyesuaian"}</td><td>{entry.note || "-"}</td><td><strong className={entry.amount > 0 ? styles.stockLow : ""}>{entry.amount > 0 ? "+" : "-"}{money(Math.abs(entry.amount))}</strong></td></tr>)}</tbody></table></div> : <EmptyState icon="history" text="Belum ada mutasi kasbon untuk pelanggan ini." />}</> : <div className={styles.skeleton} style={{ minHeight: 280 }} />}</Modal> : null}

  {modal === "stock" && targetProduct ? <Modal title={`Ubah stok ${targetProduct.name}`} onClose={() => setModal(null)}><form onSubmit={submitStock}><p className={styles.muted} style={{ marginBottom: 15 }}>Stok saat ini {targetProduct.stock} {targetProduct.unit}. Gunakan angka negatif untuk mengurangi stok.</p><div className={styles.formGrid}><div className={styles.field}><label>Perubahan stok</label><input name="quantity" className={styles.input} type="number" step="0.001" required /></div><div className={styles.field}><label>Jenis</label><select name="type" className={styles.select}><option value="PURCHASE">Stok masuk</option><option value="ADJUSTMENT">Koreksi</option><option value="RETURN">Retur pelanggan</option></select></div><div className={`${styles.field} ${styles.fieldFull}`}><label>Catatan</label><input name="note" className={styles.input} required placeholder="Contoh: Belanja dari pemasok" /></div></div><div className={styles.formActions}><button type="button" className={styles.buttonSecondary} onClick={() => setModal(null)}>Batal</button><button className={styles.button} disabled={busy}>Simpan stok</button></div></form></Modal> : null}

  {modal === "debt" && targetCustomer ? <Modal title={`Bayar kasbon ${targetCustomer.name}`} onClose={() => setModal(null)}><form onSubmit={submitDebtPayment}><div className={styles.notice}><div><strong>Sisa kasbon</strong><p>{money(targetCustomer.debt)}</p></div></div><div className={styles.formGrid}><div className={styles.field}><label>Nominal pembayaran</label><input name="amount" className={styles.input} type="number" min="1" max={targetCustomer.debt} required /></div><div className={styles.field}><label>Metode</label><select name="method" className={styles.select}><option value="CASH">Tunai</option><option value="BANK_TRANSFER">Transfer bank</option><option value="E_WALLET">E-wallet</option><option value="CARD">Kartu</option></select></div><div className={`${styles.field} ${styles.fieldFull}`}><label>Catatan</label><input name="note" className={styles.input} /></div></div><div className={styles.formActions}><button type="button" className={styles.buttonSecondary} onClick={() => setModal(null)}>Batal</button><button className={styles.button} disabled={busy}>Catat pembayaran</button></div></form></Modal> : null}

  {modal === "checkout" ? <Modal title="Pembayaran" onClose={() => setModal(null)} wide><form onSubmit={submitCheckout}><div className={styles.formGrid}><div className={styles.field}><label>Pelanggan</label><select className={styles.select} value={selectedCustomerId} onChange={(event) => setSelectedCustomerId(event.target.value)}><option value="">Pelanggan umum</option>{customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.name}{customer.debt ? ` (kasbon ${money(customer.debt)})` : ""}</option>)}</select></div><div className={styles.field}><label>Diskon</label><input className={styles.input} type="number" min="0" max={subtotal} value={discount} onChange={(event) => setDiscount(event.target.value)} /></div><div className={styles.field}><label>Pajak (%)</label><input className={styles.input} type="number" min="0" max="100" step="0.01" value={taxPercent} onChange={(event) => setTaxPercent(event.target.value)} /></div><div className={styles.field}><label>Total tagihan</label><div className={styles.input}><strong>{money(total)}</strong></div></div><div className={`${styles.field} ${styles.fieldFull}`}><label>Pembayaran</label><div className={styles.stack}>{payments.map((payment, index) => <div className={styles.paymentRow} key={index}><select className={styles.select} value={payment.method} onChange={(event) => setPayments((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, method: event.target.value as PaymentMethod } : item))}>{Object.entries(paymentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><input className={styles.input} type="number" min="1" required value={payment.amount} onChange={(event) => setPayments((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, amount: event.target.value } : item))} /><button type="button" className={styles.buttonSecondary} onClick={() => setPayments((current) => current.filter((_, itemIndex) => itemIndex !== index))} disabled={payments.length === 1}>Hapus</button></div>)}</div><button type="button" className={styles.buttonSecondary} style={{ marginTop: 9 }} onClick={() => setPayments((current) => [...current, { method: "CASH", amount: "" }])}><Icon name="add" size={17} />Tambah metode</button></div><div className={`${styles.field} ${styles.fieldFull}`}><label>Catatan</label><input name="notes" className={styles.input} /></div></div><div className={styles.formActions}><button type="button" className={styles.buttonSecondary} onClick={() => setModal(null)}>Batal</button><button className={styles.button} disabled={busy}>Selesaikan penjualan</button></div></form></Modal> : null}

  {modal === "sessionOpen" ? <Modal title="Buka shift kasir" onClose={() => setModal(null)}><form onSubmit={(event) => void submitSession(event, false)}><div className={styles.field}><label>Modal kas awal</label><input name="cash" className={styles.input} type="number" min="0" required defaultValue="0" /></div><div className={styles.field} style={{ marginTop: 12 }}><label>Catatan</label><input name="notes" className={styles.input} /></div><div className={styles.formActions}><button type="button" className={styles.buttonSecondary} onClick={() => setModal(null)}>Batal</button><button className={styles.button} disabled={busy}>Buka shift</button></div></form></Modal> : null}
  {modal === "sessionClose" ? <Modal title="Tutup shift kasir" onClose={() => setModal(null)}><form onSubmit={(event) => void submitSession(event, true)}><div className={styles.field}><label>Kas fisik saat ini</label><input name="cash" className={styles.input} type="number" min="0" required /></div><div className={styles.field} style={{ marginTop: 12 }}><label>Catatan penutupan</label><input name="notes" className={styles.input} /></div><div className={styles.formActions}><button type="button" className={styles.buttonSecondary} onClick={() => setModal(null)}>Batal</button><button className={styles.button} disabled={busy}>Tutup shift</button></div></form></Modal> : null}
  {modal === "sale" && selectedSale ? <Modal title="Struk penjualan" onClose={() => setModal(null)}><Receipt sale={selectedSale} profile={dashboard?.profile || null} /><div className={`${styles.formActions} ${styles.noPrint}`}><button className={styles.buttonSecondary} onClick={() => setModal(null)}>Tutup</button><button className={styles.button} onClick={() => window.print()}><Icon name="print" />Cetak</button></div></Modal> : null}
  {modal === "void" && selectedSale ? <Modal title="Batalkan penjualan" onClose={() => setModal(null)}><form onSubmit={submitVoid}><div className={styles.error}>Stok akan dikembalikan. Tindakan ini tetap tercatat dalam riwayat.</div><div className={styles.field}><label>Alasan pembatalan</label><textarea name="reason" className={styles.textarea} required minLength={3} /></div><div className={styles.formActions}><button type="button" className={styles.buttonSecondary} onClick={() => setModal(null)}>Kembali</button><button className={styles.buttonDanger} disabled={busy}>Batalkan penjualan</button></div></form></Modal> : null}
  {toast ? <div className={styles.toast} role="status">{toast}</div> : null}
  </div>;
}
