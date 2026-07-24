"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  remainingAmount: number;
  isCompleted: boolean;
}

function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function SavingGoalsCard() {
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    fetch(`${API_BASE}/api/goals`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && data.data) {
          setGoals(data.data.slice(0, 3)); // Display top 3 active goals
        }
      })
      .catch((err) => console.error("Error fetching goals widget:", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || goals.length === 0) return null;

  return (
    <div
      style={{
        background: "var(--surface-container)",
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        border: "1px solid var(--outline-variant)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 20 }}>
            savings
          </span>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--on-surface)" }}>
            Target Tabungan Impian
          </h3>
        </div>
        <Link
          href="/goals"
          style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)", textDecoration: "none" }}
        >
          Lihat Semua
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {goals.map((g) => (
          <div key={g.id} style={{ background: "var(--surface-container-low)", borderRadius: 12, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              <span>{g.name}</span>
              <span style={{ color: "var(--primary)" }}>{g.progressPercentage}%</span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: "var(--surface-container-highest)",
                overflow: "hidden",
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${g.progressPercentage}%`,
                  background: g.isCompleted ? "#2e7d32" : "var(--primary)",
                  borderRadius: 3,
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--on-surface-variant)" }}>
              <span>Terkumpul: {formatRupiah(g.currentAmount)}</span>
              <span>Target: {formatRupiah(g.targetAmount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
