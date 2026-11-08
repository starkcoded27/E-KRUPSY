'use client';

import React from 'react';
import {
  Printer,
  X,
  Clock,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { formatVarianRasa } from '@/lib/pricing';
import { OrderItem } from '../types';

interface OwnerFinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderItem[];
  printPeriod: 'harian' | 'bulanan' | 'tahunan';
  setPrintPeriod: (p: 'harian' | 'bulanan' | 'tahunan') => void;
  printDate: string;
  setPrintDate: (d: string) => void;
  printMonth: number;
  setPrintMonth: (m: number) => void;
  printYear: number;
  setPrintYear: (y: number) => void;
}

export function OwnerFinancialModal({
  isOpen,
  onClose,
  orders,
  printPeriod,
  setPrintPeriod,
  printDate,
  setPrintDate,
  printMonth,
  setPrintMonth,
  printYear,
  setPrintYear,
}: OwnerFinancialModalProps) {
  if (!isOpen) return null;

  const NAMA_BULAN = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const validOrders = (orders || []).filter((o) => o.status_pesanan !== 'dibatalkan');

  // Filter order sesuai periode
  const filteredOrders = validOrders.filter((o) => {
    const raw = o.tanggal_pesanan || o.created_at || '';
    if (!raw) return false;
    const dateStr = raw.slice(0, 10);
    if (printPeriod === 'harian') {
      return dateStr === printDate;
    }
    if (printPeriod === 'bulanan') {
      const prefix = `${printYear}-${String(printMonth).padStart(2, '0')}`;
      return dateStr.startsWith(prefix);
    }
    if (printPeriod === 'tahunan') {
      return dateStr.startsWith(String(printYear));
    }
    return true;
  });

  const pOmset = filteredOrders.reduce((sum, o) => sum + (Number(o.total_harga) || 0), 0);
  const pLunas = filteredOrders
    .filter((o) => o.pembayaran?.[0]?.status_pembayaran === 'lunas')
    .reduce((sum, o) => sum + (Number(o.total_harga) || 0), 0);
  const pPiutang = filteredOrders
    .filter((o) => o.pembayaran?.[0]?.status_pembayaran !== 'lunas')
    .reduce((sum, o) => sum + (Number(o.total_harga) || 0), 0);
  const pHPP = Math.round(pOmset * 0.7);
  const pLaba = Math.round(pOmset * 0.3);

  // Rincian produk dalam periode
  const prodMap: Record<string, { nama: string; satuan: string; jumlah: number; total: number }> = {};
  filteredOrders.forEach((o) => {
    const nama = o.produk?.nama_produk || 'Kerupuk Lainnya';
    const satuan = o.produk?.satuan || 'Bal';
    if (!prodMap[nama]) {
      prodMap[nama] = { nama, satuan, jumlah: 0, total: 0 };
    }
    prodMap[nama].jumlah += Number(o.jumlah) || 0;
    prodMap[nama].total += Number(o.total_harga) || 0;
  });
  const prodBreakdown = Object.values(prodMap).sort((a, b) => b.total - a.total);

  // Rincian 12 Bulan (untuk Tahunan)
  const monthlyBreakdown = printPeriod === 'tahunan' ? Array.from({ length: 12 }, (_, i) => {
    const mNum = i + 1;
    const prefix = `${printYear}-${String(mNum).padStart(2, '0')}`;
    const mOrders = validOrders.filter((o) => (o.tanggal_pesanan || o.created_at || '').startsWith(prefix));
    const mOmset = mOrders.reduce((s, o) => s + (Number(o.total_harga) || 0), 0);
    const mLunas = mOrders.filter((o) => o.pembayaran?.[0]?.status_pembayaran === 'lunas').reduce((s, o) => s + (Number(o.total_harga) || 0), 0);
    return {
      bulan: NAMA_BULAN[i],
      omset: mOmset,
      lunas: mLunas,
      transaksi: mOrders.length,
    };
  }) : [];

  // Format judul & periode
  let judulDokumen = 'DOKUMEN RESMI: LAPORAN PENJUALAN & KEUANGAN HARIAN';
  let labelPeriode = `Hari / Tanggal: ${printDate ? new Date(printDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}`;
  if (printPeriod === 'bulanan') {
    judulDokumen = 'DOKUMEN RESMI: LAPORAN PENJUALAN & KEUANGAN BULANAN';
    labelPeriode = `Periode Bulan: ${NAMA_BULAN[printMonth - 1]} ${printYear}`;
  } else if (printPeriod === 'tahunan') {
    judulDokumen = 'DOKUMEN RESMI: LAPORAN KEUANGAN & LABA RUGI TAHUNAN';
    labelPeriode = `Tahun Buku: ${printYear}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn print:static print:p-0 print:bg-white print:m-0">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[94vh] overflow-y-auto relative print:p-0 print:border-none print:shadow-none print:max-w-full print:max-h-none print:overflow-visible">
        
        {/* Header Kontrol Pilihan Laporan (Hanya tampil di layar, disembunyikan saat dicetak) */}
        <div className="print:hidden pb-5 mb-5 border-b border-gray-100">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-brand-maroon" />
                Pilihan Periode Cetak Dokumen Laporan
              </h3>
              <p className="text-xs text-gray-500">
                Pilih jenis laporan yang ingin dicetak ke PDF / kertas (Harian, Bulanan, atau Tahunan)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3 Tab Opsi: Harian, Bulanan, Tahunan */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100 rounded-2xl mb-4">
            <button
              type="button"
              onClick={() => setPrintPeriod('harian')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                printPeriod === 'harian'
                  ? 'bg-brand-maroon text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>📅 Laporan Harian</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintPeriod('bulanan')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                printPeriod === 'bulanan'
                  ? 'bg-brand-maroon text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>📆 Laporan Bulanan</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintPeriod('tahunan')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                printPeriod === 'tahunan'
                  ? 'bg-brand-maroon text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>📊 Laporan Tahunan</span>
            </button>
          </div>

          {/* Filter Pemilihan Tanggal / Bulan / Tahun */}
          <div className="flex flex-wrap items-center gap-3 p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900">
            {printPeriod === 'harian' && (
              <div className="flex items-center gap-2">
                <span className="font-bold">Pilih Tanggal:</span>
                <input
                  type="date"
                  value={printDate}
                  onChange={(e) => setPrintDate(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                />
              </div>
            )}

            {printPeriod === 'bulanan' && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold">Pilih Bulan & Tahun:</span>
                <select
                  value={printMonth}
                  onChange={(e) => setPrintMonth(Number(e.target.value))}
                  className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                >
                  {NAMA_BULAN.map((m, idx) => (
                    <option key={idx} value={idx + 1}>{m}</option>
                  ))}
                </select>
                <select
                  value={printYear}
                  onChange={(e) => setPrintYear(Number(e.target.value))}
                  className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            )}

            {printPeriod === 'tahunan' && (
              <div className="flex items-center gap-2">
                <span className="font-bold">Pilih Tahun Pembukuan:</span>
                <select
                  value={printYear}
                  onChange={(e) => setPrintYear(Number(e.target.value))}
                  className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            )}

            <span className="ml-auto text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200">
              Tercatat: {filteredOrders.length} Pesanan Sah
            </span>
          </div>
        </div>

        {/* ============================================================= */}
        {/* DOKUMEN CETAK RESMI (AKAN MUNCUL DI PRINT / PDF) */}
        {/* ============================================================= */}
        <div className="printable-report space-y-5">
          {/* KOP RESMI LAPORAN PABRIK KERUPUK DIANSYAH */}
          <div className="text-center pb-4 border-b-2 border-gray-900">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-2xl bg-brand-maroon text-amber-300 font-black text-2xl flex items-center justify-center shadow">
                KD
              </div>
              <div className="text-left">
                <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Pabrik Kerupuk Diansyah</h2>
                <p className="text-xs text-gray-600 font-medium">Spesialis Kerupuk Gurih & Renyah Berkualitas Tinggi &bull; Goreng Dadakan</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Jl. Pangeran Kornel No. 204, Pasanggrahan Baru, Sumedang &bull; Telp / WA: 0895-2578-3995
            </p>
            <div className="mt-2.5 inline-block px-4 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-900 border border-gray-400 tracking-wider uppercase">
              {judulDokumen}
            </div>
          </div>

          {/* Info Dokumen */}
          <div className="grid grid-cols-2 text-xs py-2 border-b border-gray-200">
            <div>
              <span className="text-gray-500 block text-[11px]">Cakupan Periode:</span>
              <p className="font-bold text-gray-900 text-sm">{labelPeriode}</p>
            </div>
            <div className="text-right">
              <span className="text-gray-500 block text-[11px]">Pimpinan / Penanggung Jawab:</span>
              <p className="font-bold text-gray-900 text-sm">Bapak Diansyah (Owner)</p>
            </div>
          </div>

          {/* Tabel I: Rekapitulasi Neraca Keuangan Periode Tersebut */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-l-4 border-brand-maroon pl-2">
              I. Rekapitulasi Neraca & Arus Kas {printPeriod === 'harian' ? 'Harian' : printPeriod === 'bulanan' ? 'Bulanan' : 'Tahunan'}
            </h4>
            <table className="w-full text-xs border border-gray-300 rounded-lg overflow-hidden">
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-gray-100 font-bold">
                  <td className="py-2 px-3">Komponen Keuangan Operasional</td>
                  <td className="py-2 px-3 text-right">Nominal (Rupiah)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-gray-800">1. Total Omset Penjualan (Gross Revenue)</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-gray-900">Rp {pOmset.toLocaleString('id-ID')}</td>
                </tr>
                <tr className="bg-emerald-50/50">
                  <td className="py-2 px-3 font-semibold text-emerald-900">2. Realisasi Kas Masuk (Lunas Di-ACC)</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">Rp {pLunas.toLocaleString('id-ID')}</td>
                </tr>
                <tr className="bg-amber-50/50">
                  <td className="py-2 px-3 font-semibold text-amber-900">3. Piutang Pelanggan (Menunggu Pembayaran)</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-amber-800">Rp {pPiutang.toLocaleString('id-ID')}</td>
                </tr>
                <tr className="bg-rose-50/50">
                  <td className="py-2 px-3 font-semibold text-rose-900">4. Estimasi Biaya Pokok Produksi / HPP (~70%)</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-rose-700">- Rp {pHPP.toLocaleString('id-ID')}</td>
                </tr>
                <tr className="bg-gray-100 font-black text-xs">
                  <td className="py-2.5 px-3 text-brand-darkmaroon">5. ESTIMASI LABA BERSIH OPERASIONAL (~30%)</td>
                  <td className="py-2.5 px-3 text-right font-mono text-brand-maroon">Rp {pLaba.toLocaleString('id-ID')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tabel II: Rincian Varian Produk Terjual */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-l-4 border-brand-maroon pl-2">
              II. Rincian Penjualan per Varian Kerupuk ({labelPeriode})
            </h4>
            {prodBreakdown.length === 0 ? (
              <p className="text-gray-400 italic text-[11px] p-2 bg-gray-50 rounded-lg">
                Tidak ada penjualan produk kerupuk tercatat pada periode ini.
              </p>
            ) : (
              <table className="w-full text-xs border border-gray-300">
                <thead className="bg-gray-100 font-bold">
                  <tr>
                    <th className="py-1.5 px-2 text-center w-10">No</th>
                    <th className="py-1.5 px-3 text-left">Nama Produk Kerupuk</th>
                    <th className="py-1.5 px-3 text-center">Volume</th>
                    <th className="py-1.5 px-3 text-right">Total Penjualan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {prodBreakdown.map((p, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-2 text-center font-mono">{idx + 1}</td>
                      <td className="py-1.5 px-3 font-medium">{p.nama}</td>
                      <td className="py-1.5 px-3 text-center">{p.jumlah} {p.satuan}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold">Rp {p.total.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Tabel III Khusus Harian: Daftar Transaksi Masuk Hari Ini */}
          {printPeriod === 'harian' && (
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-l-4 border-brand-maroon pl-2">
                III. Rincian Transaksi Pesanan Masuk ({labelPeriode})
              </h4>
              {filteredOrders.length === 0 ? (
                <p className="text-gray-400 italic text-[11px] p-2 bg-gray-50 rounded-lg">
                  Tidak ada pesanan pelanggan tercatat pada tanggal ini.
                </p>
              ) : (
                <table className="w-full text-[11px] border border-gray-300">
                  <thead className="bg-gray-100 font-bold">
                    <tr>
                      <th className="py-1.5 px-2 text-center w-8">No</th>
                      <th className="py-1.5 px-2 text-center">ID</th>
                      <th className="py-1.5 px-2 text-left">Pelanggan</th>
                      <th className="py-1.5 px-2 text-left">Produk</th>
                      <th className="py-1.5 px-2 text-center">Qty</th>
                      <th className="py-1.5 px-2 text-right">Total</th>
                      <th className="py-1.5 px-2 text-center">Metode</th>
                      <th className="py-1.5 px-2 text-center">Status Bayar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((o, idx) => {
                      const payStatus = o.pembayaran?.[0]?.status_pembayaran === 'lunas' ? 'LUNAS' : 'PENDING';
                      return (
                        <tr key={o.id_pesanan}>
                          <td className="py-1 px-2 text-center font-mono">{idx + 1}</td>
                          <td className="py-1 px-2 text-center font-mono">#{o.id_pesanan}</td>
                          <td className="py-1 px-2 font-medium truncate max-w-[120px]">{o.pelanggan?.nama_lengkap || '-'}</td>
                          <td className="py-1 px-2 truncate max-w-[130px]">{o.produk?.nama_produk} ({formatVarianRasa(o.varian_rasa)})</td>
                          <td className="py-1 px-2 text-center">{o.jumlah} {o.produk?.satuan || 'Bal'}</td>
                          <td className="py-1 px-2 text-right font-mono font-bold">Rp {Number(o.total_harga).toLocaleString('id-ID')}</td>
                          <td className="py-1 px-2 text-center uppercase text-[10px]">{o.pembayaran?.[0]?.metode_pembayaran || 'tunai'}</td>
                          <td className="py-1 px-2 text-center font-bold text-[10px]">{payStatus}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Tabel III Khusus Tahunan: Rekapitulasi 12 Bulan */}
          {printPeriod === 'tahunan' && (
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-l-4 border-brand-maroon pl-2">
                III. Rekapitulasi Performa Bulanan (Januari s.d. Desember {printYear})
              </h4>
              <table className="w-full text-xs border border-gray-300">
                <thead className="bg-gray-100 font-bold">
                  <tr>
                    <th className="py-1.5 px-2 text-center w-8">No</th>
                    <th className="py-1.5 px-3 text-left">Bulan</th>
                    <th className="py-1.5 px-3 text-center">Transaksi</th>
                    <th className="py-1.5 px-3 text-right">Kas Lunas</th>
                    <th className="py-1.5 px-3 text-right">Total Omset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {monthlyBreakdown.map((mb, idx) => (
                    <tr key={idx} className={mb.omset > 0 ? 'bg-amber-50/20' : ''}>
                      <td className="py-1.5 px-2 text-center font-mono">{idx + 1}</td>
                      <td className="py-1.5 px-3 font-semibold">{mb.bulan}</td>
                      <td className="py-1.5 px-3 text-center font-mono">{mb.transaksi}</td>
                      <td className="py-1.5 px-3 text-right font-mono">Rp {mb.lunas.toLocaleString('id-ID')}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold">Rp {mb.omset.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Lembar Tanda Tangan Resmi */}
          <div className="pt-6 border-t border-gray-300 flex justify-between items-end text-xs">
            <div className="text-gray-400 text-[10px]">
              Dicetak otomatis via Sistem Informasi E-KRUPSY &bull; {new Date().toLocaleString('id-ID')}
            </div>
            <div className="text-center w-56">
              <p className="text-gray-600 mb-12">
                Sumedang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
                <strong>Owner / Pimpinan Pabrik</strong>
              </p>
              <p className="font-bold text-gray-900 border-t border-gray-900 pt-1">
                Bapak Diansyah
              </p>
            </div>
          </div>
        </div>

        {/* Tombol Cetak / Tutup Bawah */}
        <div className="mt-6 flex gap-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-3 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Cetak Dokumen Sekarang (PDF / Print)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
