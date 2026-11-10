'use client';

import React from 'react';
import { X, Printer } from 'lucide-react';
import { formatVarianRasa, parseCartOrderMeta } from '@/lib/pricing';
import { OrderItem } from '../types';

interface OwnerReceiptModalProps {
  order: OrderItem | null;
  onClose: () => void;
}

export default function OwnerReceiptModal({ order, onClose }: OwnerReceiptModalProps) {
  if (!order) return null;

  return (
    <>
      {/* TAMPILAN 1: MODAL POPUP DI LAYAR DASHBOARD */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn print:hidden">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Resi Pabrik */}
          <div className="text-center pb-4 border-b border-dashed border-gray-300">
            <div className="w-12 h-12 rounded-2xl bg-brand-maroon text-amber-300 font-black text-xl mx-auto flex items-center justify-center mb-2 shadow">
              KD
            </div>
            <h3 className="font-black text-gray-900 text-lg uppercase tracking-wide">
              Pabrik Kerupuk Diansyah
            </h3>
            <p className="text-[11px] text-gray-500">
              Jl. Pangeran Kornel No. 204, Pasanggrahan Baru, Sumedang
            </p>
            <div className="mt-2 inline-block px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              RESI RESMI PEMBAYARAN SAH
            </div>
          </div>

          {/* Rincian Transaksi */}
          <div className="py-4 space-y-2 text-xs border-b border-dashed border-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-400">Nomor Transaksi:</span>
              <span className="font-mono font-bold text-gray-800">TRX-KD-{order.id_pesanan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tanggal:</span>
              <span className="font-medium text-gray-800">{order.tanggal_pesanan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Nama Pelanggan:</span>
              <span className="font-bold text-gray-800">
                {order.pelanggan?.nama_lengkap || 'Pelanggan'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">No. Telepon:</span>
              <span className="font-medium text-gray-800">{order.pelanggan?.no_telp || '-'}</span>
            </div>
          </div>

          {/* Rincian Produk */}
          <div className="py-4 space-y-2 text-xs border-b border-dashed border-gray-300">
            {(() => {
              const cartMeta = parseCartOrderMeta(order.pembayaran?.[0]?.bukti_transfer);
              if (cartMeta && cartMeta.items?.length) {
                return (
                  <div className="space-y-2.5">
                    <div className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex justify-between">
                      <span>Paket Keranjang ({cartMeta.items.length} Macam)</span>
                      <span>Total {order.jumlah} Bal</span>
                    </div>
                    {cartMeta.items.map((it, idx) => (
                      <div key={idx} className="border-b border-gray-100 last:border-none pb-1.5 last:pb-0">
                        <div className="flex justify-between font-bold text-gray-900">
                          <span>
                            {idx + 1}. {it.nama_produk} ({it.jumlah} {it.satuan || 'Bal'})
                          </span>
                          <span>Rp {Number(it.subtotal).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Varian: {formatVarianRasa(it.varian_rasa)} &bull; Kemasan: {it.ukuran_plastik}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
              return (
                <>
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>
                      {order.produk?.nama_produk} ({formatVarianRasa(order.varian_rasa)})
                    </span>
                    <span>
                      {order.jumlah} {order.produk?.satuan}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-[11px]">
                    <span>Ukuran Kemasan: {order.ukuran_plastik}</span>
                    <span>
                      Metode:{' '}
                      <strong className="uppercase">
                        {order.pembayaran?.[0]?.metode_pembayaran || 'Tunai'}
                      </strong>
                    </span>
                  </div>
                </>
              );
            })()}

            <div className="flex justify-between pt-2 text-sm font-black text-brand-maroon">
              <span>TOTAL PEMBAYARAN:</span>
              <span>Rp {Number(order.total_harga).toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Status Lunas */}
          <div className="py-3 text-center">
            <p className="text-[11px] text-gray-600 font-bold">
              Status: <span className="text-emerald-600">✓ LUNAS (Kas Telah Diterima Owner)</span>
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              Resi cetak ini resmi diserahkan kepada pelanggan sebagai bukti transaksi sah Pabrik Kerupuk Diansyah.
            </p>
          </div>

          {/* Tombol Cetak Khusus Owner */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-2.5 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Cetak Resi Fisik (Print)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* TAMPILAN 2: DOKUMEN CETAK RESMI DI KERTAS */}
      <div className="hidden print:block print:w-full print:m-0 print:p-0">
        <div className="print-receipt-fullpage">
          <div>
            <div className="text-center pb-4 border-b-2 border-gray-900">
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="w-12 h-12 rounded-2xl bg-brand-maroon text-amber-300 font-black text-2xl flex items-center justify-center shadow">
                  KD
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                    Pabrik Kerupuk Diansyah
                  </h2>
                  <p className="text-xs text-gray-600 font-medium">
                    Spesialis Kerupuk Gurih & Renyah Berkualitas Tinggi &bull; Sumedang
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Jl. Pangeran Kornel No. 204, Pasanggrahan Baru, Sumedang &bull; Telp / WA: 0895-2578-3995
              </p>
              <div className="mt-2.5 inline-block px-4 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-400 uppercase tracking-wider">
                ✓ RESI RESMI PEMBAYARAN SAH
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 py-4 border-b border-dashed border-gray-300 text-xs">
              <table className="w-full text-xs border-collapse">
                <tbody>
                  <tr className="align-top">
                    <td className="py-1 text-gray-500 font-medium whitespace-nowrap w-28">No. Transaksi</td>
                    <td className="py-1 px-1.5 text-gray-400 text-center w-3">:</td>
                    <td className="py-1 font-mono font-bold text-gray-900">TRX-KD-{order.id_pesanan}</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-1 text-gray-500 font-medium whitespace-nowrap">Tanggal Pesanan</td>
                    <td className="py-1 px-1.5 text-gray-400 text-center">:</td>
                    <td className="py-1 font-semibold text-gray-800">{order.tanggal_pesanan}</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-1 text-gray-500 font-medium whitespace-nowrap">Metode Bayar</td>
                    <td className="py-1 px-1.5 text-gray-400 text-center">:</td>
                    <td className="py-1 font-bold text-gray-900 uppercase">
                      {order.pembayaran?.[0]?.metode_pembayaran || 'Tunai'}
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="w-full text-xs border-collapse">
                <tbody>
                  <tr className="align-top">
                    <td className="py-1 text-gray-500 font-medium whitespace-nowrap w-28">Nama Pelanggan</td>
                    <td className="py-1 px-1.5 text-gray-400 text-center w-3">:</td>
                    <td className="py-1 font-bold text-gray-900">
                      {order.pelanggan?.nama_lengkap || 'Pelanggan'}
                    </td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-1 text-gray-500 font-medium whitespace-nowrap">No. Telepon</td>
                    <td className="py-1 px-1.5 text-gray-400 text-center">:</td>
                    <td className="py-1 font-semibold text-gray-800">{order.pelanggan?.no_telp || '-'}</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-1 text-gray-500 font-medium whitespace-nowrap">Status Pesanan</td>
                    <td className="py-1 px-1.5 text-gray-400 text-center">:</td>
                    <td className="py-1">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✓ SUDAH LUNAS
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="my-auto py-3">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50 text-gray-700 font-bold">
                  <th className="py-2.5 px-3 text-center w-12">No</th>
                  <th className="py-2.5 px-3">Produk & Varian Rasa</th>
                  <th className="py-2.5 px-3 text-center">Ukuran Kemasan</th>
                  <th className="py-2.5 px-3 text-center">Jumlah (Qty)</th>
                  <th className="py-2.5 px-3 text-right">Total Harga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(() => {
                  const cartMeta = parseCartOrderMeta(order.pembayaran?.[0]?.bukti_transfer);
                  if (cartMeta && cartMeta.items?.length) {
                    return cartMeta.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-3 text-center font-bold text-gray-600">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-gray-900 text-sm block">
                            {it.nama_produk}
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium">
                            Varian: {formatVarianRasa(it.varian_rasa)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-gray-700">
                          {it.ukuran_plastik}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-gray-900">
                          {it.jumlah} {it.satuan || 'Bal'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-gray-900 text-sm">
                          Rp {Number(it.subtotal).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ));
                  }
                  return (
                    <tr>
                      <td className="py-3 px-3 text-center font-bold text-gray-600">1</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-gray-900 text-sm block">
                          {order.produk?.nama_produk}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          Varian: {formatVarianRasa(order.varian_rasa)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-gray-700">
                        {order.ukuran_plastik}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-gray-900">
                        {order.jumlah} {order.produk?.satuan}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-gray-900 text-sm">
                        Rp {Number(order.total_harga).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-800 bg-gray-50 font-black text-sm">
                  <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider text-gray-900">
                    TOTAL PEMBAYARAN:
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-base text-brand-maroon">
                    Rp {Number(order.total_harga).toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="py-3 px-4 bg-emerald-50/60 border border-emerald-200 rounded-xl my-4 text-center">
              <p className="text-xs text-emerald-900 font-bold">
                Status Pembayaran:{' '}
                <span className="text-emerald-700 font-black">
                  ✓ LUNAS (Kas Telah Diterima & Diverifikasi Owner)
                </span>
              </p>
              <p className="text-[11px] text-emerald-800/80 mt-0.5">
                Resi cetak ini resmi diserahkan kepada pelanggan sebagai bukti transaksi sah Pabrik Kerupuk Diansyah.
              </p>
            </div>
          </div>

          <div>
            <div className="pt-2 flex justify-between items-end text-xs text-gray-700">
              <div className="text-center w-52">
                <p className="font-semibold text-gray-600 mb-14">Tanda Terima Pelanggan,</p>
                <p className="font-bold text-gray-900 border-t border-gray-400 pt-1">
                  ( {order.pelanggan?.nama_lengkap || 'Pelanggan'} )
                </p>
              </div>
              <div className="text-center w-56">
                <p className="text-gray-500 text-[10px] mb-1">
                  Sumedang,{' '}
                  {order.tanggal_pesanan ||
                    new Date().toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                </p>
                <p className="font-semibold text-gray-600 mb-14">Owner / Kasir Pabrik,</p>
                <p className="font-bold text-gray-900 border-t border-gray-800 pt-1">
                  ( Bapak Diansyah )
                </p>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-gray-200 text-center text-[10px] text-gray-400">
              Dokumen resi transaksi fisik resmi diterbitkan oleh Sistem Informasi E-KRUPSY &bull; Pabrik Kerupuk Diansyah
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
