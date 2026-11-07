import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { validateForm } from '@/lib/validation';
import { deductRawMaterialOnOrder, ukuranToPlastikBahanName } from '@/lib/stock-sync';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Database Supabase tidak terhubung.' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const idPelanggan = searchParams.get('id_pelanggan');

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
    } = body;

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
        domain: { allowedValues: ['Original', 'Balado', 'Pedas', 'Keju'] } 
      },
      { 
        field: 'ukuran_plastik', 
        label: 'Ukuran Kemasan Plastik', 
        value: ukuran_plastik, 
        required: true, 
        domain: { allowedValues: ['1/2 kg', '1x25 kg', '30x45 kg'] } 
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

    // Domain Check: Cek ketersediaan stok kemasan plastik di gudang pembungkusan
    const plasticBahanName = ukuranToPlastikBahanName(ukuran_plastik);
    const { data: plasticStock } = await supabase
      .from('stok_bahan')
      .select('id_stok, jumlah, satuan, nama_bahan')
      .ilike('nama_bahan', plasticBahanName)
      .maybeSingle();

    if (!plasticStock || (plasticStock.jumlah || 0) <= 0) {
      return NextResponse.json({
        message: `Ukuran kemasan "${ukuran_plastik}" saat ini sedang kosong/habis di gudang pembungkusan. Silakan pilih kemasan lain yang tersedia.`,
      }, { status: 400 });
    }

    const totalHarga = Number(prodData.harga) * qty;

    // 1. Simpan ke tabel pesanan
    const { data: orderData, error: orderErr } = await supabase
      .from('pesanan')
      .insert({
        id_pelanggan: Number(id_pelanggan),
        id_produk: Number(id_produk),
        jumlah: qty,
        varian_rasa,
        ukuran_plastik,
        total_harga: totalHarga,
        status_pesanan: 'menunggu_diproses',
      })
      .select()
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

    // 4. Kurangi stok produk dan sinkronkan stok bahan mentah di dapur penggorengan dadakan
    await supabase
      .from('produk')
      .update({ stok: Math.max(0, prodData.stok - qty) })
      .eq('id_produk', Number(id_produk));

    // Otomatis potong stok kerupuk mentah (5 Kg per 1 Bal goreng dadakan)
    await deductRawMaterialOnOrder(supabase, prodData.nama_produk, qty);

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil dibuat dan otomatis diteruskan ke bagian produksi!',
      data: orderData,
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Terjadi kesalahan sistem: ' + err.message }, { status: 500 });
  }
}
