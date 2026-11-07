/**
 * Logika dan Master Tarif Harga Pabrik Kerupuk Diansyah
 * Mencakup Harga Tambahan Bumbu / Varian Rasa & Ukuran Kemasan Plastik
 * Sesuai matriks harga resmi dari Owner
 */

// Tarif Tambahan Bumbu / Varian Rasa (per Bal)
export const HARGA_BUMBU: Record<string, number> = {
  Original: 50000,
  Pedas: 50000,
  Balado: 40000,
  Keju: 36000,
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

// Daftar Opsi Varian Rasa Standar Pabrik
export const DAFTAR_VARIAN_OPTIONS = [
  { id: 'Original', label: 'Original Gurih', harga: 50000 },
  { id: 'Balado', label: 'Balado Manis Pedas', harga: 40000 },
  { id: 'Pedas', label: 'Pedas Level 5', harga: 50000 },
  { id: 'Keju', label: 'Keju Asin Gurih', harga: 36000 },
];

/**
 * Mengambil harga tambahan bumbu berdasarkan nama varian rasa
 */
export function getHargaBumbu(varian: string): number {
  if (!varian) return 0;
  const clean = varian.trim().toLowerCase();
  for (const [key, val] of Object.entries(HARGA_BUMBU)) {
    if (clean.includes(key.toLowerCase())) {
      return val;
    }
  }
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
