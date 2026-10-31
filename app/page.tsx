'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getDashboardPath } from '@/components/auth/role-guard';
import { LogIn, UserPlus, ShoppingBag, ShieldCheck, Flame, PackageCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function WelcomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Jika sudah login, langsung arahkan ke dashboard rolenya
  useEffect(() => {
    if (!isLoading && user) {
      router.push(getDashboardPath(user.role));
    }
  }, [isLoading, user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-maroon via-brand-darkmaroon to-[#3a0608] flex flex-col justify-between text-white">
      {/* Top Bar / Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-amber-400 text-brand-darkmaroon flex items-center justify-center font-black text-lg shadow-lg">
            KD
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-tight">E-KRUPSY</h1>
            <p className="text-[10px] text-amber-300 font-medium">Pabrik Kerupuk Diansyah</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition border border-white/20"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-400 hover:bg-amber-300 text-brand-darkmaroon transition font-bold shadow-md"
          >
            Daftar
          </Link>
        </div>
      </header>

      {/* Main Hero & Welcome Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-white text-gray-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 relative overflow-hidden">
          {/* Decorative badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Sistem Informasi Resmi Pabrik
          </div>

          {/* Logo Brand Emblem */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-brand-maroon text-amber-300 flex items-center justify-center font-black text-3xl shadow-xl ring-4 ring-amber-400/30 mb-3">
              KD
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Sistem Informasi Pemesanan & Produksi Terpadu Pabrik Kerupuk Diansyah
            </p>
          </div>

          {/* Action Buttons (As seen in SDD Mockup page 83) */}
          <div className="space-y-3 mb-6">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2.5 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg transition duration-200 active:scale-[0.98]"
            >
              <LogIn className="w-5 h-5 text-amber-300" />
              <span>Masuk (Login)</span>
              <ArrowRight className="w-4 h-4 ml-auto text-white/70" />
            </Link>

            <Link
              href="/register"
              className="w-full flex items-center justify-center gap-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold py-3.5 px-4 rounded-2xl border border-gray-200 transition duration-200 active:scale-[0.98]"
            >
              <UserPlus className="w-5 h-5 text-brand-maroon" />
              <span>Daftar Akun Pelanggan</span>
              <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
            </Link>
          </div>

          {/* Role separation quick guide */}
          <div className="border-t border-gray-100 pt-5">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 text-center">
              Akses Berdasarkan Peran (Role)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-800 block">Pelanggan</span>
                  <span className="text-[11px] text-gray-500">Pemesanan & Riwayat</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-800 block">Owner / Admin</span>
                  <span className="text-[11px] text-gray-500">Laporan & Keuangan</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2">
                <Flame className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-800 block">Staf Penggoreng</span>
                  <span className="text-[11px] text-gray-500">Produksi & Stok Bahan</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2">
                <PackageCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-800 block">Staf Pembungkus</span>
                  <span className="text-[11px] text-gray-500">Verifikasi & Kemas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-white/60">
        &copy; {new Date().getFullYear()} Pabrik Kerupuk Diansyah &bull; Sistem E-KRUPSY
      </footer>
    </div>
  );
}
