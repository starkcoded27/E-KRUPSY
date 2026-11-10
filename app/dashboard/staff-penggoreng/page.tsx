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
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Eye
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

interface StokItem {
  id_stok: number;
  nama_bahan: string;
  kategori: string;
  satuan: string;
  jumlah: number;
  tanggal_update: string;
}

export default function StaffPenggorengDashboardPage() {
  const { user } = useAuth();

  // State data
  const [productionList, setProductionList] = useState<ProduksiItem[]>([]);
  const [stockList, setStockList] = useState<StokItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3 Kondisi Sistem (State)
  const [actionState, setActionState] = useState<{ type: StateType; message: string | null }>({
    type: 'idle',
    message: null,
  });

  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [resProd, resStock] = await Promise.all([
        fetch('/api/produksi'),
        fetch('/api/stok'),
      ]);

      const dataProd = await resProd.json();
      const dataStock = await resStock.json();

      if (resProd.ok) setProductionList(dataProd.data || []);
      if (resStock.ok) setStockList(dataStock.data || []);
    } catch (err: any) {
      if (!silent) console.error('Error fetch staff penggoreng:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-update antrean dan stok live real-time tanpa reload / refresh manual
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

  return (
    <RoleGuard allowedRoles={['staff_penggoreng']} pageTitle="Dashboard Staf Penggorengan">
      <div className="space-y-6">
        {/* Banner Staf Penggoreng */}
        <div className="bg-gradient-to-r from-orange-700 via-brand-maroon to-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-400/20 text-orange-200 border border-orange-300/30 mb-3">
              <Flame className="w-3.5 h-3.5 text-orange-300" />
              Divisi Operasional Penggorengan Dadakan
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              Antrean Penggorengan
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-orange-100/90 leading-relaxed">
              Halo, <strong>{user?.nama}</strong>. Kerupuk digoreng dadakan saat pesanan masuk. Anda dapat memantau ketersediaan stok kerupuk dan memproses antrean penggorengan pesanan pelanggan.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => fetchData()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs text-white font-bold bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl border border-white/20 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Muat Ulang Antrean & Stok
            </button>
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
                Pesanan yang masuk dari pelanggan dan harus diproses penggorengannya
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
                            ? 'bg-gray-200 text-gray-700'
                            : isFrying
                            ? 'bg-orange-100 text-orange-800 border border-orange-300 animate-pulse'
                            : hasVerification && isLolos
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : hasVerification && !isLolos
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                        }`}>
                          {isWaiting 
                            ? 'Menunggu Digoreng' 
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
                        <span>Target: <strong className="text-gray-800">{item.pesanan?.jumlah} {item.produk?.satuan}</strong></span>
                        <span>Varian Rasa: <strong className="text-orange-700">{item.pesanan?.varian_rasa}</strong></span>
                        <span>Pelanggan: <strong className="text-gray-800">{item.pesanan?.pelanggan?.nama_lengkap || '-'}</strong></span>
                      </div>

                      {/* FEEDBACK VERIFIKASI DARI STAF PEMBUNGKUS */}
                      {hasVerification && latestVerif && (
                        <div className={`mt-3 p-3 rounded-xl border text-xs ${
                          isLolos 
                            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900' 
                            : 'bg-red-50/90 border-red-200 text-red-900'
                        }`}>
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
                                onClick={() => handleUpdateStatus(item, 'diproses', 'Sedang Digoreng Ulang')}
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
                          onClick={() => handleUpdateStatus(item, 'diproses', 'Sedang Digoreng')}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition"
                        >
                          <Flame className="w-4 h-4" />
                          Mulai Goreng
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

        {/* KETERSEDIAAN STOK BAHAN BAKU & BUMBU DI DAPUR (VIEW OUTPUT UNTUK PENGGORENG) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-maroon" />
                  Ketersediaan Stok Bahan Baku & Bumbu di Dapur (View Output)
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  Goreng Dadakan
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Output pemantauan ketersediaan stok kerupuk (<strong>1 Bal = 5 Kg mentah</strong>). Pasokan bahan baku dikelola langsung oleh <strong>Owner</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                Mode: Khusus Pantau Stok (View Only)
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-xl border border-gray-200">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-maroon" />
                Input Pasokan: Khusus Owner
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stockList
              .filter((s) => s.kategori !== 'Plastik')
              .map((stok) => {
                const isMentah = stok.kategori === 'Kerupuk Mentah';
                const balEquivalent = isMentah ? Math.floor(stok.jumlah / 5) : null;

                return (
                  <div
                    key={stok.id_stok}
                    className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col justify-between hover:border-brand-maroon/30 transition shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-bold text-gray-900 text-sm block leading-tight">{stok.nama_bahan}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          stok.jumlah < 20
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {stok.jumlah < 20 ? 'Menipis' : 'Cukup'}
                        </span>
                      </div>

                      <span className="text-xl font-black text-brand-maroon mt-2 block">
                        {stok.jumlah} {stok.satuan}
                      </span>

                      {isMentah && balEquivalent !== null && (
                        <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded-md border border-orange-200 block w-fit mt-2">
                          Setara {balEquivalent} Bal di Katalog
                        </span>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-gray-200/70 flex items-center justify-between text-[11px] text-gray-500">
                      <span>Kategori: {stok.kategori}</span>
                      <span>Update: {stok.tanggal_update}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
