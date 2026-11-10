'use client';

import React from 'react';
import { ClipboardCheck, CheckCircle2, Clock } from 'lucide-react';
import { formatVarianRasa, parseCartOrderMeta, formatOrderDateTime } from '@/lib/pricing';
import { ProduksiItem, StokItem } from '../types';

interface PembungkusTaskListProps {
  tasks: ProduksiItem[];
  stockList: StokItem[];
  onOpenQcModal: (item: ProduksiItem) => void;
  onFinishPacking: (item: ProduksiItem) => Promise<void>;
}

export default function PembungkusTaskList({
  tasks,
  stockList,
  onOpenQcModal,
  onFinishPacking,
}: PembungkusTaskListProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
            Daftar Kerupuk Siap Diverifikasi & Dikemas ({tasks.length})
          </h2>
          <p className="text-xs text-gray-500">
            Kerupuk yang telah selesai digoreng dan memerlukan verifikasi kualitas sebelum diserahkan
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-gray-700">Tidak ada kerupuk yang menunggu verifikasi atau kemas saat ini.</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Setelah bagian penggorengan selesai menggoreng, pesanan akan masuk ke daftar ini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((item) => {
            const hasPassedQC = Boolean(
              item.verifikasi && item.verifikasi.some((v) => v.status === 'Lolos Verifikasi')
            );
            const isPacking =
              (item.status_produksi === 'sedang_dikemas' || hasPassedQC) && item.status_produksi !== 'selesai';
            const isReadyForQC = !isPacking && item.status_produksi === 'siap_diverifikasi';

            const cartMeta = parseCartOrderMeta((item.pesanan as any)?.pembayaran?.[0]?.bukti_transfer);
            const cartItem = cartMeta?.items?.find((c) => c.id_produk === item.id_produk);
            const targetQty = cartItem ? cartItem.jumlah : item.pesanan?.jumlah;
            const targetVarian = cartItem ? cartItem.varian_rasa : item.pesanan?.varian_rasa;
            const targetKemasan = cartItem ? cartItem.ukuran_plastik : item.pesanan?.ukuran_plastik;

            return (
              <div
                key={item.id_produksi}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-200 transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md">
                      Pesanan #{item.id_pesanan} {cartItem ? '(Keranjang)' : ''}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                      <Clock className="w-3 h-3 text-blue-500" />
                      {formatOrderDateTime((item.pesanan as any)?.created_at || (item as any).created_at, (item.pesanan as any)?.tanggal_pesanan)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isReadyForQC
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      {isReadyForQC ? 'Butuh Verifikasi Mutu' : '3. Sedang Dibungkus / Dikemas'}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base sm:text-lg">{item.produk?.nama_produk}</h3>
                  <div className="text-gray-600 mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs sm:text-sm">
                    <span>
                      Target: <strong className="text-gray-800">{targetQty} {item.produk?.satuan || 'Bal'}</strong>
                    </span>
                    <span>
                      Varian: <strong className="text-gray-800">{formatVarianRasa(targetVarian)}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      Kemasan: <strong className="text-blue-700 font-bold">{targetKemasan}</strong>
                      {(() => {
                        const reqUkuran = String(targetKemasan || '').toLowerCase();
                        const matchingPlastic = stockList.find(
                          (s) => s.kategori === 'Plastik' && s.nama_bahan.toLowerCase().includes(reqUkuran)
                        );
                        if (!matchingPlastic || (matchingPlastic.jumlah || 0) <= 0) {
                          return (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 border border-red-300 px-2 py-0.5 rounded-full animate-pulse">
                              ⚠ Stok Plastik Kosong di Gudang!
                            </span>
                          );
                        }
                        return (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                            ✓ Plastik Ready ({matchingPlastic.jumlah} {matchingPlastic.satuan})
                          </span>
                        );
                      })()}
                    </span>
                    <span>
                      Pelanggan: <strong className="text-gray-800">{item.pesanan?.pelanggan?.nama_lengkap || '-'}</strong>
                    </span>
                  </div>

                  {/* Feedback QC yang Tercatat */}
                  {isPacking && item.verifikasi && item.verifikasi.length > 0 && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-blue-50/90 border border-blue-200 text-xs max-w-lg">
                      <div className="flex items-center gap-1.5 font-bold text-blue-900">
                        <ClipboardCheck className="w-4 h-4 text-blue-600" />
                        <span>Feedback QC Terkirim: {item.verifikasi[0].status}</span>
                      </div>
                      <p className="mt-1 text-blue-800 italic bg-white/80 p-1.5 rounded-lg border border-blue-100">
                        &ldquo;{item.verifikasi[0].keterangan}&rdquo;
                      </p>
                      <span className="text-[10px] text-blue-600 mt-1 block">
                        Status: Sedang dibungkus ke plastik &bull; Klik &quot;Selesai Kemas&quot; jika pengemasan selesai.
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {isReadyForQC && (
                    <button
                      onClick={() => onOpenQcModal(item)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      Verifikasi Kualitas (QC)
                    </button>
                  )}

                  {isPacking && (
                    <button
                      onClick={() => onFinishPacking(item)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Selesai Kemas (Siap Diambil)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
