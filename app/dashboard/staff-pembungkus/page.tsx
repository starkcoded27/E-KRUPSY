'use client';

import React, { useState, useEffect, useRef } from 'react';
import RoleGuard from '@/components/auth/role-guard';
import { useAuth } from '@/context/auth-context';
import StateAlert, { StateType } from '@/components/ui/state-alert';
import { validateForm } from '@/lib/validation';
import { PackageCheck, RefreshCw, PlusCircle } from 'lucide-react';
import { ProduksiItem, StokItem } from './types';
import PembungkusTaskList from './components/pembungkus-task-list';
import PembungkusStockPanel from './components/pembungkus-stock-panel';
import PembungkusQcModal from './components/pembungkus-qc-modal';
import PembungkusRestockModal from './components/pembungkus-restock-modal';

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
  const isFetchingRef = useRef(false);

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

    // Auto-update live real-time antrean kemas tanpa request stacking
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

  // Submit QC Verifikasi (UC-10)
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifTarget || !user?.id_user) return;

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

  // Handler Input Stok Plastik (UC-09)
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

  const packingTasks = productionList.filter((p) => {
    if (p.status_produksi === 'selesai') return false;
    if (p.pesanan && p.pesanan.status_pesanan === 'dibatalkan') return false;
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

        {/* Antrean Verifikasi & Pengemasan */}
        <PembungkusTaskList
          tasks={packingTasks}
          stockList={stockList}
          onOpenQcModal={(item) => {
            setVerifTarget(item);
            setQcStatus('Lolos Verifikasi');
            setQcNotes('Kerenyahan sempurna, rasa merata, dan timbangan sesuai.');
            setVerifErrors({});
            setActionState({ type: 'idle', message: null });
          }}
          onFinishPacking={handleFinishPacking}
        />

        {/* Stok Plastik Pembungkus */}
        <PembungkusStockPanel
          stockList={stockList}
          onOpenRestockModal={() => {
            setShowPlasticModal(true);
            setActionState({ type: 'idle', message: null });
          }}
        />

        {/* Modal QC */}
        <PembungkusQcModal
          verifTarget={verifTarget}
          qcStatus={qcStatus}
          setQcStatus={setQcStatus}
          qcNotes={qcNotes}
          setQcNotes={setQcNotes}
          verifErrors={verifErrors}
          isLoading={actionState.type === 'loading'}
          onClose={() => setVerifTarget(null)}
          onSubmit={handleVerifySubmit}
        />

        {/* Modal Restock Plastik */}
        <PembungkusRestockModal
          isOpen={showPlasticModal}
          namaPlastik={namaPlastik}
          setNamaPlastik={setNamaPlastik}
          jumlahPlastik={jumlahPlastik}
          setJumlahPlastik={setJumlahPlastik}
          isLoading={actionState.type === 'loading'}
          onClose={() => setShowPlasticModal(false)}
          onSubmit={handleAddPlasticSubmit}
        />
      </div>
    </RoleGuard>
  );
}
