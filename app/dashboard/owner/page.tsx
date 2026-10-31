'use client';

import React from 'react';
import RoleGuard from '@/components/auth/role-guard';
import { useAuth } from '@/context/auth-context';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  FileSpreadsheet, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function OwnerDashboardPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={['owner']} pageTitle="Dashboard Owner / Eksekutif">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-800 via-brand-maroon to-brand-darkmaroon text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-200 border border-amber-300/30 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              Akses Khusus: Owner / Administrator
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              Dashboard Laporan Harian & Operasional
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-amber-100/80 leading-relaxed">
              Selamat datang, <strong>{user?.nama}</strong>. Pantau metrik penjualan, verifikasi pembayaran tunai/non-tunai, dan evaluasi rantai produksi pabrik.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-brand-darkmaroon font-bold transition shadow-sm">
              <Printer className="w-4 h-4" />
              Cetak Rekap Harian
            </button>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition border border-white/20">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Ekspor Laporan (Excel/CSV)
            </button>
          </div>
        </div>

        {/* 3 Metric Cards (SDD Bab V Mockup Laporan Transaksi Hal 95 & 96) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Penjualan */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
              <span className="font-semibold">Pendapatan Hari Ini</span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">Rp 4.850.000</div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+14.2% dari hari kemarin</span>
              </div>
            </div>
          </div>

          {/* Jumlah Transaksi */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
              <span className="font-semibold">Jumlah Transaksi Selesai</span>
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <ShoppingBag className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">28 Transaksi</div>
              <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Rata-rata 2.4 bal / pesanan</span>
              </div>
            </div>
          </div>

          {/* Estimasi Keuntungan Bersih */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
              <span className="font-semibold">Estimasi Keuntungan Bersih</span>
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">Rp 1.455.000</div>
              <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold mt-1">
                <span>Margin margin bersih ~30%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Master Pengguna Sistem (SDD Physical Design: public.users) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-maroon" />
                Data Master Akun Pengguna & Hak Akses
              </h2>
              <p className="text-xs text-gray-500">
                Daftar akun operasional pabrik yang tersimpan di database sistem
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-50 text-brand-maroon border border-brand-200">
              Role Berjenjang Aktif
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-y border-gray-100">
                <tr>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Nama Akun</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Hak Akses Dashboard</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/70">
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      OWNER
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">Bapak Diansyah (Owner)</td>
                  <td className="py-3 px-4 text-gray-600 font-mono">owner</td>
                  <td className="py-3 px-4 text-gray-600">Akses Penuh Seluruh Laporan & Keuangan</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50/70">
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-orange-100 text-orange-900 border border-orange-300">
                      STAFF PENGGORENG
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">Staf Penggorengan</td>
                  <td className="py-3 px-4 text-gray-600 font-mono">penggoreng</td>
                  <td className="py-3 px-4 text-gray-600">Update Produksi & Kelola Stok Bahan Baku</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50/70">
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                      STAFF PEMBUNGKUS
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">Staf Pembungkus</td>
                  <td className="py-3 px-4 text-gray-600 font-mono">pembungkus</td>
                  <td className="py-3 px-4 text-gray-600">Verifikasi Hasil Produksi & Stok Plastik</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50/70">
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      PELANGGAN
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">Pelanggan Mandiri</td>
                  <td className="py-3 px-4 text-gray-600 font-mono">Registrasi Mandiri</td>
                  <td className="py-3 px-4 text-gray-600">Katalog Produk & Pemesanan Mandiri Saja</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Terproteksi
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Alert: Pelanggan restricted note */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Penegakan Aturan Keamanan Sistem:</span>
            Sesuai perancangan SDD dan instruksi Anda, pengguna dengan role <strong>pelanggan</strong> secara sistem tidak dapat mengakses atau melihat Dashboard Owner, Staf Penggoreng, maupun Staf Pembungkus. Jika dicoba diakses secara manual melalui URL, sistem otomatis memblokir dan mengarahkan kembali ke Dashboard Pelanggan.
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
