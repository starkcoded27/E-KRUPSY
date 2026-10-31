'use client';

import React from 'react';
import RoleGuard from '@/components/auth/role-guard';
import { useAuth } from '@/context/auth-context';
import { 
  PackageCheck, 
  CheckCircle2, 
  Layers, 
  PlusCircle, 
  ClipboardCheck, 
  AlertCircle,
  Truck,
  ShieldCheck,
  Package
} from 'lucide-react';

const READY_FOR_VERIFICATION = [
  {
    id: 'VER-001',
    produk: 'Kerupuk Kentang (Original)',
    jumlahFisik: '10 Bal',
    asalGoreng: 'Wajan 1 - Staf Penggoreng',
    status: 'Siap Diverifikasi',
  },
  {
    id: 'VER-002',
    produk: 'Kerupuk Rafael Crispy',
    jumlahFisik: '5 Bal',
    asalGoreng: 'Wajan 2 - Staf Penggoreng',
    status: 'Dalam Pembungkusan',
  },
];

const PLASTIC_STOCKS = [
  { nama: 'Plastik 1/2 kg', ukuran: '1/2 kg', stok: '8 Pcs / Pack', harga: 'Rp 24.000' },
  { nama: 'Plastik 11x25 kg', ukuran: '11x25 kg', stok: '10 Pcs / Pack', harga: 'Rp 34.000' },
  { nama: 'Plastik 30x45 kg', ukuran: '30x45 kg', stok: '9 Pcs / Pack', harga: 'Rp 34.000' },
  { nama: 'Plastik 12x22 kg', ukuran: '12x22 kg', stok: '10 Pcs / Pack', harga: 'Rp 34.000' },
  { nama: 'Tali Pengikat & Label Kerupuk Diansyah', ukuran: 'Standar', stok: '45 Rol', harga: 'Rp 15.000' },
];

export default function StaffPembungkusDashboardPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={['staff_pembungkus']} pageTitle="Dashboard Staf Pembungkus">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-800 via-brand-maroon to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-400/20 text-blue-200 border border-blue-300/30 mb-3">
              <PackageCheck className="w-3.5 h-3.5 text-blue-300" />
              Divisi QC & Pembungkusan Produk
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              Verifikasi Kualitas & Pengemasan
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Halo, <strong>{user?.nama}</strong>. Lakukan pemeriksaan mutu kerupuk dari wajan penggorengan, verifikasi jumlah fisik pesanan, dan selesaikan pengemasan plastik.
            </p>
          </div>
        </div>

        {/* Verifikasi Hasil Produksi (SDD UC-10) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                Hasil Penggorengan Menunggu Verifikasi & Pengemasan
              </h2>
              <p className="text-xs text-gray-500">
                Pemeriksaan fisik kesesuaian jumlah dan kerenyahan sebelum diserahkan ke pelanggan
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-800 font-semibold border border-blue-200 w-fit">
              {READY_FOR_VERIFICATION.length} Item Menunggu
            </span>
          </div>

          <div className="space-y-3">
            {READY_FOR_VERIFICATION.map((ver) => (
              <div
                key={ver.id}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-blue-50/40 transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-brand-maroon">{ver.id}</span>
                    <span className="text-[11px] text-gray-500 font-medium">{ver.asalGoreng}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">{ver.produk}</h3>
                  <p className="text-xs text-gray-600 mt-0.5">Jumlah Selesai Goreng: <strong>{ver.jumlahFisik}</strong></p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {ver.status === 'Siap Diverifikasi' ? (
                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition">
                      <ClipboardCheck className="w-4 h-4" />
                      Verifikasi & Mulai Kemas
                    </button>
                  ) : (
                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition">
                      <CheckCircle2 className="w-4 h-4" />
                      Tandai Selesai (Siap Diambil)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stok Plastik Pembungkus (SDD UC-09 & Mockup Hal 90-91) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-maroon" />
                Stok Plastik Pembungkus & Kemasan (Gudang Packing)
              </h2>
              <p className="text-xs text-gray-500">
                Pencatatan persediaan berbagai ukuran plastik pembungkus kerupuk
              </p>
            </div>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs shadow-sm transition w-fit">
              <PlusCircle className="w-4 h-4" />
              Input Stok Plastik Masuk
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PLASTIC_STOCKS.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-gray-900 text-xs block leading-tight">{item.nama}</span>
                  <span className="text-sm font-black text-brand-maroon mt-1 block">{item.stok}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Tersedia
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
