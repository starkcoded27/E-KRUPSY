# E-KRUPSY
**Sistem Informasi Pemesanan dan Manajemen Produksi Kerupuk Berbasis Web**  
*Studi Kasus: Pabrik Kerupuk Diansyah — Sumedang, Jawa Barat*

---

## 📄 Dokumen Spesifikasi Rekayasa Perangkat Lunak

Sistem ini didokumentasikan secara formal sesuai standar rekayasa perangkat lunak internasional:

1. **[Software Requirements Specification (SRS)](./docs/SRS_E-KRUPSY.md)**  
   *Standar IEEE Std 830-1998 / ISO/IEC/IEEE 29148.*  
   Mendefinisikan 35 Kebutuhan Fungsional (SKF-01 s/d SKF-35), kebutuhan non-fungsional, karakteristik 4 aktor (*Role-Based Access Control*), aturan bisnis tarif bumbu & kemasan plastik, formula finansial laba rugi pabrik (~70% HPP, ~30% Laba Bersih), dan siklus hidup transaksi.

2. **[Software Design Description (SDD)](./docs/SDD_E-KRUPSY.md)**  
   *Standar IEEE Std 1016-2009.*  
   Mendefinisikan arsitektur sistem Next.js 14 App Router + Supabase BaaS, dekomposisi subsistem UI & Core Engines, spesifikasi REST API Endpoints, rancangan basis data fisik 9 tabel relasional (ERD & PDM), sequence diagram end-to-end, state machine diagram, dan format cetak dokumen fisik A4.

3. **[Direktori Dokumentasi Lengkap](./docs/README.md)**  
   Panduan alur kerja (*Workflow End-to-End*), validasi input 4 lapis & kondisi state, skema basis data, dan skenario demo pengujian sistem.

---

## 👥 Aktor & Hak Akses (RBAC)

1. **Pelanggan**: Katalog kerupuk, keranjang belanja multi-varian, pemesanan langsung/batch, pembayaran Tunai/QRIS/Transfer, tracking produksi live, pembatalan pesanan mandiri, dan Tanda Lunas Digital (Digital Pass).
2. **Owner (Pimpinan Pabrik)**: Otorisasi kas masuk ("ACC Lunas"), cetak kuitansi resi fisik resmi A4, manajemen katalog & restock gudang, pemantauan pesanan dibatalkan + kontak WhatsApp, serta laporan laba rugi pabrik.
3. **Staf Penggoreng**: Antrean wajan penggorengan, penanda waktu jam masuk pesanan (WIB), update status penggorengan, monitoring stok dapur, dan transparansi feedback mutu QC.
4. **Staf Pembungkus**: Antrean uji petik kelayakan mutu (QC Lolos/Cacat + catatan kerenyahan), pengemasan plastik sesuai pesanan pemesan, dan penyelesaian akhir pesanan ("Siap Diambil").

---

## 🚀 Panduan Menjalankan Sistem

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server pengembang lokal
npm run dev

# 3. Buka di peramban
http://localhost:3000
```
