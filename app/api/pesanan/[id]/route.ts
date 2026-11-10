import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { refundAllMaterialsOnCancel } from '@/lib/stock-sync';
import { invalidateCache } from '@/lib/api-cache';
import { parseCartOrderMeta } from '@/lib/pricing';

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
        .select('*, produk:id_produk (*), pembayaran (*)')
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

      // 1. Update status pesanan jadi dibatalkan
      await supabase
        .from('pesanan')
        .update({ status_pesanan: 'dibatalkan' })
        .eq('id_pesanan', orderId);

      // 2. Update status pembayaran jadi gagal/dibatalkan
      await supabase
        .from('pembayaran')
        .update({ status_pembayaran: 'gagal' })
        .eq('id_pesanan', orderId);

      // 3. Hapus antrean produksi agar langsung terhapus dari antrean Staf Penggoreng & Pembungkus
      await supabase
        .from('produksi')
        .delete()
        .eq('id_pesanan', orderId);

      // 4. Kembalikan stok produk di katalog dan kembalikan stok bahan mentah, bumbu, & plastik di gudang
      const cartMeta = parseCartOrderMeta(order.pembayaran?.[0]?.bukti_transfer);

      if (cartMeta && Array.isArray(cartMeta.items) && cartMeta.items.length > 0) {
        // A. Pengembalian stok seluruh item dari pesanan keranjang
        for (const it of cartMeta.items) {
          const { data: prodData } = await supabase
            .from('produk')
            .select('stok, nama_produk')
            .eq('id_produk', it.id_produk)
            .single();

          if (prodData) {
            await supabase
              .from('produk')
              .update({ stok: prodData.stok + it.jumlah })
              .eq('id_produk', it.id_produk);

            await refundAllMaterialsOnCancel(
              supabase,
              it.nama_produk || prodData.nama_produk,
              it.jumlah,
              it.varian_rasa || 'Original Gurih',
              it.ukuran_plastik || '1/2 kg'
            );
          }
        }
      } else if (order.id_produk && order.produk) {
        // B. Pengembalian stok pemesanan langsung 1 produk ("Pesan Sekarang")
        await supabase
          .from('produk')
          .update({ stok: order.produk.stok + order.jumlah })
          .eq('id_produk', order.id_produk);

        await refundAllMaterialsOnCancel(
          supabase,
          order.produk.nama_produk,
          order.jumlah,
          order.varian_rasa || 'Original Gurih',
          order.ukuran_plastik || '1/2 kg'
        );
      }

      invalidateCache();

      return NextResponse.json({
        success: true,
        message: 'Pesanan berhasil dibatalkan dan seluruh stok kerupuk, bumbu, dan plastik telah otomatis dikembalikan.',
      });
    }

    // 2. Pembayaran Instan via QRIS oleh Pelanggan
    if (action === 'pay_qris') {
      const { data: payRow } = await supabase
        .from('pembayaran')
        .select('bukti_transfer')
        .eq('id_pesanan', orderId)
        .single();

      let existingMeta: any = {};
      try {
        if (payRow?.bukti_transfer) {
          existingMeta = JSON.parse(payRow.bukti_transfer);
        }
      } catch {}

      const qrisMeta = {
        ...existingMeta,
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

      invalidateCache();

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

      const { data: payRow } = await supabase
        .from('pembayaran')
        .select('bukti_transfer')
        .eq('id_pesanan', orderId)
        .single();

      let existingMeta: any = {};
      try {
        if (payRow?.bukti_transfer) {
          existingMeta = JSON.parse(payRow.bukti_transfer);
        }
      } catch {}

      const transferMeta = JSON.stringify({
        ...existingMeta,
        image: bukti_transfer,
        bank_tujuan: bank_tujuan || 'Bank BCA (7405136830 a/n Anita Nurhayati)',
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

      invalidateCache();

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

      invalidateCache();

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
