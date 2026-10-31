'use client';

import React from 'react';
import RoleGuard from '@/components/auth/role-guard';
import { useAuth } from '@/context/auth-context';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Phone, 
  Search, 
  Star, 
  Plus, 
  CheckCircle2, 
  Truck, 
  Flame, 
  Package, 
  ShieldCheck 
} from 'lucide-react';

const FEATURED_PRODUCTS = [
  {
    id: 1,
    nama: 'Kerupuk Kentang',
    harga: 160000,
    satuan: 'Bal',
    varian: 'Original, Balado, Pedas',
    terjual: '120+ bal',
    badge: 'Penjualan Terbaik',
  },
  {
    id: 2,
    nama: 'Kerupuk Jengkol',
    harga: 160000,
    satuan: 'Bal',
    varian: 'Original Gurih',
    terjual: '95 bal',
    badge: 'Favorit',
  },
  {
    id: 3,
    nama: 'Kerupuk Bawang',
    harga: 160000,
    satuan: 'Bal',
    varian: 'Original, Bawang Putih',
    terjual: '80 bal',
    badge: 'Renyah',
  },
  {
    id: 4,
    nama: 'Kerupuk Warna-Warni',
    harga: 160000,
    satuan: 'Bal',
    varian: 'Original',
    terjual: '60 bal',
    badge: 'Populer',
  },
];

export default function PelangganDashboardPage() {
  const { user, pelanggan } = useAuth();

  return (
    <RoleGuard allowedRoles={['pelanggan']} pageTitle="Dashboard Pelanggan">
      <div className="space-y-6">
        {/* Welcome Banner (SDD Bab V Mockup Pelanggan Hal 67 & 86) */}
        <div className="bg-gradient-to-r from-brand-maroon to-brand-crimson text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-amber-200 backdrop-blur-sm mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              Area Khusus Pelanggan Terdaftar
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              Hi, Selamat Datang {user?.nama}!<br />
              <span className="text-amber-300 font-extrabold">Mari Berbelanja Kerupuk Diansyah</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed">
              Pesan aneka kerupuk berkualitas langsung dari pabrik secara mandiri. Pantau status penggorengan hingga pengemasan pesanan Anda secara real-time.
            </p>
          </div>

          {/* Decorative watermark */}
          <div className="absolute right-4 -bottom-6 text-white/10 font-black text-9xl select-none pointer-events-none">
            KD
          </div>
        </div>

        {/* Customer Profile & Delivery Summary Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Profil Pemesan Terverifikasi
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-maroon" />
                {pelanggan?.alamat || 'Alamat terdaftar di sistem'}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-brand-maroon" />
                {pelanggan?.no_telp || 'No. Telepon Aktif'}
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Hak Akses: Pelanggan Saja
            </span>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari kerupuk favorit (kentang, jengkol...)"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition">
              <ShoppingBag className="w-4 h-4" />
              Lihat Keranjang
            </button>
            <button className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs py-2.5 px-4 rounded-xl border border-gray-200 shadow-sm transition">
              <Clock className="w-4 h-4 text-brand-maroon" />
              Status Pesanan Saya
            </button>
          </div>
        </div>

        {/* Featured Products Grid (SDD Bab V Mockup Pelanggan) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">Katalog Produk Pabrik Kerupuk Diansyah</h2>
              <p className="text-xs text-gray-500">Pilih jenis kerupuk dan lakukan pemesanan secara mandiri</p>
            </div>
            <span className="text-xs font-semibold text-brand-maroon hover:underline cursor-pointer">
              Lihat Semua &rarr;
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_PRODUCTS.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="p-4">
                  {/* Badge */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {item.badge}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">Terjual {item.terjual}</span>
                  </div>

                  {/* Product Icon & Title */}
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xl mb-3 shadow-inner">
                    🍘
                  </div>

                  <h3 className="font-bold text-gray-900 text-base leading-snug">{item.nama}</h3>
                  <p className="text-xs text-gray-500 mt-1">Varian: {item.varian}</p>
                  
                  <div className="mt-3">
                    <span className="text-xs text-gray-400 block">Harga Satuan / {item.satuan}:</span>
                    <span className="text-lg font-black text-brand-maroon">
                      Rp {item.harga.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-100">
                  <button className="w-full flex items-center justify-center gap-1.5 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold py-2.5 px-3 rounded-xl transition shadow-sm active:scale-95">
                    <Plus className="w-4 h-4" />
                    Pesan Produk
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Order Tracking Status Preview (SDD Bab III UC-05) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Alur Status Pesanan Pelanggan</h3>
              <p className="text-xs text-gray-500">Transparansi proses dari pemesanan hingga penyerahan</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Live Tracker
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-800 block">1. Menunggu Diproses</span>
                <span className="text-[11px] text-gray-500">Pesanan baru tercatat</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-800 block">2. Penggorengan</span>
                <span className="text-[11px] text-gray-500">Dikerjakan staf goreng</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-800 block">3. Pembungkusan</span>
                <span className="text-[11px] text-gray-500">Verifikasi & kemas</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-800 block">4. Siap Diambil / Selesai</span>
                <span className="text-[11px] text-gray-500">Produk siap diserahkan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
