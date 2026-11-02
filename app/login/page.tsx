'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import SupabaseStatusBadge from '@/components/supabase-status-badge';
import { 
  ArrowLeft, 
  LogIn, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  KeyRound, 
  ShieldCheck, 
  Flame, 
  PackageCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pelanggan' | 'master'>('all');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('Harap isi username/email dan password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(usernameOrEmail.trim(), password);

      if (!result.success) {
        setErrorMessage(result.message || 'Username atau password salah.');
        setIsSubmitting(false);
        return;
      }

      // Redirect ke dashboard yang sesuai
      if (result.redirectUrl) {
        router.push(result.redirectUrl);
      } else {
        router.push('/dashboard/pelanggan');
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kendala jaringan saat proses login.');
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsernameOrEmail(u);
    setPassword(p);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-maroon via-brand-darkmaroon to-[#3a0608] flex flex-col justify-center items-center p-4 py-8">
      {/* Top back button */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between text-white/90">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:text-amber-300 transition bg-black/20 px-3 py-1.5 rounded-xl border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Halaman Awal
        </Link>
        <span className="text-xs text-amber-200 font-medium">Autentikasi Pengguna</span>
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 relative">
        {/* Header (SDD Bab V Mockup Masuk) */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-maroon mx-auto flex items-center justify-center mb-3 shadow-inner border border-brand-100">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Masuk Akun</h2>
          <p className="text-xs text-gray-500 mt-1 mb-2.5">
            Masuk untuk mengakses layanan Pabrik Kerupuk Diansyah
          </p>
          <SupabaseStatusBadge />
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Username or Email Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Username atau Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Contoh: owner atau username pelanggan"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon focus:border-transparent transition"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon focus:border-transparent transition"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg transition duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memverifikasi Akun...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 text-amber-300" />
                <span>Masuk Sekarang</span>
              </>
            )}
          </button>
        </form>

        {/* Register CTA for Pelanggan */}
        <div className="mt-5 text-center border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">
            Pelanggan baru dan belum punya akun?{' '}
            <Link
              href="/register"
              className="font-bold text-brand-maroon hover:underline ml-1"
            >
              Daftar di sini
            </Link>
          </p>
        </div>
            </div>
          </div>
  );
}
