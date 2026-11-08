'use client';

import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/auth/role-guard';
import { useAuth } from '@/context/auth-context';
import StateAlert, { StateType } from '@/components/ui/state-alert';
import { validateForm } from '@/lib/validation';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Printer, 
  CheckCircle2, 
  PlusCircle, 
  RefreshCw, 
  X, 
  Clock, 
  CreditCard,
  Banknote,
  Search,
  Check,
  Wallet,
  Calculator,
  PieChart,
  QrCode,
  Building2,
  Image as ImageIcon,
  Receipt,
  Layers,
  Eye,
  AlertTriangle,
<<<<<<< HEAD
  Package,
  Edit2,
  Trash2,
  PackagePlus,
  FileText
=======
  Calendar,
  CalendarDays,
  Trash2,
  Upload,
  Edit3,
  Pencil,
  Package
>>>>>>> e7db4d333f2685ffba61a679a0f54226602f2786
} from 'lucide-react';
import { ChartData } from '@/lib/chart-data';

interface OrderItem {
  id_pesanan: number;
  tanggal_pesanan: string;
  created_at?: string;
  jumlah: number;
  total_harga: number;
  status_pesanan: string;
  varian_rasa: string;
  ukuran_plastik: string;
  produk?: {
    nama_produk: string;
    satuan: string;
  };
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
    tanggal_pembayaran?: string;
  }[];
  produksi?: {
    id_produksi: number;
    status_produksi: string;
    verifikasi?: {
      id_verifikasi: number;
      status: string;
    }[];
  }[];
}

interface PelangganItem {
  id_pelanggan: number;
  id_user: number;
  nama_lengkap: string;
  alamat: string;
  no_telp: string;
  email: string;
  jenis_kelamin: string;
  created_at: string;
}

interface ProdukCatalogItem {
  id_produk: number;
  nama_produk: string;
  satuan: string;
  harga: number;
  stok: number;
  deskripsi?: string;
  gambar_url?: string;
}

interface StokBahanItem {
  id_stok: number;
  id_user?: number | null;
  nama_bahan: string;
  kategori: string;
  satuan: string;
  jumlah: number;
  tanggal_update: string;
  created_at?: string;
}

interface LaporanData {
  totalOmset: number;
  totalKasMasuk: number;
  totalPiutang: number;
  estimasiHPP: number;
  estimasiKeuntungan: number;
  totalTransaksi: number;
  totalSelesai: number;
  totalProses: number;
  orders: OrderItem[];
  pelangganList?: PelangganItem[];
  produkList?: ProdukCatalogItem[];
  rekapMetode?: Record<string, { count: number; total: number; lunas: number }>;
  produkBreakdown?: { nama: string; satuan: string; jumlah: number; total: number }[];
  stockList?: StokBahanItem[];
  chartData?: ChartData;
}

export default function OwnerDashboardPage() {
  const { user } = useAuth();

  const [laporan, setLaporan] = useState<LaporanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'transaksi' | 'katalog' | 'stok_bahan' | 'pelanggan'>('ringkasan');
  const [chartPeriod, setChartPeriod] = useState<'harian' | 'mingguan' | 'bulanan' | 'tahunan'>('harian');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Status notifikasi aksi
  const [actionState, setActionState] = useState<{ type: StateType; message: string | null }>({
    type: 'idle',
    message: null,
  });

  // Modal Cetak Resi
  const [selectedOrderToPrint, setSelectedOrderToPrint] = useState<OrderItem | null>(null);

  // Modal Verifikasi Bukti Transfer Bank
  const [selectedTransferProof, setSelectedTransferProof] = useState<OrderItem | null>(null);

  // Modal Bukti QRIS
  const [selectedQrisProof, setSelectedQrisProof] = useState<OrderItem | null>(null);

  // Modal Cetak Laporan Keuangan
  const [showFinancialReportModal, setShowFinancialReportModal] = useState(false);

  // Modal Tambah Produk Baru
  const [showProductModal, setShowProductModal] = useState(false);
  const [namaProduk, setNamaProduk] = useState('');
  const [satuanProduk, setSatuanProduk] = useState('Bal');
  const [hargaProduk, setHargaProduk] = useState<number>(160000);
  const [stokProduk, setStokProduk] = useState<number>(25);
  const [deskripsiProduk, setDeskripsiProduk] = useState('');
  const [productErrors, setProductErrors] = useState<Record<string, string>>({});
  // Modal Edit Produk & Ganti Foto (CRUD Update)
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedProductToEdit, setSelectedProductToEdit] = useState<ProdukCatalogItem | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editSatuan, setEditSatuan] = useState('Bal');
  const [editHarga, setEditHarga] = useState<number>(160000);
  const [editDeskripsi, setEditDeskripsi] = useState('');
  const [editGambar, setEditGambar] = useState('');
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Handler Upload Foto untuk Form Edit Produk
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

  // Submit Edit Produk (CRUD Update)
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

  // Submit Hapus Produk (CRUD Delete)
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

  const [gambarProduk, setGambarProduk] = useState('');

  // Periode Cetak Laporan Terpisah (Harian / Bulanan / Tahunan)
  const [printPeriod, setPrintPeriod] = useState<'harian' | 'bulanan' | 'tahunan'>('harian');
  const [printDate, setPrintDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [printMonth, setPrintMonth] = useState(() => new Date().getMonth() + 1);
  const [printYear, setPrintYear] = useState(() => new Date().getFullYear());

  // Handler Upload Foto Produk (dengan kompresi otomatis)
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

  // Modal Restock Produk Bal
  const [selectedProductToRestock, setSelectedProductToRestock] = useState<ProdukCatalogItem | null>(null);
  const [restockBalQty, setRestockBalQty] = useState<number>(10);

  // Modal Tambah Bahan Baru
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [newStockNama, setNewStockNama] = useState('');
  const [newStockKategori, setNewStockKategori] = useState<'Kerupuk Mentah' | 'Bumbu' | 'Plastik'>('Bumbu');
  const [newStockSatuan, setNewStockSatuan] = useState<'Kg' | 'Pack' | 'Bal' | 'Pcs'>('Kg');
  const [newStockJumlah, setNewStockJumlah] = useState<number>(25);

  // Modal Restock Bahan
  const [selectedStockToRestock, setSelectedStockToRestock] = useState<StokBahanItem | null>(null);
  const [stockRestockAmount, setStockRestockAmount] = useState<number>(10);

  // Modal Edit Data Stok
  const [selectedStockToEdit, setSelectedStockToEdit] = useState<StokBahanItem | null>(null);
  const [editStockNama, setEditStockNama] = useState('');
  const [editStockKategori, setEditStockKategori] = useState<'Kerupuk Mentah' | 'Bumbu' | 'Plastik'>('Bumbu');
  const [editStockSatuan, setEditStockSatuan] = useState('Kg');
  const [editStockJumlah, setEditStockJumlah] = useState<number>(0);

  // Modal Hapus Stok
  const [selectedStockToDelete, setSelectedStockToDelete] = useState<StokBahanItem | null>(null);

  // Filter & Pencarian Stok Bahan
  const [stockCategoryTab, setStockCategoryTab] = useState<'semua' | 'Kerupuk Mentah' | 'Bumbu' | 'Plastik'>('semua');
  const [stockStatusFilter, setStockStatusFilter] = useState<'semua' | 'menipis' | 'aman'>('semua');
  const [stockSearchQuery, setStockSearchQuery] = useState('');

  const fetchLaporan = async (silent = false) => {
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
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
    const interval = setInterval(() => {
      fetchLaporan(true);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Konfirmasi Pembayaran Tunai / ACC Lunas
  const handleConfirmPayment = async (orderId: number) => {
    setActionState({ type: 'loading', message: 'Mengonfirmasi pelunasan pembayaran...' });
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
        message: `Pembayaran pesanan #${orderId} berhasil di-ACC Lunas.`,
      });
      await fetchLaporan();
    } catch {
      setActionState({ type: 'error', message: 'Gagal menghubungi server.' });
    }
  };

  // Tambah Produk Baru
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm([
      { field: 'nama_produk', label: 'Nama Produk', value: namaProduk, required: true, dataType: 'string' },
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
      const errMsg = `Produk "${cleanName}" sudah ada di dalam katalog.`;
      setProductErrors({ nama_produk: errMsg });
      setActionState({ type: 'error', message: errMsg });
      return;
    }

    setProductErrors({});
    setActionState({ type: 'loading', message: 'Menyimpan produk...' });

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
          setProductErrors({ nama_produk: resData.errors?.nama_produk || resData.message });
        }
        setActionState({ type: 'error', message: resData.message || 'Gagal menyimpan produk.' });
        return;
      }

      setActionState({
        type: 'success',
        message: `Produk "${cleanName}" berhasil ditambahkan.`,
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

  // Restock Pasokan Produk Bal
  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductToRestock) return;
    if (restockBalQty <= 0) {
      setActionState({ type: 'error', message: 'Jumlah tambahan stok minimal 1 Bal.' });
      return;
    }

    setActionState({ type: 'loading', message: 'Menyimpan restock...' });
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
        setActionState({ type: 'error', message: resData.message || 'Gagal restock produk.' });
        return;
      }

      setActionState({ type: 'success', message: resData.message });
      setSelectedProductToRestock(null);
      await fetchLaporan();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat restock produk.' });
    }
  };

  // Tambah Stok Bahan Baru
  const handleAddStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStockNama.trim()) {
      setActionState({ type: 'error', message: 'Nama bahan tidak boleh kosong.' });
      return;
    }

    if (newStockNama.toLowerCase().includes('minyak')) {
      setActionState({ type: 'error', message: 'Stok minyak goreng tidak dikelola di sistem ini.' });
      return;
    }

    setActionState({ type: 'loading', message: 'Menyimpan bahan...' });
    try {
      const res = await fetch('/api/stok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          nama_bahan: newStockNama.trim(),
          kategori: newStockKategori,
          satuan: newStockSatuan,
          jumlah: Number(newStockJumlah),
          id_user: user?.id_user,
          role: user?.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionState({ type: 'error', message: data.message || 'Gagal menyimpan bahan.' });
        return;
      }

      setActionState({ type: 'success', message: data.message });
      setShowAddStockModal(false);
      setNewStockNama('');
      setNewStockJumlah(25);
      await fetchLaporan();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat menyimpan bahan.' });
    }
  };

  // Restock Bahan Baku
  const handleRestockMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockToRestock) return;
    if (stockRestockAmount <= 0) {
      setActionState({ type: 'error', message: 'Jumlah tambahan stok minimal 1.' });
      return;
    }

    setActionState({ type: 'loading', message: 'Menyimpan restock...' });
    try {
      const res = await fetch('/api/stok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          nama_bahan: selectedStockToRestock.nama_bahan,
          kategori: selectedStockToRestock.kategori,
          satuan: selectedStockToRestock.satuan,
          jumlah: Number(stockRestockAmount),
          id_user: user?.id_user,
          role: user?.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionState({ type: 'error', message: data.message || 'Gagal restock bahan.' });
        return;
      }

      setActionState({ type: 'success', message: data.message });
      setSelectedStockToRestock(null);
      await fetchLaporan();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat restock bahan.' });
    }
  };

  // Edit Data Stok
  const handleEditStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockToEdit) return;

    setActionState({ type: 'loading', message: 'Menyimpan perubahan...' });
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
          role: user?.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionState({ type: 'error', message: data.message || 'Gagal mengedit stok.' });
        return;
      }

      setActionState({ type: 'success', message: data.message });
      setSelectedStockToEdit(null);
      await fetchLaporan();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat mengedit stok.' });
    }
  };

  // Hapus Stok
  const handleDeleteStockSubmit = async () => {
    if (!selectedStockToDelete) return;

    setActionState({ type: 'loading', message: 'Menghapus item...' });
    try {
      const res = await fetch(`/api/stok?id_stok=${selectedStockToDelete.id_stok}&role=${user?.role}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        setActionState({ type: 'error', message: data.message || 'Gagal menghapus stok.' });
        return;
      }

      setActionState({ type: 'success', message: data.message });
      setSelectedStockToDelete(null);
      await fetchLaporan();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat menghapus stok.' });
    }
  };

  // Filter daftar stok bahan (tanpa minyak)
  const allStockList = (laporan?.stockList || []).filter(
    (s) => !s.nama_bahan.toLowerCase().includes('minyak')
  );

  const lowStockItems = allStockList.filter((s) => s.jumlah <= 20);

  const filteredStocks = allStockList.filter((item) => {
    if (stockCategoryTab !== 'semua' && item.kategori !== stockCategoryTab) return false;
    if (stockStatusFilter === 'menipis' && item.jumlah > 20) return false;
    if (stockStatusFilter === 'aman' && item.jumlah <= 20) return false;
    if (stockSearchQuery) {
      const query = stockSearchQuery.toLowerCase();
      return (
        item.nama_bahan.toLowerCase().includes(query) ||
        item.kategori.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const bumbuList = allStockList.filter((s) => s.kategori === 'Bumbu');
  const plastikList = allStockList.filter((s) => s.kategori === 'Plastik');
  const mentahList = allStockList.filter((s) => s.kategori === 'Kerupuk Mentah');

  return (
    <RoleGuard allowedRoles={['owner']} pageTitle="Dashboard Owner">
<<<<<<< HEAD
      <div className="space-y-6">
        {/* Banner Utama */}
        <div className="bg-gradient-to-r from-amber-800 via-brand-maroon to-brand-darkmaroon text-white rounded-2xl p-6 sm:p-7 shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Dashboard Owner
              </h1>
              <p className="text-xs sm:text-sm text-amber-100/90 mt-1">
                Pabrik Kerupuk Diansyah &bull; Kelola transaksi, stok, dan laporan keuangan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs print:hidden">
              <button
                onClick={() => setShowFinancialReportModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-brand-darkmaroon font-bold transition shadow-sm active:scale-95"
              >
                <Printer className="w-4 h-4" />
                Cetak Laporan
              </button>
              <button
                onClick={() => {
                  setShowProductModal(true);
                  setActionState({ type: 'idle', message: null });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold transition border border-white/20 active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-amber-300" />
                + Tambah Produk
              </button>
              <button
                onClick={() => {
                  setShowAddStockModal(true);
                  setActionState({ type: 'idle', message: null });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold transition border border-white/20 active:scale-95"
              >
                <PackagePlus className="w-4 h-4 text-amber-300" />
                + Tambah Bahan
              </button>
              <button
                onClick={() => fetchLaporan()}
                disabled={isLoading}
                title="Segarkan Data"
                className="inline-flex items-center justify-center p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition border border-white/20 active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
=======
      <div className={`space-y-6 ${selectedOrderToPrint ? 'print:hidden' : ''}`}>
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
              Selamat datang, <strong>{user?.nama}</strong>. Data berikut terhubung secara langsung (*real-time*) dengan database Supabase.
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
              onClick={() => {
                setShowProductModal(true);
                setActionState({ type: 'idle', message: null });
              }}
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
>>>>>>> e7db4d333f2685ffba61a679a0f54226602f2786
          </div>
        </div>

        {/* Notifikasi Global State Alert */}
        <StateAlert
          type={actionState.type}
          message={actionState.message}
          onClose={() => setActionState({ type: 'idle', message: null })}
        />

        {/* Alert Stok Menipis */}
        {lowStockItems.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-amber-900">
                Ada <strong>{lowStockItems.length} bahan</strong> dengan stok menipis (&le; 20). Segera restock pasokan.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('stok_bahan');
                setStockStatusFilter('menipis');
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 underline shrink-0"
            >
              Lihat Stok Menipis &rarr;
            </button>
          </div>
        )}

        {/* 4 Kartu Metrik Keuangan Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
              <span className="font-semibold">Akumulasi Omset</span>
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">
                Rp {(laporan?.totalOmset || 0).toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">{laporan?.totalTransaksi || 0} Total pesanan</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
              <span className="font-semibold">Kas Diterima (Lunas)</span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Wallet className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">
                Rp {(laporan?.totalKasMasuk || 0).toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-emerald-700/80 mt-1 font-medium">Terverifikasi Lunas</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
              <span className="font-semibold">Piutang Belum Lunas</span>
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600">
                Rp {(laporan?.totalPiutang || 0).toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-amber-700/80 mt-1 font-medium">Menunggu Pembayaran</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
              <span className="font-semibold">Estimasi Laba Bersih</span>
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-brand-maroon">
                Rp {(laporan?.estimasiKeuntungan || 0).toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Perkiraan Margin ~30%</p>
            </div>
          </div>
        </div>

        {/* Tab Navigasi Halaman */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('ringkasan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'ringkasan'
                ? 'bg-brand-maroon text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Grafik & Keuangan</span>
          </button>

<<<<<<< HEAD
          <button
            type="button"
            onClick={() => setActiveTab('transaksi')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'transaksi'
                ? 'bg-brand-maroon text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Transaksi ({laporan?.orders?.length || 0})</span>
          </button>
=======
            {/* Toggle 4 Periode: Hari, Minggu, Bulan, Tahun */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
              <button
                type="button"
                onClick={() => {
                  if (chartPeriod === 'bulanan') setPrintPeriod('bulanan');
                  else if (chartPeriod === 'tahunan') setPrintPeriod('tahunan');
                  else setPrintPeriod('harian');
                  setShowFinancialReportModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-brand-darkmaroon font-bold text-xs shadow-sm transition active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Laporan {chartPeriod === 'bulanan' ? 'Bulanan' : chartPeriod === 'tahunan' ? 'Tahunan' : 'Harian'}</span>
              </button>
              <div className="flex items-center p-1.5 bg-gray-100/90 rounded-2xl gap-1 border border-gray-200/80">
              <button
                type="button"
                onClick={() => {
                  setChartPeriod('harian');
                  setHoveredBarIndex(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  chartPeriod === 'harian'
                    ? 'bg-brand-maroon text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Harian (7 Hari)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setChartPeriod('mingguan');
                  setHoveredBarIndex(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  chartPeriod === 'mingguan'
                    ? 'bg-brand-maroon text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Mingguan (5 Mgg)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setChartPeriod('bulanan');
                  setHoveredBarIndex(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  chartPeriod === 'bulanan'
                    ? 'bg-brand-maroon text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Bulanan (12 Bln)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setChartPeriod('tahunan');
                  setHoveredBarIndex(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  chartPeriod === 'tahunan'
                    ? 'bg-brand-maroon text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Tahunan</span>
              </button>
            </div>
          </div>
        </div>
>>>>>>> e7db4d333f2685ffba61a679a0f54226602f2786

          <button
            type="button"
            onClick={() => setActiveTab('katalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'katalog'
                ? 'bg-brand-maroon text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Katalog Produk ({laporan?.produkList?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stok_bahan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'stok_bahan'
                ? 'bg-brand-maroon text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Stok Bahan Baku ({allStockList.length})</span>
            {lowStockItems.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pelanggan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'pelanggan'
                ? 'bg-brand-maroon text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Pelanggan ({laporan?.pelangganList?.length || 0})</span>
          </button>
        </div>

<<<<<<< HEAD
        {/* ========================================================================= */}
        {/* TAB 1: GRAFIK & KEUANGAN */}
        {/* ========================================================================= */}
        {activeTab === 'ringkasan' && (
          <div className="space-y-6">
            {/* DIAGRAM OMSET KEUANGAN */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-brand-maroon flex items-center justify-center font-bold">
                    <BarChart3 className="w-5 h-5" />
=======
        {/* TABEL MANAJEMEN DATA (TRANSAKSI, KATALOG PRODUK CRUD, PELANGGAN) */}
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
                ) : (
                  <>
                    <Package className="w-5 h-5 text-brand-maroon" />
                    Katalog Master Produk Kerupuk Pabrik
                  </>
                )}
              </h2>
              <p className="text-xs text-gray-500">
                {viewSection === 'transaksi'
                  ? 'Owner dapat memvalidasi penerimaan kas tunai (Cash on Delivery) dan memantau status pesanan'
                  : viewSection === 'pelanggan'
                  ? 'Daftar seluruh akun pelanggan yang terdaftar di basis data Pabrik Kerupuk Diansyah'
                  : 'Daftar seluruh katalog varian kerupuk. Nama produk bersifat unik dan tidak dapat diduplikasi'}
              </p>
            </div>

            {/* Toggle Tabs Transaksi vs Pelanggan vs Katalog Produk */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
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
                <span>Katalog Produk ({laporan?.produkList?.length || 0})</span>
              </button>
            </div>
          </div>

          {viewSection === 'pelanggan' ? (
            !laporan?.pelangganList || laporan.pelangganList.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-600">Belum ada pelanggan terdaftar di Supabase.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-y border-gray-100">
                    <tr>
                      <th className="py-3 px-3">ID</th>
                      <th className="py-3 px-3">Nama Lengkap</th>
                      <th className="py-3 px-3">No. Telepon / WA</th>
                      <th className="py-3 px-3">Alamat</th>
                      <th className="py-3 px-3">Email</th>
                      <th className="py-3 px-3">Jenis Kelamin</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {laporan.pelangganList.map((pel) => {
                      const isNew = pel.id_pelanggan >= 7 || pel.nama_lengkap.toLowerCase().includes('hanifa');
                      return (
                        <tr key={pel.id_pelanggan} className="hover:bg-gray-50/70">
                          <td className="py-3 px-3 font-mono font-bold text-gray-800">#{pel.id_pelanggan}</td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-gray-900 block">{pel.nama_lengkap}</span>
                            <span className="text-[10px] text-gray-400">ID User: #{pel.id_user}</span>
                          </td>
                          <td className="py-3 px-3 font-mono font-medium text-gray-700">{pel.no_telp || '-'}</td>
                          <td className="py-3 px-3 text-gray-600 max-w-xs">{pel.alamat || '-'}</td>
                          <td className="py-3 px-3 text-gray-600">{pel.email || '-'}</td>
                          <td className="py-3 px-3 text-gray-600">{pel.jenis_kelamin || 'Perempuan'}</td>
                          <td className="py-3 px-3">
                            {isNew ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                Pelanggan Baru
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                                Terdaftar
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : viewSection === 'katalog' ? (
            !laporan?.produkList || laporan.produkList.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-600">Belum ada produk terdaftar di katalog Supabase.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl">
                  <div className="flex items-center gap-2.5 text-xs text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <div className="leading-relaxed">
                      <p>
                        <strong>Sistem Produksi Goreng Dadakan (Make-To-Order):</strong> Stok kerupuk katalog dihitung langsung dari pasokan bahan mentah supplier di dapur penggorengan (<strong>1 Bal = 5 Kg kerupuk mentah</strong>).
                      </p>
                      <p className="text-[11px] text-amber-800/80 mt-0.5">
                        Saat pelanggan memesan, stok mentah di dapur otomatis terpotong. Nama produk bersifat unik (tidak dapat diduplikasi).
                      </p>
                    </div>
>>>>>>> e7db4d333f2685ffba61a679a0f54226602f2786
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      Diagram Omset Keuangan Pabrik
                    </h2>
                    <p className="text-xs text-gray-500">
                      Tren omset dan penerimaan kas pabrik
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-1 bg-gray-100 rounded-xl gap-1 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      setChartPeriod('harian');
                      setHoveredBarIndex(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      chartPeriod === 'harian'
                        ? 'bg-brand-maroon text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Harian
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChartPeriod('mingguan');
                      setHoveredBarIndex(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      chartPeriod === 'mingguan'
                        ? 'bg-brand-maroon text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Mingguan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChartPeriod('bulanan');
                      setHoveredBarIndex(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      chartPeriod === 'bulanan'
                        ? 'bg-brand-maroon text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Bulanan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChartPeriod('tahunan');
                      setHoveredBarIndex(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      chartPeriod === 'tahunan'
                        ? 'bg-brand-maroon text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Tahunan
                  </button>
                </div>
              </div>

              {/* Render Bar Chart */}
              {(() => {
                const periodData = laporan?.chartData ? laporan.chartData[chartPeriod] : [];
                const maxVal = Math.max(...periodData.map((d) => d.omset), 100000);

                return (
                  <div className="space-y-4">
                    <div className="h-60 flex items-end gap-2 sm:gap-4 pt-6 px-2 border-b border-gray-200">
                      {periodData.map((d, idx) => {
                        const heightPercent = Math.max(8, Math.round((d.omset / maxVal) * 100));
                        const isHovered = hoveredBarIndex === idx;

                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => setHoveredBarIndex(idx)}
                            onMouseLeave={() => setHoveredBarIndex(null)}
                            className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                          >
                            {isHovered && (
                              <div className="absolute -top-10 z-20 bg-gray-900 text-white text-[11px] py-1 px-2 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                                <span className="font-bold text-amber-300">Rp {d.omset.toLocaleString('id-ID')}</span>
                                <span className="text-gray-300 ml-1">({d.transaksi} order)</span>
                              </div>
                            )}
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className={`w-full rounded-t-lg transition-all duration-200 ${
                                isHovered
                                  ? 'bg-amber-500 shadow-md scale-y-105'
                                  : 'bg-brand-maroon hover:bg-amber-600'
                              }`}
                            />
                            <span className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-2 truncate w-full text-center">
                              {d.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-brand-maroon" /> Omset Penjualan
                        </span>
                        <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Kas Lunas
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        Sorot batang grafik untuk melihat rincian
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* IKHTISAR NERACA KEUANGAN & SALURAN PEMBAYARAN */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-brand-maroon" />
                    Ikhtisar Buku Kas & Laba Rugi Pabrik
                  </h3>
                  <button
                    onClick={() => setShowFinancialReportModal(true)}
                    className="text-xs font-bold text-brand-maroon hover:underline flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak Laporan
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <span className="font-semibold text-gray-800">1. Total Omset Penjualan</span>
                    <span className="font-mono font-bold text-gray-900">
                      Rp {(laporan?.totalOmset || 0).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
                    <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      2. Kas Diterima (Lunas)
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      Rp {(laporan?.totalKasMasuk || 0).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                    <span className="font-semibold text-amber-950 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      3. Piutang Belum Lunas
                    </span>
                    <span className="font-mono font-bold text-amber-800">
                      Rp {(laporan?.totalPiutang || 0).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/70 border border-rose-200">
                    <span className="font-semibold text-rose-950">
                      4. Estimasi Biaya Produksi / HPP (~70%)
                    </span>
                    <span className="font-mono font-bold text-rose-700">
                      - Rp {(laporan?.estimasiHPP || Math.round((laporan?.totalOmset || 0) * 0.7)).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-brand-darkmaroon text-white font-bold">
                    <span className="text-amber-300">
                      5. Estimasi Laba Bersih Operasional (~30%)
                    </span>
                    <span className="text-base text-amber-300 font-mono">
                      Rp {(laporan?.estimasiKeuntungan || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rincian Saluran Pembayaran */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100 mb-4 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-brand-maroon" />
                    Saluran Pembayaran
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="font-bold text-gray-900 block text-xs">Tunai (COD)</span>
                          <span className="text-[11px] text-gray-400">{laporan?.rekapMetode?.tunai?.count || 0} order</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-gray-800">
                        Rp {(laporan?.rekapMetode?.tunai?.total || 0).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <QrCode className="w-4 h-4 text-red-600" />
                        <div>
                          <span className="font-bold text-gray-900 block text-xs">QRIS Instan</span>
                          <span className="text-[11px] text-gray-400">{laporan?.rekapMetode?.qris?.count || 0} order</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-gray-800">
                        Rp {(laporan?.rekapMetode?.qris?.total || 0).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <div>
                          <span className="font-bold text-gray-900 block text-xs">Transfer Bank</span>
                          <span className="text-[11px] text-gray-400">{laporan?.rekapMetode?.transfer?.count || 0} order</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-gray-800">
                        Rp {(laporan?.rekapMetode?.transfer?.total || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* REKAPITULASI PENJUALAN PER VARIAN KERUPUK */}
            {laporan?.produkBreakdown && laporan.produkBreakdown.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-maroon" />
                    Rekapitulasi Penjualan per Varian Kerupuk
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider border-y border-gray-100">
                      <tr>
<<<<<<< HEAD
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">Nama Varian Kerupuk</th>
                        <th className="py-2.5 px-3 text-center">Volume Terjual</th>
                        <th className="py-2.5 px-3 text-right">Kontribusi Omset (Rp)</th>
                        <th className="py-2.5 px-3 text-center">Persentase</th>
=======
                        <th className="py-3 px-3">ID</th>
                        <th className="py-3 px-3">Nama Produk Kerupuk</th>
                        <th className="py-3 px-3">Satuan</th>
                        <th className="py-3 px-3">Harga Jual</th>
                        <th className="py-3 px-3">Kapasitas Stok Jual</th>
                        <th className="py-3 px-3">Status Stok</th>
                        <th className="py-3 px-3">Keterangan</th>
                        <th className="py-3 px-3 text-right min-w-[200px]">Aksi Kelola (CRUD)</th>
>>>>>>> e7db4d333f2685ffba61a679a0f54226602f2786
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {laporan.produkBreakdown.map((p, idx) => {
                        const percentage = laporan.totalOmset > 0 
                          ? Math.round((p.total / laporan.totalOmset) * 100) 
                          : 0;

                        return (
<<<<<<< HEAD
                          <tr key={idx} className="hover:bg-gray-50/70">
                            <td className="py-2.5 px-3 font-mono text-gray-500">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-bold text-gray-900">{p.nama}</td>
                            <td className="py-2.5 px-3 text-center font-medium text-gray-700">
                              {p.jumlah} {p.satuan}
=======
                          <tr key={prod.id_produk} className={`hover:bg-gray-50/70 ${isMakaroni ? 'bg-amber-50/30' : ''}`}>
                            <td className="py-3 px-3 font-mono font-bold text-gray-800">#{prod.id_produk}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3">
                                {prod.gambar_url ? (
                                  <img
                                    src={prod.gambar_url}
                                    alt={prod.nama_produk}
                                    className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-sm shrink-0"
                                  />
                                ) : (
                                  <span className="w-12 h-12 rounded-xl bg-brand-50 text-brand-maroon flex items-center justify-center font-bold text-base shrink-0 border border-brand-100 shadow-inner">
                                    🍘
                                  </span>
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 text-sm">{prod.nama_produk}</span>
                                    {isMakaroni && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                        Katalog Khusus
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-400 max-w-xs truncate mt-0.5">
                                    {prod.deskripsi || 'Tidak ada deskripsi'}
                                  </p>
                                </div>
                              </div>
>>>>>>> e7db4d333f2685ffba61a679a0f54226602f2786
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-brand-maroon">
                              Rp {Number(p.total).toLocaleString('id-ID')}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                                {percentage}%
                              </span>
                            </td>
<<<<<<< HEAD
=======
                            <td className="py-3 px-3">
                              {prod.stok > 10 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  ✓ Stok Tersedia
                                </span>
                              ) : prod.stok > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  ⚠ Stok Menipis
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                                  ✕ Stok Habis
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-gray-500 max-w-xs truncate">
                              {prod.deskripsi || '-'}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedProductToRestock(prod);
                                    setRestockBalQty(10);
                                    setActionState({ type: 'idle', message: null });
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
                                  title="Restock Pasokan Supplier"
                                >
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  <span>+ Restock</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedProductToEdit(prod);
                                    setEditNama(prod.nama_produk);
                                    setEditSatuan(prod.satuan);
                                    setEditHarga(prod.harga);
                                    setEditDeskripsi(prod.deskripsi || '');
                                    setEditGambar(prod.gambar_url || '');
                                    setEditErrors({});
                                    setShowEditProductModal(true);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
                                  title="Edit Produk & Ganti Foto"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(prod)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
                                  title="Hapus Produk dari Katalog"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </td>
>>>>>>> e7db4d333f2685ffba61a679a0f54226602f2786
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
<<<<<<< HEAD
=======

                {/* SINKRONISASI STOK BAHAN MENTAH DI DAPUR PENGGORENGAN (OUTPUT SYNC) */}
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                        <Layers className="w-4 h-4 text-orange-600" />
                        Monitoring Bahan Mentah Dapur Penggorengan (1 Bal = 5 Kg)
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Pasokan supplier bertambah saat Owner restock, dan berkurang otomatis sesuai pesanan kerupuk goreng dadakan pelanggan.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(laporan.stockList || [])
                      .filter((s) => s.kategori !== 'Plastik')
                      .map((stok) => {
                        const isMentah = stok.kategori === 'Kerupuk Mentah';
                        const balEquivalent = isMentah ? Math.floor(stok.jumlah / 5) : null;
                        return (
                          <div key={stok.id_stok} className="p-3 bg-gray-50 border border-gray-200 rounded-2xl hover:border-brand-maroon/30 transition">
                            <span className="text-xs font-bold text-gray-800 block truncate">{stok.nama_bahan}</span>
                            <span className="text-base font-black text-brand-maroon mt-1 block">
                              {stok.jumlah} {stok.satuan}
                            </span>
                            {isMentah && balEquivalent !== null && (
                              <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 block w-fit mt-1">
                                Setara {balEquivalent} Bal
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 block mt-1">Update: {stok.tanggal_update}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
>>>>>>> e7db4d333f2685ffba61a679a0f54226602f2786
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TRANSAKSI & PEMBAYARAN */}
        {/* ========================================================================= */}
        {activeTab === 'transaksi' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-maroon" />
                Daftar Transaksi Pesanan
              </h2>
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
                    <th className="py-3 px-3 text-center print:hidden">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(laporan?.orders || []).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        Belum ada data transaksi pesanan.
                      </td>
                    </tr>
                  ) : (
                    (laporan?.orders || []).map((order) => {
                      const payInfo = order.pembayaran?.[0];
                      const isPaid = payInfo?.status_pembayaran === 'lunas';

                      return (
                        <tr key={order.id_pesanan} className="hover:bg-gray-50/70">
                          <td className="py-3 px-3 font-mono font-bold text-gray-800">#{order.id_pesanan}</td>
                          <td className="py-3 px-3 text-gray-500">{order.tanggal_pesanan}</td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-gray-900 block">{order.pelanggan?.nama_lengkap || 'Pelanggan'}</span>
                            <span className="text-[10px] text-gray-400">{order.pelanggan?.no_telp || '-'}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-gray-800">{order.produk?.nama_produk}</span>
                            <span className="text-[11px] text-gray-500 block">
                              {order.jumlah} {order.produk?.satuan} &bull; {order.varian_rasa} ({order.ukuran_plastik})
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-brand-maroon">
                            Rp {Number(order.total_harga).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3">
                            {(() => {
                              const prod = order.produksi?.[0];
                              const hasPassedQC = Boolean(prod?.verifikasi && prod.verifikasi.some((v) => v.status === 'Lolos Verifikasi'));
                              if (order.status_pesanan === 'selesai') {
                                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Siap Diambil</span>;
                              }
                              if (prod?.status_produksi === 'sedang_dikemas' || hasPassedQC) {
                                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Dikemas</span>;
                              }
                              if (prod?.status_produksi === 'siap_diverifikasi') {
                                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">Menunggu QC</span>;
                              }
                              if (order.status_pesanan === 'diproses' || prod?.status_produksi === 'diproses') {
                                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">Digoreng</span>;
                              }
                              if (order.status_pesanan === 'dibatalkan') {
                                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-700">Dibatalkan</span>;
                              }
                              return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Menunggu</span>;
                            })()}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="uppercase font-bold text-[10px] text-gray-500 flex items-center gap-1">
                                {payInfo?.metode_pembayaran || 'Tunai'}
                              </span>

                              {isPaid ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Lunas
                                </span>
                              ) : payInfo?.metode_pembayaran === 'transfer' && payInfo?.bukti_transfer ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedTransferProof(order)}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Lihat Bukti</span>
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  Pending
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center print:hidden">
                            <div className="flex items-center justify-center gap-2">
                              {!isPaid && (
                                <button
                                  type="button"
                                  onClick={() => handleConfirmPayment(order.id_pesanan)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition active:scale-95"
                                >
                                  <Check className="w-3 h-3" />
                                  ACC Lunas
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setSelectedOrderToPrint(order)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-lg transition"
                              >
                                <Printer className="w-3 h-3" />
                                Resi
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: KATALOG PRODUK */}
        {/* ========================================================================= */}
        {activeTab === 'katalog' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-maroon" />
                  Katalog Master Produk Kerupuk
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowProductModal(true);
                  setActionState({ type: 'idle', message: null });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                + Tambah Produk Baru
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-y border-gray-100">
                  <tr>
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Nama Produk</th>
                    <th className="py-3 px-3">Satuan</th>
                    <th className="py-3 px-3">Harga Jual</th>
                    <th className="py-3 px-3">Kapasitas Stok</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Deskripsi</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(laporan?.produkList || []).map((prod) => (
                    <tr key={prod.id_produk} className="hover:bg-gray-50/70">
                      <td className="py-3 px-3 font-mono font-bold text-gray-800">#{prod.id_produk}</td>
                      <td className="py-3 px-3 font-bold text-gray-900">{prod.nama_produk}</td>
                      <td className="py-3 px-3 font-medium text-gray-700">{prod.satuan}</td>
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">
                        Rp {Number(prod.harga).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-gray-900">{prod.stok} {prod.satuan}</span>
                        <span className="text-[10px] text-gray-400 block font-mono">
                          (~{prod.stok * 5} Kg mentah)
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {prod.stok > 10 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Tersedia
                          </span>
                        ) : prod.stok > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Menipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                            Habis
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-gray-500 max-w-xs truncate">{prod.deskripsi || '-'}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductToRestock(prod);
                            setRestockBalQty(10);
                            setActionState({ type: 'idle', message: null });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          + Restock Bal
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: STOK BAHAN BAKU */}
        {/* ========================================================================= */}
        {activeTab === 'stok_bahan' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-maroon" />
                  Stok Bahan Baku & Kemasan
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari bahan..."
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon w-44 sm:w-56"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddStockModal(true);
                    setActionState({ type: 'idle', message: null });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  + Tambah Bahan
                </button>
              </div>
            </div>

            {/* Filter Kategori */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStockCategoryTab('semua')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  stockCategoryTab === 'semua'
                    ? 'bg-brand-maroon text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semua ({allStockList.length})
              </button>
              <button
                type="button"
                onClick={() => setStockCategoryTab('Bumbu')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  stockCategoryTab === 'Bumbu'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bumbu Tabur ({bumbuList.length})
              </button>
              <button
                type="button"
                onClick={() => setStockCategoryTab('Plastik')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  stockCategoryTab === 'Plastik'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Kemasan Plastik ({plastikList.length})
              </button>
              <button
                type="button"
                onClick={() => setStockCategoryTab('Kerupuk Mentah')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  stockCategoryTab === 'Kerupuk Mentah'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Kerupuk Mentah ({mentahList.length})
              </button>

              <button
                type="button"
                onClick={() => setStockStatusFilter(stockStatusFilter === 'menipis' ? 'semua' : 'menipis')}
                className={`ml-auto px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  stockStatusFilter === 'menipis'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Stok Menipis ({lowStockItems.length})</span>
              </button>
            </div>

            {/* Tabel Bahan */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-y border-gray-100">
                  <tr>
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Nama Bahan</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Jumlah Stok</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Terakhir Restock</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStocks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        Tidak ada data bahan yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    filteredStocks.map((stok) => {
                      const isMenipis = stok.jumlah <= 20;
                      const isHabis = stok.jumlah <= 0;

                      return (
                        <tr key={stok.id_stok} className={`hover:bg-gray-50/70 ${isMenipis ? 'bg-amber-50/20' : ''}`}>
                          <td className="py-3 px-3 font-mono font-bold text-gray-600">#{stok.id_stok}</td>
                          <td className="py-3 px-3 font-bold text-gray-900">{stok.nama_bahan}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                              {stok.kategori}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-gray-900">
                              {stok.jumlah} {stok.satuan}
                            </span>
                            {stok.kategori === 'Kerupuk Mentah' && (
                              <span className="text-[10px] text-gray-400 block font-mono">
                                (~{Math.floor(stok.jumlah / 5)} Bal)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {isHabis ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                                Habis
                              </span>
                            ) : isMenipis ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Menipis
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Aman
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-gray-500 font-mono text-[11px]">
                            {stok.tanggal_update || '-'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStockToRestock(stok);
                                  setStockRestockAmount(10);
                                  setActionState({ type: 'idle', message: null });
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg transition active:scale-95"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                Restock
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStockToEdit(stok);
                                  setEditStockNama(stok.nama_bahan);
                                  setEditStockKategori(stok.kategori as any);
                                  setEditStockSatuan(stok.satuan);
                                  setEditStockJumlah(stok.jumlah);
                                  setActionState({ type: 'idle', message: null });
                                }}
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStockToDelete(stok);
                                  setActionState({ type: 'idle', message: null });
                                }}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DATA PELANGGAN */}
        {/* ========================================================================= */}
        {activeTab === 'pelanggan' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-maroon" />
                Data Pelanggan Terdaftar
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-y border-gray-100">
                  <tr>
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Nama Lengkap</th>
                    <th className="py-3 px-3">No. Telepon / WA</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Alamat</th>
                    <th className="py-3 px-3">Jenis Kelamin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(laporan?.pelangganList || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        Belum ada pelanggan terdaftar.
                      </td>
                    </tr>
                  ) : (
                    (laporan?.pelangganList || []).map((p) => (
                      <tr key={p.id_pelanggan} className="hover:bg-gray-50/70">
                        <td className="py-3 px-3 font-mono font-bold text-gray-800">#{p.id_pelanggan}</td>
                        <td className="py-3 px-3 font-bold text-gray-900">{p.nama_lengkap}</td>
                        <td className="py-3 px-3 text-gray-700">{p.no_telp || '-'}</td>
                        <td className="py-3 px-3 text-gray-600">{p.email || '-'}</td>
                        <td className="py-3 px-3 text-gray-600">{p.alamat || '-'}</td>
                        <td className="py-3 px-3 text-gray-500">{p.jenis_kelamin || 'Laki-Laki'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: TAMBAH BAHAN BARU */}
        {/* ========================================================================= */}
        {showAddStockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="font-bold text-gray-900 text-base">Tambah Bahan Baku Baru</h3>
                <button onClick={() => setShowAddStockModal(false)} className="p-1 rounded-xl text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStockSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama Bahan / Kemasan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newStockNama}
                    onChange={(e) => setNewStockNama(e.target.value)}
                    placeholder="Contoh: Bumbu Rasa BBQ, Plastik Ukuran 1 kg"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newStockKategori}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setNewStockKategori(val);
                        if (val === 'Plastik') setNewStockSatuan('Pack');
                        else setNewStockSatuan('Kg');
                      }}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                    >
                      <option value="Bumbu">Bumbu Tabur</option>
                      <option value="Plastik">Plastik Kemasan</option>
                      <option value="Kerupuk Mentah">Kerupuk Mentah</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Satuan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newStockSatuan}
                      onChange={(e) => setNewStockSatuan(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                    >
                      <option value="Kg">Kg</option>
                      <option value="Pack">Pack</option>
                      <option value="Bal">Bal</option>
                      <option value="Pcs">Pcs</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Jumlah Stok ({newStockSatuan}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={newStockJumlah}
                    onChange={(e) => setNewStockJumlah(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddStockModal(false)}
                    className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionState.type === 'loading'}
                    className="py-2.5 px-4 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {actionState.type === 'loading' ? 'Menyimpan...' : 'Simpan Bahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: RESTOCK PASOKAN BAHAN */}
        {/* ========================================================================= */}
        {selectedStockToRestock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="font-bold text-gray-900 text-base">Restock Bahan Baku</h3>
                <button onClick={() => setSelectedStockToRestock(null)} className="p-1 rounded-xl text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRestockMaterialSubmit} className="space-y-4">
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs space-y-1.5 text-gray-800">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nama Bahan:</span>
                    <span className="font-bold text-gray-900">{selectedStockToRestock.nama_bahan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stok Saat Ini:</span>
                    <span className="font-mono font-bold text-brand-maroon">
                      {selectedStockToRestock.jumlah} {selectedStockToRestock.satuan}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-200 font-bold">
                    <span className="text-gray-700">Total Setelah Restock:</span>
                    <span className="font-mono text-emerald-700">
                      {selectedStockToRestock.jumlah + Number(stockRestockAmount || 0)} {selectedStockToRestock.satuan}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Jumlah Tambahan ({selectedStockToRestock.satuan}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={stockRestockAmount}
                    onChange={(e) => setStockRestockAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStockToRestock(null)}
                    className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionState.type === 'loading' || stockRestockAmount <= 0}
                    className="py-2.5 px-4 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {actionState.type === 'loading' ? 'Menyimpan...' : 'Konfirmasi Restock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: EDIT DATA STOK */}
        {/* ========================================================================= */}
        {selectedStockToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="font-bold text-gray-900 text-base">Edit Data Stok</h3>
                <button onClick={() => setSelectedStockToEdit(null)} className="p-1 rounded-xl text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditStockSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama Bahan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editStockNama}
                    onChange={(e) => setEditStockNama(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editStockKategori}
                      onChange={(e) => setEditStockKategori(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                    >
                      <option value="Bumbu">Bumbu Tabur</option>
                      <option value="Plastik">Plastik Kemasan</option>
                      <option value="Kerupuk Mentah">Kerupuk Mentah</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Satuan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editStockSatuan}
                      onChange={(e) => setEditStockSatuan(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Jumlah Stok ({editStockSatuan}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50000"
                    value={editStockJumlah}
                    onChange={(e) => setEditStockJumlah(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStockToEdit(null)}
                    className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionState.type === 'loading'}
                    className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {actionState.type === 'loading' ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 4: HAPUS ITEM STOK */}
        {/* ========================================================================= */}
        {selectedStockToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">Hapus Item Bahan?</h3>
              <p className="text-xs text-gray-500 mb-4">
                Hapus <strong>{selectedStockToDelete.nama_bahan}</strong> ({selectedStockToDelete.jumlah} {selectedStockToDelete.satuan}) dari database stok?
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStockToDelete(null)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteStockSubmit}
                  disabled={actionState.type === 'loading'}
                  className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
                >
                  {actionState.type === 'loading' ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 5: TAMBAH PRODUK KATALOG */}
        {/* ========================================================================= */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="font-bold text-gray-900 text-base">Tambah Produk Kerupuk</h3>
                <button onClick={() => setShowProductModal(false)} className="p-1 rounded-xl text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={namaProduk}
                    onChange={(e) => {
                      setNamaProduk(e.target.value);
                      if (productErrors.nama_produk) {
                        setProductErrors((prev) => {
                          const n = { ...prev };
                          delete n.nama_produk;
                          return n;
                        });
                      }
                    }}
                    placeholder="Contoh: Kerupuk Seblak Pedas"
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 ${
                      productErrors.nama_produk
                        ? 'border-red-400 focus:ring-red-400 bg-red-50/40 text-red-900'
                        : 'border-gray-200 focus:ring-brand-maroon'
                    }`}
                    required
                  />
                  {productErrors.nama_produk && (
                    <div className="flex items-center gap-1.5 p-2.5 mt-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{productErrors.nama_produk}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Satuan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={satuanProduk}
                      onChange={(e) => setSatuanProduk(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                    >
                      <option value="Bal">Bal</option>
                      <option value="Kg">Kg</option>
                      <option value="Pack">Pack</option>
                      <option value="Bungkus">Bungkus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Harga Jual (Rp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      value={hargaProduk}
                      onChange={(e) => setHargaProduk(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Stok Awal ({satuanProduk}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stokProduk}
                    onChange={(e) => setStokProduk(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                    required
                  />
                </div>

<<<<<<< HEAD
=======
                
                {/* 4. Unggah Foto / Gambar Produk */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Foto Produk Kerupuk (Opsional)
                  </label>

                  {gambarProduk ? (
                    <div className="p-3 border border-amber-300 bg-amber-50/70 rounded-2xl flex items-center gap-3">
                      <img
                        src={gambarProduk}
                        alt="Preview Produk"
                        className="w-16 h-16 rounded-xl object-cover border border-amber-300 shadow-sm shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">Foto kerupuk terpasang</p>
                        <p className="text-[10px] text-gray-500">Akan tampil di katalog pelanggan & owner</p>
                        <button
                          type="button"
                          onClick={() => setGambarProduk('')}
                          className="mt-1 text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus / Ganti Foto
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="border-2 border-dashed border-gray-300 hover:border-brand-maroon hover:bg-orange-50/40 rounded-2xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition text-center group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-1 group-hover:scale-105 transition shadow-sm">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-700 group-hover:text-brand-maroon">
                          + Unggah Foto Kerupuk
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          Format JPG, PNG, WebP dari HP atau Komputer
                        </span>
                      </label>
                      <input
                        type="url"
                        value={gambarProduk}
                        onChange={(e) => setGambarProduk(e.target.value)}
                        placeholder="Atau tempel link URL foto: https://..."
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                      />
                    </div>
                  )}
                </div>

                {/* 5. Deskripsi */}
>>>>>>> e7db4d333f2685ffba61a679a0f54226602f2786
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Deskripsi (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={deskripsiProduk}
                    onChange={(e) => setDeskripsiProduk(e.target.value)}
                    placeholder="Keterangan rasa, tekstur kerupuk..."
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionState.type === 'loading'}
                    className="py-2.5 px-4 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {actionState.type === 'loading' ? 'Menyimpan...' : 'Simpan Produk'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

<<<<<<< HEAD
        {/* ========================================================================= */}
        {/* MODAL 6: RESTOCK PRODUK BAL */}
        {/* ========================================================================= */}
=======
        {/* MODAL EDIT DATA & FOTO PRODUK (CRUD UPDATE) */}
        {showEditProductModal && selectedProductToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Edit3 className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Edit Data & Foto Produk</h3>
                    <p className="text-[11px] text-gray-400">ID #{selectedProductToEdit.id_produk} &bull; Katalog Pabrik Kerupuk</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditProductModal(false);
                    setSelectedProductToEdit(null);
                  }}
                  className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditProductSubmit} className="space-y-4">
                {/* Nama Produk */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama Kerupuk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                    required
                  />
                </div>

                {/* Satuan Kemasan & Harga Jual */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Satuan Kemasan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editSatuan}
                      onChange={(e) => setEditSatuan(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                    >
                      <option value="Bal">Bal</option>
                      <option value="Kg">Kg</option>
                      <option value="Pack">Pack</option>
                      <option value="Bungkus">Bungkus</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Harga Jual (Rp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1000"
                      step="500"
                      value={editHarga}
                      onChange={(e) => setEditHarga(parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                      required
                    />
                  </div>
                </div>

                {/* Upload / Ganti Foto Produk */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Foto Produk Kerupuk
                  </label>

                  {editGambar ? (
                    <div className="p-3 border border-blue-200 bg-blue-50/50 rounded-2xl flex items-center gap-3">
                      <img
                        src={editGambar}
                        alt="Preview Edit Produk"
                        className="w-16 h-16 rounded-xl object-cover border border-blue-200 shadow-sm shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">Foto kerupuk terpasang</p>
                        <p className="text-[10px] text-gray-500">Tampil di dashboard pelanggan & owner</p>
                        <button
                          type="button"
                          onClick={() => setEditGambar('')}
                          className="mt-1 text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus / Kosongkan Foto
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="border-2 border-dashed border-gray-300 hover:border-brand-maroon hover:bg-orange-50/40 rounded-2xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition text-center group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageUpload}
                          className="hidden"
                        />
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-1 group-hover:scale-105 transition shadow-sm">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-700 group-hover:text-brand-maroon">
                          + Unggah Foto Kerupuk Baru
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          Format JPG, PNG, WebP dari HP atau Komputer
                        </span>
                      </label>
                      <input
                        type="url"
                        value={editGambar}
                        onChange={(e) => setEditGambar(e.target.value)}
                        placeholder="Atau tempel link URL foto: https://..."
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                      />
                    </div>
                  )}
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Deskripsi Singkat
                  </label>
                  <textarea
                    rows={2}
                    value={editDeskripsi}
                    onChange={(e) => setEditDeskripsi(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                    placeholder="Keunggulan rasa, renyah, tekstur..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditProductModal(false);
                      setSelectedProductToEdit(null);
                    }}
                    className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionState.type === 'loading'}
                    className="py-3 px-4 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold rounded-2xl shadow-md transition disabled:opacity-50"
                  >
                    {actionState.type === 'loading' ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL RESTOCK PASOKAN SUPPLIER OLEH OWNER */}
>>>>>>> e7db4d333f2685ffba61a679a0f54226602f2786
        {selectedProductToRestock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="font-bold text-gray-900 text-base">Restock Produk Kerupuk</h3>
                <button onClick={() => setSelectedProductToRestock(null)} className="p-1 rounded-xl text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRestockSubmit} className="space-y-4">
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs space-y-1.5 text-gray-800">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nama Produk:</span>
                    <span className="font-bold text-gray-900">{selectedProductToRestock.nama_produk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stok Saat Ini:</span>
                    <span className="font-mono font-bold text-brand-maroon">
                      {selectedProductToRestock.stok} {selectedProductToRestock.satuan}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-200 font-bold">
                    <span className="text-gray-700">Total Setelah Restock:</span>
                    <span className="font-mono text-emerald-700">
                      {selectedProductToRestock.stok + Number(restockBalQty || 0)} {selectedProductToRestock.satuan}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Jumlah Tambahan ({selectedProductToRestock.satuan}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={restockBalQty}
                    onChange={(e) => setRestockBalQty(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProductToRestock(null)}
                    className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionState.type === 'loading' || restockBalQty <= 0}
                    className="py-2.5 px-4 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {actionState.type === 'loading' ? 'Menyimpan...' : 'Konfirmasi Restock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
<<<<<<< HEAD

        {/* ========================================================================= */}
        {/* MODAL 7: CETAK RESI RESMI */}
        {/* ========================================================================= */}
        {selectedOrderToPrint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative print:p-0 print:border-none print:shadow-none">
              <button
                onClick={() => setSelectedOrderToPrint(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition print:hidden"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center pb-4 border-b border-dashed border-gray-300">
                <div className="w-12 h-12 rounded-2xl bg-brand-maroon text-amber-300 font-black text-xl mx-auto flex items-center justify-center mb-2 shadow">
                  KD
                </div>
                <h3 className="font-black text-gray-900 text-lg uppercase tracking-wide">Pabrik Kerupuk Diansyah</h3>
                <p className="text-[11px] text-gray-500">Jl. Pangeran Kornel No. 204, Pasanggrahan Baru, Sumedang</p>
                <div className="mt-2 inline-block px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  RESI PEMBAYARAN
                </div>
              </div>

              <div className="py-4 space-y-2 text-xs border-b border-dashed border-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">No. Transaksi:</span>
                  <span className="font-mono font-bold text-gray-800">TRX-KD-{selectedOrderToPrint.id_pesanan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tanggal:</span>
                  <span className="font-medium text-gray-800">{selectedOrderToPrint.tanggal_pesanan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pelanggan:</span>
                  <span className="font-bold text-gray-800">{selectedOrderToPrint.pelanggan?.nama_lengkap || 'Pelanggan'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">No. Telp:</span>
                  <span className="font-medium text-gray-800">{selectedOrderToPrint.pelanggan?.no_telp || '-'}</span>
                </div>
              </div>

              <div className="py-4 space-y-2 text-xs border-b border-dashed border-gray-300">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>{selectedOrderToPrint.produk?.nama_produk} ({selectedOrderToPrint.varian_rasa})</span>
                  <span>{selectedOrderToPrint.jumlah} {selectedOrderToPrint.produk?.satuan}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>Ukuran Kemasan: {selectedOrderToPrint.ukuran_plastik}</span>
                  <span>Metode: <strong className="uppercase">{selectedOrderToPrint.pembayaran?.[0]?.metode_pembayaran || 'Tunai'}</strong></span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-black text-brand-maroon">
                  <span>TOTAL:</span>
                  <span>Rp {Number(selectedOrderToPrint.total_harga).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="py-3 text-center">
                <p className="text-[11px] text-gray-600 font-bold">
                  Status: <span className="text-emerald-600">LUNAS</span>
                </p>
              </div>

              <div className="mt-4 flex gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow transition active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Resi
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderToPrint(null)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 8: VERIFIKASI BUKTI TRANSFER */}
        {/* ========================================================================= */}
=======
        {/* MODAL VERIFIKASI BUKTI TRANSFER BANK PELANGGAN OLEH OWNER */}
>>>>>>> e7db4d333f2685ffba61a679a0f54226602f2786
        {selectedTransferProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative max-h-[92vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setSelectedTransferProof(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Bukti Transfer Bank</h3>
                  <p className="text-xs text-gray-400">
                    Pesanan #{selectedTransferProof.id_pesanan} &bull; {selectedTransferProof.pelanggan?.nama_lengkap || 'Pelanggan'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs mb-4">
                <div>
                  <span className="text-gray-400 block text-[10px]">TOTAL TAGIHAN:</span>
                  <span className="font-mono font-black text-brand-maroon text-sm">
                    Rp {Number(selectedTransferProof.total_harga).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block text-[10px]">STATUS:</span>
                  <span className={`font-bold ${selectedTransferProof.pembayaran?.[0]?.status_pembayaran === 'lunas' ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {selectedTransferProof.pembayaran?.[0]?.status_pembayaran === 'lunas' ? 'LUNAS' : 'MENUNGGU ACC'}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-100 p-2 overflow-hidden flex items-center justify-center max-h-[55vh]">
                {selectedTransferProof.pembayaran?.[0]?.bukti_transfer ? (
                  <img
                    src={selectedTransferProof.pembayaran[0].bukti_transfer}
                    alt="Bukti Transfer"
                    className="max-h-[50vh] object-contain rounded-xl shadow-sm"
                  />
                ) : (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    Belum ada gambar bukti transfer.
                  </div>
                )}
              </div>

              <div className="mt-5 flex gap-2 pt-2 border-t border-gray-100">
                {selectedTransferProof.pembayaran?.[0]?.status_pembayaran !== 'lunas' && (
                  <button
                    type="button"
                    onClick={async () => {
                      await handleConfirmPayment(selectedTransferProof.id_pesanan);
                      setSelectedTransferProof(null);
                    }}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>ACC Lunas</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedTransferProof(null)}
                  className="py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 9: BUKTI QRIS */}
        {/* ========================================================================= */}
        {selectedQrisProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 relative text-center">
              <button
                type="button"
                onClick={() => setSelectedQrisProof(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 font-bold">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Rincian Pembayaran QRIS</h3>
              <p className="text-xs text-gray-400 mb-4">Pesanan #{selectedQrisProof.id_pesanan}</p>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs text-left space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Merchant:</span>
                  <span className="font-bold text-gray-900">Pabrik Kerupuk Diansyah</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Tagihan:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    Rp {Number(selectedQrisProof.total_harga).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-bold text-emerald-600">LUNAS</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedQrisProof(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
<<<<<<< HEAD
        {/* MODAL 10: CETAK LAPORAN KEUANGAN */}
        {/* ========================================================================= */}
        {showFinancialReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
              <div className="text-center pb-4 border-b-2 border-gray-800 mb-4">
                <h3 className="font-black text-xl text-gray-900 uppercase tracking-wider">
                  LAPORAN KEUANGAN & PENJUALAN
                </h3>
                <h4 className="font-bold text-brand-maroon text-sm uppercase">Pabrik Kerupuk Diansyah Sumedang</h4>
              </div>

              <div className="grid grid-cols-2 text-xs py-2 mb-4 border-b border-gray-200">
                <div>
                  <span className="text-gray-500">Tanggal:</span>
                  <p className="font-bold text-gray-900">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-500">Penanggung Jawab:</span>
                  <p className="font-bold text-gray-900">Bapak Diansyah (Owner)</p>
                </div>
              </div>

              <div className="space-y-3 text-xs mb-6">
                <h4 className="font-bold text-gray-900 text-sm border-l-4 border-brand-maroon pl-2">
                  I. Rekapitulasi Neraca Keuangan
                </h4>
                <table className="w-full text-xs border border-gray-300 rounded-lg overflow-hidden">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-gray-100 font-bold">
                      <td className="py-2.5 px-3">Komponen</td>
                      <td className="py-2.5 px-3 text-right">Nominal (Rp)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-gray-800">1. Total Omset Penjualan</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">Rp {(laporan?.totalOmset || 0).toLocaleString('id-ID')}</td>
                    </tr>
                    <tr className="bg-emerald-50/50">
                      <td className="py-2.5 px-3 font-semibold text-emerald-900">2. Kas Diterima (Lunas)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">Rp {(laporan?.totalKasMasuk || 0).toLocaleString('id-ID')}</td>
                    </tr>
                    <tr className="bg-amber-50/50">
                      <td className="py-2.5 px-3 font-semibold text-amber-900">3. Piutang Pelanggan</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-800">Rp {(laporan?.totalPiutang || 0).toLocaleString('id-ID')}</td>
                    </tr>
                    <tr className="bg-rose-50/50">
                      <td className="py-2.5 px-3 font-semibold text-rose-900">4. Estimasi Biaya Produksi / HPP (~70%)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">- Rp {(laporan?.estimasiHPP || Math.round((laporan?.totalOmset || 0) * 0.7)).toLocaleString('id-ID')}</td>
                    </tr>
                    <tr className="bg-gray-100 font-black text-sm">
                      <td className="py-3 px-3 text-brand-darkmaroon">5. ESTIMASI LABA BERSIH (~30%)</td>
                      <td className="py-3 px-3 text-right font-mono text-brand-maroon">Rp {(laporan?.estimasiKeuntungan || 0).toLocaleString('id-ID')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
=======
        {/* MODAL CETAK DOKUMEN RESMI LAPORAN KEUANGAN PABRIK (HARIAN / BULANAN / TAHUNAN) */}
        {/* ========================================================================= */}
        {showFinancialReportModal && (() => {
          const NAMA_BULAN = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
          ];

          const validOrders = (laporan?.orders || []).filter((o) => o.status_pesanan !== 'dibatalkan');

          // Filter order sesuai periode
          const filteredOrders = validOrders.filter((o) => {
            const raw = o.tanggal_pesanan || o.created_at || '';
            if (!raw) return false;
            const dateStr = raw.slice(0, 10);
            if (printPeriod === 'harian') {
              return dateStr === printDate;
            }
            if (printPeriod === 'bulanan') {
              const prefix = `${printYear}-${String(printMonth).padStart(2, '0')}`;
              return dateStr.startsWith(prefix);
            }
            if (printPeriod === 'tahunan') {
              return dateStr.startsWith(String(printYear));
            }
            return true;
          });

          const pOmset = filteredOrders.reduce((sum, o) => sum + (Number(o.total_harga) || 0), 0);
          const pLunas = filteredOrders
            .filter((o) => o.pembayaran?.[0]?.status_pembayaran === 'lunas')
            .reduce((sum, o) => sum + (Number(o.total_harga) || 0), 0);
          const pPiutang = filteredOrders
            .filter((o) => o.pembayaran?.[0]?.status_pembayaran !== 'lunas')
            .reduce((sum, o) => sum + (Number(o.total_harga) || 0), 0);
          const pHPP = Math.round(pOmset * 0.7);
          const pLaba = Math.round(pOmset * 0.3);

          // Rincian produk dalam periode
          const prodMap: Record<string, { nama: string; satuan: string; jumlah: number; total: number }> = {};
          filteredOrders.forEach((o) => {
            const nama = o.produk?.nama_produk || 'Kerupuk Lainnya';
            const satuan = o.produk?.satuan || 'Bal';
            if (!prodMap[nama]) {
              prodMap[nama] = { nama, satuan, jumlah: 0, total: 0 };
            }
            prodMap[nama].jumlah += Number(o.jumlah) || 0;
            prodMap[nama].total += Number(o.total_harga) || 0;
          });
          const prodBreakdown = Object.values(prodMap).sort((a, b) => b.total - a.total);

          // Rincian 12 Bulan (untuk Tahunan)
          const monthlyBreakdown = printPeriod === 'tahunan' ? Array.from({ length: 12 }, (_, i) => {
            const mNum = i + 1;
            const prefix = `${printYear}-${String(mNum).padStart(2, '0')}`;
            const mOrders = validOrders.filter((o) => (o.tanggal_pesanan || o.created_at || '').startsWith(prefix));
            const mOmset = mOrders.reduce((s, o) => s + (Number(o.total_harga) || 0), 0);
            const mLunas = mOrders.filter((o) => o.pembayaran?.[0]?.status_pembayaran === 'lunas').reduce((s, o) => s + (Number(o.total_harga) || 0), 0);
            return {
              bulan: NAMA_BULAN[i],
              omset: mOmset,
              lunas: mLunas,
              transaksi: mOrders.length,
            };
          }) : [];

          // Format judul & periode
          let judulDokumen = 'DOKUMEN RESMI: LAPORAN PENJUALAN & KEUANGAN HARIAN';
          let labelPeriode = `Hari / Tanggal: ${printDate ? new Date(printDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}`;
          if (printPeriod === 'bulanan') {
            judulDokumen = 'DOKUMEN RESMI: LAPORAN PENJUALAN & KEUANGAN BULANAN';
            labelPeriode = `Periode Bulan: ${NAMA_BULAN[printMonth - 1]} ${printYear}`;
          } else if (printPeriod === 'tahunan') {
            judulDokumen = 'DOKUMEN RESMI: LAPORAN KEUANGAN & LABA RUGI TAHUNAN';
            labelPeriode = `Tahun Buku: ${printYear}`;
          }

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn print:static print:p-0 print:bg-white print:m-0">
              <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[94vh] overflow-y-auto relative print:p-0 print:border-none print:shadow-none print:max-w-full print:max-h-none print:overflow-visible">
                
                {/* Header Kontrol Pilihan Laporan (Hanya tampil di layar, disembunyikan saat dicetak) */}
                <div className="print:hidden pb-5 mb-5 border-b border-gray-100">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <Printer className="w-5 h-5 text-brand-maroon" />
                        Pilihan Periode Cetak Dokumen Laporan
                      </h3>
                      <p className="text-xs text-gray-500">
                        Pilih jenis laporan yang ingin dicetak ke PDF / kertas (Harian, Bulanan, atau Tahunan)
                      </p>
                    </div>
                    <button
                      onClick={() => setShowFinancialReportModal(false)}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 3 Tab Opsi: Harian, Bulanan, Tahunan */}
                  <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100 rounded-2xl mb-4">
                    <button
                      type="button"
                      onClick={() => setPrintPeriod('harian')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        printPeriod === 'harian'
                          ? 'bg-brand-maroon text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>📅 Laporan Harian</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintPeriod('bulanan')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        printPeriod === 'bulanan'
                          ? 'bg-brand-maroon text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>📆 Laporan Bulanan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintPeriod('tahunan')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        printPeriod === 'tahunan'
                          ? 'bg-brand-maroon text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>📊 Laporan Tahunan</span>
                    </button>
                  </div>

                  {/* Filter Pemilihan Tanggal / Bulan / Tahun */}
                  <div className="flex flex-wrap items-center gap-3 p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900">
                    {printPeriod === 'harian' && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold">Pilih Tanggal:</span>
                        <input
                          type="date"
                          value={printDate}
                          onChange={(e) => setPrintDate(e.target.value)}
                          className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                        />
                      </div>
                    )}

                    {printPeriod === 'bulanan' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold">Pilih Bulan & Tahun:</span>
                        <select
                          value={printMonth}
                          onChange={(e) => setPrintMonth(Number(e.target.value))}
                          className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                        >
                          {NAMA_BULAN.map((m, idx) => (
                            <option key={idx} value={idx + 1}>{m}</option>
                          ))}
                        </select>
                        <select
                          value={printYear}
                          onChange={(e) => setPrintYear(Number(e.target.value))}
                          className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                        >
                          <option value={2024}>2024</option>
                          <option value={2025}>2025</option>
                          <option value={2026}>2026</option>
                          <option value={2027}>2027</option>
                        </select>
                      </div>
                    )}

                    {printPeriod === 'tahunan' && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold">Pilih Tahun Pembukuan:</span>
                        <select
                          value={printYear}
                          onChange={(e) => setPrintYear(Number(e.target.value))}
                          className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-brand-maroon"
                        >
                          <option value={2024}>2024</option>
                          <option value={2025}>2025</option>
                          <option value={2026}>2026</option>
                          <option value={2027}>2027</option>
                        </select>
                      </div>
                    )}

                    <span className="ml-auto text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200">
                      Tercatat: {filteredOrders.length} Pesanan Sah
                    </span>
                  </div>
                </div>

                {/* ============================================================= */}
                {/* DOKUMEN CETAK RESMI (AKAN MUNCUL DI PRINT / PDF) */}
                {/* ============================================================= */}
                <div className="printable-report space-y-5">
                  {/* KOP RESMI LAPORAN PABRIK KERUPUK DIANSYAH */}
                  <div className="text-center pb-4 border-b-2 border-gray-900">
                    <div className="flex items-center justify-center gap-3 mb-1">
                      <div className="w-12 h-12 rounded-2xl bg-brand-maroon text-amber-300 font-black text-2xl flex items-center justify-center shadow">
                        KD
                      </div>
                      <div className="text-left">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Pabrik Kerupuk Diansyah</h2>
                        <p className="text-xs text-gray-600 font-medium">Spesialis Kerupuk Gurih & Renyah Berkualitas Tinggi &bull; Goreng Dadakan</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Jl. Pangeran Kornel No. 204, Pasanggrahan Baru, Sumedang &bull; Telp / WA: 0895-2578-3995
                    </p>
                    <div className="mt-2.5 inline-block px-4 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-900 border border-gray-400 tracking-wider uppercase">
                      {judulDokumen}
                    </div>
                  </div>

                  {/* Info Dokumen */}
                  <div className="grid grid-cols-2 text-xs py-2 border-b border-gray-200">
                    <div>
                      <span className="text-gray-500 block text-[11px]">Cakupan Periode:</span>
                      <p className="font-bold text-gray-900 text-sm">{labelPeriode}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 block text-[11px]">Pimpinan / Penanggung Jawab:</span>
                      <p className="font-bold text-gray-900 text-sm">Bapak Diansyah (Owner)</p>
                    </div>
                  </div>
>>>>>>> e7db4d333f2685ffba61a679a0f54226602f2786

                  {/* Tabel I: Rekapitulasi Neraca Keuangan Periode Tersebut */}
                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-l-4 border-brand-maroon pl-2">
                      I. Rekapitulasi Neraca & Arus Kas {printPeriod === 'harian' ? 'Harian' : printPeriod === 'bulanan' ? 'Bulanan' : 'Tahunan'}
                    </h4>
                    <table className="w-full text-xs border border-gray-300 rounded-lg overflow-hidden">
                      <tbody className="divide-y divide-gray-200">
                        <tr className="bg-gray-100 font-bold">
                          <td className="py-2 px-3">Komponen Keuangan Operasional</td>
                          <td className="py-2 px-3 text-right">Nominal (Rupiah)</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-semibold text-gray-800">1. Total Omset Penjualan (Gross Revenue)</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-gray-900">Rp {pOmset.toLocaleString('id-ID')}</td>
                        </tr>
                        <tr className="bg-emerald-50/50">
                          <td className="py-2 px-3 font-semibold text-emerald-900">2. Realisasi Kas Masuk (Lunas Di-ACC)</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">Rp {pLunas.toLocaleString('id-ID')}</td>
                        </tr>
                        <tr className="bg-amber-50/50">
                          <td className="py-2 px-3 font-semibold text-amber-900">3. Piutang Pelanggan (Menunggu Pembayaran)</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-amber-800">Rp {pPiutang.toLocaleString('id-ID')}</td>
                        </tr>
                        <tr className="bg-rose-50/50">
                          <td className="py-2 px-3 font-semibold text-rose-900">4. Estimasi Biaya Pokok Produksi / HPP (~70%)</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-rose-700">- Rp {pHPP.toLocaleString('id-ID')}</td>
                        </tr>
                        <tr className="bg-gray-100 font-black text-xs">
                          <td className="py-2.5 px-3 text-brand-darkmaroon">5. ESTIMASI LABA BERSIH OPERASIONAL (~30%)</td>
                          <td className="py-2.5 px-3 text-right font-mono text-brand-maroon">Rp {pLaba.toLocaleString('id-ID')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

<<<<<<< HEAD
              <div className="pt-6 border-t border-gray-200 flex justify-between items-end text-xs">
                <div className="text-gray-400 text-[10px]">
                  Dicetak dari Sistem E-KRUPSY
                </div>
                <div className="text-center w-56">
                  <p className="text-gray-600 mb-14">
                    Sumedang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
                    <strong>Owner / Pimpinan Pabrik</strong>
                  </p>
                  <p className="font-bold text-gray-900 border-t border-gray-800 pt-1">
                    Bapak Diansyah
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Dokumen
                </button>
                <button
                  type="button"
                  onClick={() => setShowFinancialReportModal(false)}
                  className="py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition"
                >
                  Tutup
                </button>
              </div>
            </div>
=======
                  {/* Tabel II: Rincian Varian Produk Terjual */}
                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-l-4 border-brand-maroon pl-2">
                      II. Rincian Penjualan per Varian Kerupuk ({labelPeriode})
                    </h4>
                    {prodBreakdown.length === 0 ? (
                      <p className="text-gray-400 italic text-[11px] p-2 bg-gray-50 rounded-lg">
                        Tidak ada penjualan produk kerupuk tercatat pada periode ini.
                      </p>
                    ) : (
                      <table className="w-full text-xs border border-gray-300">
                        <thead className="bg-gray-100 font-bold">
                          <tr>
                            <th className="py-1.5 px-2 text-center w-10">No</th>
                            <th className="py-1.5 px-3 text-left">Nama Produk Kerupuk</th>
                            <th className="py-1.5 px-3 text-center">Volume</th>
                            <th className="py-1.5 px-3 text-right">Total Penjualan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {prodBreakdown.map((p, idx) => (
                            <tr key={idx}>
                              <td className="py-1.5 px-2 text-center font-mono">{idx + 1}</td>
                              <td className="py-1.5 px-3 font-medium">{p.nama}</td>
                              <td className="py-1.5 px-3 text-center">{p.jumlah} {p.satuan}</td>
                              <td className="py-1.5 px-3 text-right font-mono font-bold">Rp {p.total.toLocaleString('id-ID')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Tabel III Khusus Harian: Daftar Transaksi Masuk Hari Ini */}
                  {printPeriod === 'harian' && (
                    <div className="space-y-2 text-xs">
                      <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-l-4 border-brand-maroon pl-2">
                        III. Rincian Transaksi Pesanan Masuk ({labelPeriode})
                      </h4>
                      {filteredOrders.length === 0 ? (
                        <p className="text-gray-400 italic text-[11px] p-2 bg-gray-50 rounded-lg">
                          Tidak ada pesanan pelanggan tercatat pada tanggal ini.
                        </p>
                      ) : (
                        <table className="w-full text-[11px] border border-gray-300">
                          <thead className="bg-gray-100 font-bold">
                            <tr>
                              <th className="py-1.5 px-2 text-center w-8">No</th>
                              <th className="py-1.5 px-2 text-center">ID</th>
                              <th className="py-1.5 px-2 text-left">Pelanggan</th>
                              <th className="py-1.5 px-2 text-left">Produk</th>
                              <th className="py-1.5 px-2 text-center">Qty</th>
                              <th className="py-1.5 px-2 text-right">Total</th>
                              <th className="py-1.5 px-2 text-center">Metode</th>
                              <th className="py-1.5 px-2 text-center">Status Bayar</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredOrders.map((o, idx) => {
                              const payStatus = o.pembayaran?.[0]?.status_pembayaran === 'lunas' ? 'LUNAS' : 'PENDING';
                              return (
                                <tr key={o.id_pesanan}>
                                  <td className="py-1 px-2 text-center font-mono">{idx + 1}</td>
                                  <td className="py-1 px-2 text-center font-mono">#{o.id_pesanan}</td>
                                  <td className="py-1 px-2 font-medium truncate max-w-[120px]">{o.pelanggan?.nama_lengkap || '-'}</td>
                                  <td className="py-1 px-2 truncate max-w-[130px]">{o.produk?.nama_produk} ({o.varian_rasa})</td>
                                  <td className="py-1 px-2 text-center">{o.jumlah} {o.produk?.satuan || 'Bal'}</td>
                                  <td className="py-1 px-2 text-right font-mono font-bold">Rp {Number(o.total_harga).toLocaleString('id-ID')}</td>
                                  <td className="py-1 px-2 text-center uppercase text-[10px]">{o.pembayaran?.[0]?.metode_pembayaran || 'tunai'}</td>
                                  <td className="py-1 px-2 text-center font-bold text-[10px]">{payStatus}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {/* Tabel III Khusus Tahunan: Rekapitulasi 12 Bulan */}
                  {printPeriod === 'tahunan' && (
                    <div className="space-y-2 text-xs">
                      <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-l-4 border-brand-maroon pl-2">
                        III. Rekapitulasi Performa Bulanan (Januari s.d. Desember {printYear})
                      </h4>
                      <table className="w-full text-xs border border-gray-300">
                        <thead className="bg-gray-100 font-bold">
                          <tr>
                            <th className="py-1.5 px-2 text-center w-8">No</th>
                            <th className="py-1.5 px-3 text-left">Bulan</th>
                            <th className="py-1.5 px-3 text-center">Transaksi</th>
                            <th className="py-1.5 px-3 text-right">Kas Lunas</th>
                            <th className="py-1.5 px-3 text-right">Total Omset</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {monthlyBreakdown.map((mb, idx) => (
                            <tr key={idx} className={mb.omset > 0 ? 'bg-amber-50/20' : ''}>
                              <td className="py-1.5 px-2 text-center font-mono">{idx + 1}</td>
                              <td className="py-1.5 px-3 font-semibold">{mb.bulan}</td>
                              <td className="py-1.5 px-3 text-center font-mono">{mb.transaksi}</td>
                              <td className="py-1.5 px-3 text-right font-mono">Rp {mb.lunas.toLocaleString('id-ID')}</td>
                              <td className="py-1.5 px-3 text-right font-mono font-bold">Rp {mb.omset.toLocaleString('id-ID')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Lembar Tanda Tangan Resmi */}
                  <div className="pt-6 border-t border-gray-300 flex justify-between items-end text-xs">
                    <div className="text-gray-400 text-[10px]">
                      Dicetak otomatis via Sistem Informasi E-KRUPSY &bull; {new Date().toLocaleString('id-ID')}
                    </div>
                    <div className="text-center w-56">
                      <p className="text-gray-600 mb-12">
                        Sumedang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
                        <strong>Owner / Pimpinan Pabrik</strong>
                      </p>
                      <p className="font-bold text-gray-900 border-t border-gray-900 pt-1">
                        Bapak Diansyah
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tombol Cetak / Tutup Bawah */}
                <div className="mt-6 flex gap-3 print:hidden">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 py-3 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    Cetak Dokumen Sekarang (PDF / Print)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFinancialReportModal(false)}
                    className="py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* MODAL VERIFIKASI BUKTI TRANSFER BANK PELANGGAN OLEH OWNER */}
        {selectedTransferProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative max-h-[92vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setSelectedTransferProof(null)}
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
                    Pesanan #{selectedTransferProof.id_pesanan} &bull; {selectedTransferProof.pelanggan?.nama_lengkap || 'Pelanggan'}
                  </p>
                </div>
              </div>

              {/* Rincian Transaksi */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs mb-4">
                <div>
                  <span className="text-gray-400 block text-[10px]">TOTAL YANG HARUS DITRANSFER:</span>
                  <span className="font-mono font-black text-brand-maroon text-sm">
                    Rp {Number(selectedTransferProof.total_harga).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block text-[10px]">STATUS SAAT INI:</span>
                  <span className={`font-bold ${selectedTransferProof.pembayaran?.[0]?.status_pembayaran === 'lunas' ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {selectedTransferProof.pembayaran?.[0]?.status_pembayaran === 'lunas' ? '✓ LUNAS' : 'MENUNGGU ACC'}
                  </span>
                </div>
              </div>

              {/* Gambar Bukti Screenshot Transfer */}
              <div className="rounded-2xl border border-gray-200 bg-gray-100 p-2 overflow-hidden flex items-center justify-center max-h-[55vh]">
                {selectedTransferProof.pembayaran?.[0]?.bukti_transfer ? (
                  <img
                    src={selectedTransferProof.pembayaran[0].bukti_transfer}
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
                {selectedTransferProof.pembayaran?.[0]?.status_pembayaran !== 'lunas' && (
                  <button
                    type="button"
                    onClick={async () => {
                      await handleConfirmPayment(selectedTransferProof.id_pesanan);
                      setSelectedTransferProof(null);
                    }}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>✓ ACC Lunas (Bukti Transfer Sah)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedTransferProof(null)}
                  className="py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  Tutup
                </button>
              </div>
            </div>
>>>>>>> e7db4d333f2685ffba61a679a0f54226602f2786
          </div>
        )}
      </div>
          {/* MODAL CETAK RESI RESMI OLEH OWNER UNTUK DIKASIH KE PELANGGAN (UC-13) */}
      {selectedOrderToPrint && (
        <>
          {/* TAMPILAN 1: MODAL POPUP DI LAYAR DASHBOARD (PERSIS GAMBAR 2) */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn print:hidden">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
              <button
                type="button"
                onClick={() => setSelectedOrderToPrint(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Resi Pabrik */}
              <div className="text-center pb-4 border-b border-dashed border-gray-300">
                <div className="w-12 h-12 rounded-2xl bg-brand-maroon text-amber-300 font-black text-xl mx-auto flex items-center justify-center mb-2 shadow">
                  KD
                </div>
                <h3 className="font-black text-gray-900 text-lg uppercase tracking-wide">Pabrik Kerupuk Diansyah</h3>
                <p className="text-[11px] text-gray-500">Jl. Pangeran Kornel No. 204, Pasanggrahan Baru, Sumedang</p>
                <div className="mt-2 inline-block px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  RESI RESMI PEMBAYARAN SAH
                </div>
              </div>

              {/* Rincian Transaksi */}
              <div className="py-4 space-y-2 text-xs border-b border-dashed border-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nomor Transaksi:</span>
                  <span className="font-mono font-bold text-gray-800">TRX-KD-{selectedOrderToPrint.id_pesanan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tanggal:</span>
                  <span className="font-medium text-gray-800">{selectedOrderToPrint.tanggal_pesanan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Nama Pelanggan:</span>
                  <span className="font-bold text-gray-800">{selectedOrderToPrint.pelanggan?.nama_lengkap || 'Pelanggan'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">No. Telepon:</span>
                  <span className="font-medium text-gray-800">{selectedOrderToPrint.pelanggan?.no_telp || '-'}</span>
                </div>
              </div>

              {/* Rincian Produk */}
              <div className="py-4 space-y-2 text-xs border-b border-dashed border-gray-300">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>{selectedOrderToPrint.produk?.nama_produk} ({selectedOrderToPrint.varian_rasa})</span>
                  <span>{selectedOrderToPrint.jumlah} {selectedOrderToPrint.produk?.satuan}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>Ukuran Kemasan: {selectedOrderToPrint.ukuran_plastik}</span>
                  <span>Metode: <strong className="uppercase">{selectedOrderToPrint.pembayaran?.[0]?.metode_pembayaran || 'Tunai'}</strong></span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-black text-brand-maroon">
                  <span>TOTAL PEMBAYARAN:</span>
                  <span>Rp {Number(selectedOrderToPrint.total_harga).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Status Lunas & Tanda Terima */}
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
                  onClick={() => setSelectedOrderToPrint(null)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>

          {/* TAMPILAN 2: DOKUMEN CETAK RESMI DI KERTAS (PERSIS GAMBAR 3 TAPI FULL-PAGE & CENTER PROPORSIONAL) */}
          <div className="hidden print:block print:w-full print:m-0 print:p-0">
            <div className="print-receipt-fullpage">
              {/* Bagian Atas: KOP RESMI PABRIK KERUPUK DIANSYAH */}
              <div>
                <div className="text-center pb-4 border-b-2 border-gray-900">
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <div className="w-12 h-12 rounded-2xl bg-brand-maroon text-amber-300 font-black text-2xl flex items-center justify-center shadow">
                      KD
                    </div>
                    <div className="text-left">
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Pabrik Kerupuk Diansyah</h2>
                      <p className="text-xs text-gray-600 font-medium">Spesialis Kerupuk Gurih & Renyah Berkualitas Tinggi &bull; Sumedang</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Jl. Pangeran Kornel No. 204, Pasanggrahan Baru, Sumedang &bull; Telp / WA: 0895-2578-3995
                  </p>
                  <div className="mt-2.5 inline-block px-4 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-400 uppercase tracking-wider">
                    ✓ RESI RESMI PEMBAYARAN SAH
                  </div>
                </div>

                {/* Grid 2 Kolom Info Transaksi & Info Pelanggan */}
                <div className="grid grid-cols-2 gap-6 py-4 border-b border-dashed border-gray-300 text-xs">
                  {/* Kolom Kiri */}
                  <table className="w-full text-xs border-collapse">
                    <tbody>
                      <tr className="align-top">
                        <td className="py-1 text-gray-500 font-medium whitespace-nowrap w-28">No. Transaksi</td>
                        <td className="py-1 px-1.5 text-gray-400 text-center w-3">:</td>
                        <td className="py-1 font-mono font-bold text-gray-900">TRX-KD-{selectedOrderToPrint.id_pesanan}</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-1 text-gray-500 font-medium whitespace-nowrap">Tanggal Pesanan</td>
                        <td className="py-1 px-1.5 text-gray-400 text-center">:</td>
                        <td className="py-1 font-semibold text-gray-800">{selectedOrderToPrint.tanggal_pesanan}</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-1 text-gray-500 font-medium whitespace-nowrap">Metode Bayar</td>
                        <td className="py-1 px-1.5 text-gray-400 text-center">:</td>
                        <td className="py-1 font-bold text-gray-900 uppercase">
                          {selectedOrderToPrint.pembayaran?.[0]?.metode_pembayaran || 'Tunai'}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Kolom Kanan */}
                  <table className="w-full text-xs border-collapse">
                    <tbody>
                      <tr className="align-top">
                        <td className="py-1 text-gray-500 font-medium whitespace-nowrap w-28">Nama Pelanggan</td>
                        <td className="py-1 px-1.5 text-gray-400 text-center w-3">:</td>
                        <td className="py-1 font-bold text-gray-900">{selectedOrderToPrint.pelanggan?.nama_lengkap || 'Pelanggan'}</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-1 text-gray-500 font-medium whitespace-nowrap">No. Telepon</td>
                        <td className="py-1 px-1.5 text-gray-400 text-center">:</td>
                        <td className="py-1 font-semibold text-gray-800">{selectedOrderToPrint.pelanggan?.no_telp || '-'}</td>
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

              {/* Bagian Tengah: Tabel Rincian Produk & Total Pembayaran & Status */}
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
                    <tr>
                      <td className="py-3 px-3 text-center font-bold text-gray-600">1</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-gray-900 text-sm block">
                          {selectedOrderToPrint.produk?.nama_produk}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          Varian: {selectedOrderToPrint.varian_rasa}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-gray-700">
                        {selectedOrderToPrint.ukuran_plastik}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-gray-900">
                        {selectedOrderToPrint.jumlah} {selectedOrderToPrint.produk?.satuan}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-gray-900 text-sm">
                        Rp {Number(selectedOrderToPrint.total_harga).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-800 bg-gray-50 font-black text-sm">
                      <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider text-gray-900">
                        TOTAL PEMBAYARAN:
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-base text-brand-maroon">
                        Rp {Number(selectedOrderToPrint.total_harga).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Status Lunas Box */}
                <div className="py-3 px-4 bg-emerald-50/60 border border-emerald-200 rounded-xl my-4 text-center">
                  <p className="text-xs text-emerald-900 font-bold">
                    Status Pembayaran: <span className="text-emerald-700 font-black">✓ LUNAS (Kas Telah Diterima & Diverifikasi Owner)</span>
                  </p>
                  <p className="text-[11px] text-emerald-800/80 mt-0.5">
                    Resi cetak ini resmi diserahkan kepada pelanggan sebagai bukti transaksi sah Pabrik Kerupuk Diansyah.
                  </p>
                </div>
              </div>

              {/* Bagian Bawah: Tanda Tangan Resmi Pengesahan Resi */}
              <div>
                <div className="pt-2 flex justify-between items-end text-xs text-gray-700">
                  <div className="text-center w-52">
                    <p className="font-semibold text-gray-600 mb-14">Tanda Terima Pelanggan,</p>
                    <p className="font-bold text-gray-900 border-t border-gray-400 pt-1">
                      ( {selectedOrderToPrint.pelanggan?.nama_lengkap || 'Pelanggan'} )
                    </p>
                  </div>
                  <div className="text-center w-56">
                    <p className="text-gray-500 text-[10px] mb-1">
                      Sumedang, {selectedOrderToPrint.tanggal_pesanan || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
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
      )}
    </RoleGuard>
  );
}
