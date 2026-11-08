'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { PelangganItem } from '../types';

interface OwnerCustomerTableProps {
  pelangganList: PelangganItem[];
}

export default function OwnerCustomerTable({ pelangganList }: OwnerCustomerTableProps) {
  if (!pelangganList || pelangganList.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
        <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-xs font-bold text-gray-600">Belum ada pelanggan terdaftar di Supabase.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-y border-gray-100">
          <tr>
            <th className="py-3 px-3">ID</th>
            <th className="py-3 px-3">Nama Lengkap</th>
            <th className="py-3 px-3">No. Telepon / WA</th>
            <th className="py-3 px-3">Alamat</th>
            <th className="py-3 px-3">Email</th>
            <th className="py-3 px-3">Jenis Kelamin</th>
            <th className="py-3 px-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {pelangganList.map((pel) => {
            const isNew = pel.id_pelanggan >= 7 || pel.nama_lengkap.toLowerCase().includes('hanifa');
            return (
              <tr key={pel.id_pelanggan} className="hover:bg-gray-50/70">
                <td className="py-3 px-3 font-mono font-bold text-gray-800">#{pel.id_pelanggan}</td>
                <td className="py-3 px-3">
                  <span className="font-bold text-gray-900 block">{pel.nama_lengkap}</span>
                  <span className="text-[10px] text-gray-400">ID User: #{pel.id_user}</span>
                </td>
                <td className="py-3 px-3 font-mono font-medium text-gray-700">{pel.no_telp || '-'}</td>
                <td className="py-3 px-3 text-gray-600 max-w-xs">{pel.alamat || '-'}</td>
                <td className="py-3 px-3 text-gray-600">{pel.email || '-'}</td>
                <td className="py-3 px-3 text-gray-600">{pel.jenis_kelamin || 'Perempuan'}</td>
                <td className="py-3 px-3">
                  {isNew ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      Pelanggan Baru
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                      Terdaftar
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
