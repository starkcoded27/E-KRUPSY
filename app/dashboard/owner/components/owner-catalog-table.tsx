'use client';

import React, { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  PlusCircle,
  ShoppingBag,
  Edit3,
  Trash2,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { ProdukCatalogItem, StokBahanItem } from '../types';

interface OwnerCatalogTableProps {
  produkList: ProdukCatalogItem[];
  stockList?: StokBahanItem[];
  onOpenAddModal: () => void;
  onOpenRestockModal: (prod: ProdukCatalogItem) => void;
  onOpenEditModal: (prod: ProdukCatalogItem) => void;
  onDeleteProduct: (prod: ProdukCatalogItem) => Promise<void>;
  // CRUD Stok Bahan (Kerupuk Mentah, Bumbu, & Plastik)
  onOpenAddStockModal: () => void;
  onOpenEditStockModal: (stok: StokBahanItem) => void;
  onOpenRestockStockModal: (stok: StokBahanItem) => void;
  onDeleteStock: (stok: StokBahanItem) => Promise<void>;
}

export default function OwnerCatalogTable({
  produkList,
  stockList = [],
  onOpenAddModal,
  onOpenRestockModal,
  onOpenEditModal,
  onDeleteProduct,
  onOpenAddStockModal,
  onOpenEditStockModal,
  onOpenRestockStockModal,
  onDeleteStock,
}: OwnerCatalogTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'tersedia' | 'menipis' | 'habis'>('semua');

  // State Filter Kategori Stok Bahan
  const [stockCategoryFilter, setStockCategoryFilter] = useState<'semua' | 'Plastik' | 'Kerupuk Mentah' | 'Bumbu'>('semua');
  const [stockSearchQuery, setStockSearchQuery] = useState('');

  // Filter & Search Logic Produk
  const filteredProducts = useMemo(() => {
    if (!produkList) return [];
    return produkList.filter((prod) => {
      const matchSearch =
        prod.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.deskripsi && prod.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (filterStatus === 'tersedia') return prod.stok > 10;
      if (filterStatus === 'menipis') return prod.stok > 0 && prod.stok <= 10;
      if (filterStatus === 'habis') return prod.stok <= 0;
      return true;
    });
  }, [produkList, searchQuery, filterStatus]);

  const countTersedia = produkList?.filter((p) => p.stok > 10).length || 0;
  const countMenipis = produkList?.filter((p) => p.stok > 0 && p.stok <= 10).length || 0;
  const countHabis = produkList?.filter((p) => p.stok <= 0).length || 0;

  // Filter & Search Logic Stok Bahan
  const filteredStocks = useMemo(() => {
    if (!stockList) return [];
    return stockList.filter((stok) => {
      if (stockCategoryFilter !== 'semua' && stok.kategori !== stockCategoryFilter) {
        return false;
      }
      if (
        stockSearchQuery.trim() &&
        !stok.nama_bahan.toLowerCase().includes(stockSearchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [stockList, stockCategoryFilter, stockSearchQuery]);

  const countPlastik = stockList.filter((s) => s.kategori === 'Plastik').length;
  const countMentah = stockList.filter((s) => s.kategori === 'Kerupuk Mentah').length;
  const countBumbu = stockList.filter((s) => s.kategori === 'Bumbu').length;

  if (!produkList || produkList.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
        <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-xs font-bold text-gray-600">Belum ada produk terdaftar di katalog Supabase.</p>
        <button
          onClick={onOpenAddModal}
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          + Tambah Produk Pertama
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner Peringatan Make-To-Order */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50/90 border border-amber-200/90 rounded-2xl">
        <div className="flex items-start gap-3 text-xs text-amber-900">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
          </div>
          <div className="leading-relaxed">
            <p className="font-bold text-amber-950">
              Sistem Produksi Goreng Dadakan (Make-To-Order)
            </p>
            <p className="text-[11px] text-amber-850 mt-0.5">
              Stok katalog dihitung dari pasokan mentah di dapur (<strong className="font-semibold text-amber-950">1 Bal = 5 Kg mentah</strong>). Saat pelanggan memesan, stok mentah di dapur otomatis terpotong.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs shadow-sm hover:shadow transition shrink-0 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Tambah Produk Baru</span>
        </button>
      </div>

      {/* FILTER & PENCARIAN KATALOG PRODUK */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-brand-maroon flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Daftar Katalog Produk Kerupuk</h2>
              <p className="text-[11px] text-gray-500">
                Kelola item produk, harga, varian, dan pasokan bal yang dapat dipesan pelanggan
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kerupuk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
              />
            </div>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100">
          <button
            onClick={() => setFilterStatus('semua')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filterStatus === 'semua'
                ? 'bg-brand-maroon text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua ({produkList.length})
          </button>
          <button
            onClick={() => setFilterStatus('tersedia')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filterStatus === 'tersedia'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Tersedia Aman ({countTersedia})
          </button>
          <button
            onClick={() => setFilterStatus('menipis')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filterStatus === 'menipis'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            Stok Menipis ({countMenipis})
          </button>
          <button
            onClick={() => setFilterStatus('habis')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filterStatus === 'habis'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
            }`}
          >
            <XCircle className="w-3 h-3" />
            Habis ({countHabis})
          </button>
        </div>
      </div>

      {/* TABEL KATALOG PRODUK */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-4">Harga / Satuan</th>
                <th className="py-3 px-4">Stok Katalog</th>
                <th className="py-3 px-4">Total Terjual</th>
                <th className="py-3 px-4 text-center">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Tidak ada produk yang cocok dengan pencarian atau filter status ini.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isAvailable = prod.stok > 10;
                  const isLow = prod.stok > 0 && prod.stok <= 10;

                  return (
                    <tr key={prod.id_produk} className="hover:bg-amber-50/30 transition group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {prod.gambar_url ? (
                              <img
                                src={prod.gambar_url}
                                alt={prod.nama_produk}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block group-hover:text-brand-maroon transition">
                              {prod.nama_produk}
                            </span>
                            <span className="text-[11px] text-gray-400 block line-clamp-1">
                              {prod.deskripsi || 'Belum ada deskripsi'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-black text-brand-maroon block">
                          Rp {prod.harga.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-gray-400">per {prod.satuan || 'Bal'}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isAvailable
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isLow
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                          >
                            {isAvailable ? '✓ Tersedia' : isLow ? '⚠ Menipis' : '✕ Habis'}
                          </span>
                          <div className="text-[11px] text-gray-700 font-bold">
                            {prod.stok} {prod.satuan || 'Bal'}
                          </div>
                          <span className="text-[10px] text-gray-400 block">
                            (~{prod.stok * 5} Kg mentah)
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-700">
                          {prod.terjual || 0} {prod.satuan || 'Bal'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => onOpenRestockModal(prod)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg transition text-[11px]"
                            title="Restock Pasokan Supplier (+ Bal)"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Restock</span>
                          </button>
                          <button
                            onClick={() => onOpenEditModal(prod)}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                            title="Edit Rincian Produk"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(prod)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                            title="Hapus Produk dari Database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MANAJEMEN & MONITORING STOK BAHAN BAKU & KEMASAN (CRUD KHUSUS OWNER)     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-orange-600" />
              Manajemen Stok Bahan Baku & Kemasan (CRUD)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Kelola pasokan seluruh bahan: <strong>Plastik Kemasan</strong>, <strong>Kerupuk Mentah</strong>, dan <strong>Bumbu Rasa</strong>. Hak akses eksklusif hanya untuk <strong>Owner</strong>.
            </p>
          </div>

          <button
            onClick={onOpenAddStockModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Tambah Stok Bahan / Plastik</span>
          </button>
        </div>

        {/* Filter Kategori & Search Bahan */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setStockCategoryFilter('semua')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                stockCategoryFilter === 'semua'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua Bahan ({stockList.length})
            </button>
            <button
              onClick={() => setStockCategoryFilter('Plastik')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                stockCategoryFilter === 'Plastik'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
              }`}
            >
              📦 Plastik Kemasan ({countPlastik})
            </button>
            <button
              onClick={() => setStockCategoryFilter('Kerupuk Mentah')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                stockCategoryFilter === 'Kerupuk Mentah'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100'
              }`}
            >
              🥟 Kerupuk Mentah ({countMentah})
            </button>
            <button
              onClick={() => setStockCategoryFilter('Bumbu')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                stockCategoryFilter === 'Bumbu'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              🧂 Bumbu Rasa ({countBumbu})
            </button>
          </div>

          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari bahan / plastik..."
              value={stockSearchQuery}
              onChange={(e) => setStockSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
            />
          </div>
        </div>

        {/* Grid Kartu Stok Bahan Baku & Kemasan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredStocks.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 text-gray-400 text-xs">
              Tidak ada data bahan atau kemasan pada kategori ini.
            </div>
          ) : (
            filteredStocks.map((stok) => {
              const isMentah = stok.kategori === 'Kerupuk Mentah';
              const isPlastik = stok.kategori === 'Plastik';
              const isBumbu = stok.kategori === 'Bumbu';
              const balEquivalent = isMentah ? Math.floor(stok.jumlah / 5) : null;

              return (
                <div
                  key={stok.id_stok}
                  className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl hover:border-brand-maroon/40 transition flex flex-col justify-between group shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPlastik
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : isMentah
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {stok.kategori}
                      </span>

                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          stok.jumlah <= 0
                            ? 'bg-red-100 text-red-700'
                            : stok.jumlah < 15
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {stok.jumlah <= 0 ? 'Habis' : stok.jumlah < 15 ? 'Menipis' : 'Aman'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-gray-900 truncate" title={stok.nama_bahan}>
                      {stok.nama_bahan}
                    </h4>

                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-brand-maroon">
                        {stok.jumlah}
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        {stok.satuan}
                      </span>
                    </div>

                    {isMentah && balEquivalent !== null && (
                      <span className="text-[10px] font-semibold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 block w-fit mt-1">
                        Setara ~{balEquivalent} Bal
                      </span>
                    )}

                    <span className="text-[10px] text-gray-400 block mt-1.5">
                      Update: {stok.tanggal_update}
                    </span>
                  </div>

                  {/* Tombol Aksi CRUD Bahan (Owner Only) */}
                  <div className="pt-3 mt-3 border-t border-gray-200/80 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => onOpenRestockStockModal(stok)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-lg text-[10px] transition"
                      title="Tambah Pasokan Restock"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Restock</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenEditStockModal(stok)}
                        className="p-1.5 bg-gray-200/70 hover:bg-gray-300 text-gray-700 rounded-lg text-[10px] transition"
                        title="Edit Bahan"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteStock(stok)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] transition"
                        title="Hapus Bahan dari Database"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
