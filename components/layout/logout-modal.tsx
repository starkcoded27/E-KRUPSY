'use client';

import React from 'react';
import { LogOut, X } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut?: boolean;
}

export default function LogoutModal({ isOpen, onClose, onConfirm, isLoggingOut }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-brand-maroon flex items-center justify-center">
            <LogOut className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-1">Konfirmasi Logout</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Apakah Anda yakin ingin keluar dari sistem E-KRUPSY? Sesi penggunaan Anda akan diakhiri.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="w-full py-2.5 px-4 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition duration-150"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-brand-maroon hover:bg-brand-darkmaroon rounded-xl transition duration-150 shadow-md flex items-center justify-center gap-2"
          >
            {isLoggingOut ? 'Keluar...' : 'Ya, Keluar'}
          </button>
        </div>
      </div>
    </div>
  );
}
