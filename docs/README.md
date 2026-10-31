# Dokumentasi Sistem Informasi E-KRUPSY
**Sistem Informasi Pemesanan dan Produksi Pabrik Kerupuk Diansyah**

Repositori ini berisi implementasi perangkat lunak sistem pemesanan dan produksi berbasis web untuk Pabrik Kerupuk Diansyah yang mengintegrasikan seluruh operasional mulai dari pelanggan hingga jajaran manajemen pabrik.

---

## 📂 Daftar Isi Dokumentasi

1. [Alur Kerja End-to-End (`workflow-end-to-end.md`)](./workflow-end-to-end.md)
   Penjelasan terperinci alur kerja operasional antar-peran (Pelanggan, Staf Penggoreng, Staf Pembungkus, Owner).
2. [Validasi Input & Kondisi Sistem State (`validasi-dan-state.md`)](./validasi-dan-state.md)
   Implementasi 4 jenis validasi input (Existence, Data Type, Domain, Format) dan 3 kondisi status sistem (Loading, Success, Error).
3. [Spesifikasi Skema Database (`skema-database.md`)](./skema-database.md)
   Struktur 9 tabel di Supabase, kardinalitas relasi, serta akun master.
4. [Panduan Skenario Demo Pengujian (`panduan-demo.md`)](./panduan-demo.md)
   Panduan langkah demi langkah untuk mendemonstrasikan sistem dari awal hingga selesai.

---

## 👥 Aktor & Hak Akses (Role-Based Access Control)

| No | Role | Akun Default | Hak Akses Dashboard |
|---|---|---|---|
| 1 | **Pelanggan** | Registrasi Mandiri | Hanya dapat mengakses Katalog Produk, Keranjang, Pemesanan, dan Status Pesanan Pribadi. **Tidak dapat mengakses dashboard internal**. |
| 2 | **Owner (Pimpinan)** | `owner` / `owner123` | Dashboard Keuangan, Laporan Harian, Konfirmasi Pembayaran Kas, Manajemen Produk & Stok. |
| 3 | **Staf Penggoreng** | `penggoreng` / `goreng123` | Antrean Penggorengan Kerupuk, Update Status Produksi, Input Stok Bahan Baku & Bumbu. |
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
