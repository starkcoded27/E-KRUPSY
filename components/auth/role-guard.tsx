'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { UserRole } from '@/types/database';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  pageTitle?: string;
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'owner':
      return 'Owner / Pimpinan Pabrik';
    case 'staff_penggoreng':
      return 'Staf Penggorengan';
    case 'staff_pembungkus':
      return 'Staf Pembungkus';
    case 'pelanggan':
      return 'Pelanggan';
    default:
      return role;
  }
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'owner':
      return '/dashboard/owner';
    case 'staff_penggoreng':
      return '/dashboard/staff-penggoreng';
    case 'staff_pembungkus':
      return '/dashboard/staff-pembungkus';
    case 'pelanggan':
      return '/dashboard/pelanggan';
    default:
      return '/login';
  }
}

export default function RoleGuard({ children, allowedRoles, pageTitle }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-brand-maroon" />
        <p className="mt-3 text-sm text-gray-500 font-medium">Memeriksa hak akses sistem...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check role authorization
  const isAuthorized = allowedRoles.includes(user.role);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            Halaman {pageTitle ? <strong>{pageTitle}</strong> : 'ini'} hanya dapat diakses oleh role{' '}
            <span className="font-semibold text-gray-800">
              {allowedRoles.map(getRoleDisplayName).join(' atau ')}
            </span>.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mb-6 text-left">
            <span className="font-semibold block mb-1">Status Akun Anda:</span>
            Nama: <strong>{user.nama}</strong> ({user.username})<br />
            Role Saat Ini: <span className="uppercase font-bold text-brand-maroon">{getRoleDisplayName(user.role)}</span>
          </div>

          <Link
            href={getDashboardPath(user.role)}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-medium py-3 px-4 rounded-xl transition duration-150 shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard Anda
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
