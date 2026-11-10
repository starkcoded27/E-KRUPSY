# Dokumentasi Sistem Informasi E-KRUPSY
**Sistem Informasi Pemesanan dan Produksi Pabrik Kerupuk Diansyah**

Repositori ini berisi implementasi perangkat lunak sistem pemesanan dan produksi berbasis web untuk Pabrik Kerupuk Diansyah yang mengintegrasikan seluruh operasional mulai dari pelanggan hingga jajaran manajemen pabrik.

---

## 📂 Daftar Isi Dokumentasi

1. **[Spesifikasi Kebutuhan Perangkat Lunak - SRS (`SRS_E-KRUPSY.md`)](./SRS_E-KRUPSY.md)**
   Dokumen resmi IEEE 830 / ISO 29148: Definisi kebutuhan fungsional (SKF-01 s/d SKF-35), non-fungsional, matriks keterlacakan peran, aturan bisnis bumbu/plastik, formula finansial pabrik, dan siklus hidup transaksi.
2. **[Deskripsi Perancangan Perangkat Lunak - SDD (`SDD_E-KRUPSY.md`)](./SDD_E-KRUPSY.md)**
   Dokumen resmi IEEE 1016: Arsitektur sistem Next.js 14 + Supabase BaaS, dekomposisi subsistem UI & Core Engines, kontrak REST API endpoints, rancangan fisik 9 tabel database (ERD & PDM), sequence diagram end-to-end, state machine, dan desain cetak resi fisik/laporan A4.
3. [Alur Kerja End-to-End (`workflow-end-to-end.md`)](./workflow-end-to-end.md)
   Penjelasan terperinci alur kerja operasional antar-peran (Pelanggan, Staf Penggoreng, Staf Pembungkus, Owner).
4. [Validasi Input & Kondisi Sistem State (`validasi-dan-state.md`)](./validasi-dan-state.md)
   Implementasi 4 jenis validasi input (Existence, Data Type, Domain, Format) dan 3 kondisi status sistem (Loading, Success, Error).
5. [Spesifikasi Skema Database (`skema-database.md`)](./skema-database.md)
   Struktur 9 tabel di Supabase, kardinalitas relasi, serta akun master.
6. [Panduan Skenario Demo Pengujian (`panduan-demo.md`)](./panduan-demo.md)
   Panduan langkah demi langkah untuk mendemonstrasikan sistem dari awal hingga selesai.

---

## 👥 Aktor & Hak Akses (Role-Based Access Control)

| No | Role | Akun Default | Hak Akses Dashboard |
|---|---|---|---|
| 1 | **Pelanggan** | Registrasi Mandiri | Hanya dapat mengakses Katalog Produk, Keranjang, Pemesanan, dan Status Pesanan Pribadi. **Tidak dapat mengakses dashboard internal**. |
| 2 | **Owner (Pimpinan)** | `owner` / `owner123` | Dashboard Keuangan, Laporan Harian, Konfirmasi Pembayaran Kas, Manajemen Produk & Stok. |
| 3 | **Staf Penggoreng** | `penggoreng` / `goreng123` | Antrean Penggorengan Kerupuk, Update Status Produksi, View Output Monitoring Stok Bahan Baku Dapur. |
| 4 | **Staf Pembungkus** | `pembungkus` / `bungkus123` | Verifikasi Mutu Hasil Goreng (QC), Pengemasan Plastik, Update Status Siap Diambil, Input Stok Plastik. |

---

## 💻 Panduan Menjalankan Sistem

1. Pasang dependensi:
   ```bash
   npm install
   ```
2. Pastikan file `.env.local` terisi kredensial Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://nvalsotusdienxlapbwb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
3. Jalankan server pengembang:
   ```bash
   npm run dev
   ```
4. Buka aplikasi di peramban: `http://localhost:3000`
