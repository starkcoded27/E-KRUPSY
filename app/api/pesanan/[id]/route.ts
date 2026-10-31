import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Database Supabase tidak terhubung.' }, { status: 500 });
  }

  const orderId = Number(params.id);
  if (!orderId) {
    return NextResponse.json({ message: 'ID Pesanan tidak valid.' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    // 1. Pembatalan Pesanan oleh Pelanggan (UC-06)
    if (action === 'cancel') {
      const { data: order, error: findErr } = await supabase
        .from('pesanan')
        .select('*, produk:id_produk (*)')
        .eq('id_pesanan', orderId)
        .single();

      if (findErr || !order) {
        return NextResponse.json({ message: 'Pesanan tidak ditemukan.' }, { status: 404 });
      }

      // Domain check: Hanya bisa dibatalkan jika belum diproses produksi
      if (order.status_pesanan !== 'menunggu_diproses') {
        return NextResponse.json({
          message: 'Pesanan tidak dapat dibatalkan karena sudah masuk ke tahap produksi/penggorengan.',
        }, { status: 400 });
      }

      // Update status pesanan jadi dibatalkan
      await supabase
        .from('pesanan')
        .update({ status_pesanan: 'dibatalkan' })
        .eq('id_pesanan', orderId);

      // Kembalikan stok produk
      if (order.id_produk && order.produk) {
        await supabase
          .from('produk')
          .update({ stok: order.produk.stok + order.jumlah })
          .eq('id_produk', order.id_produk);
      }

      return NextResponse.json({
        success: true,
        message: 'Pesanan berhasil dibatalkan dan stok produk telah dikembalikan.',
      });
    }

    // 2. Konfirmasi Pembayaran oleh Owner (UC-12)
    if (action === 'confirm_payment') {
      const { error: payErr } = await supabase
        .from('pembayaran')
        .update({ status_pembayaran: 'lunas', tanggal_pembayaran: new Date().toISOString().split('T')[0] })
        .eq('id_pesanan', orderId);

      if (payErr) {
        return NextResponse.json({ message: 'Gagal memperbarui status pembayaran: ' + payErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Pembayaran tunai berhasil dikonfirmasi dan status berubah menjadi Lunas.',
      });
    }

    return NextResponse.json({ message: 'Aksi tidak valid.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ message: 'Terjadi kesalahan sistem: ' + err.message }, { status: 500 });
  }
}
