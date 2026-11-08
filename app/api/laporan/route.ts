import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { generateChartData } from '@/lib/chart-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Database Supabase tidak terhubung.' }, { status: 500 });
  }

  try {
    // 1. Ambil semua pesanan dengan relasi
    const { data: pesananList, error: orderErr } = await supabase
      .from('pesanan')
      .select(`
        *,
        produk:id_produk (*),
        pelanggan:id_pelanggan (*),
        pembayaran (*),
        produksi (*, verifikasi:verifikasi_produksi (*))
      `)
      .order('id_pesanan', { ascending: false });

    console.log('[API LAPORAN] Raw pesanan from DB:', pesananList?.length, 'error:', orderErr);

    if (orderErr) {
      return NextResponse.json({ message: 'Gagal mengambil data laporan: ' + orderErr.message }, { status: 500 });
    }

    const orders = pesananList || [];

    // 1. Filter yang tidak dibatalkan untuk perhitungan omset
    const validOrders = orders.filter((o) => o.status_pesanan !== 'dibatalkan');
    const totalOmset = validOrders.reduce((sum, o) => sum + (Number(o.total_harga) || 0), 0);
    const completedOrders = orders.filter((o) => o.status_pesanan === 'selesai');
    const inProgressOrders = orders.filter((o) => o.status_pesanan === 'diproses' || o.status_pesanan === 'menunggu_diproses');
    
    // 2. Kas Masuk (Lunas di-ACC) vs Piutang Berjalan (Belum Lunas)
    const paidOrders = validOrders.filter((o) => o.pembayaran?.[0]?.status_pembayaran === 'lunas');
    const pendingOrders = validOrders.filter((o) => o.pembayaran?.[0]?.status_pembayaran !== 'lunas');

    const totalKasMasuk = paidOrders.reduce((sum, o) => sum + (Number(o.total_harga) || 0), 0);
    const totalPiutang = pendingOrders.reduce((sum, o) => sum + (Number(o.total_harga) || 0), 0);

    // 3. Estimasi HPP (Bahan Baku & Operasional Pabrik ~70%) & Laba Bersih (~30%)
    const estimasiHPP = Math.round(totalOmset * 0.7);
    const estimasiKeuntungan = Math.round(totalOmset * 0.3);

    // 4. Rekapitulasi per Metode Pembayaran
    const rekapMetode: Record<string, { count: number; total: number; lunas: number }> = {
      tunai: { count: 0, total: 0, lunas: 0 },
      qris: { count: 0, total: 0, lunas: 0 },
      transfer: { count: 0, total: 0, lunas: 0 },
    };

    validOrders.forEach((o) => {
      const pay = o.pembayaran?.[0];
      const metode = (pay?.metode_pembayaran || 'tunai').toLowerCase();
      if (!rekapMetode[metode]) {
        rekapMetode[metode] = { count: 0, total: 0, lunas: 0 };
      }
      rekapMetode[metode].count += 1;
      rekapMetode[metode].total += Number(o.total_harga) || 0;
      if (pay?.status_pembayaran === 'lunas') {
        rekapMetode[metode].lunas += Number(o.total_harga) || 0;
      }
    });

    // 5. Rekapitulasi Penjualan per Varian Produk Kerupuk
    const produkMap: Record<string, { nama: string; satuan: string; jumlah: number; total: number }> = {};
    validOrders.forEach((o) => {
      const nama = o.produk?.nama_produk || 'Kerupuk Lainnya';
      const satuan = o.produk?.satuan || 'Bal';
      if (!produkMap[nama]) {
        produkMap[nama] = { nama, satuan, jumlah: 0, total: 0 };
      }
      produkMap[nama].jumlah += Number(o.jumlah) || 0;
      produkMap[nama].total += Number(o.total_harga) || 0;
    });

    const produkBreakdown = Object.values(produkMap).sort((a, b) => b.total - a.total);

    // Ambil rekap stok bahan baku (Hanya Kerupuk Mentah, Bumbu, & Plastik, Bebas Minyak)
    const { data: rawStockList } = await supabase
      .from('stok_bahan')
      .select('*')
      .order('kategori', { ascending: true })
      .order('nama_bahan', { ascending: true });

    const stockList = (rawStockList || []).filter(
      (s) => !s.nama_bahan.toLowerCase().includes('minyak')
    );

    // Ambil seluruh data master pelanggan terdaftar
    const { data: pelangganList } = await supabase
      .from('pelanggan')
      .select('*')
      .order('id_pelanggan', { ascending: false });

    // Ambil seluruh katalog produk pabrik
    const { data: produkList } = await supabase
      .from('produk')
      .select('*')
      .order('id_produk', { ascending: true });

    // Perhitungan Data Diagram Omset Keuangan (Harian, Mingguan, Bulanan, Tahunan)
    const chartData = generateChartData(validOrders);

    return NextResponse.json({
      success: true,
      data: {
        totalOmset,
        totalKasMasuk,
        totalPiutang,
        estimasiHPP,
        estimasiKeuntungan,
        totalTransaksi: orders.length,
        totalSelesai: completedOrders.length,
        totalProses: inProgressOrders.length,
        orders,
        pelangganList: pelangganList || [],
        produkList: produkList || [],
        rekapMetode,
        produkBreakdown,
        stockList,
        chartData,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Terjadi kesalahan sistem: ' + err.message }, { status: 500 });
  }
}
