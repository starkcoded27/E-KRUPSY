'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { getRoleDisplayName } from '@/components/auth/role-guard';
import LogoutModal from '@/components/layout/logout-modal';
import { LogOut, UserCircle, Shield, ShoppingBag, Flame, PackageCheck, BarChart3 } from 'lucide-react';
import { UserRole } from '@/types/database';

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) return null;

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    setShowLogoutModal(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <BarChart3 className="w-3.5 h-3.5" />
            OWNER / ADMIN
          </span>
        );
      case 'staff_penggoreng':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-900 border border-orange-300">
            <Flame className="w-3.5 h-3.5" />
            STAF PENGGORENG
          </span>
        );
      case 'staff_pembungkus':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
            <PackageCheck className="w-3.5 h-3.5" />
            STAF PEMBUNGKUS
          </span>
        );
      case 'pelanggan':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <ShoppingBag className="w-3.5 h-3.5" />
            PELANGGAN
          </span>
        );
    }
  };

  return (
    <>
      <header className="bg-brand-maroon text-white sticky top-0 z-40 shadow-lg border-b border-brand-darkmaroon">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg text-amber-300 tracking-wider shadow-inner">
                KD
              </div>
              <div>
                <span className="text-lg font-black tracking-wide text-white block leading-tight">
                  E-KRUPSY
                </span>
                <span className="text-[11px] text-amber-200 block font-normal leading-none">
                  Pabrik Kerupuk Diansyah
                </span>
              </div>
            </div>

            {/* User Profile & Role Info */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-sm font-semibold text-white leading-tight">
                  {user.nama}
                </span>
                <div className="mt-0.5">{getRoleBadge(user.role)}</div>
              </div>

              {/* Mobile Role Badge */}
              <div className="sm:hidden">{getRoleBadge(user.role)}</div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/15 hover:bg-white/25 text-white py-2 px-3 rounded-xl transition duration-150 border border-white/20 active:scale-95"
                title="Keluar dari sistem"
              >
                <LogOut className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
}
