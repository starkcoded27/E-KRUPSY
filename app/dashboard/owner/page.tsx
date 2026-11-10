'use client';

import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/auth/role-guard';
import { useAuth } from '@/context/auth-context';
import StateAlert, { StateType } from '@/components/ui/state-alert';
import { validateForm } from '@/lib/validation';
import {
  BarChart3,
  Printer,
  PlusCircle,
  RefreshCw,
  CreditCard,
  Users,
  Package,
  XCircle,
} from 'lucide-react';

import {
  LaporanData,
  OrderItem,
  PelangganItem,
  ProdukCatalogItem,
  StokBahanItem,
} from './types';

import OwnerStatsCards from './components/owner-stats-cards';
import OwnerFinancialSummary from './components/owner-financial-summary';
import OwnerOrderTable from './components/owner-order-table';
import OwnerCustomerTable from './components/owner-customer-table';
import OwnerCatalogTable from './components/owner-catalog-table';
import OwnerCancellationDashboard from './components/owner-cancellation-dashboard';
import { OwnerAddProductModal, OwnerEditProductModal } from './components/owner-product-modals';
import OwnerRestockModal from './components/owner-restock-modal';
import {
  OwnerAddStockModal,
  OwnerEditStockModal,
  OwnerRestockMaterialModal,
} from './components/owner-stock-modals';
import { OwnerTransferProofModal, OwnerQrisProofModal } from './components/owner-proof-modals';
import OwnerReceiptModal from './components/owner-receipt-modal';
import { OwnerFinancialModal } from './components/owner-financial-modal';

export default function OwnerDashboardPage() {
  const { user } = useAuth();

  const [laporan, setLaporan] = useState<LaporanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewSection, setViewSection] = useState<'transaksi' | 'pelanggan' | 'katalog' | 'pembatalan'>('transaksi');
  const [chartPeriod, setChartPeriod] = useState<'harian' | 'mingguan' | 'bulanan' | 'tahunan'>('harian');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [orderFilter, setOrderFilter] = useState<'semua' | 'aktif' | 'selesai' | 'dibatalkan'>('semua');

  // State Alert
  const [actionState, setActionState] = useState<{ type: StateType; message: string | null }>({
    type: 'idle',
    message: null,
  });

  // Modals state
  const [selectedOrderToPrint, setSelectedOrderToPrint] = useState<OrderItem | null>(null);
  const [selectedTransferProof, setSelectedTransferProof] = useState<OrderItem | null>(null);
  const [selectedQrisProof, setSelectedQrisProof] = useState<OrderItem | null>(null);
  const [showFinancialReportModal, setShowFinancialReportModal] = useState(false);

  // Form Tambah Produk Baru
  const [showProductModal, setShowProductModal] = useState(false);
  const [namaProduk, setNamaProduk] = useState('');
  const [satuanProduk, setSatuanProduk] = useState('Bal');
  const [hargaProduk, setHargaProduk] = useState<number>(160000);
  const [stokProduk, setStokProduk] = useState<number>(25);
  const [deskripsiProduk, setDeskripsiProduk] = useState('');
  const [gambarProduk, setGambarProduk] = useState('');
  const [productErrors, setProductErrors] = useState<Record<string, string>>({});

  // Form Edit Produk
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedProductToEdit, setSelectedProductToEdit] = useState<ProdukCatalogItem | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editSatuan, setEditSatuan] = useState('Bal');
  const [editHarga, setEditHarga] = useState<number>(160000);
  const [editDeskripsi, setEditDeskripsi] = useState('');
  const [editGambar, setEditGambar] = useState('');

  // Form Restock Produk
  const [selectedProductToRestock, setSelectedProductToRestock] = useState<ProdukCatalogItem | null>(null);
  const [restockBalQty, setRestockBalQty] = useState<number>(10);

  // Form Tambah Stok Bahan / Plastik (Khusus Owner)
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [stockNama, setStockNama] = useState('');
  const [stockKategori, setStockKategori] = useState('Plastik');
  const [stockSatuan, setStockSatuan] = useState('Pack');
  const [stockJumlah, setStockJumlah] = useState<number>(25);

  // Form Edit Stok Bahan
  const [showEditStockModal, setShowEditStockModal] = useState(false);
  const [selectedStockToEdit, setSelectedStockToEdit] = useState<StokBahanItem | null>(null);
  const [editStockNama, setEditStockNama] = useState('');
  const [editStockKategori, setEditStockKategori] = useState('Plastik');
  const [editStockSatuan, setEditStockSatuan] = useState('Pack');
  const [editStockJumlah, setEditStockJumlah] = useState<number>(0);

  // Form Restock Pasokan Bahan
  const [showRestockStockModal, setShowRestockStockModal] = useState(false);
  const [selectedStockToRestock, setSelectedStockToRestock] = useState<StokBahanItem | null>(null);
  const [stockRestockQty, setStockRestockQty] = useState<number>(20);

  // Periode Cetak Laporan
  const [printPeriod, setPrintPeriod] = useState<'harian' | 'bulanan' | 'tahunan'>('harian');
  const [printDate, setPrintDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [printMonth, setPrintMonth] = useState(() => new Date().getMonth() + 1);
  const [printYear, setPrintYear] = useState(() => new Date().getFullYear());

  const isFetchingRef = React.useRef(false);

  const fetchLaporan = async (silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch('/api/laporan', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) {
        setLaporan(data.data);
      }
    } catch (err: any) {
      if (!silent) console.error('Laporan fetch error:', err);
    } finally {
      isFetchingRef.current = false;
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchLaporan(true);
    }, 8000);

    const handleVisibility = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchLaporan(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Upload Foto Tambah Produk
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const maxDim = 800;
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setGambarProduk(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Upload Foto Edit Produk
  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const maxDim = 800;
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setEditGambar(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Konfirmasi Pembayaran Tunai
  const handleConfirmPayment = async (orderId: number) => {
    setActionState({ type: 'loading', message: 'Mengonfirmasi pelunasan pembayaran ke Supabase...' });

    try {
      const res = await fetch(`/api/pesanan/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm_payment' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionState({ type: 'error', message: data.message || 'Gagal mengonfirmasi pembayaran.' });
        return;
      }

      setActionState({
        type: 'success',
        message: `Pembayaran pesanan #${orderId} telah berhasil di-ACC LUNAS oleh Owner!`,
      });

      await fetchLaporan();
    } catch {
      setActionState({ type: 'error', message: 'Gagal menghubungi server.' });
    }
  };

  // Tambah Produk Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm([
      { field: 'nama_produk', label: 'Nama Produk Kerupuk', value: namaProduk, required: true, dataType: 'string' },
      { field: 'satuan', label: 'Satuan', value: satuanProduk, required: true, domain: { allowedValues: ['Bal', 'Kg', 'Pack', 'Bungkus'] } },
      { field: 'harga', label: 'Harga Jual', value: hargaProduk, required: true, dataType: 'number', domain: { min: 1000 } },
      { field: 'stok', label: 'Stok Awal', value: stokProduk, required: true, dataType: 'integer', domain: { min: 0 } },
    ]);

    if (!validation.isValid) {
      setProductErrors(validation.errors);
      setActionState({ type: 'error', message: validation.firstError });
      return;
    }

    const cleanName = namaProduk.trim();
    const isDuplicate = (laporan?.produkList || []).some(
      (p) => p.nama_produk && p.nama_produk.trim().toLowerCase() === cleanName.toLowerCase()
    );

    if (isDuplicate) {
      const errMsg = `Produk "${cleanName}" sudah ada di dalam katalog pabrik. Tidak dapat menambahkan produk yang sama!`;
      setProductErrors({ nama_produk: errMsg });
      setActionState({ type: 'error', message: errMsg });
      return;
    }

    setProductErrors({});
    setActionState({ type: 'loading', message: 'Menyimpan produk ke database Supabase...' });

    try {
      const res = await fetch('/api/produk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_produk: cleanName,
          satuan: satuanProduk,
          harga: Number(hargaProduk),
          stok: Number(stokProduk),
          deskripsi: deskripsiProduk,
          gambar_url: gambarProduk || null,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        if (resData.field === 'nama_produk' || resData.errors?.nama_produk) {
          setProductErrors({
            nama_produk: resData.errors?.nama_produk || resData.message,
          });
        }
        setActionState({ type: 'error', message: resData.message || 'Gagal menyimpan produk.' });
        return;
      }

      setActionState({
        type: 'success',
        message: `Produk "${cleanName}" berhasil ditambahkan ke katalog pabrik!`,
      });

      setShowProductModal(false);
      setNamaProduk('');
      setDeskripsiProduk('');
      setGambarProduk('');
      setViewSection('katalog');
      await fetchLaporan();
      setTimeout(() => {
        document.getElementById('section-manajemen-data')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat menyimpan produk.' });
    }
  };

  // Edit Produk Submit
  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductToEdit) return;

    setActionState({ type: 'loading', message: 'Memperbarui data dan foto produk ke database...' });

    try {
      const res = await fetch('/api/produk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit',
          id_produk: selectedProductToEdit.id_produk,
          nama_produk: editNama.trim(),
          satuan: editSatuan,
          harga: Number(editHarga),
          deskripsi: editDeskripsi,
          gambar_url: editGambar || null,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setActionState({ type: 'error', message: resData.message || 'Gagal memperbarui produk.' });
        return;
      }

      setActionState({
        type: 'success',
        message: `Produk "${editNama}" berhasil diperbarui!`,
      });

      setShowEditProductModal(false);
      setSelectedProductToEdit(null);
      await fetchLaporan();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat memperbarui produk.' });
    }
  };

  // Hapus Produk
  const handleDeleteProduct = async (prod: ProdukCatalogItem) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${prod.nama_produk}" dari katalog pabrik?`)) {
      return;
    }

    setActionState({ type: 'loading', message: `Menghapus produk "${prod.nama_produk}"...` });

    try {
      const res = await fetch(`/api/produk?id=${prod.id_produk}`, {
        method: 'DELETE',
      });

      const resData = await res.json();

      if (!res.ok) {
        setActionState({ type: 'error', message: resData.message || 'Gagal menghapus produk.' });
        return;
      }

      setActionState({
        type: 'success',
        message: `Produk "${prod.nama_produk}" berhasil dihapus dari katalog.`,
      });

      await fetchLaporan();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat menghapus produk.' });
    }
  };

  // Restock Produk
  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductToRestock) return;

    if (restockBalQty <= 0) {
      setActionState({ type: 'error', message: 'Jumlah tambahan stok minimal 1 Bal.' });
      return;
    }

    setActionState({ type: 'loading', message: `Menambahkan pasokan +${restockBalQty} Bal ke katalog & dapur wajan...` });

    try {
      const res = await fetch('/api/produk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_produk: selectedProductToRestock.id_produk,
          additional_stok: Number(restockBalQty),
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setActionState({ type: 'error', message: resData.message || 'Gagal menambahkan restock produk.' });
        return;
      }

      setActionState({
        type: 'success',
        message: resData.message,
      });

      setSelectedProductToRestock(null);
      await fetchLaporan();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat memperbarui stok produk.' });
    }
  };

  // Helpers modal opener
  const handleOpenEditProduct = (prod: ProdukCatalogItem) => {
    setSelectedProductToEdit(prod);
    setEditNama(prod.nama_produk);
    setEditSatuan(prod.satuan);
    setEditHarga(prod.harga);
    setEditDeskripsi(prod.deskripsi || '');
    setEditGambar(prod.gambar_url || '');
    setShowEditProductModal(true);
  };

  const handleOpenRestock = (prod: ProdukCatalogItem) => {
    setSelectedProductToRestock(prod);
    setRestockBalQty(10);
  };

  const handleOpenAddProduct = () => {
    setShowProductModal(true);
    setActionState({ type: 'idle', message: null });
  };

  // ==========================================
  // HANDLER CRUD STOK BAHAN BAKU (KHUSUS OWNER)
  // ==========================================

  // Tambah Stok Bahan Baru
  const handleAddStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockNama.trim() || stockJumlah <= 0) return;

    setActionState({ type: 'loading', message: `Menyimpan "${stockNama}" ke database stok...` });

    try {
      const res = await fetch('/api/stok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_bahan: stockNama.trim(),
          kategori: stockKategori,
          satuan: stockSatuan,
          jumlah: Number(stockJumlah),
          id_user: user?.id_user,
          role: 'owner',
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setActionState({ type: 'error', message: resData.message || 'Gagal menambah stok bahan.' });
        return;
      }

      setActionState({ type: 'success', message: resData.message || 'Stok berhasil ditambahkan!' });
      setShowAddStockModal(false);
      setStockNama('');
      setStockJumlah(25);
      await fetchLaporan();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat menambah stok bahan.' });
    }
  };

  // Edit Stok Bahan
  const handleEditStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockToEdit || !editStockNama.trim() || editStockJumlah < 0) return;

    setActionState({ type: 'loading', message: `Memperbarui data "${editStockNama}"...` });

    try {
      const res = await fetch('/api/stok', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_stok: selectedStockToEdit.id_stok,
          nama_bahan: editStockNama.trim(),
          kategori: editStockKategori,
          satuan: editStockSatuan,
          jumlah: Number(editStockJumlah),
          role: 'owner',
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setActionState({ type: 'error', message: resData.message || 'Gagal mengedit stok.' });
        return;
      }

      setActionState({ type: 'success', message: resData.message || 'Stok berhasil diperbarui!' });
      setShowEditStockModal(false);
      setSelectedStockToEdit(null);
      await fetchLaporan();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat mengedit stok.' });
    }
  };

  // Restock Pasokan Bahan
  const handleRestockStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockToRestock || stockRestockQty <= 0) return;

    setActionState({
      type: 'loading',
      message: `Menambahkan pasokan +${stockRestockQty} ${selectedStockToRestock.satuan}...`,
    });

    try {
      const res = await fetch('/api/stok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_bahan: selectedStockToRestock.nama_bahan,
          kategori: selectedStockToRestock.kategori,
          satuan: selectedStockToRestock.satuan,
          jumlah: Number(stockRestockQty),
          id_user: user?.id_user,
          role: 'owner',
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setActionState({ type: 'error', message: resData.message || 'Gagal menambahkan restock bahan.' });
        return;
      }

      setActionState({ type: 'success', message: resData.message || 'Restock bahan berhasil!' });
      setShowRestockStockModal(false);
      setSelectedStockToRestock(null);
      await fetchLaporan();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat restock bahan.' });
    }
  };

  // Hapus Bahan
  const handleDeleteStock = async (stok: StokBahanItem) => {
    const isConfirmed = window.confirm(
      `Hapus stok "${stok.nama_bahan}" (${stok.kategori}) dari database?\n\nPeringatan: Data ini tidak dapat dikembalikan.`
    );
    if (!isConfirmed) return;

    setActionState({ type: 'loading', message: `Menghapus "${stok.nama_bahan}"...` });

    try {
      const res = await fetch(`/api/stok?id_stok=${stok.id_stok}&role=owner`, {
        method: 'DELETE',
      });

      const resData = await res.json();
      if (!res.ok) {
        setActionState({ type: 'error', message: resData.message || 'Gagal menghapus stok.' });
        return;
      }

      setActionState({
        type: 'success',
        message: resData.message || `Stok "${stok.nama_bahan}" berhasil dihapus.`,
      });

      await fetchLaporan();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat menghapus stok.' });
    }
  };

  // Modal Openers untuk Stok Bahan
  const handleOpenAddStock = (defaultKat: 'Plastik' | 'Bumbu' = 'Plastik') => {
    setStockNama('');
    setStockKategori(defaultKat);
    setStockSatuan(defaultKat === 'Plastik' ? 'Pack' : 'Kg');
    setStockJumlah(defaultKat === 'Plastik' ? 25 : defaultKat === 'Bumbu' ? 20 : 100);
    setShowAddStockModal(true);
    setActionState({ type: 'idle', message: null });
  };

  const handleOpenEditStock = (stok: StokBahanItem) => {
    setSelectedStockToEdit(stok);
    setEditStockNama(stok.nama_bahan);
    setEditStockKategori(stok.kategori);
    setEditStockSatuan(stok.satuan);
    setEditStockJumlah(stok.jumlah);
    setShowEditStockModal(true);
    setActionState({ type: 'idle', message: null });
  };

  const handleOpenRestockStock = (stok: StokBahanItem) => {
    setSelectedStockToRestock(stok);
    setStockRestockQty(stok.kategori === 'Plastik' ? 20 : 10);
    setShowRestockStockModal(true);
    setActionState({ type: 'idle', message: null });
  };

  const cancelledOrdersCount = (laporan?.orders || []).filter(
    (o) => o.status_pesanan === 'dibatalkan'
  ).length;

  return (
    <RoleGuard allowedRoles={['owner']} pageTitle="Dashboard Owner">
      <div className={`space-y-6 ${selectedOrderToPrint || showFinancialReportModal ? 'print:hidden' : ''}`}>
        {/* Banner Eksekutif Owner */}
        <div className="bg-gradient-to-r from-amber-800 via-brand-maroon to-brand-darkmaroon text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-200 border border-amber-300/30 mb-3">
              <BarChart3 className="w-3.5 h-3.5 text-amber-300" />
              Pusat Kendali Eksekutif Pabrik Kerupuk Diansyah
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              Laporan Harian, Transaksi & Keuangan
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-amber-100/80 leading-relaxed">
              Selamat datang, <strong>{user?.nama}</strong>. Data berikut terhubung secara langsung (<em>real-time</em>) dengan database Supabase.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs print:hidden">
            <button
              onClick={() => {
                setPrintPeriod('harian');
                setShowFinancialReportModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-brand-darkmaroon font-bold transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Cetak Laporan (Harian / Bulanan / Tahunan)
            </button>
            <button
              type="button"
              onClick={() => {
                setViewSection('katalog');
                document.getElementById('section-manajemen-data')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition shadow-sm ${
                viewSection === 'katalog'
                  ? 'bg-amber-400 text-brand-darkmaroon'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <Package className="w-4 h-4 text-amber-300" />
              Kelola List Produk ({laporan?.produkList?.length || 0})
            </button>
            <button
              onClick={handleOpenAddProduct}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition border border-white/20"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              + Tambah Produk Baru
            </button>
            <button
              onClick={() => fetchLaporan()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Action State Alert */}
        <StateAlert
          type={actionState.type}
          message={actionState.message}
          onClose={() => setActionState({ type: 'idle', message: null })}
        />

        {/* 4 Metrik Kartu Keuangan & Interactive Bar Chart */}
        <OwnerStatsCards
          laporan={laporan}
          chartPeriod={chartPeriod}
          setChartPeriod={setChartPeriod}
          hoveredBarIndex={hoveredBarIndex}
          setHoveredBarIndex={setHoveredBarIndex}
          onOpenFinancialReport={() => {
            setPrintPeriod(chartPeriod === 'mingguan' ? 'harian' : chartPeriod);
            setShowFinancialReportModal(true);
          }}
        />

        {/* Laporan Keuangan & Rekapitulasi Kas Pabrik */}
        <OwnerFinancialSummary
          laporan={laporan}
          isLoading={isLoading}
          onRefresh={() => fetchLaporan()}
          onOpenReportModal={() => {
            setPrintPeriod('bulanan');
            setShowFinancialReportModal(true);
          }}
        />

        {/* TABEL MANAJEMEN DATA (TRANSAKSI, KATALOG PRODUK CRUD, PELANGGAN, PEMBATALAN) */}
        <div id="section-manajemen-data" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                {viewSection === 'transaksi' ? (
                  <>
                    <CreditCard className="w-5 h-5 text-brand-maroon" />
                    Daftar Transaksi Pemesanan & Konfirmasi Pembayaran
                  </>
                ) : viewSection === 'pelanggan' ? (
                  <>
                    <Users className="w-5 h-5 text-brand-maroon" />
                    Data Master Pelanggan Terdaftar
                  </>
                ) : viewSection === 'katalog' ? (
                  <>
                    <Package className="w-5 h-5 text-brand-maroon" />
                    Katalog Master Produk & Bahan Baku Pabrik
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    Dashboard Khusus Pembatalan Pesanan Pelanggan
                  </>
                )}
              </h2>
              <p className="text-xs text-gray-500">
                {viewSection === 'transaksi'
                  ? 'Owner dapat memvalidasi penerimaan kas tunai (Cash on Delivery) dan memantau status pesanan'
                  : viewSection === 'pelanggan'
                  ? 'Daftar seluruh akun pelanggan yang terdaftar di basis data Pabrik Kerupuk Diansyah'
                  : viewSection === 'katalog'
                  ? 'Kelola katalog produk kerupuk jual, kemasan plastik, bumbu tabur rasa, dan stok mentah dapur'
                  : 'Monitoring seluruh pesanan yang dibatalkan oleh pelanggan dan verifikasi pengembalian alokasi stok mentah'}
              </p>
            </div>

            {/* Toggle Tabs Transaksi vs Pelanggan vs Katalog Produk vs Pembatalan */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setViewSection('transaksi')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewSection === 'transaksi'
                    ? 'bg-white text-brand-maroon shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Transaksi ({laporan?.orders?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setViewSection('pelanggan')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewSection === 'pelanggan'
                    ? 'bg-white text-brand-maroon shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Pelanggan ({laporan?.pelangganList?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setViewSection('katalog')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewSection === 'katalog'
                    ? 'bg-white text-brand-maroon shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Katalog & Bahan ({(laporan?.produkList?.length || 0) + (laporan?.stockList?.filter((s: any) => s.kategori === 'Plastik' || s.kategori === 'Bumbu')?.length || 0)})</span>
              </button>
              <button
                type="button"
                onClick={() => setViewSection('pembatalan')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewSection === 'pembatalan'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Pembatalan ({cancelledOrdersCount})</span>
              </button>
            </div>
          </div>

          {viewSection === 'pelanggan' ? (
            <OwnerCustomerTable pelangganList={laporan?.pelangganList || []} />
          ) : viewSection === 'katalog' ? (
            <OwnerCatalogTable
              produkList={laporan?.produkList || []}
              stockList={laporan?.stockList || []}
              orders={laporan?.orders || []}
              onOpenAddModal={handleOpenAddProduct}
              onOpenRestockModal={handleOpenRestock}
              onOpenEditModal={handleOpenEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onOpenAddStockModal={handleOpenAddStock}
              onOpenEditStockModal={handleOpenEditStock}
              onOpenRestockStockModal={handleOpenRestockStock}
              onDeleteStock={handleDeleteStock}
            />
          ) : viewSection === 'pembatalan' ? (
            <OwnerCancellationDashboard orders={laporan?.orders || []} />
          ) : (
            <OwnerOrderTable
              orders={laporan?.orders || []}
              orderFilter={orderFilter}
              setOrderFilter={setOrderFilter}
              onConfirmPayment={handleConfirmPayment}
              onOpenTransferProof={(order) => setSelectedTransferProof(order)}
              onOpenQrisProof={(order) => setSelectedQrisProof(order)}
              onOpenPrintReceipt={(order) => setSelectedOrderToPrint(order)}
            />
          )}
        </div>

        {/* MODAL TAMBAH PRODUK BARU */}
        <OwnerAddProductModal
          isOpen={showProductModal}
          namaProduk={namaProduk}
          setNamaProduk={setNamaProduk}
          satuanProduk={satuanProduk}
          setSatuanProduk={setSatuanProduk}
          hargaProduk={hargaProduk}
          setHargaProduk={setHargaProduk}
          stokProduk={stokProduk}
          setStokProduk={setStokProduk}
          deskripsiProduk={deskripsiProduk}
          setDeskripsiProduk={setDeskripsiProduk}
          gambarProduk={gambarProduk}
          setGambarProduk={setGambarProduk}
          productErrors={productErrors}
          setProductErrors={setProductErrors}
          isLoading={actionState.type === 'loading'}
          onImageUpload={handleImageUpload}
          onClose={() => setShowProductModal(false)}
          onSubmit={handleAddProductSubmit}
        />

        {/* MODAL EDIT PRODUK */}
        <OwnerEditProductModal
          product={selectedProductToEdit}
          editNama={editNama}
          setEditNama={setEditNama}
          editSatuan={editSatuan}
          setEditSatuan={setEditSatuan}
          editHarga={editHarga}
          setEditHarga={setEditHarga}
          editDeskripsi={editDeskripsi}
          setEditDeskripsi={setEditDeskripsi}
          editGambar={editGambar}
          setEditGambar={setEditGambar}
          isLoading={actionState.type === 'loading'}
          onImageUpload={handleEditImageUpload}
          onClose={() => {
            setShowEditProductModal(false);
            setSelectedProductToEdit(null);
          }}
          onSubmit={handleEditProductSubmit}
        />

        {/* MODAL RESTOCK PRODUK */}
        <OwnerRestockModal
          product={selectedProductToRestock}
          restockBalQty={restockBalQty}
          setRestockBalQty={setRestockBalQty}
          isLoading={actionState.type === 'loading'}
          onClose={() => setSelectedProductToRestock(null)}
          onSubmit={handleRestockSubmit}
        />

        {/* MODAL VERIFIKASI BUKTI TRANSFER */}
        <OwnerTransferProofModal
          order={selectedTransferProof}
          onConfirmPayment={handleConfirmPayment}
          onClose={() => setSelectedTransferProof(null)}
        />

        {/* MODAL BUKTI QRIS */}
        <OwnerQrisProofModal
          order={selectedQrisProof}
          onClose={() => setSelectedQrisProof(null)}
        />

        {/* MODAL TAMBAH STOK BAHAN / PLASTIK (KHUSUS OWNER) */}
        <OwnerAddStockModal
          isOpen={showAddStockModal}
          namaBahan={stockNama}
          setNamaBahan={setStockNama}
          kategori={stockKategori}
          setKategori={setStockKategori}
          satuan={stockSatuan}
          setSatuan={setStockSatuan}
          jumlah={stockJumlah}
          setJumlah={setStockJumlah}
          isLoading={actionState.type === 'loading'}
          onClose={() => setShowAddStockModal(false)}
          onSubmit={handleAddStockSubmit}
        />

        {/* MODAL EDIT STOK BAHAN (KHUSUS OWNER) */}
        <OwnerEditStockModal
          stockItem={selectedStockToEdit}
          editNama={editStockNama}
          setEditNama={setEditStockNama}
          editKategori={editStockKategori}
          setEditKategori={setEditStockKategori}
          editSatuan={editStockSatuan}
          setEditSatuan={setEditStockSatuan}
          editJumlah={editStockJumlah}
          setEditJumlah={setEditStockJumlah}
          isLoading={actionState.type === 'loading'}
          onClose={() => {
            setShowEditStockModal(false);
            setSelectedStockToEdit(null);
          }}
          onSubmit={handleEditStockSubmit}
        />

        {/* MODAL RESTOCK BAHAN (KHUSUS OWNER) */}
        <OwnerRestockMaterialModal
          stockItem={selectedStockToRestock}
          additionalQty={stockRestockQty}
          setAdditionalQty={setStockRestockQty}
          isLoading={actionState.type === 'loading'}
          onClose={() => {
            setShowRestockStockModal(false);
            setSelectedStockToRestock(null);
          }}
          onSubmit={handleRestockStockSubmit}
        />
      </div>

      {/* MODAL CETAK LAPORAN KEUANGAN */}
      <OwnerFinancialModal
        isOpen={showFinancialReportModal}
        onClose={() => setShowFinancialReportModal(false)}
        orders={laporan?.orders || []}
        printPeriod={printPeriod}
        setPrintPeriod={setPrintPeriod}
        printDate={printDate}
        setPrintDate={setPrintDate}
        printMonth={printMonth}
        setPrintMonth={setPrintMonth}
        printYear={printYear}
        setPrintYear={setPrintYear}
      />

      {/* MODAL CETAK RESI RESMI (UC-13) */}
      <OwnerReceiptModal
        order={selectedOrderToPrint}
        onClose={() => setSelectedOrderToPrint(null)}
      />
    </RoleGuard>
  );
}
