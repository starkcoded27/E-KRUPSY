'use client';

import React from 'react';
import {
  DollarSign,
  Wallet,
  Clock,
  TrendingUp,
  BarChart3,
  Calendar,
  CalendarDays,
  Printer,
} from 'lucide-react';
import { LaporanData } from '../types';
import { ChartPeriodItem } from '@/lib/chart-data';

interface OwnerStatsCardsProps {
  laporan: LaporanData | null;
  chartPeriod: 'harian' | 'mingguan' | 'bulanan' | 'tahunan';
  setChartPeriod: (period: 'harian' | 'mingguan' | 'bulanan' | 'tahunan') => void;
  hoveredBarIndex: number | null;
  setHoveredBarIndex: (idx: number | null) => void;
  onOpenFinancialReport?: () => void;
}

export default function OwnerStatsCards({
  laporan,
  chartPeriod,
  setChartPeriod,
  hoveredBarIndex,
  setHoveredBarIndex,
  onOpenFinancialReport,
}: OwnerStatsCardsProps) {
  const currentDataset: ChartPeriodItem[] =
    (laporan?.chartData && (laporan.chartData as any)[chartPeriod]) || [];
  const periodOmset = currentDataset.reduce((sum, item) => sum + (item.omset || 0), 0);
  const periodLunas = currentDataset.reduce((sum, item) => sum + (item.lunas || 0), 0);
  const periodPending = currentDataset.reduce((sum, item) => sum + (item.pending || 0), 0);
  const periodTx = currentDataset.reduce((sum, item) => sum + (item.transaksi || 0), 0);
  const maxItem = currentDataset.reduce(
    (prev, curr) => (curr.omset > (prev?.omset || 0) ? curr : prev),
    currentDataset[0]
  );

  const maxVal = Math.max(...currentDataset.map((d) => d.omset || 0), 1);
  const yCeil = Math.max(Math.ceil(maxVal / 100000) * 100000, 500000);

  const svgWidth = 840;
  const svgHeight = 250;
  const marginLeft = 75;
  const marginRight = 25;
  const marginTop = 30;
  const marginBottom = 45;
  const plotW = svgWidth - marginLeft - marginRight;
  const plotH = svgHeight - marginTop - marginBottom;
  const baseY = marginTop + plotH;

  const nItems = Math.max(currentDataset.length, 1);
  const slotW = plotW / nItems;
  const barW = Math.min(Math.max(slotW * 0.48, 22), 52);

  return (
    <div className="space-y-6">
      {/* 4 Metrik Kartu Keuangan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omset */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
            <span className="font-semibold">Akumulasi Omset</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">
              Rp {(laporan?.totalOmset || 0).toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">{laporan?.totalTransaksi || 0} Total pesanan tercatat</p>
          </div>
        </div>

        {/* Kas Masuk Terverifikasi Lunas */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
            <span className="font-semibold">Kas Diterima (Lunas)</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">
              Rp {(laporan?.totalKasMasuk || 0).toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-emerald-700/80 mt-1 font-medium">✓ Sah di-ACC oleh Owner</p>
          </div>
        </div>

        {/* Piutang Berjalan */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
            <span className="font-semibold">Piutang Belum Lunas</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">
              Rp {(laporan?.totalPiutang || 0).toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-amber-700/80 mt-1 font-medium">Menunggu pembayaran pelanggan</p>
          </div>
        </div>

        {/* Estimasi Keuntungan Bersih */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
            <span className="font-semibold">Estimasi Laba Bersih (~30%)</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-brand-maroon">
              Rp {(laporan?.estimasiKeuntungan || 0).toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Setelah HPP & operasional pabrik</p>
          </div>
        </div>
      </div>

      {/* DIAGRAM OMSET KEUANGAN */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-brand-maroon text-white flex items-center justify-center shadow-md shrink-0">
              <BarChart3 className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                  Diagram Tren Omset & Arus Kas
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ● Real-Time
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Visualisasi grafik tren omset kotor, realisasi penerimaan kas lunas, dan piutang berjalan
              </p>
            </div>
          </div>

          {/* Tombol Cetak di Sebelah Kiri Tepat di Atas Ikon Harian */}
          <div className="flex flex-col items-start gap-2 self-start lg:self-center">
            {onOpenFinancialReport && (
              <button
                type="button"
                onClick={onOpenFinancialReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-brand-darkmaroon font-bold text-xs shadow-sm transition active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>
                  Cetak Laporan{' '}
                  {chartPeriod === 'bulanan'
                    ? 'Bulanan'
                    : chartPeriod === 'tahunan'
                    ? 'Tahunan'
                    : 'Harian'}
                </span>
              </button>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center p-1 bg-gray-100/90 rounded-2xl gap-1 border border-gray-200/80">
              <button
                type="button"
                onClick={() => {
                  setChartPeriod('harian');
                  setHoveredBarIndex(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  chartPeriod === 'harian'
                    ? 'bg-brand-maroon text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Harian (7 Hari)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setChartPeriod('mingguan');
                  setHoveredBarIndex(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  chartPeriod === 'mingguan'
                    ? 'bg-brand-maroon text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Mingguan (5 Mgg)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setChartPeriod('bulanan');
                  setHoveredBarIndex(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  chartPeriod === 'bulanan'
                    ? 'bg-brand-maroon text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Bulanan (12 Bln)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setChartPeriod('tahunan');
                  setHoveredBarIndex(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  chartPeriod === 'tahunan'
                    ? 'bg-brand-maroon text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Tahunan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ringkasan Ringkas Periode (Sleek Inline Metric Strip - Pengganti 4 Kotak Duplikat) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-gray-50/90 rounded-2xl border border-gray-200/70 text-xs">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Omset Periode:</span>
              <span className="font-extrabold text-gray-900">
                Rp {periodOmset.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-gray-400">({periodTx} pesanan)</span>
            </div>

            <div className="h-3.5 w-px bg-gray-300 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Kas Masuk:</span>
              <span className="font-extrabold text-emerald-600">
                Rp {periodLunas.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-emerald-700/80 font-medium">
                ({periodOmset > 0 ? Math.round((periodLunas / periodOmset) * 100) : 0}%)
              </span>
            </div>

            <div className="h-3.5 w-px bg-gray-300 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Piutang:</span>
              <span className="font-extrabold text-amber-600">
                Rp {periodPending.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {maxItem && maxItem.omset > 0 && (
            <div className="flex items-center gap-1.5 text-gray-500 text-[11px] bg-white px-2.5 py-1 rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-gray-400">Puncak:</span>
              <span className="font-bold text-gray-900">Rp {maxItem.omset.toLocaleString('id-ID')}</span>
              <span className="text-brand-maroon font-semibold">({maxItem.label})</span>
            </div>
          )}
        </div>

        {/* Hover Tooltip */}
        {hoveredBarIndex !== null && currentDataset[hoveredBarIndex] && (
          <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-xl border border-amber-400/30 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                📊
              </div>
              <div>
                <span className="text-[10px] font-semibold tracking-wider text-amber-300 uppercase">
                  Detail Periode {chartPeriod.toUpperCase()}
                </span>
                <h4 className="font-bold text-sm text-white">
                  {currentDataset[hoveredBarIndex].label}{' '}
                  {currentDataset[hoveredBarIndex].subLabel
                    ? `(${currentDataset[hoveredBarIndex].subLabel})`
                    : ''}
                </h4>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <span className="text-gray-400 text-[11px] block">Total Omset:</span>
                <span className="text-amber-300 font-extrabold text-sm">
                  Rp {currentDataset[hoveredBarIndex].omset.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="h-7 w-px bg-white/20" />
              <div>
                <span className="text-gray-400 text-[11px] block">Kas Masuk (Lunas):</span>
                <span className="text-emerald-400 font-bold">
                  Rp {currentDataset[hoveredBarIndex].lunas.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="h-7 w-px bg-white/20" />
              <div>
                <span className="text-gray-400 text-[11px] block">Piutang / Pending:</span>
                <span className="text-orange-400 font-bold">
                  Rp {currentDataset[hoveredBarIndex].pending.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="h-7 w-px bg-white/20" />
              <div>
                <span className="text-gray-400 text-[11px] block">Volume:</span>
                <span className="text-white font-bold">
                  {currentDataset[hoveredBarIndex].transaksi} Pesanan
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SVG Visual Bar Diagram */}
        <div className="bg-gray-50/70 rounded-2xl border border-gray-200 p-4 sm:p-5 overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[650px] select-none">
            <defs>
              <linearGradient id="gradLunas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="barHoverSlot" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(180, 83, 9, 0.08)" />
                <stop offset="100%" stopColor="rgba(180, 83, 9, 0.02)" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
              const yPos = baseY - f * plotH;
              const val = Math.round(yCeil * f);
              let formattedVal = `Rp ${val.toLocaleString('id-ID')}`;
              if (val >= 1000000) {
                formattedVal = `Rp ${(val / 1000000).toFixed(1).replace('.0', '')} Jt`;
              } else if (val >= 1000) {
                formattedVal = `Rp ${(val / 1000).toFixed(0)} Rb`;
              } else if (val === 0) {
                formattedVal = 'Rp 0';
              }

              return (
                <g key={i}>
                  <line
                    x1={marginLeft}
                    y1={yPos}
                    x2={svgWidth - marginRight}
                    y2={yPos}
                    stroke="#E5E7EB"
                    strokeDasharray={f === 0 ? undefined : '4 4'}
                    strokeWidth={f === 0 ? 1.5 : 1}
                  />
                  <text
                    x={marginLeft - 10}
                    y={yPos + 4}
                    textAnchor="end"
                    fontSize="10"
                    fontWeight="600"
                    fill="#6B7280"
                  >
                    {formattedVal}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {currentDataset.map((item, idx) => {
              const cx = marginLeft + idx * slotW + slotW / 2;
              const barX = cx - barW / 2;
              const hOmset = (item.omset / yCeil) * plotH;
              const hLunas = (item.lunas / yCeil) * plotH;
              const hPending = Math.max(0, hOmset - hLunas);
              const yLunas = baseY - hLunas;
              const yPending = yLunas - hPending;
              const isHovered = hoveredBarIndex === idx;

              return (
                <g
                  key={idx}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  <rect
                    x={marginLeft + idx * slotW + 2}
                    y={marginTop - 8}
                    width={slotW - 4}
                    height={plotH + 16}
                    rx="8"
                    fill={isHovered ? 'url(#barHoverSlot)' : 'transparent'}
                    className="transition-colors"
                  />

                  {item.omset > 0 ? (
                    <>
                      {hLunas > 0 && (
                        <rect
                          x={barX}
                          y={yLunas}
                          width={barW}
                          height={hLunas}
                          rx={hPending > 0 ? 0 : 5}
                          fill="url(#gradLunas)"
                          className="transition-all duration-300"
                        />
                      )}
                      {hPending > 0 && (
                        <rect
                          x={barX}
                          y={yPending}
                          width={barW}
                          height={hPending}
                          rx="5"
                          fill="url(#gradPending)"
                          className="transition-all duration-300"
                        />
                      )}
                      <text
                        x={cx}
                        y={yPending - 7}
                        textAnchor="middle"
                        fontSize={nItems > 8 ? '9' : '10'}
                        fontWeight="bold"
                        fill={isHovered ? '#8B0000' : '#374151'}
                      >
                        {item.omset >= 1000000
                          ? `${(item.omset / 1000000).toFixed(1).replace('.0', '')}jt`
                          : `${Math.round(item.omset / 1000)}k`}
                      </text>
                    </>
                  ) : (
                    <rect x={cx - 10} y={baseY - 3} width="20" height="3" rx="1.5" fill="#D1D5DB" />
                  )}

                  <text
                    x={cx}
                    y={baseY + 18}
                    textAnchor="middle"
                    fontSize={nItems > 8 ? '10' : '11'}
                    fontWeight={isHovered ? '800' : '600'}
                    fill={isHovered ? '#8B0000' : '#1F2937'}
                  >
                    {item.label}
                  </text>
                  {item.subLabel && (
                    <text x={cx} y={baseY + 31} textAnchor="middle" fontSize="9" fill="#9CA3AF">
                      {item.subLabel}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-1 text-gray-600">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-sm" />
              <span className="font-semibold text-gray-700">Kas Masuk (Lunas Terverifikasi)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-500 shadow-sm" />
              <span className="font-semibold text-gray-700">Piutang / Pending (Belum Terbayar)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 rounded-full bg-gray-400" />
              <span className="text-gray-500">Tidak ada omset</span>
            </div>
          </div>

          <span className="text-[11px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
            💡 Sorot bar grafik untuk melihat rincian omset per periode
          </span>
        </div>
      </div>
    </div>
  );
}
