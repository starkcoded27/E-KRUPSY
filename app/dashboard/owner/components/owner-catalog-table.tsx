'use client';

import React, { useState, useMemo } from 'react';
import {
  Package,
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { ProdukCatalogItem, StokBahanItem } from '../types';

interface OwnerCatalogTableProps {
  produkList: ProdukCatalogItem[];
  stockList?: StokBahanItem[];
  orders?: any[];
  onOpenAddModal: () => void;
  onOpenRestockModal: (prod: ProdukCatalogItem) => void;
  onOpenEditModal: (prod: ProdukCatalogItem) => void;
  onDeleteProduct: (prod: ProdukCatalogItem) => Promise<void>;
  // CRUD Stok Bahan (Plastik & Bumbu)
  onOpenAddStockModal: (defaultKat?: 'Plastik' | 'Bumbu') => void;
  onOpenEditStockModal: (stok: StokBahanItem) => void;
  onOpenRestockStockModal: (stok: StokBahanItem) => void;
  onDeleteStock: (stok: StokBahanItem) => Promise<void>;
}

export default function OwnerCatalogTable({
  produkList = [],
  stockList = [],
  orders = [],
  onOpenAddModal,
  onOpenRestockModal,
  onOpenEditModal,
  onDeleteProduct,
  onOpenAddStockModal,
  onOpenEditStockModal,
  onOpenRestockStockModal,
  onDeleteStock,
}: OwnerCatalogTableProps) {
  // Tab Kategori: kerupuk | plastik | bumbu | produk_terjual | semua
  const [activeCategoryTab, setActiveCategoryTab] = useState<
    'kerupuk' | 'plastik' | 'bumbu' | 'produk_terjual' | 'semua'
  >('kerupuk');

  // Filter & Search Produk Kerupuk
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'tersedia' | 'menipis' | 'habis'>('semua');

  // Filter & Search Plastik Kemasan
  const [plasticSearchQuery, setPlasticSearchQuery] = useState('');
  const [plasticFilterStatus, setPlasticFilterStatus] = useState<'semua' | 'aman' | 'menipis' | 'habis'>('semua');

  // Filter & Search Bumbu Tabur
  const [bumbuSearchQuery, setBumbuSearchQuery] = useState('');
  const [bumbuFilterStatus, setBumbuFilterStatus] = useState<'semua' | 'aman' | 'menipis' | 'habis'>('semua');

  // Filter & Search untuk Tab Khusus Produk Terjual
  const [soldSearchQuery, setSoldSearchQuery] = useState('');
  const [soldFilterStatus, setSoldFilterStatus] = useState<'semua' | 'pernah_terjual' | 'belum_terjual'>('semua');

  // Pisahkan stok bahan (Hanya Plastik dan Bumbu)
  const plastikList = useMemo(() => stockList.filter((s) => s.kategori === 'Plastik'), [stockList]);
  const bumbuList = useMemo(() => stockList.filter((s) => s.kategori === 'Bumbu'), [stockList]);

  const countPlastik = plastikList.length;
  const countBumbu = bumbuList.length;
  const totalItemAktif = produkList.length + countPlastik + countBumbu;

  // 1. Filter Logic Produk Kerupuk Master
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

  // 2. Filter Logic Plastik Kemasan
  const filteredPlastik = useMemo(() => {
    return plastikList.filter((stok) => {
      if (
        plasticSearchQuery.trim() &&
        !stok.nama_bahan.toLowerCase().includes(plasticSearchQuery.toLowerCase())
      ) {
        return false;
      }

      const isHabis = stok.jumlah <= 0;
      const isMenipis = stok.jumlah > 0 && stok.jumlah < 15;
      const isAman = !isHabis && !isMenipis;

      if (plasticFilterStatus === 'aman' && !isAman) return false;
      if (plasticFilterStatus === 'menipis' && !isMenipis) return false;
      if (plasticFilterStatus === 'habis' && !isHabis) return false;

      return true;
    });
  }, [plastikList, plasticSearchQuery, plasticFilterStatus]);

  // 3. Filter Logic Bumbu Tabur
  const filteredBumbu = useMemo(() => {
    return bumbuList.filter((stok) => {
      if (
        bumbuSearchQuery.trim() &&
        !stok.nama_bahan.toLowerCase().includes(bumbuSearchQuery.toLowerCase())
      ) {
        return false;
      }

      const isHabis = stok.jumlah <= 0;
      const isMenipis = stok.jumlah > 0 && stok.jumlah < 20;
      const isAman = !isHabis && !isMenipis;

      if (bumbuFilterStatus === 'aman' && !isAman) return false;
      if (bumbuFilterStatus === 'menipis' && !isMenipis) return false;
      if (bumbuFilterStatus === 'habis' && !isHabis) return false;

      return true;
    });
  }, [bumbuList, bumbuSearchQuery, bumbuFilterStatus]);

  // 4. Data & Filter Khusus Tab Produk Keluar / Terjual
  const soldProductsList = useMemo(() => {
    if (!produkList) return [];
    return produkList.filter((prod) => {
      const soldCount = prod.terjual || 0;
      const matchSearch =
        prod.nama_produk.toLowerCase().includes(soldSearchQuery.toLowerCase()) ||
        (prod.deskripsi && prod.deskripsi.toLowerCase().includes(soldSearchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (soldFilterStatus === 'pernah_terjual') return soldCount > 0;
      if (soldFilterStatus === 'belum_terjual') return soldCount === 0;

      return true;
    });
  }, [produkList, soldSearchQuery, soldFilterStatus]);

  // Statistik Ringkasan Produk Terjual
  const totalBalTerjual = useMemo(() => {
    return produkList.reduce((acc, p) => acc + (p.terjual || 0), 0);
  }, [produkList]);

  const totalOmsetTerjual = useMemo(() => {
    return produkList.reduce((acc, p) => acc + (p.terjual || 0) * (Number(p.harga) || 0), 0);
  }, [produkList]);

  const varianLakuCount = useMemo(() => {
    return produkList.filter((p) => (p.terjual || 0) > 0).length;
  }, [produkList]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. NAVIGASI TAB KATEGORI (CLEAN, MINIMALIS, MODERN)                      */}
      {/* ========================================================================= */}
      <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setActiveCategoryTab('kerupuk');
            setFilterStatus('semua');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeCategoryTab === 'kerupuk'
              ? 'bg-brand-maroon text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>Produk Kerupuk</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeCategoryTab === 'kerupuk'
                ? 'bg-white/20 text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {produkList.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveCategoryTab('plastik');
            setPlasticFilterStatus('semua');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeCategoryTab === 'plastik'
              ? 'bg-brand-maroon text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>Plastik Kemasan</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeCategoryTab === 'plastik'
                ? 'bg-white/20 text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {countPlastik}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveCategoryTab('bumbu');
            setBumbuFilterStatus('semua');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeCategoryTab === 'bumbu'
              ? 'bg-brand-maroon text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>Bumbu Tabur</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeCategoryTab === 'bumbu'
                ? 'bg-white/20 text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {countBumbu}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveCategoryTab('produk_terjual');
            setSoldFilterStatus('semua');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeCategoryTab === 'produk_terjual'
              ? 'bg-brand-maroon text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>Produk Keluar / Terjual</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeCategoryTab === 'produk_terjual'
                ? 'bg-white/20 text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {varianLakuCount} Varian
          </span>
        </button>

        <button
          onClick={() => {
            setActiveCategoryTab('semua');
            setFilterStatus('semua');
            setPlasticFilterStatus('semua');
            setBumbuFilterStatus('semua');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeCategoryTab === 'semua'
              ? 'bg-brand-maroon text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>Semua Item</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeCategoryTab === 'semua'
                ? 'bg-white/20 text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {totalItemAktif}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. TABEL DAFTAR PRODUK KERUPUK MASTER                                     */}
      {/* ========================================================================= */}
      {(activeCategoryTab === 'kerupuk' || activeCategoryTab === 'semua') && (
        <div className="space-y-3">
          {/* Toolbar Kerupuk */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Daftar Produk Kerupuk</h3>
                <p className="text-xs text-gray-500">
                  Data master produk kerupuk pabrik dan ketersediaan stok siap jual saat ini
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari kerupuk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                  />
                </div>

                <button
                  onClick={onOpenAddModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs shadow-sm transition active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Tambah Kerupuk</span>
                </button>
              </div>
            </div>

            {/* Filter Status Kerupuk */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100">
              <button
                onClick={() => setFilterStatus('semua')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterStatus === 'semua'
                    ? 'bg-brand-maroon text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semua ({produkList.length})
              </button>
              <button
                onClick={() => setFilterStatus('tersedia')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterStatus === 'tersedia'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                Tersedia ({countTersedia})
              </button>
              <button
                onClick={() => setFilterStatus('menipis')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterStatus === 'menipis'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <AlertCircle className="w-3 h-3" />
                Menipis ({countMenipis})
              </button>
              <button
                onClick={() => setFilterStatus('habis')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterStatus === 'habis'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
                }`}
              >
                <XCircle className="w-3 h-3" />
                Habis ({countHabis})
              </button>
            </div>
          </div>

          {/* Tabel List Ke Bawah Kerupuk */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Produk</th>
                    <th className="py-3 px-4">Harga / Satuan</th>
                    <th className="py-3 px-4">Stok Tersedia Saat Ini</th>
                    <th className="py-3 px-4 text-center">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400">
                        Tidak ada produk yang cocok dengan pencarian atau filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => {
                      const isAvailable = prod.stok > 10;
                      const isLow = prod.stok > 0 && prod.stok <= 10;

                      return (
                        <tr key={prod.id_produk} className="hover:bg-amber-50/30 transition group">
                          <td className="py-3.5 px-4">
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
                                <span className="font-bold text-gray-900 block group-hover:text-brand-maroon transition text-xs sm:text-sm">
                                  {prod.nama_produk}
                                </span>
                                <span className="text-[11px] text-gray-400 block line-clamp-1">
                                  {prod.deskripsi || 'Varian kerupuk khas Pabrik Diansyah'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-brand-maroon block text-sm">
                              Rp {prod.harga.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] text-gray-400">per {prod.satuan || 'Bal'}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isAvailable
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : isLow
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-red-100 text-red-800 border border-red-200'
                                }`}
                              >
                                {isAvailable ? '✓ Tersedia' : isLow ? '⚠ Menipis' : '✕ Habis'}
                              </span>
                              <div className="text-sm font-black text-gray-900 font-mono">
                                {prod.stok} <span className="text-xs font-bold text-gray-500">{prod.satuan || 'Bal'}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => onOpenRestockModal(prod)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg transition text-[11px]"
                                title="Tambah Stok (+ Bal)"
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
                                title="Hapus Produk"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TABEL DAFTAR PLASTIK KEMASAN                                           */}
      {/* ========================================================================= */}
      {(activeCategoryTab === 'plastik' || activeCategoryTab === 'semua') && (
        <div className="space-y-3">
          {/* Toolbar Plastik */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Daftar Plastik Kemasan</h3>
                <p className="text-xs text-gray-500">
                  Persediaan berbagai ukuran kemasan plastik untuk membungkus pesanan kerupuk pelanggan
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari ukuran plastik..."
                    value={plasticSearchQuery}
                    onChange={(e) => setPlasticSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                  />
                </div>

                <button
                  onClick={() => onOpenAddStockModal('Plastik')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs shadow-sm transition active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Tambah Plastik</span>
                </button>
              </div>
            </div>

            {/* Filter Status Plastik */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100">
              <button
                onClick={() => setPlasticFilterStatus('semua')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  plasticFilterStatus === 'semua'
                    ? 'bg-brand-maroon text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semua ({plastikList.length})
              </button>
              <button
                onClick={() => setPlasticFilterStatus('aman')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  plasticFilterStatus === 'aman'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                Stok Aman
              </button>
              <button
                onClick={() => setPlasticFilterStatus('menipis')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  plasticFilterStatus === 'menipis'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <AlertCircle className="w-3 h-3" />
                Stok Menipis
              </button>
              <button
                onClick={() => setPlasticFilterStatus('habis')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  plasticFilterStatus === 'habis'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
                }`}
              >
                <XCircle className="w-3 h-3" />
                Habis
              </button>
            </div>
          </div>

          {/* Tabel List Ke Bawah Plastik */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Nama Ukuran Kemasan</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Stok Tersedia</th>
                    <th className="py-3 px-4">Pembaruan Terakhir</th>
                    <th className="py-3 px-4 text-center">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPlastik.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        Tidak ada ukuran plastik yang cocok dengan pencarian atau filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredPlastik.map((stok) => {
                      const isHabis = stok.jumlah <= 0;
                      const isMenipis = stok.jumlah > 0 && stok.jumlah < 15;

                      return (
                        <tr key={stok.id_stok} className="hover:bg-amber-50/30 transition group">
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-bold text-gray-900 block group-hover:text-brand-maroon transition text-xs sm:text-sm">
                                {stok.nama_bahan}
                              </span>
                              <span className="text-[11px] text-gray-400 block">
                                Kemasan plastik pembungkus pesanan
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                              Plastik Kemasan
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isHabis
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : isMenipis
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {isHabis ? '✕ Habis' : isMenipis ? '⚠ Menipis' : '✓ Aman'}
                              </span>
                              <div className="text-sm font-black text-brand-maroon font-mono">
                                {stok.jumlah}{' '}
                                <span className="text-xs font-bold text-gray-600">
                                  {stok.satuan}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-xs font-semibold text-gray-700 block">
                              {stok.tanggal_update}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => onOpenRestockStockModal(stok)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg transition text-[11px]"
                                title="Tambah Stok"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Restock</span>
                              </button>
                              <button
                                onClick={() => onOpenEditStockModal(stok)}
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                                title="Edit Item"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteStock(stok)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                                title="Hapus Item"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TABEL DAFTAR BUMBU TABUR (SEKARANG TAMPIL DI TAB BUMBU & TAB SEMUA!)   */}
      {/* ========================================================================= */}
      {(activeCategoryTab === 'bumbu' || activeCategoryTab === 'semua') && (
        <div className="space-y-3">
          {/* Toolbar Bumbu */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Daftar Bumbu Tabur Rasa</h3>
                <p className="text-xs text-gray-500">
                  Persediaan berbagai varian rasa bumbu tabur yang dipilih oleh pelanggan
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari bumbu..."
                    value={bumbuSearchQuery}
                    onChange={(e) => setBumbuSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                  />
                </div>

                <button
                  onClick={() => onOpenAddStockModal('Bumbu')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs shadow-sm transition active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Tambah Bumbu</span>
                </button>
              </div>
            </div>

            {/* Filter Status Bumbu */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100">
              <button
                onClick={() => setBumbuFilterStatus('semua')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  bumbuFilterStatus === 'semua'
                    ? 'bg-brand-maroon text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semua ({bumbuList.length})
              </button>
              <button
                onClick={() => setBumbuFilterStatus('aman')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  bumbuFilterStatus === 'aman'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                Stok Aman
              </button>
              <button
                onClick={() => setBumbuFilterStatus('menipis')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  bumbuFilterStatus === 'menipis'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <AlertCircle className="w-3 h-3" />
                Stok Menipis
              </button>
              <button
                onClick={() => setBumbuFilterStatus('habis')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  bumbuFilterStatus === 'habis'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
                }`}
              >
                <XCircle className="w-3 h-3" />
                Habis
              </button>
            </div>
          </div>

          {/* Tabel List Ke Bawah Bumbu */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Nama Varian Rasa</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Stok Tersedia</th>
                    <th className="py-3 px-4">Pembaruan Terakhir</th>
                    <th className="py-3 px-4 text-center">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBumbu.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        Tidak ada varian bumbu yang cocok dengan pencarian atau filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredBumbu.map((stok) => {
                      const isHabis = stok.jumlah <= 0;
                      const isMenipis = stok.jumlah > 0 && stok.jumlah < 20;

                      return (
                        <tr key={stok.id_stok} className="hover:bg-amber-50/30 transition group">
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-bold text-gray-900 block group-hover:text-brand-maroon transition text-xs sm:text-sm">
                                {stok.nama_bahan}
                              </span>
                              <span className="text-[11px] text-gray-400 block">
                                Varian rasa bumbu tabur pesanan
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                              Bumbu Tabur
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isHabis
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : isMenipis
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {isHabis ? '✕ Habis' : isMenipis ? '⚠ Menipis' : '✓ Aman'}
                              </span>
                              <div className="text-sm font-black text-brand-maroon font-mono">
                                {stok.jumlah}{' '}
                                <span className="text-xs font-bold text-gray-600">
                                  {stok.satuan}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-xs font-semibold text-gray-700 block">
                              {stok.tanggal_update}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => onOpenRestockStockModal(stok)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg transition text-[11px]"
                                title="Tambah Stok"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Restock</span>
                              </button>
                              <button
                                onClick={() => onOpenEditStockModal(stok)}
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                                title="Edit Item"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteStock(stok)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                                title="Hapus Item"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB KHUSUS SENDIRI: DAFTAR PRODUK YANG SUDAH KELUAR / TERJUAL          */}
      {/* ========================================================================= */}
      {activeCategoryTab === 'produk_terjual' && (
        <div className="space-y-4">
          {/* Ringkasan Penjualan Produk */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs">
              <span className="text-xs text-gray-500 font-medium block">Total Bal Keluar / Terjual</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-brand-maroon font-mono">{totalBalTerjual}</span>
                <span className="text-xs font-bold text-gray-600">Bal</span>
              </div>
              <span className="text-[11px] text-gray-400 mt-0.5 block">Akumulasi produk keluar dari transaksi valid</span>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs">
              <span className="text-xs text-gray-500 font-medium block">Total Nilai Penjualan Produk</span>
              <span className="mt-1 text-2xl font-black text-emerald-700 font-mono block">
                Rp {totalOmsetTerjual.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5 block">Total omset kotor dari produk yang terjual</span>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs">
              <span className="text-xs text-gray-500 font-medium block">Varian Kerupuk Laku</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-blue-700 font-mono">{varianLakuCount}</span>
                <span className="text-xs font-bold text-gray-600">dari {produkList.length} Varian</span>
              </div>
              <span className="text-[11px] text-gray-400 mt-0.5 block">Varian yang telah dipesan oleh pelanggan</span>
            </div>
          </div>

          {/* Toolbar & Filter Tab Produk Terjual */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Daftar Rekapitulasi Produk Keluar / Terjual
                </h3>
                <p className="text-xs text-gray-500">
                  Data akumulasi barang yang sudah keluar dari gudang dan dibeli pelanggan
                </p>
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari produk terjual..."
                  value={soldSearchQuery}
                  onChange={(e) => setSoldSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                />
              </div>
            </div>

            {/* Filter Status Penjualan */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100">
              <button
                onClick={() => setSoldFilterStatus('semua')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  soldFilterStatus === 'semua'
                    ? 'bg-brand-maroon text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semua Varian ({produkList.length})
              </button>
              <button
                onClick={() => setSoldFilterStatus('pernah_terjual')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  soldFilterStatus === 'pernah_terjual'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                Pernah Terjual ({varianLakuCount})
              </button>
              <button
                onClick={() => setSoldFilterStatus('belum_terjual')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  soldFilterStatus === 'belum_terjual'
                    ? 'bg-gray-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Belum Terjual ({produkList.length - varianLakuCount})
              </button>
            </div>
          </div>

          {/* Tabel List Ke Bawah Produk Terjual */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Nama Produk</th>
                    <th className="py-3 px-4">Harga Satuan</th>
                    <th className="py-3 px-4">Total Keluar / Terjual</th>
                    <th className="py-3 px-4">Total Pendapatan Produk</th>
                    <th className="py-3 px-4">Sisa Stok Gudang</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {soldProductsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        Tidak ada data produk yang cocok dengan pencarian atau filter ini.
                      </td>
                    </tr>
                  ) : (
                    soldProductsList.map((prod) => {
                      const soldCount = prod.terjual || 0;
                      const omsetProduk = soldCount * (Number(prod.harga) || 0);
                      const isLaku = soldCount > 0;

                      return (
                        <tr key={prod.id_produk} className="hover:bg-amber-50/30 transition group">
                          {/* Nama Produk & Foto */}
                          <td className="py-3.5 px-4">
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
                                <span className="font-bold text-gray-900 block group-hover:text-brand-maroon transition text-xs sm:text-sm">
                                  {prod.nama_produk}
                                </span>
                                <span className="text-[11px] text-gray-400 block line-clamp-1">
                                  {prod.deskripsi || 'Varian kerupuk khas Pabrik Diansyah'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Harga Satuan */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-gray-800 block text-xs sm:text-sm">
                              Rp {prod.harga.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] text-gray-400">per {prod.satuan || 'Bal'}</span>
                          </td>

                          {/* Total Keluar / Terjual */}
                          <td className="py-3.5 px-4">
                            <span className="font-black text-brand-maroon text-sm font-mono block">
                              {soldCount} <span className="text-xs font-bold text-gray-500">{prod.satuan || 'Bal'}</span>
                            </span>
                            <span className="text-[10px] text-gray-400">Sudah diambil/dikirim</span>
                          </td>

                          {/* Total Pendapatan / Omset Produk */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-emerald-700 text-xs sm:text-sm block">
                              Rp {omsetProduk.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] text-gray-400">Akumulasi penjualan</span>
                          </td>

                          {/* Sisa Stok Saat Ini */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-gray-800 text-xs block">
                              {prod.stok} {prod.satuan || 'Bal'}
                            </span>
                            <span className="text-[10px] text-gray-400">Stok siap jual</span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            {isLaku ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Terjual ({soldCount})
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">
                                Belum Terjual
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
