export interface ProduksiItem {
  id_produksi: number;
  id_pesanan: number;
  id_produk: number;
  tanggal_produksi: string;
  status_produksi: string;
  pesanan?: {
    id_pesanan: number;
    jumlah: number;
    varian_rasa: string;
    ukuran_plastik: string;
    status_pesanan: string;
    pelanggan?: {
      nama_lengkap: string;
      no_telp: string;
    };
  };
  produk?: {
    nama_produk: string;
    satuan: string;
  };
  verifikasi?: {
    id_verifikasi: number;
    status: string;
    keterangan: string;
  }[];
}

export interface StokItem {
  id_stok: number;
  nama_bahan: string;
  kategori: string;
  satuan: string;
  jumlah: number;
  tanggal_update: string;
}
