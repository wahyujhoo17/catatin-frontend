"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import TopAppBar from "@/components/layout/TopAppBar";
import BottomNav from "@/components/layout/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import Toast from "@/components/ui/Toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  remainingAmount: number;
  targetDate: string | null;
  icon: string;
  color: string;
  isCompleted: boolean;
  createdAt: string;
}

const PRESET_ICONS = [
  { name: "savings", label: "Tabungan" },
  { name: "laptop_mac", label: "Gadget" },
  { name: "directions_car", label: "Kendaraan" },
  { name: "home", label: "Rumah" },
  { name: "flight_takeoff", label: "Liburan" },
  { name: "school", label: "Pendidikan" },
  { name: "card_giftcard", label: "Keinginan" },
  { name: "shield", label: "Dana Darurat" },
];

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function SavingGoalsPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "all">("active");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("savings");
  const [depositAmount, setDepositAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchGoals = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setGoals([]);
        return;
      }
      const data = await res.json();
      if (data && data.data) {
        setGoals(data.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data target tabungan:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    fetchGoals();
  }, [authLoading, isLoggedIn, router, fetchGoals]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const token = getToken();
    if (!token) return;

    const numTarget = parseFloat(targetAmount.replace(/\D/g, ""));
    const numInitial = initialAmount ? parseFloat(initialAmount.replace(/\D/g, "")) : 0;

    if (!name.trim()) {
      setErrorMsg("Nama target impian wajib diisi");
      return;
    }
    if (isNaN(numTarget) || numTarget <= 0) {
      setErrorMsg("Nominal target harus lebih besar dari 0");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE}/api/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          targetAmount: numTarget,
          currentAmount: numInitial,
          targetDate: targetDate || null,
          icon: selectedIcon,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat target");

      setIsAddOpen(false);
      setName("");
      setTargetAmount("");
      setInitialAmount("");
      setTargetDate("");
      setSelectedIcon("savings");
      fetchGoals();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal membuat target tabungan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    setErrorMsg("");
    const token = getToken();
    if (!token) return;

    const numDeposit = parseFloat(depositAmount.replace(/\D/g, ""));
    if (isNaN(numDeposit) || numDeposit <= 0) {
      setErrorMsg("Nominal setoran harus lebih dari 0");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE}/api/goals/${selectedGoal.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amountToAdd: numDeposit,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyetor tabungan");

      setIsDepositOpen(false);
      setSelectedGoal(null);
      setDepositAmount("");
      fetchGoals();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyetor tabungan");
    } finally {
      setIsSubmitting(false);
    }
  };

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
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  const [isDeletingGoalLoading, setIsDeletingGoalLoading] = useState(false);

  const handleDeleteGoal = (id: string) => {
    setDeleteGoalId(id);
  };

  const handleConfirmDeleteGoal = async () => {
    if (!deleteGoalId) return;
    const token = getToken();
    if (!token) return;
    setIsDeletingGoalLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/goals/${deleteGoalId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchGoals();
        showToast("Target tabungan berhasil dihapus", "success");
      } else {
        throw new Error("Gagal menghapus target tabungan");
      }
      setDeleteGoalId(null);
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus target tabungan", "error");
    } finally {
      setIsDeletingGoalLoading(false);
    }
  };

  const filteredGoals = goals.filter((g) => {
    if (activeTab === "active") return !g.isCompleted;
    if (activeTab === "completed") return g.isCompleted;
    return true;
  });

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalProgress = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100).toFixed(1) : "0";

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", paddingBottom: 100 }}>
      <TopAppBar />

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "calc(96px + env(safe-area-inset-top, 0px)) 16px 120px 16px" }}>
        {/* Title Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "var(--on-surface)", letterSpacing: "-0.5px" }}>
              Target Tabungan & Wishlist
            </h1>
            <p style={{ fontSize: 13, color: "var(--on-surface-variant)", margin: "2px 0 0 0" }}>
              Wujudkan impian finansial Anda secara terencana
            </p>
          </div>

          <button
            onClick={() => {
              setErrorMsg("");
              setIsAddOpen(true);
            }}
            style={{
              padding: "10px 18px",
              borderRadius: 9999,
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(79, 55, 138, 0.3)",
              transition: "transform 0.15s ease",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Buat Impian
          </button>
        </div>

        {/* Hero Card Summary */}
        <div
          style={{
            background: "linear-gradient(135deg, #381e72 0%, #4f378a 50%, #6750a4 100%)",
            color: "#fff",
            borderRadius: 24,
            padding: "24px",
            marginBottom: 24,
            boxShadow: "0 8px 24px rgba(79, 55, 138, 0.25)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle background glow circle */}
          <div
            style={{
              position: "absolute",
              top: "-20%",
              right: "-10%",
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              filter: "blur(20px)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 12, opacity: 0.85, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
                Total Tabungan Impian
              </span>
              <span
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(4px)",
                  padding: "3px 10px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {totalProgress}% Terkumpul
              </span>
            </div>

            <h2 style={{ fontSize: 30, fontWeight: 800, margin: "4px 0 16px 0", letterSpacing: "-0.5px" }}>
              {formatRupiah(totalSaved)}
            </h2>

            {/* Overall Progress Bar */}
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background: "rgba(255, 255, 255, 0.25)",
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${totalProgress}%`,
                  background: "#fff",
                  borderRadius: 4,
                  transition: "width 0.5s ease",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, opacity: 0.9 }}>
              <span>Target Total: <strong>{formatRupiah(totalTarget)}</strong></span>
              <span>{goals.filter((g) => g.isCompleted).length} / {goals.length} Impian Tercapai</span>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["active", "completed", "all"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: activeTab === tab ? "var(--primary)" : "var(--surface-container-high)",
                color: activeTab === tab ? "#fff" : "var(--on-surface-variant)",
                transition: "all 0.2s ease",
              }}
            >
              {tab === "active" ? "Sedang Berjalan" : tab === "completed" ? "Tercapai 🎉" : "Semua Target"}
            </button>
          ))}
        </div>

        {/* Goals List */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--on-surface-variant)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, animation: "spin 1s linear infinite" }}>
              progress_activity
            </span>
            <p style={{ marginTop: 8, fontSize: 14 }}>Memuat target tabungan...</p>
          </div>
        ) : filteredGoals.length === 0 ? (
          <div
            style={{
              background: "var(--surface-container-low)",
              borderRadius: 20,
              padding: "48px 24px",
              textAlign: "center",
              border: "1px dashed var(--outline-variant)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--secondary-container)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                savings
              </span>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px 0", color: "var(--on-surface)" }}>
              {activeTab === "completed" ? "Belum Ada Target Tercapai" : "Belum Ada Target Impian"}
            </h3>
            <p style={{ fontSize: 13, color: "var(--on-surface-variant)", margin: 0, maxWidth: 360, marginInline: "auto" }}>
              {activeTab === "completed"
                ? "Terus konsisten menabung untuk menyelesaikan impian Anda!"
                : "Mulai buat impian pertama Anda atau minta Catatin AI untuk mencatatkannya!"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredGoals.map((goal) => {
              const isDone = goal.isCompleted || goal.progressPercentage >= 100;
              return (
                <div
                  key={goal.id}
                  style={{
                    background: "var(--surface-container)",
                    borderRadius: 20,
                    padding: 20,
                    border: isDone ? "2px solid #2e7d32" : "1px solid var(--outline-variant)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* Top Bar item */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 16,
                          background: isDone ? "rgba(46, 125, 50, 0.12)" : "rgba(79, 55, 138, 0.1)",
                          color: isDone ? "#2e7d32" : "var(--primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                          {isDone ? "verified" : goal.icon || "savings"}
                        </span>
                      </div>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--on-surface)" }}>
                          {goal.name}
                        </h4>
                        {goal.targetDate ? (
                          <span style={{ fontSize: 12, color: "var(--on-surface-variant)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>event</span>
                            Target: {new Date(goal.targetDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--on-surface-variant)", marginTop: 2, display: "block" }}>
                            Target Fleksibel
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--outline)",
                        cursor: "pointer",
                        padding: 6,
                        borderRadius: 8,
                      }}
                      title="Hapus Target"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
                    </button>
                  </div>

                  {/* Numbers Info */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 12, color: "var(--on-surface-variant)", display: "block" }}>Terkumpul</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: isDone ? "#2e7d32" : "var(--primary)" }}>
                        {formatRupiah(goal.currentAmount)}
                      </span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 12, color: "var(--on-surface-variant)", display: "block" }}>Target: {formatRupiah(goal.targetAmount)}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--on-surface)" }}>
                        {goal.progressPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      height: 10,
                      borderRadius: 5,
                      background: "var(--surface-container-highest)",
                      overflow: "hidden",
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${goal.progressPercentage}%`,
                        background: isDone
                          ? "#2e7d32"
                          : "linear-gradient(90deg, var(--primary) 0%, #7d5260 100%)",
                        borderRadius: 5,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>

                  {/* Footer Actions */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: isDone ? "#2e7d32" : "var(--on-surface-variant)", fontWeight: 600 }}>
                      {isDone ? "🎉 Selamat! Impian Anda sudah tercapai." : `Kurang: ${formatRupiah(goal.remainingAmount)}`}
                    </span>

                    {!isDone && (
                      <button
                        onClick={() => {
                          setSelectedGoal(goal);
                          setDepositAmount("");
                          setErrorMsg("");
                          setIsDepositOpen(true);
                        }}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 20,
                          background: "var(--primary)",
                          color: "#fff",
                          border: "none",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          boxShadow: "0 2px 8px rgba(79, 55, 138, 0.2)",
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add_circle</span>
                        Setor Tabungan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Buat Impian */}
      {isAddOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: 28,
              padding: 24,
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
              border: "1px solid var(--outline-variant)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--on-surface)" }}>
                Buat Target Impian Baru
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                style={{ background: "none", border: "none", color: "var(--outline)", cursor: "pointer" }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {errorMsg && (
              <div style={{ background: "rgba(211, 47, 47, 0.1)", color: "#d32f2f", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 14 }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateGoal} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Icon Picker */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--on-surface-variant)", display: "block", marginBottom: 6 }}>
                  Pilih Ikon Impian
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {PRESET_ICONS.map((ic) => (
                    <button
                      key={ic.name}
                      type="button"
                      onClick={() => setSelectedIcon(ic.name)}
                      style={{
                        padding: "8px 4px",
                        borderRadius: 12,
                        border: selectedIcon === ic.name ? "2px solid var(--primary)" : "1px solid var(--outline-variant)",
                        background: selectedIcon === ic.name ? "rgba(79, 55, 138, 0.1)" : "var(--surface-container-low)",
                        color: selectedIcon === ic.name ? "var(--primary)" : "var(--on-surface)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                        cursor: "pointer",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{ic.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 600 }}>{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--on-surface-variant)" }}>Nama Impian / Target</label>
                <input
                  type="text"
                  placeholder="Misal: Beli Laptop Baru, DP Rumah, Liburan Bali"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--outline)",
                    background: "var(--surface-container-low)",
                    color: "var(--on-surface)",
                    fontSize: 14,
                    marginTop: 4,
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--on-surface-variant)" }}>Nominal Target (Rp)</label>
                <input
                  type="text"
                  placeholder="Misal: 15.000.000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--outline)",
                    background: "var(--surface-container-low)",
                    color: "var(--on-surface)",
                    fontSize: 14,
                    marginTop: 4,
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--on-surface-variant)" }}>Tabungan Awal (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: 1.000.000 (jika sudah ada dana awal)"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--outline)",
                    background: "var(--surface-container-low)",
                    color: "var(--on-surface)",
                    fontSize: 14,
                    marginTop: 4,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--on-surface-variant)" }}>Target Tanggal (Opsional)</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--outline)",
                    background: "var(--surface-container-low)",
                    color: "var(--on-surface)",
                    fontSize: 14,
                    marginTop: 4,
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 14,
                    background: "var(--surface-container-high)",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                    color: "var(--on-surface)",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 14,
                    background: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(79, 55, 138, 0.3)",
                  }}
                >
                  {isSubmitting ? "Simpan..." : "Simpan Impian"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Setor Tabungan */}
      {isDepositOpen && selectedGoal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: 28,
              padding: 24,
              width: "100%",
              maxWidth: 400,
              boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
              border: "1px solid var(--outline-variant)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--on-surface)" }}>Setor Tabungan</h3>
              <button
                onClick={() => setIsDepositOpen(false)}
                style={{ background: "none", border: "none", color: "var(--outline)", cursor: "pointer" }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "var(--on-surface-variant)" }}>
              Impian: <strong style={{ color: "var(--primary)" }}>{selectedGoal.name}</strong>
            </p>

            {errorMsg && (
              <div style={{ background: "rgba(211, 47, 47, 0.1)", color: "#d32f2f", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 14 }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleDeposit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--on-surface-variant)" }}>Nominal Setoran (Rp)</label>
                <input
                  type="text"
                  placeholder="Misal: 500.000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--outline)",
                    background: "var(--surface-container-low)",
                    color: "var(--on-surface)",
                    fontSize: 16,
                    fontWeight: 700,
                    marginTop: 4,
                  }}
                  autoFocus
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsDepositOpen(false)}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 14,
                    background: "var(--surface-container-high)",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                    color: "var(--on-surface)",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 14,
                    background: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(79, 55, 138, 0.3)",
                  }}
                >
                  {isSubmitting ? "Proses..." : "Setor Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteGoalId}
        title="Hapus Target Tabungan?"
        description="Apakah Anda yakin ingin menghapus target tabungan ini? Data akumulasi tabungan ini akan terhapus."
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isLoading={isDeletingGoalLoading}
        onConfirm={handleConfirmDeleteGoal}
        onClose={() => setDeleteGoalId(null)}
      />

      {/* Toast Notification */}
      <Toast
        isOpen={isToastOpen}
        message={toastMsg}
        type={toastType}
        onClose={() => setIsToastOpen(false)}
      />

      <BottomNav />
    </div>
  );
}
