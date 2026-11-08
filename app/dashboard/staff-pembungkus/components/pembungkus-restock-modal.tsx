'use client';

import React from 'react';
import { Package, X } from 'lucide-react';

interface PembungkusRestockModalProps {
  isOpen: boolean;
  namaPlastik: string;
  setNamaPlastik: (val: string) => void;
  jumlahPlastik: number;
  setJumlahPlastik: (val: number) => void;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function PembungkusRestockModal({
  isOpen,
  namaPlastik,
  setNamaPlastik,
  jumlahPlastik,
  setJumlahPlastik,
  isLoading,
  onClose,
  onSubmit,
}: PembungkusRestockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Input Stok Plastik Masuk</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Jenis & Ukuran Plastik <span className="text-red-500">*</span>
            </label>
            <select
              value={namaPlastik}
              onChange={(e) => setNamaPlastik(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
            >
              <option value="Plastik Ukuran 1/2 kg">Plastik Ukuran 1/2 kg</option>
              <option value="Plastik Ukuran 1x25 kg">Plastik Ukuran 1x25 kg</option>
              <option value="Plastik Ukuran 30x45 kg">Plastik Ukuran 30x45 kg</option>
              <option value="Plastik Ukuran 12x22 kg">Plastik Ukuran 12x22 kg</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Jumlah Masuk (Pack) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={jumlahPlastik}
              onChange={(e) => setJumlahPlastik(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
              required
            />
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
              disabled={isLoading}
              className="py-3 px-4 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold rounded-2xl shadow-md transition disabled:opacity-50"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Stok Plastik'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
