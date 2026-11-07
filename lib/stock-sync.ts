import { SupabaseClient } from '@supabase/supabase-js';

// Rasio Konversi Pabrik Kerupuk Diansyah (Make-To-Order / Goreng Dadakan):
// 1 Bal kerupuk matang mekar membutuhkan 5 Kg kerupuk mentah.
export const KG_PER_BAL = 5;

/**
 * Konversi nama produk siap jual (Katalog Owner) ke nama bahan mentah (Dapur Penggoreng)
 * Contoh: "Kerupuk Kentang" -> "Kerupuk Mentah Kentang"
 *         "Makaroni" -> "Makaroni Mentah"
 */
export function productToBahanName(namaProduk: string): string {
  const clean = String(namaProduk || '').trim();
  if (!clean) return '';
  if (clean.toLowerCase().startsWith('kerupuk mentah ')) return clean;
  if (clean.toLowerCase().startsWith('kerupuk ')) {
    return `Kerupuk Mentah ${clean.slice(8).trim()}`;
  }
  if (clean.toLowerCase() === 'makaroni') return 'Makaroni Mentah';
  if (clean.toLowerCase().endsWith(' mentah')) return clean;
  return `${clean} Mentah`;
}

/**
 * Konversi nama bahan mentah (Dapur Penggoreng) ke nama produk siap jual (Katalog Owner)
 * Contoh: "Kerupuk Mentah Kentang" -> "Kerupuk Kentang"
 *         "Makaroni Mentah" -> "Makaroni"
 */
export function bahanToProductName(namaBahan: string): string {
  const clean = String(namaBahan || '').trim();
  if (!clean) return '';
  if (clean.toLowerCase().startsWith('kerupuk mentah ')) {
    return `Kerupuk ${clean.slice(15).trim()}`;
  }
  if (clean.toLowerCase() === 'makaroni mentah') return 'Makaroni';
  if (clean.toLowerCase().endsWith(' mentah')) {
    return clean.slice(0, -7).trim();
  }
  return clean;
}

/**
 * Sinkronisasi pemotongan stok bahan mentah saat pelanggan memesan kerupuk goreng dadakan
 */
export async function deductRawMaterialOnOrder(
  supabase: SupabaseClient,
  namaProduk: string,
  qtyBal: number
) {
  try {
    const bahanName = productToBahanName(namaProduk);
    const kgNeeded = Number(qtyBal) * KG_PER_BAL;

    const { data: rawItem } = await supabase
      .from('stok_bahan')
      .select('id_stok, jumlah')
      .ilike('nama_bahan', bahanName)
      .maybeSingle();

    if (rawItem) {
      const newJumlah = Math.max(0, (rawItem.jumlah || 0) - kgNeeded);
      await supabase
        .from('stok_bahan')
        .update({
          jumlah: newJumlah,
          tanggal_update: new Date().toISOString().split('T')[0],
        })
        .eq('id_stok', rawItem.id_stok);
      console.log(`[STOK SYNC] Potong ${kgNeeded} Kg ${bahanName} untuk order ${qtyBal} Bal. Sisa: ${newJumlah} Kg.`);
    }
  } catch (err) {
    console.error('[STOK SYNC ERROR] Gagal potong stok mentah:', err);
  }
}

/**
 * Sinkronisasi pengembalian stok bahan mentah saat pesanan dibatalkan
 */
export async function refundRawMaterialOnCancel(
  supabase: SupabaseClient,
  namaProduk: string,
  qtyBal: number
) {
  try {
    const bahanName = productToBahanName(namaProduk);
    const kgRefund = Number(qtyBal) * KG_PER_BAL;

    const { data: rawItem } = await supabase
      .from('stok_bahan')
      .select('id_stok, jumlah')
      .ilike('nama_bahan', bahanName)
      .maybeSingle();

    if (rawItem) {
      const newJumlah = (rawItem.jumlah || 0) + kgRefund;
      await supabase
        .from('stok_bahan')
        .update({
          jumlah: newJumlah,
          tanggal_update: new Date().toISOString().split('T')[0],
        })
        .eq('id_stok', rawItem.id_stok);
      console.log(`[STOK SYNC] Kembalikan ${kgRefund} Kg ${bahanName}. Sisa: ${newJumlah} Kg.`);
    }
  } catch (err) {
    console.error('[STOK SYNC ERROR] Gagal refund stok mentah:', err);
  }
}

/**
 * Sinkronisasi saat supplier mengirim bahan mentah ke Staf Penggoreng -> Update stok produk katalog Owner
 */
export async function syncRawMaterialToProductCatalog(
  supabase: SupabaseClient,
  namaBahan: string,
  additionalKg: number
) {
  try {
    const prodName = bahanToProductName(namaBahan);
    const balAddition = Math.floor(Number(additionalKg) / KG_PER_BAL);

    if (balAddition <= 0) return;

    // Cari produk di katalog
    const { data: prodItems } = await supabase
      .from('produk')
      .select('id_produk, stok')
      .ilike('nama_produk', prodName);

    if (prodItems && prodItems.length > 0) {
      for (const prodItem of prodItems) {
        const newStokBal = (prodItem.stok || 0) + balAddition;
        await supabase
          .from('produk')
          .update({ stok: newStokBal })
          .eq('id_produk', prodItem.id_produk);
        console.log(`[STOK SYNC] Tambah ${balAddition} Bal ke katalog ${prodName} (#${prodItem.id_produk}). Sisa: ${newStokBal} Bal.`);
      }
    }
  } catch (err) {
    console.error('[STOK SYNC ERROR] Gagal sinkronkan bahan ke produk katalog:', err);
  }
}

/**
 * Sinkronisasi saat Staf Penggoreng mengurangi / memakai bahan mentah -> Kurangi stok produk katalog Owner
 */
export async function reduceProductCatalogFromRawMaterial(
  supabase: SupabaseClient,
  namaBahan: string,
  reducedKg: number
) {
  try {
    const prodName = bahanToProductName(namaBahan);
    const balReduction = Math.floor(Number(reducedKg) / KG_PER_BAL);

    if (balReduction <= 0) return;

    const { data: prodItems } = await supabase
      .from('produk')
      .select('id_produk, stok')
      .ilike('nama_produk', prodName);

    if (prodItems && prodItems.length > 0) {
      for (const prodItem of prodItems) {
        const newStokBal = Math.max(0, (prodItem.stok || 0) - balReduction);
        await supabase
          .from('produk')
          .update({ stok: newStokBal })
          .eq('id_produk', prodItem.id_produk);
        console.log(`[STOK SYNC] Kurangi ${balReduction} Bal di katalog ${prodName} (#${prodItem.id_produk}). Sisa: ${newStokBal} Bal.`);
      }
    }
  } catch (err) {
    console.error('[STOK SYNC ERROR] Gagal kurangi produk katalog:', err);
  }
}

