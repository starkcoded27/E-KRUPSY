'use client';

import React from 'react';
import { X, PlusCircle } from 'lucide-react';
import { ProdukCatalogItem } from '../types';

interface OwnerRestockModalProps {
  product: ProdukCatalogItem | null;
  restockBalQty: number;
  setRestockBalQty: (val: number) => void;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function OwnerRestockModal({
  product,
  restockBalQty,
  setRestockBalQty,
  isLoading,
  onClose,
  onSubmit,
}: OwnerRestockModalProps) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Restock Pasokan Supplier</h3>
              <p className="text-[11px] text-gray-500">Input pasokan kerupuk masuk dari supplier (Khusus Owner)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-1.5 text-amber-950">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Nama Produk:</span>
              <span className="font-bold text-gray-900">{product.nama_produk}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Stok Saat Ini:</span>
              <span className="font-mono font-bold text-brand-maroon">
                {product.stok} {product.satuan} (~{product.stok * 5} Kg mentah)
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-amber-200/60">
              <span className="text-gray-500">Estimasi Setelah Restock:</span>
              <span className="font-mono font-black text-emerald-700">
                {product.stok + Number(restockBalQty || 0)} {product.satuan} (~
                {(product.stok + Number(restockBalQty || 0)) * 5} Kg mentah)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Jumlah Pasokan Masuk ({product.satuan}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={restockBalQty}
              onChange={(e) => setRestockBalQty(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
              required
            />
            <p className="text-[11px] text-gray-500 mt-1.5">
              ⚡ <strong>Otomatisasi Konversi:</strong> Tambahan {restockBalQty} Bal akan otomatis menambahkan pasokan <strong>+{restockBalQty * 5} Kg</strong> bahan mentah di dapur wajan staf penggorengan dadakan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || restockBalQty <= 0}
              className="py-3 px-4 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold rounded-2xl shadow-md transition disabled:opacity-50"
            >
              {isLoading ? 'Menyimpan...' : 'Konfirmasi Restock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
