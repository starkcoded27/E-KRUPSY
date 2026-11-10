# Dokumentasi Terpusat API Route E-KRUPSY (Pabrik Kerupuk Diansyah)

Dokumen ini merupakan panduan referensi lengkap seluruh endpoint API backend pada sistem **E-KRUPSY** (Next.js 14 App Router + Supabase PostgreSQL). 

Semua route API berada di direktori `app/api/` dan mengikuti standar RESTful dengan server-side in-memory caching untuk endpoint yang sering diakses.

---

## Daftar Isi
1. [Ringkasan Arsitektur & Autentikasi](#1-ringkasan-arsitektur--autentikasi)
2. [Modul Autentikasi (`/api/auth`)](#2-modul-autentikasi-apiauth)
   - [POST `/api/auth/login`](#post-apiauthlogin)
   - [POST `/api/auth/logout`](#post-apiauthlogout)
   - [GET `/api/auth/me`](#get-apiauthme)
   - [POST `/api/auth/register`](#post-apiauthregister)
3. [Modul Pesanan (`/api/pesanan`)](#3-modul-pesanan-apipesanan)
   - [GET `/api/pesanan`](#get-apipesanan)
   - [POST `/api/pesanan`](#post-apipesanan)
   - [GET `/api/pesanan/[id]`](#get-apipesananid)
   - [PATCH/PUT `/api/pesanan/[id]`](#patchput-apipesananid)
   - [DELETE `/api/pesanan/[id]`](#delete-apipesananid)
4. [Modul Katalog Produk (`/api/produk`)](#4-modul-katalog-produk-apiproduk)
   - [GET `/api/produk`](#get-apiproduk)
   - [POST `/api/produk`](#post-apiproduk)
   - [PATCH/PUT `/api/produk`](#patchput-apiproduk)
   - [DELETE `/api/produk`](#delete-apiproduk)
5. [Modul Produksi Pabrik (`/api/produksi`)](#5-modul-produksi-pabrik-apiproduksi)
   - [GET `/api/produksi`](#get-apiproduksi)
   - [PATCH `/api/produksi`](#patch-apiproduksi)
6. [Modul Stok & Bahan Baku (`/api/stok`)](#6-modul-stok--bahan-baku-apistok)
   - [GET `/api/stok`](#get-apistok)
   - [PATCH `/api/stok`](#patch-apistok)
7. [Modul Verifikasi Mutu / QC (`/api/verifikasi`)](#7-modul-verifikasi-mutu--qc-apiverifikasi)
   - [POST `/api/verifikasi`](#post-apiverifikasi)
8. [Modul Laporan & Analisis Bisnis (`/api/laporan`)](#8-modul-laporan--analisis-bisnis-apilaporan)
   - [GET `/api/laporan`](#get-apilaporan)
9. [Modul Health Check & Koneksi (`/api/supabase/status`)](#9-modul-health-check--koneksi-apisupabasestatus)
   - [GET `/api/supabase/status`](#get-apisupabasestatus)

---

## 1. Ringkasan Arsitektur & Autentikasi

- **Base URL Dev:** `http://localhost:3000`
- **Database:** Supabase PostgreSQL melalui Supabase Server Client Singleton (`lib/supabase.ts`).
- **Autentikasi:** Berbasis cookie session HTTP-only bernama `session_user`.
- **Role Pengguna:**
  - `owner`: Pemilik pabrik (akses penuh ke keuangan, ACC pembayaran, stok utama, katalog, rekap produksi).
  - `staff_penggoreng`: Staf wajan (antrean penggorengan, pemantauan bahan mentah & bumbu).
  - `staff_pembungkus`: Staf pengemasan & QC (verifikasi kelayakan, timbangan, input stok plastik, status dikemas).
  - `pelanggan`: Pelanggan (katalog, keranjang belanja, checkout multi-item, riwayat pesanan, upload bukti bayar, cetak invoice).
- **Performa & Caching:** Menggunakan server-side in-memory cache (`lib/api-cache.ts`) dengan TTL 15–30 detik dan invalidasi otomatis saat terjadi mutasi data.

---

## 2. Modul Autentikasi (`/api/auth`)

### POST `/api/auth/login`
Memverifikasi kredensial email dan kata sandi menggunakan `bcryptjs`, lalu membuat cookie sesi `session_user`.

- **Method:** `POST`
- **Request Body (JSON):**
  ```json
  {
    "email": "owner@ekrupsy.com",
    "password": "password123"
  }
  ```
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login berhasil.",
    "user": {
      "id_user": 1,
      "nama": "Pak Diansyah",
      "email": "owner@ekrupsy.com",
      "role": "owner"
    }
  }
  ```
- **Response Error (401 Unauthorized):**
  ```json
  {
    "success": false,
    "message": "Email atau kata sandi tidak cocok."
  }
  ```

---

### POST `/api/auth/logout`
Menghapus cookie sesi `session_user` dari browser client.

- **Method:** `POST`
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Berhasil logout."
  }
  ```

---

### GET `/api/auth/me`
Mengambil data profil pengguna yang saat ini sedang aktif dari cookie sesi.

- **Method:** `GET`
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id_user": 1,
      "nama": "Pak Diansyah",
      "email": "owner@ekrupsy.com",
      "role": "owner"
    }
  }
  ```
- **Response Error (401 Unauthorized):**
  ```json
  {
    "success": false,
    "user": null
  }
  ```

---

### POST `/api/auth/register`
Mendaftarkan pelanggan baru dan membuat record di tabel `users` serta profil di tabel `pelanggan`.

- **Method:** `POST`
- **Request Body (JSON):**
  ```json
  {
    "nama_lengkap": "Budi Santoso",
    "email": "budi@example.com",
    "password": "password123",
    "no_telp": "081234567890",
    "alamat": "Jl. Mawar No. 12, Bandung",
    "jenis_kelamin": "Laki-laki"
  }
  ```
- **Response Success (201 Created):**
  ```json
  {
    "success": true,
    "message": "Pendaftaran akun berhasil! Silakan login."
  }
  ```

---

## 3. Modul Pesanan (`/api/pesanan`)

### GET `/api/pesanan`
Mengambil daftar seluruh pesanan. Mendukung pemfilteran berdasarkan ID pelanggan, status pesanan, atau pencarian.

- **Method:** `GET`
- **Query Parameters:**
  - `id_pelanggan` *(opsional)*: ID pelanggan untuk membatasi hasil ke pelanggan tersebut.
  - `status` *(opsional)*: Filter status (`menunggu`, `diproses`, `siap_dikirim`, `selesai`, `dibatalkan`).
  - `search` *(opsional)*: Kata kunci nama produk atau nama pelanggan.
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id_pesanan": 101,
        "tanggal_pesanan": "2026-11-08",
        "jumlah": 2,
        "varian_rasa": "Balado Manis Pedas",
        "ukuran_plastik": "Ukuran 1 Bal (5 Kg)",
        "total_harga": 320000,
        "status_pesanan": "menunggu",
        "produk": { "nama_produk": "Kerupuk Bawang Super", "satuan": "Bal" },
        "pelanggan": { "nama_lengkap": "Budi Santoso", "no_telp": "081234567890" },
        "pembayaran": [{ "id_pembayaran": 50, "metode_pembayaran": "Transfer Bank", "status_pembayaran": "menunggu_konfirmasi" }],
        "produksi": [{ "id_produksi": 42, "status_produksi": "menunggu" }]
      }
    ]
  }
  ```

---

### POST `/api/pesanan`
Membuat pesanan baru (mendukung single order maupun multi-item keranjang belanja). Sistem secara otomatis:
1. Memvalidasi ketersediaan stok bahan mentah.
2. Mengurangi stok bahan baku dan plastik sesuai pesanan.
3. Menormalkan varian rasa ke nama lengkap (contoh: *Balado Manis Pedas*).
4. Membuat record pembayaran dengan status awal (`menunggu_konfirmasi` atau `lunas`).
5. Membuat antrean di tabel `produksi` dengan status `menunggu`.
6. Menginvalidasi cache laporan dan pesanan.

- **Method:** `POST`
- **Request Body Multi-Item (Checkout Keranjang):**
  ```json
  {
    "id_pelanggan": 5,
    "metode_pembayaran": "Transfer Bank",
    "catatan": "Kirim sore hari",
    "items": [
      {
        "id_produk": 1,
        "jumlah": 2,
        "varian_rasa": "Balado Manis Pedas",
        "ukuran_plastik": "Ukuran 1 Bal (5 Kg)",
        "total_harga": 320000
      }
    ]
  }
  ```
- **Response Success (201 Created):**
  ```json
  {
    "success": true,
    "message": "Pesanan berhasil dibuat!",
    "id_pesanan": 102
  }
  ```

---

### GET `/api/pesanan/[id]`
Mengambil informasi lengkap satu pesanan berdasarkan ID.

- **Method:** `GET`
- **URL Param:** `id` (integer)
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "data": { "id_pesanan": 102, ... }
  }
  ```

---

### PATCH/PUT `/api/pesanan/[id]`
Memperbarui status pesanan, mengonfirmasi pelunasan, mengunggah bukti transfer, atau membatalkan pesanan.

#### 1. Pembatalan Pesanan oleh Pelanggan (`action: "cancel"`)
- Menandai `status_pesanan: "dibatalkan"`.
- Menandai `pembayaran.status_pembayaran: "gagal"`.
- **Menghapus baris dari tabel `produksi`** sehingga tidak muncul di antrean penggorengan dan pembungkusan.
- **Mengembalikan kuota stok** (kerupuk mentah, bumbu, plastik) ke tabel `stok`.
- Menginvalidasi cache.
- **Request Body:**
  ```json
  {
    "action": "cancel",
    "alasan": "Ingin mengubah varian rasa"
  }
  ```

#### 2. Konfirmasi Pembayaran oleh Owner (`action: "confirm_payment"`)
- Menandai `pembayaran.status_pembayaran: "lunas"`.
- **Request Body:**
  ```json
  {
    "action": "confirm_payment"
  }
  ```

#### 3. Upload Bukti Transfer oleh Pelanggan (`action: "upload_proof"`)
- Menyimpan bukti screenshot base64 atau URL.
- **Request Body:**
  ```json
  {
    "action": "upload_proof",
    "bukti_transfer": "data:image/jpeg;base64,..."
  }
  ```

---

### DELETE `/api/pesanan/[id]`
Menghapus data pesanan dari sistem (hanya dapat dilakukan oleh Owner atau untuk data pengujian).

- **Method:** `DELETE`
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Pesanan berhasil dihapus."
  }
  ```

---

## 4. Modul Katalog Produk (`/api/produk`)

### GET `/api/produk`
Mengambil seluruh katalog produk kerupuk beserta jumlah total pesanan tiap produk. Dilengkapi in-memory cache berkecepatan tinggi (<10ms).

- **Method:** `GET`
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id_produk": 1,
        "nama_produk": "Kerupuk Bawang Super",
        "satuan": "Bal",
        "harga": 160000,
        "stok": 50,
        "deskripsi": "Kerupuk bawang renyah gurih khas Diansyah",
        "gambar_url": "/images/bawang.jpg",
        "terjual": 120
      }
    ]
  }
  ```

---

### POST `/api/produk`
Menambahkan varian produk baru ke dalam katalog (khusus Owner).

- **Method:** `POST`
- **Request Body (JSON):**
  ```json
  {
    "nama_produk": "Kerupuk Mawar Pedas Gurih",
    "satuan": "Bal",
    "harga": 165000,
    "stok": 30,
    "deskripsi": "Kerupuk mawar bentuk bunga dengan taburan bumbu pedas istimewa.",
    "gambar_url": "data:image/jpeg;base64,..."
  }
  ```

---

### PATCH/PUT `/api/produk`
Mengedit nama, harga, stok, deskripsi, atau foto produk.

- **Method:** `PATCH`
- **Request Body (JSON):**
  ```json
  {
    "action": "edit",
    "id_produk": 1,
    "nama_produk": "Kerupuk Bawang Super Premium",
    "satuan": "Bal",
    "harga": 165000,
    "deskripsi": "Deskripsi diperbarui...",
    "gambar_url": "data:image/jpeg;base64,..."
  }
  ```

---

### DELETE `/api/produk`
Menghapus produk dari katalog jika belum pernah memiliki riwayat transaksi aktif.

- **Method:** `DELETE`
- **Query Parameter:** `?id_produk=1`

---

## 5. Modul Produksi Pabrik (`/api/produksi`)

### GET `/api/produksi`
Mengambil seluruh antrean produksi pabrik yang aktif (secara otomatis memfilter pesanan yang berstatus `dibatalkan`).

- **Method:** `GET`
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id_produksi": 15,
        "id_pesanan": 101,
        "status_produksi": "diproses",
        "tanggal_produksi": "2026-11-08",
        "pesanan": {
          "id_pesanan": 101,
          "jumlah": 2,
          "varian_rasa": "Balado Manis Pedas",
          "ukuran_plastik": "Ukuran 1 Bal (5 Kg)",
          "status_pesanan": "diproses",
          "pelanggan": { "nama_lengkap": "Budi Santoso", "no_telp": "081234567890" }
        },
        "produk": { "nama_produk": "Kerupuk Bawang Super", "satuan": "Bal" },
        "verifikasi": []
      }
    ]
  }
  ```

---

### PATCH `/api/produksi`
Memperbarui tahapan status produksi pesanan:
- `diproses`: Staf Penggoreng sedang menggoreng di wajan.
- `siap_diverifikasi`: Selesai digoreng, dikirim ke meja QC Staf Pembungkus.
- `sedang_dikemas`: Telah lolos verifikasi QC dan sedang dimasukkan ke plastik kemasan.
- `selesai`: Pengemasan tuntas, produk siap dikirim ke pelanggan. Otomatis mengubah `pesanan.status_pesanan` menjadi `siap_dikirim`.

- **Method:** `PATCH`
- **Request Body (JSON):**
  ```json
  {
    "id_produksi": 15,
    "id_pesanan": 101,
    "next_status": "siap_diverifikasi"
  }
  ```

---

## 6. Modul Stok & Bahan Baku (`/api/stok`)

### GET `/api/stok`
Mengambil daftar stok bahan baku wajan (kerupuk mentah, minyak, bumbu balado, dll.) dan kemasan plastik.

- **Method:** `GET`
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      { "id_stok": 1, "nama_bahan": "Kerupuk Bawang Mentah", "kategori": "Kerupuk Mentah", "jumlah": 150, "satuan": "Kg" },
      { "id_stok": 4, "nama_bahan": "Plastik Ukuran 1 Bal", "kategori": "Plastik", "jumlah": 80, "satuan": "Pcs" }
    ]
  }
  ```

---

### PATCH `/api/stok`
Menambah atau memperbarui jumlah stok fisik bahan baku / plastik (Restock).

- **Method:** `PATCH`
- **Request Body (JSON):**
  ```json
  {
    "id_stok": 1,
    "jumlah_tambah": 50
  }
  ```

---

## 7. Modul Verifikasi Mutu / QC (`/api/verifikasi`)

### POST `/api/verifikasi`
Digunakan oleh Staf Pembungkus untuk mencatat hasil uji petik mutu kerupuk (kerenyahan, rasa merata, timbangan).

- **Method:** `POST`
- **Request Body (JSON):**
  ```json
  {
    "id_produksi": 15,
    "id_user": 3,
    "status": "Lolos Verifikasi",
    "keterangan": "Kerenyahan sempurna, bumbu merata, dan timbangan sesuai 5 Kg."
  }
  ```
- **Efek Sistem:**
  - Jika `status === "Lolos Verifikasi"`, status produksi otomatis berganti ke `sedang_dikemas`.
  - Jika `status === "Cacat / Tidak Sesuai"`, Staf Penggoreng menerima notifikasi untuk melakukan penggorengan ulang (*Goreng Ulang*).

---

## 8. Modul Laporan & Analisis Bisnis (`/api/laporan`)

### GET `/api/laporan`
Menghasilkan metrik bisnis komprehensif untuk Dashboard Owner:
- `totalOmset`: Total nilai seluruh pesanan aktif.
- `totalKasMasuk`: Total uang dari pesanan berstatus `lunas`.
- `totalPiutang`: Total uang pesanan yang belum dilunasi.
- `estimasiHPP`: Perhitungan HPP bahan baku (~65%).
- `estimasiKeuntungan`: Omset dikurangi HPP.
- `chartData`: Data grafik tren penjualan harian, mingguan, bulanan, tahunan.
- `produkBreakdown`: Rekap kuantiti terjual per varian kerupuk.
- `rekapMetode`: Persentase pembayaran (Transfer vs QRIS vs Tunai).

- **Method:** `GET`
- **In-Memory Cache:** 30 detik (otomatis diperbarui saat terjadi transaksi baru).

---

## 9. Modul Health Check & Koneksi (`/api/supabase/status`)

### GET `/api/supabase/status`
Memeriksa kesehatan koneksi aplikasi ke server Supabase PostgreSQL.

- **Method:** `GET`
- **Response Success (200 OK):**
  ```json
  {
    "status": "connected",
    "latency_ms": 18,
    "timestamp": "2026-11-09T01:00:00.000Z"
  }
  ```

---

> Dokumen ini diperbarui secara berkala sesuai dengan evolusi skema database dan penambahan fitur pada platform E-KRUPSY.
