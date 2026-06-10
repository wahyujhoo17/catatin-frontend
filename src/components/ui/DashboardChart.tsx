"use client";

import React, { useState, useEffect, useCallback } from "react";
import StatsBreakdownDrawer from "./StatsBreakdownDrawer";
import PeriodSelector from "./PeriodSelector";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ChartDataPoint {
  label: string;
  income: number;
  expense: number;
}

interface CategoryBreakdownItem {
  name: string;
  icon: string;
  color: string;
  amount: number;
  count: number;
  percentage: number;
}

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  expenseRatio: number;
  avgDailyExpense: number;
  recommendation: string;
}

interface TransactionItem {
  id: string;
  type: string;
  amount: number;
  description: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  date: string;
  isExpense: boolean;
}

export interface AccountItem {
  id: string;
  name: string;
  type: "CASH" | "BANK" | "E_WALLET";
  balance: number;
  icon: string | null;
  color: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function formatRupiah(n: number): string {
  if (n >= 1_000_000) {
    return `Rp ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}jt`;
  }
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function formatRupiahFull(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function DashboardChart() {
  const [range, setRange] = useState<"today" | "week" | "month" | "custom">("today");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPeriodPickerOpen, setIsPeriodPickerOpen] = useState(false);
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);

  // Lock document body scroll when modal or drawer is open
  useEffect(() => {
    if (isDrawerOpen || isPeriodPickerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen, isPeriodPickerOpen]);

  // Fetch chart data from backend
  const fetchChart = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      let url = `${API_BASE}/api/dashboard/chart?range=${range}`;
      if (range === "custom" && customRange?.from) {
        const start = format(customRange.from, "yyyy-MM-dd");
        const end = customRange.to ? format(customRange.to, "yyyy-MM-dd") : start;
        url += `&start=${start}&end=${end}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil data grafik");
      const json = await res.json();
      setChartData(json.chartData || []);
      setCategoryBreakdown(json.categoryBreakdown || []);
      setSummary(json.summary || null);
      setTransactions(json.transactions || []);
      setAccounts(json.accounts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [range, customRange]);

  useEffect(() => {
    fetchChart();

    const handleTransactionSaved = () => {
      fetchChart();
    };

    window.addEventListener("transactionSaved", handleTransactionSaved);
    return () => {
      window.removeEventListener("transactionSaved", handleTransactionSaved);
    };
  }, [fetchChart]);

  // Dimension & Layout for SVG Graph
  const width = 500;
  const height = 220;
  const paddingLeft = 65;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Find max value in data to scale coordinates
  const maxDataVal = chartData.length > 0 
    ? Math.max(...chartData.map((d) => Math.max(d.income, d.expense)))
    : 0;
  const maxVal = (maxDataVal > 0 ? maxDataVal : 10000) * 1.15; // 15% headroom

  // Grid line values
  const yGridLines = [0, 0.25, 0.5, 0.75, 1].map((p) => p * (maxVal / 1.15));

  // Compute SVG Points coordinates
  const incomePoints = chartData.map((d, i) => {
    const x = paddingLeft + (i / (chartData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.income / maxVal) * chartHeight;
    return { x, y, val: d.income, label: d.label };
  });

  const expensePoints = chartData.map((d, i) => {
    const x = paddingLeft + (i / (chartData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.expense / maxVal) * chartHeight;
    return { x, y, val: d.expense, label: d.label };
  });

  // Helper for generating smooth curved SVG path using Bezier curves
  const generateSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    
    const line = (pointA: { x: number; y: number }, pointB: { x: number; y: number }) => {
      const lengthX = pointB.x - pointA.x;
      const lengthY = pointB.y - pointA.y;
      return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
      };
    };

    const controlPoint = (
      current: { x: number; y: number },
      previous: { x: number; y: number } | undefined,
      next: { x: number; y: number } | undefined,
      reverse?: boolean
    ) => {
      const p = previous || current;
      const n = next || current;
      const smoothing = 0.12; // Lower values make it tighter, 0.12 is very clean and organic
      const o = line(p, n);
      const angle = o.angle + (reverse ? Math.PI : 0);
      const length = o.length * smoothing;
      const x = current.x + Math.cos(angle) * length;
      const y = current.y + Math.sin(angle) * length;
      return [x, y];
    };

    return points.reduce((acc, point, i, a) => {
      if (i === 0) return `M ${point.x.toFixed(1)},${point.y.toFixed(1)}`;
      
      const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
      const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
      
      return `${acc} C ${cpsX.toFixed(1)},${cpsY.toFixed(1)} ${cpeX.toFixed(1)},${cpeY.toFixed(1)} ${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    }, "");
  };

  // SVG path generation
  const incomePath = generateSmoothPath(incomePoints);
  const incomeAreaPath = incomePoints.length > 0
    ? `${incomePath} L ${incomePoints[incomePoints.length - 1].x.toFixed(1)},${(paddingTop + chartHeight).toFixed(1)} L ${incomePoints[0].x.toFixed(1)},${(paddingTop + chartHeight).toFixed(1)} Z`
    : "";

  const expensePath = generateSmoothPath(expensePoints);
  const expenseAreaPath = expensePoints.length > 0
    ? `${expensePath} L ${expensePoints[expensePoints.length - 1].x.toFixed(1)},${(paddingTop + chartHeight).toFixed(1)} L ${expensePoints[0].x.toFixed(1)},${(paddingTop + chartHeight).toFixed(1)} Z`
    : "";

  // Pointer Interaction
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!chartData || chartData.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Scale local x coordinate to SVG viewbox width of 500
    const svgScaledX = (x / rect.width) * width;
    const chartClickX = svgScaledX - paddingLeft;
    const pct = chartClickX / chartWidth;
    
    let index = Math.round(pct * (chartData.length - 1));
    if (index < 0) index = 0;
    if (index >= chartData.length) index = chartData.length - 1;

    setActiveIdx(index);
  };

  const handlePointerLeave = () => {
    setActiveIdx(null);
  };

  // Get matching transactions for active point tooltip
  const getMatchingTransactions = () => {
    if (activeIdx === null || chartData.length === 0) return [];
    const activePoint = chartData[activeIdx];
    
    if (range === "today") {
      const targetHour = parseInt(activePoint.label.split(":")[0], 10);
      return transactions.filter((tx) => {
        const d = new Date(tx.date);
        return d.getHours() === targetHour;
      });
    } else if (range === "week") {
      const match = activePoint.label.match(/\((\d+)\/(\d+)\)/);
      if (!match) return [];
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      return transactions.filter((tx) => {
        const d = new Date(tx.date);
        return d.getDate() === day && (d.getMonth() + 1) === month;
      });
    } else if (range === "month") {
      const parts = activePoint.label.split("/");
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      return transactions.filter((tx) => {
        const d = new Date(tx.date);
        return d.getDate() === day && (d.getMonth() + 1) === month;
      });
    } else if (range === "custom") {
      if (!customRange?.from) return [];
      const end = customRange.to || customRange.from;
      const diffTime = end.getTime() - customRange.from.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays <= 1) {
        const targetHour = parseInt(activePoint.label.split(":")[0], 10);
        return transactions.filter((tx) => {
          const d = new Date(tx.date);
          return d.getHours() === targetHour;
        });
      } else if (diffDays <= 8) {
        const match = activePoint.label.match(/\((\d+)\/(\d+)\)/);
        if (!match) return [];
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        return transactions.filter((tx) => {
          const d = new Date(tx.date);
          return d.getDate() === day && (d.getMonth() + 1) === month;
        });
      } else if (diffDays <= 31) {
        const parts = activePoint.label.split("/");
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        return transactions.filter((tx) => {
          const d = new Date(tx.date);
          return d.getDate() === day && (d.getMonth() + 1) === month;
        });
      } else {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        const labelMonth = activePoint.label.split(" ")[0];
        const targetMonthIndex = monthNames.indexOf(labelMonth);
        return transactions.filter((tx) => {
          const d = new Date(tx.date);
          return d.getMonth() === targetMonthIndex;
        });
      }
    }
    return [];
  };

  const activeTxs = getMatchingTransactions();
  const activePoint = activeIdx !== null ? chartData[activeIdx] : null;

  // Display label translation
  const rangeLabels: Record<string, string> = {
    today: "Hari Ini",
    week: "Minggu Ini",
    month: "Bulan Ini",
    custom: "Custom",
  };

  const getRangeLabel = () => {
    if (customRange?.from) {
      const startStr = format(customRange.from, "d MMM", { locale: id });
      if (customRange.to) {
        const endStr = format(customRange.to, "d MMM", { locale: id });
        return `${startStr} - ${endStr}`;
      }
      return startStr;
    }
    return "Custom";
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: "20px var(--card-padding)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Header and Filter Tab */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h3 className="text-headline-sm">Grafik Keuangan</h3>
        
        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            backgroundColor: "rgba(0,0,0,0.04)",
            padding: 4,
            borderRadius: 999,
            gap: 2,
            maxWidth: "100%",
            overflowX: "auto",
          }}
        >
          {(["today", "week", "month", "custom"] as const).map((r) => {
            const isActive = range === r;
            const labelText = r === "custom" ? getRangeLabel() : rangeLabels[r];
            return (
              <button
                key={r}
                onClick={() => {
                  if (r === "custom") {
                    setIsPeriodPickerOpen(true);
                  } else {
                    setRange(r);
                    setActiveIdx(null);
                  }
                }}
                style={{
                  background: isActive ? "var(--primary)" : "transparent",
                  color: isActive ? "var(--on-primary)" : "var(--on-surface-variant)",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                  whiteSpace: "nowrap",
                }}
              >
                {labelText}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend Indicator */}
      <div style={{ display: "flex", gap: 16, fontSize: 12, fontWeight: 500 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2196f3" }} />
          <span style={{ color: "var(--on-surface-variant)" }}>Pemasukan ↗</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f43f5e" }} />
          <span style={{ color: "var(--on-surface-variant)" }}>Pengeluaran ↘</span>
        </div>
      </div>

      {/* Graph Area */}
      <div style={{ position: "relative", width: "100%" }}>
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255, 255, 255, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              borderRadius: 12,
            }}
          >
            <span style={{ fontSize: 14, color: "var(--primary)", fontWeight: 600 }}>Memuat data grafik…</span>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              color: "var(--error)",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {!loading && chartData.length === 0 && !error && (
          <div
            style={{
              height: height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--on-surface-variant)",
              fontSize: 14,
            }}
          >
            Belum ada data transaksi.
          </div>
        )}

        {chartData.length > 0 && (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height="100%"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            style={{
              overflow: "visible",
              touchAction: "none",
            }}
          >
            <defs>
              {/* Gradients */}
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2196f3" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#2196f3" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {yGridLines.map((val, idx) => {
              const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
              return (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="rgba(0,0,0,0.06)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="var(--on-surface-variant)"
                  >
                    {formatRupiah(val)}
                  </text>
                </g>
              );
            })}

            {/* X Axis Labels (selective subset to prevent overlap) */}
            {chartData.map((d, i) => {
              // Only draw some labels depending on range
              let shouldDraw = false;
              if (range === "today") shouldDraw = i % 4 === 0;
              else if (range === "week") shouldDraw = true;
              else if (range === "month") shouldDraw = i % 6 === 0 || i === chartData.length - 1;
              else if (range === "custom") {
                if (chartData.length <= 8) shouldDraw = true;
                else if (chartData.length <= 31) shouldDraw = i % 6 === 0 || i === chartData.length - 1;
                else shouldDraw = i % 2 === 0;
              }

              if (!shouldDraw) return null;

              const x = paddingLeft + (i / (chartData.length - 1)) * chartWidth;
              const y = height - paddingBottom + 16;
              return (
                <text
                  key={i}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--on-surface-variant)"
                >
                  {d.label.split(" ")[0]}
                </text>
              );
            })}

            {/* Area under Income */}
            <path d={incomeAreaPath} fill="url(#incomeGrad)" />

            {/* Area under Expense */}
            <path d={expenseAreaPath} fill="url(#expenseGrad)" />

            {/* Income Line */}
            <path
              d={incomePath}
              fill="none"
              stroke="#2196f3"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Expense Line */}
            <path
              d={expensePath}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactivity Tracker line & active dots */}
            {activeIdx !== null && activePoint && (
              <>
                {/* Vertical Cursor Tracker Line */}
                <line
                  x1={incomePoints[activeIdx].x}
                  y1={paddingTop}
                  x2={incomePoints[activeIdx].x}
                  y2={paddingTop + chartHeight}
                  stroke="var(--primary)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />

                {/* Dot on Income Line */}
                {incomePoints[activeIdx].val > 0 && (
                  <circle
                    cx={incomePoints[activeIdx].x}
                    cy={incomePoints[activeIdx].y}
                    r="6"
                    fill="#2196f3"
                    stroke="#ffffff"
                    strokeWidth="2"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}
                  />
                )}

                {/* Dot on Expense Line */}
                {expensePoints[activeIdx].val > 0 && (
                  <circle
                    cx={expensePoints[activeIdx].x}
                    cy={expensePoints[activeIdx].y}
                    r="6"
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth="2"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}
                  />
                )}
              </>
            )}
          </svg>
        )}

        {/* Hover Tooltip Overlay (Absolute HTML overlay for beautiful CSS styling) */}
        {activeIdx !== null && activePoint && (
          <div
            style={{
              position: "absolute",
              // Centered around the active tracker line (scaled X pct of graph)
              left: `${((incomePoints[activeIdx].x / width) * 100).toFixed(1)}%`,
              top: "20%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              padding: "10px 14px",
              borderRadius: 14,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
              pointerEvents: "none",
              zIndex: 5,
              minWidth: 160,
              transition: "left 0.1s ease-out, top 0.1s ease-out",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--on-surface-variant)",
                letterSpacing: "0.05em",
                margin: "0 0 6px 0",
              }}
            >
              {activePoint.label}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {activePoint.income > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 11, color: "var(--on-surface-variant)" }}>Pemasukan:</span>
                  <span style={{ fontSize: 11, color: "#1976d2", fontWeight: 700 }}>
                    +{formatRupiahFull(activePoint.income)}
                  </span>
                </div>
              )}

              {activePoint.expense > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 11, color: "var(--on-surface-variant)" }}>Pengeluaran:</span>
                  <span style={{ fontSize: 11, color: "#c62828", fontWeight: 700 }}>
                    -{formatRupiahFull(activePoint.expense)}
                  </span>
                </div>
              )}

              {/* Transactions details list if any */}
              {activeTxs.length > 0 && (
                <div
                  style={{
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                    marginTop: 6,
                    paddingTop: 4,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  {activeTxs.slice(0, 2).map((tx) => (
                    <div
                      key={tx.id}
                      style={{
                        fontSize: 10,
                        color: "var(--on-surface)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {tx.description}
                      </span>
                      <span style={{ fontWeight: 600, color: tx.isExpense ? "#c62828" : "#1976d2" }}>
                        {tx.isExpense ? "-" : "+"}{formatRupiah(tx.amount)}
                      </span>
                    </div>
                  ))}
                  {activeTxs.length > 2 && (
                    <span style={{ fontSize: 9, color: "var(--on-surface-variant)", fontStyle: "italic", textAlign: "right" }}>
                      +{activeTxs.length - 2} tx lainnya
                    </span>
                  )}
                </div>
              )}

              {activePoint.income === 0 && activePoint.expense === 0 && (
                <span style={{ fontSize: 11, color: "var(--on-surface-variant)", fontStyle: "italic" }}>
                  Tidak ada transaksi
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Details Button */}
      {summary && (
        <button
          onClick={() => setIsDrawerOpen(true)}
          style={{
            background: "var(--primary-container)",
            color: "var(--on-primary-container)",
            border: "none",
            borderRadius: 14,
            padding: "12px 16px",
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
            width: "100%",
            transition: "opacity 0.2s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <span>Statistik Detail</span>
        </button>
      )}

      {/* Bottom Sheet Drawer for Detailed Breakdown */}
      <StatsBreakdownDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        summary={summary}
        categoryBreakdown={categoryBreakdown}
        accounts={accounts}
        rangeLabel={range === "custom" ? getRangeLabel() : rangeLabels[range]}
      />

      {/* Manual Date Range Picker modal */}
      <PeriodSelector
        isOpen={isPeriodPickerOpen}
        onClose={() => setIsPeriodPickerOpen(false)}
        onSelectRange={(selectedRange) => {
          if (selectedRange) {
            setCustomRange(selectedRange);
            setRange("custom");
            setActiveIdx(null);
          } else {
            setCustomRange(undefined);
            setRange("today");
            setActiveIdx(null);
          }
        }}
        initialRange={customRange}
      />
    </div>
  );
}
