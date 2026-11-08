'use client';

import React from 'react';
import { Layers, PlusCircle } from 'lucide-react';
import { StokItem } from '../types';

interface PembungkusStockPanelProps {
  stockList: StokItem[];
  onOpenRestockModal: () => void;
}

export default function PembungkusStockPanel({
  stockList,
  onOpenRestockModal,
}: PembungkusStockPanelProps) {
  const plasticStocks = stockList.filter((s) => s.kategori === 'Plastik');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-maroon" />
            Stok Plastik Kemasan di Gudang Pembungkusan
          </h2>
          <p className="text-xs text-gray-500">
            Pencatatan persediaan berbagai ukuran plastik pembungkus kerupuk
          </p>
        </div>
        <button
          onClick={onOpenRestockModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs shadow-sm transition w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          + Input Stok Plastik Masuk
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {plasticStocks.map((stok) => (
          <div
            key={stok.id_stok}
            className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between"
          >
            <div>
              <span className="font-semibold text-gray-900 text-xs block leading-tight">{stok.nama_bahan}</span>
              <span className="text-sm font-black text-blue-900 mt-1 block">
                {stok.jumlah} {stok.satuan}
              </span>
              <span className="text-[10px] text-gray-400">Update: {stok.tanggal_update}</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                stok.jumlah <= 0
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : stok.jumlah < 10
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              {stok.jumlah <= 0 ? 'Habis' : stok.jumlah < 10 ? 'Menipis' : 'Tersedia'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
