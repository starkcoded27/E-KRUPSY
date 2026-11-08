'use client';

import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, RefreshCw, Flame } from 'lucide-react';
import { formatVarianRasa } from '@/lib/pricing';
import { ProduksiItem } from '../types';

interface PenggorengTaskListProps {
  tasks: ProduksiItem[];
  onUpdateStatus: (item: ProduksiItem, nextStatus: string, label: string) => Promise<void>;
}

export default function PenggorengTaskList({ tasks, onUpdateStatus }: PenggorengTaskListProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Antrean Pesanan Masuk Penggorengan ({tasks.length})
          </h2>
          <p className="text-xs text-gray-500">
            Pesanan yang masuk dari pelanggan dan harus diproses penggorengannya di wajan
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-gray-700">Semua antrean penggorengan telah selesai dikerjakan.</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Pesanan baru dari pelanggan akan otomatis muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((item) => {
            const isWaiting = item.status_produksi === 'menunggu';
            const isFrying = item.status_produksi === 'diproses';
            const hasVerification = Boolean(item.verifikasi && item.verifikasi.length > 0);
            const latestVerif = hasVerification ? item.verifikasi![0] : null;
            const isLolos = latestVerif?.status === 'Lolos Verifikasi';
            const isReadyQC = item.status_produksi === 'siap_diverifikasi' && !hasVerification;

            return (
              <div
                key={item.id_produksi}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-orange-200 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                      Pesanan #{item.id_pesanan}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isWaiting
                          ? 'bg-gray-200 text-gray-700'
                          : isFrying
                          ? 'bg-orange-100 text-orange-800 border border-orange-300 animate-pulse'
                          : hasVerification && isLolos
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : hasVerification && !isLolos
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      }`}
                    >
                      {isWaiting
                        ? 'Menunggu Wajan'
                        : isFrying
                        ? 'Sedang Digoreng'
                        : hasVerification && isLolos
                        ? '✓ Lolos Verifikasi Pembungkus'
                        : hasVerification && !isLolos
                        ? '⚠ Cacat / Perlu Digoreng Ulang'
                        : 'Selesai Goreng (Siap QC)'}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base sm:text-lg">{item.produk?.nama_produk}</h3>
                  <div className="text-gray-600 mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs sm:text-sm">
                    <span>
                      Target: <strong className="text-gray-800">{item.pesanan?.jumlah} {item.produk?.satuan}</strong>
                    </span>
                    <span>
                      Varian Rasa: <strong className="text-orange-700">{formatVarianRasa(item.pesanan?.varian_rasa)}</strong>
                    </span>
                    <span>
                      Pelanggan: <strong className="text-gray-800">{item.pesanan?.pelanggan?.nama_lengkap || '-'}</strong>
                    </span>
                  </div>

                  {/* FEEDBACK VERIFIKASI DARI STAF PEMBUNGKUS */}
                  {hasVerification && latestVerif && (
                    <div
                      className={`mt-3 p-3 rounded-xl border text-xs ${
                        isLolos
                          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                          : 'bg-red-50/90 border-red-200 text-red-900'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          {isLolos ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                          Hasil Verifikasi Staf Pembungkus: {latestVerif.status}
                        </span>
                      </div>
                      <p className="mt-1.5 italic bg-white/80 p-2 rounded-lg border border-gray-100">
                        &ldquo;{latestVerif.keterangan}&rdquo;
                      </p>
                      {isLolos ? (
                        <span className="text-[11px] text-emerald-700 mt-1.5 block font-medium">
                          Kerupuk telah diserahterimakan dan sedang dalam proses pengemasan plastik.
                        </span>
                      ) : (
                        <div className="mt-2 flex items-center justify-between pt-1">
                          <span className="text-[11px] text-red-700 font-medium">
                            Kualitas belum sesuai. Silakan lakukan penggorengan ulang.
                          </span>
                          <button
                            onClick={() => onUpdateStatus(item, 'diproses', 'Sedang Digoreng Ulang')}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow transition"
                          >
                            <RefreshCw className="w-3 h-3" /> Goreng Ulang
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {isWaiting && (
                    <button
                      onClick={() => onUpdateStatus(item, 'diproses', 'Sedang Digoreng')}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition"
                    >
                      <Flame className="w-4 h-4" />
                      Mulai Goreng
                    </button>
                  )}

                  {isFrying && (
                    <button
                      onClick={() => onUpdateStatus(item, 'siap_diverifikasi', 'Selesai Goreng (Siap Diverifikasi)')}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Selesai Goreng (Kirim ke QC)
                    </button>
                  )}

                  {isReadyQC && (
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-2 rounded-xl border border-blue-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Menunggu Verifikasi Staf Pembungkus &rarr;
                    </span>
                  )}

                  {hasVerification && isLolos && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Terverifikasi QC &bull; Sedang Dikemas
                    </span>
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
