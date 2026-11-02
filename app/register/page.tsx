'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { 
  ArrowLeft, 
  UserPlus, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ShieldCheck
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    nama_lengkap: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    no_telp: '',
    alamat: '',
    jenis_kelamin: 'Laki-Laki',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let value = e.target.value;
    
    // Nomor HP wajib angka (integer only, hapus huruf dan simbol otomatis)
    if (e.target.name === 'no_telp') {
      value = value.replace(/\D/g, '');
    }

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));

    // Bersihkan pesan error saat user mengetik
    setErrorMessage('');
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const errors: Record<string, string> = {};

    // 1. Validasi Keberadaan (Existence Check) - Bahasa Indonesia
    if (!formData.nama_lengkap.trim()) {
      errors.nama_lengkap = 'Nama lengkap wajib diisi.';
    }
    if (!formData.username.trim()) {
      errors.username = 'Username tidak boleh kosong, harap isi username Anda.';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email tidak boleh kosong, harap isi alamat email Anda.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Format email tidak valid (contoh: nama@email.com).';
    }

    // 2. Validasi Nomor HP: Wajib Angka (Integer / Numeric Only, gaboleh huruf)
    if (!formData.no_telp.trim()) {
      errors.no_telp = 'Nomor HP/WhatsApp tidak boleh kosong, harap isi nomor HP Anda.';
    } else if (!/^[0-9]+$/.test(formData.no_telp.trim())) {
      errors.no_telp = 'Nomor HP harus berupa angka (integer), tidak boleh mengandung huruf atau simbol.';
    } else if (formData.no_telp.trim().length < 9 || formData.no_telp.trim().length > 15) {
      errors.no_telp = 'Nomor HP harus terdiri dari 9 hingga 15 digit angka.';
    }

    if (!formData.alamat.trim()) {
      errors.alamat = 'Alamat lengkap pengiriman wajib diisi.';
    }

    if (!formData.password) {
      errors.password = 'Password tidak boleh kosong, harap buat password Anda.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password minimal harus 6 karakter.';
    }

    if (!formData.confirm_password) {
      errors.confirm_password = 'Harap ulangi password pada konfirmasi password.';
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Konfirmasi password tidak cocok dengan password yang diinput.';
    }

    // Jika ada error validasi
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0];
      setErrorMessage(errors[firstKey]);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const res = await register({
        nama_lengkap: formData.nama_lengkap,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        no_telp: formData.no_telp,
        alamat: formData.alamat,
        jenis_kelamin: formData.jenis_kelamin,
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Pendaftaran gagal. Silakan periksa kembali data Anda.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('Pendaftaran berhasil! Akun pelanggan Anda telah terdaftar. Mengalihkan ke halaman login...');
      setTimeout(() => {
        router.push('/login');
      }, 1800);
    } catch (err: any) {
      setErrorMessage('Terjadi kendala saat menghubungi server.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-maroon via-brand-darkmaroon to-[#3a0608] flex flex-col justify-center items-center p-4 py-8">
      {/* Top back button */}
      <div className="w-full max-w-lg mb-3 flex items-center justify-between text-white/90">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:text-amber-300 transition bg-black/20 px-3 py-1.5 rounded-xl border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Login
        </Link>
        <span className="text-xs text-amber-200 font-medium">Registrasi Pelanggan Baru</span>
      </div>

      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 relative">
        {/* Header (SDD Bab V Mockup Halaman Daftar) */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-maroon mx-auto flex items-center justify-center mb-3 shadow-inner border border-brand-100">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Daftar Akun Pelanggan</h2>
          <p className="text-xs text-gray-500 mt-1">
            Buat akun baru untuk memesan kerupuk dan memantau status pesanan secara mandiri
          </p>
        </div>

        {/* Notice Info on Role */}
        <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-amber-800 text-xs">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            Pendaftaran ini khusus untuk akun <strong>Pelanggan</strong>. Akun staf internal (Owner, Penggoreng, Pembungkus) telah dikelola via Data Master sistem.
          </span>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap Anda"
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm focus:outline-none transition ${
                  fieldErrors.nama_lengkap
                    ? 'border-2 border-red-500 bg-red-50/40 text-red-900 focus:ring-2 focus:ring-red-400'
                    : 'bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent'
                }`}
              />
            </div>
            {fieldErrors.nama_lengkap && (
              <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {fieldErrors.nama_lengkap}
              </p>
            )}
          </div>

          {/* Username & Email Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="cth: budiman123"
                className={`w-full px-3.5 py-2.5 rounded-2xl text-sm focus:outline-none transition ${
                  fieldErrors.username
                    ? 'border-2 border-red-500 bg-red-50/40 text-red-900 focus:ring-2 focus:ring-red-400'
                    : 'bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent'
                }`}
              />
              {fieldErrors.username && (
                <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {fieldErrors.username}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-2xl text-sm focus:outline-none transition ${
                    fieldErrors.email
                      ? 'border-2 border-red-500 bg-red-50/40 text-red-900 focus:ring-2 focus:ring-red-400'
                      : 'bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {fieldErrors.email}
                </p>
              )}
            </div>
          </div>

          {/* Nomor Telepon & Jenis Kelamin Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                No. Telepon / WhatsApp <span className="text-red-500">*</span> <span className="text-[10px] text-gray-400 font-normal">(Hanya Angka)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="no_telp"
                  value={formData.no_telp}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    // Cegah input huruf & karakter spesial (hanya angka 0-9 & tombol navigasi)
                    if (
                      !/[0-9]/.test(e.key) &&
                      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
                      !e.ctrlKey &&
                      !e.metaKey
                    ) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="08123456789"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-2xl text-sm focus:outline-none transition ${
                    fieldErrors.no_telp
                      ? 'border-2 border-red-500 bg-red-50/40 text-red-900 focus:ring-2 focus:ring-red-400'
                      : 'bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent'
                  }`}
                />
              </div>
              {fieldErrors.no_telp && (
                <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {fieldErrors.no_telp}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Jenis Kelamin
              </label>
              <select
                name="jenis_kelamin"
                value={formData.jenis_kelamin}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon focus:border-transparent transition"
              >
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>

          {/* Alamat Pengiriman */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Alamat Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3 pointer-events-none text-gray-400">
                <MapPin className="w-4 h-4" />
              </div>
              <textarea
                name="alamat"
                rows={2}
                value={formData.alamat}
                onChange={handleChange}
                placeholder="Jl. Pangeran Kornel No. 204, Pasanggrahan Baru, Sumedang"
                className={`w-full pl-9 pr-3.5 py-2 rounded-2xl text-sm focus:outline-none transition resize-none ${
                  fieldErrors.alamat
                    ? 'border-2 border-red-500 bg-red-50/40 text-red-900 focus:ring-2 focus:ring-red-400'
                    : 'bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent'
                }`}
              />
            </div>
            {fieldErrors.alamat && (
              <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {fieldErrors.alamat}
              </p>
            )}
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 karakter"
                  className={`w-full pl-9 pr-9 py-2.5 rounded-2xl text-sm focus:outline-none transition ${
                    fieldErrors.password
                      ? 'border-2 border-red-500 bg-red-50/40 text-red-900 focus:ring-2 focus:ring-red-400'
                      : 'bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Ulangi password"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-2xl text-sm focus:outline-none transition ${
                    fieldErrors.confirm_password
                      ? 'border-2 border-red-500 bg-red-50/40 text-red-900 focus:ring-2 focus:ring-red-400'
                      : 'bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent'
                  }`}
                />
              </div>
              {fieldErrors.confirm_password && (
                <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {fieldErrors.confirm_password}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || Boolean(successMessage)}
            className="w-full mt-3 flex items-center justify-center gap-2 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg transition duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Mendaftarkan Akun...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 text-amber-300" />
                <span>Selesai & Daftar Akun</span>
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-5 text-center border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">
            Sudah memiliki akun?{' '}
            <Link
              href="/login"
              className="font-bold text-brand-maroon hover:underline ml-1"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
