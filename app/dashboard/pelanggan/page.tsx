'use client';

import React, { useState, useEffect, useRef } from 'react';
import RoleGuard from '@/components/auth/role-guard';
import { useAuth } from '@/context/auth-context';
import StateAlert, { StateType } from '@/components/ui/state-alert';
import { validateForm } from '@/lib/validation';
import { getHargaBumbu, getHargaPlastik } from '@/lib/pricing';
import {
  ShoppingBag,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  RefreshCw,
  ShoppingCart,
} from 'lucide-react';
import { Produk, CartItem, Pesanan } from './types';
import PelangganCartDrawer from './components/pelanggan-cart-drawer';
import { AddToCartModal, DirectOrderModal } from './components/pelanggan-order-modals';
import PelangganCatalogGrid from './components/pelanggan-catalog-grid';
import PelangganHistoryList from './components/pelanggan-history-list';
import {
  QrisModal,
  UploadTransferProofModal,
  ProofPreviewModal,
} from './components/pelanggan-proof-modals';
import PelangganReceiptModal from './components/pelanggan-receipt-modal';

export default function PelangganDashboardPage() {
  const { user, pelanggan } = useAuth();

  // State data
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [pesananList, setPesananList] = useState<Pesanan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'katalog' | 'pesanan_saya'>('katalog');

  // State Modal Order Langsung
  const [selectedProduct, setSelectedProduct] = useState<Produk | null>(null);
  const [orderQty, setOrderQty] = useState<number>(1);
  const [orderVarian, setOrderVarian] = useState<string>('Original Gurih');
  const [orderPlastik, setOrderPlastik] = useState<string>('1/2 kg');
  const [orderMetode, setOrderMetode] = useState<string>('tunai');

  // State Keranjang Belanja
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [cartMetode, setCartMetode] = useState<string>('tunai');
  const [isSubmittingCart, setIsSubmittingCart] = useState<boolean>(false);

  // State Modal Tambah ke Keranjang
  const [addToCartProduct, setAddToCartProduct] = useState<Produk | null>(null);
  const [cartQty, setCartQty] = useState<number>(1);
  const [cartVarian, setCartVarian] = useState<string>('Original Gurih');
  const [cartPlastik, setCartPlastik] = useState<string>('1/2 kg');

  // Modal Resi / Bukti Bayar
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<Pesanan | null>(null);

  // Modal QRIS & Struk
  const [qrisModalOrder, setQrisModalOrder] = useState<Pesanan | null>(null);
  const [isProcessingQris, setIsProcessingQris] = useState(false);
  const [qrisReceiptData, setQrisReceiptData] = useState<any | null>(null);

  // Modal Upload Bukti Transfer Bank
  const [uploadTransferOrder, setUploadTransferOrder] = useState<Pesanan | null>(null);
  const [transferImage, setTransferImage] = useState<string | null>(null);
  const [transferBank, setTransferBank] = useState<string>('Bank BCA (7405136830 a/n Anita Nurhayati)');
  const [transferCatatan, setTransferCatatan] = useState<string>('');
  const [isUploadingTransfer, setIsUploadingTransfer] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Modal Pratinjau Gambar Bukti Transfer
  const [previewProof, setPreviewProof] = useState<{ image: string; orderId: number; title: string } | null>(null);

  // 3 Kondisi Sistem (State)
  const [actionState, setActionState] = useState<{ type: StateType; message: string | null }>({
    type: 'idle',
    message: null,
  });

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const isFetchingRef = useRef(false);

  // Fetch data dari Supabase secara PARALEL
  const fetchData = async (silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!silent) setIsLoadingData(true);

    try {
      const orderUrl = pelanggan?.id_pelanggan
        ? `/api/pesanan?id_pelanggan=${pelanggan.id_pelanggan}`
        : null;

      const [resProd, resOrder] = await Promise.all([
        fetch('/api/produk'),
        orderUrl ? fetch(orderUrl) : Promise.resolve(null),
      ]);

      const [dataProd, dataOrder] = await Promise.all([
        resProd.json(),
        resOrder ? resOrder.json() : Promise.resolve({ data: [] }),
      ]);

      if (resProd.ok) {
        setProdukList(dataProd.data || []);
      }

      if (resOrder && resOrder.ok) {
        setPesananList(dataOrder.data || []);
      }
    } catch (err: any) {
      if (!silent) console.error('Fetch error:', err);
    } finally {
      isFetchingRef.current = false;
      if (!silent) setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-update non-overlapping interval
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchData(true);
    }, 8000);

    const handleVisibility = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchData(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [pelanggan]);

  // Load keranjang belanja dari localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ekrupsy_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem('ekrupsy_cart', JSON.stringify(newCart));
    } catch {
      // ignore
    }
  };

  // 1. Buka Modal Tambah ke Keranjang
  const handleOpenAddToCartModal = (item: Produk) => {
    setAddToCartProduct(item);
    setCartQty(1);
    setCartVarian('Original Gurih');
    setCartPlastik('1/2 kg');
    setActionState({ type: 'idle', message: null });
  };

  // 2. Konfirmasi Masukkan Item ke Keranjang Belanja
  const handleConfirmAddToCart = () => {
    if (!addToCartProduct) return;
    if (cartQty < 1) {
      setActionState({ type: 'error', message: 'Jumlah pemesanan minimal 1 Bal.' });
      return;
    }
    if (cartQty > addToCartProduct.stok) {
      setActionState({
        type: 'error',
        message: `Jumlah melebihi stok yang tersedia (${addToCartProduct.stok} Bal).`,
      });
      return;
    }

    const cartId = `${addToCartProduct.id_produk}_${cartVarian}_${cartPlastik}`;
    const hargaSatuanKerupuk = Number(addToCartProduct.harga) || 0;
    const hargaBumbu = getHargaBumbu(cartVarian);
    const hargaPlastik = getHargaPlastik(cartPlastik);
    const hargaPerBal = hargaSatuanKerupuk + hargaBumbu + hargaPlastik;

    const existingIndex = cart.findIndex((it) => it.cart_id === cartId);
    let updatedCart: CartItem[];

    if (existingIndex >= 0) {
      const newQty = cart[existingIndex].jumlah + cartQty;
      if (newQty > addToCartProduct.stok) {
        setActionState({
          type: 'error',
          message: `Total varian ini di keranjang (${newQty} Bal) melebihi stok pabrik (${addToCartProduct.stok} Bal).`,
        });
        return;
      }
      updatedCart = [...cart];
      updatedCart[existingIndex].jumlah = newQty;
      updatedCart[existingIndex].total_harga = newQty * hargaPerBal;
    } else {
      const newItem: CartItem = {
        cart_id: cartId,
        produk: addToCartProduct,
        jumlah: cartQty,
        varian_rasa: cartVarian,
        ukuran_plastik: cartPlastik,
        harga_per_bal: hargaPerBal,
        total_harga: cartQty * hargaPerBal,
      };
      updatedCart = [...cart, newItem];
    }

    saveCart(updatedCart);
    const addedProdName = addToCartProduct.nama_produk;
    setAddToCartProduct(null);
    setActionState({
      type: 'success',
      message: `"${addedProdName}" (${cartVarian}, ${cartPlastik} - ${cartQty} Bal) berhasil ditambahkan ke keranjang belanja!`,
    });
  };

  // 3. Update Qty di Dalam Keranjang Belanja
  const handleUpdateCartQty = (cartId: string, delta: number) => {
    const updated = cart
      .map((it) => {
        if (it.cart_id === cartId) {
          const newQty = it.jumlah + delta;
          if (newQty <= 0) return null;
          if (newQty > it.produk.stok) {
            setActionState({
              type: 'error',
              message: `Stok ${it.produk.nama_produk} hanya tersedia ${it.produk.stok} Bal.`,
            });
            return it;
          }
          return {
            ...it,
            jumlah: newQty,
            total_harga: newQty * it.harga_per_bal,
          };
        }
        return it;
      })
      .filter(Boolean) as CartItem[];

    saveCart(updated);
  };

  // 4. Hapus 1 Item dari Keranjang
  const handleRemoveFromCart = (cartId: string) => {
    const updated = cart.filter((it) => it.cart_id !== cartId);
    saveCart(updated);
  };

  // 5. Kosongkan Keranjang Belanja
  const handleClearCart = () => {
    if (confirm('Kosongkan semua produk dalam keranjang belanja Anda?')) {
      saveCart([]);
    }
  };

  // 6. Checkout Seluruh Item di Keranjang Belanja
  const handleCheckoutCart = async () => {
    if (!pelanggan?.id_pelanggan) {
      setActionState({ type: 'error', message: 'Sesi pelanggan tidak ditemukan. Silakan login ulang.' });
      return;
    }
    if (cart.length === 0) {
      setActionState({ type: 'error', message: 'Keranjang belanja Anda masih kosong.' });
      return;
    }

    setIsSubmittingCart(true);
    setActionState({ type: 'loading', message: 'Memproses pemesanan seluruh item dari keranjang...' });

    try {
      const payload = {
        id_pelanggan: pelanggan.id_pelanggan,
        metode_pembayaran: cartMetode,
        items: cart.map((it) => ({
          id_produk: it.produk.id_produk,
          jumlah: it.jumlah,
          varian_rasa: it.varian_rasa,
          ukuran_plastik: it.ukuran_plastik,
        })),
      };

      const res = await fetch('/api/pesanan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) {
        setActionState({ type: 'error', message: resData.message || 'Gagal memproses pesanan keranjang.' });
        setIsSubmittingCart(false);
        return;
      }

      const totalItemsCount = cart.length;
      const totalBayar = resData.totalAmount || cart.reduce((sum, it) => sum + it.total_harga, 0);

      saveCart([]);
      setIsCartOpen(false);

      setActionState({
        type: 'success',
        message: `Berhasil memesan ${totalItemsCount} varian kerupuk dari keranjang! Semua pesanan masuk antrean pabrik.`,
      });

      await fetchData();

      if (cartMetode === 'qris' && Array.isArray(resData.data) && resData.data.length > 0) {
        const combinedQrisOrder: Pesanan = {
          ...resData.data[0],
          total_harga: totalBayar,
          pembayaran: [
            {
              id_pembayaran: 0,
              metode_pembayaran: 'qris',
              status_pembayaran: 'pending',
              jumlah_bayar: totalBayar,
            },
          ],
        };
        setQrisModalOrder(combinedQrisOrder);
        setQrisReceiptData(null);
      }

      setActiveTab('pesanan_saya');
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat memproses pesanan keranjang.' });
    } finally {
      setIsSubmittingCart(false);
    }
  };

  // Direct Order Modal Opener
  const handleOpenOrderModal = (item: Produk) => {
    setSelectedProduct(item);
    setOrderQty(1);
    setOrderVarian('Original Gurih');
    setOrderPlastik('1/2 kg');
    setOrderMetode('tunai');
    setValidationErrors({});
    setActionState({ type: 'idle', message: null });
  };

  // Direct Order Submit
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !pelanggan?.id_pelanggan) return;

    const validation = validateForm([
      { field: 'jumlah', label: 'Jumlah Pesanan', value: orderQty, required: true, dataType: 'integer', domain: { min: 1, max: selectedProduct.stok } },
      { field: 'varian_rasa', label: 'Varian Rasa', value: orderVarian, required: true, domain: { allowedValues: ['Original', 'Original Gurih', 'Balado', 'Balado Manis Pedas', 'Pedas', 'Pedas Level 5', 'Keju', 'Keju Asin Gurih'] } },
      { field: 'ukuran_plastik', label: 'Ukuran Kemasan Plastik', value: orderPlastik, required: true },
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
            },
          ],
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
    } catch {
      setActionState({ type: 'error', message: 'Terjadi kegagalan jaringan saat menyimpan pesanan.' });
    }
  };

  // Salin Nomor Rekening Bank
  const handleCopyAccount = (number: string, label: string) => {
    navigator.clipboard.writeText(number);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  // Baca & Kompres Gambar Screenshot Bukti Transfer
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

  // Simulasi Scan & Bayar QRIS Instan
  const handlePayQris = async (order: Pesanan) => {
    setIsProcessingQris(true);
    setActionState({ type: 'loading', message: 'Memproses verifikasi QRIS & transfer ke Rekening Owner...' });

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
        paidAt:
          new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
          ' WIB, ' +
          new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        destination: 'E-Wallet / Rekening Bapak Diansyah (Pabrik Kerupuk Diansah)',
        nmid: 'ID1025393458506',
      });

      setActionState({
        type: 'success',
        message: 'Pembayaran QRIS Berhasil! Dana otomatis masuk ke Rekening Owner.',
      });

      await fetchData();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat verifikasi QRIS.' });
    } finally {
      setIsProcessingQris(false);
    }
  };

  // Batalkan Pesanan (UC-06)
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

  return (
    <RoleGuard allowedRoles={['pelanggan']} pageTitle="Dashboard Pelanggan">
      <div className={`space-y-6 ${qrisReceiptData ? 'print:hidden' : ''}`}>
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
            onClick={() => fetchData()}
            disabled={isLoadingData}
            className="inline-flex items-center gap-1.5 text-xs text-brand-maroon font-bold bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl border border-brand-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
            Perbarui Data
          </button>
        </div>

        {/* Tabs: Katalog vs Pesanan Saya + Tombol Keranjang Belanja */}
        <div className="flex flex-wrap items-center justify-between border-b border-gray-200 gap-2">
          <div className="flex">
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

          {/* Tombol Akses Cepat Keranjang Belanja */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="mb-2 px-4 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-brand-darkmaroon border border-amber-300 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition active:scale-95"
            title="Buka Keranjang Belanja"
          >
            <ShoppingCart className="w-4 h-4 text-brand-maroon" />
            <span className="hidden sm:inline">Keranjang Belanja</span>
            <span className="sm:hidden">Keranjang</span>
            <span className="bg-brand-maroon text-white text-[11px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {cart.length}
            </span>
          </button>
        </div>

        {/* TAB 1: KATALOG PRODUK */}
        {activeTab === 'katalog' && (
          <PelangganCatalogGrid
            products={produkList}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAddToCart={handleOpenAddToCartModal}
            onDirectOrder={handleOpenOrderModal}
          />
        )}

        {/* TAB 2: PESANAN SAYA */}
        {activeTab === 'pesanan_saya' && (
          <PelangganHistoryList
            orders={pesananList}
            onOpenQris={(order) => {
              setQrisModalOrder(order);
              setQrisReceiptData(null);
            }}
            onOpenQrisReceipt={(order) => {
              let meta: any = null;
              try {
                meta = order.pembayaran?.[0]?.bukti_transfer
                  ? JSON.parse(order.pembayaran[0].bukti_transfer)
                  : null;
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
            onOpenUploadTransfer={(order) => {
              setUploadTransferOrder(order);
              setTransferImage(null);
              setTransferCatatan('');
            }}
            onPreviewProof={(image, orderId) => {
              setPreviewProof({
                image,
                orderId,
                title: `Bukti Transfer Pesanan #${orderId}`,
              });
            }}
            onCancelOrder={handleCancelOrder}
            onShowReceipt={(order) => setSelectedOrderReceipt(order)}
            onSwitchToCatalog={() => setActiveTab('katalog')}
          />
        )}

        {/* FLOATING ACTION BUTTON KERANJANG */}
        {cart.length > 0 && (
          <aside aria-label="Keranjang Belanja Mengambang" className="fixed bottom-6 right-6 z-40 animate-fadeIn">
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-3 bg-brand-maroon hover:bg-brand-darkmaroon text-white px-5 py-3.5 rounded-full shadow-2xl border-2 border-amber-400 font-bold text-sm transition-all transform hover:scale-105 active:scale-95"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-amber-300" />
                <span className="absolute -top-2 -right-2 bg-amber-400 text-brand-darkmaroon text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              </div>
              <span>
                Keranjang ({cart.length} Varian &bull; Rp{' '}
                {cart.reduce((sum, it) => sum + it.total_harga, 0).toLocaleString('id-ID')})
              </span>
            </button>
          </aside>
        )}

        {/* MODAL TAMBAH KE KERANJANG */}
        <AddToCartModal
          product={addToCartProduct}
          qty={cartQty}
          setQty={setCartQty}
          varian={cartVarian}
          setVarian={setCartVarian}
          plastik={cartPlastik}
          setPlastik={setCartPlastik}
          onClose={() => setAddToCartProduct(null)}
          onConfirm={handleConfirmAddToCart}
        />

        {/* DRAWER KERANJANG BELANJA */}
        <PelangganCartDrawer
          isOpen={isCartOpen}
          cart={cart}
          cartMetode={cartMetode}
          setCartMetode={setCartMetode}
          isSubmittingCart={isSubmittingCart}
          onClose={() => setIsCartOpen(false)}
          onClearCart={handleClearCart}
          onRemoveItem={handleRemoveFromCart}
          onUpdateQty={handleUpdateCartQty}
          onCheckout={handleCheckoutCart}
        />

        {/* MODAL PESAN LANGSUNG */}
        <DirectOrderModal
          product={selectedProduct}
          qty={orderQty}
          setQty={setOrderQty}
          varian={orderVarian}
          setVarian={setOrderVarian}
          plastik={orderPlastik}
          setPlastik={setOrderPlastik}
          metode={orderMetode}
          setMetode={setOrderMetode}
          actionState={actionState}
          setActionState={setActionState}
          validationErrors={validationErrors}
          copiedAccount={copiedAccount}
          onCopyAccount={handleCopyAccount}
          onClose={() => setSelectedProduct(null)}
          onSubmit={handleOrderSubmit}
        />

        {/* MODAL TANDA LUNAS */}
        <PelangganReceiptModal
          order={selectedOrderReceipt}
          customerName={pelanggan?.nama_lengkap || user?.nama}
          customerPhone={pelanggan?.no_telp}
          onClose={() => setSelectedOrderReceipt(null)}
        />

        {/* MODAL QRIS */}
        <QrisModal
          order={qrisModalOrder}
          qrisReceiptData={qrisReceiptData}
          isProcessingQris={isProcessingQris}
          onPayQris={handlePayQris}
          onClose={() => {
            setQrisModalOrder(null);
            setQrisReceiptData(null);
          }}
        />

        {/* MODAL UPLOAD TRANSFER */}
        <UploadTransferProofModal
          order={uploadTransferOrder}
          transferBank={transferBank}
          setTransferBank={setTransferBank}
          transferCatatan={transferCatatan}
          setTransferCatatan={setTransferCatatan}
          transferImage={transferImage}
          isUploadingTransfer={isUploadingTransfer}
          copiedAccount={copiedAccount}
          onCopyAccount={handleCopyAccount}
          onImageChange={handleImageFileChange}
          onSubmit={handleSubmitTransferProof}
          onClose={() => setUploadTransferOrder(null)}
        />

        {/* MODAL PREVIEW PROOF */}
        <ProofPreviewModal preview={previewProof} onClose={() => setPreviewProof(null)} />
      </div>
    </RoleGuard>
  );
}
