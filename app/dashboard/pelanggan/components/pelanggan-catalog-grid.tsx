'use client';

import React from 'react';
import { Search, ShoppingBag, ShoppingCart, Plus } from 'lucide-react';
import { Produk } from '../types';

interface PelangganCatalogGridProps {
  products: Produk[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddToCart: (product: Produk) => void;
  onDirectOrder: (product: Produk) => void;
}

export default function PelangganCatalogGrid({
  products,
  searchQuery,
  setSearchQuery,
  onAddToCart,
  onDirectOrder,
}: PelangganCatalogGridProps) {
  const filteredProducts = products.filter((p) =>
    p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari jenis kerupuk..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon shadow-sm"
        />
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-bold text-gray-800 text-base">Produk Tidak Ditemukan</h4>
          <p className="text-xs text-gray-500 mt-1">
            Tidak ada varian kerupuk yang sesuai dengan kata kunci &quot;{searchQuery}&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((item) => (
            <div
              key={item.id_produk}
              className="group bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-300/80 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Foto Produk */}
              <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-100/30 overflow-hidden border-b border-gray-100">
                {item.gambar_url ? (
                  <img
                    src={item.gambar_url}
                    alt={item.nama_produk}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-100/60 to-orange-100/60 text-amber-800 p-4">
                    <span className="text-5xl mb-1 filter drop-shadow select-none">🍘</span>
                    <span className="text-[10px] font-black text-amber-900/70 uppercase tracking-widest text-center">
                      Pabrik Kerupuk Diansyah
                    </span>
                  </div>
                )}
              </div>

              {/* Info Produk & Terjual */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-brand-maroon transition-colors leading-snug line-clamp-1">
                    {item.nama_produk}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.deskripsi || 'Kerupuk khas renyah dan gurih produksi Pabrik Kerupuk Diansyah.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-gray-400 font-medium">Harga / {item.satuan}:</span>
                    <span className="text-lg sm:text-xl font-black text-brand-maroon tracking-tight font-mono">
                      Rp {Number(item.harga).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-dashed border-gray-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 bg-amber-50/90 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                      <ShoppingBag className="w-3.5 h-3.5 text-brand-maroon shrink-0" />
                      <span>{item.terjual ?? 0} terjual</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="p-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onAddToCart(item)}
                  disabled={item.stok <= 0}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold py-2.5 px-2 rounded-xl transition shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Tambah varian ini ke keranjang belanja"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-amber-700" />
                  <span>+ Keranjang</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDirectOrder(item)}
                  disabled={item.stok <= 0}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold py-2.5 px-2 rounded-xl transition shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Langsung pesan varian ini sekarang"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{item.stok > 0 ? 'Pesan Sekarang' : 'Habis'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
