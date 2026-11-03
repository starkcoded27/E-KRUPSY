export interface ChartPeriodItem {
  key: string;
  label: string;
  subLabel?: string;
  omset: number; // Gross Omset
  lunas: number; // Kas masuk terverifikasi
  pending: number; // Belum lunas / COD pending
  transaksi: number;
}

export interface ChartData {
  harian: ChartPeriodItem[];
  mingguan: ChartPeriodItem[];
  bulanan: ChartPeriodItem[];
  tahunan: ChartPeriodItem[];
  summary: {
    totalOmset: number;
    totalLunas: number;
    totalPending: number;
    totalTransaksi: number;
  };
}

export function generateChartData(orders: any[], customRefDate?: Date): ChartData {
  const validOrders = (orders || []).filter((o) => o && o.status_pesanan !== 'dibatalkan');

  // Tentukan tanggal acuan (ambil tanggal pesanan terbaru atau tanggal sistem sekarang)
  let refTime = new Date().getTime();
  validOrders.forEach((o) => {
    if (o.tanggal_pesanan) {
      const t = new Date(o.tanggal_pesanan).getTime();
      if (!isNaN(t) && t > refTime) {
        refTime = t;
      }
    }
  });

  const refDate = customRefDate || new Date(refTime);

  const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthFull = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const dayNamesShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Parse YYYY-MM-DD aman tanpa timezone offset shift
  const parseSafeDate = (dStr: string) => {
    if (!dStr) return new Date();
    const parts = dStr.split(/[-T\s]/);
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return new Date(y, m, d);
  };

  // -------------------------------------------------------------
  // 1. DATA HARIAN: 7 Hari Terakhir
  // -------------------------------------------------------------
  const harianMap: Record<string, ChartPeriodItem> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const key = `${yyyy}-${mm}-${dd}`;
    harianMap[key] = {
      key,
      label: `${dd} ${monthShort[d.getMonth()]}`,
      subLabel: dayNamesShort[d.getDay()],
      omset: 0,
      lunas: 0,
      pending: 0,
      transaksi: 0,
    };
  }

  // -------------------------------------------------------------
  // 2. DATA MINGGUAN: 5 Minggu Terakhir
  // -------------------------------------------------------------
  interface WeekMeta extends ChartPeriodItem {
    startTime: number;
    endTime: number;
  }
  const mingguanList: WeekMeta[] = [];

  for (let i = 4; i >= 0; i--) {
    const targetDate = new Date(refDate);
    targetDate.setDate(targetDate.getDate() - i * 7);

    // Dapatkan Senin minggu tersebut
    const day = targetDate.getDay();
    const diffToMonday = targetDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(targetDate);
    monday.setDate(diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const key = `W-${monday.getFullYear()}-${monday.getMonth() + 1}-${monday.getDate()}`;
    const label = `${monday.getDate()} ${monthShort[monday.getMonth()]} - ${sunday.getDate()} ${monthShort[sunday.getMonth()]}`;

    mingguanList.push({
      key,
      label,
      subLabel: `Mgg ${5 - i}`,
      omset: 0,
      lunas: 0,
      pending: 0,
      transaksi: 0,
      startTime: monday.getTime(),
      endTime: sunday.getTime(),
    });
  }

  // -------------------------------------------------------------
  // 3. DATA BULANAN: 12 Bulan (Tahun Berjalan)
  // -------------------------------------------------------------
  const curYear = refDate.getFullYear();
  const bulananMap: Record<string, ChartPeriodItem> = {};
  for (let m = 0; m < 12; m++) {
    const key = `${curYear}-${String(m + 1).padStart(2, '0')}`;
    bulananMap[key] = {
      key,
      label: monthShort[m],
      subLabel: `${monthFull[m]} ${curYear}`,
      omset: 0,
      lunas: 0,
      pending: 0,
      transaksi: 0,
    };
  }

  // -------------------------------------------------------------
  // 4. DATA TAHUNAN: 4 Tahun (Mundur 2 thn, Sekarang, Maju 1 thn)
  // -------------------------------------------------------------
  const tahunanMap: Record<string, ChartPeriodItem> = {};
  for (let y = curYear - 2; y <= curYear + 1; y++) {
    const key = String(y);
    tahunanMap[key] = {
      key,
      label: String(y),
      subLabel: `Tahun ${y}`,
      omset: 0,
      lunas: 0,
      pending: 0,
      transaksi: 0,
    };
  }

  // -------------------------------------------------------------
  // Akumulasi Data dari Semua Pesanan Valid
  // -------------------------------------------------------------
  let grandOmset = 0;
  let grandLunas = 0;
  let grandPending = 0;
  let grandTransaksi = 0;

  validOrders.forEach((o) => {
    const rawDate = o.tanggal_pesanan || '';
    const dateObj = parseSafeDate(rawDate);
    const time = dateObj.getTime();
    const total = Number(o.total_harga) || 0;

    const paymentStatus = o.pembayaran?.[0]?.status_pembayaran;
    const isLunas = paymentStatus === 'lunas';

    grandOmset += total;
    grandTransaksi += 1;
    if (isLunas) grandLunas += total;
    else grandPending += total;

    const dayKey = rawDate.slice(0, 10);
    const monthKey = rawDate.slice(0, 7);
    const yearKey = rawDate.slice(0, 4);

    // 1. Masukkan ke Harian
    if (harianMap[dayKey]) {
      harianMap[dayKey].omset += total;
      harianMap[dayKey].transaksi += 1;
      if (isLunas) harianMap[dayKey].lunas += total;
      else harianMap[dayKey].pending += total;
    }

    // 2. Masukkan ke Mingguan
    mingguanList.forEach((w) => {
      if (time >= w.startTime && time <= w.endTime) {
        w.omset += total;
        w.transaksi += 1;
        if (isLunas) w.lunas += total;
        else w.pending += total;
      }
    });

    // 3. Masukkan ke Bulanan
    if (bulananMap[monthKey]) {
      bulananMap[monthKey].omset += total;
      bulananMap[monthKey].transaksi += 1;
      if (isLunas) bulananMap[monthKey].lunas += total;
      else bulananMap[monthKey].pending += total;
    }

    // 4. Masukkan ke Tahunan
    if (tahunanMap[yearKey]) {
      tahunanMap[yearKey].omset += total;
      tahunanMap[yearKey].transaksi += 1;
      if (isLunas) tahunanMap[yearKey].lunas += total;
      else tahunanMap[yearKey].pending += total;
    }
  });

  return {
    harian: Object.values(harianMap),
    mingguan: mingguanList.map(({ startTime, endTime, ...rest }) => rest),
    bulanan: Object.values(bulananMap),
    tahunan: Object.values(tahunanMap),
    summary: {
      totalOmset: grandOmset,
      totalLunas: grandLunas,
      totalPending: grandPending,
      totalTransaksi: grandTransaksi,
    },
  };
}
