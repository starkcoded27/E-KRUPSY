'use client';

import React from 'react';
import {
  XCircle,
  RotateCcw,
  ShoppingBag,
  Clock,
  Package,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { formatVarianRasa } from '@/lib/pricing';
import { Pesanan } from '../types';

interface PelangganCancellationListProps {
  cancelledOrders: Pesanan[];
  onReorder: (order: Pesanan) => void;
  onSwitchToCatalog: () => void;
}

export default function PelangganCancellationList({
  cancelledOrders,
  onReorder,
  onSwitchToCatalog,
}: PelangganCancellationListProps) {
  const totalBatalNominal = cancelledOrders.reduce(
    (sum, o) => sum + (Number(o.total_harga) || 0),
    0
  );
  const totalBatalQty = cancelledOrders.reduce(
    (sum, o) => sum + (Number(o.jumlah) || 0),
    0
  );

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Dashboard Khusus Pembatalan */}
      <div className="bg-gradient-to-r from-rose-900 via-red-800 to-rose-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-200 border border-rose-400/30 mb-3">
            <XCircle className="w-3.5 h-3.5 text-rose-300" />
            Dashboard Khusus Riwayat Pembatalan Pesanan
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            Catatan Pesanan yang Dibatalkan
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-rose-100/80 leading-relaxed">
            Daftar seluruh pesanan kerupuk yang telah dibatalkan. Setiap pembatalan pesanan secara otomatis mengembalikan alokasi bahan mentah ke dapur penggorengan pabrik.
          </p>
        </div>

        {/* 3 Kartu Metrik Ringkasan Pembatalan */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
            <span className="text-[11px] font-semibold text-rose-200 block">Total Dibatalkan:</span>
            <span className="text-2xl font-black text-white font-mono mt-0.5 block">
              {cancelledOrders.length} Pesanan
            </span>
            <span className="text-[10px] text-rose-200/80 mt-0.5 block">Terekam dalam sistem</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
            <span className="text-[11px] font-semibold text-rose-200 block">Volume Kerupuk Batal:</span>
            <span className="text-2xl font-black text-amber-300 font-mono mt-0.5 block">
              {totalBatalQty} Bal
            </span>
            <span className="text-[10px] text-rose-200/80 mt-0.5 block">Alokasi bahan mentah dikembalikan</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
            <span className="text-[11px] font-semibold text-rose-200 block">Akumulasi Nilai Batal:</span>
            <span className="text-2xl font-black text-white font-mono mt-0.5 block">
              Rp {totalBatalNominal.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-rose-200/80 mt-0.5 block">Tidak ditagihkan / lunas</span>
          </div>
        </div>
      </div>

      {/* Banner SOP Pembatalan */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold text-amber-950">Informasi Kebijakan Pembatalan Pabrik:</p>
          <p className="text-[11px] text-amber-800 mt-0.5">
            Pelanggan dapat membatalkan pesanan selama status produksi masih <em>&quot;Menunggu Diproses&quot;</em> dan belum digoreng di wajan dapur. Jika Anda ingin memesan kembali produk yang sebelumnya dibatalkan, cukup klik tombol <strong>&quot;Pesan Ulang Sekarang&quot;</strong> di bawah ini.
          </p>
        </div>
      </div>

      {/* Daftar Kartu Pesanan Dibatalkan */}
      {cancelledOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-gray-800 text-base">Tidak Ada Pesanan yang Dibatalkan</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Semua pesanan yang Anda buat berjalan lancar dan belum ada riwayat pesanan yang dibatalkan.
          </p>
          <button
            onClick={onSwitchToCatalog}
            className="mt-4 px-4 py-2 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold rounded-xl shadow transition"
          >
            Lihat Katalog Kerupuk
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {cancelledOrders.map((order) => {
            const payInfo = order.pembayaran?.[0];
            return (
              <div
                key={order.id_pesanan}
                className="bg-white rounded-2xl border border-rose-200 p-5 shadow-sm hover:shadow-md transition relative overflow-hidden"
              >
                {/* Aksen strip merah di sisi kiri */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500" />

                {/* Header Kartu */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 pl-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-rose-50 text-rose-700 px-3 py-1 rounded-lg border border-rose-200">
                      ID Pesanan: #{order.id_pesanan}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {order.tanggal_pesanan || order.created_at?.slice(0, 10)}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Pesanan Telah Dibatalkan
                  </span>
                </div>

                {/* Konten Kartu */}
                <div className="py-4 pl-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-base sm:text-lg">
                      {order.produk?.nama_produk || 'Kerupuk Diansyah'}
                    </h4>
                    <div className="text-xs sm:text-sm text-gray-600 space-y-1 mt-1">
                      <p>
                        Volume: <strong className="text-gray-900">{order.jumlah} {order.produk?.satuan || 'Bal'}</strong>
                      </p>
                      <p>
                        Varian Rasa: <strong className="text-gray-900">{formatVarianRasa(order.varian_rasa)}</strong> &bull; Kemasan: <strong className="text-gray-900">{order.ukuran_plastik}</strong>
                      </p>
                      <p>
                        Metode Pembayaran Asal: <strong className="uppercase text-gray-800">{payInfo?.metode_pembayaran || 'Tunai'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                      Nominal yang Dibatalkan:
                    </span>
                    <span className="text-lg sm:text-xl font-black text-rose-600 font-mono block">
                      Rp {Number(order.total_harga).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-gray-400 italic block mt-0.5">
                      Status tagihan: Hangus / Tidak Ditagihkan
                    </span>
                  </div>
                </div>

                {/* Info Pengembalian Stok & Tombol Pesan Ulang */}
                <div className="pt-3 border-t border-gray-100 pl-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50/70 p-3 rounded-xl mt-1">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Package className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Stok bahan mentah (<strong>{order.jumlah * 5} Kg</strong>) telah dikembalikan ke gudang dapur.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onReorder(order)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 shrink-0"
                    title="Pesan kembali varian kerupuk ini"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                    <span>Pesan Ulang Produk Ini</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
