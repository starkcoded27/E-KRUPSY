'use client';

import React from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  Printer,
  QrCode,
  Building2,
  Banknote,
  Check,
  Eye,
  ImageIcon,
  Receipt,
} from 'lucide-react';
import { formatVarianRasa } from '@/lib/pricing';
import { OrderItem } from '../types';

interface OwnerOrderTableProps {
  orders: OrderItem[];
  orderFilter: 'semua' | 'aktif' | 'selesai' | 'dibatalkan';
  setOrderFilter: (f: 'semua' | 'aktif' | 'selesai' | 'dibatalkan') => void;
  onConfirmPayment: (orderId: number) => Promise<void>;
  onOpenTransferProof: (order: OrderItem) => void;
  onOpenQrisProof: (order: OrderItem) => void;
  onOpenPrintReceipt: (order: OrderItem) => void;
}

export default function OwnerOrderTable({
  orders,
  orderFilter,
  setOrderFilter,
  onConfirmPayment,
  onOpenTransferProof,
  onOpenQrisProof,
  onOpenPrintReceipt,
}: OwnerOrderTableProps) {
  const activeOrdersCount = orders.filter(
    (o) => o.status_pesanan === 'menunggu_diproses' || o.status_pesanan === 'diproses'
  ).length;
  const completedOrdersCount = orders.filter((o) => o.status_pesanan === 'selesai').length;
  const cancelledOrdersCount = orders.filter((o) => o.status_pesanan === 'dibatalkan').length;

  const displayedOrders = orders.filter((order) => {
    if (orderFilter === 'aktif')
      return order.status_pesanan === 'menunggu_diproses' || order.status_pesanan === 'diproses';
    if (orderFilter === 'selesai') return order.status_pesanan === 'selesai';
    if (orderFilter === 'dibatalkan') return order.status_pesanan === 'dibatalkan';
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 print:hidden pb-1">
        <button
          type="button"
          onClick={() => setOrderFilter('semua')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            orderFilter === 'semua'
              ? 'bg-brand-maroon text-white shadow-sm'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          Semua Transaksi
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              orderFilter === 'semua' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {orders.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setOrderFilter('aktif')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            orderFilter === 'aktif'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          Aktif Berjalan
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              orderFilter === 'aktif' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {activeOrdersCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setOrderFilter('selesai')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            orderFilter === 'selesai'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          Selesai
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              orderFilter === 'selesai' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {completedOrdersCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setOrderFilter('dibatalkan')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            orderFilter === 'dibatalkan'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          Dibatalkan Pelanggan
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              orderFilter === 'dibatalkan' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
            }`}
          >
            {cancelledOrdersCount}
          </span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-y border-gray-100">
            <tr>
              <th className="py-3 px-3">ID</th>
              <th className="py-3 px-3">Tanggal</th>
              <th className="py-3 px-3">Pelanggan</th>
              <th className="py-3 px-3">Produk & Varian</th>
              <th className="py-3 px-3">Total Tagihan</th>
              <th className="py-3 px-3">Status Produksi</th>
              <th className="py-3 px-3">Status Pembayaran</th>
              <th className="py-3 px-3 text-center print:hidden">Aksi Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayedOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400 italic">
                  Tidak ada data pesanan pada kategori filter ini.
                </td>
              </tr>
            ) : (
              displayedOrders.map((order) => {
                const payInfo = order.pembayaran?.[0];
                const isPaid = payInfo?.status_pembayaran === 'lunas';
                const isCancelled = order.status_pesanan === 'dibatalkan';

                return (
                  <tr
                    key={order.id_pesanan}
                    className={`hover:bg-gray-50/70 ${isCancelled ? 'bg-red-50/20 opacity-75' : ''}`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-gray-800">#{order.id_pesanan}</td>
                    <td className="py-3 px-3 text-gray-500">{order.tanggal_pesanan}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-gray-900 block">
                        {order.pelanggan?.nama_lengkap || 'Pelanggan'}
                      </span>
                      <span className="text-[10px] text-gray-400">{order.pelanggan?.no_telp || '-'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-gray-800">{order.produk?.nama_produk}</span>
                      <span className="text-[11px] text-gray-500 block">
                        {order.jumlah} {order.produk?.satuan} &bull;{' '}
                        <strong className="text-gray-900">{formatVarianRasa(order.varian_rasa)}</strong> (
                        {order.ukuran_plastik})
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-brand-maroon">
                      Rp {Number(order.total_harga).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3">
                      {(() => {
                        const prod = order.produksi?.[0];
                        const hasPassedQC = Boolean(
                          prod?.verifikasi && prod.verifikasi.some((v) => v.status === 'Lolos Verifikasi')
                        );
                        if (order.status_pesanan === 'dibatalkan') {
                          return (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                              ❌ Dibatalkan
                            </span>
                          );
                        }
                        if (order.status_pesanan === 'selesai') {
                          return (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              4. Siap Diambil
                            </span>
                          );
                        }
                        if (prod?.status_produksi === 'sedang_dikemas' || hasPassedQC) {
                          return (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              3. Sedang Dikemas
                            </span>
                          );
                        }
                        if (prod?.status_produksi === 'siap_diverifikasi') {
                          return (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                              2b. Menunggu QC
                            </span>
                          );
                        }
                        if (order.status_pesanan === 'diproses' || prod?.status_produksi === 'diproses') {
                          return (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                              2. Digoreng
                            </span>
                          );
                        }
                        return (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            1. Menunggu
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-3">
                      {isCancelled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                          BATAL (TIDAK DITAGIH)
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="uppercase font-bold text-[10px] text-gray-500 flex items-center gap-1">
                            {payInfo?.metode_pembayaran === 'qris' && <QrCode className="w-3 h-3 text-red-600" />}
                            {payInfo?.metode_pembayaran === 'transfer' && (
                              <Building2 className="w-3 h-3 text-blue-600" />
                            )}
                            {(!payInfo?.metode_pembayaran || payInfo?.metode_pembayaran === 'tunai') && (
                              <Banknote className="w-3 h-3 text-emerald-600" />
                            )}
                            {payInfo?.metode_pembayaran || 'Tunai'}
                          </span>

                          {/* Badge Status */}
                          {isPaid ? (
                            <div className="flex flex-col gap-1 items-start">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                LUNAS {payInfo?.metode_pembayaran === 'qris' ? '(QRIS)' : ''}
                              </span>
                              {payInfo?.metode_pembayaran === 'qris' && (
                                <button
                                  type="button"
                                  onClick={() => onOpenQrisProof(order)}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-md border border-red-200 transition"
                                >
                                  <Receipt className="w-3 h-3" />
                                  <span>Bukti QRIS Masuk</span>
                                </button>
                              )}
                            </div>
                          ) : payInfo?.metode_pembayaran === 'transfer' ? (
                            <div className="flex flex-col gap-1 items-start">
                              {payInfo?.bukti_transfer ? (
                                <>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                    <ImageIcon className="w-3 h-3 text-blue-600" />
                                    BUKTI TERKIRIM
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onOpenTransferProof(order)}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 transition"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Lihat Screenshot</span>
                                  </button>
                                </>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                  <Clock className="w-3 h-3 text-gray-500" />
                                  BELUM UPLOAD BUKTI
                                </span>
                              )}
                            </div>
                          ) : payInfo?.metode_pembayaran === 'qris' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <QrCode className="w-3 h-3 text-amber-600" />
                              MENUNGGU SCAN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              PENDING (COD)
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center print:hidden">
                      {isCancelled ? (
                        <span className="text-[10px] font-semibold text-gray-400 italic">
                          Dibatalkan Pelanggan
                        </span>
                      ) : !isPaid ? (
                        <div className="flex flex-col items-center gap-1">
                          {payInfo?.metode_pembayaran === 'transfer' && payInfo?.bukti_transfer ? (
                            <button
                              onClick={() => onOpenTransferProof(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95"
                              title="Lihat bukti screenshot transfer dan sahkan lunas"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Periksa & ACC</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onConfirmPayment(order.id_pesanan)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95"
                              title="Klik untuk mengonfirmasi bahwa pembayaran telah diterima dan mengubah status menjadi Lunas"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>ACC Lunas</span>
                            </button>
                          )}
                          <span className="text-[9px] text-gray-400">
                            {payInfo?.metode_pembayaran === 'transfer'
                              ? payInfo?.bukti_transfer
                                ? 'Bukti siap diverifikasi'
                                : 'Menunggu upload pembeli'
                              : payInfo?.metode_pembayaran === 'qris'
                              ? 'Scan otomatis oleh pembeli'
                              : 'Klik saat kas diterima'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-300">
                            ✓ Di-ACC Lunas
                          </span>
                          <button
                            onClick={() => onOpenPrintReceipt(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-95"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Cetak Resi
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
