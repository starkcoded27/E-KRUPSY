/**
 * Logika dan Master Tarif Harga Pabrik Kerupuk Diansyah
 * Mencakup Harga Tambahan Bumbu / Varian Rasa & Ukuran Kemasan Plastik
 * Sesuai matriks harga resmi dari Owner
 */

// Tarif Tambahan Bumbu / Varian Rasa (per Bal)
export const HARGA_BUMBU: Record<string, number> = {
  'Balado Manis Pedas': 40000,
  'Balado': 40000,
  'Keju Asin Gurih': 36000,
  'Keju': 36000,
  'Original Gurih': 50000,
  'Original': 50000,
  'Pedas Level 5': 50000,
  'Pedas': 50000,
};

// Tarif Tambahan Kemasan Plastik (per Bal)
export const HARGA_PLASTIK: Record<string, number> = {
  '1/2 kg': 34000,
  '1 1/2 kg': 34000,
  '1x25 kg': 34000,
  '11x25 kg': 34000,
  '30x45 kg': 34000,
  '12x22 kg': 34000,
  '12x23 kg': 34000,
  '12x25 kg': 34000,
};

// Daftar Opsi Kemasan Plastik Standar Pabrik
export const DAFTAR_PLASTIK_OPTIONS = [
  { id: '1/2 kg', label: 'Kemasan Plastik 1/2 kg', harga: 34000 },
  { id: '1x25 kg', label: 'Kemasan Plastik 1x25 kg', harga: 34000 },
  { id: '30x45 kg', label: 'Kemasan Karung 30x45 kg', harga: 34000 },
  { id: '12x22 kg', label: 'Kemasan Plastik 12x22 kg', harga: 34000 },
  { id: '12x25 kg', label: 'Kemasan Plastik 12x25 kg', harga: 34000 },
];

// Daftar Opsi Varian Rasa Standar Pabrik (Menggunakan Nama Lengkap Resmi)
export const DAFTAR_VARIAN_OPTIONS = [
  { id: 'Original Gurih', label: 'Original Gurih', harga: 50000 },
  { id: 'Balado Manis Pedas', label: 'Balado Manis Pedas', harga: 40000 },
  { id: 'Pedas Level 5', label: 'Pedas Level 5', harga: 50000 },
  { id: 'Keju Asin Gurih', label: 'Keju Asin Gurih', harga: 36000 },
];

/**
 * Normalisasi format varian rasa ke nama lengkap resmi (misal: "Balado" -> "Balado Manis Pedas")
 */
export function formatVarianRasa(varian?: string): string {
  if (!varian) return 'Original Gurih';
  const clean = varian.trim().toLowerCase();
  if (clean === 'balado' || clean.includes('balado')) return 'Balado Manis Pedas';
  if (clean === 'pedas' || clean.includes('pedas')) return 'Pedas Level 5';
  if (clean === 'keju' || clean.includes('keju')) return 'Keju Asin Gurih';
  if (clean === 'original' || clean.includes('original')) return 'Original Gurih';
  return varian;
}

/**
 * Mengambil harga tambahan bumbu berdasarkan nama varian rasa
 */
export function getHargaBumbu(varian: string): number {
  if (!varian) return 0;
  const clean = varian.trim().toLowerCase();

  // Pencocokan langsung tepat (Exact match)
  for (const [key, val] of Object.entries(HARGA_BUMBU)) {
    if (clean === key.toLowerCase()) {
      return val;
    }
  }

  // Prioritas kata kunci: "Balado" harus dicek sebelum "Pedas"
  // karena "Balado Manis Pedas" mengandung kata "pedas"
  if (clean.includes('balado')) return 40000;
  if (clean.includes('keju')) return 36000;
  if (clean.includes('pedas')) return 50000;
  if (clean.includes('original')) return 50000;

  return 0;
}

/**
 * Mengambil harga tambahan plastik berdasarkan ukuran kemasan
 */
export function getHargaPlastik(ukuran: string): number {
  if (!ukuran) return 34000;
  const clean = ukuran.replace(/^(Plastik|Kemasan|Ukuran)\s*/i, '').trim().toLowerCase();
  for (const [key, val] of Object.entries(HARGA_PLASTIK)) {
    if (clean === key.toLowerCase() || clean.includes(key.toLowerCase())) {
      return val;
    }
  }
  return 34000;
}

/**
 * Menghitung rincian & total gabungan harga pesanan:
 * Total = (Harga Kerupuk + Harga Bumbu + Harga Plastik) * Qty
 */
export function hitungTotalPesanan(
  hargaKerupukSatuan: number,
  varianRasa: string,
  ukuranPlastik: string,
  jumlahQty: number
) {
  const hargaKerupuk = Number(hargaKerupukSatuan) || 0;
  const hargaBumbu = getHargaBumbu(varianRasa);
  const hargaPlastik = getHargaPlastik(ukuranPlastik);
  const hargaPerBal = hargaKerupuk + hargaBumbu + hargaPlastik;
  const qty = Math.max(1, Number(jumlahQty) || 1);
  const totalHarga = hargaPerBal * qty;

  return {
    hargaKerupukSatuan: hargaKerupuk,
    hargaBumbuSatuan: hargaBumbu,
    hargaPlastikSatuan: hargaPlastik,
    hargaPerBal,
    qty,
    totalKerupuk: hargaKerupuk * qty,
    totalBumbu: hargaBumbu * qty,
    totalPlastik: hargaPlastik * qty,
    totalHarga,
  };
}

// Rekening Resmi Transfer Bank Pabrik Kerupuk Diansyah
export interface RekeningBank {
  id: string;
  bank: string;
  nomor: string;
  pemilik: string;
}

export const DAFTAR_REKENING_BANK: RekeningBank[] = [
  { id: 'bca', bank: 'Bank BCA', nomor: '7405136830', pemilik: 'Anita Nurhayati' },
  { id: 'mandiri', bank: 'Bank Mandiri', nomor: '1320023382287', pemilik: 'Diansiah Hidayat' },
  { id: 'bjb', bank: 'Bank BJB', nomor: '0139544684100', pemilik: 'Diansiah Hidayat' },
];

// Tipe data untuk pesanan gabungan dari Keranjang Belanja (Cart Batch Order)
export interface CartOrderItem {
  id_produk: number;
  nama_produk: string;
  jumlah: number;
  satuan?: string;
  varian_rasa: string;
  ukuran_plastik: string;
  harga_satuan?: number;
  harga_per_bal?: number;
  subtotal: number;
}

export interface CartBatchMetadata {
  is_cart: boolean;
  items: CartOrderItem[];
  type?: string;
  ref_id?: string;
  paid_at?: string;
  amount?: number;
  image?: string;
  bank_tujuan?: string;
  catatan?: string;
  uploaded_at?: string;
  merchant?: string;
  account_owner?: string;
  customer_name?: string;
  qris_image?: string;
}

/**
 * Parsing metadata keranjang dari kolom bukti_transfer
 */
export function parseCartOrderMeta(buktiTransfer?: string | null): CartBatchMetadata | null {
  if (!buktiTransfer) return null;
  try {
    const parsed = typeof buktiTransfer === 'string' ? JSON.parse(buktiTransfer) : buktiTransfer;
    if (parsed && (parsed.is_cart || Array.isArray(parsed.items))) {
      return parsed;
    }
  } catch {
    // not valid json
  }
  return null;
}

/**
 * Mengambil URL/Base64 gambar bukti transfer dari nilai string atau JSON metadata
 */
export function getTransferImageSrc(raw?: string | null): string | null {
  if (!raw) return null;
  const str = String(raw).trim();
  if (str.startsWith('data:') || str.startsWith('http') || str.startsWith('/')) {
    return str;
  }
  try {
    const parsed = JSON.parse(str);
    if (parsed && typeof parsed.image === 'string') {
      return parsed.image;
    }
  } catch {
    // not json
  }
  return str;
}
