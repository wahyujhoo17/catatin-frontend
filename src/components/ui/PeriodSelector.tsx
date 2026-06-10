"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  eachWeekOfInterval,
  getYear,
  subYears,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { id } from "date-fns/locale";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface PeriodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRange: (range: DateRange | undefined) => void;
  initialRange?: DateRange;
}

type TabType = "Daily" | "Weekly" | "Monthly";

export default function PeriodSelector({
  isOpen,
  onClose,
  onSelectRange,
  initialRange,
}: PeriodSelectorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Daily");
  const [tempRange, setTempRange] = useState<DateRange | undefined>(initialRange);

  const [currentDate] = useState(new Date());
  
  // Client-side portal mounting check
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Self-contained scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Weekly calculations
  const weeklyMonths = useMemo(() => {
    const months = [];
    // Show last 3 months for weekly selection
    for (let i = 0; i < 3; i++) {
      const monthDate = subMonths(currentDate, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      
      const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
      
      months.push({
        monthName: format(monthDate, "MMMM yyyy", { locale: id }),
        weeks: weeks.map((weekStart, idx) => {
          // If week start is before month start, clamp to month start
          const wStart = weekStart < start ? start : weekStart;
          let wEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
          // If week end is after month end, clamp to month end
          if (wEnd > end) wEnd = end;

          return {
            label: `${format(wStart, "dd")} - ${format(wEnd, "dd")}`,
            subLabel: `Minggu ke-${idx + 1}`,
            start: wStart,
            end: wEnd,
          };
        }),
      });
    }
    return months;
  }, [currentDate]);

  // Monthly calculations
  const [selectedYear, setSelectedYear] = useState(getYear(currentDate));
  const monthlyYears = useMemo(() => {
    return [getYear(currentDate), getYear(currentDate) - 1, getYear(currentDate) - 2];
  }, [currentDate]);

  const monthsGrid = useMemo(() => {
    const start = startOfYear(new Date(selectedYear, 0, 1));
    const end = endOfYear(new Date(selectedYear, 0, 1));
    const months = eachMonthOfInterval({ start, end });
    return months.map(month => ({
      label: format(month, "MMM", { locale: id }).toUpperCase(),
      start: startOfMonth(month),
      end: endOfMonth(month),
    }));
  }, [selectedYear]);

  if (!isOpen || !mounted) return null;

  const handleApply = () => {
    onSelectRange(tempRange);
    onClose();
  };

  const handleClear = () => {
    setTempRange(undefined);
    onSelectRange(undefined);
    onClose();
  };

  return createPortal(
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
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 className="text-headline-sm" style={{ margin: 0 }}>
            Pilih Periode
          </h3>
          <button 
            onClick={onClose}
            style={{ 
              background: "var(--surface-variant)", border: "none", cursor: "pointer", 
              borderRadius: "50%", width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--on-surface-variant)"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, justifyContent: "space-between" }}>
          {(["Daily", "Weekly", "Monthly"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                opacity: activeTab === tab ? 1 : 0.6,
                transition: "all 0.2s"
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: activeTab === tab ? "var(--primary)" : "rgba(100,100,100,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: activeTab === tab ? "var(--on-primary)" : "var(--on-surface-variant)",
                boxShadow: activeTab === tab ? "0 4px 12px rgba(var(--primary-rgb), 0.3)" : "none",
              }}>
                <span className="material-symbols-outlined">
                  {tab === "Daily" ? "today" : tab === "Weekly" ? "view_week" : "calendar_month"}
                </span>
              </div>
              <span className="text-label-md" style={{ 
                fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? "var(--primary)" : "var(--on-surface-variant)" 
              }}>
                {tab === "Daily" ? "Harian" : tab === "Weekly" ? "Mingguan" : "Bulanan"}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ minHeight: 300, maxHeight: "50vh", overflowY: "auto", paddingRight: 8, paddingBottom: 16 }}>
          
          {/* DAILY VIEW */}
          {activeTab === "Daily" && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <DayPicker
                mode="range"
                selected={tempRange}
                onSelect={setTempRange}
                locale={id}
                showOutsideDays
                className="custom-day-picker"
              />
            </div>
          )}

          {/* WEEKLY VIEW */}
          {activeTab === "Weekly" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {weeklyMonths.map((m, i) => (
                <div key={i}>
                  <h4 className="text-label-lg" style={{ color: "var(--on-surface-variant)", marginBottom: 12, fontWeight: 700 }}>
                    {m.monthName}
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {m.weeks.map((w, j) => {
                      const isSelected = tempRange?.from && isSameDay(w.start, tempRange.from) && 
                                         tempRange?.to && isSameDay(w.end, tempRange.to);
                      return (
                        <button
                          key={j}
                          onClick={() => setTempRange({ from: w.start, to: w.end })}
                          style={{
                            padding: "12px",
                            borderRadius: 12,
                            border: `1px solid ${isSelected ? "var(--primary)" : "var(--outline-variant)"}`,
                            background: isSelected ? "var(--primary-container)" : "transparent",
                            textAlign: "left",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          <div style={{ color: isSelected ? "var(--on-primary-container)" : "var(--on-surface)", fontWeight: 700, fontSize: 14 }}>
                            {w.label}
                          </div>
                          <div style={{ color: isSelected ? "var(--primary)" : "var(--on-surface-variant)", fontSize: 12, marginTop: 4 }}>
                            {w.subLabel}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MONTHLY VIEW */}
          {activeTab === "Monthly" && (
            <div>
              <div style={{ display: "flex", gap: 16, borderBottom: "1px solid var(--outline-variant)", paddingBottom: 12, marginBottom: 16, overflowX: "auto" }}>
                {monthlyYears.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: 16,
                      fontWeight: selectedYear === year ? 700 : 500,
                      color: selectedYear === year ? "var(--primary)" : "var(--on-surface-variant)",
                      cursor: "pointer",
                      padding: "4px 8px"
                    }}
                  >
                    {year}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {monthsGrid.map((m, i) => {
                  const isSelected = tempRange?.from && isSameDay(m.start, tempRange.from) && 
                                     tempRange?.to && isSameDay(m.end, tempRange.to);
                  return (
                    <button
                      key={i}
                      onClick={() => setTempRange({ from: m.start, to: m.end })}
                      style={{
                        padding: "16px 8px",
                        borderRadius: 12,
                        border: `1px solid ${isSelected ? "var(--primary)" : "var(--outline-variant)"}`,
                        background: isSelected ? "var(--primary-container)" : "transparent",
                        color: isSelected ? "var(--on-primary-container)" : "var(--on-surface)",
                        fontWeight: 700,
                        fontSize: 14,
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--outline-variant)" }}>
          <button
            onClick={handleClear}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 12,
              background: "transparent",
              color: "var(--error)",
              border: "1px solid var(--error)",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            style={{
              flex: 2,
              padding: "12px",
              borderRadius: 12,
              background: "var(--primary)",
              color: "var(--on-primary)",
              border: "none",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(var(--primary-rgb), 0.3)"
            }}
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
