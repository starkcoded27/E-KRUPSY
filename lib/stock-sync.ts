import { SupabaseClient } from '@supabase/supabase-js';

// Rasio Konversi Pabrik Kerupuk Diansyah (Make-To-Order / Goreng Dadakan):
// 1 Bal kerupuk matang mekar membutuhkan 5 Kg kerupuk mentah.
export const KG_PER_BAL = 5;

// Rasio Bahan Tambahan per 1 Bal:
// 1 Bal kerupuk membutuhkan 1 Kg bumbu tabur dan 1 Pack plastik kemasan.
export const KG_BUMBU_PER_BAL = 1;
export const PACK_PLASTIK_PER_BAL = 1;

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
 * Konversi varian rasa pesanan ke nama bahan bumbu di tabel stok_bahan
 */
export function varianToBumbuName(varian: string): string {
  const clean = String(varian || '').toLowerCase();
  if (clean.includes('balado')) return 'Bumbu Balado Super';
  if (clean.includes('pedas')) return 'Bumbu Pedas Manis';
  if (clean.includes('keju')) return 'Bumbu Rasa Keju';
  return 'Bumbu Rasa Original';
}

/**
 * Konversi ukuran plastik ke nama bahan di stok_bahan
 * Contoh: "1/2 kg" -> "Plastik Ukuran 1/2 kg"
 */
export function ukuranToPlastikBahanName(ukuran: string): string {
  const clean = String(ukuran || '').trim();
  if (!clean) return 'Plastik Ukuran 1/2 kg';
  if (clean.toLowerCase().startsWith('plastik ukuran ')) return clean;
  return `Plastik Ukuran ${clean}`;
}

/**
 * SINKRONISASI OTOMATIS PEMOTONGAN STOK SAAT PELANGGAN MEMBELI PESANAN:
 * - Stok Kerupuk Mentah terpotong otomatis (5 Kg per Bal)
 * - Stok Bumbu terpotong otomatis sesuai varian rasa (1 Kg per Bal)
 * - Stok Plastik Kemasan terpotong otomatis sesuai ukuran kemasan (1 Pack per Bal)
 * Penggoreng dan Pembungkus tidak perlu memotong secara manual!
 */
export async function deductAllMaterialsOnOrder(
  supabase: SupabaseClient,
  namaProduk: string,
  qtyBal: number,
  varianRasa: string = 'Original',
  ukuranPlastik: string = '1/2 kg'
) {
  const qty = Math.max(1, Number(qtyBal) || 1);
  const now = new Date().toISOString().split('T')[0];
  const results = {
    kerupuk: { success: false, name: '', amount: 0, sisa: 0 },
    bumbu: { success: false, name: '', amount: 0, sisa: 0 },
    plastik: { success: false, name: '', amount: 0, sisa: 0 },
  };

  try {
    // 1. Potong Stok Kerupuk Mentah (5 Kg per Bal)
    const targetKerupuk = productToBahanName(namaProduk);
    const kgKerupukNeeded = qty * KG_PER_BAL;

    // Cari exact match dulu, lalu fallback ke ilike
    let { data: rawKerupuk } = await supabase
      .from('stok_bahan')
      .select('id_stok, jumlah, nama_bahan')
      .eq('nama_bahan', targetKerupuk)
      .eq('kategori', 'Kerupuk Mentah')
      .limit(1)
      .maybeSingle();

    if (!rawKerupuk) {
      const { data: fallbackKerupuk } = await supabase
        .from('stok_bahan')
        .select('id_stok, jumlah, nama_bahan')
        .ilike('nama_bahan', `%${namaProduk.replace(/^kerupuk\s*/i, '').trim()}%`)
        .eq('kategori', 'Kerupuk Mentah')
        .limit(1)
        .maybeSingle();
      rawKerupuk = fallbackKerupuk;
    }

    if (rawKerupuk) {
      const newJumlah = Math.max(0, (rawKerupuk.jumlah || 0) - kgKerupukNeeded);
      await supabase
        .from('stok_bahan')
        .update({ jumlah: newJumlah, tanggal_update: now })
        .eq('id_stok', rawKerupuk.id_stok);

      results.kerupuk = {
        success: true,
        name: rawKerupuk.nama_bahan,
        amount: kgKerupukNeeded,
        sisa: newJumlah,
      };
      console.log(`[AUTO-STOK] Potong Kerupuk Mentah: -${kgKerupukNeeded} Kg (${rawKerupuk.nama_bahan}). Sisa: ${newJumlah} Kg.`);
    }

    // 2. Potong Stok Bumbu Tabur Sesuai Varian Rasa (1 Kg per Bal)
    const targetBumbu = varianToBumbuName(varianRasa);
    const kgBumbuNeeded = qty * KG_BUMBU_PER_BAL;

    let { data: rawBumbu } = await supabase
      .from('stok_bahan')
      .select('id_stok, jumlah, nama_bahan')
      .eq('nama_bahan', targetBumbu)
      .eq('kategori', 'Bumbu')
      .limit(1)
      .maybeSingle();

    if (!rawBumbu) {
      const { data: fallbackBumbu } = await supabase
        .from('stok_bahan')
        .select('id_stok, jumlah, nama_bahan')
        .ilike('nama_bahan', `%${varianRasa.trim()}%`)
        .eq('kategori', 'Bumbu')
        .limit(1)
        .maybeSingle();
      rawBumbu = fallbackBumbu;
    }

    if (rawBumbu) {
      const newJumlahBumbu = Math.max(0, (rawBumbu.jumlah || 0) - kgBumbuNeeded);
      await supabase
        .from('stok_bahan')
        .update({ jumlah: newJumlahBumbu, tanggal_update: now })
        .eq('id_stok', rawBumbu.id_stok);

      results.bumbu = {
        success: true,
        name: rawBumbu.nama_bahan,
        amount: kgBumbuNeeded,
        sisa: newJumlahBumbu,
      };
      console.log(`[AUTO-STOK] Potong Bumbu: -${kgBumbuNeeded} Kg (${rawBumbu.nama_bahan}). Sisa: ${newJumlahBumbu} Kg.`);
    }

    // 3. Potong Stok Plastik Sesuai Ukuran Kemasan (1 Pack per Bal)
    const targetPlastik = ukuranToPlastikBahanName(ukuranPlastik);
    const packPlastikNeeded = qty * PACK_PLASTIK_PER_BAL;

    let { data: rawPlastik } = await supabase
      .from('stok_bahan')
      .select('id_stok, jumlah, nama_bahan')
      .eq('nama_bahan', targetPlastik)
      .eq('kategori', 'Plastik')
      .limit(1)
      .maybeSingle();

    if (!rawPlastik) {
      const cleanUkuran = ukuranPlastik.replace(/^(Plastik|Kemasan|Ukuran)\s*/i, '').trim();
      const { data: fallbackPlastik } = await supabase
        .from('stok_bahan')
        .select('id_stok, jumlah, nama_bahan')
        .ilike('nama_bahan', `%${cleanUkuran}%`)
        .eq('kategori', 'Plastik')
        .limit(1)
        .maybeSingle();
      rawPlastik = fallbackPlastik;
    }

    if (rawPlastik) {
      const newJumlahPlastik = Math.max(0, (rawPlastik.jumlah || 0) - packPlastikNeeded);
      await supabase
        .from('stok_bahan')
        .update({ jumlah: newJumlahPlastik, tanggal_update: now })
        .eq('id_stok', rawPlastik.id_stok);

      results.plastik = {
        success: true,
        name: rawPlastik.nama_bahan,
        amount: packPlastikNeeded,
        sisa: newJumlahPlastik,
      };
      console.log(`[AUTO-STOK] Potong Plastik: -${packPlastikNeeded} Pack (${rawPlastik.nama_bahan}). Sisa: ${newJumlahPlastik} Pack.`);
    }
  } catch (err) {
    console.error('[AUTO-STOK ERROR] Gagal potong stok otomatis saat pesanan dibuat:', err);
  }

  return results;
}

/**
 * PENGEMBALIAN SELURUH STOK SAAT PESANAN DIBATALKAN:
 * - Kembalikan Kerupuk Mentah (+5 Kg per Bal)
 * - Kembalikan Bumbu (+1 Kg per Bal)
 * - Kembalikan Plastik (+1 Pack per Bal)
 */
export async function refundAllMaterialsOnCancel(
  supabase: SupabaseClient,
  namaProduk: string,
  qtyBal: number,
  varianRasa: string = 'Original',
  ukuranPlastik: string = '1/2 kg'
) {
  const qty = Math.max(1, Number(qtyBal) || 1);
  const now = new Date().toISOString().split('T')[0];

  try {
    // 1. Kembalikan Kerupuk Mentah
    const targetKerupuk = productToBahanName(namaProduk);
    const kgKerupukRefund = qty * KG_PER_BAL;

    let { data: rawKerupuk } = await supabase
      .from('stok_bahan')
      .select('id_stok, jumlah')
      .eq('nama_bahan', targetKerupuk)
      .eq('kategori', 'Kerupuk Mentah')
      .limit(1)
      .maybeSingle();

    if (!rawKerupuk) {
      const { data: fbKerupuk } = await supabase
        .from('stok_bahan')
        .select('id_stok, jumlah')
        .ilike('nama_bahan', `%${namaProduk.replace(/^kerupuk\s*/i, '').trim()}%`)
        .eq('kategori', 'Kerupuk Mentah')
        .limit(1)
        .maybeSingle();
      rawKerupuk = fbKerupuk;
    }

    if (rawKerupuk) {
      await supabase
        .from('stok_bahan')
        .update({ jumlah: (rawKerupuk.jumlah || 0) + kgKerupukRefund, tanggal_update: now })
        .eq('id_stok', rawKerupuk.id_stok);
      console.log(`[REFUND STOK] Kembalikan Kerupuk Mentah: +${kgKerupukRefund} Kg`);
    }

    // 2. Kembalikan Bumbu
    const targetBumbu = varianToBumbuName(varianRasa);
    const kgBumbuRefund = qty * KG_BUMBU_PER_BAL;

    let { data: rawBumbu } = await supabase
      .from('stok_bahan')
      .select('id_stok, jumlah')
      .eq('nama_bahan', targetBumbu)
      .eq('kategori', 'Bumbu')
      .limit(1)
      .maybeSingle();

    if (!rawBumbu) {
      const { data: fbBumbu } = await supabase
        .from('stok_bahan')
        .select('id_stok, jumlah')
        .ilike('nama_bahan', `%${varianRasa.trim()}%`)
        .eq('kategori', 'Bumbu')
        .limit(1)
        .maybeSingle();
      rawBumbu = fbBumbu;
    }

    if (rawBumbu) {
      await supabase
        .from('stok_bahan')
        .update({ jumlah: (rawBumbu.jumlah || 0) + kgBumbuRefund, tanggal_update: now })
        .eq('id_stok', rawBumbu.id_stok);
      console.log(`[REFUND STOK] Kembalikan Bumbu: +${kgBumbuRefund} Kg`);
    }

    // 3. Kembalikan Plastik
    const targetPlastik = ukuranToPlastikBahanName(ukuranPlastik);
    const packPlastikRefund = qty * PACK_PLASTIK_PER_BAL;

    let { data: rawPlastik } = await supabase
      .from('stok_bahan')
      .select('id_stok, jumlah')
      .eq('nama_bahan', targetPlastik)
      .eq('kategori', 'Plastik')
      .limit(1)
      .maybeSingle();

    if (!rawPlastik) {
      const cleanUkuran = ukuranPlastik.replace(/^(Plastik|Kemasan|Ukuran)\s*/i, '').trim();
      const { data: fbPlastik } = await supabase
        .from('stok_bahan')
        .select('id_stok, jumlah')
        .ilike('nama_bahan', `%${cleanUkuran}%`)
        .eq('kategori', 'Plastik')
        .limit(1)
        .maybeSingle();
      rawPlastik = fbPlastik;
    }

    if (rawPlastik) {
      await supabase
        .from('stok_bahan')
        .update({ jumlah: (rawPlastik.jumlah || 0) + packPlastikRefund, tanggal_update: now })
        .eq('id_stok', rawPlastik.id_stok);
      console.log(`[REFUND STOK] Kembalikan Plastik: +${packPlastikRefund} Pack`);
    }
  } catch (err) {
    console.error('[REFUND STOK ERROR] Gagal mengembalikan stok saat pesanan dibatalkan:', err);
  }
}

/**
 * Sinkronisasi saat supplier mengirim bahan mentah ke Dapur -> Update stok produk katalog Owner
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
        console.log(`[STOK SYNC] Tambah ${balAddition} Bal ke katalog ${prodName}. Sisa: ${newStokBal} Bal.`);
      }
    }
  } catch (err) {
    console.error('[STOK SYNC ERROR] Gagal sinkronkan bahan ke produk katalog:', err);
  }
}

/**
 * Sinkronisasi saat bahan mentah berkurang -> Update stok produk katalog Owner
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
        console.log(`[STOK SYNC] Kurangi ${balReduction} Bal di katalog ${prodName}. Sisa: ${newStokBal} Bal.`);
      }
    }
  } catch (err) {
    console.error('[STOK SYNC ERROR] Gagal kurangi produk katalog:', err);
  }
}
