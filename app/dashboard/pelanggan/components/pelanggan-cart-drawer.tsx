'use client';

import React, { useState } from 'react';
import { ShoppingCart, X, Trash2, Plus, Minus, CheckCircle2, Building2, Copy, Check } from 'lucide-react';
import { formatVarianRasa, DAFTAR_REKENING_BANK } from '@/lib/pricing';
import { CartItem } from '../types';

interface PelangganCartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  cartMetode: string;
  setCartMetode: (m: string) => void;
  isSubmittingCart: boolean;
  onClose: () => void;
  onClearCart: () => void;
  onRemoveItem: (cartId: string) => void;
  onUpdateQty: (cartId: string, delta: number) => void;
  onCheckout: () => Promise<void>;
}

export default function PelangganCartDrawer({
  isOpen,
  cart,
  cartMetode,
  setCartMetode,
  isSubmittingCart,
  onClose,
  onClearCart,
  onRemoveItem,
  onUpdateQty,
  onCheckout,
}: PelangganCartDrawerProps) {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const handleCopyAccount = (noRek: string, bankName: string) => {
    navigator.clipboard?.writeText(noRek);
    setCopiedAccount(bankName);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-brand-maroon" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">Keranjang Belanja</h3>
              <p className="text-xs text-gray-500">
                {cart.length > 0 ? `${cart.length} varian kerupuk siap dipesan` : 'Keranjang masih kosong'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition"
              >
                Kosongkan
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Item List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[50vh]">
          {cart.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <h4 className="font-bold text-gray-700 text-base">Keranjang Masih Kosong</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Pilih aneka kerupuk lezat di katalog, lalu klik &quot;+ Keranjang&quot; untuk memesan beberapa varian sekaligus.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cart_id}
                className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center gap-3 hover:border-amber-300 transition"
              >
                {item.produk.gambar_url ? (
                  <img
                    src={item.produk.gambar_url}
                    alt={item.produk.nama_produk}
                    className="w-16 h-16 rounded-xl object-cover border border-amber-200/60 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-2xl shrink-0">
                    🍘
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm truncate">{item.produk.nama_produk}</h4>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-semibold bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded-md">
                      Rasa: {formatVarianRasa(item.varian_rasa)}
                    </span>
                    <span className="text-[10px] font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md">
                      Kemasan: {item.ukuran_plastik}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    Rp {item.harga_per_bal.toLocaleString('id-ID')} / {item.produk.satuan}
                  </div>
                </div>

                {/* Qty Controls & Price */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.cart_id)}
                    className="text-gray-400 hover:text-red-500 transition p-1"
                    title="Hapus item ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.cart_id, -1)}
                      className="w-6 h-6 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 transition active:scale-95"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-xs text-gray-900 min-w-[20px] text-center font-mono">
                      {item.jumlah}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.cart_id, 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 transition active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-black text-brand-maroon text-xs sm:text-sm font-mono">
                    Rp {item.total_harga.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout */}
        {cart.length > 0 && (
          <div className="pt-4 border-t border-gray-200 mt-3 space-y-3">
            {/* Pilihan Metode Pembayaran */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Pilihan Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'tunai', label: 'Tunai di Pabrik' },
                  { id: 'transfer', label: 'Transfer Bank' },
                  { id: 'qris', label: 'QRIS Instan' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCartMetode(m.id)}
                    className={`p-2 rounded-xl border text-center transition font-semibold text-xs ${
                      cartMetode === m.id
                        ? 'bg-brand-50 border-brand-maroon text-brand-maroon ring-1 ring-brand-maroon'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Rincian Pilihan Rekening Resmi (BCA, Mandiri, BJB) */}
              {cartMetode === 'transfer' && (
                <div className="mt-3 p-3 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs space-y-2 animate-fadeIn max-h-48 overflow-y-auto">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                    <Building2 className="w-4 h-4 text-blue-700" />
                    <span>Pilihan Rekening Resmi Pabrik Kerupuk Diansyah:</span>
                  </div>
                  <div className="space-y-1.5">
                    {DAFTAR_REKENING_BANK.map((rek) => (
                      <div
                        key={rek.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-blue-100 shadow-xs"
                      >
                        <div>
                          <span className="font-bold text-gray-900 text-[11px] block">{rek.bank}</span>
                          <span className="font-mono font-black text-blue-900 text-xs">{rek.nomor}</span>
                          <span className="text-[10px] text-gray-400 block">a/n {rek.pemilik}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount(rek.nomor, rek.bank)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center gap-1 transition"
                        >
                          {copiedAccount === rek.bank ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedAccount === rek.bank ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-blue-700 leading-tight">
                    * Silakan transfer ke salah satu rekening di atas (BCA, Mandiri, atau BJB). Setelah checkout, Anda dapat mengunggah bukti screenshot transfer.
                  </p>
                </div>
              )}
            </div>

            {/* Ringkasan Total */}
            {(() => {
              const totalQty = cart.reduce((sum, it) => sum + it.jumlah, 0);
              const grandTotal = cart.reduce((sum, it) => sum + it.total_harga, 0);
              return (
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-500 block">Total Pembayaran ({totalQty} Bal):</span>
                    <span className="text-[11px] text-gray-400">{cart.length} Varian Kerupuk</span>
                  </div>
                  <span className="text-lg font-black text-brand-maroon font-mono">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              );
            })()}

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition"
              >
                Kembali Belanja
              </button>
              <button
                type="button"
                onClick={onCheckout}
                disabled={isSubmittingCart}
                className="py-3 px-4 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold rounded-2xl transition shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>{isSubmittingCart ? 'Memproses...' : 'Checkout & Pesan Semua'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
