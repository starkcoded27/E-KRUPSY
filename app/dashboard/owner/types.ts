import { ChartData } from '@/lib/chart-data';

export interface OrderItem {
  id_pesanan: number;
  tanggal_pesanan: string;
  created_at?: string;
  jumlah: number;
  total_harga: number;
  status_pesanan: string;
  varian_rasa: string;
  ukuran_plastik: string;
  produk?: {
    nama_produk: string;
    satuan: string;
  };
  pelanggan?: {
    nama_lengkap: string;
    no_telp: string;
  };
  pembayaran?: {
    id_pembayaran: number;
    metode_pembayaran: string;
    status_pembayaran: string;
    jumlah_bayar: number;
    bukti_transfer?: string | null;
    tanggal_pembayaran?: string;
  }[];
  produksi?: {
    id_produksi: number;
    status_produksi: string;
    verifikasi?: {
      id_verifikasi: number;
      status: string;
    }[];
  }[];
}

export interface PelangganItem {
  id_pelanggan: number;
  id_user: number;
  nama_lengkap: string;
  alamat: string;
  no_telp: string;
  email: string;
  jenis_kelamin: string;
  created_at: string;
}

export interface ProdukCatalogItem {
  id_produk: number;
  nama_produk: string;
  satuan: string;
  harga: number;
  stok: number;
  deskripsi?: string;
  gambar_url?: string;
  terjual?: number;
}

export interface StokBahanItem {
  id_stok: number;
  id_user?: number | null;
  nama_bahan: string;
  kategori: string; // 'Kerupuk Mentah' | 'Bumbu' | 'Plastik'
  satuan: string;   // 'Kg' | 'Pack' | 'Bal' | 'Pcs' | 'Bungkus'
  jumlah: number;
  tanggal_update: string;
  created_at?: string;
}

export interface LaporanData {
  totalOmset: number;
  totalKasMasuk: number;
  totalPiutang: number;
  estimasiHPP: number;
  estimasiKeuntungan: number;
  totalTransaksi: number;
  totalSelesai: number;
  totalProses: number;
  orders: OrderItem[];
  pelangganList?: PelangganItem[];
  produkList?: ProdukCatalogItem[];
  rekapMetode?: Record<string, { count: number; total: number; lunas: number }>;
  produkBreakdown?: { nama: string; satuan: string; jumlah: number; total: number }[];
  stockList?: StokBahanItem[];
  chartData?: ChartData;
}
