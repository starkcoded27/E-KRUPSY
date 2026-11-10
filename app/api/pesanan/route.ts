import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { validateForm } from '@/lib/validation';
import { deductAllMaterialsOnOrder } from '@/lib/stock-sync';
import { getHargaBumbu, getHargaPlastik, formatVarianRasa, CartOrderItem, CartBatchMetadata } from '@/lib/pricing';
import { getCached, setCached, invalidateCache } from '@/lib/api-cache';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idPelanggan = searchParams.get('id_pelanggan');

  const cacheKey = idPelanggan ? `api:pesanan:${idPelanggan}` : 'api:pesanan:all';
  const cached = getCached(cacheKey, 3000);
  if (cached) {
    return NextResponse.json({ success: true, data: cached });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Database Supabase tidak terhubung.' }, { status: 500 });
  }

  let query = supabase
    .from('pesanan')
    .select(`
      *,
      produk:id_produk (*),
      pelanggan:id_pelanggan (*),
      pembayaran (*),
      produksi (*, verifikasi:verifikasi_produksi (*))
    `)
    .order('id_pesanan', { ascending: false });

  if (idPelanggan) {
    query = query.eq('id_pelanggan', Number(idPelanggan));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ message: 'Gagal mengambil data pesanan: ' + error.message }, { status: 500 });
  }

  setCached(cacheKey, data);

  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Database Supabase tidak terhubung.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const {
      id_pelanggan,
      id_produk,
      jumlah,
      varian_rasa = 'Original',
      ukuran_plastik = '1/2 kg',
      metode_pembayaran = 'tunai',
      items,
    } = body;

    // A. JIKA PEMESANAN MELALUI KERANJANG BELANJA (BATCH MULTI-VARIAN)
    // Seluruh varian kerupuk digabungkan menjadi SATU pesanan & SATU pembayaran sekaligus.
    if (Array.isArray(items) && items.length > 0) {
      if (!id_pelanggan) {
        return NextResponse.json({ message: 'ID Pelanggan wajib disertakan.' }, { status: 400 });
      }

      // 1. Validasi awal ketersediaan stok seluruh item dalam keranjang
      const productIds = items.map((it: any) => Number(it.id_produk));
      const { data: prodsData, error: prodsErr } = await supabase
        .from('produk')
        .select('id_produk, nama_produk, harga, stok, satuan')
        .in('id_produk', productIds);

      if (prodsErr || !prodsData) {
        return NextResponse.json({ message: 'Gagal memvalidasi katalog produk di database.' }, { status: 500 });
      }

      const prodMap = new Map<number, any>(prodsData.map((p: any) => [p.id_produk, p]));

      // Hitung total akumulasi qty per produk yang dipesan di keranjang
      const requestedQtyMap: Record<number, number> = {};
      for (const it of items) {
        const pId = Number(it.id_produk);
        const q = Number(it.jumlah) || 1;
        requestedQtyMap[pId] = (requestedQtyMap[pId] || 0) + q;
      }

      for (const [pIdStr, totalReq] of Object.entries(requestedQtyMap)) {
        const pId = Number(pIdStr);
        const prod = prodMap.get(pId);
        if (!prod) {
          return NextResponse.json({ message: `Produk ID #${pId} tidak ditemukan.` }, { status: 404 });
        }
        if (prod.stok < totalReq) {
          return NextResponse.json({
            message: `Stok produk ${prod.nama_produk} tidak mencukupi (sisa ${prod.stok} Bal, diminta ${totalReq} Bal).`,
          }, { status: 400 });
        }
      }

      // 2. Rincian & kalkulasi grand total seluruh item keranjang
      let grandTotal = 0;
      let totalQty = 0;
      const cartItemsSummary: CartOrderItem[] = [];

      for (const it of items) {
        const pId = Number(it.id_produk);
        const qty = Math.max(1, Number(it.jumlah) || 1);
        const rasa = formatVarianRasa(it.varian_rasa || 'Original Gurih');
        const plastik = it.ukuran_plastik || '1/2 kg';
        const prod = prodMap.get(pId)!;

        const hargaKerupukSatuan = Number(prod.harga) || 0;
        const hargaBumbu = getHargaBumbu(rasa);
        const hargaPlastik = getHargaPlastik(plastik);
        const hargaPerBal = hargaKerupukSatuan + hargaBumbu + hargaPlastik;
        const subtotal = hargaPerBal * qty;

        grandTotal += subtotal;
        totalQty += qty;

        cartItemsSummary.push({
          id_produk: pId,
          nama_produk: prod.nama_produk,
          jumlah: qty,
          satuan: prod.satuan || 'Bal',
          varian_rasa: rasa,
          ukuran_plastik: plastik,
          harga_satuan: hargaKerupukSatuan,
          harga_per_bal: hargaPerBal,
          subtotal,
        });
      }

      // Ringkasan label untuk tabel pesanan (varchar 50 aman)
      const primaryProductId = cartItemsSummary[0].id_produk;
      const summaryVarian =
        items.length > 1
          ? `Paket Keranjang (${items.length} Varian)`
          : cartItemsSummary[0].varian_rasa.slice(0, 48);
      const summaryPlastik =
        items.length > 1 ? 'Campur Sesuai Item' : cartItemsSummary[0].ukuran_plastik.slice(0, 48);

      const nowIso = new Date().toISOString();
      const todayDate = nowIso.split('T')[0];

      // 3. Simpan TEPAT 1 BARIS ke tabel pesanan (konsolidasi satu kolom/kartu)
      const { data: orderData, error: orderErr } = await supabase
        .from('pesanan')
        .insert({
          id_pelanggan: Number(id_pelanggan),
          id_produk: primaryProductId,
          jumlah: totalQty,
          varian_rasa: summaryVarian,
          ukuran_plastik: summaryPlastik,
          total_harga: grandTotal,
          status_pesanan: 'menunggu_diproses',
          tanggal_pesanan: todayDate,
          created_at: nowIso,
        })
        .select(`
          *,
          produk:id_produk (*),
          pelanggan:id_pelanggan (*)
        `)
        .single();

      if (orderErr || !orderData) {
        return NextResponse.json({ message: 'Gagal membuat pesanan gabungan: ' + orderErr?.message }, { status: 500 });
      }

      // 4. Simpan TEPAT 1 BARIS ke tabel pembayaran dengan grand total & rincian item dalam bukti_transfer
      const cartMetadata: CartBatchMetadata = {
        is_cart: true,
        items: cartItemsSummary,
      };

      const { data: payData, error: payErr } = await supabase
        .from('pembayaran')
        .insert({
          id_pesanan: orderData.id_pesanan,
          id_pelanggan: Number(id_pelanggan),
          metode_pembayaran,
          jumlah_bayar: grandTotal,
          status_pembayaran: 'pending',
          bukti_transfer: JSON.stringify(cartMetadata),
        })
        .select()
        .single();

      if (payErr) {
        console.error('Error insert pembayaran gabungan:', payErr);
      }

      // 5. Masukkan ke antrean produksi pabrik untuk setiap item produk dalam keranjang
      for (const it of cartItemsSummary) {
        await supabase
          .from('produksi')
          .insert({
            id_pesanan: orderData.id_pesanan,
            id_produk: it.id_produk,
            status_produksi: 'menunggu',
          });
      }

      // 6. Potong stok katalog & stok bahan baku gudang untuk setiap item
      for (const it of cartItemsSummary) {
        const prod = prodMap.get(it.id_produk)!;
        await supabase
          .from('produk')
          .update({ stok: Math.max(0, prod.stok - it.jumlah) })
          .eq('id_produk', it.id_produk);
        prod.stok = Math.max(0, prod.stok - it.jumlah);

        await deductAllMaterialsOnOrder(
          supabase,
          prod.nama_produk,
          it.jumlah,
          it.varian_rasa,
          it.ukuran_plastik
        );
      }

      invalidateCache();

      const combinedOrder = {
        ...orderData,
        pembayaran: payData ? [payData] : [],
      };

      return NextResponse.json({
        success: true,
        message: `Berhasil memesan ${cartItemsSummary.length} varian kerupuk dari keranjang dalam 1 pesanan & 1 pembayaran! Total: Rp ${grandTotal.toLocaleString('id-ID')}`,
        data: combinedOrder,
        isBatch: true,
        totalAmount: grandTotal,
      });
    }

    // B. JIKA PEMESANAN LANGSUNG 1 VARIAN ("PESAN SEKARANG")
    // 4 Jenis Validasi Input (Existence, Data Type, Domain, Format)
    const validation = validateForm([
      { field: 'id_pelanggan', label: 'ID Pelanggan', value: id_pelanggan, required: true, dataType: 'integer' },
      { field: 'id_produk', label: 'Pilihan Produk Kerupuk', value: id_produk, required: true, dataType: 'integer' },
      { 
        field: 'jumlah', 
        label: 'Jumlah Pesanan (Bal)', 
        value: jumlah, 
        required: true, 
        dataType: 'integer', 
        domain: { min: 1, max: 100 } 
      },
      { 
        field: 'varian_rasa', 
        label: 'Varian Rasa', 
        value: varian_rasa, 
        required: true, 
        domain: { allowedValues: ['Original', 'Original Gurih', 'Balado', 'Balado Manis Pedas', 'Pedas', 'Pedas Level 5', 'Keju', 'Keju Asin Gurih'] } 
      },
      { 
        field: 'ukuran_plastik', 
        label: 'Ukuran Kemasan Plastik', 
        value: ukuran_plastik, 
        required: true, 
        domain: { allowedValues: ['1/2 kg', '1 1/2 kg', '1x25 kg', '11x25 kg', '30x45 kg', '12x22 kg', '12x23 kg', '12x25 kg'] } 
      },
      { 
        field: 'metode_pembayaran', 
        label: 'Metode Pembayaran', 
        value: metode_pembayaran, 
        required: true, 
        domain: { allowedValues: ['tunai', 'qris', 'transfer', 'ewallet'] } 
      },
    ]);

    if (!validation.isValid) {
      return NextResponse.json({
        message: validation.firstError || 'Validasi pesanan tidak sesuai.',
        errors: validation.errors,
      }, { status: 400 });
    }

    // Normalisasi varian rasa ke nama lengkap resmi (misal 'Balado' -> 'Balado Manis Pedas')
    const cleanVarian = formatVarianRasa(varian_rasa);

    // Ambil info produk untuk menghitung total_harga
    const { data: prodData, error: prodErr } = await supabase
      .from('produk')
      .select('harga, stok, nama_produk')
      .eq('id_produk', Number(id_produk))
      .single();

    if (prodErr || !prodData) {
      return NextResponse.json({ message: 'Produk yang dipilih tidak ditemukan di database.' }, { status: 404 });
    }

    // Domain Check: Cek ketersediaan stok produk
    const qty = Number(jumlah);
    if (prodData.stok < qty) {
      return NextResponse.json({
        message: `Stok produk ${prodData.nama_produk} tidak mencukupi. Sisa stok: ${prodData.stok} Bal.`,
      }, { status: 400 });
    }

    // Kalkulasi total harga gabungan: (Harga Kerupuk + Tambahan Bumbu + Tambahan Plastik) * Qty
    const hargaKerupukSatuan = Number(prodData.harga) || 0;
    const hargaBumbu = getHargaBumbu(cleanVarian);
    const hargaPlastik = getHargaPlastik(ukuran_plastik);
    const hargaPerBal = hargaKerupukSatuan + hargaBumbu + hargaPlastik;
    const totalHarga = hargaPerBal * qty;

    const nowIso = new Date().toISOString();
    const todayDate = nowIso.split('T')[0];

    // 1. Simpan ke tabel pesanan
    const { data: orderData, error: orderErr } = await supabase
      .from('pesanan')
      .insert({
        id_pelanggan: Number(id_pelanggan),
        id_produk: Number(id_produk),
        jumlah: qty,
        varian_rasa: cleanVarian,
        ukuran_plastik,
        total_harga: totalHarga,
        status_pesanan: 'menunggu_diproses',
        tanggal_pesanan: todayDate,
        created_at: nowIso,
      })
      .select(`
        *,
        produk:id_produk (*),
        pelanggan:id_pelanggan (*)
      `)
      .single();

    if (orderErr || !orderData) {
      return NextResponse.json({ message: 'Gagal membuat pesanan: ' + orderErr?.message }, { status: 500 });
    }

    // 2. Simpan ke tabel pembayaran
    // Hak persetujuan (ACC Lunas) HANYA ADA DI OWNER melalui dashboard Owner.
    // Semua pesanan baru berstatus 'pending' (belum lunas) sampai di-ACC oleh Owner.
    const statusBayar = 'pending';
    const { error: payErr } = await supabase
      .from('pembayaran')
      .insert({
        id_pesanan: orderData.id_pesanan,
        id_pelanggan: Number(id_pelanggan),
        metode_pembayaran,
        jumlah_bayar: totalHarga,
        status_pembayaran: statusBayar,
      });

    if (payErr) {
      console.error('Error insert pembayaran:', payErr);
    }

    // 3. Simpan ke tabel produksi (antrean awal pabrik)
    const { error: prodQueueErr } = await supabase
      .from('produksi')
      .insert({
        id_pesanan: orderData.id_pesanan,
        id_produk: Number(id_produk),
        status_produksi: 'menunggu',
      });

    if (prodQueueErr) {
      console.error('Error insert antrean produksi:', prodQueueErr);
    }

    // 4. OTOMATIS KURANGI STOK PRODUK KATALOG DAN BAHAN (KERUPUK MENTAH, BUMBU, & PLASTIK)
    // - Stok produk katalog berkurang `qty` Bal
    await supabase
      .from('produk')
      .update({ stok: Math.max(0, prodData.stok - qty) })
      .eq('id_produk', Number(id_produk));

    // - Stok kerupuk mentah (5 Kg/bal), bumbu (1 Kg/bal), dan plastik (1 pack/bal) otomatis berkurang langsung
    const deductInfo = await deductAllMaterialsOnOrder(
      supabase,
      prodData.nama_produk,
      qty,
      cleanVarian,
      ukuran_plastik
    );

    invalidateCache();

    return NextResponse.json({
      success: true,
      message: `Pesanan ${qty} Bal ${prodData.nama_produk} berhasil dibuat! Stok produk, bumbu (${cleanVarian}), dan kemasan plastik (${ukuran_plastik}) telah otomatis terpotong.`,
      data: orderData,
      deductInfo,
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Terjadi kesalahan sistem: ' + err.message }, { status: 500 });
  }
}
