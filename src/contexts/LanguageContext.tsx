"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "id" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  id: {
    // Navigation & General
    "nav.dashboard": "Beranda",
    "nav.chat": "Tanya AI",
    "nav.scan": "Pindai Struk",
    "nav.wallet": "Rekening",
    "nav.settings": "Pengaturan",
    "nav.goals": "Target Tabungan",
    "nav.transactions": "Transaksi",

    // Dashboard
    "dashboard.welcome": "Halo,",
    "dashboard.status_prefix": "Ini status keuanganmu bulan",
    "dashboard.total_balance": "TOTAL SALDO GABUNGAN",
    "dashboard.budget_health": "Kesehatan Budget",
    "dashboard.top_categories": "Kategori Teratas",
    "dashboard.no_expense_month": "Belum ada pengeluaran bulan ini",
    "dashboard.ai_insight": "Insight AI Pintar",
    "dashboard.loading_insight": "Memuat insight…",
    "dashboard.stats": "Statistik Keuangan",
    "dashboard.income_this_month": "Pemasukan Bulan Ini",
    "dashboard.expense_this_month": "Pengeluaran Bulan Ini",
    "dashboard.recent_trans": "Transaksi Terbaru",
    "dashboard.view_all": "Lihat Semua",
    "dashboard.view_details": "Lihat Detail",
    "dashboard.no_transactions": "Belum ada transaksi recorded.",
    "dashboard.connected_ai": "Terhubung dengan Catatin AI Assistant",

    // Settings Header & Preferences
    "settings.title": "Pengaturan",
    "settings.subtitle": "Kelola profil, preferensi aplikasi, dan sesi akun Anda.",
    "settings.app_prefs": "PREFERENSI APLIKASI",
    "settings.app_lang": "Bahasa Aplikasi",
    "settings.default_ws": "Default Workspace",
    "settings.notif_trans": "Notifikasi Transaksi",
    "settings.notif_trans_sub": "Kirim ringkasan transaksi via PWA push",
    "settings.notif_budget": "Pengingat Budgeting",
    "settings.notif_budget_sub": "Peringatan jika melebihi batas bulanan",
    "settings.cycle_day": "Tanggal Reset Siklus (Gajian)",
    "settings.cycle_modal_title": "Tanggal Reset Siklus (Gajian)",
    "settings.cycle_modal_sub": "Pilih tanggal gajian / reset bulanan (1 s.d. 28)",
    "settings.cycle_modal_selected": "Tanggal Terpilih:",
    "settings.cycle_modal_info_calendar": "Siklus bulanan standar kalender (Tgl 1 s.d. Akhir Bulan).",
    "settings.cycle_modal_pick": "Pilih Tanggal (1 - 28):",
    "settings.saving": "Menyimpan...",

    // Settings AI & Connectivity
    "settings.ai_connectivity": "KONEKTIVITAS & AI",
    "settings.ai_provider_config": "Konfigurasi Provider AI",
    "settings.ai_provider_config_sub": "Gunakan Catatin AI atau pasang API Key Anda sendiri (OpenRouter, Groq, dll)",

    // Settings Account & Security
    "settings.account_security": "AKUN & KEAMANAN",
    "settings.profile_info": "Ubah Informasi Profil",
    "settings.profile_sub": "Nama, email, dan detail akun Anda",
    "settings.change_pw": "Ganti Kata Sandi",
    "settings.change_pw_sub": "Perbarui password untuk keamanan akun",
    "settings.chat_history": "Riwayat Chat",
    "settings.chat_history_sub": "Kelola riwayat obrolan dengan Catatin AI",

    // Settings Information & Support
    "settings.info_help": "INFORMASI & BANTUAN",
    "settings.about": "Tentang Aplikasi",
    "settings.about_sub": "Catatin v0.1.0 Beta (PWA)",
    "settings.contact_support": "Hubungi Bantuan",
    "settings.contact_support_sub": "Pusat bantuan dan FAQ pengguna",
    "settings.logout": "Keluar dari Akun",
    "settings.logout_sub": "Akhiri sesi aktif di perangkat ini",

    // Wallet & Mutasi
    "wallet.title": "Dompet & Rekening",
    "wallet.subtitle": "Kelola semua saldo dan rekening Anda dalam satu tempat terpusat",
    "wallet.total_balance": "Total Saldo Gabungan",
    "wallet.add_account": "Tambah",
    "wallet.active_accounts": "Rekening Aktif Terhubung",
    "wallet.account_list": "Daftar Rekening",
    "wallet.loading": "Memuat data rekening...",
    "wallet.empty": "Belum ada rekening. Tambahkan rekening pertama Anda!",
    "wallet.mutasi_title": "Mutasi Rekening",
    "wallet.mutasi_sub": "Riwayat transaksi masuk & keluar rekening ini",
    "wallet.add_trans": "Tambah Transaksi",
    "wallet.search_placeholder": "Cari transaksi mutasi...",
    "wallet.no_mutasi": "Belum ada riwayat transaksi mutasi",
    "wallet.filter_all": "Semua",
    "wallet.filter_income": "Pemasukan",
    "wallet.filter_expense": "Pengeluaran",

    // Goals
    "goals.title": "Target Tabungan Impian",
    "goals.subtitle": "Rencanakan impian keuangan Anda dan pantau kemajuannya secara real-time",
    "goals.add_goal": "Tambah Target",
    "goals.total_goals": "Total Target Tabungan",
    "goals.collected": "Terkumpul",

    // Common
    "common.coming_soon": "Segera Hadir (Coming Soon)",
    "common.save": "Simpan",
    "common.cancel": "Batal",
    "common.delete": "Hapus",
    "common.edit": "Edit",
    "common.back": "Kembali",

    // Notifications
    "notif.title": "Notifikasi",
    "notif.mark_all_read": "Tandai Semua Dibaca",
    "notif.empty": "Belum ada notifikasi",
    "notif.empty_sub": "Notifikasi peringatan, pengingat tagihan, dan rekap harian akan muncul di sini",
    "notif.just_now": "Baru saja",
    "notif.minutes_ago": "menit lalu",
    "notif.hours_ago": "jam lalu",
    "notif.days_ago": "hari lalu",
  },
  en: {
    // Navigation & General
    "nav.dashboard": "Home",
    "nav.chat": "Ask AI",
    "nav.scan": "Scan Receipt",
    "nav.wallet": "Accounts",
    "nav.settings": "Settings",
    "nav.goals": "Saving Goals",
    "nav.transactions": "Transactions",

    // Dashboard
    "dashboard.welcome": "Hello,",
    "dashboard.status_prefix": "Here is your financial status for",
    "dashboard.total_balance": "TOTAL COMBINED BALANCE",
    "dashboard.budget_health": "Budget Health",
    "dashboard.top_categories": "Top Categories",
    "dashboard.no_expense_month": "No expenses this month",
    "dashboard.ai_insight": "Smart AI Insight",
    "dashboard.loading_insight": "Loading insight…",
    "dashboard.stats": "Financial Statistics",
    "dashboard.income_this_month": "Income This Month",
    "dashboard.expense_this_month": "Expenses This Month",
    "dashboard.recent_trans": "Recent Transactions",
    "dashboard.view_all": "View All",
    "dashboard.view_details": "View Details",
    "dashboard.no_transactions": "No transactions recorded yet.",
    "dashboard.connected_ai": "Connected with Catatin AI Assistant",

    // Settings Header & Preferences
    "settings.title": "Settings",
    "settings.subtitle": "Manage your profile, app preferences, and account session.",
    "settings.app_prefs": "APP PREFERENCES",
    "settings.app_lang": "App Language",
    "settings.default_ws": "Default Workspace",
    "settings.notif_trans": "Transaction Notifications",
    "settings.notif_trans_sub": "Send transaction summaries via push",
    "settings.notif_budget": "Budget Reminders",
    "settings.notif_budget_sub": "Alert when exceeding monthly limit",
    "settings.cycle_day": "Financial Cycle Reset Day (Payday)",
    "settings.cycle_modal_title": "Reset Date (Payday)",
    "settings.cycle_modal_sub": "Select salary / reset date (1 to 28)",
    "settings.cycle_modal_selected": "Selected Date:",
    "settings.cycle_modal_info_calendar": "Standard monthly calendar cycle (1st to End of Month).",
    "settings.cycle_modal_pick": "Select Date (1 - 28):",
    "settings.saving": "Saving...",

    // Settings AI & Connectivity
    "settings.ai_connectivity": "CONNECTIVITY & AI",
    "settings.ai_provider_config": "AI Provider Configuration",
    "settings.ai_provider_config_sub": "Use Catatin AI or set up your own API key (OpenRouter, Groq, etc)",

    // Settings Account & Security
    "settings.account_security": "ACCOUNT & SECURITY",
    "settings.profile_info": "Edit Profile Information",
    "settings.profile_sub": "Your name, email, and account details",
    "settings.change_pw": "Change Password",
    "settings.change_pw_sub": "Update password for account security",
    "settings.chat_history": "Chat History",
    "settings.chat_history_sub": "Manage chat history with Catatin AI",

    // Settings Information & Support
    "settings.info_help": "INFORMATION & HELP",
    "settings.about": "About Application",
    "settings.about_sub": "Catatin v0.1.0 Beta (PWA)",
    "settings.contact_support": "Contact Support",
    "settings.contact_support_sub": "Help center and user FAQ",
    "settings.logout": "Log Out",
    "settings.logout_sub": "End active session on this device",

    // Wallet & Mutasi
    "wallet.title": "Wallet & Accounts",
    "wallet.subtitle": "Manage all your balances and accounts in one centralized place",
    "wallet.total_balance": "Total Combined Balance",
    "wallet.add_account": "Add Account",
    "wallet.active_accounts": "Active Accounts Connected",
    "wallet.account_list": "Account List",
    "wallet.loading": "Loading account data...",
    "wallet.empty": "No accounts found. Add your first account!",
    "wallet.mutasi_title": "Account Statements",
    "wallet.mutasi_sub": "Transaction history for this account",
    "wallet.add_trans": "Add Transaction",
    "wallet.search_placeholder": "Search statements...",
    "wallet.no_mutasi": "No statement transactions yet",
    "wallet.filter_all": "All",
    "wallet.filter_income": "Income",
    "wallet.filter_expense": "Expense",

    // Goals
    "goals.title": "Dream Saving Goals",
    "goals.subtitle": "Plan your financial dreams and track progress in real-time",
    "goals.add_goal": "Add Goal",
    "goals.total_goals": "Total Savings Target",
    "goals.collected": "Collected",

    // Common
    "common.coming_soon": "Coming Soon",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.back": "Back",

    // Notifications
    "notif.title": "Notifications",
    "notif.mark_all_read": "Mark All as Read",
    "notif.empty": "No notifications yet",
    "notif.empty_sub": "Alerts, bill reminders, and daily recaps will appear here",
    "notif.just_now": "Just now",
    "notif.minutes_ago": "minutes ago",
    "notif.hours_ago": "hours ago",
    "notif.days_ago": "days ago",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "id",
  setLang: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("id");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("pref_app_lang") as Language;
      if (savedLang === "en" || savedLang === "id") {
        setLangState(savedLang);
      }
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("pref_app_lang", newLang);
    }
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations["id"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
