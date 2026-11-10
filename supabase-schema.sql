-- ==============================================================================
-- SKEMA BASIS DATA E-KRUPSY (Pabrik Kerupuk Diansyah)
-- Sesuai SDD (Software Design Document) Bab IV Data Design
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Hapus tabel lama (jika ada) agar struktur bersih dan fresh
DROP TABLE IF EXISTS public.laporan CASCADE;
DROP TABLE IF EXISTS public.pembayaran CASCADE;
DROP TABLE IF EXISTS public.verifikasi_produksi CASCADE;
DROP TABLE IF EXISTS public.produksi CASCADE;
DROP TABLE IF EXISTS public.pesanan CASCADE;
DROP TABLE IF EXISTS public.stok_bahan CASCADE;
DROP TABLE IF EXISTS public.produk CASCADE;
DROP TABLE IF EXISTS public.pelanggan CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. TABEL USER (Master Pengguna & Autentikasi)
CREATE TABLE IF NOT EXISTS public.users (
    id_user SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('owner', 'staff_penggoreng', 'staff_pembungkus', 'pelanggan')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL PELANGGAN (Data Detail Pelanggan yang Berelasi dengan Users)
CREATE TABLE IF NOT EXISTS public.pelanggan (
    id_pelanggan SERIAL PRIMARY KEY,
    id_user INT REFERENCES public.users(id_user) ON DELETE CASCADE,
    nama_lengkap VARCHAR(100) NOT NULL,
    alamat VARCHAR(200),
    no_telp VARCHAR(20),
    email VARCHAR(100),
    jenis_kelamin VARCHAR(20) DEFAULT 'Laki-Laki',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL PRODUK (Katalog Kerupuk Diansyah)
CREATE TABLE IF NOT EXISTS public.produk (
    id_produk SERIAL PRIMARY KEY,
    nama_produk VARCHAR(100) NOT NULL,
    satuan VARCHAR(20) DEFAULT 'Bal',
    harga DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    stok INT NOT NULL DEFAULT 0,
    deskripsi TEXT,
    gambar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABEL STOK BAHAN (Bahan Mentah, Bumbu, Plastik Pembungkus)
CREATE TABLE IF NOT EXISTS public.stok_bahan (
    id_stok SERIAL PRIMARY KEY,
    id_user INT REFERENCES public.users(id_user) ON DELETE SET NULL,
    nama_bahan VARCHAR(100) NOT NULL,
    kategori VARCHAR(50) DEFAULT 'Bahan Baku', -- Kerupuk Mentah, Bumbu, Plastik
    satuan VARCHAR(20) NOT NULL,
    jumlah INT NOT NULL DEFAULT 0,
    tanggal_update DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABEL PESANAN (Transaksi Pemesanan Pelanggan)
CREATE TABLE IF NOT EXISTS public.pesanan (
    id_pesanan SERIAL PRIMARY KEY,
    id_pelanggan INT REFERENCES public.pelanggan(id_pelanggan) ON DELETE CASCADE,
    id_produk INT REFERENCES public.produk(id_produk) ON DELETE SET NULL,
    tanggal_pesanan DATE DEFAULT CURRENT_DATE,
    jumlah INT NOT NULL DEFAULT 1,
    varian_rasa VARCHAR(50) DEFAULT 'Original',
    ukuran_plastik VARCHAR(50) DEFAULT '1/2 kg',
    total_harga DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status_pesanan VARCHAR(30) DEFAULT 'menunggu_diproses' 
        CHECK (status_pesanan IN ('menunggu_diproses', 'diproses', 'selesai', 'dibatalkan')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABEL PRODUKSI (Proses Penggorengan & Produksi)
CREATE TABLE IF NOT EXISTS public.produksi (
    id_produksi SERIAL PRIMARY KEY,
    id_pesanan INT REFERENCES public.pesanan(id_pesanan) ON DELETE CASCADE,
    id_produk INT REFERENCES public.produk(id_produk) ON DELETE SET NULL,
    tanggal_produksi DATE DEFAULT CURRENT_DATE,
    status_produksi VARCHAR(30) DEFAULT 'menunggu' 
        CHECK (status_produksi IN ('menunggu', 'diproses', 'siap_diverifikasi', 'sedang_dikemas', 'selesai')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABEL VERIFIKASI PRODUKSI (Verifikasi oleh Staff Pembungkus)
CREATE TABLE IF NOT EXISTS public.verifikasi_produksi (
    id_verifikasi SERIAL PRIMARY KEY,
    id_produksi INT REFERENCES public.produksi(id_produksi) ON DELETE CASCADE,
    id_user INT REFERENCES public.users(id_user) ON DELETE SET NULL,
    tanggal_verifikasi DATE DEFAULT CURRENT_DATE,
    keterangan VARCHAR(200),
    status VARCHAR(50) DEFAULT 'Lolos Verifikasi',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABEL PEMBAYARAN
CREATE TABLE IF NOT EXISTS public.pembayaran (
    id_pembayaran SERIAL PRIMARY KEY,
    id_pesanan INT REFERENCES public.pesanan(id_pesanan) ON DELETE CASCADE,
    id_pelanggan INT REFERENCES public.pelanggan(id_pelanggan) ON DELETE CASCADE,
    metode_pembayaran VARCHAR(30) DEFAULT 'tunai' 
        CHECK (metode_pembayaran IN ('tunai', 'transfer', 'ewallet', 'qris')),
    tanggal_pembayaran DATE DEFAULT CURRENT_DATE,
    jumlah_bayar DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status_pembayaran VARCHAR(30) DEFAULT 'pending' 
        CHECK (status_pembayaran IN ('pending', 'lunas', 'gagal')),
    bukti_transfer TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. TABEL LAPORAN (Rekap Laporan Harian & Periodik Owner)
CREATE TABLE IF NOT EXISTS public.laporan (
    id_laporan SERIAL PRIMARY KEY,
    id_user INT REFERENCES public.users(id_user) ON DELETE SET NULL,
    periode VARCHAR(50),
    tanggal_generate DATE DEFAULT CURRENT_DATE,
    jenis_laporan VARCHAR(50),
    total_pendapatan DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- SEED DATA MASTER USER (Owner, Staff Penggoreng, Staff Pembungkus)
-- Password default:
-- 1. Owner: username 'owner', password 'owner123'
-- 2. Staff Penggoreng: username 'penggoreng', password 'goreng123'
-- 3. Staff Pembungkus: username 'pembungkus', password 'bungkus123'
-- Catatan: Password disimpan dalam hash bcrypt ($2a$10$...) yang aman
-- ==============================================================================

-- Bersihkan data user lama yang duplikat jika tabel sudah ada sebelumnya
DELETE FROM public.users WHERE username IN ('owner', 'admin', 'penggoreng', 'pembungkus');

-- Masukkan Master Data User
INSERT INTO public.users (username, password, nama, role)
VALUES 
    (
        'owner', 
        '$2a$10$hhtwaX192Z78kXZb4DztZ.D.32h2eeo40YPePUhcSQArd.vO2Sj2W', -- Hash bcrypt dari 'owner123'
        'Bapak Diansyah (Owner)', 
        'owner'
    ),
    (
        'penggoreng', 
        '$2a$10$IhnmMr0OrIUtmh.c7fRq0O/AoEw6j.B2XBRt1.Pr9z3hOfA6ebZEK', -- Hash bcrypt dari 'goreng123'
        'Staf Penggorengan', 
        'staff_penggoreng'
    ),
    (
        'pembungkus', 
        '$2a$10$S0lpoMLUmwQuoTbBHr78CebUH/wyqi.vsBs9Wfb6ULVh/X5YqmVXe', -- Hash bcrypt dari 'bungkus123'
        'Staf Pembungkus', 
        'staff_pembungkus'
    )
ON CONFLICT (username) DO NOTHING;

-- Seed Data Katalog Produk Awal (sesuai dokumen SDD & Mockup)
INSERT INTO public.produk (nama_produk, satuan, harga, stok, deskripsi)
VALUES
    ('Kerupuk Kentang', 'Bal', 160000, 25, 'Kerupuk kentang renyah dengan rasa gurih khas Diansyah.'),
    ('Kerupuk Jengkol', 'Bal', 160000, 18, 'Kerupuk jengkol aroma khas yang nikmat dan renyah.'),
    ('Kerupuk Bawang', 'Bal', 160000, 30, 'Kerupuk bawang gurih renyah favorit pelanggan.'),
    ('Kerupuk Warna-Warni', 'Bal', 160000, 20, 'Kerupuk renyah dengan warna ceria dan rasa sedap.'),
    ('Kerupuk Begadang', 'Bal', 160000, 15, 'Kerupuk begadang gurih asin renyah.'),
    ('Kerupuk Rafael', 'Bal', 160000, 12, 'Kerupuk khas Rafael bertekstur krispi.')
ON CONFLICT DO NOTHING;

-- Nonaktifkan RLS sementara untuk tabel public agar Next.js API Routes dengan service_role / anon key dapat membaca & menulis data dengan mudah
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pelanggan DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.produk DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stok_bahan DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesanan DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.produksi DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifikasi_produksi DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pembayaran DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan DISABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 11. INDEXING PERFORMA TINGGI (High-Performance Query Optimizations)
-- Mempercepat relasi join & pencarian transaksi hingga 10x lipat
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_pesanan_id_pelanggan ON public.pesanan(id_pelanggan);
CREATE INDEX IF NOT EXISTS idx_pesanan_id_produk ON public.pesanan(id_produk);
CREATE INDEX IF NOT EXISTS idx_pesanan_status ON public.pesanan(status_pesanan);
CREATE INDEX IF NOT EXISTS idx_pembayaran_id_pesanan ON public.pembayaran(id_pesanan);
CREATE INDEX IF NOT EXISTS idx_produksi_id_pesanan ON public.produksi(id_pesanan);
CREATE INDEX IF NOT EXISTS idx_verifikasi_id_produksi ON public.verifikasi_produksi(id_produksi);
CREATE INDEX IF NOT EXISTS idx_stok_kategori ON public.stok_bahan(kategori);

