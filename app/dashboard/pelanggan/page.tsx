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
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  Receipt,
  Eye,
  CreditCard,
  ArrowRight,
  Download,
  ExternalLink
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
    bukti_transfer?: string | null;
    tanggal_pembayaran?: string;
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

  // State Modal QRIS & Struk
  const [qrisModalOrder, setQrisModalOrder] = useState<Pesanan | null>(null);
  const [isProcessingQris, setIsProcessingQris] = useState(false);
  const [qrisReceiptData, setQrisReceiptData] = useState<any | null>(null);

  // State Modal Upload Bukti Transfer Bank
  const [uploadTransferOrder, setUploadTransferOrder] = useState<Pesanan | null>(null);
  const [transferImage, setTransferImage] = useState<string | null>(null);
  const [transferBank, setTransferBank] = useState<string>('Bank BCA (139-082-9912 a/n Bapak Diansyah)');
  const [transferCatatan, setTransferCatatan] = useState<string>('');
  const [isUploadingTransfer, setIsUploadingTransfer] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // State Modal Pratinjau Gambar Bukti Transfer
  const [previewProof, setPreviewProof] = useState<{ image: string; orderId: number; title: string } | null>(null);

  // 3 Kondisi Sistem (State)
  const [actionState, setActionState] = useState<{ type: StateType; message: string | null }>({
    type: 'idle',
    message: null,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch data dari Supabase
  const fetchData = async (silent = false) => {
    if (!silent) setIsLoadingData(true);
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
      if (!silent) console.error('Fetch error:', err);
    } finally {
      if (!silent) setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-update live real-time tanpa perlu refresh manual (setiap 2.5 detik)
    const interval = setInterval(() => {
      fetchData(true);
    }, 2500);

    return () => clearInterval(interval);
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

      if (orderMetode === 'qris' && resData.data) {
        const createdOrder: Pesanan = {
          ...resData.data,
          produk: selectedProduct,
          pembayaran: [
            {
              id_pembayaran: 0,
              metode_pembayaran: 'qris',
              status_pembayaran: 'pending',
              jumlah_bayar: Number(selectedProduct.harga) * Number(orderQty),
            }
          ]
        };
        setTimeout(() => {
          setSelectedProduct(null);
          setActiveTab('pesanan_saya');
          setQrisModalOrder(createdOrder);
          setQrisReceiptData(null);
        }, 500);
      } else {
        setTimeout(() => {
          setSelectedProduct(null);
          setActiveTab('pesanan_saya');
        }, 1000);
      }
    } catch (err: any) {
      setActionState({ type: 'error', message: 'Terjadi kegagalan jaringan saat menyimpan pesanan.' });
    }
  };

  // Salin Nomor Rekening Bank
  const handleCopyAccount = (number: string, label: string) => {
    navigator.clipboard.writeText(number);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  // Baca & Kompres Gambar Screenshot Bukti Transfer Bank
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setActionState({ type: 'error', message: 'File harus berupa gambar (JPG, PNG, JPEG, WebP).' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setTransferImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Submit Bukti Transfer Bank
  const handleSubmitTransferProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTransferOrder) return;
    if (!transferImage) {
      setActionState({ type: 'error', message: 'Silakan pilih file screenshot bukti transfer Anda terlebih dahulu.' });
      return;
    }

    setIsUploadingTransfer(true);
    setActionState({ type: 'loading', message: 'Mengirim screenshot bukti transfer ke sistem...' });

    try {
      const res = await fetch(`/api/pesanan/${uploadTransferOrder.id_pesanan}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_transfer',
          bukti_transfer: transferImage,
          bank_tujuan: transferBank,
          catatan: transferCatatan,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setActionState({ type: 'error', message: resData.message || 'Gagal mengirim bukti transfer.' });
        return;
      }

      setActionState({
        type: 'success',
        message: 'Bukti transfer berhasil dikirim! Owner akan memverifikasi dan meng-ACC lunas.',
      });

      setUploadTransferOrder(null);
      setTransferImage(null);
      setTransferCatatan('');
      await fetchData();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat mengirim bukti transfer.' });
    } finally {
      setIsUploadingTransfer(false);
    }
  };

  // Proses Simulasi Scan & Bayar QRIS Instan
  const handlePayQris = async (order: Pesanan) => {
    setIsProcessingQris(true);
    setActionState({ type: 'loading', message: 'Memproses verifikasi QRIS & transfer ke E-Wallet/Rekening Owner...' });

    try {
      const refId = `QRIS-KD-${Date.now().toString().slice(-8)}`;
      const res = await fetch(`/api/pesanan/${order.id_pesanan}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pay_qris',
          ref_id: refId,
          amount: order.total_harga,
          customer_name: pelanggan?.nama_lengkap || user?.nama || 'Pelanggan',
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setActionState({ type: 'error', message: resData.message || 'Gagal menyelesaikan pembayaran QRIS.' });
        return;
      }

      setQrisReceiptData({
        ref_id: refId,
        orderId: order.id_pesanan,
        amount: order.total_harga,
        productName: order.produk?.nama_produk || 'Kerupuk Diansyah',
        qty: order.jumlah,
        satuan: order.produk?.satuan || 'Bal',
        varian: order.varian_rasa,
        kemasan: order.ukuran_plastik,
        customerName: pelanggan?.nama_lengkap || user?.nama || 'Pelanggan',
        paidAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        destination: 'E-Wallet / Rekening Bapak Diansyah (Pabrik Kerupuk Diansah)',
        nmid: 'ID1025393458506',
      });

      setActionState({
        type: 'success',
        message: 'Pembayaran QRIS Berhasil! Dana otomatis masuk ke Rekening / E-Wallet Owner.',
      });

      await fetchData();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat verifikasi QRIS.' });
    } finally {
      setIsProcessingQris(false);
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
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-700 border border-gray-300 px-3.5 py-1.5">
          <X className="w-3.5 h-3.5 text-gray-500" />
          Dibatalkan
        </span>
      );
    }

    // Periksa status produksi dan hasil verifikasi mutu
    const prod = order.produksi?.[0];
    const hasPassedQC = Boolean(prod?.verifikasi && prod.verifikasi.some((v) => v.status === 'Lolos Verifikasi'));

    // 2. Siap Diambil / Selesai
    if (order.status_pesanan === 'selesai' || prod?.status_produksi === 'selesai') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-3.5 py-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          4. Siap Diambil / Selesai
        </span>
      );
    }

    const isPacking = (prod?.status_produksi === 'sedang_dikemas' || hasPassedQC) && prod?.status_produksi !== 'selesai' && order.status_pesanan !== 'selesai';

    // 3. Sedang Dibungkus / Dikemas (Setelah Lolos QC)
    if (isPacking) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-900 border border-blue-300 px-3.5 py-1.5 animate-pulse">
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
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-900 border border-orange-300 px-3.5 py-1.5 animate-pulse">
          <Flame className="w-3.5 h-3.5 text-orange-600" />
          2. Dalam Penggorengan / Produksi
        </span>
      );
    }

    // 6. Menunggu Diproses
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-1.5">
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
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1.5">Identitas Pemesan</h3>
            <div className="flex flex-wrap items-center gap-5 text-sm sm:text-base font-semibold text-gray-800">
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
            onClick={() => fetchData()}
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
                          <span className="font-mono font-bold text-sm bg-gray-100 text-gray-800 px-3 py-1.5 rounded-xl border border-gray-200">
                            ID: #{order.id_pesanan}
                          </span>
                          <span className="text-sm font-medium text-gray-500">
                            {order.tanggal_pesanan}
                          </span>
                        </div>
                        <div>{getStatusBadge(order)}</div>
                      </div>

                      <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-black text-gray-900 text-xl sm:text-2xl">{order.produk?.nama_produk}</h4>
                          <div className="text-sm sm:text-base text-gray-600 space-y-1.5 mt-2 font-medium">
                            <p>Jumlah: <strong className="text-gray-800">{order.jumlah} {order.produk?.satuan || 'Bal'}</strong></p>
                            <p>Varian: <strong className="text-gray-800">{order.varian_rasa}</strong> &bull; Kemasan: <strong className="text-gray-800">{order.ukuran_plastik}</strong></p>
                            <p>Metode Pembayaran: <strong className="uppercase text-gray-800">{payInfo?.metode_pembayaran || 'Tunai'}</strong></p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-500 block">Total Tagihan:</span>
                          <span className="text-2xl sm:text-3xl font-black text-brand-maroon">
                            Rp {Number(order.total_harga).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* STATUS PEMBAYARAN KHUSUS TIAP METODE */}
                      <div className={`mb-3 p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                        isPaid 
                          ? 'bg-emerald-50/80 border-emerald-200' 
                          : payInfo?.metode_pembayaran === 'transfer' && payInfo?.bukti_transfer
                          ? 'bg-blue-50/80 border-blue-200'
                          : 'bg-amber-50/80 border-amber-200'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isPaid 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : payInfo?.metode_pembayaran === 'transfer' && payInfo?.bukti_transfer
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
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
                              <span className="text-sm font-black uppercase tracking-wide text-gray-900">
                                Metode: {payInfo?.metode_pembayaran || 'Tunai'}
                              </span>
                              {isPaid ? (
                                <span className="text-xs font-bold px-3 py-1 bg-emerald-200 text-emerald-950 rounded-full">
                                  ✓ SUDAH LUNAS {payInfo?.metode_pembayaran === 'qris' ? '(QRIS OTOMATIS)' : '(DI-ACC OWNER)'}
                                </span>
                              ) : payInfo?.metode_pembayaran === 'transfer' && payInfo?.bukti_transfer ? (
                                <span className="text-xs font-bold px-3 py-1 bg-blue-200 text-blue-950 rounded-full">
                                  ✓ BUKTI TERKIRIM (MENUNGGU ACC OWNER)
                                </span>
                              ) : (
                                <span className="text-xs font-bold px-3 py-1 bg-amber-200 text-amber-950 rounded-full">
                                  BELUM LUNAS (MENUNGGU PEMBAYARAN)
                                </span>
                              )}
                            </div>

                            <span className="text-xs sm:text-sm mt-1.5 block leading-normal text-gray-700 font-medium">
                              {isPaid ? (
                                payInfo?.metode_pembayaran === 'qris'
                                  ? 'Pembayaran QRIS telah diverifikasi secara otomatis & dana telah masuk ke e-wallet owner.'
                                  : 'Pembayaran sah dan telah diverifikasi oleh kasir/owner pabrik.'
                              ) : payInfo?.metode_pembayaran === 'qris' ? (
                                'Silakan klik tombol "Buka & Scan QRIS" di samping untuk men-scan kode QR dan menyelesaikan pembayaran.'
                              ) : payInfo?.metode_pembayaran === 'transfer' ? (
                                payInfo?.bukti_transfer
                                  ? 'Foto bukti transfer Anda telah tersimpan dan sedang diperiksa oleh Owner.'
                                  : 'Silakan transfer ke nomor rekening pabrik (BCA/Mandiri/BRI) lalu unggah foto screenshot bukti transfer.'
                              ) : (
                                'Silakan selesaikan pembayaran tunai kepada Owner/Kasir saat mengambil pesanan di pabrik (COD).'
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Tombol Interaktif Spesifik Pembayaran */}
                        <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                          {/* 1. Tombol QRIS: Buka QRIS saat belum lunas */}
                          {!isPaid && payInfo?.metode_pembayaran === 'qris' && (
                            <button
                              type="button"
                              onClick={() => {
                                setQrisModalOrder(order);
                                setQrisReceiptData(null);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95"
                            >
                              <QrCode className="w-4 h-4 text-amber-300" />
                              <span>Buka & Scan QRIS</span>
                            </button>
                          )}

                          {/* 2. Tombol QRIS: Lihat Struk Resmi saat sudah lunas */}
                          {isPaid && payInfo?.metode_pembayaran === 'qris' && (
                            <button
                              type="button"
                              onClick={() => {
                                let meta: any = null;
                                try {
                                  meta = payInfo?.bukti_transfer ? JSON.parse(payInfo.bukti_transfer) : null;
                                } catch (e) {}
                                setQrisReceiptData({
                                  ref_id: meta?.ref_id || `QRIS-KD-${order.id_pesanan}`,
                                  orderId: order.id_pesanan,
                                  amount: order.total_harga,
                                  productName: order.produk?.nama_produk || 'Kerupuk Diansyah',
                                  qty: order.jumlah,
                                  satuan: order.produk?.satuan || 'Bal',
                                  varian: order.varian_rasa,
                                  kemasan: order.ukuran_plastik,
                                  customerName: pelanggan?.nama_lengkap || user?.nama || 'Pelanggan',
                                  paidAt: meta?.paid_at ? new Date(meta.paid_at).toLocaleString('id-ID') : order.tanggal_pesanan,
                                  destination: 'E-Wallet / Rekening Bapak Diansyah (Pabrik Kerupuk Diansah)',
                                  nmid: meta?.nmid || 'ID1025393458506',
                                });
                                setQrisModalOrder(order);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95"
                            >
                              <Receipt className="w-4 h-4" />
                              <span>Lihat Struk QRIS</span>
                            </button>
                          )}

                          {/* 3. Tombol Transfer: Upload Bukti Pembayaran */}
                          {payInfo?.metode_pembayaran === 'transfer' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setUploadTransferOrder(order);
                                  setTransferImage(null);
                                  setTransferCatatan('');
                                }}
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
                                  onClick={() => {
                                    setPreviewProof({
                                      image: payInfo.bukti_transfer!,
                                      orderId: order.id_pesanan,
                                      title: `Bukti Transfer Pesanan #${order.id_pesanan}`,
                                    });
                                  }}
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

                      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2">
                        {/* Batalkan Pesanan jika masih menunggu_diproses */}
                        {order.status_pesanan === 'menunggu_diproses' && !isPaid && (
                          <button
                            onClick={() => handleCancelOrder(order.id_pesanan)}
                            className="inline-flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 font-bold px-4 py-2.5 rounded-xl border border-red-200 transition shadow-sm"
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

                  {/* Keterangan Pembayaran Dinamis */}
                  {orderMetode === 'transfer' && (
                    <div className="mt-3 p-3 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs space-y-2 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                        <Building2 className="w-4 h-4 text-blue-700" />
                        <span>Rekening Resmi Pabrik Kerupuk Diansyah:</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-blue-100">
                          <div>
                            <span className="font-bold text-gray-900 text-[11px] block">Bank BCA (Transfer)</span>
                            <span className="font-mono font-black text-blue-900 text-xs">7405136830</span>
                            <span className="text-[10px] text-gray-400 block">a/n Anita Nurhayati</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyAccount('7405136830', 'BCA')}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center gap-1 transition"
                          >
                            {copiedAccount === 'BCA' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedAccount === 'BCA' ? 'Tersalin' : 'Salin'}</span>
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-blue-100">
                          <div>
                            <span className="font-bold text-gray-900 text-[11px] block">Bank Mandiri (Transfer)</span>
                            <span className="font-mono font-black text-blue-900 text-xs">1320023382287</span>
                            <span className="text-[10px] text-gray-400 block">a/n Diansiah Hidayat</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyAccount('1320023382287', 'Mandiri')}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center gap-1 transition"
                          >
                            {copiedAccount === 'Mandiri' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedAccount === 'Mandiri' ? 'Tersalin' : 'Salin'}</span>
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-blue-100">
                          <div>
                            <span className="font-bold text-gray-900 text-[11px] block">Bank BJB (Transfer)</span>
                            <span className="font-mono font-black text-blue-900 text-xs">0139544684100</span>
                            <span className="text-[10px] text-gray-400 block">a/n Diansiah Hidayat</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyAccount('0139544684100', 'BJB')}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center gap-1 transition"
                          >
                            {copiedAccount === 'BJB' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedAccount === 'BJB' ? 'Tersalin' : 'Salin'}</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-blue-700 leading-tight">
                        📸 <strong>Wajib Screenshot Bukti Pembayaran:</strong> Setelah transfer, Anda dapat mengunggah foto bukti transfer di tab <strong>Pesanan Saya</strong> untuk divalidasi oleh Owner.
                      </p>
                    </div>
                  )}

                  {orderMetode === 'qris' && (
                    <div className="mt-3 p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-1.5 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                        <QrCode className="w-4 h-4 text-amber-700" />
                        <span>Pembayaran Otomatis QRIS Nasional:</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Setelah pesanan dikirim, kode QR QRIS resmi perusahaan akan langsung muncul di layar untuk di-scan menggunakan <strong>BCA, Livin, BRImo, GoPay, OVO, Dana, ShopeePay</strong>. Dana otomatis masuk ke e-wallet owner & struk lunas otomatis terbit.
                      </p>
                    </div>
                  )}

                  {orderMetode === 'tunai' && (
                    <div className="mt-3 p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-1 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-gray-800 font-bold">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span>Pembayaran Tunai Fisik (COD):</span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        Selesaikan pembayaran tunai langsung kepada kasir / Owner saat serah terima kerupuk di pabrik.
                      </p>
                    </div>
                  )}
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

        {/* ========================================================================= */}
        {/* MODAL 3: SCAN QRIS & STRUK RESMI PEMBAYARAN QRIS */}
        {/* ========================================================================= */}
        {qrisModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative max-h-[92vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setQrisModalOrder(null);
                  setQrisReceiptData(null);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition print:hidden"
              >
                <X className="w-5 h-5" />
              </button>

              {/* TAMPILAN 1: KODE QRIS UNTUK DI-SCAN (JIKA BELUM BAYAR) */}
              {!qrisReceiptData ? (
                <div className="space-y-4">
                  {/* Banner QRIS Resmi Perusahaan */}
                  <div className="rounded-2xl overflow-hidden border border-red-200 shadow-md">
                    <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-3.5 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-white text-red-700 font-black text-xs px-2 py-0.5 rounded tracking-wider shadow-sm">
                          QRIS
                        </div>
                        <span className="text-[10px] font-bold tracking-tight uppercase">Standar Pembayaran Nasional</span>
                      </div>
                      <span className="text-[9px] font-mono bg-white/20 px-2 py-0.5 rounded font-bold">GPN / BI</span>
                    </div>

                    <div className="p-4 bg-gray-50/70 text-center">
                      <div className="mb-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 mb-1">
                          QRIS RESMI PERUSAHAAN
                        </span>
                        <h3 className="font-black text-gray-900 text-base uppercase tracking-tight">PABRIK KERUPUK DIANSAH</h3>
                        <p className="text-[10px] text-gray-600 font-mono font-bold mt-0.5">
                          NMID : ID1025393458506 &bull; A01
                        </p>
                      </div>

                      {/* Poster QRIS Resmi Asli Perusahaan */}
                      <div className="relative my-2.5 rounded-2xl overflow-hidden border-2 border-red-100 shadow-md bg-white group">
                        <img
                          src="/images/qris-pabrik-diansyah.jpg"
                          alt="QRIS Resmi Pabrik Kerupuk Diansah"
                          className="w-full max-h-[380px] object-contain mx-auto bg-white transition duration-300 group-hover:scale-[1.02]"
                        />
                        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                          <a
                            href="/images/qris-pabrik-diansyah.jpg"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-black/75 hover:bg-black text-white text-[10px] font-bold rounded-lg backdrop-blur-sm transition flex items-center gap-1 shadow-md"
                            title="Buka gambar penuh"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Buka Penuh</span>
                          </a>
                          <a
                            href="/images/qris-pabrik-diansyah.jpg"
                            download="QRIS-Pabrik-Kerupuk-Diansah.jpg"
                            className="px-2.5 py-1 bg-brand-maroon/90 hover:bg-brand-maroon text-white text-[10px] font-bold rounded-lg backdrop-blur-sm transition flex items-center gap-1 shadow-md"
                            title="Unduh QRIS untuk di-scan dari galeri HP"
                          >
                            <Download className="w-3 h-3" />
                            <span>Unduh QRIS</span>
                          </a>
                        </div>
                      </div>

                      {/* Box Nominal Pembayaran */}
                      <div className="bg-amber-100/80 border border-amber-300 rounded-2xl p-3 shadow-inner">
                        <span className="text-[11px] font-bold text-amber-900 block">TOTAL TAGIHAN PEMBAYARAN:</span>
                        <span className="text-2xl font-black text-brand-maroon font-mono">
                          Rp {Number(qrisModalOrder.total_harga).toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-amber-800 block mt-0.5">
                          Pesanan #{qrisModalOrder.id_pesanan} &bull; {qrisModalOrder.produk?.nama_produk} ({qrisModalOrder.jumlah} {qrisModalOrder.produk?.satuan || 'Bal'})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Keterangan E-Wallet yang Didukung */}
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-center">
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">
                      Mendukung Seluruh Aplikasi Pembayaran QRIS:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9px] font-bold text-gray-600">
                      <span className="px-2 py-0.5 bg-white rounded-md border border-gray-200">GoPay</span>
                      <span className="px-2 py-0.5 bg-white rounded-md border border-gray-200">OVO</span>
                      <span className="px-2 py-0.5 bg-white rounded-md border border-gray-200">DANA</span>
                      <span className="px-2 py-0.5 bg-white rounded-md border border-gray-200">ShopeePay</span>
                      <span className="px-2 py-0.5 bg-white rounded-md border border-gray-200">BCA Mobile</span>
                      <span className="px-2 py-0.5 bg-white rounded-md border border-gray-200">Livin Mandiri</span>
                      <span className="px-2 py-0.5 bg-white rounded-md border border-gray-200">BRImo</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">
                      Arahkan kamera aplikasi pembayaran Anda ke kode QRIS di atas untuk menyelesaikan transaksi.
                    </p>
                  </div>

                  {/* Tombol Simulasi Scan & Bayar QRIS */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled={isProcessingQris}
                      onClick={() => handlePayQris(qrisModalOrder)}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>{isProcessingQris ? 'Memverifikasi Pembayaran QRIS...' : '⚡ Selesaikan Pembayaran QRIS (Simulasi Scan)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrisModalOrder(null)}
                      className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition"
                    >
                      Tutup & Bayar Nanti
                    </button>
                  </div>
                </div>
              ) : (
                /* TAMPILAN 2: STRUK RESMI PEMBAYARAN QRIS BERHASIL (OTOMATIS MUNCUL) */
                <div className="space-y-4 animate-fadeIn">
                  <div className="text-center pb-3 border-b border-dashed border-gray-200">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 font-bold mx-auto flex items-center justify-center mb-2 shadow-inner">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block mb-1">
                      TRANSAKSI QRIS BERHASIL & DITERIMA OWNER
                    </span>
                    <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">STRUK PEMBAYARAN QRIS</h3>
                    <p className="text-[11px] text-gray-500">Pabrik Kerupuk Diansyah &bull; Sumedang</p>
                  </div>

                  {/* Rincian Transaksi Struk */}
                  <div className="space-y-2 text-xs py-2 border-b border-dashed border-gray-200 font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ref ID QRIS:</span>
                      <span className="font-bold text-gray-900">{qrisReceiptData.ref_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID Pesanan:</span>
                      <span className="font-bold text-gray-900">TRX-KD-{qrisReceiptData.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Waktu Bayar:</span>
                      <span className="text-gray-800 text-[11px]">{qrisReceiptData.paidAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nama Pembeli:</span>
                      <span className="font-bold text-gray-900">{qrisReceiptData.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tujuan Dana:</span>
                      <span className="text-emerald-700 font-bold text-[11px] text-right max-w-[180px]">{qrisReceiptData.destination}</span>
                    </div>
                  </div>

                  {/* Detail Produk */}
                  <div className="space-y-1.5 text-xs py-2 border-b border-dashed border-gray-200">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>{qrisReceiptData.productName} ({qrisReceiptData.varian})</span>
                      <span>{qrisReceiptData.qty} {qrisReceiptData.satuan}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-[11px]">
                      <span>Ukuran: {qrisReceiptData.kemasan}</span>
                      <span>Metode: QRIS Instan (Lunas)</span>
                    </div>
                    <div className="flex justify-between pt-2 text-sm font-black text-brand-maroon">
                      <span>TOTAL LUNAS:</span>
                      <span className="font-mono text-base text-emerald-700">
                        Rp {Number(qrisReceiptData.amount).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Keterangan Sistem */}
                  <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-center">
                    <p className="text-[11px] text-emerald-950 font-bold flex items-center justify-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Status Pembayaran Sah: LUNAS
                    </p>
                    <p className="text-[10px] text-emerald-800 mt-0.5 leading-tight">
                      Dana telah otomatis masuk ke rekening/e-wallet Owner. Anda dapat langsung menunjukkan struk ini saat mengambil kerupuk di pabrik.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1 print:hidden">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex-1 py-3 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Cetak Struk QRIS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQrisModalOrder(null);
                        setQrisReceiptData(null);
                      }}
                      className="py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 4: FORM UPLOAD BUKTI TRANSFER BANK OLEH PELANGGAN */}
        {/* ========================================================================= */}
        {uploadTransferOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative max-h-[92vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setUploadTransferOrder(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Unggah Bukti Transfer Bank</h3>
                  <p className="text-xs text-gray-400">Pesanan #{uploadTransferOrder.id_pesanan} &bull; Rp {Number(uploadTransferOrder.total_harga).toLocaleString('id-ID')}</p>
                </div>
              </div>

              <form onSubmit={handleSubmitTransferProof} className="space-y-4">
                {/* 1. Pilih Rekening Bank Tujuan Transfer */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Bank Tujuan yang Anda Transfer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={transferBank}
                    onChange={(e) => setTransferBank(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                  >
                    <option value="Bank BCA (139-082-9912 a/n Bapak Diansyah)">Bank BCA &bull; 139-082-9912 (Bapak Diansyah)</option>
                    <option value="Bank Mandiri (182-000-482-991 a/n Pabrik Kerupuk Diansyah)">Bank Mandiri &bull; 182-000-482-991 (Pabrik Kerupuk Diansyah)</option>
                    <option value="Bank BJB (0139-544-684-100 a/n Diansyah)">Bank BJB &bull; 0139-544-684-100 (Diansyah)</option>
                  </select>
                </div>

                {/* 2. Upload File Screenshot Bukti Transfer */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    File Screenshot Bukti Transfer <span className="text-red-500">*</span>
                  </label>

                  {!transferImage ? (
                    <label className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-gray-50/60 hover:bg-blue-50/30 transition">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-gray-700">Pilih Screenshot Bukti Transfer</span>
                      <span className="text-[11px] text-gray-400 text-center">Format file: JPG, PNG, atau JPEG dari m-Banking / ATM</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                        required
                      />
                    </label>
                  ) : (
                    <div className="rounded-2xl border border-gray-200 p-3 bg-gray-50 space-y-2">
                      <div className="relative rounded-xl overflow-hidden max-h-56 bg-black/5 flex items-center justify-center">
                        <img
                          src={transferImage}
                          alt="Pratinjau Bukti Transfer"
                          className="max-h-52 object-contain rounded-lg"
                        />
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Foto Screenshot Siap Dikirim
                        </span>
                        <label className="text-xs text-blue-600 hover:text-blue-700 font-bold cursor-pointer underline">
                          Ganti Foto
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Catatan Transfer (Opsional) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Catatan / Nama Pemilik Rekening Pengirim (Opsional)
                  </label>
                  <input
                    type="text"
                    value={transferCatatan}
                    onChange={(e) => setTransferCatatan(e.target.value)}
                    placeholder="Contoh: Transfer dari Rekening a/n Hanifa"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setUploadTransferOrder(null)}
                    className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingTransfer || !transferImage}
                    className="py-3 px-4 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold rounded-2xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingTransfer ? 'Mengirim...' : 'Kirim Bukti'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 5: PRATINJAU BUKTI TRANSFER UNTUK PELANGGAN */}
        {/* ========================================================================= */}
        {previewProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
              <button
                type="button"
                onClick={() => setPreviewProof(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-base">{previewProof.title}</h3>
              </div>

              <div className="rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center max-h-[70vh] border border-gray-200 p-2">
                <img
                  src={previewProof.image}
                  alt="Bukti Transfer"
                  className="max-h-[65vh] object-contain rounded-xl"
                />
              </div>

              <div className="mt-4 pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewProof(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
