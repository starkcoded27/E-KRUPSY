'use client';

import React from 'react';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatVarianRasa, parseCartOrderMeta } from '@/lib/pricing';
import { Pesanan } from '../types';

interface PelangganReceiptModalProps {
  order: Pesanan | null;
  customerName?: string;
  customerPhone?: string;
  onClose: () => void;
}

export default function PelangganReceiptModal({
  order,
  customerName,
  customerPhone,
  onClose,
}: PelangganReceiptModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Digital Pass Header */}
        <div className="text-center pb-4 border-b border-dashed border-gray-200">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-2xl mx-auto flex items-center justify-center mb-2 shadow-lg shadow-emerald-600/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="font-black text-gray-900 text-lg uppercase tracking-wide">Pabrik Kerupuk Diansyah</h3>
          <p className="text-[11px] text-gray-500">Jl. Pangeran Kornel No. 204, Pasanggrahan Baru, Sumedang</p>

          {/* Stempel Digital Lunas */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border-2 border-emerald-400 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            STATUS: LUNAS &bull; SAH DITERIMA KASIR
          </div>
        </div>

        {/* Rincian Transaksi */}
        <div className="py-4 space-y-2 text-xs border-b border-dashed border-gray-200">
          <div className="flex justify-between">
            <span className="text-gray-400">Nomor Transaksi:</span>
            <span className="font-mono font-bold text-gray-800">TRX-KD-{order.id_pesanan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Tanggal Pemesanan:</span>
            <span className="font-medium text-gray-800">{order.tanggal_pesanan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Nama Pemesan:</span>
            <span className="font-bold text-gray-800">{customerName || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">No. WhatsApp/HP:</span>
            <span className="font-medium text-gray-800">{customerPhone || '-'}</span>
          </div>
        </div>

        {/* Rincian Produk */}
        <div className="py-4 space-y-2 text-xs border-b border-dashed border-gray-200">
          {(() => {
            const cartMeta = parseCartOrderMeta(order.pembayaran?.[0]?.bukti_transfer);
            if (cartMeta && cartMeta.items?.length) {
              return (
                <div className="space-y-2.5">
                  <div className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex justify-between">
                    <span>Paket Keranjang ({cartMeta.items.length} Macam)</span>
                    <span>Total {order.jumlah} Bal</span>
                  </div>
                  {cartMeta.items.map((it, idx) => (
                    <div key={idx} className="border-b border-gray-100 last:border-none pb-1.5 last:pb-0">
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>
                          {idx + 1}. {it.nama_produk} ({it.jumlah} {it.satuan || 'Bal'})
                        </span>
                        <span>Rp {Number(it.subtotal).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Varian: {formatVarianRasa(it.varian_rasa)} &bull; Kemasan: {it.ukuran_plastik}
                      </div>
                    </div>
                  ))}
                </div>
              );
            }
            return (
              <>
                <div className="flex justify-between font-bold text-gray-900">
                  <span>
                    {order.produk?.nama_produk} ({formatVarianRasa(order.varian_rasa)})
                  </span>
                  <span>
                    {order.jumlah} {order.produk?.satuan}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>Ukuran Kemasan: {order.ukuran_plastik}</span>
                  <span>Rp {Number(order.produk?.harga || 0).toLocaleString('id-ID')} / bal</span>
                </div>
              </>
            );
          })()}

          <div className="flex justify-between pt-2 text-sm font-black text-emerald-700">
            <span>TOTAL SUDAH DIBAYAR:</span>
            <span className="text-base font-black text-brand-maroon">
              Rp {Number(order.total_harga).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Keterangan Serah Terima Pabrik */}
        <div className="py-3 text-center bg-gray-50 rounded-2xl border border-gray-100 my-3 p-3">
          <p className="text-[11px] text-gray-600 font-semibold">
            Tunjukkan tampilan layar ini kepada Owner/Kasir saat mengambil pesanan kerupuk di pabrik.
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            Resi cetak fisik resmi dikeluarkan & dicetak langsung oleh Owner.
          </p>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs rounded-2xl shadow-md transition"
          >
            Tutup Tampilan Tanda Lunas
          </button>
        </div>
      </div>
    </div>
  );
}
