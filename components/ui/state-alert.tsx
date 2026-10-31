import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type StateType = 'idle' | 'loading' | 'success' | 'error' | 'info';

interface StateAlertProps {
  type: StateType;
  message?: string | null;
  onClose?: () => void;
  className?: string;
}

export default function StateAlert({ type, message, onClose, className = '' }: StateAlertProps) {
  if (!message || type === 'idle') return null;

  const config = {
    loading: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />,
      defaultMsg: 'Sedang memproses permintaan...',
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      defaultMsg: 'Operasi berhasil diselesaikan.',
    },
    error: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
      defaultMsg: 'Terjadi kesalahan sistem.',
    },
    info: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <Info className="w-5 h-5 text-amber-600 shrink-0" />,
      defaultMsg: 'Informasi sistem.',
    },
  }[type];

  return (
    <div
      className={`p-4 rounded-2xl border flex items-start gap-3 shadow-sm animate-fadeIn ${config.bg} ${className}`}
    >
      {config.icon}
      <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
        {message || config.defaultMsg}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-0.5 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
