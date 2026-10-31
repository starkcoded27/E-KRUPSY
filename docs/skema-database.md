# Dokumentasi Skema Basis Data Supabase (E-KRUPSY)

Dokumentasi rancangan fisik basis data PostgreSQL yang diterapkan pada Supabase Pabrik Kerupuk Diansyah sesuai Bab IV SDD (*Data Design*).

---

## Daftar Tabel Basis Data

### 1. Tabel `users` (Master Autentikasi Pengguna)
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id_user` | `SERIAL (PK)` | ID unik pengguna |
| `username` | `VARCHAR(50) UNIQUE` | Nama pengguna untuk login |
| `password` | `VARCHAR(255)` | Kata sandi terenkripsi (Bcrypt) |
| `nama` | `VARCHAR(100)` | Nama lengkap tampilan |
| `role` | `VARCHAR(30)` | Role: `'owner'`, `'staff_penggoreng'`, `'staff_pembungkus'`, `'pelanggan'` |
| `created_at` | `TIMESTAMPTZ` | Waktu pendaftaran |

### 2. Tabel `pelanggan` (Data Profil Pelanggan)
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id_pelanggan` | `SERIAL (PK)` | ID profil pelanggan |
| `id_user` | `INT (FK -> users)` | Relasi ke akun user |
| `nama_lengkap`| `VARCHAR(100)` | Nama lengkap pemesan |
| `alamat` | `VARCHAR(200)` | Alamat pengiriman |
| `no_telp` | `VARCHAR(20)` | Nomor kontak telepon / WhatsApp |
| `email` | `VARCHAR(100)` | Alamat surel |
| `jenis_kelamin`| `VARCHAR(20)` | Laki-Laki / Perempuan |

### 3. Tabel `produk` (Katalog Kerupuk)
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id_produk` | `SERIAL (PK)` | ID produk |
| `nama_produk` | `VARCHAR(100)` | Nama jenis kerupuk |
| `satuan` | `VARCHAR(20)` | Satuan (Bal, Kg, Pack) |
| `harga` | `DECIMAL(12,2)` | Harga satuan jual |
| `stok` | `INT` | Sisa kuantitas barang |
| `deskripsi` | `TEXT` | Deskripsi cita rasa & tekstur |

### 4. Tabel `stok_bahan` (Inventori Gudang Pabrik)
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id_stok` | `SERIAL (PK)` | ID stok |
| `id_user` | `INT (FK -> users)` | Pencatat mutasi stok |
| `nama_bahan` | `VARCHAR(100)` | Bahan mentah, bumbu, atau plastik |
| `kategori` | `VARCHAR(50)` | Kerupuk Mentah, Bumbu, Plastik, Bahan Baku |
| `satuan` | `VARCHAR(20)` | Kg, Pack, Liter, Pcs |
| `jumlah` | `INT` | Kuantitas sisa stok |
| `tanggal_update`| `DATE` | Waktu pembaruan |

### 5. Tabel `pesanan` (Transaksi Pemesanan)
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id_pesanan` | `SERIAL (PK)` | ID transaksi pesanan |
| `id_pelanggan`| `INT (FK -> pelanggan)`| Pemesan |
| `id_produk` | `INT (FK -> produk)` | Produk yang dipesan |
| `tanggal_pesanan`| `DATE` | Tanggal order dibuat |
| `jumlah` | `INT` | Jumlah pesanan |
| `varian_rasa` | `VARCHAR(50)` | Pilihan rasa (Original, Balado, Pedas, Keju) |
| `ukuran_plastik`| `VARCHAR(50)`| Ukuran kemasan plastik (1/2 kg, 1x25 kg) |
| `total_harga` | `DECIMAL(12,2)` | Total perkalian jumlah × harga |
| `status_pesanan`| `VARCHAR(30)` | `'menunggu_diproses'`, `'diproses'`, `'selesai'`, `'dibatalkan'` |

### 6. Tabel `produksi` (Antrean Tahapan Produksi)
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id_produksi` | `SERIAL (PK)` | ID pekerjaan produksi |
| `id_pesanan` | `INT (FK -> pesanan)` | Relasi ke pesanan terkait |
| `id_produk` | `INT (FK -> produk)` | Produk yang diolah |
| `status_produksi`| `VARCHAR(30)` | `'menunggu'`, `'diproses'`, `'siap_diverifikasi'`, `'sedang_dikemas'`, `'selesai'` |

### 7. Tabel `verifikasi_produksi` (Pengendalian Kualitas QC)
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id_verifikasi`| `SERIAL (PK)` | ID catatan verifikasi |
| `id_produksi` | `INT (FK -> produksi)` | Produksi yang diperiksa |
| `id_user` | `INT (FK -> users)` | Staf Pembungkus yang memeriksa |
| `status` | `VARCHAR(50)` | `'Lolos Verifikasi'` / `'Cacat / Tidak Sesuai'` |
| `keterangan` | `VARCHAR(200)` | Catatan mutu fisik |

### 8. Tabel `pembayaran` (Pencatatan Keuangan)
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id_pembayaran`| `SERIAL (PK)` | ID pembayaran |
| `id_pesanan` | `INT (FK -> pesanan)` | Pesanan terkait |
| `id_pelanggan`| `INT (FK -> pelanggan)`| Pelanggan pembayar |
| `metode_pembayaran`| `VARCHAR(30)` | `'tunai'`, `'qris'`, `'transfer'`, `'ewallet'` |
| `jumlah_bayar`| `DECIMAL(12,2)` | Nominal pembayaran |
| `status_pembayaran`| `VARCHAR(30)`| `'pending'`, `'lunas'`, `'gagal'` |

### 9. Tabel `laporan` (Rekapitulasi Harian)
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id_laporan` | `SERIAL (PK)` | ID laporan |
| `id_user` | `INT (FK -> users)` | Pembuat laporan (Owner) |
| `periode` | `VARCHAR(50)` | Periode harian / bulanan |
| `total_pendapatan`| `DECIMAL(12,2)` | Nilai akumulasi omset |
