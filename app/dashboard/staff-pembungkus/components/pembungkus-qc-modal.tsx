'use client';

import React from 'react';
import { ClipboardCheck, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { ProduksiItem } from '../types';

interface PembungkusQcModalProps {
  verifTarget: ProduksiItem | null;
  qcStatus: string;
  setQcStatus: (val: string) => void;
  qcNotes: string;
  setQcNotes: (val: string) => void;
  verifErrors: Record<string, string>;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function PembungkusQcModal({
  verifTarget,
  qcStatus,
  setQcStatus,
  qcNotes,
  setQcNotes,
  verifErrors,
  isLoading,
  onClose,
  onSubmit,
}: PembungkusQcModalProps) {
  if (!verifTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Verifikasi Mutu & QC</h3>
              <p className="text-[11px] text-gray-500">
                Pesanan #{verifTarget.id_pesanan} &bull; {verifTarget.produk?.nama_produk}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Status Kelayakan (Domain Check) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Hasil Pemeriksaan Fisik Kerupuk <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQcStatus('Lolos Verifikasi')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  qcStatus === 'Lolos Verifikasi'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Lolos Verifikasi</span>
              </button>
              <button
                type="button"
                onClick={() => setQcStatus('Cacat / Tidak Sesuai')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  qcStatus === 'Cacat / Tidak Sesuai'
                    ? 'border-red-500 bg-red-50 text-red-800'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Cacat / Rusak</span>
              </button>
            </div>
          </div>

          {/* Catatan / Keterangan (Existence Check) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Catatan Pemeriksaan Fisik <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={qcNotes}
              onChange={(e) => setQcNotes(e.target.value)}
              placeholder="Contoh: Kerenyahan dan rasa sesuai standar pabrik."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              required
            />
            {verifErrors.keterangan && (
              <p className="text-[11px] text-red-600 mt-1">{verifErrors.keterangan}</p>
            )}
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
              disabled={isLoading}
              className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md transition disabled:opacity-50"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Verifikasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
