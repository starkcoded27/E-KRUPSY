'use client';

import React, { useState, useEffect, useRef } from 'react';
import RoleGuard from '@/components/auth/role-guard';
import { useAuth } from '@/context/auth-context';
import StateAlert, { StateType } from '@/components/ui/state-alert';
import { Flame, RefreshCw } from 'lucide-react';
import { ProduksiItem, StokItem } from './types';
import PenggorengTaskList from './components/penggoreng-task-list';
import PenggorengStockPanel from './components/penggoreng-stock-panel';

export default function StaffPenggorengDashboardPage() {
  const { user } = useAuth();

  const [productionList, setProductionList] = useState<ProduksiItem[]>([]);
  const [stockList, setStockList] = useState<StokItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [actionState, setActionState] = useState<{ type: StateType; message: string | null }>({
    type: 'idle',
    message: null,
  });
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
      if (!silent) console.error('Error fetch staff penggoreng:', err);
    } finally {
      isFetchingRef.current = false;
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-update non-overlapping interval
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

  const fryingTasks = productionList.filter(
    (p) => p.status_produksi !== 'selesai' && p.pesanan && p.pesanan.status_pesanan !== 'dibatalkan'
  );

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
              Antrean Penggorengan & Stok Wajan
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-orange-100/90 leading-relaxed">
              Halo, <strong>{user?.nama}</strong>. Kerupuk digoreng dadakan saat pesanan masuk. Anda dapat memantau ketersediaan stok bahan baku wajan dan memproses antrean penggorengan pesanan pelanggan.
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

        {/* Antrean Penggorengan Task List */}
        <PenggorengTaskList tasks={fryingTasks} onUpdateStatus={handleUpdateStatus} />

        {/* Stok Bahan Baku & Wajan Panel */}
        <PenggorengStockPanel stockList={stockList} />
      </div>
    </RoleGuard>
  );
}
