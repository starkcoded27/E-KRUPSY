'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  X,
  Package,
  Clock,
  Flame,
  CheckCircle2,
  QrCode,
  Building2,
  AlertCircle,
  Receipt,
  Upload,
  Eye,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { formatVarianRasa, parseCartOrderMeta, getTransferImageSrc } from '@/lib/pricing';
import { Pesanan } from '../types';

interface PelangganHistoryListProps {
  orders: Pesanan[];
  onOpenQris: (order: Pesanan) => void;
  onOpenQrisReceipt: (order: Pesanan) => void;
  onOpenUploadTransfer: (order: Pesanan) => void;
  onPreviewProof: (image: string, orderId: number) => void;
  onCancelOrder: (orderId: number) => Promise<void>;
  onShowReceipt: (order: Pesanan) => void;
  onSwitchToCatalog: () => void;
}

export default function PelangganHistoryList({
  orders,
  onOpenQris,
  onOpenQrisReceipt,
  onOpenUploadTransfer,
  onPreviewProof,
  onCancelOrder,
  onShowReceipt,
  onSwitchToCatalog,
}: PelangganHistoryListProps) {
  const [filterStatus, setFilterStatus] = useState<'semua' | 'aktif' | 'selesai' | 'dibatalkan'>('semua');

  const activeOrdersCount = orders.filter(
    (o) => o.status_pesanan === 'menunggu_diproses' || o.status_pesanan === 'diproses'
  ).length;
  const completedOrdersCount = orders.filter((o) => o.status_pesanan === 'selesai').length;
  const cancelledOrdersCount = orders.filter((o) => o.status_pesanan === 'dibatalkan').length;

  const displayedOrders = orders.filter((order) => {
    if (filterStatus === 'aktif') {
      return order.status_pesanan === 'menunggu_diproses' || order.status_pesanan === 'diproses';
    }
    if (filterStatus === 'selesai') {
      return order.status_pesanan === 'selesai';
    }
    if (filterStatus === 'dibatalkan') {
      return order.status_pesanan === 'dibatalkan';
    }
    return true;
  });
  const getStatusBadge = (order: Pesanan) => {
    if (order.status_pesanan === 'dibatalkan') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
          <X className="w-3.5 h-3.5 text-gray-500" />
          Dibatalkan
        </span>
      );
    }

    const prod = order.produksi?.[0];
    const hasPassedQC = Boolean(
      prod?.verifikasi && prod.verifikasi.some((v) => v.status === 'Lolos Verifikasi')
    );

    if (order.status_pesanan === 'selesai' || prod?.status_produksi === 'selesai') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          4. Siap Diambil / Selesai
        </span>
      );
    }

    const isPacking =
      (prod?.status_produksi === 'sedang_dikemas' || hasPassedQC) &&
      prod?.status_produksi !== 'selesai' &&
      order.status_pesanan !== 'selesai';

    if (isPacking) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300 animate-pulse">
          <Package className="w-3.5 h-3.5 text-blue-600" />
          3. Sedang Dibungkus / Dikemas
        </span>
      );
    }

    if (prod?.status_produksi === 'siap_diverifikasi') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          2b. Selesai Goreng (Menunggu QC)
        </span>
      );
    }

    if (order.status_pesanan === 'diproses' || prod?.status_produksi === 'diproses') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300 animate-pulse">
          <Flame className="w-3.5 h-3.5 text-orange-600" />
          2. Dalam Penggorengan / Produksi
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        1. Menunggu Diproses
      </span>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h4 className="font-bold text-gray-800 text-base">Belum Ada Pesanan</h4>
        <p className="text-xs text-gray-500 mt-1">Anda belum melakukan pemesanan kerupuk.</p>
        <button
          onClick={onSwitchToCatalog}
          className="mt-4 px-4 py-2 bg-brand-maroon text-white text-xs font-bold rounded-xl shadow"
        >
          Buka Katalog Produk
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs Status Pesanan Pelanggan */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <button
          type="button"
          onClick={() => setFilterStatus('semua')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterStatus === 'semua'
              ? 'bg-brand-maroon text-white shadow-sm'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <span>Semua Pesanan</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filterStatus === 'semua' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {orders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('aktif')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterStatus === 'aktif'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <span>Aktif Diproses</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filterStatus === 'aktif' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
            {activeOrdersCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('selesai')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterStatus === 'selesai'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <span>Selesai</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filterStatus === 'selesai' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
            {completedOrdersCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('dibatalkan')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterStatus === 'dibatalkan'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <span>Dibatalkan</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filterStatus === 'dibatalkan' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'}`}>
            {cancelledOrdersCount}
          </span>
        </button>
      </div>

      {displayedOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
          <p className="text-xs font-semibold text-gray-500">
            Tidak ada pesanan pada kategori filter &quot;{filterStatus}&quot;.
          </p>
        </div>
      ) : (
        displayedOrders.map((order) => {
        const payInfo = order.pembayaran?.[0];
        const isPaid = payInfo?.status_pembayaran === 'lunas';
        const cartMeta = parseCartOrderMeta(payInfo?.bukti_transfer);
        const isCartBatch = Boolean(cartMeta && cartMeta.items && cartMeta.items.length > 0);

        return (
          <div
            key={order.id_pesanan}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs sm:text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-lg border border-gray-200">
                  ID: #{order.id_pesanan}
                </span>
                <span className="text-xs text-gray-400">{order.tanggal_pesanan}</span>
                {isCartBatch && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                    🛒 Pesanan Keranjang ({cartMeta!.items.length} Varian)
                  </span>
                )}
              </div>
              <div>{getStatusBadge(order)}</div>
            </div>

            <div className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1 w-full">
                {isCartBatch ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-lg sm:text-xl">
                        Paket Keranjang Belanja ({cartMeta!.items.length} Macam Kerupuk)
                      </h4>
                    </div>

                    <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-2.5 max-w-2xl">
                      <div className="flex items-center justify-between border-b border-amber-200/60 pb-1.5">
                        <span className="text-xs font-bold text-amber-950">
                          Rincian Produk Dipesan:
                        </span>
                        <span className="text-[11px] text-amber-800 font-semibold">
                          Total Volume: <strong>{order.jumlah} Bal</strong>
                        </span>
                      </div>

                      <div className="space-y-2 divide-y divide-amber-200/50">
                        {cartMeta!.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                          >
                            <div>
                              <span className="font-bold text-gray-900 text-sm">
                                {idx + 1}. {it.nama_produk}
                              </span>
                              <div className="text-[11px] text-gray-600 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span>
                                  Jumlah: <strong>{it.jumlah} {it.satuan || 'Bal'}</strong>
                                </span>
                                <span>&bull;</span>
                                <span>
                                  Varian: <strong className="text-orange-700">{formatVarianRasa(it.varian_rasa)}</strong>
                                </span>
                                <span>&bull;</span>
                                <span>
                                  Kemasan: <strong className="text-blue-700">{it.ukuran_plastik}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="sm:text-right font-mono font-bold text-brand-maroon text-xs sm:text-sm">
                              Rp {Number(it.subtotal).toLocaleString('id-ID')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600">
                      Metode Pembayaran: <strong className="uppercase text-gray-800">{payInfo?.metode_pembayaran || 'Tunai'}</strong>
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg sm:text-xl">{order.produk?.nama_produk}</h4>
                    <div className="text-sm sm:text-base text-gray-700 space-y-1.5 mt-1.5 font-normal">
                      <p>
                        Jumlah: <strong className="text-gray-800">{order.jumlah} {order.produk?.satuan || 'Bal'}</strong>
                      </p>
                      <p>
                        Varian: <strong className="text-gray-800">{formatVarianRasa(order.varian_rasa)}</strong> &bull; Kemasan: <strong className="text-gray-800">{order.ukuran_plastik}</strong>
                      </p>
                      <p>
                        Metode Pembayaran: <strong className="uppercase text-gray-800">{payInfo?.metode_pembayaran || 'Tunai'}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">
                  Total Tagihan:
                </span>
                <span className="text-xl sm:text-2xl font-black text-brand-maroon block">
                  Rp {Number(order.total_harga).toLocaleString('id-ID')}
                </span>
                {isCartBatch && (
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    1 Pembayaran untuk seluruh item
                  </span>
                )}
              </div>
            </div>

            {/* Status Pembayaran Card */}
            <div
              className={`mb-3 p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                isPaid
                  ? 'bg-emerald-50/80 border-emerald-200'
                  : payInfo?.metode_pembayaran === 'transfer' && payInfo?.bukti_transfer
                  ? 'bg-blue-50/80 border-blue-200'
                  : 'bg-amber-50/80 border-amber-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-700'
                      : payInfo?.metode_pembayaran === 'transfer' && payInfo?.bukti_transfer
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {isPaid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : payInfo?.metode_pembayaran === 'qris' ? (
                    <QrCode className="w-5 h-5 text-amber-600" />
                  ) : payInfo?.metode_pembayaran === 'transfer' ? (
                    <Building2 className="w-5 h-5 text-blue-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wide text-gray-900">
                      Metode: {payInfo?.metode_pembayaran || 'Tunai'}
                    </span>
                    {isPaid ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-950 rounded-full">
                        ✓ SUDAH LUNAS {payInfo?.metode_pembayaran === 'qris' ? '(QRIS OTOMATIS)' : '(DI-ACC OWNER)'}
                      </span>
                    ) : payInfo?.metode_pembayaran === 'transfer' && payInfo?.bukti_transfer ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-200 text-blue-950 rounded-full">
                        ✓ BUKTI TERKIRIM (MENUNGGU ACC OWNER)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-950 rounded-full">
                        BELUM LUNAS (MENUNGGU PEMBAYARAN)
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] mt-1 block leading-tight text-gray-600">
                    {isPaid
                      ? payInfo?.metode_pembayaran === 'qris'
                        ? 'Pembayaran QRIS telah diverifikasi secara otomatis & dana telah masuk ke e-wallet owner.'
                        : 'Pembayaran sah dan telah diverifikasi oleh kasir/owner pabrik.'
                      : payInfo?.metode_pembayaran === 'qris'
                      ? 'Silakan klik tombol "Buka & Scan QRIS" di samping untuk men-scan kode QR dan menyelesaikan pembayaran.'
                      : payInfo?.metode_pembayaran === 'transfer'
                      ? payInfo?.bukti_transfer
                        ? 'Foto bukti transfer Anda telah tersimpan dan sedang diperiksa oleh Owner.'
                        : 'Silakan transfer ke nomor rekening pabrik (BCA/Mandiri/BJB) lalu unggah foto screenshot bukti transfer.'
                      : 'Silakan selesaikan pembayaran tunai kepada Owner/Kasir saat mengambil pesanan di pabrik (COD).'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                {!isPaid && payInfo?.metode_pembayaran === 'qris' && (
                  <button
                    type="button"
                    onClick={() => onOpenQris(order)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95"
                  >
                    <QrCode className="w-4 h-4 text-amber-300" />
                    <span>Buka & Scan QRIS</span>
                  </button>
                )}

                {isPaid && payInfo?.metode_pembayaran === 'qris' && (
                  <button
                    type="button"
                    onClick={() => onOpenQrisReceipt(order)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Lihat Struk QRIS</span>
                  </button>
                )}

                {payInfo?.metode_pembayaran === 'transfer' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenUploadTransfer(order)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-xl text-xs shadow-md transition active:scale-95 ${
                        payInfo?.bukti_transfer
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-brand-maroon hover:bg-brand-darkmaroon text-white'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>{payInfo?.bukti_transfer ? 'Ganti Bukti Transfer' : 'Upload Bukti Transfer'}</span>
                    </button>

                    {payInfo?.bukti_transfer && (
                      <button
                        type="button"
                        onClick={() =>
                          onPreviewProof(
                            getTransferImageSrc(payInfo.bukti_transfer) || '',
                            order.id_pesanan
                          )
                        }
                        className="p-2 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 font-bold transition shadow-sm"
                        title="Pratinjau Bukti Transfer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons: Cancel & Receipt */}
            <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2">
              {order.status_pesanan === 'menunggu_diproses' && !isPaid && (
                <button
                  onClick={() => onCancelOrder(order.id_pesanan)}
                  className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:bg-red-50 font-bold px-3 py-2 rounded-xl border border-red-200 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Batalkan Pesanan
                </button>
              )}

              {isPaid && (
                <button
                  onClick={() => onShowReceipt(order)}
                  className="inline-flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-md transition active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Tunjukkan Tanda Lunas ke Owner
                </button>
              )}
            </div>
          </div>
        );
      }))}
    </div>
  );
}
