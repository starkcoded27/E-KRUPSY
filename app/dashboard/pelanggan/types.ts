export interface Produk {
  id_produk: number;
  nama_produk: string;
  satuan: string;
  harga: number;
  stok: number;
  deskripsi: string;
  gambar_url?: string;
  terjual?: number;
}

export interface CartItem {
  cart_id: string;
  produk: Produk;
  jumlah: number;
  varian_rasa: string;
  ukuran_plastik: string;
  harga_per_bal: number;
  total_harga: number;
}

export interface Pesanan {
  id_pesanan: number;
  id_pelanggan: number;
  id_produk: number;
  tanggal_pesanan: string;
  created_at?: string;
  jumlah: number;
  varian_rasa: string;
  ukuran_plastik: string;
  total_harga: number;
  status_pesanan: string;
  catatan?: string;
  produk?: Produk;
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
      keterangan: string;
    }[];
  }[];
}
