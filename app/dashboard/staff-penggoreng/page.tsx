'use client';

import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/auth/role-guard';
import { useAuth } from '@/context/auth-context';
import StateAlert, { StateType } from '@/components/ui/state-alert';
import { 
  Flame, 
  Package, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ArrowRight, 
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Scale,
  Check
} from 'lucide-react';

interface ProduksiItem {
  id_produksi: number;
  id_pesanan: number;
  id_produk: number;
  tanggal_produksi: string;
  status_produksi: string;
  pesanan?: {
    id_pesanan: number;
    jumlah: number;
    varian_rasa: string;
    ukuran_plastik: string;
    status_pesanan: string;
    pelanggan?: {
      nama_lengkap: string;
      no_telp: string;
    };
  };
  produk?: {
    nama_produk: string;
    satuan: string;
  };
  verifikasi?: {
    id_verifikasi: number;
    status: string;
    keterangan: string;
  }[];
}

export default function StaffPenggorengDashboardPage() {
  const { user } = useAuth();

  // State data
  const [productionList, setProductionList] = useState<ProduksiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3 Kondisi Sistem (State)
  const [actionState, setActionState] = useState<{ type: StateType; message: string | null }>({
    type: 'idle',
    message: null,
  });

  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const resProd = await fetch('/api/produksi');
      const dataProd = await resProd.json();
      if (resProd.ok) setProductionList(dataProd.data || []);
    } catch (err: any) {
      if (!silent) console.error('Error fetch staff penggoreng:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-update antrean live real-time tanpa reload / refresh manual
    const interval = setInterval(() => {
      fetchData(true);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Handler Update Status Produksi
  const handleUpdateStatus = async (item: ProduksiItem, nextStatus: string, label: string) => {
    setActionState({ type: 'loading', message: `Sedang memperbarui status menjadi "${label}"...` });

    try {
      const res = await fetch('/api/produksi', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_produksi: item.id_produksi,
          next_status: nextStatus,
          id_pesanan: item.id_pesanan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionState({ type: 'error', message: data.message || 'Gagal memperbarui status produksi.' });
        return;
      }

      setActionState({
        type: 'success',
        message: `Produksi pesanan #${item.id_pesanan} (${item.produk?.nama_produk}) berhasil diperbarui: "${label}".`,
      });

      await fetchData();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat memperbarui status produksi.' });
    }
  };

  // Filter antrean penggorengan yang belum selesai
  const fryingTasks = productionList.filter((p) => p.status_produksi !== 'selesai');
  const completedTodayTasks = productionList.filter((p) => p.status_produksi === 'selesai');

  return (
    <RoleGuard allowedRoles={['staff_penggoreng']} pageTitle="Dashboard Staf Penggorengan">
      <div className="space-y-6">
        {/* Banner Staf Penggoreng */}
        <div className="bg-gradient-to-r from-orange-700 via-brand-maroon to-amber-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Antrean Penggorengan Wajan
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-orange-100/90">
                Halo, <strong>{user?.nama}</strong>. Proses pesanan masuk dan teruskan ke QC/Pembungkusan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchData()}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 text-xs text-white font-bold bg-white/15 hover:bg-white/25 px-3.5 py-2 rounded-xl border border-white/20 transition active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Segarkan Antrean
              </button>
            </div>
          </div>
        </div>

        {/* Action State Alert */}
        <StateAlert
          type={actionState.type}
          message={actionState.message}
          onClose={() => setActionState({ type: 'idle', message: null })}
        />

        {/* ANTREAN PESANAN PENGGORENGAN (SDD UC-11) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Antrean Pesanan Masuk Penggorengan ({fryingTasks.length})
              </h2>
              <p className="text-xs text-gray-500">
                Pesanan yang masuk dari pelanggan dan harus diproses penggorengannya di wajan
              </p>
            </div>
          </div>

          {fryingTasks.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-700">Semua antrean penggorengan telah selesai dikerjakan.</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Pesanan baru dari pelanggan akan otomatis muncul di sini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fryingTasks.map((item) => {
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
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isWaiting
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : isFrying
                            ? 'bg-orange-100 text-orange-800 border border-orange-300 animate-pulse'
                            : item.status_produksi === 'siap_diverifikasi'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isWaiting
                            ? '⏱️ Menunggu Masuk Wajan'
                            : isFrying
                            ? '🔥 Sedang Digoreng di Wajan'
                            : item.status_produksi === 'siap_diverifikasi'
                            ? '🔍 Siap Diverifikasi QC'
                            : '📦 Sedang Dikemas'}
                        </span>
                      </div>

                      <div className="font-bold text-gray-900 text-sm">
                        {item.produk?.nama_produk} &bull;{' '}
                        <span className="text-orange-700">{item.pesanan?.jumlah} {item.produk?.satuan || 'Bal'}</span>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-600">
                        <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200">
                          Varian: <strong>{item.pesanan?.varian_rasa || 'Original'}</strong>
                        </span>
                        <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200">
                          Kemasan: <strong>{item.pesanan?.ukuran_plastik || '1/2 kg'}</strong>
                        </span>
                        <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200">
                          Pelanggan: <strong>{item.pesanan?.pelanggan?.nama_lengkap || 'Pelanggan'}</strong>
                        </span>
                        <span className="bg-orange-50 text-orange-800 px-2 py-0.5 rounded-md border border-orange-200 font-semibold">
                          Bahan Terpakai: ~{(item.pesanan?.jumlah || 1) * 5} Kg Mentah + {(item.pesanan?.jumlah || 1) * 1} Kg Bumbu (Auto-Deducted)
                        </span>
                      </div>
                    </div>

                    {/* Tombol Tindakan Penggoreng */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {isWaiting && (
                        <button
                          onClick={() => handleUpdateStatus(item, 'diproses', 'Mulai Menggoreng')}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition"
                        >
                          <Flame className="w-4 h-4" />
                          Mulai Goreng di Wajan
                        </button>
                      )}

                      {isFrying && (
                        <button
                          onClick={() => handleUpdateStatus(item, 'siap_diverifikasi', 'Selesai Goreng (Siap Diverifikasi)')}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Selesai Goreng (Kirim ke QC)
                        </button>
                      )}

                      {isReadyQC && (
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-2 rounded-xl border border-blue-200 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          Menunggu QC Staf Pembungkus &rarr;
                        </span>
                      )}

                      {hasVerification && isLolos && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Lolos QC &bull; Sedang Dibungkus
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIWAYAT PENGGORENGAN SELESAI */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Riwayat Pesanan yang Selesai Digoreng Hari Ini ({completedTodayTasks.length})
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Pesanan yang telah tuntas digoreng dan telah selesai dikemas oleh bagian pembungkusan
          </p>

          {completedTodayTasks.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Belum ada pesanan yang selesai dikemas hari ini.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {completedTodayTasks.map((t) => (
                <div key={t.id_produksi} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                  <div className="flex justify-between font-bold text-gray-900 mb-1">
                    <span>Pesanan #{t.id_pesanan}</span>
                    <span className="text-emerald-700 flex items-center gap-1 font-bold">
                      <Check className="w-3.5 h-3.5" /> Selesai
                    </span>
                  </div>
                  <div className="text-gray-700">{t.produk?.nama_produk} ({t.pesanan?.jumlah} Bal)</div>
                  <div className="text-gray-400 text-[11px] mt-1">Rasa: {t.pesanan?.varian_rasa || 'Original'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
