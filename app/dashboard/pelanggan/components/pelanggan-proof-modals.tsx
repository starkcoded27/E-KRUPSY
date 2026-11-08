'use client';

import React from 'react';
import {
  X,
  ExternalLink,
  Download,
  CheckCircle2,
  Building2,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';
import { Pesanan } from '../types';

interface QrisModalProps {
  order: Pesanan | null;
  qrisReceiptData: any | null;
  isProcessingQris: boolean;
  onPayQris: (order: Pesanan) => Promise<void>;
  onClose: () => void;
}

export function QrisModal({
  order,
  qrisReceiptData,
  isProcessingQris,
  onPayQris,
  onClose,
}: QrisModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn print:hidden">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {!qrisReceiptData ? (
          <div className="space-y-4">
            {/* Banner QRIS */}
            <div className="rounded-2xl overflow-hidden border border-red-200 shadow-md">
              <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-white text-red-700 font-black text-xs px-2 py-0.5 rounded tracking-wider shadow-sm">
                    QRIS
                  </div>
                  <span className="text-[10px] font-bold tracking-tight uppercase">
                    Standar Pembayaran Nasional
                  </span>
                </div>
                <span className="text-[9px] font-mono bg-white/20 px-2 py-0.5 rounded font-bold">
                  GPN / BI
                </span>
              </div>

              <div className="p-4 bg-gray-50/70 text-center">
                <div className="mb-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 mb-1">
                    QRIS RESMI PERUSAHAAN
                  </span>
                  <h3 className="font-black text-gray-900 text-base uppercase tracking-tight">
                    PABRIK KERUPUK DIANSAH
                  </h3>
                  <p className="text-[10px] text-gray-600 font-mono font-bold mt-0.5">
                    NMID : ID1025393458506 &bull; A01
                  </p>
                </div>

                <div className="relative my-2.5 rounded-2xl overflow-hidden border-2 border-red-100 shadow-md bg-white group">
                  <img
                    src="/images/qris-pabrik-diansyah.jpg"
                    alt="QRIS Resmi Pabrik Kerupuk Diansah"
                    className="w-full max-h-[380px] object-contain mx-auto bg-white transition duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                    <a
                      href="/images/qris-pabrik-diansyah.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-black/75 hover:bg-black text-white text-[10px] font-bold rounded-lg backdrop-blur-sm transition flex items-center gap-1 shadow-md"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Buka Penuh</span>
                    </a>
                    <a
                      href="/images/qris-pabrik-diansyah.jpg"
                      download="QRIS-Pabrik-Kerupuk-Diansah.jpg"
                      className="px-2.5 py-1 bg-brand-maroon/90 hover:bg-brand-maroon text-white text-[10px] font-bold rounded-lg backdrop-blur-sm transition flex items-center gap-1 shadow-md"
                    >
                      <Download className="w-3 h-3" />
                      <span>Unduh QRIS</span>
                    </a>
                  </div>
                </div>

                <div className="bg-amber-100/80 border border-amber-300 rounded-2xl p-3 shadow-inner">
                  <span className="text-[11px] font-bold text-amber-900 block">TOTAL TAGIHAN PEMBAYARAN:</span>
                  <span className="text-2xl font-black text-brand-maroon font-mono">
                    Rp {Number(order.total_harga).toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-amber-800 block mt-0.5">
                    Pesanan #{order.id_pesanan} &bull; {order.produk?.nama_produk} ({order.jumlah} {order.produk?.satuan || 'Bal'})
                  </span>
                </div>
              </div>
            </div>

            {/* E-Wallets */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-center">
              <p className="text-[10px] text-gray-500 font-semibold mb-1">
                Mendukung Seluruh Aplikasi Pembayaran QRIS:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9px] font-bold text-gray-600">
                <span className="px-2 py-0.5 bg-white rounded-md border border-gray-200">GoPay</span>
                <span className="px-2 py-0.5 bg-white rounded-md border border-gray-200">OVO</span>
                <span className="px-2 py-0.5 bg-white rounded-md border border-gray-200">DANA</span>
                <span className="px-2 py-0.5 bg-white rounded-md border border-gray-200">ShopeePay</span>
                <span className="px-2 py-0.5 bg-white rounded-md border border-gray-200">BCA Mobile</span>
                <span className="px-2 py-0.5 bg-white rounded-md border border-gray-200">Livin</span>
                <span className="px-2 py-0.5 bg-white rounded-md border border-gray-200">BRImo</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                disabled={isProcessingQris}
                onClick={() => onPayQris(order)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>{isProcessingQris ? 'Memverifikasi Pembayaran QRIS...' : '⚡ Selesaikan Pembayaran QRIS (Simulasi Scan)'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition"
              >
                Tutup & Bayar Nanti
              </button>
            </div>
          </div>
        ) : (
          /* Struk Resmi QRIS */
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center pb-3 border-b border-dashed border-gray-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 font-bold mx-auto flex items-center justify-center mb-2 shadow-inner">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block mb-1">
                TRANSAKSI QRIS BERHASIL & DITERIMA OWNER
              </span>
              <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">STRUK PEMBAYARAN QRIS</h3>
              <p className="text-[11px] text-gray-500">Pabrik Kerupuk Diansyah &bull; Sumedang</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>ID Pesanan:</span>
                <span className="font-mono font-bold text-gray-900">#{order.id_pesanan}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tanggal Bayar:</span>
                <span className="font-mono">{qrisReceiptData.tanggal || new Date().toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total Lunas:</span>
                <span className="font-mono font-black text-emerald-700 text-sm">
                  Rp {Number(qrisReceiptData.jumlah || order.total_harga).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs rounded-2xl shadow-md transition"
            >
              Selesai & Kembali ke Pesanan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface UploadTransferProofModalProps {
  order: Pesanan | null;
  transferBank: string;
  setTransferBank: (b: string) => void;
  transferCatatan: string;
  setTransferCatatan: (c: string) => void;
  transferImage: string | null;
  isUploadingTransfer: boolean;
  copiedAccount: string | null;
  onCopyAccount: (acc: string, key: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

export function UploadTransferProofModal({
  order,
  transferBank,
  setTransferBank,
  transferCatatan,
  setTransferCatatan,
  transferImage,
  isUploadingTransfer,
  copiedAccount,
  onCopyAccount,
  onImageChange,
  onSubmit,
  onClose,
}: UploadTransferProofModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Upload Bukti Transfer Bank</h3>
              <p className="text-[11px] text-gray-500">
                Pesanan #{order.id_pesanan} &bull; Tagihan Rp {Number(order.total_harga).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Info Rekening */}
          <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900">Rekening Tujuan BCA:</span>
              <button
                type="button"
                onClick={() => onCopyAccount('7405136830', 'BCA')}
                className="text-blue-700 font-bold text-[10px] flex items-center gap-1 hover:underline"
              >
                {copiedAccount === 'BCA' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAccount === 'BCA' ? 'Tersalin' : 'Salin BCA'}</span>
              </button>
            </div>
            <p className="font-mono text-sm font-black text-blue-950">7405136830</p>
            <p className="text-[11px] text-gray-600">a/n Anita Nurhayati (Pabrik Kerupuk Diansyah)</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Bank Pengirim Anda</label>
            <input
              type="text"
              value={transferBank}
              onChange={(e) => setTransferBank(e.target.value)}
              placeholder="Contoh: Bank BCA a/n Budi Santoso"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
              required
            />
          </div>

          {/* Upload Foto */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Foto Bukti Screenshot / Struk Transfer <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              required
            />
            {transferImage && (
              <div className="mt-3 p-2 border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 text-center">
                <img
                  src={transferImage}
                  alt="Pratinjau Bukti Transfer"
                  className="max-h-48 rounded-xl mx-auto object-contain shadow-sm"
                />
                <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                  ✓ Foto siap diunggah
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
            <textarea
              rows={2}
              value={transferCatatan}
              onChange={(e) => setTransferCatatan(e.target.value)}
              placeholder="Contoh: Transfer via m-BCA jam 14.30 WIB"
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
              disabled={isUploadingTransfer || !transferImage}
              className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md transition disabled:opacity-50"
            >
              {isUploadingTransfer ? 'Mengunggah...' : 'Kirim Bukti Bayar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ProofPreviewModalProps {
  preview: { image: string; orderId: number; title: string } | null;
  onClose: () => void;
}

export function ProofPreviewModal({ preview, onClose }: ProofPreviewModalProps) {
  if (!preview) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pb-3 border-b border-gray-100 mb-4">
          <h3 className="font-bold text-gray-900 text-base">{preview.title}</h3>
          <p className="text-xs text-gray-500">Pesanan #{preview.orderId}</p>
        </div>

        <div className="max-h-[65vh] overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-2 text-center">
          <img
            src={preview.image}
            alt="Bukti Transfer"
            className="w-full object-contain rounded-xl mx-auto shadow-sm"
          />
        </div>

        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
}
