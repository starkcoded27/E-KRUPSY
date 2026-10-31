'use client';

import React from 'react';
import RoleGuard from '@/components/auth/role-guard';
import { useAuth } from '@/context/auth-context';
import { 
  Flame, 
  Package, 
  PlusCircle, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ShieldCheck,
  Layers,
  ArrowRight
} from 'lucide-react';

const QUEUED_TASKS = [
  {
    id: 'PRD-101',
    produk: 'Kerupuk Kentang (Original)',
    jumlah: '10 Bal',
    status: 'Sedang Digoreng',
    waktuMasuk: '08:30 WIB',
    prioritas: 'Tinggi',
  },
  {
    id: 'PRD-102',
    produk: 'Kerupuk Jengkol',
    jumlah: '5 Bal',
    status: 'Menunggu Penggorengan',
    waktuMasuk: '09:15 WIB',
    prioritas: 'Normal',
  },
  {
    id: 'PRD-103',
    produk: 'Kerupuk Bawang',
    jumlah: '8 Bal',
    status: 'Menunggu Penggorengan',
    waktuMasuk: '10:00 WIB',
    prioritas: 'Normal',
  },
];

const RAW_MATERIALS = [
  { nama: 'Kerupuk Mentah Kentang', stok: '150 Kg', status: 'Cukup' },
  { nama: 'Kerupuk Mentah Jengkol', stok: '80 Kg', status: 'Cukup' },
  { nama: 'Bumbu Penyedap Rasa Original', stok: '12 Kg', status: 'Menipis' },
  { nama: 'Bumbu Balado Super', stok: '25 Kg', status: 'Cukup' },
  { nama: 'Minyak Goreng Nabati', stok: '180 Liter', status: 'Cukup' },
];

export default function StaffPenggorengDashboardPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={['staff_penggoreng']} pageTitle="Dashboard Staf Penggorengan">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-orange-700 via-brand-maroon to-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-400/20 text-orange-200 border border-orange-300/30 mb-3">
              <Flame className="w-3.5 h-3.5 text-orange-300" />
              Divisi Produksi: Penggorengan Kerupuk
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              Antrean Produksi & Stok Bahan Baku
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-orange-100/90 leading-relaxed">
              Halo, <strong>{user?.nama}</strong>. Perbarui status penggorengan pesanan dan pastikan ketersediaan stok kerupuk mentah serta bumbu tidak terhambat.
            </p>
          </div>
        </div>

        {/* Antrean Pesanan Penggorengan (SDD UC-11) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Daftar Produksi Siap Dikerjakan
              </h2>
              <p className="text-xs text-gray-500">
                Pesanan yang masuk dari pelanggan dan harus segera diproses penggorengannya
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-orange-50 text-orange-800 font-semibold border border-orange-200 w-fit">
              {QUEUED_TASKS.length} Pesanan Aktif
            </span>
          </div>

          <div className="space-y-3">
            {QUEUED_TASKS.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-orange-50/40 transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-brand-maroon">{task.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                      Prioritas: {task.prioritas}
                    </span>
                    <span className="text-[11px] text-gray-400">Diterima: {task.waktuMasuk}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">{task.produk}</h3>
                  <p className="text-xs text-gray-600 mt-0.5">Jumlah Target: <strong>{task.jumlah}</strong></p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {task.status === 'Sedang Digoreng' ? (
                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition">
                      <CheckCircle className="w-4 h-4" />
                      Tandai Siap Diverifikasi
                    </button>
                  ) : (
                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition">
                      <Flame className="w-4 h-4" />
                      Mulai Penggorengan
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manajemen Stok Bahan Mentah & Bumbu (SDD UC-07 & UC-08) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-maroon" />
                Stok Bahan Baku & Bumbu (Gudang Produksi)
              </h2>
              <p className="text-xs text-gray-500">
                Pencatatan sisa bahan mentah dan input pasokan baru
              </p>
            </div>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs shadow-sm transition w-fit">
              <PlusCircle className="w-4 h-4" />
              Input Stok Masuk
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {RAW_MATERIALS.map((mat, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-gray-900 text-xs block leading-tight">{mat.nama}</span>
                  <span className="text-sm font-black text-brand-maroon mt-1 block">{mat.stok}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    mat.status === 'Menipis'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {mat.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
