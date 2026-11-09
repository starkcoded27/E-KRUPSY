'use client';

import React, { useState } from 'react';
import {
  XCircle,
  Package,
  DollarSign,
  Users,
  Search,
  Calendar,
  AlertTriangle,
  RotateCcw,
  MessageCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { formatVarianRasa, parseCartOrderMeta } from '@/lib/pricing';
import { OrderItem } from '../types';

interface OwnerCancellationDashboardProps {
  orders: OrderItem[];
}

export default function OwnerCancellationDashboard({ orders }: OwnerCancellationDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const cancelledOrders = orders.filter((o) => o.status_pesanan === 'dibatalkan');

  const filtered = cancelledOrders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const idMatch = String(o.id_pesanan).includes(q);
    const custMatch = o.pelanggan?.nama_lengkap?.toLowerCase().includes(q) || false;
    const prodMatch = o.produk?.nama_produk?.toLowerCase().includes(q) || false;
    const telpMatch = o.pelanggan?.no_telp?.includes(q) || false;
    return idMatch || custMatch || prodMatch || telpMatch;
  });

  const totalBatalNominal = cancelledOrders.reduce(
    (sum, o) => sum + (Number(o.total_harga) || 0),
    0
  );
  const totalBatalBal = cancelledOrders.reduce(
    (sum, o) => sum + (Number(o.jumlah) || 0),
    0
  );
  const totalBatalKg = totalBatalBal * 5;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Banner Eksekutif Dashboard Pembatalan */}
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-red-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-200 border border-rose-400/30 mb-3">
            <XCircle className="w-3.5 h-3.5 text-rose-300" />
            Pusat Monitoring Pembatalan Pesanan Pelanggan (Make-To-Order)
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            Dashboard Audit Pesanan Dibatalkan
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-rose-100/80 leading-relaxed">
            Memantau seluruh transaksi yang dibatalkan oleh pelanggan secara *real-time*. Seluruh pesanan yang batal sebelum proses penggorengan otomatis mengembalikan alokasi bahan mentah ke dapur wajan.
          </p>
        </div>

        {/* 4 Kartu Metrik Pembatalan Owner */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="flex items-center justify-between text-rose-200 text-xs mb-1">
              <span className="font-semibold">Total Pesanan Batal</span>
              <XCircle className="w-4 h-4 text-rose-300" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {cancelledOrders.length} Pesanan
            </div>
            <p className="text-[10px] text-rose-200/80 mt-1">Dari total seluruh transaksi</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="flex items-center justify-between text-rose-200 text-xs mb-1">
              <span className="font-semibold">Total Nominal Batal</span>
              <DollarSign className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono">
              Rp {totalBatalNominal.toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] text-rose-200/80 mt-1">Potensi omset tidak terealisasi</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="flex items-center justify-between text-rose-200 text-xs mb-1">
              <span className="font-semibold">Stok Mentah Bal Balik</span>
              <Package className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="text-2xl font-black text-emerald-300 font-mono">
              +{totalBatalBal} Bal
            </div>
            <p className="text-[10px] text-emerald-200/80 mt-1">Stok katalog otomatis bertambah</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="flex items-center justify-between text-rose-200 text-xs mb-1">
              <span className="font-semibold">Bahan Mentah Dapur</span>
              <RotateCcw className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="text-2xl font-black text-cyan-300 font-mono">
              +{totalBatalKg} Kg Mentah
            </div>
            <p className="text-[10px] text-cyan-200/80 mt-1">Aman tidak terbuang di wajan</p>
          </div>
        </div>
      </div>

      {/* Banner Penjelasan Sinkronisasi Produksi */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold text-amber-950">Sinkronisasi Otomatis Antar Divisi Pabrik:</p>
          <p className="text-[11px] text-amber-800 mt-0.5">
            Saat pelanggan menekan tombol batal, sistem secara otomatis: (1) Menghapus tiket kerja dari layar wajan <strong>Staff Penggoreng</strong>, (2) Menghapus dari antrean packing <strong>Staff Pembungkus</strong>, dan (3) Mengembalikan kuota stok kerupuk mentah agar dapat dibeli oleh pelanggan lain.
          </p>
        </div>
      </div>

      {/* Kontrol Pencarian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID pesanan, nama pelanggan, atau nama produk..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
          />
        </div>

        <span className="text-xs font-bold text-gray-500">
          Menampilkan {filtered.length} dari {cancelledOrders.length} pesanan dibatalkan
        </span>
      </div>

      {/* Tabel Rinci Pesanan Dibatalkan */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-200">
          <XCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-gray-700">Tidak ada data pesanan yang dibatalkan.</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Semua pesanan pelanggan diproses lancar sampai selesai.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-3">ID & Tanggal</th>
                <th className="py-3 px-3">Data Pelanggan</th>
                <th className="py-3 px-3">Produk & Varian</th>
                <th className="py-3 px-3">Volume & Bahan</th>
                <th className="py-3 px-3 text-right">Nilai Tagihan</th>
                <th className="py-3 px-3 text-center">Status Stok</th>
                <th className="py-3 px-3 text-center">Tindakan Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => {
                const payInfo = order.pembayaran?.[0];
                const cleanPhone = (order.pelanggan?.no_telp || '').replace(/^0/, '62').replace(/\D/g, '');
                const waMessage = encodeURIComponent(
                  `Halo Bapak/Ibu ${order.pelanggan?.nama_lengkap || ''}, kami dari Pabrik Kerupuk Diansyah mengonfirmasi bahwa pesanan kerupuk Anda #${order.id_pesanan} (${order.produk?.nama_produk || ''}) telah kami batalkan. Apakah ada kendala yang bisa kami bantu? Terima kasih.`
                );
                const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${waMessage}` : null;

                return (
                  <tr key={order.id_pesanan} className="hover:bg-rose-50/30 transition">
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 block w-fit mb-1">
                        #{order.id_pesanan}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        {order.tanggal_pesanan || order.created_at?.slice(0, 10) || '-'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-gray-900 block">{order.pelanggan?.nama_lengkap || '-'}</span>
                      <span className="text-[10px] text-gray-500 font-mono block">{order.pelanggan?.no_telp || '-'}</span>
                    </td>

                    <td className="py-3 px-3">
                      {(() => {
                        const cartMeta = parseCartOrderMeta(order.pembayaran?.[0]?.bukti_transfer);
                        if (cartMeta && cartMeta.items?.length) {
                          return (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                                🛒 Paket Keranjang ({cartMeta.items.length} Macam)
                              </span>
                              <div className="space-y-0.5 mt-0.5">
                                {cartMeta.items.map((it, idx) => (
                                  <div key={idx} className="text-[11px] text-gray-700">
                                    <strong>{it.nama_produk}</strong> ({it.jumlah} Bal) &bull;{' '}
                                    <span className="text-orange-700">{formatVarianRasa(it.varian_rasa)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <>
                            <span className="font-bold text-gray-900 block">{order.produk?.nama_produk || '-'}</span>
                            <span className="text-[11px] text-gray-600 block">
                              {formatVarianRasa(order.varian_rasa)} &bull; {order.ukuran_plastik}
                            </span>
                          </>
                        );
                      })()}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-gray-900 block">
                        {order.jumlah} {order.produk?.satuan || 'Bal'}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold block">
                        +{order.jumlah * 5} Kg Mentah Balik
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span className="font-mono font-bold text-rose-600 block">
                        Rp {Number(order.total_harga).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase block">
                        {payInfo?.metode_pembayaran || 'tunai'} &bull; BATAL
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Stok Dapur Aman
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {waLink ? (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 text-[11px] transition"
                          title="Hubungi pelanggan via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Hubungi Pelanggan</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Tidak ada No. WA</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
