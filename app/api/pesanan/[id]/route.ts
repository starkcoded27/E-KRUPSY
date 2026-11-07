import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { refundRawMaterialOnCancel } from '@/lib/stock-sync';

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

      // Kembalikan stok produk di katalog dan kembalikan stok bahan mentah di dapur
      if (order.id_produk && order.produk) {
        await supabase
          .from('produk')
          .update({ stok: order.produk.stok + order.jumlah })
          .eq('id_produk', order.id_produk);

        await refundRawMaterialOnCancel(supabase, order.produk.nama_produk, order.jumlah);
      }

      return NextResponse.json({
        success: true,
        message: 'Pesanan berhasil dibatalkan dan stok produk telah dikembalikan.',
      });
    }

    // 2. Pembayaran Instan via QRIS oleh Pelanggan
    if (action === 'pay_qris') {
      const qrisMeta = {
        type: 'qris',
        ref_id: body.ref_id || `QRIS-KD-${Date.now().toString().slice(-8)}`,
        nmid: 'ID1025393458506',
        merchant: 'PABRIK KERUPUK DIANSAH',
        outlet_code: 'A01',
        account_owner: 'Bapak Diansyah (Rekening / E-Wallet Pabrik Kerupuk Diansah)',
        paid_at: new Date().toISOString(),
        amount: body.amount || 0,
        customer_name: body.customer_name || 'Pelanggan',
        qris_image: '/images/qris-pabrik-diansyah.jpg',
      };

      const { error: payErr } = await supabase
        .from('pembayaran')
        .update({
          status_pembayaran: 'lunas',
          tanggal_pembayaran: new Date().toISOString().split('T')[0],
          bukti_transfer: JSON.stringify(qrisMeta),
        })
        .eq('id_pesanan', orderId);

      if (payErr) {
        return NextResponse.json({ message: 'Gagal memproses pelunasan QRIS: ' + payErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Pembayaran QRIS berhasil! Dana otomatis masuk ke Rekening / E-Wallet Owner.',
        data: qrisMeta,
      });
    }

    // 3. Unggah Bukti Screenshot Transfer Bank oleh Pelanggan
    if (action === 'upload_transfer') {
      const { bukti_transfer, bank_tujuan, catatan } = body;
      if (!bukti_transfer) {
        return NextResponse.json({ message: 'File bukti transfer wajib diunggah.' }, { status: 400 });
      }

      const transferMeta = typeof bukti_transfer === 'string' && bukti_transfer.startsWith('data:')
        ? bukti_transfer
        : JSON.stringify({
            image: bukti_transfer,
            bank_tujuan: bank_tujuan || 'Bank BCA (7405136830 a/n Pabrik Kerupuk Diansyah)',
            catatan: catatan || '',
            uploaded_at: new Date().toISOString(),
          });

      const { error: payErr } = await supabase
        .from('pembayaran')
        .update({
          bukti_transfer: transferMeta,
          tanggal_pembayaran: new Date().toISOString().split('T')[0],
        })
        .eq('id_pesanan', orderId);

      if (payErr) {
        return NextResponse.json({ message: 'Gagal mengunggah bukti transfer: ' + payErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Bukti transfer berhasil dikirim ke Owner. Menunggu validasi pelunasan dari Owner.',
      });
    }

    // 4. Konfirmasi Pembayaran oleh Owner (UC-12: Tunai maupun Transfer Bank)
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
        message: 'Pembayaran berhasil dikonfirmasi dan status resmi menjadi Lunas.',
      });
    }

    return NextResponse.json({ message: 'Aksi tidak valid.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ message: 'Terjadi kesalahan sistem: ' + err.message }, { status: 500 });
  }
}
