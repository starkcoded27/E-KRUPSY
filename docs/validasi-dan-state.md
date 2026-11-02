# Dokumentasi Validasi Input & Kondisi Sistem (State)

Dokumen ini menjelaskan implementasi teknis dari **Empat Jenis Validasi Input** dan **Tiga Kondisi Sistem (State)** yang diterapkan di seluruh formulir dan aksi sistem E-KRUPSY.

---

## 1. Empat Jenis Validasi Input

Modul validasi terpusat diimplementasikan pada file [`lib/validation.ts`](file:///C:/Users/User/OneDrive/Documents/E-KRUPSY/lib/validation.ts). Setiap formulir (Registrasi, Pemesanan, Input Stok, Verifikasi QC, dan Tambah Produk) menerapkan keempat validasi berikut:

### A. Existence Check (Pemeriksaan Keberadaan Data)
* **Tujuan**: Memastikan kolom-kolom wajib (*mandatory*) tidak dibiarkan kosong oleh pengguna.
* **Contoh Penerapan**:
  * Form Registrasi: Nama Lengkap, Username, Email, Password, No. Telepon, dan Alamat tidak boleh kosong.
  * Form Pemesanan: Jumlah pesanan dan metode pembayaran wajib dipilih.
  * Form Verifikasi: Catatan pemeriksaan mutu wajib diisi.
* **Pesan Error**: `"[Nama Kolom] wajib diisi dan tidak boleh kosong."`

### B. Data Type Check (Pemeriksaan Tipe Data)
* **Tujuan**: Memastikan data yang diinput sesuai tipe data yang diharapkan (angka integer, nomor telepon, string).
* **Contoh Penerapan**:
  * Jumlah pesanan harus berupa bilangan bulat (*integer*), tidak boleh berupa huruf atau pecahan desimal (`1.5`).
  * Nomor telepon harus berupa rangkaian digit angka.
  * Harga jual harus berupa angka numerik.
* **Pesan Error**: `"[Nama Kolom] harus berupa angka yang valid."`

### C. Domain Check (Pemeriksaan Batas Domain / Nilai yang Diizinkan)
* **Tujuan**: Memastikan nilai yang dimasukkan berada dalam batas logika operasional yang sah.
* **Contoh Penerapan**:
  * Jumlah pesanan kerupuk harus bernilai minimal `1` (tidak boleh `0` atau minus) dan tidak boleh melebihi sisa stok di database.
  * Varian rasa harus termasuk dalam domain pilihan: `['Original', 'Balado', 'Pedas', 'Keju']`.
  * Metode pembayaran harus termasuk dalam: `['tunai', 'qris', 'transfer', 'ewallet']`.
  * Status kelayakan QC harus: `['Lolos Verifikasi', 'Cacat / Tidak Sesuai']`.
* **Pesan Error**: `"[Nama Kolom] minimal harus bernilai 1."` atau `"Stok produk tidak mencukupi."`

### D. Format Check (Pemeriksaan Format Data)
* **Tujuan**: Memastikan struktur data mengikuti pola standar (*regex*).
* **Contoh Penerapan**:
  * Email pelanggan harus mengikuti format RFC email valid: `nama@domain.com`.
  * Nomor telepon harus mengikuti format nomor Indonesia (`08...` atau `+62...`) dengan panjang 10–15 digit.
  * Password minimal 6 karakter.
* **Pesan Error**: `"[Nama Kolom] tidak valid. Format harus sesuai (contoh: user@domain.com)."`

---

## 2. Tiga Kondisi Sistem (State)

Setiap proses pengiriman data dan pembaruan status di sistem E-KRUPSY menangani tiga kondisi status antarmuka:

### 1. Kondisi Loading (`type = 'loading'`)
* Ditampilkan saat permintaan sedang dikirim ke backend API dan Supabase.
* Tombol aksi otomatis di-nonaktifkan (*disabled*) untuk mencegah pengiriman ganda (*double submit*).
* Ikon pemrosesan berputar (*spinner*) muncul disertai teks keterangan:
  * *"Sedang memproses pesanan ke database Supabase..."*
  * *"Menyimpan data stok ke Supabase..."*
  * *"Memeriksa hak akses sistem..."*

### 2. Kondisi Success (`type = 'success'`)
* Ditampilkan dalam kartu alert berwarna hijau (*emerald*) dengan ikon centang `CheckCircle2` ketika database berhasil memproses data.
* Contoh pesan:
  * *"Pesanan berhasil ditambahkan! Data otomatis masuk antrean produksi pabrik."*
  * *"Produksi berhasil diverifikasi dan siap dibungkus/dikemas!"*
  * *"Pembayaran tunai berhasil dikonfirmasi dan status berubah menjadi Lunas."*

### 3. Kondisi Error (`type = 'error'`)
* Ditampilkan dalam kartu alert berwarna merah dengan ikon `AlertCircle` jika terjadi kesalahan validasi atau kegagalan koneksi database.
* Menampilkan informasi spesifik bagian apa yang salah sehingga pengguna tahu cara memperbaikinya dalam **Bahasa Indonesia penuh** (menonaktifkan default browser tooltip bahasa Inggris dengan atribut `noValidate`).
* Validasi khusus Nomor HP pada Form Registrasi:
  * Memblokir pengetikan karakter non-digit secara langsung pada level UI (`onKeyDown` & sanitizer regex).
  * Validasi backend mewajibkan nomor telepon integer-only (`/^[0-9]+$/`) dan panjang 9-15 digit.
* Contoh pesan:
  * *"Username tidak boleh kosong, harap isi username Anda."*
  * *"Nomor HP harus berupa angka (integer), tidak boleh mengandung huruf atau simbol."*
  * *"Stok produk Kerupuk Kentang tidak mencukupi. Sisa stok: 5 Bal."*
  * *"Password minimal harus 6 karakter."*
  * *"Username atau password salah."*

---

## 3. Pembaruan Data Real-Time Tanpa Refresh Halaman (Live Background Polling)

Untuk menjamin kelancaran workflow antar-peran tanpa perlu melakukan *refresh* atau *reload* manual di peramban (F5):
1. **Background Polling Senyap (Silent Fetching)**: Setiap dashboard (`/dashboard/pelanggan`, `/dashboard/staff-penggoreng`, `/dashboard/staff-pembungkus`, `/dashboard/owner`) memiliki mekanisme pemanggilan berkala (interval 2.5 detik) yang berjalan di latar belakang tanpa memicu spinner layar penuh.
2. **Sinkronisasi Antar-Role**:
   * Saat **Pelanggan** membuat pesanan baru, pesanan langsung muncul seketika di dashboard **Staff Penggoreng** dan **Owner**.
   * Saat **Staff Penggoreng** menyelesaikan penggorengan, kerupuk langsung muncul di antrean verifikasi QC **Staff Pembungkus**.
   * Saat **Staff Pembungkus** mencatat hasil QC Lolos dan mengemas produk, status pesanan di dashboard **Pelanggan** otomatis berubah menjadi *"3. Sedang Dibungkus / Dikemas"* lalu *"4. Siap Diambil / Selesai"*.
   * Saat **Owner** mengklik tombol **"ACC LUNAS"**, status pembayaran di dashboard **Pelanggan** langsung berganti dari *"Belum Lunas"* menjadi *"SUDAH LUNAS"* dan total kas masuk pada Laporan Keuangan Owner otomatis bertambah seketika.
