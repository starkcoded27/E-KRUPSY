'use client';

import React from 'react';
import {
  FileSpreadsheet,
  Calculator,
  CheckCircle2,
  Clock,
  ArrowDownRight,
  PieChart,
  Banknote,
  CreditCard,
  QrCode,
  Printer,
  RefreshCw,
} from 'lucide-react';
import { LaporanData } from '../types';

interface OwnerFinancialSummaryProps {
  laporan: LaporanData | null;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenReportModal: () => void;
}

export default function OwnerFinancialSummary({
  laporan,
  isLoading,
  onRefresh,
  onOpenReportModal,
}: OwnerFinancialSummaryProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header Bagian Laporan Keuangan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-maroon flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5 text-brand-maroon" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                Laporan Keuangan & Rekapitulasi Kas Pabrik
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Ringkasan neraca kas, realisasi penerimaan, piutang, dan estimasi laba rugi Pabrik Kerupuk Diansyah
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Segarkan Data
          </button>
          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            Cetak Laporan Keuangan (PDF / Print)
          </button>
        </div>
      </div>

      {/* Ringkasan Neraca Laba Rugi Pabrik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-50 to-amber-50/30 rounded-2xl p-5 border border-gray-200">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-brand-maroon" />
            Ikhtisar Buku Kas & Laba Rugi Operasional Pabrik
          </h3>

          <div className="space-y-3 text-xs">
            {/* Total Omset Kotor */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
              <div>
                <span className="font-bold text-gray-900 block">1. Total Omset Penjualan (Gross Revenue)</span>
                <span className="text-[11px] text-gray-400">Akumulasi seluruh nilai pesanan kerupuk yang sah</span>
              </div>
              <span className="text-sm font-black text-gray-900 font-mono">
                Rp {(laporan?.totalOmset || 0).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Kas Diterima (Lunas Di-ACC) */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <div>
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  2. Kas Diterima Sah (Di-ACC Lunas oleh Owner)
                </span>
                <span className="text-[11px] text-emerald-700">Uang riil yang telah masuk ke kas pabrik</span>
              </div>
              <span className="text-sm font-black text-emerald-700 font-mono">
                Rp {(laporan?.totalKasMasuk || 0).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Piutang Berjalan */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/80 border border-amber-200">
              <div>
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  3. Piutang Pelanggan (Menunggu Pembayaran)
                </span>
                <span className="text-[11px] text-amber-700">Tagihan berjalan yang akan dilunasi saat serah terima kerupuk</span>
              </div>
              <span className="text-sm font-black text-amber-800 font-mono">
                Rp {(laporan?.totalPiutang || 0).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Estimasi Biaya HPP */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/70 border border-rose-200">
              <div>
                <span className="font-bold text-rose-950 flex items-center gap-1.5">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                  4. Estimasi Biaya Produksi / HPP (~70%)
                </span>
                <span className="text-[11px] text-rose-700">Bahan baku kerupuk mentah, minyak goreng, bumbu, plastik, dan energi</span>
              </div>
              <span className="text-sm font-black text-rose-700 font-mono">
                - Rp {(laporan?.estimasiHPP || Math.round((laporan?.totalOmset || 0) * 0.7)).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Total Estimasi Keuntungan Bersih */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-brand-darkmaroon text-white shadow-md">
              <div>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                  5. Estimasi Laba Bersih Operasional (~30%)
                </span>
                <span className="text-[11px] text-gray-300">Margin laba bersih riil yang diperoleh Pabrik Kerupuk Diansyah</span>
              </div>
              <span className="text-lg font-black text-amber-300 font-mono">
                Rp {(laporan?.estimasiKeuntungan || 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Rincian Saluran Pembayaran */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand-maroon" />
              Saluran Penerimaan Pembayaran
            </h3>

            <div className="space-y-3">
              {/* Tunai */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Banknote className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 text-xs block">Kas Tunai (Cash)</span>
                    <span className="text-[10px] text-gray-400">
                      {laporan?.rekapMetode?.tunai?.count || 0} Transaksi
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-gray-900 block">
                    Rp {(laporan?.rekapMetode?.tunai?.total || 0).toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    Lunas: Rp {(laporan?.rekapMetode?.tunai?.lunas || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* QRIS */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center font-bold">
                    <QrCode className="w-4 h-4 text-red-700" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 text-xs block">QRIS Nasional</span>
                    <span className="text-[10px] text-gray-400">
                      {laporan?.rekapMetode?.qris?.count || 0} Transaksi
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-gray-900 block">
                    Rp {(laporan?.rekapMetode?.qris?.total || 0).toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    Lunas: Rp {(laporan?.rekapMetode?.qris?.lunas || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Transfer */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 text-xs block">Transfer Bank</span>
                    <span className="text-[10px] text-gray-400">
                      {laporan?.rekapMetode?.transfer?.count || 0} Transaksi
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-gray-900 block">
                    Rp {(laporan?.rekapMetode?.transfer?.total || 0).toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    Lunas: Rp {(laporan?.rekapMetode?.transfer?.lunas || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
