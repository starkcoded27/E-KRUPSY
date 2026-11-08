'use client';

import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/auth/role-guard';
import { useAuth } from '@/context/auth-context';
import StateAlert, { StateType } from '@/components/ui/state-alert';
import { validateForm } from '@/lib/validation';
import { 
  PackageCheck, 
  CheckCircle2, 
  Layers, 
  PlusCircle, 
  ClipboardCheck, 
  X, 
  RefreshCw,
  Package,
  AlertTriangle
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

export default function StaffPembungkusDashboardPage() {
  const { user } = useAuth();

  const [productionList, setProductionList] = useState<ProduksiItem[]>([]);
  const [stockList, setStockList] = useState<StokItem[]>([]);
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

  // State Modal Input Stok Plastik (UC-09)
  const [showPlasticModal, setShowPlasticModal] = useState(false);
  const [namaPlastik, setNamaPlastik] = useState('Plastik Ukuran 1/2 kg');
  const [jumlahPlastik, setJumlahPlastik] = useState<number>(20);
  const isFetchingRef = React.useRef(false);

  const fetchData = async (silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!silent) setIsLoading(true);
    try {
      const [resProd, resStock] = await Promise.all([
        fetch('/api/produksi'),
        fetch('/api/stok'),
      ]);

      const [dataProd, dataStock] = await Promise.all([
        resProd.json(),
        resStock.json(),
      ]);

      if (resProd.ok) setProductionList(dataProd.data || []);
      if (resStock.ok) setStockList(dataStock.data || []);
    } catch (err: any) {
      if (!silent) console.error('Fetch error pembungkus:', err);
    } finally {
      isFetchingRef.current = false;
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-update live real-time antrean kemas yang aman tanpa request stacking
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchData(true);
    }, 8000);

    const handleVisibility = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchData(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
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

  // Handler Input Stok Plastik (UC-09) dengan 4 Validasi
  const handleAddPlasticSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm([
      { field: 'nama_bahan', label: 'Nama Kemasan Plastik', value: namaPlastik, required: true, dataType: 'string' },
      { field: 'jumlah', label: 'Jumlah Masuk (Pack)', value: jumlahPlastik, required: true, dataType: 'integer', domain: { min: 1, max: 1000 } },
    ]);

    if (!validation.isValid) {
      setActionState({ type: 'error', message: validation.firstError });
      return;
    }

    setActionState({ type: 'loading', message: 'Menyimpan stok plastik ke Supabase...' });

    try {
      const res = await fetch('/api/stok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_bahan: namaPlastik,
          kategori: 'Plastik',
          satuan: 'Pack',
          jumlah: Number(jumlahPlastik),
          id_user: user?.id_user,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionState({ type: 'error', message: data.message || 'Gagal menyimpan stok plastik.' });
        return;
      }

      setActionState({ type: 'success', message: data.message });
      setShowPlasticModal(false);
      await fetchData();
    } catch {
      setActionState({ type: 'error', message: 'Gagal menyimpan stok plastik.' });
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

  return (
    <RoleGuard allowedRoles={['staff_pembungkus']} pageTitle="Dashboard Staf Pembungkus">
      <div className="space-y-6">
        {/* Banner Staf Pembungkus */}
        <div className="bg-gradient-to-r from-blue-800 via-brand-maroon to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-400/20 text-blue-200 border border-blue-300/30 mb-3">
              <PackageCheck className="w-3.5 h-3.5 text-blue-300" />
              Divisi QC & Pembungkusan Produk
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              Verifikasi Mutu & Pengemasan Plastik
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Halo, <strong>{user?.nama}</strong>. Periksa kerenyahan fisik kerupuk dari penggorengan, verifikasi jumlah pesanan, dan selesaikan packing plastik.
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => fetchData()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs text-white font-bold bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl border border-white/20 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Segarkan Data
            </button>
            <button
              onClick={() => {
                setShowPlasticModal(true);
                setActionState({ type: 'idle', message: null });
              }}
              className="inline-flex items-center gap-1.5 text-xs text-brand-darkmaroon font-bold bg-amber-300 hover:bg-amber-200 px-3.5 py-2 rounded-xl shadow-md transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Input Stok Plastik Masuk
            </button>
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
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                Daftar Kerupuk Siap Diverifikasi & Dikemas ({packingTasks.length})
              </h2>
              <p className="text-xs text-gray-500">
                Kerupuk yang telah selesai digoreng dan memerlukan verifikasi kualitas sebelum diserahkan
              </p>
            </div>
          </div>

          {packingTasks.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-700">Tidak ada kerupuk yang menunggu verifikasi atau kemas saat ini.</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Setelah bagian penggorengan selesai menggoreng, pesanan akan masuk ke daftar ini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {packingTasks.map((item) => {
                const hasPassedQC = Boolean(item.verifikasi && item.verifikasi.some((v) => v.status === 'Lolos Verifikasi'));
                const isPacking = (item.status_produksi === 'sedang_dikemas' || hasPassedQC) && item.status_produksi !== 'selesai';
                const isReadyForQC = !isPacking && item.status_produksi === 'siap_diverifikasi';

                return (
                  <div
                    key={item.id_produksi}
                    className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-200 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md">
                          Pesanan #{item.id_pesanan}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isReadyForQC
                            ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {isReadyForQC ? 'Butuh Verifikasi Mutu' : '3. Sedang Dibungkus / Dikemas'}
                        </span>
                      </div>

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
                          Verifikasi Kualitas (QC)
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

        {/* STOK PLASTIK PEMBUNGKUS (SDD UC-09 & Bab V Mockup Hal 90-91) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-maroon" />
                Stok Plastik Kemasan di Gudang Pembungkusan
              </h2>
              <p className="text-xs text-gray-500">
                Pencatatan persediaan berbagai ukuran plastik pembungkus kerupuk
              </p>
            </div>
            <button
              onClick={() => {
                setShowPlasticModal(true);
                setActionState({ type: 'idle', message: null });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs shadow-sm transition w-fit"
            >
              <PlusCircle className="w-4 h-4" />
              + Input Stok Plastik Masuk
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stockList
              .filter((s) => s.kategori === 'Plastik')
              .map((stok) => (
                <div
                  key={stok.id_stok}
                  className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-gray-900 text-xs block leading-tight">{stok.nama_bahan}</span>
                    <span className="text-sm font-black text-blue-900 mt-1 block">
                      {stok.jumlah} {stok.satuan}
                    </span>
                    <span className="text-[10px] text-gray-400">Update: {stok.tanggal_update}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    stok.jumlah <= 0
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : stok.jumlah < 10
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {stok.jumlah <= 0 ? 'Habis' : stok.jumlah < 10 ? 'Menipis' : 'Tersedia'}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* MODAL 1: FORM VERIFIKASI HASIL PRODUKSI DENGAN 4 VALIDASI (SDD UC-10) */}
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

        {/* MODAL 2: INPUT STOK PLASTIK DENGAN 4 VALIDASI (SDD UC-09) */}
        {showPlasticModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">Input Stok Plastik Masuk</h3>
                </div>
                <button
                  onClick={() => setShowPlasticModal(false)}
                  className="p-1 rounded-xl text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddPlasticSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Jenis & Ukuran Plastik <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={namaPlastik}
                    onChange={(e) => setNamaPlastik(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                  >
                    <option value="Plastik Ukuran 1/2 kg">Plastik Ukuran 1/2 kg</option>
                    <option value="Plastik Ukuran 1x25 kg">Plastik Ukuran 1x25 kg</option>
                    <option value="Plastik Ukuran 30x45 kg">Plastik Ukuran 30x45 kg</option>
                    <option value="Plastik Ukuran 12x22 kg">Plastik Ukuran 12x22 kg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Jumlah Masuk (Pack) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={jumlahPlastik}
                    onChange={(e) => setJumlahPlastik(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPlasticModal(false)}
                    className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionState.type === 'loading'}
                    className="py-3 px-4 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold rounded-2xl shadow-md transition disabled:opacity-50"
                  >
                    {actionState.type === 'loading' ? 'Menyimpan...' : 'Simpan Stok Plastik'}
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
