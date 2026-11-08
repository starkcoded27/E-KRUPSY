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
  ShoppingBag, 
  Users, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  ArrowUpRight, 
  PlusCircle, 
  RefreshCw, 
  X, 
  Clock, 
  CreditCard,
  Banknote,
  Search,
  Check,
  Wallet,
  FileText,
  Calculator,
  PieChart,
  ShieldCheck,
  ArrowDownRight,
  QrCode,
  Building2,
  Image as ImageIcon,
  Receipt,
  Layers,
  Eye,
  ExternalLink,
  AlertTriangle,
  Calendar,
  CalendarDays,
  Package
} from 'lucide-react';
import { ChartData, ChartPeriodItem } from '@/lib/chart-data';

interface OrderItem {
  id_pesanan: number;
  tanggal_pesanan: string;
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
  stockList?: any[];
  chartData?: ChartData;
}

export default function OwnerDashboardPage() {
  const { user } = useAuth();

  const [laporan, setLaporan] = useState<LaporanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'transaksi' | 'produk'>('ringkasan');
  const [viewSection, setViewSection] = useState<'transaksi' | 'pelanggan' | 'katalog'>('transaksi');
  const [chartPeriod, setChartPeriod] = useState<'harian' | 'mingguan' | 'bulanan' | 'tahunan'>('harian');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // 3 Kondisi Sistem (State)
  const [actionState, setActionState] = useState<{ type: StateType; message: string | null }>({
    type: 'idle',
    message: null,
  });

  // Modal Cetak Resi Resmi oleh Owner (UC-13)
  const [selectedOrderToPrint, setSelectedOrderToPrint] = useState<OrderItem | null>(null);

  // Modal Verifikasi Bukti Screenshot Transfer Bank Pelanggan
  const [selectedTransferProof, setSelectedTransferProof] = useState<OrderItem | null>(null);

  // Modal Bukti Pelunasan QRIS Instan
  const [selectedQrisProof, setSelectedQrisProof] = useState<OrderItem | null>(null);

  // Modal Cetak Laporan Keuangan Akhir
  const [showFinancialReportModal, setShowFinancialReportModal] = useState(false);

  // Modal Tambah Produk Baru
  const [showProductModal, setShowProductModal] = useState(false);
  const [namaProduk, setNamaProduk] = useState('');
  const [satuanProduk, setSatuanProduk] = useState('Bal');
  const [hargaProduk, setHargaProduk] = useState<number>(160000);
  const [stokProduk, setStokProduk] = useState<number>(25);
  const [deskripsiProduk, setDeskripsiProduk] = useState('');
  const [productErrors, setProductErrors] = useState<Record<string, string>>({});

  // Modal Restock Pasokan Supplier untuk Produk Katalog (Khusus Owner)
  const [selectedProductToRestock, setSelectedProductToRestock] = useState<ProdukCatalogItem | null>(null);
  const [restockBalQty, setRestockBalQty] = useState<number>(10);

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

    // Auto-update laporan, omset, dan antrean transaksi live real-time tanpa reload / refresh manual
    const interval = setInterval(() => {
      fetchLaporan(true);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Konfirmasi Pembayaran Tunai (UC-12)
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

  // Tambah Produk Baru dengan 4 Validasi (Existence, DataType, Domain, Format)
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 4 Jenis Validasi Input
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

    // 5. Validasi Duplikasi Produk di Sisi Klien (Mencegah Nama Produk Ganda)
    const cleanName = namaProduk.trim();
    const isDuplicate = (laporan?.produkList || []).some(
      (p) => p.nama_produk && p.nama_produk.trim().toLowerCase() === cleanName.toLowerCase()
    );

    if (isDuplicate) {
      const errMsg = `Produk "${cleanName}" sudah ada di dalam katalog pabrik. Tidak dapat menambahkan produk yang sama!`;
      setProductErrors({
        nama_produk: errMsg,
      });
      setActionState({
        type: 'error',
        message: errMsg,
      });
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
      await fetchLaporan();
    } catch {
      setActionState({ type: 'error', message: 'Kendala jaringan saat menyimpan produk.' });
    }
  };

  // Restock Pasokan Produk Masuk dari Supplier (Khusus Owner)
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

  return (
    <RoleGuard allowedRoles={['owner']} pageTitle="Dashboard Owner">
      <div className={`space-y-6 ${(selectedOrderToPrint || showFinancialReportModal) ? 'print:hidden' : ''}`}>
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
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-brand-darkmaroon font-bold transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Cetak Rekap Harian (PDF / Cetak)
            </button>
            <button
              onClick={() => {
                setShowProductModal(true);
                setActionState({ type: 'idle', message: null });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition border border-white/20"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              + Tambah Katalog Produk
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

        {/* 4 Metrik Kartu Keuangan (SDD Bab V Mockup Hal 95 & 96) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Omset */}
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
              <p className="text-[11px] text-gray-400 mt-1">{laporan?.totalTransaksi || 0} Total pesanan tercatat</p>
            </div>
          </div>

          {/* 2. Kas Masuk Terverifikasi Lunas */}
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
              <p className="text-[11px] text-emerald-700/80 mt-1 font-medium">✓ Sah di-ACC oleh Owner</p>
            </div>
          </div>

          {/* 3. Piutang Berjalan / Pending */}
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
              <p className="text-[11px] text-amber-700/80 mt-1 font-medium">Menunggu pembayaran pelanggan</p>
            </div>
          </div>

          {/* 4. Estimasi Keuntungan Bersih */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
              <span className="font-semibold">Estimasi Laba Bersih (~30%)</span>
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-brand-maroon">
                Rp {(laporan?.estimasiKeuntungan || 0).toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Setelah HPP & operasional pabrik</p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DIAGRAM OMSET KEUANGAN (HARIAN, MINGGUAN, BULANAN, TAHUNAN) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header & Filter Periode */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-brand-maroon text-white flex items-center justify-center shadow-md shrink-0">
                <BarChart3 className="w-6 h-6 text-amber-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                    Diagram Omset Keuangan Pabrik
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ● Real-Time
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Visualisasi grafik tren omset kotor, realisasi penerimaan kas lunas, dan piutang berjalan
                </p>
              </div>
            </div>

            {/* Toggle 4 Periode: Hari, Minggu, Bulan, Tahun */}
            <div className="flex items-center p-1.5 bg-gray-100/90 rounded-2xl gap-1 self-start lg:self-center border border-gray-200/80">
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

          {/* Dynamic Statistics for Current Period */}
          {(() => {
            const currentDataset: ChartPeriodItem[] = (laporan?.chartData && (laporan.chartData as any)[chartPeriod]) || [];
            const periodOmset = currentDataset.reduce((sum, item) => sum + (item.omset || 0), 0);
            const periodLunas = currentDataset.reduce((sum, item) => sum + (item.lunas || 0), 0);
            const periodPending = currentDataset.reduce((sum, item) => sum + (item.pending || 0), 0);
            const periodTx = currentDataset.reduce((sum, item) => sum + (item.transaksi || 0), 0);
            const maxItem = currentDataset.reduce((prev, curr) => (curr.omset > (prev?.omset || 0) ? curr : prev), currentDataset[0]);

            // Skala Chart Y
            const maxVal = Math.max(...currentDataset.map((d) => d.omset || 0), 1);
            const yCeil = Math.max(Math.ceil(maxVal / 100000) * 100000, 500000);

            // Koordinat Plot SVG
            const svgWidth = 840;
            const svgHeight = 250;
            const marginLeft = 75;
            const marginRight = 25;
            const marginTop = 30;
            const marginBottom = 45;
            const plotW = svgWidth - marginLeft - marginRight;
            const plotH = svgHeight - marginTop - marginBottom;
            const baseY = marginTop + plotH;

            const nItems = Math.max(currentDataset.length, 1);
            const slotW = plotW / nItems;
            const barW = Math.min(Math.max(slotW * 0.48, 22), 52);

            return (
              <div className="space-y-5">
                {/* 4 Kartu Mini Ringkasan Periode Terpilih */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-3.5">
                    <span className="text-[11px] font-semibold text-amber-900/70 block">Omset Periode</span>
                    <span className="text-base sm:text-lg font-black text-amber-900">
                      Rp {periodOmset.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-amber-700/80 block mt-0.5">{periodTx} Total Pesanan</span>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-3.5">
                    <span className="text-[11px] font-semibold text-emerald-900/70 block">Kas Masuk (Lunas)</span>
                    <span className="text-base sm:text-lg font-black text-emerald-800">
                      Rp {periodLunas.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-emerald-700/80 block mt-0.5">
                      {periodOmset > 0 ? Math.round((periodLunas / periodOmset) * 100) : 0}% Terverifikasi
                    </span>
                  </div>

                  <div className="bg-orange-50/50 border border-orange-200/60 rounded-2xl p-3.5">
                    <span className="text-[11px] font-semibold text-orange-900/70 block">Piutang / Pending</span>
                    <span className="text-base sm:text-lg font-black text-orange-800">
                      Rp {periodPending.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-orange-700/80 block mt-0.5">Belum Terbayar</span>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-200/60 rounded-2xl p-3.5">
                    <span className="text-[11px] font-semibold text-blue-900/70 block">Puncak Tertinggi</span>
                    <span className="text-base sm:text-lg font-black text-blue-900 truncate block">
                      {maxItem && maxItem.omset > 0 ? `Rp ${maxItem.omset.toLocaleString('id-ID')}` : 'Rp 0'}
                    </span>
                    <span className="text-[10px] text-blue-700/80 block mt-0.5 truncate">
                      {maxItem && maxItem.omset > 0 ? `${maxItem.label} (${maxItem.subLabel})` : 'Belum Ada Transaksi'}
                    </span>
                  </div>
                </div>

                {/* Banner Tooltip Interaktif Saat Hover Bar */}
                {hoveredBarIndex !== null && currentDataset[hoveredBarIndex] && (
                  <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-xl border border-amber-400/30 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                        📊
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold tracking-wider text-amber-300 uppercase">
                          Detail Periode {chartPeriod.toUpperCase()}
                        </span>
                        <h4 className="font-bold text-sm text-white">
                          {currentDataset[hoveredBarIndex].label}{' '}
                          {currentDataset[hoveredBarIndex].subLabel
                            ? `(${currentDataset[hoveredBarIndex].subLabel})`
                            : ''}
                        </h4>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 text-[11px] block">Total Omset:</span>
                        <span className="text-amber-300 font-extrabold text-sm">
                          Rp {currentDataset[hoveredBarIndex].omset.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="h-7 w-px bg-white/20" />
                      <div>
                        <span className="text-gray-400 text-[11px] block">Kas Masuk (Lunas):</span>
                        <span className="text-emerald-400 font-bold">
                          Rp {currentDataset[hoveredBarIndex].lunas.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="h-7 w-px bg-white/20" />
                      <div>
                        <span className="text-gray-400 text-[11px] block">Piutang / Pending:</span>
                        <span className="text-orange-400 font-bold">
                          Rp {currentDataset[hoveredBarIndex].pending.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="h-7 w-px bg-white/20" />
                      <div>
                        <span className="text-gray-400 text-[11px] block">Volume:</span>
                        <span className="text-white font-bold">
                          {currentDataset[hoveredBarIndex].transaksi} Pesanan
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SVG Visual Bar Diagram */}
                <div className="bg-gray-50/70 rounded-2xl border border-gray-200 p-4 sm:p-5 overflow-x-auto">
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-auto min-w-[650px] select-none"
                  >
                    <defs>
                      <linearGradient id="gradLunas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#D97706" />
                      </linearGradient>
                      <linearGradient id="barHoverSlot" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(180, 83, 9, 0.08)" />
                        <stop offset="100%" stopColor="rgba(180, 83, 9, 0.02)" />
                      </linearGradient>
                    </defs>

                    {/* Gridlines & Y-Axis Labels */}
                    {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
                      const yPos = baseY - f * plotH;
                      const val = Math.round(yCeil * f);
                      let formattedVal = `Rp ${val.toLocaleString('id-ID')}`;
                      if (val >= 1000000) {
                        formattedVal = `Rp ${(val / 1000000).toFixed(1).replace('.0', '')} Jt`;
                      } else if (val >= 1000) {
                        formattedVal = `Rp ${(val / 1000).toFixed(0)} Rb`;
                      } else if (val === 0) {
                        formattedVal = 'Rp 0';
                      }

                      return (
                        <g key={i}>
                          <line
                            x1={marginLeft}
                            y1={yPos}
                            x2={svgWidth - marginRight}
                            y2={yPos}
                            stroke="#E5E7EB"
                            strokeDasharray={f === 0 ? undefined : '4 4'}
                            strokeWidth={f === 0 ? 1.5 : 1}
                          />
                          <text
                            x={marginLeft - 10}
                            y={yPos + 4}
                            textAnchor="end"
                            fontSize="10"
                            fontWeight="600"
                            fill="#6B7280"
                          >
                            {formattedVal}
                          </text>
                        </g>
                      );
                    })}

                    {/* Bars Rendering */}
                    {currentDataset.map((item, idx) => {
                      const cx = marginLeft + idx * slotW + slotW / 2;
                      const barX = cx - barW / 2;
                      const hOmset = (item.omset / yCeil) * plotH;
                      const hLunas = (item.lunas / yCeil) * plotH;
                      const hPending = Math.max(0, hOmset - hLunas);
                      const yLunas = baseY - hLunas;
                      const yPending = yLunas - hPending;
                      const isHovered = hoveredBarIndex === idx;

                      return (
                        <g
                          key={idx}
                          className="cursor-pointer transition-all"
                          onMouseEnter={() => setHoveredBarIndex(idx)}
                          onMouseLeave={() => setHoveredBarIndex(null)}
                        >
                          {/* Highlight Slot Background */}
                          <rect
                            x={marginLeft + idx * slotW + 2}
                            y={marginTop - 8}
                            width={slotW - 4}
                            height={plotH + 16}
                            rx="8"
                            fill={isHovered ? 'url(#barHoverSlot)' : 'transparent'}
                            className="transition-colors"
                          />

                          {/* Bars */}
                          {item.omset > 0 ? (
                            <>
                              {/* Kas Lunas Bar */}
                              {hLunas > 0 && (
                                <rect
                                  x={barX}
                                  y={yLunas}
                                  width={barW}
                                  height={hLunas}
                                  rx={hPending > 0 ? 0 : 5}
                                  fill="url(#gradLunas)"
                                  className="transition-all duration-300"
                                />
                              )}

                              {/* Piutang / Pending Bar (Stacked Di Atas Lunas) */}
                              {hPending > 0 && (
                                <rect
                                  x={barX}
                                  y={yPending}
                                  width={barW}
                                  height={hPending}
                                  rx="5"
                                  fill="url(#gradPending)"
                                  className="transition-all duration-300"
                                />
                              )}

                              {/* Label Nilai di Atas Bar */}
                              <text
                                x={cx}
                                y={yPending - 7}
                                textAnchor="middle"
                                fontSize={nItems > 8 ? '9' : '10'}
                                fontWeight="bold"
                                fill={isHovered ? '#8B0000' : '#374151'}
                              >
                                {item.omset >= 1000000
                                  ? `${(item.omset / 1000000).toFixed(1).replace('.0', '')}jt`
                                  : `${Math.round(item.omset / 1000)}k`}
                              </text>
                            </>
                          ) : (
                            /* Marker Flat Garis untuk Hari/Periode tanpa Omset */
                            <rect
                              x={cx - 10}
                              y={baseY - 3}
                              width="20"
                              height="3"
                              rx="1.5"
                              fill="#D1D5DB"
                            />
                          )}

                          {/* Label X-Axis (Label Utama) */}
                          <text
                            x={cx}
                            y={baseY + 18}
                            textAnchor="middle"
                            fontSize={nItems > 8 ? '10' : '11'}
                            fontWeight={isHovered ? '800' : '600'}
                            fill={isHovered ? '#8B0000' : '#1F2937'}
                          >
                            {item.label}
                          </text>

                          {/* SubLabel X-Axis (Hari / Ket) */}
                          {item.subLabel && (
                            <text
                              x={cx}
                              y={baseY + 31}
                              textAnchor="middle"
                              fontSize="9"
                              fill="#9CA3AF"
                            >
                              {item.subLabel}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Legend Chart */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-1 text-gray-600">
                  <div className="flex flex-wrap items-center gap-5">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-sm" />
                      <span className="font-semibold text-gray-700">Kas Masuk (Lunas Terverifikasi)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-md bg-amber-500 shadow-sm" />
                      <span className="font-semibold text-gray-700">Piutang / Pending (Belum Terbayar)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-1 rounded-full bg-gray-400" />
                      <span className="text-gray-500">Tidak ada omset</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                    💡 Sorot bar grafik untuk melihat rincian omset per periode
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* TABEL MANAJEMEN TRANSAKSI & KONFIRMASI PEMBAYARAN (SDD UC-12 & Bab V) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
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
                  </div>
                  <button
                    onClick={() => {
                      setShowProductModal(true);
                      setActionState({ type: 'idle', message: null });
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs shadow-sm transition shrink-0"
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
                        <th className="py-3 px-3">Nama Produk Kerupuk</th>
                        <th className="py-3 px-3">Satuan</th>
                        <th className="py-3 px-3">Harga Jual</th>
                        <th className="py-3 px-3">Kapasitas Stok Jual</th>
                        <th className="py-3 px-3">Status Stok</th>
                        <th className="py-3 px-3">Keterangan</th>
                        <th className="py-3 px-3 text-right">Aksi Restock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {laporan.produkList.map((prod) => {
                        const isMakaroni = prod.nama_produk.toLowerCase().includes('makaroni');
                        return (
                          <tr key={prod.id_produk} className={`hover:bg-gray-50/70 ${isMakaroni ? 'bg-amber-50/30' : ''}`}>
                            <td className="py-3 px-3 font-mono font-bold text-gray-800">#{prod.id_produk}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-maroon flex items-center justify-center font-bold text-[10px]">
                                  🍘
                                </span>
                                <span className="font-bold text-gray-900">{prod.nama_produk}</span>
                                {isMakaroni && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                    Katalog Khusus
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 font-medium text-gray-700">{prod.satuan}</td>
                            <td className="py-3 px-3 font-mono font-bold text-gray-900">
                              Rp {Number(prod.harga).toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-gray-900 block">{prod.stok} {prod.satuan}</span>
                              <span className="text-[10px] text-gray-400 font-mono block">
                                (~{prod.stok * 5} Kg bahan mentah)
                              </span>
                            </td>
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
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProductToRestock(prod);
                                  setRestockBalQty(10);
                                  setActionState({ type: 'idle', message: null });
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                + Restock
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

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
              </div>
            )
          ) : !laporan?.orders || laporan.orders.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-600">Belum ada transaksi pemesanan tercatat di Supabase.</p>
            </div>
          ) : (
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
                  {laporan.orders.map((order) => {
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
                              return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">4. Siap Diambil</span>;
                            }
                            if (prod?.status_produksi === 'sedang_dikemas' || hasPassedQC) {
                              return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">3. Sedang Dikemas</span>;
                            }
                            if (prod?.status_produksi === 'siap_diverifikasi') {
                              return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">2b. Menunggu QC</span>;
                            }
                            if (order.status_pesanan === 'diproses' || prod?.status_produksi === 'diproses') {
                              return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">2. Digoreng</span>;
                            }
                            if (order.status_pesanan === 'dibatalkan') {
                              return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-700">Dibatalkan</span>;
                            }
                            return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">1. Menunggu</span>;
                          })()}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="uppercase font-bold text-[10px] text-gray-500 flex items-center gap-1">
                              {payInfo?.metode_pembayaran === 'qris' && <QrCode className="w-3 h-3 text-red-600" />}
                              {payInfo?.metode_pembayaran === 'transfer' && <Building2 className="w-3 h-3 text-blue-600" />}
                              {(!payInfo?.metode_pembayaran || payInfo?.metode_pembayaran === 'tunai') && <Banknote className="w-3 h-3 text-emerald-600" />}
                              {payInfo?.metode_pembayaran || 'Tunai'}
                            </span>

                            {/* Badge Status Spesifik */}
                            {isPaid ? (
                              <div className="flex flex-col gap-1 items-start">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  LUNAS {payInfo?.metode_pembayaran === 'qris' ? '(QRIS)' : ''}
                                </span>
                                {payInfo?.metode_pembayaran === 'qris' && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedQrisProof(order)}
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
                                      onClick={() => setSelectedTransferProof(order)}
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
                        </td>
                        <td className="py-3 px-3 text-center print:hidden">
                          {!isPaid ? (
                            <div className="flex flex-col items-center gap-1">
                              {payInfo?.metode_pembayaran === 'transfer' && payInfo?.bukti_transfer ? (
                                <button
                                  onClick={() => setSelectedTransferProof(order)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95"
                                  title="Lihat bukti screenshot transfer dan sahkan lunas"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Periksa & ACC</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleConfirmPayment(order.id_pesanan)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95"
                                  title="Klik untuk mengonfirmasi bahwa pembayaran telah diterima dan mengubah status menjadi Lunas"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>ACC Lunas</span>
                                </button>
                              )}
                              <span className="text-[9px] text-gray-400">
                                {payInfo?.metode_pembayaran === 'transfer'
                                  ? payInfo?.bukti_transfer ? 'Bukti siap diverifikasi' : 'Menunggu upload pembeli'
                                  : payInfo?.metode_pembayaran === 'qris' ? 'Scan otomatis oleh pembeli' : 'Klik saat kas diterima'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-300">
                                ✓ Di-ACC Lunas
                              </span>
                              <button
                                onClick={() => setSelectedOrderToPrint(order)}
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
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* LAPORAN KEUANGAN PABRIK DI AKHIR DASHBOARD (SDD UC-12 & UC-13) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header Bagian Laporan Keuangan */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-maroon flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5 text-brand-maroon" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                    Laporan Keuangan & Rekapitulasi Kas Pabrik
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Ringkasan neraca kas, realisasi penerimaan, piutang, dan estimasi laba rugi Pabrik Kerupuk Diansyah
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => fetchLaporan()}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Segarkan Data
              </button>
              <button
                onClick={() => setShowFinancialReportModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                Cetak Laporan Keuangan (PDF / Print)
              </button>
            </div>
          </div>

          {/* 1. Ringkasan Neraca Laba Rugi Pabrik */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-br from-gray-50 to-amber-50/30 rounded-2xl p-5 border border-gray-200">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-brand-maroon" />
                Ikhtisar Buku Kas & Laba Rugi Operasional Pabrik
              </h3>

              <div className="space-y-3 text-xs">
                {/* Baris 1: Total Omset Kotor */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <div>
                    <span className="font-bold text-gray-900 block">1. Total Omset Penjualan (Gross Revenue)</span>
                    <span className="text-[11px] text-gray-400">Akumulasi seluruh nilai pesanan kerupuk yang sah</span>
                  </div>
                  <span className="text-sm font-black text-gray-900 font-mono">
                    Rp {(laporan?.totalOmset || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Baris 2: Kas Diterima (Lunas Di-ACC) */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <div>
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      2. Kas Diterima Sah (Di-ACC Lunas oleh Owner)
                    </span>
                    <span className="text-[11px] text-emerald-700">Uang riil yang telah masuk ke kas pabrik</span>
                  </div>
                  <span className="text-sm font-black text-emerald-700 font-mono">
                    Rp {(laporan?.totalKasMasuk || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Baris 3: Piutang Berjalan */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                  <div>
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      3. Piutang Pelanggan (Menunggu Pembayaran)
                    </span>
                    <span className="text-[11px] text-amber-700">Tagihan berjalan yang akan dilunasi saat serah terima kerupuk</span>
                  </div>
                  <span className="text-sm font-black text-amber-800 font-mono">
                    Rp {(laporan?.totalPiutang || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Baris 4: Estimasi Biaya HPP */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/70 border border-rose-200">
                  <div>
                    <span className="font-bold text-rose-950 flex items-center gap-1.5">
                      <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                      4. Estimasi Biaya Produksi / HPP (~70%)
                    </span>
                    <span className="text-[11px] text-rose-700">Bahan baku kerupuk mentah, minyak goreng, bumbu, plastik, dan energi</span>
                  </div>
                  <span className="text-sm font-black text-rose-700 font-mono">
                    - Rp {(laporan?.estimasiHPP || Math.round((laporan?.totalOmset || 0) * 0.7)).toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Baris 5: Total Estimasi Keuntungan Bersih */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-brand-darkmaroon text-white shadow-md">
                  <div>
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                      5. Estimasi Laba Bersih Operasional (~30%)
                    </span>
                    <span className="text-[11px] text-gray-300">Margin laba bersih riil yang diperoleh Pabrik Kerupuk Diansyah</span>
                  </div>
                  <span className="text-lg font-black text-amber-300 font-mono">
                    Rp {(laporan?.estimasiKeuntungan || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Rincian Saluran Pembayaran */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-brand-maroon" />
                  Saluran Penerimaan Pembayaran
                </h3>

                <div className="space-y-3">
                  {/* Tunai */}
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <Banknote className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 text-xs block">Kas Tunai (Cash)</span>
                        <span className="text-[10px] text-gray-400">
                          {laporan?.rekapMetode?.tunai?.count || 0} Transaksi
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-gray-900 block">
                        Rp {(laporan?.rekapMetode?.tunai?.total || 0).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium">
                        Lunas: Rp {(laporan?.rekapMetode?.tunai?.lunas || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* QRIS */}
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                        <CreditCard className="w-4 h-4 text-blue-700" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 text-xs block">QRIS Instan</span>
                        <span className="text-[10px] text-gray-400">
                          {laporan?.rekapMetode?.qris?.count || 0} Transaksi
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-gray-900 block">
                        Rp {(laporan?.rekapMetode?.qris?.total || 0).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium">
                        Lunas: Rp {(laporan?.rekapMetode?.qris?.lunas || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Transfer Bank */}
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                        <Wallet className="w-4 h-4 text-purple-700" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 text-xs block">Transfer Bank</span>
                        <span className="text-[10px] text-gray-400">
                          {laporan?.rekapMetode?.transfer?.count || 0} Transaksi
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-gray-900 block">
                        Rp {(laporan?.rekapMetode?.transfer?.total || 0).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium">
                        Lunas: Rp {(laporan?.rekapMetode?.transfer?.lunas || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                <span className="text-[11px] text-gray-400">
                  Seluruh data sinkron otomatis dengan basis data Supabase
                </span>
              </div>
            </div>
          </div>

          {/* 2. Rekapitulasi Pendapatan per Jenis Kerupuk */}
          {laporan?.produkBreakdown && laporan.produkBreakdown.length > 0 && (
            <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/50">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-maroon" />
                Rekapitulasi Penjualan & Kontribusi Omset per Varian Kerupuk
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <thead className="bg-gray-100/70 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Nama Varian Kerupuk</th>
                      <th className="py-2.5 px-3 text-center">Volume Terjual</th>
                      <th className="py-2.5 px-3 text-right">Kontribusi Omset (Rp)</th>
                      <th className="py-2.5 px-3 text-center">Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {laporan.produkBreakdown.map((p, idx) => {
                      const percentage = laporan.totalOmset > 0 
                        ? Math.round((p.total / laporan.totalOmset) * 100) 
                        : 0;

                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-mono text-gray-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-gray-900">{p.nama}</td>
                          <td className="py-2.5 px-3 text-center font-semibold text-gray-700">
                            {p.jumlah} {p.satuan}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-brand-maroon font-mono">
                            Rp {Number(p.total).toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              {percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* MODAL TAMBAH PRODUK BARU DENGAN 4 JENIS VALIDASI */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    🍘
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">Tambah Produk Kerupuk Baru</h3>
                </div>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="p-1 rounded-xl text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddProductSubmit} className="space-y-4">
                {/* 1. Nama Produk (Existence, DataType, Unique Validation) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama Kerupuk <span className="text-red-500">*</span>
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
                  {productErrors.nama_produk ? (
                    <div className="flex items-center gap-1.5 p-2.5 mt-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium animate-fadeIn">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{productErrors.nama_produk}</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-400 mt-1">
                      *Nama produk harus unik dan belum ada di katalog (misal: <em>Makaroni</em> sudah ada & tidak dapat diduplikasi).
                    </p>
                  )}
                </div>

                {/* 2. Satuan & Harga (Domain Check min: 1000) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Satuan Kemasan <span className="text-red-500">*</span>
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

                {/* 3. Stok Awal (Domain Check min: 0) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Jumlah Stok Siap Jual <span className="text-red-500">*</span>
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

                {/* 4. Deskripsi */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Deskripsi Singkat
                  </label>
                  <textarea
                    rows={2}
                    value={deskripsiProduk}
                    onChange={(e) => setDeskripsiProduk(e.target.value)}
                    placeholder="Keunggulan cita rasa, tekstur krispi..."
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-maroon resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionState.type === 'loading'}
                    className="py-3 px-4 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold rounded-2xl shadow-md transition disabled:opacity-50"
                  >
                    {actionState.type === 'loading' ? 'Menyimpan...' : 'Simpan Produk'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL RESTOCK PASOKAN SUPPLIER OLEH OWNER */}
        {selectedProductToRestock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <PlusCircle className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Restock Pasokan Supplier</h3>
                    <p className="text-[11px] text-gray-500">Input pasokan kerupuk masuk dari supplier (Khusus Owner)</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProductToRestock(null)}
                  className="p-1 rounded-xl text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRestockSubmit} className="space-y-4">
                {/* Info Produk Saat Ini */}
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-1.5 text-amber-950">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Nama Produk:</span>
                    <span className="font-bold text-gray-900">{selectedProductToRestock.nama_produk}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Stok Saat Ini:</span>
                    <span className="font-mono font-bold text-brand-maroon">{selectedProductToRestock.stok} {selectedProductToRestock.satuan} (~{selectedProductToRestock.stok * 5} Kg mentah)</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-amber-200/60">
                    <span className="text-gray-500">Estimasi Setelah Restock:</span>
                    <span className="font-mono font-black text-emerald-700">
                      {selectedProductToRestock.stok + Number(restockBalQty || 0)} {selectedProductToRestock.satuan} (~{(selectedProductToRestock.stok + Number(restockBalQty || 0)) * 5} Kg mentah)
                    </span>
                  </div>
                </div>

                {/* Input Tambahan Stok Bal */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Jumlah Pasokan Masuk ({selectedProductToRestock.satuan}) <span className="text-red-500">*</span>
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
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    ⚡ <strong>Otomatisasi Konversi:</strong> Tambahan {restockBalQty} Bal akan otomatis menambahkan pasokan <strong>+{restockBalQty * 5} Kg</strong> bahan mentah di dapur wajan staf penggorengan dadakan.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProductToRestock(null)}
                    className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionState.type === 'loading' || restockBalQty <= 0}
                    className="py-3 px-4 bg-brand-maroon hover:bg-brand-darkmaroon text-white text-xs font-bold rounded-2xl shadow-md transition disabled:opacity-50"
                  >
                    {actionState.type === 'loading' ? 'Menyimpan...' : 'Konfirmasi Restock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
          </div>
        )}

        {/* MODAL BUKTI PEMBAYARAN QRIS MASUK OLEH OWNER */}
        {selectedQrisProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
              <button
                type="button"
                onClick={() => setSelectedQrisProof(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center pb-3 border-b border-dashed border-gray-200">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 font-black text-xl mx-auto flex items-center justify-center mb-2 shadow-inner">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 mb-1">
                  ✓ VERIFIKASI QRIS LUNAS
                </div>
                <h3 className="font-black text-gray-900 text-base uppercase">BUKTI PEMBAYARAN QRIS</h3>
                <p className="text-[11px] text-gray-500">Dana Otomatis Masuk ke Rekening / Kas Pabrik Kerupuk Diansah</p>
              </div>

              {(() => {
                let meta: any = null;
                try {
                  meta = selectedQrisProof.pembayaran?.[0]?.bukti_transfer
                    ? JSON.parse(selectedQrisProof.pembayaran[0].bukti_transfer)
                    : null;
                } catch (e) {}

                return (
                  <div className="py-3.5 space-y-2.5 text-xs font-mono">
                    {/* Visual QRIS Resmi Perusahaan */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-red-50/50 border border-red-200/80 font-sans">
                      <img
                        src="/images/qris-pabrik-diansyah.jpg"
                        alt="QRIS Resmi Perusahaan"
                        className="w-14 h-20 object-contain rounded-lg border border-red-200 bg-white shadow-sm shrink-0"
                      />
                      <div className="text-[11px]">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black bg-red-600 text-white mb-1">
                          QRIS RESMI PABRIK
                        </span>
                        <h4 className="font-black text-gray-900 text-xs">PABRIK KERUPUK DIANSAH</h4>
                        <p className="text-[10px] text-gray-600 font-mono mt-0.5">
                          NMID: <strong className="text-gray-900">{meta?.nmid || 'ID1025393458506'}</strong> (A01)
                        </p>
                        <a
                          href="/images/qris-pabrik-diansyah.jpg"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-brand-maroon hover:underline font-bold inline-flex items-center gap-1 mt-1 font-mono"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Buka QRIS Full-Size</span>
                        </a>
                      </div>
                    </div>

                    <div className="flex justify-between p-2 rounded-xl bg-gray-50">
                      <span className="text-gray-500">Ref ID QRIS:</span>
                      <span className="font-bold text-gray-900">{meta?.ref_id || `QRIS-KD-${selectedQrisProof.id_pesanan}`}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-xl bg-gray-50">
                      <span className="text-gray-500">Merchant NMID:</span>
                      <span className="font-bold text-gray-900">{meta?.nmid || 'ID1025393458506'}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-xl bg-gray-50">
                      <span className="text-gray-500">Tujuan Dana:</span>
                      <span className="font-bold text-emerald-700 text-right">E-Wallet / Kas Pabrik Kerupuk Diansah</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-xl bg-gray-50">
                      <span className="text-gray-500">Waktu Scan:</span>
                      <span className="font-bold text-gray-900 text-[11px]">
                        {meta?.paid_at ? new Date(meta.paid_at).toLocaleString('id-ID') : selectedQrisProof.tanggal_pesanan}
                      </span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="font-bold text-emerald-950">TOTAL DANA MASUK:</span>
                      <span className="font-black text-emerald-700 text-sm">
                        Rp {Number(selectedQrisProof.total_harga).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedQrisProof(null)}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

        {/* MODAL CETAK RESI RESMI OLEH OWNER UNTUK DIKASIH KE PELANGGAN (UC-13) */}
        {selectedOrderToPrint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn print:static print:inset-auto print:p-0 print:bg-transparent print:z-auto print:m-0 print-center-card-wrapper">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative print:p-6 print:border print:border-gray-400 print:shadow-none print:max-w-md print:w-full print:rounded-2xl print:break-inside-avoid print:page-break-inside-avoid print-center-card">
              <button
                onClick={() => setSelectedOrderToPrint(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition print:hidden"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Resi Pabrik */}
              <div className="text-center pb-4 border-b border-dashed border-gray-300">
                <div className="w-12 h-12 rounded-2xl bg-brand-maroon text-amber-300 font-black text-xl mx-auto flex items-center justify-center mb-2 shadow print:shadow-none">
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
              <div className="mt-4 flex gap-2 print:hidden">
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
        )}

{/* ========================================================================= */}
        {/* MODAL CETAK DOKUMEN RESMI LAPORAN KEUANGAN PABRIK (PRINTABLE FORM) */}
        {/* ========================================================================= */}
        {showFinancialReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn print:static print:inset-auto print:p-0 print:bg-transparent print:block print:z-auto print:m-0">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto relative print:p-6 print:border print:border-gray-400 print:shadow-none print:max-w-full print:max-h-none print:overflow-visible print:rounded-2xl print:break-inside-avoid print:page-break-inside-avoid">
              <button
                onClick={() => setShowFinancialReportModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition print:hidden"
              >
                <X className="w-5 h-5" />
              </button>

              {/* KOP RESMI LAPORAN PABRIK KERUPUK DIANSYAH */}
              <div className="text-center pb-5 border-b-2 border-gray-900 mb-6">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <div className="w-12 h-12 rounded-2xl bg-brand-maroon text-amber-300 font-black text-2xl flex items-center justify-center shadow">
                    KD
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Pabrik Kerupuk Diansyah</h2>
                    <p className="text-xs text-gray-600 font-medium">Spesialis Kerupuk Gurih & Renyah Berkualitas Tinggi</p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Jl. Pangeran Kornel No. 204, Pasanggrahan Baru, Sumedang &bull; Telp / WA: 0895-2578-3995
                </p>
                <div className="mt-3 inline-block px-4 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-900 border border-gray-300 tracking-wider uppercase">
                  DOKUMEN RESMI: LAPORAN KEUANGAN & LABA RUGI PABRIK
                </div>
              </div>

              {/* Info Dokumen */}
              <div className="grid grid-cols-2 text-xs py-2 mb-4 border-b border-gray-200">
                <div>
                  <span className="text-gray-500">Tanggal Cetak Dokumen:</span>
                  <p className="font-bold text-gray-900">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-500">Pimpinan / Penanggung Jawab:</span>
                  <p className="font-bold text-gray-900">Bapak Diansyah (Owner)</p>
                </div>
              </div>

              {/* Tabel Neraca Laba Rugi */}
              <div className="space-y-3 text-xs mb-6">
                <h4 className="font-bold text-gray-900 text-sm border-l-4 border-brand-maroon pl-2">
                  I. Rekapitulasi Neraca Keuangan & Arus Kas
                </h4>
                <table className="w-full text-xs border border-gray-300 rounded-lg overflow-hidden">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-gray-100 font-bold">
                      <td className="py-2.5 px-3">Komponen Keuangan Operasional</td>
                      <td className="py-2.5 px-3 text-right">Nominal (Rupiah)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-gray-800">1. Total Omset Penjualan (Gross Revenue)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">Rp {(laporan?.totalOmset || 0).toLocaleString('id-ID')}</td>
                    </tr>
                    <tr className="bg-emerald-50/50">
                      <td className="py-2.5 px-3 font-semibold text-emerald-900">2. Realisasi Kas Diterima (Lunas Di-ACC)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">Rp {(laporan?.totalKasMasuk || 0).toLocaleString('id-ID')}</td>
                    </tr>
                    <tr className="bg-amber-50/50">
                      <td className="py-2.5 px-3 font-semibold text-amber-900">3. Piutang Pelanggan (Menunggu Pembayaran)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-800">Rp {(laporan?.totalPiutang || 0).toLocaleString('id-ID')}</td>
                    </tr>
                    <tr className="bg-rose-50/50">
                      <td className="py-2.5 px-3 font-semibold text-rose-900">4. Estimasi Biaya Produksi / HPP (~70%)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">- Rp {(laporan?.estimasiHPP || Math.round((laporan?.totalOmset || 0) * 0.7)).toLocaleString('id-ID')}</td>
                    </tr>
                    <tr className="bg-gray-100 font-black text-sm">
                      <td className="py-3 px-3 text-brand-darkmaroon">5. ESTIMASI LABA BERSIH OPERASIONAL (~30%)</td>
                      <td className="py-3 px-3 text-right font-mono text-brand-maroon">Rp {(laporan?.estimasiKeuntungan || 0).toLocaleString('id-ID')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Rincian Produk */}
              {laporan?.produkBreakdown && laporan.produkBreakdown.length > 0 && (
                <div className="space-y-2 text-xs mb-6">
                  <h4 className="font-bold text-gray-900 text-sm border-l-4 border-brand-maroon pl-2">
                    II. Rincian Penjualan per Varian Kerupuk
                  </h4>
                  <table className="w-full text-xs border border-gray-300">
                    <thead className="bg-gray-100 font-bold">
                      <tr>
                        <th className="py-1.5 px-2 text-center">No</th>
                        <th className="py-1.5 px-3 text-left">Nama Produk</th>
                        <th className="py-1.5 px-3 text-center">Volume</th>
                        <th className="py-1.5 px-3 text-right">Total Kontribusi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {laporan.produkBreakdown.map((p, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 px-2 text-center font-mono">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-medium">{p.nama}</td>
                          <td className="py-1.5 px-3 text-center">{p.jumlah} {p.satuan}</td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold">Rp {Number(p.total).toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Kolom Tanda Tangan Resmi */}
              <div className="pt-6 border-t border-gray-200 flex justify-between items-end text-xs">
                <div className="text-gray-400 text-[10px]">
                  Dicetak secara otomatis oleh Sistem Informasi E-KRUPSY
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

              {/* Tombol Cetak / Tutup */}
              <div className="mt-6 flex gap-3 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-brand-maroon hover:bg-brand-darkmaroon text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Dokumen Sekarang (Print)
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
        )}
    </RoleGuard>
  );
}
