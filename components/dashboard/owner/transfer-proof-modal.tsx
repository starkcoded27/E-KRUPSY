import React from 'react';
import { X, Check, Image as ImageIcon } from 'lucide-react';

export interface OrderItemModal {
  id_pesanan: number;
  total_harga: number;
  pelanggan?: {
    nama_lengkap: string;
    no_telp: string;
  };
  pembayaran?: {
    id_pembayaran: number;
    metode_pembayaran: string;
    status_pembayaran: string;
    jumlah_bayar: number;
    bukti_transfer?: string | null;
  }[];
}

interface TransferProofModalProps {
  order: OrderItemModal | null;
  onClose: () => void;
  onConfirm: (orderId: number) => Promise<void>;
}

/**
 * Komponen Modal Verifikasi Bukti Transfer Bank Pelanggan
 * Dipisahkan dari OwnerDashboardPage untuk mereduksi God Component / Long Function (Refactoring Modul 3)
 */
export const TransferProofModal: React.FC<TransferProofModalProps> = ({
  order,
  onClose,
  onConfirm,
}) => {
  if (!order) return null;

  const statusBayar = order.pembayaran?.[0]?.status_pembayaran;
  const isLunas = statusBayar === 'lunas';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Verifikasi Bukti Transfer Bank</h3>
            <p className="text-xs text-gray-400">
              Pesanan #{order.id_pesanan} &bull; {order.pelanggan?.nama_lengkap || 'Pelanggan'}
            </p>
          </div>
        </div>

        {/* Rincian Transaksi */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs mb-4">
          <div>
            <span className="text-gray-400 block text-[10px]">TOTAL YANG HARUS DITRANSFER:</span>
            <span className="font-mono font-black text-brand-maroon text-sm">
              Rp {Number(order.total_harga).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 block text-[10px]">STATUS SAAT INI:</span>
            <span className={`font-bold ${isLunas ? 'text-emerald-600' : 'text-blue-600'}`}>
              {isLunas ? '✓ LUNAS' : 'MENUNGGU ACC'}
            </span>
          </div>
        </div>

        {/* Gambar Bukti Screenshot Transfer */}
        <div className="rounded-2xl border border-gray-200 bg-gray-100 p-2 overflow-hidden flex items-center justify-center max-h-[55vh]">
          {order.pembayaran?.[0]?.bukti_transfer ? (
            <img
              src={order.pembayaran[0].bukti_transfer}
              alt="Screenshot Bukti Transfer Pelanggan"
              className="max-h-[50vh] object-contain rounded-xl shadow-sm"
            />
          ) : (
            <div className="p-8 text-center text-gray-400 text-xs">
              Pelanggan belum mengunggah gambar bukti transfer.
            </div>
          )}
        </div>

        {/* Tombol Aksi Owner */}
        <div className="mt-5 flex gap-2 pt-2 border-t border-gray-100">
          {!isLunas && (
            <button
              type="button"
              onClick={async () => {
                await onConfirm(order.id_pesanan);
                onClose();
              }}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>✓ ACC Lunas (Bukti Transfer Sah)</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
