'use client';

import React from 'react';
import { X, PlusCircle, Edit3, Layers, Package, AlertTriangle } from 'lucide-react';
import { StokBahanItem } from '../types';

interface OwnerAddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  namaBahan: string;
  setNamaBahan: (val: string) => void;
  kategori: string;
  setKategori: (val: string) => void;
  satuan: string;
  setSatuan: (val: string) => void;
  jumlah: number;
  setJumlah: (val: number) => void;
  isLoading: boolean;
}

export function OwnerAddStockModal({
  isOpen,
  onClose,
  onSubmit,
  namaBahan,
  setNamaBahan,
  kategori,
  setKategori,
  satuan,
  setSatuan,
  jumlah,
  setJumlah,
  isLoading,
}: OwnerAddStockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5 text-orange-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Tambah Stok Bahan / Plastik</h3>
              <p className="text-[11px] text-gray-500">Input pasokan bahan baku atau kemasan baru (Khusus Owner)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Kategori Bahan <span className="text-red-500">*</span>
            </label>
            <select
              value={kategori}
              onChange={(e) => {
                const newKat = e.target.value;
                setKategori(newKat);
                if (newKat === 'Plastik') setSatuan('Pack');
                else if (newKat === 'Kerupuk Mentah') setSatuan('Kg');
                else if (newKat === 'Bumbu') setSatuan('Kg');
              }}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
            >
              <option value="Plastik">Plastik Kemasan</option>
              <option value="Bumbu">Bumbu Tabur Rasa</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nama Bahan / Kemasan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaBahan}
              onChange={(e) => setNamaBahan(e.target.value)}
              placeholder={
                kategori === 'Plastik'
                  ? 'Contoh: Plastik Ukuran 1/2 kg'
                  : kategori === 'Bumbu'
                  ? 'Contoh: Bumbu Keju Manis'
                  : 'Contoh: Kerupuk Mentah Ikan'
              }
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Satuan <span className="text-red-500">*</span>
              </label>
              <select
                value={satuan}
                onChange={(e) => setSatuan(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
              >
                <option value="Pack">Pack</option>
                <option value="Kg">Kg</option>
                <option value="Bal">Bal</option>
                <option value="Pcs">Pcs</option>
                <option value="Bungkus">Bungkus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Jumlah Stok Masuk <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="50000"
                value={jumlah}
                onChange={(e) => setJumlah(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                required
              />
            </div>
          </div>

          {kategori === 'Plastik' && (
            <p className="text-[11px] text-blue-700 bg-blue-50 border border-blue-200 p-2.5 rounded-xl">
              📦 <strong>Plastik Kemasan:</strong> Stok ini akan otomatis tampil secara <em>real-time</em> di panel staf pembungkus sebagai acuan verifikasi QC & packing.
            </p>
          )}

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
              disabled={isLoading || !namaBahan.trim() || jumlah <= 0}
              className="py-3 px-4 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold rounded-2xl shadow-md transition disabled:opacity-50"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Bahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface OwnerEditStockModalProps {
  stockItem: StokBahanItem | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  editNama: string;
  setEditNama: (val: string) => void;
  editKategori: string;
  setEditKategori: (val: string) => void;
  editSatuan: string;
  setEditSatuan: (val: string) => void;
  editJumlah: number;
  setEditJumlah: (val: number) => void;
  isLoading: boolean;
}

export function OwnerEditStockModal({
  stockItem,
  onClose,
  onSubmit,
  editNama,
  setEditNama,
  editKategori,
  setEditKategori,
  editSatuan,
  setEditSatuan,
  editJumlah,
  setEditJumlah,
  isLoading,
}: OwnerEditStockModalProps) {
  if (!stockItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Edit Stok #{stockItem.id_stok}</h3>
              <p className="text-[11px] text-gray-500">Perbarui rincian nama atau jumlah stok (Khusus Owner)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Kategori Bahan <span className="text-red-500">*</span>
            </label>
            <select
              value={editKategori}
              onChange={(e) => setEditKategori(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
            >
              <option value="Plastik">Plastik Kemasan</option>
              <option value="Bumbu">Bumbu Tabur Rasa</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nama Bahan / Kemasan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editNama}
              onChange={(e) => setEditNama(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Satuan <span className="text-red-500">*</span>
              </label>
              <select
                value={editSatuan}
                onChange={(e) => setEditSatuan(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
              >
                <option value="Pack">Pack</option>
                <option value="Kg">Kg</option>
                <option value="Bal">Bal</option>
                <option value="Pcs">Pcs</option>
                <option value="Bungkus">Bungkus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Jumlah Total Stok <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="50000"
                value={editJumlah}
                onChange={(e) => setEditJumlah(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                required
              />
            </div>
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
              disabled={isLoading || !editNama.trim() || editJumlah < 0}
              className="py-3 px-4 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold rounded-2xl shadow-md transition disabled:opacity-50"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface OwnerRestockMaterialModalProps {
  stockItem: StokBahanItem | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  additionalQty: number;
  setAdditionalQty: (val: number) => void;
  isLoading: boolean;
}

export function OwnerRestockMaterialModal({
  stockItem,
  onClose,
  onSubmit,
  additionalQty,
  setAdditionalQty,
  isLoading,
}: OwnerRestockMaterialModalProps) {
  if (!stockItem) return null;

  const estimatedTotal = (stockItem.jumlah || 0) + Number(additionalQty || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Restock Pasokan Bahan</h3>
              <p className="text-[11px] text-gray-500">Tambah pasokan masuk dari supplier (Khusus Owner)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-1.5 text-emerald-950">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Nama Bahan:</span>
              <span className="font-bold text-gray-900">{stockItem.nama_bahan}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Kategori:</span>
              <span className="font-semibold text-emerald-900">{stockItem.kategori}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Stok Saat Ini:</span>
              <span className="font-mono font-bold text-brand-maroon">
                {stockItem.jumlah} {stockItem.satuan}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-emerald-200/60">
              <span className="text-gray-500">Estimasi Setelah Restock:</span>
              <span className="font-mono font-black text-emerald-700">
                {estimatedTotal} {stockItem.satuan}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Jumlah Pasokan Tambahan ({stockItem.satuan}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="50000"
              value={additionalQty}
              onChange={(e) => setAdditionalQty(parseInt(e.target.value) || 0)}
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
              disabled={isLoading || additionalQty <= 0}
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
