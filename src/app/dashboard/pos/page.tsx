"use client";
import TopAppBar from "@/components/layout/TopAppBar";
import BottomNav from "@/components/layout/BottomNav";

export default function POSDashboard() {
  return (
    <div style={{ background: "var(--surface)", minHeight: "100dvh" }}>
      <TopAppBar />
      <main style={{ padding: "96px 24px 128px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 64, color: "#2196F3", marginBottom: 24 }}>point_of_sale</span>
        <h1 className="text-headline-lg">POS Workspace</h1>
        <p className="text-body-lg" style={{ color: "var(--on-surface-variant)", marginTop: 16 }}>
          Fitur POS Operations (Kasir, Inventaris, Invoice) sedang dalam pengembangan. Silakan kembali ke Personal Workspace untuk saat ini.
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
