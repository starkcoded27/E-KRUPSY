'use client';

import React, { useMemo } from 'react';
import {
  Printer,
  X,
  Clock,
  Calendar,
  TrendingUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building2,
  CalendarDays,
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

  const validOrders = useMemo(
    () => (orders || []).filter((o) => o && o.status_pesanan !== 'dibatalkan'),
    [orders]
  );

  // Ambil tanggal unik pesanan yang tercatat di database untuk rekomendasi
  const availableDates = useMemo(() => {
    const set = new Set<string>();
    validOrders.forEach((o) => {
      const d = (o.tanggal_pesanan || o.created_at || '').slice(0, 10);
      if (d) set.add(d);
    });
    return Array.from(set).sort().reverse();
  }, [validOrders]);

  const latestOrderDate = availableDates[0] || null;

  // Filter order sesuai periode
  const filteredOrders = useMemo(() => {
    return validOrders.filter((o) => {
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
  }, [validOrders, printPeriod, printDate, printMonth, printYear]);

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
  const prodBreakdown = useMemo(() => {
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
    return Object.values(prodMap).sort((a, b) => b.total - a.total);
  }, [filteredOrders]);

  // Rincian 12 Bulan (untuk Tahunan)
  const monthlyBreakdown = useMemo(() => {
    if (printPeriod !== 'tahunan') return [];
    return Array.from({ length: 12 }, (_, i) => {
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
    });
  }, [validOrders, printPeriod, printYear]);

  // Format judul & periode
  let judulDokumen = 'DOKUMEN RESMI: LAPORAN PENJUALAN & KEUANGAN HARIAN';
  let labelPeriode = `Hari / Tanggal: ${
    printDate
      ? new Date(printDate + 'T00:00:00').toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '-'
  }`;
  if (printPeriod === 'bulanan') {
    judulDokumen = 'DOKUMEN RESMI: LAPORAN PENJUALAN & KEUANGAN BULANAN';
    labelPeriode = `Periode Bulan: ${NAMA_BULAN[printMonth - 1]} ${printYear}`;
  } else if (printPeriod === 'tahunan') {
    judulDokumen = 'DOKUMEN RESMI: LAPORAN KEUANGAN & PERFORMA TAHUNAN';
    labelPeriode = `Tahun Buku: ${printYear}`;
  }

  const tanggalCetakHariIni = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      {/* ========================================================================= */}
      {/* TAMPILAN 1: MODAL POPUP DI LAYAR (DISEMBUNYIKAN TOTAL SAAT DICETAK/PRINT) */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn print:hidden">
        <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-gray-100 flex flex-col max-h-[92vh]">
          
          {/* Header Modal Kontrol */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-maroon flex items-center justify-center font-bold border border-brand-100 shadow-sm">
                <Printer className="w-5 h-5 text-brand-maroon" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                  Pilihan Periode Cetak Dokumen Laporan
                </h3>
                <p className="text-xs text-gray-500">
                  Pilih periode pembukuan untuk mencetak laporan resmi (Harian, Bulanan, atau Tahunan)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Pilihan Periode & Form Filter */}
          <div className="pt-4 pb-3 space-y-3 shrink-0">
            {/* 3 Tab Opsi: Harian, Bulanan, Tahunan */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setPrintPeriod('harian')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  printPeriod === 'harian'
                    ? 'bg-white text-brand-maroon shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Laporan Harian</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintPeriod('bulanan')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  printPeriod === 'bulanan'
                    ? 'bg-white text-brand-maroon shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Laporan Bulanan</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintPeriod('tahunan')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  printPeriod === 'tahunan'
                    ? 'bg-white text-brand-maroon shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Laporan Tahunan</span>
              </button>
            </div>

            {/* Filter Tanggal / Bulan / Tahun yang Rapi */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                {printPeriod === 'harian' && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Pilih Tanggal:</span>
                    <input
                      type="date"
                      value={printDate}
                      onChange={(e) => setPrintDate(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl font-medium text-xs focus:outline-none focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon shadow-sm"
                    />
                  </div>
                )}

                {printPeriod === 'bulanan' && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Pilih Bulan & Tahun:</span>
                    <select
                      value={printMonth}
                      onChange={(e) => setPrintMonth(Number(e.target.value))}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl font-medium text-xs focus:outline-none focus:ring-2 focus:ring-brand-maroon shadow-sm"
                    >
                      {NAMA_BULAN.map((m, idx) => (
                        <option key={idx} value={idx + 1}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={printYear}
                      onChange={(e) => setPrintYear(Number(e.target.value))}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl font-medium text-xs focus:outline-none focus:ring-2 focus:ring-brand-maroon shadow-sm"
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
                    <span className="font-semibold text-gray-700">Pilih Tahun:</span>
                    <select
                      value={printYear}
                      onChange={(e) => setPrintYear(Number(e.target.value))}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl font-medium text-xs focus:outline-none focus:ring-2 focus:ring-brand-maroon shadow-sm"
                    >
                      <option value={2024}>2024</option>
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  </div>
                )}

                {/* Helper Rekomendasi Tanggal jika 0 Pesanan */}
                {printPeriod === 'harian' && filteredOrders.length === 0 && latestOrderDate && latestOrderDate !== printDate && (
                  <button
                    type="button"
                    onClick={() => setPrintDate(latestOrderDate)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-semibold border border-amber-300 transition"
                  >
                    <span>💡 Pakai Tanggal Terakhir Ada Pesanan ({latestOrderDate})</span>
                  </button>
                )}
              </div>

              {/* Status Pesanan Ditemukan */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                  filteredOrders.length > 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Tercatat: {filteredOrders.length} Pesanan Sah
              </span>
            </div>
          </div>

          {/* PREVIEW DOKUMEN CETAK (Didesain seperti lembar kertas A4 asli) */}
          <div className="flex-1 overflow-y-auto bg-gray-100/80 p-3 sm:p-5 rounded-2xl border border-gray-200 shadow-inner">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200 max-w-2xl mx-auto space-y-5 text-gray-800">
              {/* Kop Resmi Dokumen */}
              <div className="text-center pb-4 border-b-2 border-gray-900">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <div className="w-12 h-12 rounded-2xl bg-brand-maroon text-amber-300 font-black text-2xl flex items-center justify-center shadow">
                    KD
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">
                      Pabrik Kerupuk Diansyah
                    </h2>
                    <p className="text-xs text-gray-600 font-medium">
                      Spesialis Kerupuk Gurih & Renyah Berkualitas Tinggi &bull; Goreng Dadakan
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Jl. Pangeran Kornel No. 204, Pasanggrahan Baru, Sumedang &bull; Telp / WA: 0895-2578-3995
                </p>
                <div className="mt-2.5 inline-block px-4 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-900 border border-gray-300 tracking-wider uppercase">
                  {judulDokumen}
                </div>
              </div>

              {/* Metadata Dokumen */}
              <div className="grid grid-cols-2 text-xs py-1 border-b border-gray-200">
                <div>
                  <span className="text-gray-500 block text-[11px]">Cakupan Periode:</span>
                  <p className="font-bold text-gray-900 text-xs sm:text-sm">{labelPeriode}</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block text-[11px]">Pimpinan / Penanggung Jawab:</span>
                  <p className="font-bold text-gray-900 text-xs sm:text-sm">Bapak Diansyah (Owner)</p>
                </div>
              </div>

              {/* Tabel I: Rekapitulasi Neraca & Arus Kas */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-l-4 border-brand-maroon pl-2">
                  I. Rekapitulasi Neraca & Arus Kas
                </h4>
                <table className="w-full text-xs border border-gray-300 rounded-lg overflow-hidden">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-gray-100 font-bold text-gray-700">
                      <td className="py-2 px-3">Komponen Keuangan Operasional</td>
                      <td className="py-2 px-3 text-right">Nominal (Rupiah)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-gray-800">
                        1. Total Omset Penjualan (Gross Revenue)
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-gray-900">
                        Rp {pOmset.toLocaleString('id-ID')}
                      </td>
                    </tr>
                    <tr className="bg-emerald-50/40">
                      <td className="py-2 px-3 font-semibold text-emerald-900">
                        2. Realisasi Kas Masuk (Lunas Di-ACC)
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                        Rp {pLunas.toLocaleString('id-ID')}
                      </td>
                    </tr>
                    <tr className="bg-amber-50/40">
                      <td className="py-2 px-3 font-semibold text-amber-900">
                        3. Piutang Pelanggan (Menunggu Pembayaran)
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-amber-800">
                        Rp {pPiutang.toLocaleString('id-ID')}
                      </td>
                    </tr>
                    <tr className="bg-rose-50/40">
                      <td className="py-2 px-3 font-semibold text-rose-900">
                        4. Estimasi Biaya Pokok Produksi / HPP (~70%)
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-rose-700">
                        - Rp {pHPP.toLocaleString('id-ID')}
                      </td>
                    </tr>
                    <tr className="bg-gray-100 font-black text-xs">
                      <td className="py-2.5 px-3 text-brand-darkmaroon">
                        5. ESTIMASI LABA BERSIH OPERASIONAL (~30%)
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-brand-maroon">
                        Rp {pLaba.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tabel II: Rincian Produk Terjual */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-l-4 border-brand-maroon pl-2">
                  II. Rincian Penjualan per Varian Kerupuk
                </h4>
                {prodBreakdown.length === 0 ? (
                  <p className="text-gray-400 italic text-[11px] p-3 bg-gray-50 rounded-xl text-center border border-dashed border-gray-200">
                    Tidak ada penjualan produk kerupuk tercatat pada periode ini.
                  </p>
                ) : (
                  <table className="w-full text-xs border border-gray-300 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 font-bold text-gray-700">
                      <tr>
                        <th className="py-1.5 px-2 text-center w-10">No</th>
                        <th className="py-1.5 px-3 text-left">Nama Produk Kerupuk</th>
                        <th className="py-1.5 px-3 text-center">Volume</th>
                        <th className="py-1.5 px-3 text-right">Total Penjualan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {prodBreakdown.map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/60">
                          <td className="py-1.5 px-2 text-center font-mono">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-medium">{p.nama}</td>
                          <td className="py-1.5 px-3 text-center">{p.jumlah} {p.satuan}</td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold">
                            Rp {p.total.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Tabel III: Rincian Transaksi Pesanan (Harian) / 12 Bulan (Tahunan) */}
              {printPeriod === 'harian' && (
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-l-4 border-brand-maroon pl-2">
                    III. Rincian Transaksi Pesanan Masuk
                  </h4>
                  {filteredOrders.length === 0 ? (
                    <p className="text-gray-400 italic text-[11px] p-3 bg-gray-50 rounded-xl text-center border border-dashed border-gray-200">
                      Tidak ada transaksi pelanggan tercatat pada tanggal ini.
                    </p>
                  ) : (
                    <table className="w-full text-[11px] border border-gray-300 rounded-lg overflow-hidden">
                      <thead className="bg-gray-100 font-bold text-gray-700">
                        <tr>
                          <th className="py-1.5 px-2 text-center w-8">No</th>
                          <th className="py-1.5 px-2 text-center">ID</th>
                          <th className="py-1.5 px-2 text-left">Pelanggan</th>
                          <th className="py-1.5 px-2 text-left">Produk</th>
                          <th className="py-1.5 px-2 text-center">Qty</th>
                          <th className="py-1.5 px-2 text-right">Total</th>
                          <th className="py-1.5 px-2 text-center">Status Bayar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredOrders.map((o, idx) => {
                          const payStatus =
                            o.pembayaran?.[0]?.status_pembayaran === 'lunas' ? 'LUNAS' : 'PENDING';
                          return (
                            <tr key={o.id_pesanan}>
                              <td className="py-1 px-2 text-center font-mono">{idx + 1}</td>
                              <td className="py-1 px-2 text-center font-mono">#{o.id_pesanan}</td>
                              <td className="py-1 px-2 font-medium truncate max-w-[120px]">
                                {o.pelanggan?.nama_lengkap || '-'}
                              </td>
                              <td className="py-1 px-2 truncate max-w-[130px]">
                                {o.produk?.nama_produk} ({formatVarianRasa(o.varian_rasa)})
                              </td>
                              <td className="py-1 px-2 text-center">
                                {o.jumlah} {o.produk?.satuan || 'Bal'}
                              </td>
                              <td className="py-1 px-2 text-right font-mono font-bold">
                                Rp {Number(o.total_harga).toLocaleString('id-ID')}
                              </td>
                              <td className="py-1 px-2 text-center font-bold text-[10px]">
                                <span
                                  className={`px-1.5 py-0.5 rounded ${
                                    payStatus === 'LUNAS'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {payStatus}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {printPeriod === 'tahunan' && (
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-l-4 border-brand-maroon pl-2">
                    III. Rekapitulasi Performa Bulanan ({printYear})
                  </h4>
                  <table className="w-full text-xs border border-gray-300 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 font-bold text-gray-700">
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
                          <td className="py-1.5 px-3 text-right font-mono">
                            Rp {mb.lunas.toLocaleString('id-ID')}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold">
                            Rp {mb.omset.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tanda Tangan Resmi */}
              <div className="pt-5 border-t border-gray-300 flex justify-between items-end text-xs">
                <div className="text-gray-400 text-[10px]">
                  Dicetak otomatis via Sistem E-KRUPSY &bull; {tanggalCetakHariIni}
                </div>
                <div className="text-center w-52">
                  <p className="text-gray-600 mb-12">
                    Sumedang, {tanggalCetakHariIni}<br />
                    <strong>Owner / Pimpinan Pabrik</strong>
                  </p>
                  <p className="font-bold text-gray-900 border-t border-gray-900 pt-1">
                    Bapak Diansyah
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tombol Aksi Bawah Modal */}
          <div className="pt-4 flex items-center justify-end gap-3 shrink-0 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="py-2.5 px-6 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen Sekarang (PDF / Print)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAMPILAN 2: DOKUMEN CETAK ASLI (HANYA MUNCUL DI PRINT/KERTAS/PDF)         */}
      {/* ========================================================================= */}
      <div className="hidden print:block print:w-full print:m-0 print:p-0">
        <div className="space-y-5 text-black bg-white">
          {/* KOP RESMI LAPORAN PABRIK KERUPUK DIANSYAH */}
          <div className="text-center pb-4 border-b-2 border-black">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-2xl bg-black text-white font-black text-2xl flex items-center justify-center">
                KD
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black text-black tracking-tight uppercase">
                  Pabrik Kerupuk Diansyah
                </h2>
                <p className="text-xs text-gray-800 font-medium">
                  Spesialis Kerupuk Gurih & Renyah Berkualitas Tinggi &bull; Goreng Dadakan
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-700 mt-1">
              Jl. Pangeran Kornel No. 204, Pasanggrahan Baru, Sumedang &bull; Telp / WA: 0895-2578-3995
            </p>
            <div className="mt-2.5 inline-block px-4 py-1 rounded-full text-xs font-black bg-gray-100 text-black border border-black tracking-wider uppercase">
              {judulDokumen}
            </div>
          </div>

          {/* Info Dokumen */}
          <div className="grid grid-cols-2 text-xs py-2 border-b border-gray-400">
            <div>
              <span className="text-gray-600 block text-[11px]">Cakupan Periode:</span>
              <p className="font-bold text-black text-sm">{labelPeriode}</p>
            </div>
            <div className="text-right">
              <span className="text-gray-600 block text-[11px]">Pimpinan / Penanggung Jawab:</span>
              <p className="font-bold text-black text-sm">Bapak Diansyah (Owner)</p>
            </div>
          </div>

          {/* Tabel I: Rekapitulasi Neraca Keuangan */}
          <div className="space-y-2 text-xs break-inside-avoid">
            <h4 className="font-bold text-black text-xs uppercase tracking-wide border-l-4 border-black pl-2">
              I. Rekapitulasi Neraca & Arus Kas {printPeriod === 'harian' ? 'Harian' : printPeriod === 'bulanan' ? 'Bulanan' : 'Tahunan'}
            </h4>
            <table className="w-full text-xs border border-black border-collapse">
              <tbody className="divide-y divide-gray-300">
                <tr className="bg-gray-100 font-bold border-b border-black">
                  <td className="py-2 px-3 border-r border-black">Komponen Keuangan Operasional</td>
                  <td className="py-2 px-3 text-right">Nominal (Rupiah)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold border-r border-black">1. Total Omset Penjualan (Gross Revenue)</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">Rp {pOmset.toLocaleString('id-ID')}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-2 px-3 font-semibold border-r border-black">2. Realisasi Kas Masuk (Lunas Di-ACC)</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">Rp {pLunas.toLocaleString('id-ID')}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold border-r border-black">3. Piutang Pelanggan (Menunggu Pembayaran)</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">Rp {pPiutang.toLocaleString('id-ID')}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-2 px-3 font-semibold border-r border-black">4. Estimasi Biaya Pokok Produksi / HPP (~70%)</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">- Rp {pHPP.toLocaleString('id-ID')}</td>
                </tr>
                <tr className="bg-gray-200 font-black text-xs border-t-2 border-black">
                  <td className="py-2.5 px-3 border-r border-black">5. ESTIMASI LABA BERSIH OPERASIONAL (~30%)</td>
                  <td className="py-2.5 px-3 text-right font-mono">Rp {pLaba.toLocaleString('id-ID')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tabel II: Rincian Produk Terjual */}
          <div className="space-y-2 text-xs break-inside-avoid">
            <h4 className="font-bold text-black text-xs uppercase tracking-wide border-l-4 border-black pl-2">
              II. Rincian Penjualan per Varian Kerupuk
            </h4>
            {prodBreakdown.length === 0 ? (
              <p className="text-gray-500 italic text-[11px] p-2 bg-gray-50 border border-gray-300">
                Tidak ada penjualan produk kerupuk tercatat pada periode ini.
              </p>
            ) : (
              <table className="w-full text-xs border border-black border-collapse">
                <thead className="bg-gray-100 font-bold border-b border-black">
                  <tr>
                    <th className="py-1.5 px-2 text-center w-10 border-r border-black">No</th>
                    <th className="py-1.5 px-3 text-left border-r border-black">Nama Produk Kerupuk</th>
                    <th className="py-1.5 px-3 text-center border-r border-black">Volume</th>
                    <th className="py-1.5 px-3 text-right">Total Penjualan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {prodBreakdown.map((p, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-2 text-center font-mono border-r border-black">{idx + 1}</td>
                      <td className="py-1.5 px-3 font-medium border-r border-black">{p.nama}</td>
                      <td className="py-1.5 px-3 text-center border-r border-black">{p.jumlah} {p.satuan}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold">
                        Rp {p.total.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Tabel III Khusus Harian: Daftar Transaksi Masuk */}
          {printPeriod === 'harian' && (
            <div className="space-y-2 text-xs break-inside-avoid">
              <h4 className="font-bold text-black text-xs uppercase tracking-wide border-l-4 border-black pl-2">
                III. Rincian Transaksi Pesanan Masuk
              </h4>
              {filteredOrders.length === 0 ? (
                <p className="text-gray-500 italic text-[11px] p-2 bg-gray-50 border border-gray-300">
                  Tidak ada transaksi pesanan pelanggan tercatat pada tanggal ini.
                </p>
              ) : (
                <table className="w-full text-[11px] border border-black border-collapse">
                  <thead className="bg-gray-100 font-bold border-b border-black">
                    <tr>
                      <th className="py-1.5 px-2 text-center w-8 border-r border-black">No</th>
                      <th className="py-1.5 px-2 text-center border-r border-black">ID</th>
                      <th className="py-1.5 px-2 text-left border-r border-black">Pelanggan</th>
                      <th className="py-1.5 px-2 text-left border-r border-black">Produk</th>
                      <th className="py-1.5 px-2 text-center border-r border-black">Qty</th>
                      <th className="py-1.5 px-2 text-right border-r border-black">Total</th>
                      <th className="py-1.5 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300">
                    {filteredOrders.map((o, idx) => {
                      const payStatus =
                        o.pembayaran?.[0]?.status_pembayaran === 'lunas' ? 'LUNAS' : 'PENDING';
                      return (
                        <tr key={o.id_pesanan}>
                          <td className="py-1 px-2 text-center font-mono border-r border-black">{idx + 1}</td>
                          <td className="py-1 px-2 text-center font-mono border-r border-black">#{o.id_pesanan}</td>
                          <td className="py-1 px-2 font-medium border-r border-black">{o.pelanggan?.nama_lengkap || '-'}</td>
                          <td className="py-1 px-2 border-r border-black">
                            {o.produk?.nama_produk} ({formatVarianRasa(o.varian_rasa)})
                          </td>
                          <td className="py-1 px-2 text-center border-r border-black">{o.jumlah} {o.produk?.satuan || 'Bal'}</td>
                          <td className="py-1 px-2 text-right font-mono font-bold border-r border-black">
                            Rp {Number(o.total_harga).toLocaleString('id-ID')}
                          </td>
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
            <div className="space-y-2 text-xs break-inside-avoid">
              <h4 className="font-bold text-black text-xs uppercase tracking-wide border-l-4 border-black pl-2">
                III. Rekapitulasi Performa Bulanan ({printYear})
              </h4>
              <table className="w-full text-xs border border-black border-collapse">
                <thead className="bg-gray-100 font-bold border-b border-black">
                  <tr>
                    <th className="py-1.5 px-2 text-center w-8 border-r border-black">No</th>
                    <th className="py-1.5 px-3 text-left border-r border-black">Bulan</th>
                    <th className="py-1.5 px-3 text-center border-r border-black">Transaksi</th>
                    <th className="py-1.5 px-3 text-right border-r border-black">Kas Lunas</th>
                    <th className="py-1.5 px-3 text-right">Total Omset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {monthlyBreakdown.map((mb, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-2 text-center font-mono border-r border-black">{idx + 1}</td>
                      <td className="py-1.5 px-3 font-semibold border-r border-black">{mb.bulan}</td>
                      <td className="py-1.5 px-3 text-center font-mono border-r border-black">{mb.transaksi}</td>
                      <td className="py-1.5 px-3 text-right font-mono border-r border-black">
                        Rp {mb.lunas.toLocaleString('id-ID')}
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold">
                        Rp {mb.omset.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Lembar Tanda Tangan Resmi */}
          <div className="pt-6 border-t border-black flex justify-between items-end text-xs break-inside-avoid">
            <div className="text-gray-600 text-[10px]">
              Dicetak otomatis via Sistem E-KRUPSY &bull; {tanggalCetakHariIni}
            </div>
            <div className="text-center w-56">
              <p className="text-black mb-12">
                Sumedang, {tanggalCetakHariIni}<br />
                <strong>Owner / Pimpinan Pabrik</strong>
              </p>
              <p className="font-bold text-black border-t border-black pt-1">
                Bapak Diansyah
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
