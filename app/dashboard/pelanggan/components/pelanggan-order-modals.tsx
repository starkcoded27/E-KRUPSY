'use client';

import React from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  ShoppingBag,
  Banknote,
  QrCode,
  Building2,
  Copy,
  Check,
} from 'lucide-react';
import StateAlert, { StateType } from '@/components/ui/state-alert';
import {
  getHargaBumbu,
  getHargaPlastik,
  DAFTAR_VARIAN_OPTIONS,
  DAFTAR_PLASTIK_OPTIONS,
  formatVarianRasa,
  DAFTAR_REKENING_BANK,
} from '@/lib/pricing';
import { Produk } from '../types';

interface AddToCartModalProps {
  product: Produk | null;
  qty: number;
  setQty: React.Dispatch<React.SetStateAction<number>>;
  varian: string;
  setVarian: (v: string) => void;
  plastik: string;
  setPlastik: (p: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function AddToCartModal({
  product,
  qty,
  setQty,
  varian,
  setVarian,
  plastik,
  setPlastik,
  onClose,
  onConfirm,
}: AddToCartModalProps) {
  if (!product) return null;

  const base = Number(product.harga) || 0;
  const bumbu = getHargaBumbu(varian);
  const plastikPrice = getHargaPlastik(plastik);
  const perBal = base + bumbu + plastikPrice;
  const total = perBal * qty;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-3">
            {product.gambar_url ? (
              <img
                src={product.gambar_url}
                alt={product.nama_produk}
                className="w-14 h-14 rounded-2xl object-cover border border-amber-200/60 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-2xl shrink-0">
                🍘
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">
                Tambah ke Keranjang
              </h3>
              <p className="text-xs text-brand-maroon font-bold mt-0.5">
                {product.nama_produk} &bull; Rp {Number(product.harga).toLocaleString('id-ID')}/{product.satuan}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Jumlah Pesanan */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-gray-700">
                Jumlah Pesanan ({product.satuan}) <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="1"
                max={product.stok}
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, Math.min(product.stok, parseInt(e.target.value) || 1)))
                }
                className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-center text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
              />
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.stok, q + 1))}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pilihan Varian Rasa */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">
              Pilihan Varian Rasa
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DAFTAR_VARIAN_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setVarian(opt.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                    varian === opt.id
                      ? 'bg-amber-50 border-brand-maroon text-brand-maroon font-bold ring-1 ring-brand-maroon'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="text-[10px] text-gray-500 font-normal">
                    {opt.harga > 0 ? `+Rp ${opt.harga.toLocaleString('id-ID')}` : 'Gratis'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Pilihan Ukuran Kemasan Plastik */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">
              Pilihan Kemasan Plastik
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DAFTAR_PLASTIK_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPlastik(opt.id)}
                  className={`p-2 rounded-xl border text-center text-xs transition ${
                    plastik === opt.id
                      ? 'bg-amber-50 border-brand-maroon text-brand-maroon font-bold ring-1 ring-brand-maroon'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="block font-semibold">{opt.label}</span>
                  <span className="text-[10px] text-gray-500 block">
                    {opt.harga > 0 ? `+Rp ${opt.harga.toLocaleString('id-ID')}` : 'Gratis'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Subtotal Item */}
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-500 block">Subtotal Varian Ini:</span>
              <span className="text-[11px] text-gray-400">
                {qty} Bal &bull; Rp {perBal.toLocaleString('id-ID')}/Bal
              </span>
            </div>
            <span className="text-base font-black text-brand-maroon font-mono">
              Rp {total.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-2xl transition shadow-md flex items-center justify-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>+ Masukkan Keranjang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DirectOrderModalProps {
  product: Produk | null;
  qty: number;
  setQty: (q: number) => void;
  varian: string;
  setVarian: (v: string) => void;
  plastik: string;
  setPlastik: (p: string) => void;
  metode: string;
  setMetode: (m: string) => void;
  actionState: { type: StateType; message: string | null };
  setActionState: React.Dispatch<React.SetStateAction<{ type: StateType; message: string | null }>>;
  validationErrors: Record<string, string>;
  copiedAccount: string | null;
  onCopyAccount: (acc: string, key: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function DirectOrderModal({
  product,
  qty,
  setQty,
  varian,
  setVarian,
  plastik,
  setPlastik,
  metode,
  setMetode,
  actionState,
  setActionState,
  validationErrors,
  copiedAccount,
  onCopyAccount,
  onClose,
  onSubmit,
}: DirectOrderModalProps) {
  if (!product) return null;

  const hargaKerupukSatuan = Number(product.harga) || 0;
  const hargaBumbuSatuan = getHargaBumbu(varian);
  const hargaPlastikSatuan = getHargaPlastik(plastik);
  const q = Math.max(1, Number(qty) || 1);
  const totalKerupuk = hargaKerupukSatuan * q;
  const totalBumbu = hargaBumbuSatuan * q;
  const totalPlastik = hargaPlastikSatuan * q;
  const grandTotal = totalKerupuk + totalBumbu + totalPlastik;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-3">
            {product.gambar_url ? (
              <img
                src={product.gambar_url}
                alt={product.nama_produk}
                className="w-14 h-14 rounded-2xl object-cover border border-amber-200/60 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-2xl shrink-0">
                🍘
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">{product.nama_produk}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-black text-brand-maroon font-mono">
                  Rp {Number(product.harga).toLocaleString('id-ID')}/{product.satuan}
                </span>
                <span className="text-gray-300">&bull;</span>
                <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3 text-amber-700" />
                  {product.terjual ?? 0} terjual
                </span>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-xl text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {actionState.message && (
          <div className="mb-4">
            <StateAlert
              type={actionState.type}
              message={actionState.message}
              onClose={() => setActionState({ type: 'idle', message: null })}
            />
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Jumlah Pesanan */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-700">
                Jumlah Pesanan ({product.satuan}) <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">
                Tersedia: {product.stok} {product.satuan}
              </span>
            </div>
            <input
              type="number"
              min="1"
              max={product.stok}
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
              required
            />
            {validationErrors.jumlah && (
              <p className="text-[11px] text-red-600 mt-1 font-medium">{validationErrors.jumlah}</p>
            )}
          </div>

          {/* Varian Rasa */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-700">
                Pilihan Varian Rasa <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-brand-maroon font-semibold">+Biaya Bumbu Tertera</span>
            </div>
            <select
              value={varian}
              onChange={(e) => setVarian(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
            >
              {DAFTAR_VARIAN_OPTIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} (+Rp {v.harga.toLocaleString('id-ID')} / bal)
                </option>
              ))}
            </select>
          </div>

          {/* Kemasan Plastik */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-700">
                Ukuran Kemasan Plastik <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-blue-800 font-semibold">+Biaya Kemasan Tertera</span>
            </div>
            <select
              value={plastik}
              onChange={(e) => setPlastik(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
            >
              {DAFTAR_PLASTIK_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} (+Rp {p.harga.toLocaleString('id-ID')} / bal)
                </option>
              ))}
            </select>
          </div>

          {/* Metode Pembayaran */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Metode Pembayaran <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMetode('tunai')}
                className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  metode === 'tunai'
                    ? 'border-brand-maroon bg-brand-50 text-brand-maroon'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Tunai (Cash)</span>
              </button>
              <button
                type="button"
                onClick={() => setMetode('qris')}
                className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  metode === 'qris'
                    ? 'border-brand-maroon bg-brand-50 text-brand-maroon'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span>QRIS Instan</span>
              </button>
              <button
                type="button"
                onClick={() => setMetode('transfer')}
                className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  metode === 'transfer'
                    ? 'border-brand-maroon bg-brand-50 text-brand-maroon'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Transfer Bank</span>
              </button>
            </div>

            {metode === 'transfer' && (
              <div className="mt-3 p-3 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs space-y-2 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                  <Building2 className="w-4 h-4 text-blue-700" />
                  <span>Rekening Resmi Pabrik Kerupuk Diansyah:</span>
                </div>
                <div className="space-y-1.5">
                  {DAFTAR_REKENING_BANK.map((rek) => (
                    <div key={rek.id} className="flex items-center justify-between p-2 rounded-xl bg-white border border-blue-100 shadow-xs">
                      <div>
                        <span className="font-bold text-gray-900 text-[11px] block">{rek.bank}</span>
                        <span className="font-mono font-black text-blue-900 text-xs">{rek.nomor}</span>
                        <span className="text-[10px] text-gray-400 block">a/n {rek.pemilik}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onCopyAccount(rek.nomor, rek.bank)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center gap-1 transition"
                      >
                        {copiedAccount === rek.bank ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedAccount === rek.bank ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {metode === 'qris' && (
              <div className="mt-3 p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-1.5 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                  <QrCode className="w-4 h-4 text-amber-700" />
                  <span>Pembayaran Otomatis QRIS Nasional:</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Setelah pesanan dibuat, kode QR resmi akan tampil di layar untuk di-scan melalui BCA, Livin, BRImo, GoPay, OVO, Dana, ShopeePay.
                </p>
              </div>
            )}

            {metode === 'tunai' && (
              <div className="mt-3 p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-1 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-gray-800 font-bold">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Pembayaran Tunai Fisik (COD):</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Selesaikan pembayaran langsung ke kasir pabrik saat serah terima pesanan.
                </p>
              </div>
            )}
          </div>

          {/* Ringkasan Biaya */}
          <div className="bg-gradient-to-br from-gray-50 to-amber-50/40 rounded-2xl p-4 border border-gray-200 space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>Harga Kerupuk ({q} {product.satuan}):</span>
              <span className="font-mono font-medium">Rp {totalKerupuk.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>Tambahan Bumbu ({formatVarianRasa(varian)}):</span>
              <span className="font-mono font-medium text-brand-maroon">+Rp {totalBumbu.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>Tambahan Kemasan ({plastik}):</span>
              <span className="font-mono font-medium text-blue-800">+Rp {totalPlastik.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center pt-2.5 border-t border-gray-200 text-sm font-black text-gray-900">
              <div>
                <span className="block leading-tight">Total Pembayaran:</span>
                <span className="text-[10px] text-gray-400 font-normal">Gabungan Kerupuk + Bumbu + Kemasan</span>
              </div>
              <span className="text-brand-maroon text-xl font-mono font-black">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
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
              disabled={actionState.type === 'loading'}
              className="py-3 px-4 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold rounded-2xl shadow-md transition disabled:opacity-50"
            >
              {actionState.type === 'loading' ? 'Memproses...' : 'Kirim Pesanan Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
