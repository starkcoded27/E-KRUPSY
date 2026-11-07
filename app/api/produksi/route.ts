import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { deductPlasticOnPackingFinish } from '@/lib/stock-sync';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Database Supabase tidak terhubung.' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('produksi')
    .select(`
      *,
      pesanan:id_pesanan (
        *,
        pelanggan (*)
      ),
      produk:id_produk (*),
      verifikasi:verifikasi_produksi (*)
    `)
    .order('id_produksi', { ascending: false });

  if (error) {
    return NextResponse.json({ message: 'Gagal memuat antrean produksi: ' + error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Database Supabase tidak terhubung.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { id_produksi, next_status, id_pesanan } = body;

    if (!id_produksi || !next_status) {
      return NextResponse.json({ message: 'ID Produksi dan target status wajib diisi.' }, { status: 400 });
    }

    // 1. Update tabel produksi
    const { data: updatedProd, error: prodErr } = await supabase
      .from('produksi')
      .update({ status_produksi: next_status })
      .eq('id_produksi', Number(id_produksi))
      .select()
      .single();

    if (prodErr) {
      return NextResponse.json({ message: 'Gagal memperbarui status produksi: ' + prodErr.message }, { status: 500 });
    }

    // 2. Sinkronisasi dengan tabel pesanan jika selesai atau diproses
    if (id_pesanan) {
      if (next_status === 'diproses' || next_status === 'siap_diverifikasi') {
        await supabase
          .from('pesanan')
          .update({ status_pesanan: 'diproses' })
          .eq('id_pesanan', Number(id_pesanan));
      } else if (next_status === 'selesai') {
        const { data: orderData } = await supabase
          .from('pesanan')
          .update({ status_pesanan: 'selesai' })
          .eq('id_pesanan', Number(id_pesanan))
          .select('ukuran_plastik, jumlah')
          .maybeSingle();

        // Potong stok plastik di gudang pembungkusan
        if (orderData?.ukuran_plastik) {
          await deductPlasticOnPackingFinish(supabase, orderData.ukuran_plastik, 1);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Status produksi berhasil diperbarui menjadi "${next_status}".`,
      data: updatedProd,
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Terjadi kesalahan sistem: ' + err.message }, { status: 500 });
  }
}
