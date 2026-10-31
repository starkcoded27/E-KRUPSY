'use client';

import React, { useEffect, useState } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface SupabaseStatus {
  connected: boolean;
  status: string;
  message: string;
  totalUsersInSupabase?: number;
}

export default function SupabaseStatusBadge() {
  const [status, setStatus] = useState<SupabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({
        connected: false,
        status: 'network_error',
        message: 'Gagal menghubungi endpoint status',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] bg-gray-100 text-gray-500 animate-pulse border border-gray-200">
        <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />
        <span>Memeriksa koneksi Supabase...</span>
      </div>
    );
  }

  if (status?.connected) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Database Supabase: <strong>Terhubung</strong> ({status.totalUsersInSupabase} User)</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300 shadow-sm">
      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
      <span>Supabase: <strong>Belum Terhubung</strong> (Kunci API .env.local belum diisi)</span>
    </div>
  );
}
