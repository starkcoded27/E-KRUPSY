'use client';

import React from 'react';
import {
  Package,
  AlertTriangle,
  PlusCircle,
  ShoppingBag,
  Edit3,
  Trash2,
  Layers,
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
  if (!produkList || produkList.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
        <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-xs font-bold text-gray-600">Belum ada produk terdaftar di katalog Supabase.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Banner Peringatan Make-To-Order */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl">
        <div className="flex items-center gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <div className="leading-relaxed">
            <p>
              <strong>Sistem Produksi Goreng Dadakan (Make-To-Order):</strong> Stok kerupuk katalog dihitung langsung dari pasokan bahan mentah supplier di dapur penggorengan (<strong>1 Bal = 5 Kg kerupuk mentah</strong>).
            </p>
            <p className="text-[11px] text-amber-800/80 mt-0.5">
              Saat pelanggan memesan, stok mentah di dapur otomatis terpotong. Nama produk bersifat unik (tidak dapat diduplikasi).
            </p>
          </div>
        </div>
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs shadow-sm transition shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          + Tambah Produk Baru
        </button>
      </div>

      {/* Tabel Produk */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-y border-gray-100">
            <tr>
              <th className="py-3 px-3">ID</th>
              <th className="py-3 px-3">Nama Produk Kerupuk</th>
              <th className="py-3 px-3">Satuan</th>
              <th className="py-3 px-3">Harga Jual</th>
              <th className="py-3 px-3 text-center">Volume Terjual</th>
              <th className="py-3 px-3">Kapasitas Stok Jual</th>
              <th className="py-3 px-3">Status Stok</th>
              <th className="py-3 px-3">Keterangan</th>
              <th className="py-3 px-3 text-right min-w-[200px]">Aksi Kelola (CRUD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {produkList.map((prod) => {
              const isMakaroni = prod.nama_produk.toLowerCase().includes('makaroni');
              return (
                <tr
                  key={prod.id_produk}
                  className={`hover:bg-gray-50/70 ${isMakaroni ? 'bg-amber-50/30' : ''}`}
                >
                  <td className="py-3 px-3 font-mono font-bold text-gray-800">#{prod.id_produk}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      {prod.gambar_url ? (
                        <img
                          src={prod.gambar_url}
                          alt={prod.nama_produk}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-sm shrink-0"
                        />
                      ) : (
                        <span className="w-14 h-14 rounded-xl bg-brand-50 text-brand-maroon flex items-center justify-center font-bold text-base shrink-0 border border-brand-100 shadow-inner">
                          🍘
                        </span>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{prod.nama_produk}</span>
                          {isMakaroni && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                              Katalog Khusus
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 max-w-xs truncate mt-0.5">
                          {prod.deskripsi || 'Tidak ada deskripsi'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-gray-700">{prod.satuan}</td>
                  <td className="py-3 px-3 font-mono font-bold text-gray-900">
                    Rp {Number(prod.harga).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-xs text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg">
                      <ShoppingBag className="w-3 h-3 text-amber-700" />
                      {prod.terjual ?? 0} {prod.satuan}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-gray-900 block">
                      {prod.stok} {prod.satuan}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono block">
                      (~{prod.stok * 5} Kg bahan mentah)
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {prod.stok > 10 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ✓ Stok Tersedia
                      </span>
                    ) : prod.stok > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        ⚠ Stok Menipis
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                        ✕ Stok Habis
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-gray-500 max-w-xs truncate">
                    {prod.deskripsi || '-'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenRestockModal(prod)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
                        title="Restock Pasokan Supplier"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+ Restock</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenEditModal(prod)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
                        title="Edit Produk & Ganti Foto"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(prod)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
                        title="Hapus Produk dari Katalog"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
