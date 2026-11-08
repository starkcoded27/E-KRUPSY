'use client';

import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/auth/role-guard';
import { useAuth } from '@/context/auth-context';
import StateAlert, { StateType } from '@/components/ui/state-alert';
import { validateForm } from '@/lib/validation';
import { 
  PackageCheck, 
  CheckCircle2, 
  ClipboardCheck, 
  X, 
  RefreshCw,
  Package,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
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

export default function StaffPembungkusDashboardPage() {
  const { user } = useAuth();

  const [productionList, setProductionList] = useState<ProduksiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3 Kondisi Sistem (State)
  const [actionState, setActionState] = useState<{ type: StateType; message: string | null }>({
    type: 'idle',
    message: null,
  });

  // State Modal QC Verifikasi (UC-10)
  const [verifTarget, setVerifTarget] = useState<ProduksiItem | null>(null);
  const [qcStatus, setQcStatus] = useState<string>('Lolos Verifikasi');
  const [qcNotes, setQcNotes] = useState<string>('Kerenyahan sempurna, rasa merata, dan timbangan sesuai.');
  const [verifErrors, setVerifErrors] = useState<Record<string, string>>({});

  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const resProd = await fetch('/api/produksi');
      const dataProd = await resProd.json();
      if (resProd.ok) setProductionList(dataProd.data || []);
    } catch (err: any) {
      if (!silent) console.error('Fetch error pembungkus:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-update live real-time antrean kemas tanpa perlu refresh manual
    const interval = setInterval(() => {
      fetchData(true);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Submit QC Verifikasi (UC-10) dengan 4 Validasi Input
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifTarget || !user?.id_user) return;

    // 4 Jenis Validasi Input
    const validation = validateForm([
      { field: 'id_produksi', label: 'ID Produksi', value: verifTarget.id_produksi, required: true, dataType: 'integer' },
      { field: 'status', label: 'Status Kelayakan', value: qcStatus, required: true, domain: { allowedValues: ['Lolos Verifikasi', 'Cacat / Tidak Sesuai'] } },
      { field: 'keterangan', label: 'Catatan Pemeriksaan Mutu', value: qcNotes, required: true, dataType: 'string' },
    ]);

    if (!validation.isValid) {
      setVerifErrors(validation.errors);
      setActionState({ type: 'error', message: validation.firstError });
      return;
    }

    setVerifErrors({});
    setActionState({ type: 'loading', message: 'Menyimpan hasil verifikasi ke Supabase...' });

    try {
      const res = await fetch('/api/verifikasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_produksi: verifTarget.id_produksi,
          id_user: user.id_user,
          status: qcStatus,
          keterangan: qcNotes,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setActionState({ type: 'error', message: resData.message || 'Verifikasi gagal disimpan.' });
        return;
      }

      setActionState({
        type: 'success',
        message: 'Hasil verifikasi berhasil dicatat! Status produk otomatis berganti menjadi "Sedang Dikemas".',
      });

      setVerifTarget(null);
      await fetchData();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat proses verifikasi.' });
    }
  };

  // Selesaikan Pengemasan -> 'selesai' (UC-11)
  const handleFinishPacking = async (item: ProduksiItem) => {
    setActionState({ type: 'loading', message: 'Menandai pengemasan selesai...' });

    try {
      const res = await fetch('/api/produksi', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_produksi: item.id_produksi,
          next_status: 'selesai',
          id_pesanan: item.id_pesanan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionState({ type: 'error', message: data.message || 'Gagal mengubah status.' });
        return;
      }

      setActionState({
        type: 'success',
        message: `Pesanan #${item.id_pesanan} (${item.produk?.nama_produk}) telah selesai dibungkus dan SIAP DIAMBIL oleh pelanggan!`,
      });

      await fetchData();
    } catch {
      setActionState({ type: 'error', message: 'Gagal mengubah status selesai.' });
    }
  };

  // Antrean untuk staf pembungkus:
  // 1. Siap Diverifikasi (belum diverifikasi mutu)
  // 2. Sedang Dikemas (telah Lolos Verifikasi mutu dan belum selesai)
  const packingTasks = productionList.filter((p) => {
    if (p.status_produksi === 'selesai') return false;
    const hasPassedQC = Boolean(p.verifikasi && p.verifikasi.some((v) => v.status === 'Lolos Verifikasi'));
    return p.status_produksi === 'siap_diverifikasi' || p.status_produksi === 'sedang_dikemas' || hasPassedQC;
  });

  const completedTodayTasks = productionList.filter((p) => p.status_produksi === 'selesai');

  return (
    <RoleGuard allowedRoles={['staff_pembungkus']} pageTitle="Dashboard Staf Pembungkus">
      <div className="space-y-6">
        {/* Banner Staf Pembungkus */}
        <div className="bg-gradient-to-r from-blue-800 via-brand-maroon to-indigo-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Verifikasi Mutu (QC) & Pengemasan
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-blue-100/90">
                Halo, <strong>{user?.nama}</strong>. Lakukan uji kerenyahan rasa dan selesaikan pengemasan pesanan.
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

        {/* ANTREAN VERIFIKASI & PENGEMASAN (SDD UC-10 & UC-11) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-blue-600" />
                Antrean Verifikasi Mutu & Kemasan Plastik ({packingTasks.length})
              </h2>
              <p className="text-xs text-gray-500">
                Pesanan yang selesai digoreng dari wajan, menunggu verifikasi mutu (QC), dan siap dibungkus
              </p>
            </div>
          </div>

          {packingTasks.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-700">Semua pesanan kemasan telah tuntas dikerjakan.</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Kerupuk yang selesai digoreng akan otomatis masuk ke antrean ini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {packingTasks.map((item) => {
                const hasVerif = Boolean(item.verifikasi && item.verifikasi.length > 0);
                const isReadyForQC = !hasVerif || item.status_produksi === 'siap_diverifikasi';
                const isPacking = hasVerif && item.verifikasi![0].status === 'Lolos Verifikasi';

                return (
                  <div
                    key={item.id_produksi}
                    className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-200 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md">
                          Pesanan #{item.id_pesanan}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isReadyForQC
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse'
                        }`}>
                          {isReadyForQC ? '🔍 Menunggu Verifikasi Mutu (QC)' : '📦 Sedang Dibungkus Plastik'}
                        </span>
                      </div>

<<<<<<< HEAD
                      <div className="font-bold text-gray-900 text-sm">
                        {item.produk?.nama_produk} &bull;{' '}
                        <span className="text-blue-700">{item.pesanan?.jumlah} {item.produk?.satuan || 'Bal'}</span>
=======
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg">{item.produk?.nama_produk}</h3>
                      <div className="text-gray-600 mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs sm:text-sm">
                        <span>Target: <strong className="text-gray-800">{item.pesanan?.jumlah} {item.produk?.satuan}</strong></span>
                        <span>Varian: <strong className="text-gray-800">{item.pesanan?.varian_rasa}</strong></span>
                        <span className="flex items-center gap-1.5">
                          Kemasan: <strong className="text-blue-700 font-bold">{item.pesanan?.ukuran_plastik}</strong>
                          {(() => {
                            const reqUkuran = String(item.pesanan?.ukuran_plastik || '').toLowerCase();
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
                        <span>Pelanggan: <strong className="text-gray-800">{item.pesanan?.pelanggan?.nama_lengkap || '-'}</strong></span>
>>>>>>> e7db4d333f2685ffba61a679a0f54226602f2786
                      </div>

                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-600">
                        <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200">
                          Rasa: <strong>{item.pesanan?.varian_rasa || 'Original'}</strong>
                        </span>
                        <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded-md border border-blue-200 font-semibold">
                          Ukuran Kemasan: <strong>{item.pesanan?.ukuran_plastik || '1/2 kg'}</strong>
                        </span>
                        <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200">
                          Pelanggan: <strong>{item.pesanan?.pelanggan?.nama_lengkap || 'Pelanggan'}</strong>
                        </span>
                      </div>

                      {hasVerif && (
                        <div className="mt-2 text-xs bg-white p-2.5 rounded-xl border border-gray-200">
                          <p className="font-semibold text-gray-800">
                            QC Mutu: <span className="text-emerald-700">{item.verifikasi![0].status}</span>
                            <span className="text-gray-400 font-normal"> &bull; &quot;{item.verifikasi![0].keterangan}&quot;</span>
                          </p>
                          <span className="text-[10px] text-blue-600 mt-1 block">
                            Status: Sedang dibungkus ke plastik &bull; Klik &quot;Selesai Kemas&quot; jika kerupuk siap diambil.
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {isReadyForQC && (
                        <button
                          onClick={() => {
                            setVerifTarget(item);
                            setQcStatus('Lolos Verifikasi');
                            setQcNotes('Kerenyahan sempurna, rasa merata, dan timbangan sesuai.');
                            setVerifErrors({});
                            setActionState({ type: 'idle', message: null });
                          }}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                          Verifikasi Mutu (QC)
                        </button>
                      )}

                      {isPacking && (
                        <button
                          onClick={() => handleFinishPacking(item)}
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

        {/* RIWAYAT PENGEMASAN SELESAI */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Riwayat Pesanan Selesai Dikemas Hari Ini ({completedTodayTasks.length})
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Pesanan yang telah lolos QC dan kemasannya telah siap untuk diserahkan kepada pelanggan
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
                      <Check className="w-3.5 h-3.5" /> Siap Diambil
                    </span>
                  </div>
                  <div className="text-gray-700">{t.produk?.nama_produk} ({t.pesanan?.jumlah} Bal)</div>
                  <div className="text-gray-400 text-[11px] mt-1">
                    Kemasan: {t.pesanan?.ukuran_plastik} &bull; Rasa: {t.pesanan?.varian_rasa}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL: FORM VERIFIKASI HASIL PRODUKSI (QC) (SDD UC-10) */}
        {verifTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Verifikasi Mutu & QC</h3>
                    <p className="text-[11px] text-gray-500">Pesanan #{verifTarget.id_pesanan} &bull; {verifTarget.produk?.nama_produk}</p>
                  </div>
                </div>
                <button
                  onClick={() => setVerifTarget(null)}
                  className="p-1 rounded-xl text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleVerifySubmit} className="space-y-4">
                {/* 1. Status Kelayakan (Domain Check) */}
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

                {/* 2. Catatan / Keterangan (Existence Check) */}
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
                    onClick={() => setVerifTarget(null)}
                    className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionState.type === 'loading'}
                    className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md transition disabled:opacity-50"
                  >
                    {actionState.type === 'loading' ? 'Menyimpan...' : 'Simpan Verifikasi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
