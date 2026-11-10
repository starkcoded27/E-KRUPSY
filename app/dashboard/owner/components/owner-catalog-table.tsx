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
} from 'lucide-react';
import { ProdukCatalogItem } from '../types';

interface OwnerCatalogTableProps {
  produkList: ProdukCatalogItem[];
  stockList?: any[];
  onOpenAddModal: () => void;
  onOpenRestockModal: (prod: ProdukCatalogItem) => void;
  onOpenEditModal: (prod: ProdukCatalogItem) => void;
  onDeleteProduct: (prod: ProdukCatalogItem) => Promise<void>;
}

export default function OwnerCatalogTable({
  produkList,
  stockList = [],
  onOpenAddModal,
  onOpenRestockModal,
  onOpenEditModal,
  onDeleteProduct,
}: OwnerCatalogTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'tersedia' | 'menipis' | 'habis'>('semua');

  // Filter & Search Logic
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
    <div className="space-y-4">
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

      {/* Bar Pencarian & Filter Cepat */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterStatus('semua')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterStatus === 'semua'
                ? 'bg-brand-maroon text-white shadow-sm'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            Semua
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterStatus === 'semua' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {produkList.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('tersedia')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterStatus === 'tersedia'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            Tersedia
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterStatus === 'tersedia' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {countTersedia}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('menipis')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterStatus === 'menipis'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            Menipis
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterStatus === 'menipis' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {countMenipis}
            </span>
          </button>
          {countHabis > 0 && (
            <button
              type="button"
              onClick={() => setFilterStatus('habis')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                filterStatus === 'habis'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              Habis
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterStatus === 'habis' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
                }`}
              >
                {countHabis}
              </span>
            </button>
          )}
        </div>

        {/* Input Cari */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari varian kerupuk..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon transition placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Tabel Produk Rapi */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-semibold text-gray-700">Produk Kerupuk</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Harga Jual</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center">Terjual</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Kapasitas Stok</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Tidak ada produk yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isMakaroni = prod.nama_produk.toLowerCase().includes('makaroni');
                  const isAvailable = prod.stok > 10;
                  const isLow = prod.stok > 0 && prod.stok <= 10;

                  return (
                    <tr
                      key={prod.id_produk}
                      className={`hover:bg-amber-50/20 transition-colors ${
                        isMakaroni ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Kolom 1: Info Produk Lengkap */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {prod.gambar_url ? (
                            <img
                              src={prod.gambar_url}
                              alt={prod.nama_produk}
                              className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-sm shrink-0 bg-white"
                            />
                          ) : (
                            <span className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-lg shrink-0 border border-amber-200/80 shadow-inner">
                              🍘
                            </span>
                          )}
                          <div className="min-w-0 max-w-sm">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                #{prod.id_produk}
                              </span>
                              <span className="font-bold text-gray-900 text-sm truncate">
                                {prod.nama_produk}
                              </span>
                              {isMakaroni && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                  Katalog Khusus
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5 max-w-xs sm:max-w-sm">
                              {prod.deskripsi || 'Tidak ada deskripsi'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Kolom 2: Harga Jual */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-gray-900 text-xs block">
                          Rp {Number(prod.harga).toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          per {prod.satuan || 'Bal'}
                        </span>
                      </td>

                      {/* Kolom 3: Terjual */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-xs text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                          <ShoppingBag className="w-3 h-3 text-amber-700" />
                          <span>{prod.terjual ?? 0} {prod.satuan || 'Bal'}</span>
                        </span>
                      </td>

                      {/* Kolom 4: Kapasitas Stok Jual */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-gray-900 text-xs block">
                          {prod.stok} {prod.satuan || 'Bal'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono block">
                          (~{prod.stok * 5} Kg mentah)
                        </span>
                      </td>

                      {/* Kolom 5: Status Stok */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Tersedia
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Menipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3 h-3 text-red-600" />
                            Habis
                          </span>
                        )}
                      </td>

                      {/* Kolom 6: Aksi Kelola (CRUD) */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenRestockModal(prod)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
                            title="Restock Pasokan Supplier"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Restock</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenEditModal(prod)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition active:scale-95 shadow-sm"
                            title="Edit Produk & Foto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(prod)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 font-bold text-xs rounded-xl border border-red-200 transition active:scale-95 shadow-sm"
                            title="Hapus Produk dari Katalog"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
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

      {/* SINKRONISASI STOK BAHAN MENTAH DI DAPUR PENGGORENGAN */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-orange-600" />
              Monitoring Bahan Mentah Dapur Penggorengan (1 Bal = 5 Kg)
            </h3>
            <p className="text-[11px] text-gray-500">
              Pasokan supplier bertambah saat Owner restock, dan berkurang otomatis sesuai pesanan kerupuk goreng dadakan pelanggan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stockList
            .filter((s: any) => s.kategori !== 'Plastik')
            .map((stok: any) => {
              const isMentah = stok.kategori === 'Kerupuk Mentah';
              const balEquivalent = isMentah ? Math.floor(stok.jumlah / 5) : null;
              return (
                <div
                  key={stok.id_stok}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-2xl hover:border-brand-maroon/30 transition"
                >
                  <span className="text-xs font-bold text-gray-800 block truncate">
                    {stok.nama_bahan}
                  </span>
                  <span className="text-base font-black text-brand-maroon mt-1 block">
                    {stok.jumlah} {stok.satuan}
                  </span>
                  {isMentah && balEquivalent !== null && (
                    <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 block w-fit mt-1">
                      Setara {balEquivalent} Bal
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Update: {stok.tanggal_update}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
