# Panduan Skenario Demo Pengujian Sistem E-KRUPSY

Panduan ini disusun untuk memudahkan demonstrasi sistem secara menyeluruh (*end-to-end*) di hadapan penguji, dosen, atau tim evaluator.

---

## Persiapan Sebelum Demo

1. Jalankan aplikasi:
   ```bash
   npm run dev
   ```
2. Buka peramban di `http://localhost:3000`.
3. Pastikan indikator **"Database Supabase: Terhubung"** muncul di halaman Login.

---

## Skenario Uji 1: Pembuktian 4 Jenis Validasi Input & 3 Kondisi State

### Langkah Uji:
1. Buka halaman registrasi: `http://localhost:3000/register`.
2. **Uji 1 (Existence Check)**:
   * Kosongkan kolom Nama Lengkap atau Password, lalu klik **"Selesai & Daftar Akun"**.
   * *Hasil*: Muncul pesan error merah: `"Harap lengkapi semua data wajib pada formulir pendaftaran."`
3. **Uji 2 (Data Type & Format Check)**:
   * Masukkan email tanpa format yang benar (misal: `anita123` tanpa `@` dan `.com`).
   * *Hasil*: Sistem menolak dengan pesan format email tidak valid.
4. **Uji 3 (Domain Check)**:
   * Masukkan password kurang dari 6 karakter (misal: `12345`).
   * *Hasil*: Muncul pesan: `"Password minimal harus 6 karakter."`
5. **Uji 4 (Kondisi State: Loading & Success)**:
   * Isi semua data dengan benar lalu submit.
   * *Hasil*: Tombol berubah menjadi *Loading* dengan teks `"Mendaftarkan Akun..."`, kemudian muncul banner hijau *Success* `"Pendaftaran berhasil! Akun Anda telah tersimpan di Supabase"`, dan otomatis dialihkan ke halaman Login.

---

## Skenario Uji 2: Pembuktian Hak Akses (Role-Based Access Control)

### Langkah Uji:
1. Login menggunakan akun pelanggan yang baru dibuat.
2. Pelanggan otomatis masuk ke `/dashboard/pelanggan`.
3. **Uji Penolakan Hak Akses**:
   * Ketikkan secara manual di URL browser: `http://localhost:3000/dashboard/owner` atau `http://localhost:3000/dashboard/staff-penggoreng`.
   * *Hasil*: Sistem **memblokir akses** dan menampilkan layar merah peringatan:
     > **"Akses Ditolak: Halaman ini hanya dapat diakses oleh Owner / Staf Penggoreng. Pelanggan hanya dapat mengakses Dashboard Pelanggan."**
   * Disediakan tombol satu-klik untuk kembali ke dashboard pelanggan yang sah.

---

## Skenario Uji 3: Workflow Operasional End-to-End

### 1. Pelanggan Melakukan Pemesanan:
* Di `/dashboard/pelanggan`, pilih **Kerupuk Kentang** &rarr; klik **"Pesan Sekarang"**.
* Ubah varian rasa menjadi **"Balado Manis Pedas"**, kemasan **"1/2 kg"**, jumlah **"2 Bal"**.
* Pilih metode pembayaran **"Tunai (Cash)"** &rarr; klik **"Kirim Pesanan"**.
* *Hasil*: State Loading &rarr; Success! Pesanan masuk ke tab **"Pesanan Saya"** dengan status awal: **"1. Menunggu Diproses"**.

### 2. Staf Penggoreng Memproses Produksi:
* Logout, lalu login sebagai `penggoreng` (password: `goreng123`).
* Di dashboard `/dashboard/staff-penggoreng`, pesanan tadi muncul di daftar antrean.
* Klik tombol **"Mulai Goreng"** &rarr; status berubah menjadi **"Sedang Digoreng"**.
* Setelah selesai, klik tombol **"Selesai Goreng (Kirim ke QC)"** &rarr; status berubah menjadi **"Siap Diverifikasi"**.

### 3. Staf Pembungkus Melakukan Verifikasi QC & Pengemasan:
* Logout, lalu login sebagai `pembungkus` (password: `bungkus123`).
* Di dashboard `/dashboard/staff-pembungkus`, kerupuk tadi muncul di daftar siap diverifikasi.
* Klik **"Verifikasi Kualitas (QC)"** &rarr; pilih *"Lolos Verifikasi"* & masukkan catatan kerenyahan &rarr; klik Simpan.
* Kartu pesanan otomatis menampilkan feedback yang dicatat dan beralih status menjadi **"3. Sedang Dibungkus / Dikemas"**.
* Staf penggoreng di dashboardnya juga dapat melihat feedback hasil verifikasi mutu dari staf pembungkus ini secara transparan!
* Setelah selesai dibungkus rapi, staf pembungkus menekan tombol **"Selesai Kemas (Siap Diambil)"** &rarr; status produksi & pesanan selesai!

### 4. Owner Memantau Transaksi, Konfirmasi Lunas & Cetak Resi Fisik:
* Logout, lalu login sebagai `owner` (password: `owner123`).
* Di dashboard `/dashboard/owner`:
  * Terlihat omset dan laba bertambah secara real-time dari data Supabase.
  * Pada baris transaksi pesanan pelanggan, terlihat status pembayaran **"PENDING (BELUM LUNAS)"**.
  * Klik tombol hijau **"Konfirmasi Lunas"** saat kas tunai diterima dari pelanggan.
  * Status pembayaran langsung terverifikasi menjadi **"✓ LUNAS"**.
  * Muncul tombol **"Cetak Resi Pelanggan"** &rarr; Owner dapat mencetak resi resmi fisik via printer/PDF untuk diserahkan kepada pelanggan.

### 5. Pelanggan Memeriksa Status Pembayaran & Menunjukkan Tanda Lunas (Digital Pass):
* Login kembali sebagai pelanggan.
* Di tab **"Pesanan Saya"**:
  * **Jika Belum Lunas**: Muncul banner peringatan kuning *"STATUS PEMBAYARAN: BELUM LUNAS"* dan tombol resi **TIDAK MUNCUL**, agar pelanggan membayar terlebih dahulu di kasir pabrik.
  * **Jika Sudah Lunas**: Muncul banner hijau *"STATUS PEMBAYARAN: SUDAH LUNAS (TERVERIFIKASI OWNER)"* dan tombol **"Tunjukkan Tanda Lunas ke Owner"**.
  * Saat diklik, muncul **Digital Pass / Tanda Lunas Sah** lengkap dengan stempel digital lunas untuk ditunjukkan ke Owner/Kasir saat mengambil kerupuk (tanpa tombol cetak mandiri oleh pelanggan).

### 6. Owner Memeriksa & Mencetak Laporan Keuangan di Akhir Dashboard:
* Di bagian bawah dashboard `/dashboard/owner`, terdapat bagian komprehensif **Laporan Keuangan & Rekapitulasi Kas Pabrik**.
* Menampilkan ringkasan neraca kas dan laba rugi:
  * Total Omset Penjualan (Gross Revenue)
  * Realisasi Kas Diterima (Lunas Di-ACC)
  * Piutang Pelanggan (Pending)
  * Estimasi Biaya HPP & Operasional (~70%)
  * Estimasi Laba Bersih Pabrik (~30%)
* Menampilkan rincian penerimaan kas per saluran (Tunai, QRIS, Transfer) serta kontribusi omset per varian kerupuk.
* Klik tombol **"Cetak Laporan Keuangan (PDF / Print)"** &rarr; Muncul dokumen resmi A4 lengkap dengan kop Pabrik Kerupuk Diansyah dan tanda tangan Owner yang siap dicetak/diekspor ke PDF.
