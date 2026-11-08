'use client';

import React from 'react';
import { X, AlertTriangle, Trash2, Image as ImageIcon, Upload, Edit3 } from 'lucide-react';
import { ProdukCatalogItem } from '../types';

interface OwnerAddProductModalProps {
  isOpen: boolean;
  namaProduk: string;
  setNamaProduk: (val: string) => void;
  satuanProduk: string;
  setSatuanProduk: (val: string) => void;
  hargaProduk: number;
  setHargaProduk: (val: number) => void;
  stokProduk: number;
  setStokProduk: (val: number) => void;
  deskripsiProduk: string;
  setDeskripsiProduk: (val: string) => void;
  gambarProduk: string;
  setGambarProduk: (val: string) => void;
  productErrors: Record<string, string>;
  setProductErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isLoading: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function OwnerAddProductModal({
  isOpen,
  namaProduk,
  setNamaProduk,
  satuanProduk,
  setSatuanProduk,
  hargaProduk,
  setHargaProduk,
  stokProduk,
  setStokProduk,
  deskripsiProduk,
  setDeskripsiProduk,
  gambarProduk,
  setGambarProduk,
  productErrors,
  setProductErrors,
  isLoading,
  onImageUpload,
  onClose,
  onSubmit,
}: OwnerAddProductModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              🍘
            </div>
            <h3 className="font-bold text-gray-900 text-base">Tambah Produk Kerupuk Baru</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nama Kerupuk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaProduk}
              onChange={(e) => {
                setNamaProduk(e.target.value);
                if (productErrors.nama_produk) {
                  setProductErrors((prev) => {
                    const n = { ...prev };
                    delete n.nama_produk;
                    return n;
                  });
                }
              }}
              placeholder="Contoh: Kerupuk Seblak Pedas"
              className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 ${
                productErrors.nama_produk
                  ? 'border-red-400 focus:ring-red-400 bg-red-50/40 text-red-900'
                  : 'border-gray-200 focus:ring-brand-maroon'
              }`}
              required
            />
            {productErrors.nama_produk ? (
              <div className="flex items-center gap-1.5 p-2.5 mt-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{productErrors.nama_produk}</span>
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 mt-1">
                *Nama produk harus unik dan belum ada di katalog.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Satuan Kemasan <span className="text-red-500">*</span>
              </label>
              <select
                value={satuanProduk}
                onChange={(e) => setSatuanProduk(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
              >
                <option value="Bal">Bal</option>
                <option value="Kg">Kg</option>
                <option value="Pack">Pack</option>
                <option value="Bungkus">Bungkus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Harga Jual (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                value={hargaProduk}
                onChange={(e) => setHargaProduk(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Jumlah Stok Siap Jual <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={stokProduk}
              onChange={(e) => setStokProduk(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Foto Produk Kerupuk (Opsional)
            </label>
            {gambarProduk ? (
              <div className="p-3 border border-amber-300 bg-amber-50/70 rounded-2xl flex items-center gap-3">
                <img
                  src={gambarProduk}
                  alt="Preview Produk"
                  className="w-16 h-16 rounded-xl object-cover border border-amber-300 shadow-sm shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">Foto kerupuk terpasang</p>
                  <button
                    type="button"
                    onClick={() => setGambarProduk('')}
                    className="mt-1 text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus / Ganti Foto
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="border-2 border-dashed border-gray-300 hover:border-brand-maroon hover:bg-orange-50/40 rounded-2xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition text-center group">
                  <input type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-1 group-hover:scale-105 transition shadow-sm">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 group-hover:text-brand-maroon">
                    + Unggah Foto Kerupuk
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    Format JPG, PNG, WebP dari HP atau Komputer
                  </span>
                </label>
                <input
                  type="url"
                  value={gambarProduk}
                  onChange={(e) => setGambarProduk(e.target.value)}
                  placeholder="Atau tempel link URL foto: https://..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi Singkat</label>
            <textarea
              rows={2}
              value={deskripsiProduk}
              onChange={(e) => setDeskripsiProduk(e.target.value)}
              placeholder="Keunggulan cita rasa, tekstur krispi..."
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon resize-none"
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
              {isLoading ? 'Menyimpan...' : 'Simpan Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface OwnerEditProductModalProps {
  product: ProdukCatalogItem | null;
  editNama: string;
  setEditNama: (val: string) => void;
  editSatuan: string;
  setEditSatuan: (val: string) => void;
  editHarga: number;
  setEditHarga: (val: number) => void;
  editDeskripsi: string;
  setEditDeskripsi: (val: string) => void;
  editGambar: string;
  setEditGambar: (val: string) => void;
  isLoading: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function OwnerEditProductModal({
  product,
  editNama,
  setEditNama,
  editSatuan,
  setEditSatuan,
  editHarga,
  setEditHarga,
  editDeskripsi,
  setEditDeskripsi,
  editGambar,
  setEditGambar,
  isLoading,
  onImageUpload,
  onClose,
  onSubmit,
}: OwnerEditProductModalProps) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Edit Data & Foto Produk</h3>
              <p className="text-[11px] text-gray-400">ID #{product.id_produk} &bull; Katalog Pabrik Kerupuk</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nama Kerupuk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editNama}
              onChange={(e) => setEditNama(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Satuan Kemasan <span className="text-red-500">*</span>
              </label>
              <select
                value={editSatuan}
                onChange={(e) => setEditSatuan(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
              >
                <option value="Bal">Bal</option>
                <option value="Kg">Kg</option>
                <option value="Pack">Pack</option>
                <option value="Bungkus">Bungkus</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Harga Jual (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                value={editHarga}
                onChange={(e) => setEditHarga(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Foto Produk Kerupuk</label>
            {editGambar ? (
              <div className="p-3 border border-blue-200 bg-blue-50/50 rounded-2xl flex items-center gap-3">
                <img
                  src={editGambar}
                  alt="Preview Edit Produk"
                  className="w-16 h-16 rounded-xl object-cover border border-blue-200 shadow-sm shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">Foto kerupuk terpasang</p>
                  <button
                    type="button"
                    onClick={() => setEditGambar('')}
                    className="mt-1 text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus / Kosongkan Foto
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="border-2 border-dashed border-gray-300 hover:border-brand-maroon hover:bg-orange-50/40 rounded-2xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition text-center group">
                  <input type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-1 group-hover:scale-105 transition shadow-sm">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 group-hover:text-brand-maroon">
                    + Unggah Foto Kerupuk Baru
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    Format JPG, PNG, WebP dari HP atau Komputer
                  </span>
                </label>
                <input
                  type="url"
                  value={editGambar}
                  onChange={(e) => setEditGambar(e.target.value)}
                  placeholder="Atau tempel link URL foto: https://..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi Singkat</label>
            <textarea
              rows={2}
              value={editDeskripsi}
              onChange={(e) => setEditDeskripsi(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon resize-none"
              placeholder="Keunggulan rasa, renyah, tekstur..."
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
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
