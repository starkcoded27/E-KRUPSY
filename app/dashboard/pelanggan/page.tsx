'use client';

import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/auth/role-guard';
import { useAuth } from '@/context/auth-context';
import StateAlert, { StateType } from '@/components/ui/state-alert';
import { validateForm } from '@/lib/validation';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Phone, 
  Search, 
  Plus, 
  CheckCircle2, 
  Truck, 
  Flame, 
  Package, 
  Printer, 
  X, 
  AlertCircle, 
  Trash2, 
  QrCode, 
  Banknote, 
  Building2,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

interface Produk {
  id_produk: number;
  nama_produk: string;
  satuan: string;
  harga: number;
  stok: number;
  deskripsi: string;
}

interface Pesanan {
  id_pesanan: number;
  id_pelanggan: number;
  id_produk: number;
  tanggal_pesanan: string;
  jumlah: number;
  varian_rasa: string;
  ukuran_plastik: string;
  total_harga: number;
  status_pesanan: string;
  produk?: Produk;
  pembayaran?: {
    id_pembayaran: number;
    metode_pembayaran: string;
    status_pembayaran: string;
    jumlah_bayar: number;
  }[];
  produksi?: {
    id_produksi: number;
    status_produksi: string;
    verifikasi?: {
      id_verifikasi: number;
      status: string;
      keterangan: string;
    }[];
  }[];
}

export default function PelangganDashboardPage() {
  const { user, pelanggan } = useAuth();

  // State data
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [pesananList, setPesananList] = useState<Pesanan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'katalog' | 'pesanan_saya'>('katalog');

  // State Modal Order
  const [selectedProduct, setSelectedProduct] = useState<Produk | null>(null);
  const [orderQty, setOrderQty] = useState<number>(1);
  const [orderVarian, setOrderVarian] = useState<string>('Original');
  const [orderPlastik, setOrderPlastik] = useState<string>('1/2 kg');
  const [orderMetode, setOrderMetode] = useState<string>('tunai');

  // State Modal Resi / Bukti Bayar
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<Pesanan | null>(null);

  // 3 Kondisi Sistem (State)
  const [actionState, setActionState] = useState<{ type: StateType; message: string | null }>({
    type: 'idle',
    message: null,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch data dari Supabase
  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      // 1. Fetch katalog produk
      const resProd = await fetch('/api/produk');
      const dataProd = await resProd.json();
      if (resProd.ok) {
        setProdukList(dataProd.data || []);
      }

      // 2. Fetch pesanan pelanggan
      if (pelanggan?.id_pelanggan) {
        const resOrder = await fetch(`/api/pesanan?id_pelanggan=${pelanggan.id_pelanggan}`);
        const dataOrder = await resOrder.json();
        if (resOrder.ok) {
          setPesananList(dataOrder.data || []);
        }
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pelanggan]);

  // Handle Order Submit dengan 4 Jenis Validasi
  const handleOpenOrderModal = (item: Produk) => {
    setSelectedProduct(item);
    setOrderQty(1);
    setOrderVarian('Original');
    setOrderPlastik('1/2 kg');
    setOrderMetode('tunai');
    setValidationErrors({});
    setActionState({ type: 'idle', message: null });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !pelanggan?.id_pelanggan) return;

    // 4 JENIS VALIDASI INPUT
    const validation = validateForm([
      { field: 'jumlah', label: 'Jumlah Pesanan', value: orderQty, required: true, dataType: 'integer', domain: { min: 1, max: selectedProduct.stok } },
      { field: 'varian_rasa', label: 'Varian Rasa', value: orderVarian, required: true, domain: { allowedValues: ['Original', 'Balado', 'Pedas', 'Keju'] } },
      { field: 'ukuran_plastik', label: 'Ukuran Kemasan Plastik', value: orderPlastik, required: true, domain: { allowedValues: ['1/2 kg', '1x25 kg', '30x45 kg'] } },
      { field: 'metode_pembayaran', label: 'Metode Pembayaran', value: orderMetode, required: true, domain: { allowedValues: ['tunai', 'qris', 'transfer'] } },
    ]);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setActionState({
        type: 'error',
        message: validation.firstError || 'Periksa kembali isian formulir pemesanan.',
      });
      return;
    }

    setValidationErrors({});
    setActionState({ type: 'loading', message: 'Sedang memproses pesanan ke database Supabase...' });

    try {
      const res = await fetch('/api/pesanan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pelanggan: pelanggan.id_pelanggan,
          id_produk: selectedProduct.id_produk,
          jumlah: Number(orderQty),
          varian_rasa: orderVarian,
          ukuran_plastik: orderPlastik,
          metode_pembayaran: orderMetode,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setActionState({ type: 'error', message: resData.message || 'Pesanan gagal disimpan. Silakan coba kembali.' });
        return;
      }

      setActionState({
        type: 'success',
        message: 'Pesanan berhasil ditambahkan! Data otomatis masuk antrean produksi pabrik.',
      });

      // Refresh data & switch to Pesanan Saya
      await fetchData();
      setTimeout(() => {
        setSelectedProduct(null);
        setActiveTab('pesanan_saya');
      }, 1500);
    } catch (err: any) {
      setActionState({ type: 'error', message: 'Terjadi kegagalan jaringan saat menyimpan pesanan.' });
    }
  };

  // Handle Pembatalan Pesanan (UC-06)
  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;

    setActionState({ type: 'loading', message: 'Memproses pembatalan pesanan...' });

    try {
      const res = await fetch(`/api/pesanan/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setActionState({ type: 'error', message: resData.message || 'Pesanan gagal dibatalkan.' });
        return;
      }

      setActionState({ type: 'success', message: 'Pesanan berhasil dibatalkan dan stok dikembalikan.' });
      await fetchData();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat membatalkan pesanan.' });
    }
  };

  // Helper tampilan status pesanan (Lengkap 4 Alur Produksi Pabrik)
  const getStatusBadge = (order: Pesanan) => {
    // 1. Dibatalkan
    if (order.status_pesanan === 'dibatalkan') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
          <X className="w-3.5 h-3.5 text-gray-500" />
          Dibatalkan
        </span>
      );
    }

    // 2. Siap Diambil / Selesai
    if (order.status_pesanan === 'selesai') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          4. Siap Diambil / Selesai
        </span>
      );
    }

    // Periksa status produksi dan hasil verifikasi mutu
    const prod = order.produksi?.[0];
    const hasPassedQC = Boolean(prod?.verifikasi && prod.verifikasi.some((v) => v.status === 'Lolos Verifikasi'));
    const isPacking = prod?.status_produksi === 'sedang_dikemas' || hasPassedQC;

    // 3. Sedang Dibungkus / Dikemas (Setelah Lolos QC)
    if (isPacking) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300 animate-pulse">
          <Package className="w-3.5 h-3.5 text-blue-600" />
          3. Sedang Dibungkus / Dikemas
        </span>
      );
    }

    // 4. Selesai Goreng (Menunggu QC Pembungkus)
    if (prod?.status_produksi === 'siap_diverifikasi') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-900 border border-indigo-300">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          2b. Selesai Goreng (Menunggu QC)
        </span>
      );
    }

    // 5. Dalam Penggorengan
    if (order.status_pesanan === 'diproses' || prod?.status_produksi === 'diproses') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-900 border border-orange-300 animate-pulse">
          <Flame className="w-3.5 h-3.5 text-orange-600" />
          2. Dalam Penggorengan / Produksi
        </span>
      );
    }

    // 6. Menunggu Diproses
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        1. Menunggu Diproses
      </span>
    );
  };

  const filteredProducts = produkList.filter((p) =>
    p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={['pelanggan']} pageTitle="Dashboard Pelanggan">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-maroon via-brand-darkmaroon to-[#4a060a] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-amber-200 backdrop-blur-sm mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
              Area Resmi Pelanggan Diansyah
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              Hi, {user?.nama}!<br />
              <span className="text-amber-300 font-extrabold">Mari Pesan Kerupuk Khas Diansyah</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed">
              Pesan langsung dari pabrik secara mandiri, pantau status penggorengan hingga pengemasan produk Anda secara terpadu.
            </p>
          </div>
        </div>

        {/* Action Global Feedback State Alert */}
        <StateAlert
          type={actionState.type}
          message={actionState.message}
          onClose={() => setActionState({ type: 'idle', message: null })}
        />

        {/* Customer Address Info Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Identitas Pemesan</h3>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-800">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-maroon" />
                {pelanggan?.alamat || 'Alamat belum diatur'}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-brand-maroon" />
                {pelanggan?.no_telp || 'No. Telp'}
              </span>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={isLoadingData}
            className="inline-flex items-center gap-1.5 text-xs text-brand-maroon font-bold bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl border border-brand-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
            Perbarui Data
          </button>
        </div>

        {/* Tabs: Katalog vs Pesanan Saya */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('katalog')}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'katalog'
                ? 'border-brand-maroon text-brand-maroon'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Katalog Kerupuk ({produkList.length})
          </button>
          <button
            onClick={() => setActiveTab('pesanan_saya')}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'pesanan_saya'
                ? 'border-brand-maroon text-brand-maroon'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pesanan Saya ({pesananList.length})
          </button>
        </div>

        {/* TAB 1: KATALOG PRODUK */}
        {activeTab === 'katalog' && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari jenis kerupuk..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon shadow-sm"
              />
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((item) => (
                <div
                  key={item.id_produk}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-2xl shadow-inner">
                        🍘
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        item.stok > 0 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {item.stok > 0 ? `Stok: ${item.stok} ${item.satuan}` : 'Stok Habis'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 leading-snug">{item.nama_produk}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.deskripsi || 'Kerupuk khas renyah dan gurih.'}</p>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-baseline justify-between">
                      <span className="text-xs text-gray-400">Harga / {item.satuan}:</span>
                      <span className="text-lg font-black text-brand-maroon">
                        Rp {Number(item.harga).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 border-t border-gray-100">
                    <button
                      onClick={() => handleOpenOrderModal(item)}
                      disabled={item.stok <= 0}
                      className="w-full flex items-center justify-center gap-2 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      {item.stok > 0 ? 'Pesan Sekarang' : 'Stok Kosong'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PESANAN SAYA & STATUS (UC-04, UC-05, UC-06, UC-13) */}
        {activeTab === 'pesanan_saya' && (
          <div className="space-y-4">
            {pesananList.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="font-bold text-gray-800 text-base">Belum Ada Pesanan</h4>
                <p className="text-xs text-gray-500 mt-1">Anda belum melakukan pemesanan kerupuk.</p>
                <button
                  onClick={() => setActiveTab('katalog')}
                  className="mt-4 px-4 py-2 bg-brand-maroon text-white text-xs font-bold rounded-xl shadow"
                >
                  Buka Katalog Produk
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {pesananList.map((order) => {
                  const payInfo = order.pembayaran?.[0];
                  const isPaid = payInfo?.status_pembayaran === 'lunas';

                  return (
                    <div
                      key={order.id_pesanan}
                      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
                            ID: #{order.id_pesanan}
                          </span>
                          <span className="text-xs text-gray-400">
                            {order.tanggal_pesanan}
                          </span>
                        </div>
                        <div>{getStatusBadge(order)}</div>
                      </div>

                      <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">{order.produk?.nama_produk}</h4>
                          <div className="text-xs text-gray-500 space-y-0.5 mt-1">
                            <p>Jumlah: <strong className="text-gray-800">{order.jumlah} {order.produk?.satuan || 'Bal'}</strong></p>
                            <p>Varian: <strong className="text-gray-800">{order.varian_rasa}</strong> &bull; Kemasan: <strong className="text-gray-800">{order.ukuran_plastik}</strong></p>
                            <p>Metode Pembayaran: <strong className="uppercase text-gray-800">{payInfo?.metode_pembayaran || 'Tunai'}</strong></p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-gray-400 block">Total Tagihan:</span>
                          <span className="text-xl font-black text-brand-maroon">
                            Rp {Number(order.total_harga).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* STATUS PEMBAYARAN: BELUM LUNAS vs SUDAH LUNAS */}
                      {!isPaid ? (
                        <div className="mb-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                              <AlertCircle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-amber-900 uppercase tracking-wide">
                                  Status Pembayaran: Belum Lunas
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                                  Menunggu Pembayaran
                                </span>
                              </div>
                              <span className="text-[11px] text-amber-700 mt-0.5 block leading-tight">
                                Silakan selesaikan pembayaran tunai kepada Owner/Kasir saat mengambil pesanan di pabrik.
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-amber-800">
                            Tagihan: Rp {Number(order.total_harga).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ) : (
                        <div className="mb-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                                  Status Pembayaran: Sudah Lunas
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full">
                                  ✓ Terverifikasi Owner
                                </span>
                              </div>
                              <span className="text-[11px] text-emerald-700 mt-0.5 block leading-tight">
                                Pembayaran sah tercatat di sistem. Tunjukkan tanda lunas saat pengambilan kerupuk.
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-700 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                            LUNAS (Kasir Pabrik)
                          </span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2">
                        {/* Batalkan Pesanan jika masih menunggu_diproses */}
                        {order.status_pesanan === 'menunggu_diproses' && (
                          <button
                            onClick={() => handleCancelOrder(order.id_pesanan)}
                            className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:bg-red-50 font-bold px-3 py-2 rounded-xl border border-red-200 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Batalkan Pesanan
                          </button>
                        )}

                        {/* Tombol Tanda Lunas HANYA MUNCUL JIKA SUDAH LUNAS */}
                        {isPaid && (
                          <button
                            onClick={() => setSelectedOrderReceipt(order)}
                            className="inline-flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-md transition active:scale-95"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Tunjukkan Tanda Lunas ke Owner
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MODAL 1: FORM PEMESANAN MANDIRI (SDD UC-02 & UC-03) */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-maroon flex items-center justify-center font-bold">
                    🍘
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Konfirmasi Pemesanan</h3>
                    <p className="text-[11px] text-gray-500">{selectedProduct.nama_produk}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1 rounded-xl text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Alert di dalam modal */}
              {actionState.message && (
                <div className="mb-4">
                  <StateAlert
                    type={actionState.type}
                    message={actionState.message}
                    onClose={() => setActionState({ type: 'idle', message: null })}
                  />
                </div>
              )}

              <form onSubmit={handleOrderSubmit} className="space-y-4">
                {/* 1. Jumlah Pesanan (Domain Check: 1 s.d Stok) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700">
                      Jumlah Pesanan ({selectedProduct.satuan}) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-400">Tersedia: {selectedProduct.stok} {selectedProduct.satuan}</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.stok}
                    value={orderQty}
                    onChange={(e) => setOrderQty(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                    required
                  />
                  {validationErrors.jumlah && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{validationErrors.jumlah}</p>
                  )}
                </div>

                {/* 2. Pilihan Rasa (Domain Check) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Pilihan Varian Rasa <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={orderVarian}
                    onChange={(e) => setOrderVarian(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                  >
                    <option value="Original">Original Gurih</option>
                    <option value="Balado">Balado Manis Pedas</option>
                    <option value="Pedas">Pedas Level 5</option>
                    <option value="Keju">Keju Asin Gurih</option>
                  </select>
                </div>

                {/* 3. Pilihan Kemasan Plastik (Domain Check) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Ukuran Kemasan Plastik <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={orderPlastik}
                    onChange={(e) => setOrderPlastik(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                  >
                    <option value="1/2 kg">Kemasan Plastik 1/2 kg</option>
                    <option value="1x25 kg">Kemasan Plastik 1x25 kg</option>
                    <option value="30x45 kg">Kemasan Karung 30x45 kg</option>
                  </select>
                </div>

                {/* 4. Metode Pembayaran (SDD UC-12) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Metode Pembayaran <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderMetode('tunai')}
                      className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                        orderMetode === 'tunai'
                          ? 'border-brand-maroon bg-brand-50 text-brand-maroon'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                      <span>Tunai (Cash)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderMetode('qris')}
                      className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                        orderMetode === 'qris'
                          ? 'border-brand-maroon bg-brand-50 text-brand-maroon'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                      <span>QRIS Instan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderMetode('transfer')}
                      className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                        orderMetode === 'transfer'
                          ? 'border-brand-maroon bg-brand-50 text-brand-maroon'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                      <span>Transfer Bank</span>
                    </button>
                  </div>
                </div>

                {/* Total Ringkasan Biaya */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                    <span>Harga Satuan:</span>
                    <span>Rp {Number(selectedProduct.harga).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                    <span>Jumlah:</span>
                    <span>{orderQty} {selectedProduct.satuan}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm font-black text-gray-900">
                    <span>Total Pembayaran:</span>
                    <span className="text-brand-maroon text-lg">
                      Rp {(Number(selectedProduct.harga) * Math.max(1, orderQty)).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionState.type === 'loading'}
                    className="py-3 px-4 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold rounded-2xl shadow-md transition disabled:opacity-50"
                  >
                    {actionState.type === 'loading' ? 'Memproses...' : 'Kirim Pesanan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: TANDA LUNAS DIGITAL UNTUK DITUNJUKKAN KE OWNER (TANPA TOMBOL CETAK OLEH PELANGGAN) */}
        {selectedOrderReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
              <button
                onClick={() => setSelectedOrderReceipt(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Digital Pass Header */}
              <div className="text-center pb-4 border-b border-dashed border-gray-200">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-2xl mx-auto flex items-center justify-center mb-2 shadow-lg shadow-emerald-600/20">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="font-black text-gray-900 text-lg uppercase tracking-wide">Pabrik Kerupuk Diansyah</h3>
                <p className="text-[11px] text-gray-500">Jl. Pangeran Kornel No. 204, Pasanggrahan Baru, Sumedang</p>
                
                {/* Stampel Digital Lunas */}
                <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border-2 border-emerald-400 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  STATUS: LUNAS &bull; SAH DITERIMA KASIR
                </div>
              </div>

              {/* Rincian Transaksi */}
              <div className="py-4 space-y-2 text-xs border-b border-dashed border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nomor Transaksi:</span>
                  <span className="font-mono font-bold text-gray-800">TRX-KD-{selectedOrderReceipt.id_pesanan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tanggal Pemesanan:</span>
                  <span className="font-medium text-gray-800">{selectedOrderReceipt.tanggal_pesanan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Nama Pemesan:</span>
                  <span className="font-bold text-gray-800">{pelanggan?.nama_lengkap || user?.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">No. WhatsApp/HP:</span>
                  <span className="font-medium text-gray-800">{pelanggan?.no_telp || '-'}</span>
                </div>
              </div>

              {/* Rincian Produk */}
              <div className="py-4 space-y-2 text-xs border-b border-dashed border-gray-200">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>{selectedOrderReceipt.produk?.nama_produk} ({selectedOrderReceipt.varian_rasa})</span>
                  <span>{selectedOrderReceipt.jumlah} {selectedOrderReceipt.produk?.satuan}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>Ukuran Kemasan: {selectedOrderReceipt.ukuran_plastik}</span>
                  <span>Rp {Number(selectedOrderReceipt.produk?.harga || 0).toLocaleString('id-ID')} / bal</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-black text-emerald-700">
                  <span>TOTAL SUDAH DIBAYAR:</span>
                  <span className="text-base font-black text-brand-maroon">
                    Rp {Number(selectedOrderReceipt.total_harga).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Keterangan Serah Terima Pabrik */}
              <div className="py-3 text-center bg-gray-50 rounded-2xl border border-gray-100 my-3 p-3">
                <p className="text-[11px] text-gray-600 font-semibold">
                  Tunjukkan tampilan layar ini kepada Owner/Kasir saat mengambil pesanan kerupuk di pabrik.
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Resi cetak fisik resmi dikeluarkan & dicetak langsung oleh Owner.
                </p>
              </div>

              {/* Tombol Tutup (Sesuai SDD, Pelanggan tidak mencetak struk fisik) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedOrderReceipt(null)}
                  className="w-full py-3 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs rounded-2xl shadow-md transition"
                >
                  Tutup Tampilan Tanda Lunas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
