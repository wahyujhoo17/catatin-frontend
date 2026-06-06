# Product Requirements Document (PRD)
# ChatBoard — AI-Powered Transaction & Personal Finance Platform

**Versi:** 1.0.0  
**Tanggal:** Juni 2026  
**Status:** Draft  
**Penulis:** Product Team  

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Masalah](#2-latar-belakang--masalah)
3. [Visi & Tujuan Produk](#3-visi--tujuan-produk)
4. [User Personas](#4-user-personas)
5. [Alur Onboarding — Pemilihan Mode](#5-alur-onboarding--pemilihan-mode)
6. [Mode 1: POS AI (Point of Sale)](#6-mode-1-pos-ai-point-of-sale)
7. [Mode 2: Pencatatan Keuangan Pribadi](#7-mode-2-pencatatan-keuangan-pribadi)
8. [Fitur Bersama (Shared Features)](#8-fitur-bersama-shared-features)
9. [Arsitektur AI & Chat Engine](#9-arsitektur-ai--chat-engine)
10. [Sistem Notifikasi](#10-sistem-notifikasi)
11. [Spesifikasi Dashboard](#11-spesifikasi-dashboard)
12. [User Stories & Acceptance Criteria](#12-user-stories--acceptance-criteria)
13. [Desain UI/UX Guidelines](#13-desain-uiux-guidelines)
14. [Persyaratan Non-Fungsional](#14-persyaratan-non-fungsional)
15. [Tech Stack & Integrasi](#15-tech-stack--integrasi)
16. [Roadmap & Prioritas](#16-roadmap--prioritas)
17. [Risiko & Mitigasi](#17-risiko--mitigasi)
18. [Metrik Keberhasilan](#18-metrik-keberhasilan)
19. [Glossary](#19-glossary)

---

## 1. Ringkasan Eksekutif

**ChatBoard** adalah platform berbasis AI yang memungkinkan pengguna mencatat transaksi hanya dengan mengetikkan pesan natural (seperti chat sehari-hari). Sistem AI akan secara otomatis mem-parsing, mengkategorikan, dan menyimpan data ke dalam dashboard yang terstruktur.

Saat pertama kali mendaftar, pengguna memilih salah satu dari **dua mode utama**:

| Mode | Untuk Siapa | Contoh Penggunaan |
|------|-------------|-------------------|
| **POS AI** | Pemilik warung, toko, UMKM | `indome 1 akbar kasbon` → dicatat sebagai transaksi penjualan |
| **Keuangan Pribadi** | Individu yang ingin tracking keuangan | `beli bensin 50rb` → dicatat sebagai pengeluaran transportasi |

Kedua mode memiliki **chat interface yang identik** namun **dashboard, logika AI, dan kategori data yang berbeda**.

---

## 2. Latar Belakang & Masalah

### 2.1 Masalah yang Diselesaikan

**Untuk UMKM / Pemilik Warung:**
- Pencatatan manual di buku tulis rawan hilang, rusak, dan tidak akurat
- Aplikasi kasir konvensional butuh waktu lama untuk input data per item
- Tidak ada notifikasi real-time saat terjadi transaksi (misal kasbon)
- Sulit memantau stok barang secara cepat
- Tidak ada laporan keuangan harian/mingguan yang mudah dipahami

**Untuk Keuangan Pribadi:**
- Mencatat pengeluaran manual terasa ribet dan tidak konsisten
- Banyak orang tidak tahu ke mana uangnya pergi setiap bulan
- Tidak ada peringatan saat mendekati batas budget
- Sulit memisahkan antara pemasukan dan pengeluaran per kategori

### 2.2 Peluang Pasar

- Indonesia memiliki 65+ juta UMKM, mayoritas masih menggunakan pencatatan manual
- Penetrasi smartphone di Indonesia >75%, chat-based interface sangat familiar
- Gaya komunikasi singkat ("indome 1 akbar kasbon") adalah pola alami pemilik warung

---

## 3. Visi & Tujuan Produk

### Visi
> "Jadikan pencatatan transaksi semudah mengirim pesan WhatsApp."

### Tujuan Produk (OKR)

**Objective 1: Adopsi Cepat**
- KR1: 10.000 pengguna aktif dalam 3 bulan pertama
- KR2: Retention rate 7-day ≥ 60%
- KR3: Waktu onboarding ≤ 3 menit

**Objective 2: Akurasi AI**
- KR1: Akurasi parsing transaksi ≥ 95%
- KR2: False positive rate ≤ 2%
- KR3: Waktu respons AI ≤ 2 detik

**Objective 3: Kepuasan Pengguna**
- KR1: NPS Score ≥ 50
- KR2: App Store rating ≥ 4.5
- KR3: Churn rate bulanan ≤ 8%

---

## 4. User Personas

### Persona A — Budi, Pemilik Warung Sembako
- **Usia:** 38 tahun
- **Lokasi:** Sidoarjo, Jawa Timur
- **Perangkat:** Smartphone Android entry-level
- **Pain Point:** Sering lupa mencatat kasbon pelanggan, tidak tahu stok mana yang habis
- **Goal:** Bisa pantau semua transaksi dan kasbon dari HP tanpa ribet
- **Kutipan:** *"Kalau ada yang kasbon, saya tulis di kertas. Tapi sering hilang."*

### Persona B — Sari, Ibu Rumah Tangga
- **Usia:** 29 tahun  
- **Lokasi:** Surabaya
- **Perangkat:** iPhone mid-range
- **Pain Point:** Gaji habis sebelum akhir bulan, tidak tahu penyebabnya
- **Goal:** Tahu pengeluaran harian dan sisihkan tabungan tiap bulan
- **Kutipan:** *"Saya mau tahu berapa yang saya habiskan untuk jajan anak."*

### Persona C — Doni, Pemilik Usaha Kecil
- **Usia:** 45 tahun
- **Lokasi:** Malang
- **Perangkat:** Tablet Android + HP
- **Pain Point:** Butuh laporan untuk pembukuan akhir bulan
- **Goal:** Dashboard yang bisa dilihat semua transaksi dan export ke Excel
- **Kutipan:** *"Perlu laporan buat lapor ke akuntan tiap bulan."*

---

## 5. Alur Onboarding — Pemilihan Mode

### 5.1 Alur Registrasi

```
[Halaman Splash]
      ↓
[Daftar Akun]
  - Nama lengkap
  - Nomor HP (OTP)
  - Password
      ↓
[HALAMAN PEMILIHAN MODE] ← TITIK KRITIS
      ↓                 ↓
 [Mode POS AI]    [Mode Keuangan Pribadi]
      ↓                 ↓
 [Setup Toko]    [Setup Profil Keuangan]
      ↓                 ↓
 [Dashboard POS] [Dashboard Keuangan]
```

### 5.2 Halaman Pemilihan Mode (Detail)

Halaman ini hanya muncul **sekali** saat pertama kali login. Pengguna **tidak dapat melewati** halaman ini.

**Konten halaman:**

```
┌─────────────────────────────────────────────────┐
│  Selamat Datang di ChatBoard!                   │
│  Pilih cara kamu menggunakan ChatBoard:         │
│                                                 │
│  ┌─────────────────────┐  ┌─────────────────┐  │
│  │  🏪 POS AI           │  │ 💰 Keuangan     │  │
│  │                     │  │    Pribadi      │  │
│  │  Untuk pemilik      │  │                 │  │
│  │  warung & UMKM.     │  │  Catat          │  │
│  │                     │  │  pemasukan &    │  │
│  │  Catat penjualan,   │  │  pengeluaran    │  │
│  │  stok, dan kasbon   │  │  pribadi kamu   │  │
│  │  hanya dengan chat  │  │  dengan mudah   │  │
│  │                     │  │                 │  │
│  │  [Pilih Mode Ini]   │  │ [Pilih Mode Ini]│  │
│  └─────────────────────┘  └─────────────────┘  │
│                                                 │
│  * Mode dapat diganti kapan saja di Pengaturan  │
└─────────────────────────────────────────────────┘
```

### 5.3 Setup Setelah Memilih Mode

**Jika memilih POS AI:**
1. Nama toko/warung
2. Jenis usaha (sembako, makanan, elektronik, dll.)
3. Mata uang (default: IDR)
4. Tambah produk pertama (opsional, bisa dilewati)
5. Nomor HP pemilik untuk notifikasi

**Jika memilih Keuangan Pribadi:**
1. Nama panggilan
2. Budget bulanan (opsional)
3. Kategori pengeluaran utama (bisa pilih atau custom)
4. Sumber pemasukan utama (gaji, bisnis, freelance, dll.)
5. Pengingat harian (opsional, pilih jam)

---

## 6. Mode 1: POS AI (Point of Sale)

### 6.1 Deskripsi Umum

Mode POS AI mengubah chat interface menjadi sistem kasir cerdas. Pemilik warung cukup mengetik transaksi dalam bahasa natural, dan AI akan otomatis:
- Mengenali produk yang dijual
- Mendeteksi nama pelanggan
- Mengidentifikasi jenis transaksi (tunai / kasbon / bayar hutang)
- Memperbarui stok otomatis
- Mengirim notifikasi ke pemilik

### 6.2 Contoh Interaksi Chat (POS AI)

```
User: indome 1 akbar kasbon
AI:   ✅ Dicatat!
      📦 Indomie Goreng × 1 — Rp 3.500
      👤 Pelanggan: Akbar
      💳 Status: Kasbon
      📊 Total kasbon Akbar: Rp 17.500

---

User: budi bayar 20rb
AI:   ✅ Pembayaran dicatat!
      👤 Budi membayar Rp 20.000
      📉 Sisa kasbon Budi: Rp 5.000
      💰 Uang masuk: Rp 20.000

---

User: rokok 3 tunai
AI:   ✅ Dicatat!
      📦 Rokok × 3 — Rp 24.000
      💵 Pembayaran: Tunai
      
---

User: stok indomie berapa?
AI:   📦 Stok Indomie Goreng: 48 pcs
      📦 Stok Indomie Kuah: 23 pcs
      ⚠️  Indomie Soto hampir habis: 5 pcs

---

User: tambah indomie 2 dus
AI:   ✅ Stok diperbarui!
      📦 Indomie Goreng: 48 → 96 pcs (+ 1 dus = 48 pcs)
      📦 Indomie Kuah: 23 → 71 pcs (+ 1 dus = 48 pcs)
```

### 6.3 Kemampuan Parsing AI (POS)

AI harus mampu memahami variasi input berikut:

| Input User | Yang Diparsing AI |
|------------|------------------|
| `indome 1 akbar kasbon` | Produk: Indomie, Qty: 1, Pelanggan: Akbar, Tipe: Kasbon |
| `rokok surya 2 tunai` | Produk: Rokok Surya, Qty: 2, Tipe: Tunai |
| `budi lunas 50rb` | Pelanggan: Budi, Tipe: Bayar kasbon, Nominal: 50.000 |
| `minyak goreng 1 liter 18k` | Produk: Minyak Goreng, Qty: 1L, Harga: 18.000 |
| `teh botol 5` | Produk: Teh Botol, Qty: 5, Tipe: Tunai (default) |
| `sinta hutang berapa` | Query kasbon pelanggan Sinta |
| `siapa aja yang masih kasbon` | List semua pelanggan dengan kasbon aktif |
| `laporan hari ini` | Ringkasan transaksi hari ini |

### 6.4 Fitur Manajemen Produk (POS)

**6.4.1 Tambah Produk**
- Nama produk
- Harga jual
- Harga beli / HPP (opsional)
- Kategori (makanan, minuman, rokok, dll.)
- Satuan (pcs, dus, kg, liter)
- Stok awal
- Ambang batas minimum stok (untuk peringatan)
- Foto produk (opsional)

**6.4.2 Manajemen Stok**
- Update stok via chat atau form manual
- History pergerakan stok (masuk/keluar)
- Peringatan stok menipis (push notification + chat AI)
- Export laporan stok ke CSV/PDF

**6.4.3 Pengelolaan Kasbon**
- Daftar pelanggan dengan kasbon aktif
- Riwayat kasbon per pelanggan
- Pengingat kasbon (notifikasi manual oleh pemilik)
- Batas kasbon per pelanggan (opsional)

### 6.5 Dashboard POS AI

**Panel Utama (Overview):**
- Total penjualan hari ini (tunai + kasbon)
- Total uang masuk hari ini (tunai + bayar kasbon)
- Jumlah transaksi hari ini
- Total kasbon aktif (belum dibayar)
- Grafik penjualan 7 hari terakhir

**Panel Produk:**
- Tabel semua produk + stok
- Filter: semua / hampir habis / habis
- Tombol edit produk
- Tombol tambah produk

**Panel Kasbon:**
- Daftar pelanggan dengan kasbon aktif
- Nominal per pelanggan
- Tombol "Tandai Lunas"
- Riwayat pembayaran

**Panel Laporan:**
- Laporan harian / mingguan / bulanan
- Produk terlaris
- Grafik pendapatan vs pengeluaran (HPP)
- Estimasi keuntungan bersih
- Export ke PDF / Excel

---

## 7. Mode 2: Pencatatan Keuangan Pribadi

### 7.1 Deskripsi Umum

Mode Keuangan Pribadi mengubah chat interface menjadi asisten keuangan personal. Pengguna mencatat pemasukan dan pengeluaran dengan bahasa natural, dan AI mengkategorikan serta menganalisis pola keuangan mereka.

### 7.2 Contoh Interaksi Chat (Keuangan Pribadi)

```
User: beli bensin 50rb
AI:   ✅ Pengeluaran dicatat!
      💸 Bensin — Rp 50.000
      🏷️  Kategori: Transportasi
      📅  Hari ini: Rp 150.000 pengeluaran
      📊  Transportasi bulan ini: Rp 420.000

---

User: gajian 5 juta
AI:   ✅ Pemasukan dicatat!
      💵 Gaji — Rp 5.000.000
      🏷️  Kategori: Gaji/Upah
      💰  Total pemasukan bulan ini: Rp 5.000.000

---

User: makan siang warteg 15rb sama es teh 5rb
AI:   ✅ Pengeluaran dicatat!
      🍽️  Makan siang — Rp 15.000 (Makanan & Minuman)
      🍹  Es Teh — Rp 5.000 (Makanan & Minuman)
      📊  Makanan hari ini: Rp 47.000

---

User: bayar listrik 250rb
AI:   ✅ Pengeluaran dicatat!
      ⚡  Tagihan Listrik — Rp 250.000
      🏷️  Kategori: Utilitas/Tagihan
      
---

User: sisa budget berapa?
AI:   📊 Budget bulan ini:
      💵 Pemasukan: Rp 5.000.000
      💸 Pengeluaran: Rp 2.340.000
      💰 Sisa: Rp 2.660.000 (53.2%)
      
      Terbesar: Makanan Rp 890.000 (17.8%)

---

User: ringkasan minggu ini
AI:   📅 Minggu ini (Senin–Minggu):
      💸 Total pengeluaran: Rp 645.000
      📈 vs minggu lalu: +12% lebih boros
      
      Top 3 kategori:
      1. Makanan: Rp 280.000
      2. Transportasi: Rp 195.000
      3. Belanja: Rp 120.000
```

### 7.3 Kemampuan Parsing AI (Keuangan Pribadi)

| Input User | Yang Diparsing AI |
|------------|------------------|
| `beli bensin 50rb` | Jenis: Pengeluaran, Nama: Bensin, Nominal: 50.000, Kategori: Transportasi |
| `gajian 5 juta` | Jenis: Pemasukan, Nama: Gaji, Nominal: 5.000.000 |
| `makan 25k` | Jenis: Pengeluaran, Nama: Makan, Nominal: 25.000, Kategori: Makanan |
| `transfer dari mama 200rb` | Jenis: Pemasukan, Nama: Transfer keluarga, Nominal: 200.000 |
| `bayar kos 800rb` | Jenis: Pengeluaran, Nama: Kos/Sewa, Nominal: 800.000, Kategori: Tempat Tinggal |
| `beli baju di shopee 150k` | Jenis: Pengeluaran, Nama: Baju, Nominal: 150.000, Kategori: Belanja |
| `tabung 500rb` | Jenis: Transfer ke Tabungan, Nominal: 500.000 |
| `pengeluaran hari ini berapa` | Query laporan harian |

### 7.4 Kategori Default (Keuangan Pribadi)

**Pengeluaran:**
- Makanan & Minuman
- Transportasi
- Belanja & Fashion
- Kesehatan
- Pendidikan
- Hiburan & Rekreasi
- Tempat Tinggal (kos, listrik, air, internet)
- Tagihan & Utilitas
- Sosial & Hadiah
- Lain-lain

**Pemasukan:**
- Gaji/Upah
- Freelance/Proyek
- Bisnis
- Investasi
- Transfer Keluarga
- Bonus
- Lain-lain

Pengguna dapat membuat kategori custom kapan saja.

### 7.5 Fitur Tambahan Keuangan Pribadi

**Budget Planner:**
- Set budget per kategori per bulan
- Progress bar real-time per kategori
- Notifikasi saat 80% dan 100% budget tercapai

**Tabungan Goals:**
- Buat target tabungan (contoh: "Liburan Bali Rp 3 juta")
- Catat setoran tabungan via chat
- Progress menuju goal
- Estimasi pencapaian berdasarkan rata-rata setoran

**Analisis Keuangan:**
- Tren pengeluaran 3 bulan terakhir
- Kategori terboros
- Hari dalam seminggu paling boros
- Perbandingan bulan ini vs bulan lalu

### 7.6 Dashboard Keuangan Pribadi

**Panel Utama:**
- Saldo bersih bulan ini (pemasukan - pengeluaran)
- Total pemasukan bulan ini
- Total pengeluaran bulan ini
- Progress budget bulanan (gauge chart)
- Grafik pengeluaran 30 hari terakhir

**Panel Transaksi:**
- Timeline semua transaksi (terbaru di atas)
- Filter: semua / pemasukan / pengeluaran / kategori
- Edit / hapus transaksi
- Pencarian transaksi

**Panel Budget:**
- Kartu per kategori dengan progress bar
- Edit budget per kategori
- Sisa budget per kategori

**Panel Goals/Tabungan:**
- Semua target tabungan aktif
- Progress per goal
- Tambah setoran

**Panel Laporan:**
- Pie chart pengeluaran per kategori
- Bar chart tren bulanan
- Ringkasan naratif dari AI
- Export ke PDF / Excel

---

## 8. Fitur Bersama (Shared Features)

### 8.1 Chat Interface (Identik untuk Kedua Mode)

**Elemen Chat:**
- Kolom input teks (sticky di bawah)
- Tombol kirim
- Tombol mikrofon (voice input)
- Bubble chat dari user (kanan, warna berbeda)
- Bubble respons AI (kiri, dengan ikon bot)
- Timestamp per pesan
- Status "AI sedang mengetik..." saat proses

**Fitur Chat:**
- Riwayat chat tersimpan per sesi dan antar sesi
- Pencarian riwayat chat
- Copy teks dari bubble AI
- Hapus transaksi dari bubble (dengan konfirmasi)
- AI menunjukkan preview sebelum menyimpan data (dengan tombol Konfirmasi / Batalkan)

**Contoh Preview Konfirmasi:**
```
AI: Saya akan mencatat:
    ┌─────────────────────────┐
    │ 📦 Indomie × 1          │
    │ 👤 Pelanggan: Akbar      │
    │ 💳 Status: Kasbon        │
    │ 💵 Nominal: Rp 3.500     │
    └─────────────────────────┘
    [✅ Ya, Simpan]  [❌ Batalkan]
```

### 8.2 Koreksi & Edit via Chat

Pengguna dapat mengoreksi transaksi yang baru saja dicatat via chat:

```
User: salah, bukan akbar tapi andi
AI:   ✅ Diperbarui! Pelanggan diubah dari Akbar → Andi

User: hapus transaksi tadi
AI:   ⚠️ Yakin hapus transaksi terakhir?
      Indomie × 1 — Rp 3.500 (Kasbon, Andi)
      [Hapus]  [Batal]
```

### 8.3 Pencarian & Query via Chat

Kedua mode mendukung query informasi via chat:
- "transaksi kemarin apa saja"
- "total bulan April berapa"
- "cari transaksi rokok minggu ini"
- "siapa yang paling banyak kasbon" (POS)
- "apa yang paling banyak aku belanjakan" (Keuangan Pribadi)

### 8.4 Voice Input

- Tekan dan tahan tombol mikrofon untuk merekam
- AI mentranskrip suara ke teks
- Proses parsing sama seperti teks
- Cocok untuk situasi tangan penuh (misal: sedang melayani pelanggan)

### 8.5 Multi-Device Sync

- Data tersinkron real-time antar perangkat
- Login di HP dan tablet secara bersamaan
- Notifikasi push ke semua perangkat aktif

### 8.6 Export Data

- Export ke PDF (format laporan rapi)
- Export ke Excel/CSV (untuk olah data lanjut)
- Pilih rentang tanggal
- Pilih data yang di-export

### 8.7 Pengaturan Akun

- Ganti nama / foto profil
- Ganti nomor HP
- Ganti password
- **Ganti Mode** (POS AI ↔ Keuangan Pribadi) — dengan konfirmasi bahwa data mode lama tidak hilang
- Bahasa (Indonesia / English)
- Tema (Terang / Gelap / Ikuti sistem)
- Hapus akun (dengan konfirmasi berlapis)

---

## 9. Arsitektur AI & Chat Engine

### 9.1 Komponen AI

```
Input User (Teks/Suara)
        ↓
[Intent Classifier]
  - Apakah ini transaksi baru?
  - Apakah ini koreksi?
  - Apakah ini query informasi?
  - Apakah ini manajemen produk/stok?
        ↓
[Entity Extractor]
  - Nama produk / jenis pengeluaran
  - Kuantitas
  - Harga / nominal
  - Nama pelanggan (POS)
  - Tipe transaksi (tunai/kasbon/pemasukan/pengeluaran)
  - Waktu (jika disebutkan: "tadi pagi", "kemarin")
        ↓
[Context Manager]
  - Ingat konteks percakapan terakhir
  - Koreksi mengacu pada transaksi sebelumnya
  - Produk tidak dikenal → tanya ke user
        ↓
[Data Writer]
  - Simpan ke database
  - Update stok (POS)
  - Hitung akumulasi
        ↓
[Response Generator]
  - Buat konfirmasi yang informatif
  - Tambahkan konteks relevan (total, perbandingan)
  - Format mudah dibaca
```

### 9.2 Penanganan Ambiguitas

Ketika AI tidak yakin dengan input, AI akan meminta klarifikasi:

```
User: indome 1
AI:   Untuk siapa dan pembayarannya bagaimana?
      (Contoh: "buat Budi tunai" atau "kasbon Ahmad")

---

User: belanja 100rb
AI:   Belanja untuk apa ini? 
      Atau ketik kategorinya (contoh: "bahan makanan", "baju")
```

### 9.3 Pembelajaran Preferensi

AI secara bertahap mempelajari pola pengguna:
- Nama produk yang sering disingkat ("indome" = Indomie Goreng)
- Pelanggan yang sering bertransaksi (autocomplete nama)
- Pola pengeluaran rutin ("bayar listrik" selalu = Tagihan)
- Alias harga ("seribuan" = Rp 1.000, "gopek" = Rp 500)

### 9.4 Penanganan Produk Baru (POS)

Ketika nama produk tidak ditemukan di database:
```
User: aqua botol 1 tunai
AI:   "Aqua Botol" belum ada di daftar produk kamu.
      Berapa harga jualnya?
      
User: 3500
AI:   ✅ Produk baru ditambahkan: Aqua Botol — Rp 3.500
      Transaksi dicatat:
      Aqua Botol × 1 — Rp 3.500 (Tunai)
      
      Mau set stok awalnya berapa?
      (Ketik angka atau "lewati")
```

---

## 10. Sistem Notifikasi

### 10.1 Jenis Notifikasi (POS AI)

| Trigger | Penerima | Isi Notifikasi |
|---------|----------|----------------|
| Transaksi kasbon baru | Pemilik | "Akbar kasbon Rp 3.500 (Indomie × 1). Total kasbon Akbar: Rp 17.500" |
| Stok hampir habis | Pemilik | "⚠️ Indomie Soto tersisa 5 pcs. Segera restock!" |
| Stok habis | Pemilik | "🔴 Aqua Gelas habis! 0 pcs tersisa." |
| Pelanggan bayar kasbon | Pemilik | "Budi bayar kasbon Rp 20.000. Sisa kasbon: Rp 5.000" |
| Ringkasan harian | Pemilik | Setiap jam 21.00 — ringkasan penjualan hari ini |
| Kasbon belum dibayar > 30 hari | Pemilik | Pengingat kasbon lama |

### 10.2 Jenis Notifikasi (Keuangan Pribadi)

| Trigger | Isi Notifikasi |
|---------|----------------|
| Budget 80% tercapai | "⚠️ Budget Makanan kamu sudah 80%. Tersisa Rp 50.000" |
| Budget habis | "🔴 Budget Transportasi kamu sudah habis bulan ini!" |
| Pengingat harian (jika aktif) | "Sudahkah kamu mencatat pengeluaran hari ini?" |
| Ringkasan mingguan | Setiap Minggu pagi — ringkasan minggu lalu |
| Ringkasan bulanan | Setiap tanggal 1 — laporan bulan kemarin |
| Goal hampir tercapai | "🎯 Kamu hampir mencapai target tabungan Liburan Bali (95%)!" |

### 10.3 Pengaturan Notifikasi

Pengguna dapat mengatur:
- Aktif / nonaktif per jenis notifikasi
- Jam pengiriman notifikasi harian
- Mode senyap (jam-jam tertentu tidak terima notif)
- Channel: Push notification, WhatsApp (integrasi opsional), SMS

---

## 11. Spesifikasi Dashboard

### 11.1 Navigasi Utama

Kedua mode memiliki navigasi bottom tab (mobile) / sidebar (desktop):

```
[Chat]  [Dashboard]  [Laporan]  [Pengaturan]
```

Untuk POS AI, ada tambahan:
```
[Chat]  [Dashboard]  [Produk]  [Kasbon]  [Laporan]  [Pengaturan]
```

### 11.2 Responsive Design

- **Mobile (< 768px):** Bottom navigation, card layout, single column
- **Tablet (768px–1024px):** Side navigation, 2-column grid
- **Desktop (> 1024px):** Full sidebar, multi-column dashboard, tabel lebih lebar

### 11.3 Widget Dashboard (POS AI)

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Penjualan    │ Uang Masuk   │ Transaksi    │ Total Kasbon │
│ Hari Ini     │ Hari Ini     │ Hari Ini     │ Aktif        │
│ Rp 450.000   │ Rp 320.000   │ 47 trx       │ Rp 185.000   │
└──────────────┴──────────────┴──────────────┴──────────────┘
┌──────────────────────────────┬───────────────────────────────┐
│ Grafik Penjualan 7 Hari      │ Produk Hampir Habis            │
│ [Bar Chart]                  │ • Indomie Soto: 5 pcs          │
│                              │ • Aqua Gelas: 3 pcs            │
│                              │ • Rokok Surya: 8 bks           │
└──────────────────────────────┴───────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│ Transaksi Terbaru                                            │
│ ──────────────────────────────────────────────────────────── │
│ 14:32  Akbar — Indomie × 1  Kasbon  Rp 3.500               │
│ 14.28  Budi — Rokok × 2    Tunai   Rp 16.000               │
│ 14.15  Sinta — Bayar hutang         Rp 50.000               │
└──────────────────────────────────────────────────────────────┘
```

### 11.4 Widget Dashboard (Keuangan Pribadi)

```
┌──────────────┬──────────────┬──────────────┐
│ Pemasukan    │ Pengeluaran  │ Saldo Bersih │
│ Bulan Ini    │ Bulan Ini    │              │
│ Rp 5.000.000 │ Rp 2.340.000 │ Rp 2.660.000 │
└──────────────┴──────────────┴──────────────┘
┌──────────────────────────────┬───────────────────────────────┐
│ Progress Budget               │ Pengeluaran per Kategori      │
│ ──────────────────────────── │ [Pie Chart]                   │
│ Makanan    ████░░░ 78%       │                               │
│ Transport  ██░░░░░ 42%       │                               │
│ Belanja    █████░░ 89%       │                               │
│ Utilitas   ██████░ 95% ⚠️   │                               │
└──────────────────────────────┴───────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│ Transaksi Terbaru                                            │
│ ──────────────────────────────────────────────────────────── │
│ 14:30  ↑ Gaji               Pemasukan   Rp 5.000.000        │
│ 13:45  ↓ Makan siang        Makanan     Rp 25.000           │
│ 10:20  ↓ Bensin             Transportasi Rp 50.000          │
└──────────────────────────────────────────────────────────────┘
```

---

## 12. User Stories & Acceptance Criteria

### 12.1 Onboarding

**US-001: Pemilihan Mode Pertama Kali**
> Sebagai pengguna baru, saya ingin memilih antara mode POS AI atau Keuangan Pribadi saat pertama daftar, agar pengalaman aplikasi sesuai kebutuhan saya.

*Acceptance Criteria:*
- AC1: Halaman pemilihan muncul setelah registrasi berhasil
- AC2: Dua pilihan ditampilkan dengan deskripsi jelas dan visual berbeda
- AC3: Pengguna tidak dapat melewati halaman ini
- AC4: Setelah memilih, pengguna diarahkan ke setup yang sesuai
- AC5: Data mode yang dipilih tersimpan di akun

---

### 12.2 POS AI Stories

**US-101: Catat Transaksi via Chat**
> Sebagai pemilik warung, saya ingin mencatat penjualan hanya dengan mengetik pesan, agar saya tidak perlu membuka form panjang.

*Acceptance Criteria:*
- AC1: Sistem memparsing minimal: nama produk, kuantitas, dan tipe bayar
- AC2: Respons AI muncul dalam ≤ 2 detik
- AC3: Data tersimpan ke database secara real-time
- AC4: AI menampilkan konfirmasi yang informatif sebelum menyimpan
- AC5: Pengguna dapat membatalkan sebelum konfirmasi

**US-102: Notifikasi Kasbon**
> Sebagai pemilik warung, saya ingin dapat notifikasi setiap kali ada kasbon, agar saya tidak lupa siapa yang berutang.

*Acceptance Criteria:*
- AC1: Notifikasi push dikirim dalam ≤ 5 detik setelah transaksi kasbon
- AC2: Notifikasi berisi: nama pelanggan, produk, nominal, total kasbon
- AC3: Notifikasi dapat diklik untuk membuka detail kasbon
- AC4: Notifikasi muncul meskipun aplikasi di-background

**US-103: Cek Stok via Chat**
> Sebagai pemilik warung, saya ingin cek stok produk lewat chat, agar tidak perlu pindah ke menu lain.

*Acceptance Criteria:*
- AC1: Query "stok [nama produk]" menampilkan stok terkini
- AC2: Query "stok apa yang habis" menampilkan semua produk dengan stok 0
- AC3: Query "produk hampir habis" menampilkan produk di bawah ambang batas

---

### 12.3 Keuangan Pribadi Stories

**US-201: Catat Pengeluaran via Chat**
> Sebagai pengguna, saya ingin mencatat pengeluaran dengan kalimat singkat, agar pencatatan terasa natural dan cepat.

*Acceptance Criteria:*
- AC1: Sistem mengenali jenis pengeluaran dari teks natural
- AC2: AI mengkategorikan otomatis dengan akurasi ≥ 90%
- AC3: Pengguna dapat mengoreksi kategori jika salah
- AC4: Data tersimpan dengan timestamp yang akurat

**US-202: Pantau Budget**
> Sebagai pengguna, saya ingin tahu sisa budget per kategori kapan saja, agar saya bisa mengontrol pengeluaran.

*Acceptance Criteria:*
- AC1: Chat "sisa budget" menampilkan semua kategori dengan sisa budget
- AC2: Notifikasi dikirim saat budget 80% dan 100% tercapai
- AC3: Dashboard menampilkan progress bar per kategori secara real-time

---

## 13. Desain UI/UX Guidelines

### 13.1 Prinsip Desain

1. **Chat-first:** Interface utama adalah chat. Dashboard adalah pendukung.
2. **Minimal friction:** Input sesedikit mungkin untuk setiap transaksi
3. **Feedback instan:** Setiap aksi mendapat respons visual dalam < 2 detik
4. **Mobile-first:** 80%+ pengguna akan mengakses dari smartphone
5. **Readable data:** Data keuangan harus mudah dibaca sekilas

### 13.2 Color System

**POS AI:**
- Primary: `#1A73E8` (Biru profesional)
- Success: `#34A853` (Hijau untuk transaksi tunai)
- Warning: `#FBBC04` (Kuning untuk kasbon)
- Danger: `#EA4335` (Merah untuk stok habis)
- Background: `#F8F9FA`

**Keuangan Pribadi:**
- Primary: `#6200EE` (Ungu untuk kesan personal)
- Income: `#00897B` (Teal untuk pemasukan)
- Expense: `#E53935` (Merah untuk pengeluaran)
- Neutral: `#78909C`
- Background: `#FAFAFA`

### 13.3 Typography

- **Font:** Inter (web), SF Pro (iOS), Roboto (Android)
- **Heading 1:** 24px, Bold
- **Heading 2:** 18px, SemiBold
- **Body:** 14px, Regular
- **Caption:** 12px, Regular
- **Monospace (angka):** Tabular figures untuk alignment

### 13.4 Chat Bubble Design

**Bubble User:**
- Posisi: kanan
- Background: warna primary mode
- Teks: putih
- Border radius: 16px 16px 4px 16px

**Bubble AI:**
- Posisi: kiri
- Background: putih / abu muda
- Teks: hitam
- Border radius: 16px 16px 16px 4px
- Badge ikon AI di pojok kiri atas

### 13.5 Animasi & Transisi

- Bubble chat masuk: fade + slide up, 200ms
- "AI mengetik": tiga titik animasi
- Dashboard angka berubah: counter animation
- Notifikasi masuk: slide in dari atas, 300ms
- Page transition: 150ms ease-in-out

---

## 14. Persyaratan Non-Fungsional

### 14.1 Performa

| Metrik | Target |
|--------|--------|
| Waktu respons AI | ≤ 2 detik (P95) |
| Waktu load halaman pertama | ≤ 3 detik (3G) |
| Waktu load dashboard | ≤ 1.5 detik |
| API response time | ≤ 500ms (P95) |
| Uptime | ≥ 99.5% per bulan |

### 14.2 Skalabilitas

- Arsitektur mendukung 100.000 pengguna concurrent
- Database dipartisi berdasarkan user ID
- AI endpoint dapat di-scale horizontal
- CDN untuk aset statis

### 14.3 Keamanan

- Enkripsi data at-rest dan in-transit (TLS 1.3)
- Autentikasi dengan JWT + refresh token
- OTP via SMS untuk verifikasi HP
- Rate limiting: 60 request/menit per user
- Data keuangan tidak boleh di-log di server
- Compliance: PDPA (Pelindungan Data Pribadi Indonesia)

### 14.4 Aksesibilitas

- Mendukung screen reader (WCAG 2.1 AA)
- Font size minimum 14px
- Kontras warna ≥ 4.5:1
- Touch target minimum 48×48px

### 14.5 Offline Support

- Mode offline: input transaksi tersimpan lokal, sync saat online
- Indikator status koneksi di UI
- Antrian sync maksimal 500 transaksi offline

---

## 15. Tech Stack & Integrasi

### 15.1 Rekomendasi Tech Stack

**Frontend:**
- Framework: React Native (mobile) + Next.js (web)
- State Management: Zustand / Redux Toolkit
- UI Library: NativeWind / Tailwind CSS

**Backend:**
- Runtime: Node.js (Express / Fastify) atau Go
- Database: PostgreSQL (data utama) + Redis (cache & session)
- AI: OpenAI GPT-4o / Claude API untuk NLP parsing
- Queue: Bull MQ untuk notifikasi async

**Infrastructure:**
- Cloud: AWS / GCP
- Storage: S3 untuk foto produk
- Notifikasi: Firebase Cloud Messaging (FCM)
- Monitoring: Sentry + Datadog

### 15.2 Integrasi Eksternal

| Layanan | Kegunaan | Prioritas |
|---------|----------|-----------|
| OTP Provider (Twilio/Vonage) | Verifikasi nomor HP | Wajib |
| FCM (Firebase) | Push notification | Wajib |
| OpenAI / Anthropic API | NLP parsing transaksi | Wajib |
| WhatsApp Business API | Notifikasi via WA | Opsional (v2) |
| Midtrans / Xendit | Pembayaran subscription | Opsional (v2) |
| Google Drive / Dropbox | Auto backup data | Opsional (v2) |

---

## 16. Roadmap & Prioritas

### Phase 1 — MVP (Bulan 1–2)

**POS AI Core:**
- [x] Registrasi + pemilihan mode
- [x] Chat interface dasar
- [x] Parsing transaksi: produk + kuantitas + tipe bayar
- [x] Manajemen produk (CRUD manual)
- [x] Notifikasi kasbon (push)
- [x] Dashboard: overview harian
- [x] Manajemen kasbon dasar

**Keuangan Pribadi Core:**
- [x] Parsing pengeluaran + pemasukan
- [x] Kategorisasi otomatis
- [x] Dashboard: saldo + transaksi
- [x] Budget sederhana per kategori

### Phase 2 — Enhancement (Bulan 3–4)

- [ ] Voice input
- [ ] Laporan PDF/Excel export
- [ ] Koreksi via chat
- [ ] Stok management + notifikasi hampir habis
- [ ] Goals/Tabungan (Keuangan Pribadi)
- [ ] Multi-device sync
- [ ] Dark mode

### Phase 3 — Growth (Bulan 5–6)

- [ ] WhatsApp notification integration
- [ ] Analisis keuangan lanjutan + insight AI
- [ ] Multi-user / sub-akun (untuk POS AI: kasir kedua)
- [ ] API publik untuk integrasi pihak ketiga
- [ ] Subscription & monetisasi
- [ ] Web version (Next.js)

### Phase 4 — Scale (Bulan 7–12)

- [ ] AI yang belajar dari kebiasaan pengguna
- [ ] Integrasi marketplace / e-commerce
- [ ] Laporan pajak (UMKM)
- [ ] Kalkulator keuntungan otomatis (HPP vs harga jual)
- [ ] Ekspansi bahasa (Jawa, Sunda, Madura)

---

## 17. Risiko & Mitigasi

| Risiko | Probabilitas | Dampak | Mitigasi |
|--------|--------------|--------|----------|
| Akurasi AI parsing rendah | Sedang | Tinggi | Dataset training lokal; fallback konfirmasi user |
| Pengguna salah ketik nama produk | Tinggi | Sedang | Fuzzy matching; autocomplete |
| Biaya API AI terlalu tinggi | Sedang | Sedang | Cache common queries; fine-tune model sendiri |
| Pengguna tidak konsisten catat | Tinggi | Tinggi | Reminder harian; gamifikasi streak |
| Data breach keuangan | Rendah | Tinggi | Enkripsi end-to-end; audit keamanan rutin |
| Ketergantungan satu AI provider | Sedang | Tinggi | Multi-provider fallback (OpenAI + Claude) |
| Adopsi lambat kalangan UMKM | Sedang | Tinggi | Onboarding dipandu; video tutorial singkat |

---

## 18. Metrik Keberhasilan

### 18.1 Metrik Produk

| Metrik | Definisi | Target 3 Bulan |
|--------|----------|----------------|
| DAU | Daily Active Users | 5.000 |
| WAU | Weekly Active Users | 12.000 |
| Retention D7 | User aktif di hari ke-7 | ≥ 55% |
| Transaksi/User/Hari | Rata-rata transaksi per aktif user | ≥ 5 |
| AI Accuracy | % parsing benar tanpa koreksi user | ≥ 93% |
| Onboarding Completion | % user yang selesai setup | ≥ 80% |
| NPS | Net Promoter Score | ≥ 45 |

### 18.2 Metrik Teknis

| Metrik | Target |
|--------|--------|
| API Uptime | ≥ 99.5% |
| AI Response P95 | ≤ 2 detik |
| Crash Rate | ≤ 0.1% sesi |
| Error Rate API | ≤ 0.5% |

### 18.3 Metrik Bisnis (Post-Monetisasi)

- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn Rate bulanan ≤ 5%

---

## 19. Glossary

| Istilah | Definisi |
|---------|----------|
| **Kasbon** | Utang/kredit pelanggan ke pemilik warung; pembeli ambil barang sekarang, bayar nanti |
| **POS** | Point of Sale — sistem pencatatan transaksi penjualan |
| **NLP** | Natural Language Processing — kemampuan AI memahami bahasa manusia |
| **Parsing** | Proses mengurai teks natural menjadi data terstruktur |
| **Entity** | Informasi spesifik yang diekstrak dari teks (nama produk, jumlah, harga) |
| **Intent** | Tujuan dari sebuah pesan (catat transaksi, cek stok, query laporan) |
| **Fuzzy Matching** | Teknik pencarian yang toleran terhadap typo / penulisan berbeda |
| **OTP** | One-Time Password — kode verifikasi sekali pakai |
| **FCM** | Firebase Cloud Messaging — layanan push notification |
| **DAU/WAU/MAU** | Daily/Weekly/Monthly Active Users |
| **NPS** | Net Promoter Score — indikator kepuasan dan loyalitas pengguna |
| **Churn** | Pengguna yang berhenti menggunakan layanan |
| **HPP** | Harga Pokok Penjualan — biaya produksi/beli barang sebelum dijual |
| **UMKM** | Usaha Mikro, Kecil, dan Menengah |

---

*Dokumen ini bersifat living document dan akan diperbarui seiring perkembangan produk.*

*Versi berikutnya: v1.1 — akan mencakup wireframe detail dan spesifikasi API.*

---

**ChatBoard PRD v1.0 — Konfidensial**
