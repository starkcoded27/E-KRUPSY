'use client';

import React from 'react';
import { Layers, Eye, ShieldCheck } from 'lucide-react';
import { StokItem } from '../types';

interface PenggorengStockPanelProps {
  stockList: StokItem[];
}

export default function PenggorengStockPanel({ stockList }: PenggorengStockPanelProps) {
  const kitchenStocks = stockList.filter((s) => s.kategori !== 'Plastik');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-maroon" />
              Ketersediaan Stok Bahan Baku & Bumbu di Dapur (View Output)
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
              Goreng Dadakan
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Output pemantauan ketersediaan bahan baku wajan (<strong>1 Bal = 5 Kg mentah</strong>). Pasokan bahan baku dikelola langsung oleh <strong>Owner</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            Mode: Khusus Pantau Stok (View Only)
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-xl border border-gray-200">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-maroon" />
            Input Pasokan: Khusus Owner
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kitchenStocks.map((stok) => {
          const isMentah = stok.kategori === 'Kerupuk Mentah';
          const balEquivalent = isMentah ? Math.floor(stok.jumlah / 5) : null;

          return (
            <div
              key={stok.id_stok}
              className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col justify-between hover:border-brand-maroon/30 transition shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="font-bold text-gray-900 text-sm block leading-tight">{stok.nama_bahan}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      stok.jumlah < 20
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {stok.jumlah < 20 ? 'Menipis' : 'Cukup'}
                  </span>
                </div>

                <span className="text-xl font-black text-brand-maroon mt-2 block">
                  {stok.jumlah} {stok.satuan}
                </span>

                {isMentah && balEquivalent !== null && (
                  <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded-md border border-orange-200 block w-fit mt-2">
                    Setara {balEquivalent} Bal di Katalog
                  </span>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-gray-200/70 flex items-center justify-between text-[11px] text-gray-500">
                <span>Kategori: {stok.kategori}</span>
                <span>Update: {stok.tanggal_update}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
