'use client';

import React from 'react';
import { X, Image as ImageIcon, QrCode, Check, ExternalLink } from 'lucide-react';
import { OrderItem } from '../types';

interface OwnerTransferProofModalProps {
  order: OrderItem | null;
  onConfirmPayment: (orderId: number) => Promise<void>;
  onClose: () => void;
}

export function OwnerTransferProofModal({
  order,
  onConfirmPayment,
  onClose,
}: OwnerTransferProofModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Verifikasi Bukti Transfer Bank</h3>
            <p className="text-xs text-gray-400">
              Pesanan #{order.id_pesanan} &bull; {order.pelanggan?.nama_lengkap || 'Pelanggan'}
            </p>
          </div>
        </div>

        {/* Rincian Transaksi */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs mb-4">
          <div>
            <span className="text-gray-400 block text-[10px]">TOTAL YANG HARUS DITRANSFER:</span>
            <span className="font-mono font-black text-brand-maroon text-sm">
              Rp {Number(order.total_harga).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 block text-[10px]">STATUS SAAT INI:</span>
            <span
              className={`font-bold ${
                order.pembayaran?.[0]?.status_pembayaran === 'lunas'
                  ? 'text-emerald-600'
                  : 'text-blue-600'
              }`}
            >
              {order.pembayaran?.[0]?.status_pembayaran === 'lunas' ? '✓ LUNAS' : 'MENUNGGU ACC'}
            </span>
          </div>
        </div>

        {/* Gambar Bukti Screenshot Transfer */}
        <div className="rounded-2xl border border-gray-200 bg-gray-100 p-2 overflow-hidden flex items-center justify-center max-h-[55vh]">
          {order.pembayaran?.[0]?.bukti_transfer ? (
            <img
              src={order.pembayaran[0].bukti_transfer}
              alt="Screenshot Bukti Transfer Pelanggan"
              className="max-h-[50vh] object-contain rounded-xl shadow-sm"
            />
          ) : (
            <div className="p-8 text-center text-gray-400 text-xs">
              Pelanggan belum mengunggah gambar bukti transfer.
            </div>
          )}
        </div>

        {/* Tombol Aksi Owner */}
        <div className="mt-5 flex gap-2 pt-2 border-t border-gray-100">
          {order.pembayaran?.[0]?.status_pembayaran !== 'lunas' && (
            <button
              type="button"
              onClick={async () => {
                await onConfirmPayment(order.id_pesanan);
                onClose();
              }}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>✓ ACC Lunas (Bukti Transfer Sah)</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

interface OwnerQrisProofModalProps {
  order: OrderItem | null;
  onClose: () => void;
}

export function OwnerQrisProofModal({ order, onClose }: OwnerQrisProofModalProps) {
  if (!order) return null;

  let meta: any = null;
  try {
    meta = order.pembayaran?.[0]?.bukti_transfer
      ? JSON.parse(order.pembayaran[0].bukti_transfer)
      : null;
  } catch (e) {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pb-3 border-b border-dashed border-gray-200">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 font-black text-xl mx-auto flex items-center justify-center mb-2 shadow-inner">
            <QrCode className="w-6 h-6" />
          </div>
          <div className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 mb-1">
            ✓ VERIFIKASI QRIS LUNAS
          </div>
          <h3 className="font-black text-gray-900 text-base uppercase">BUKTI PEMBAYARAN QRIS</h3>
          <p className="text-[11px] text-gray-500">
            Dana Otomatis Masuk ke Rekening / Kas Pabrik Kerupuk Diansah
          </p>
        </div>

        <div className="py-3.5 space-y-2.5 text-xs font-mono">
          {/* Visual QRIS Resmi Perusahaan */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-red-50/50 border border-red-200/80 font-sans">
            <img
              src="/images/qris-pabrik-diansyah.jpg"
              alt="QRIS Resmi Perusahaan"
              className="w-14 h-20 object-contain rounded-lg border border-red-200 bg-white shadow-sm shrink-0"
            />
            <div className="text-[11px]">
              <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black bg-red-600 text-white mb-1">
                QRIS RESMI PABRIK
              </span>
              <h4 className="font-black text-gray-900 text-xs">PABRIK KERUPUK DIANSAH</h4>
              <p className="text-[10px] text-gray-600 font-mono mt-0.5">
                NMID: <strong className="text-gray-900">{meta?.nmid || 'ID1025393458506'}</strong> (A01)
              </p>
              <a
                href="/images/qris-pabrik-diansyah.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-brand-maroon hover:underline font-bold inline-flex items-center gap-1 mt-1 font-mono"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Buka QRIS Full-Size</span>
              </a>
            </div>
          </div>

          <div className="flex justify-between p-2 rounded-xl bg-gray-50">
            <span className="text-gray-500">Ref ID QRIS:</span>
            <span className="font-bold text-gray-900">
              {meta?.ref_id || `QRIS-KD-${order.id_pesanan}`}
            </span>
          </div>
          <div className="flex justify-between p-2 rounded-xl bg-gray-50">
            <span className="text-gray-500">Merchant NMID:</span>
            <span className="font-bold text-gray-900">{meta?.nmid || 'ID1025393458506'}</span>
          </div>
          <div className="flex justify-between p-2 rounded-xl bg-gray-50">
            <span className="text-gray-500">Tujuan Dana:</span>
            <span className="font-bold text-emerald-700 text-right">
              E-Wallet / Kas Pabrik Kerupuk Diansah
            </span>
          </div>
          <div className="flex justify-between p-2 rounded-xl bg-gray-50">
            <span className="text-gray-500">Waktu Scan:</span>
            <span className="font-bold text-gray-900 text-[11px]">
              {meta?.paid_at ? new Date(meta.paid_at).toLocaleString('id-ID') : order.tanggal_pesanan}
            </span>
          </div>
          <div className="flex justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="font-bold text-emerald-950">TOTAL DANA MASUK:</span>
            <span className="font-black text-emerald-700 text-sm">
              Rp {Number(order.total_harga).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
