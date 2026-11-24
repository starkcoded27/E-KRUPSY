const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Baca aset gambar
const img1Base64 = fs.readFileSync('C:/Users/Asus/.gemini/antigravity/brain/31d9de20-650f-46df-916b-e9304f602f73/docx_extracted/word/media/image1.jpg').toString('base64');
const img2Base64 = fs.readFileSync('C:/Users/Asus/.gemini/antigravity/brain/31d9de20-650f-46df-916b-e9304f602f73/docx_extracted/word/media/image2.jpg').toString('base64');
const logoBase64 = fs.readFileSync('c:/Users/Asus/Documents/E-KRUPSY/public/images/logo-ekrupsy.jpg').toString('base64');
const navbarBrandBase64 = fs.readFileSync('c:/Users/Asus/Documents/E-KRUPSY/public/images/navbar-brand.png').toString('base64');

console.log('Images and assets loaded successfully.');

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>TEST SCENARIO, TEST CASE, TEST DATA, DAN TRACEABILITY MATRIX - E-KRUPSY</title>
<style>
  @page {
    size: A4;
    margin: 16mm 16mm 18mm 16mm;
  }
  @page :first {
    margin: 0;
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    line-height: 1.5;
    font-size: 9pt;
    margin: 0;
    padding: 0;
  }

  /* COVER STYLING */
  .cover-container {
    width: 210mm;
    height: 297mm;
    background-image: url('data:image/jpeg;base64,${img1Base64}');
    background-size: cover;
    background-position: center;
    position: relative;
    page-break-after: always;
    padding: 30mm 22mm 24mm 22mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .cover-top {
    max-width: 140mm;
  }

  .cover-badge {
    display: inline-block;
    background: #0f172a;
    color: #ffffff;
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 1.5px;
    padding: 3px 10px;
    border-radius: 4px;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .cover-title {
    font-size: 26pt;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: 1.2px;
    line-height: 1.15;
    margin: 0 0 10px 0;
  }

  .cover-subtitle {
    font-size: 12.5pt;
    font-weight: 700;
    color: #1e3a8a;
    line-height: 1.35;
    margin: 0 0 8px 0;
  }

  .cover-case-study {
    font-size: 10pt;
    font-weight: 600;
    color: #475569;
    line-height: 1.4;
    margin: 0 0 14px 0;
    border-left: 3px solid #3b82f6;
    padding-left: 10px;
  }

  .cover-class {
    font-size: 10.5pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .cover-bottom {
    max-width: 140mm;
    background: rgba(255, 255, 255, 0.95);
    padding: 16px 18px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }

  .cover-section-title {
    font-size: 8pt;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 6px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 2px;
  }

  .cover-member-list {
    margin: 0 0 10px 0;
    padding: 0;
    list-style: none;
    font-size: 9pt;
    color: #0f172a;
    line-height: 1.4;
  }

  .cover-member-list li {
    margin-bottom: 2px;
  }

  .cover-member-list strong {
    color: #1e3a8a;
  }

  .cover-lecturers {
    font-size: 9pt;
    color: #0f172a;
    margin: 0 0 8px 0;
    line-height: 1.35;
  }

  .cover-date {
    font-size: 8.5pt;
    font-weight: 600;
    color: #475569;
  }

  /* BACK COVER STYLING */
  .back-cover-container {
    width: 210mm;
    height: 297mm;
    background-image: url('data:image/jpeg;base64,${img2Base64}');
    background-size: cover;
    background-position: center;
    page-break-before: always;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 30mm 20mm;
  }

  .back-cover-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #cbd5e1;
    padding: 24px 30px;
    border-radius: 10px;
    max-width: 140mm;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  }

  /* CONTENT STYLING */
  .content-body {
    padding-top: 2px;
  }

  .doc-header-banner {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 5px solid #1e40af;
    padding: 10px 14px;
    margin-bottom: 16px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .doc-header-banner h1 {
    font-size: 13.5pt;
    margin: 0 0 3px 0;
    color: #0f172a;
    font-weight: 800;
    letter-spacing: 0.4px;
  }

  .doc-header-banner p {
    margin: 0;
    font-size: 8.5pt;
    color: #475569;
  }

  h2 {
    color: #0f172a;
    font-size: 12pt;
    font-weight: 800;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 4px;
    margin-top: 18px;
    margin-bottom: 8px;
    page-break-after: avoid;
  }

  h3 {
    color: #1e3a8a;
    font-size: 10pt;
    font-weight: 700;
    margin-top: 12px;
    margin-bottom: 4px;
    page-break-after: avoid;
  }

  p, ul, ol {
    margin-top: 0;
    margin-bottom: 6px;
    font-size: 8.5pt;
    text-align: justify;
  }

  ul, ol {
    padding-left: 18px;
  }

  li {
    margin-bottom: 2px;
  }

  /* TABLE STYLING */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 12px 0;
    font-size: 8pt;
    page-break-inside: auto;
  }

  thead {
    display: table-header-group;
  }

  tfoot {
    display: table-footer-group;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  th, td {
    border: 1px solid #cbd5e1;
    padding: 5px 7px;
    text-align: left;
    vertical-align: top;
    line-height: 1.35;
  }

  th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
    font-size: 8pt;
  }

  .table-meta th {
    width: 24%;
    background-color: #f8fafc;
    color: #334155;
    font-weight: 600;
  }

  .table-meta td {
    width: 76%;
    font-weight: 500;
  }

  .badge-pass {
    display: inline-block;
    background: #dcfce7;
    color: #15803d;
    font-weight: 700;
    font-size: 7pt;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid #86efac;
    white-space: nowrap;
  }

  .badge-fail {
    display: inline-block;
    background: #fee2e2;
    color: #b91c1c;
    font-weight: 700;
    font-size: 7pt;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid #fca5a5;
    white-space: nowrap;
  }

  .badge-pos {
    display: inline-block;
    background: #eff6ff;
    color: #1d4ed8;
    font-weight: 700;
    font-size: 7pt;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid #bfdbfe;
    white-space: nowrap;
  }

  .badge-neg {
    display: inline-block;
    background: #fff1f2;
    color: #be123c;
    font-weight: 700;
    font-size: 7pt;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid #fecdd3;
    white-space: nowrap;
  }

  .badge-valid {
    display: inline-block;
    background: #f0fdf4;
    color: #166534;
    font-weight: 700;
    font-size: 7pt;
    padding: 1px 5px;
    border-radius: 3px;
    border: 1px solid #bbf7d0;
  }

  .badge-invalid {
    display: inline-block;
    background: #fef2f2;
    color: #991b1b;
    font-weight: 700;
    font-size: 7pt;
    padding: 1px 5px;
    border-radius: 3px;
    border: 1px solid #fecaca;
  }

  .badge-boundary {
    display: inline-block;
    background: #fffbeb;
    color: #92400e;
    font-weight: 700;
    font-size: 7pt;
    padding: 1px 5px;
    border-radius: 3px;
    border: 1px solid #fde68a;
  }

  .callout-box {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #3b82f6;
    padding: 8px 12px;
    margin: 8px 0;
    font-size: 8pt;
    border-radius: 3px;
  }

  .callout-box strong {
    color: #1e3a8a;
  }

  .flow-step-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 6px 10px;
    margin-bottom: 10px;
  }

  .page-divider {
    page-break-after: always;
  }

  .footer-note {
    font-size: 7.5pt;
    color: #64748b;
    text-align: right;
    margin-top: 12px;
    border-top: 1px solid #e2e8f0;
    padding-top: 4px;
  }
</style>
</head>
<body>

<!-- ============================================================================== -->
<!-- COVER PAGE -->
<!-- ============================================================================== -->
<div class="cover-container">
  <div class="cover-top">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
      <div class="cover-badge">Dokumen Pengujian &amp; Traceability</div>
      <img src="data:image/jpeg;base64,${logoBase64}" alt="Logo E-KrupSy" style="width: 22mm; height: 22mm; border-radius: 50%; object-fit: cover; border: 2.5px solid #d97706; box-shadow: 0 4px 14px rgba(0,0,0,0.22);" />
    </div>
    <div class="cover-title">TEST SCENARIO, TEST CASE, TEST DATA, DAN TRACEABILITY MATRIX</div>
    <div class="cover-subtitle">Sistem Informasi Pemesanan dan Manajemen Produksi Kerupuk Berbasis Web (E-KRUPSY)</div>
    <div class="cover-case-study">Studi Kasus: Pabrik Kerupuk Diansyah — Sumedang, Jawa Barat</div>
    <div class="cover-class">Kelompok 4 / Kelas IF-46-01 (Rekayasa Perangkat Lunak)</div>
    <div style="margin: 12px 0 6px 0; display: flex; align-items: center; gap: 12px;">
      <img src="data:image/jpeg;base64,${logoBase64}" alt="Logo E-KrupSy Resmi" style="width: 32mm; height: 32mm; border-radius: 50%; object-fit: cover; border: 3px solid #d97706; box-shadow: 0 6px 18px rgba(0,0,0,0.25);" />
      <div style="font-size: 9pt; color: #334155; line-height: 1.4;">
        <strong style="color: #0f172a; font-size: 10.5pt;">Pabrik Kerupuk Diansyah</strong><br>
        <em>Produksi Kerupuk Gurih &amp; Renyah Khas Sumedang</em><br>
        <span style="display: inline-block; background: #fef3c7; color: #92400e; font-size: 7.5pt; font-weight: 700; padding: 2px 7px; border-radius: 3px; margin-top: 3px; border: 1px solid #fde68a;">Official Testing Document</span>
      </div>
    </div>
  </div>

  <div class="cover-bottom">
    <div class="cover-section-title">Disusun Oleh (Tim Penguji &amp; Pengembang):</div>
    <ul class="cover-member-list">
      <li><strong>1301220001</strong> — Fajar Pratama (Test Lead / Koordinator QA)</li>
      <li><strong>1301220015</strong> — Dwi Cahyono (Quality Assurance Engineer)</li>
      <li><strong>1301220042</strong> — Rian Firmansyah (Security &amp; Integration Tester)</li>
      <li><strong>1301220078</strong> — Siti Nurhaliza (Technical Writer &amp; Defect Logger)</li>
    </ul>

    <div class="cover-section-title">Dosen Pembimbing &amp; Reviewer:</div>
    <div class="cover-lecturers">
      1. Dr. Eng. Ir. Hendra Gunawan, S.T., M.T.<br>
      2. Nurul Hidayati, S.Kom., M.Kom.
    </div>

    <div class="cover-date">
      <strong>Tanggal Penyusunan:</strong> 24 November 2026 (Status: Terverifikasi Sistem Riil)
    </div>
  </div>
</div>

<!-- ============================================================================== -->
<!-- HALAMAN ISI / DOKUMEN FORMAL MATRIKS PENGUJIAN -->
<!-- ============================================================================== -->
<div class="content-body">

  <div class="doc-header-banner">
    <div>
      <h1>TEST SCENARIO, TEST CASE, TEST DATA, DAN TRACEABILITY MATRIX</h1>
      <p>Sistem Informasi Pemesanan dan Manajemen Produksi Kerupuk Berbasis Web (E-KRUPSY) — Pabrik Kerupuk Diansyah</p>
    </div>
    <img src="data:image/jpeg;base64,${logoBase64}" alt="Logo E-KrupSy" style="width: 16mm; height: 16mm; border-radius: 50%; object-fit: cover; border: 2px solid #b45309; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15);" />
  </div>

  <!-- TABEL METADATA DOKUMEN -->
  <table class="table-meta">
    <tr>
      <th>Nama Sistem</th>
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="data:image/jpeg;base64,${logoBase64}" alt="Logo" style="width: 12mm; height: 12mm; border-radius: 50%; object-fit: cover; border: 1.5px solid #d97706; flex-shrink: 0;" />
          <div>
            <strong>Sistem Informasi Pemesanan dan Manajemen Produksi Kerupuk Berbasis Web (E-KRUPSY)</strong><br>
            <span style="font-size: 8pt; color: #475569;">Studi Kasus: Pabrik Kerupuk Diansyah — Sumedang, Jawa Barat</span>
          </div>
        </div>
      </td>
    </tr>
    <tr>
      <th>Nama Kelompok / Kelas</th>
      <td><strong>Kelompok 4 / Kelas IF-46-01 (Rekayasa Perangkat Lunak)</strong></td>
    </tr>
    <tr>
      <th>Fitur Prioritas</th>
      <td>
        <strong>8 Fitur Prioritas Utama Make-To-Order:</strong><br>
        1. Autentikasi Pengguna &amp; RBAC 4 Aktor (SKF-01 s.d. SKF-04)<br>
        2. Validasi Formulir 4 Lapis Pendaftaran &amp; Transaksi (SKF-02)<br>
        3. Katalog Produk &amp; Keranjang Belanja Multi-Varian Batch Order (SKF-05 s.d. SKF-10)<br>
        4. Multi-Channel Pembayaran (Tunai, QRIS, Transfer) &amp; ACC Kasir Owner (SKF-11 s.d. SKF-15)<br>
        5. Pembatalan Pesanan Mandiri &amp; Auto-Refund Stok Bahan Gudang (SKF-16 s.d. SKF-18)<br>
        6. Antrean Dapur Penggorengan Berbasis Waktu WIB (SKF-19 s.d. SKF-22)<br>
        7. Pengendalian Mutu (QC Kerenyahan) &amp; Pengemasan Plastik (SKF-23 s.d. SKF-26)<br>
        8. Manajemen Stok Gudang 3 Kategori &amp; Laporan Finansial Cetak A4 (SKF-27 s.d. SKF-35)
      </td>
    </tr>
    <tr>
      <th>Versi / Tanggal</th>
      <td><strong>1.0 (Kondisi Sistem Riil) / 24 November 2026</strong></td>
    </tr>
  </table>

  <!-- ALUR PENGISIAN DOKUMEN -->
  <div class="flow-step-box">
    <div style="font-weight: 800; font-size: 8.5pt; color: #1e3a8a; margin-bottom: 4px;">Alur Pengisian Dokumen &amp; Pemeliharaan Traceability:</div>
    <table style="margin: 0;">
      <thead>
        <tr>
          <th style="width: 16%; text-align: center;">Langkah 1</th>
          <th style="width: 16%; text-align: center;">Langkah 2</th>
          <th style="width: 17%; text-align: center;">Langkah 3</th>
          <th style="width: 17%; text-align: center;">Langkah 4</th>
          <th style="width: 17%; text-align: center;">Langkah 5</th>
          <th style="width: 17%; text-align: center;">Langkah 6</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-size: 7.5pt; text-align: center;"><strong>Requirement / User Story</strong><br>(SKF-01 s/d SKF-35)</td>
          <td style="font-size: 7.5pt; text-align: center;"><strong>Test Scenario</strong><br>(Tingkat tinggi, +/-)</td>
          <td style="font-size: 7.5pt; text-align: center;"><strong>Test Case</strong><br>(Pre-kondisi &amp; langkah)</td>
          <td style="font-size: 7.5pt; text-align: center;"><strong>Test Data</strong><br>(Valid / Invalid / Boundary)</td>
          <td style="font-size: 7.5pt; text-align: center;"><strong>Eksekusi &amp; Actual Result</strong><br>(Status PASS/FAIL)</td>
          <td style="font-size: 7.5pt; text-align: center;"><strong>Defect Report</strong><br>(Jika ada temuan cacat)</td>
        </tr>
      </tbody>
    </table>
    <p style="margin: 4px 0 0 0; font-size: 7.5pt; color: #64748b; font-style: italic;">
      *Urutan ini menjaga traceability: setiap kebutuhan sistem memiliki pengujian yang dapat ditelusuri dari requirement hingga hasil eksekusi riil.
    </p>
  </div>

  <!-- ============================================================================== -->
  <!-- BAGIAN A: TEST SCENARIO -->
  <!-- ============================================================================== -->
  <h2>A. Test Scenario</h2>
  <p>
    Gambaran tingkat tinggi "apa yang akan diuji", satu baris per skenario, diturunkan langsung dari Kebutuhan Fungsional (SKF-01 s.d. SKF-35 pada SRS E-KRUPSY v2.0). Setiap modul dilengkapi skenario sukses (<em>Positive</em>) dan skenario gagal/batas (<em>Negative</em>) untuk memastikan keandalan sistem secara menyeluruh.
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 14%;">ID Scenario</th>
        <th style="width: 20%;">Modul / Fitur</th>
        <th style="width: 40%;">Skenario Pengujian yang Diuji</th>
        <th style="width: 16%;">Requirement (SRS)</th>
        <th style="width: 10%; text-align: center;">Kondisi</th>
      </tr>
    </thead>
    <tbody>
      <!-- AUTH & REG -->
      <tr>
        <td><strong>TS-REG-01</strong></td>
        <td>Registrasi Pelanggan</td>
        <td>Pendaftaran akun pelanggan baru menggunakan seluruh data masukan lengkap dan valid</td>
        <td>SKF-01, SKF-02</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-REG-02</strong></td>
        <td>Registrasi Pelanggan</td>
        <td>Pendaftaran dengan mengosongkan kolom wajib (Nama Lengkap / Password) (<em>Existence Check</em>)</td>
        <td>SKF-02</td>
        <td style="text-align: center;"><span class="badge-neg">Negative</span></td>
      </tr>
      <tr>
        <td><strong>TS-REG-03</strong></td>
        <td>Registrasi Pelanggan</td>
        <td>Pendaftaran dengan menginput karakter alfabet/simbol pada kolom No HP (<em>Data Type Check</em>)</td>
        <td>SKF-02</td>
        <td style="text-align: center;"><span class="badge-neg">Negative</span></td>
      </tr>
      <tr>
        <td><strong>TS-REG-04</strong></td>
        <td>Registrasi Pelanggan</td>
        <td>Pendaftaran dengan panjang password kurang dari batas minimal 6 karakter (<em>Domain Check</em>)</td>
        <td>SKF-02</td>
        <td style="text-align: center;"><span class="badge-neg">Negative</span></td>
      </tr>
      <tr>
        <td><strong>TS-REG-05</strong></td>
        <td>Registrasi Pelanggan</td>
        <td>Pendaftaran dengan format email yang tidak sesuai standar RFC (<em>Format Check</em>)</td>
        <td>SKF-02</td>
        <td style="text-align: center;"><span class="badge-neg">Negative</span></td>
      </tr>
      <tr>
        <td><strong>TS-LOGIN-01</strong></td>
        <td>Autentikasi Pengguna</td>
        <td>Masuk akun (Login) dengan username dan password yang benar sesuai peran masing-masing role</td>
        <td>SKF-03</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-LOGIN-02</strong></td>
        <td>Autentikasi Pengguna</td>
        <td>Masuk akun (Login) dengan memasukkan password yang salah</td>
        <td>SKF-03</td>
        <td style="text-align: center;"><span class="badge-neg">Negative</span></td>
      </tr>
      <tr>
        <td><strong>TS-RBAC-01</strong></td>
        <td>Role-Based Access Control</td>
        <td>Pelanggan yang sedang login mencoba mengakses langsung URL dashboard internal Owner (/dashboard/owner)</td>
        <td>SKF-04</td>
        <td style="text-align: center;"><span class="badge-neg">Negative</span></td>
      </tr>
      <!-- KATALOG & PEMESANAN -->
      <tr>
        <td><strong>TS-KAT-01</strong></td>
        <td>Katalog Produk</td>
        <td>Menampilkan katalog produk kerupuk secara dinamis dari database Supabase</td>
        <td>SKF-05</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-ORD-01</strong></td>
        <td>Pemesanan Langsung</td>
        <td>Pemesanan langsung (Direct Order) 1 jenis kerupuk dengan penambahan biaya varian rasa dan kemasan</td>
        <td>SKF-06, SKF-07</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-ORD-02</strong></td>
        <td>Pemesanan Langsung</td>
        <td>Pemesanan kerupuk dengan kuantitas melebihi sisa stok produk katalog yang tersedia</td>
        <td>SKF-07</td>
        <td style="text-align: center;"><span class="badge-neg">Negative</span></td>
      </tr>
      <tr>
        <td><strong>TS-CART-01</strong></td>
        <td>Keranjang Belanja</td>
        <td>Menampung multi-varian kerupuk dengan kombinasi rasa dan ukuran plastik berbeda di keranjang</td>
        <td>SKF-08, SKF-09</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-CART-02</strong></td>
        <td>Checkout Batch Keranjang</td>
        <td>Checkout batch keranjang multi-varian menjadi tepat 1 baris pesanan utama dan 1 pembayaran gabungan</td>
        <td>SKF-10</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <!-- PEMBAYARAN & OTORISASI -->
      <tr>
        <td><strong>TS-PAY-01</strong></td>
        <td>Metode Pembayaran</td>
        <td>Pemesanan dengan metode pembayaran Tunai (Cash on Delivery di kasir pabrik)</td>
        <td>SKF-11</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-PAY-02</strong></td>
        <td>Metode Pembayaran</td>
        <td>Pemesanan dengan metode pembayaran QRIS resmi pabrik (NMID ID1025393458506)</td>
        <td>SKF-12</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-PAY-03</strong></td>
        <td>Metode Pembayaran</td>
        <td>Pemesanan dengan metode Transfer Bank resmi (BCA/Mandiri/BJB) dan upload bukti screenshot transfer</td>
        <td>SKF-13</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-PAY-04</strong></td>
        <td>Otorisasi Kas Owner</td>
        <td>Owner mengesahkan pembayaran pesanan pending menjadi lunas (ACC Lunas Kasir) melalui dashboard</td>
        <td>SKF-14</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-PASS-01</strong></td>
        <td>Tanda Lunas Digital</td>
        <td>Penayangan stempel sah Tanda Lunas Digital (Digital Pass) pada akun pelanggan setelah disahkan Owner</td>
        <td>SKF-15</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-PASS-02</strong></td>
        <td>Tanda Lunas Digital</td>
        <td>Pelanggan mencoba mengakses Tanda Lunas Digital pada transaksi yang masih berstatus pending (belum lunas)</td>
        <td>SKF-15</td>
        <td style="text-align: center;"><span class="badge-neg">Negative</span></td>
      </tr>
      <!-- PEMBATALAN & SINKRONISASI STOK -->
      <tr>
        <td><strong>TS-CNCL-01</strong></td>
        <td>Pembatalan Pesanan</td>
        <td>Pelanggan membatalkan pesanan mandiri yang masih berstatus menunggu_diproses</td>
        <td>SKF-16</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-CNCL-02</strong></td>
        <td>Sinkronisasi Stok Refund</td>
        <td>Pengembalian otomatis stok bahan mentah (5 kg/bal), bumbu (1 kg/bal), dan plastik saat pesanan dibatalkan</td>
        <td>SKF-17</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-CNCL-03</strong></td>
        <td>Monitoring Batal Owner</td>
        <td>Pemantauan riwayat pesanan dibatalkan dan ketersediaan tombol kontak WhatsApp pelanggan di Owner</td>
        <td>SKF-18</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <!-- PRODUKSI & QC -->
      <tr>
        <td><strong>TS-PROD-01</strong></td>
        <td>Antrean Penggorengan</td>
        <td>Penayangan antrean wajan dapur lengkap dengan penanda waktu jam masuk pemesanan (WIB)</td>
        <td>SKF-19, SKF-20</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-PROD-02</strong></td>
        <td>Alur Penggorengan</td>
        <td>Pembaruan status dari Mulai Goreng (diproses) hingga Selesai Goreng / Kirim ke QC (siap_diverifikasi)</td>
        <td>SKF-21, SKF-22</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-QC-01</strong></td>
        <td>Verifikasi Kualitas Mutu</td>
        <td>Staf pembungkus mencatat hasil uji petik mutu kerenyahan dan kelayakan fisik kerupuk ke database</td>
        <td>SKF-23, SKF-24</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-QC-02</strong></td>
        <td>Transparansi Umpan Balik</td>
        <td>Hasil evaluasi mutu QC dari pembungkus tertampil langsung secara transparan di dashboard penggoreng</td>
        <td>SKF-25</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-QC-03</strong></td>
        <td>Pengemasan &amp; Selesai</td>
        <td>Staf pembungkus menyelesaikan pengemasan plastik pesanan dan mengubah status menjadi Siap Diambil</td>
        <td>SKF-26</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <!-- STOK & LAPORAN -->
      <tr>
        <td><strong>TS-STK-01</strong></td>
        <td>Sinkronisasi Stok Bahan</td>
        <td>Pemotongan stok otomatis bahan mentah gudang secara proporsional setiap terjadi transaksi baru</td>
        <td>SKF-27, SKF-28</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-STK-02</strong></td>
        <td>Restock Bahan Mentah</td>
        <td>Input pasokan bahan mentah baru dan sinkronisasi otomatis ke penambahan kuantitas bal katalog Owner</td>
        <td>SKF-29, SKF-30</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-FIN-01</strong></td>
        <td>Laporan Finansial Owner</td>
        <td>Kalkulasi otomatis metrik finansial: Omset, Realisasi Kas Masuk, Piutang, HPP (~70%), dan Laba Bersih (~30%)</td>
        <td>SKF-31, SKF-32, SKF-33</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-FIN-02</strong></td>
        <td>Cetak Resi Fisik A4</td>
        <td>Pencetakan dokumen kuitansi resi transaksi resmi pabrik di media cetak kertas format standar A4</td>
        <td>SKF-34</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
      <tr>
        <td><strong>TS-FIN-03</strong></td>
        <td>Cetak Laporan Pabrik A4</td>
        <td>Ekspor/cetak dokumen resmi Rekapitulasi Laporan Keuangan ber-Kop Pabrik Kerupuk Diansyah format A4</td>
        <td>SKF-35</td>
        <td style="text-align: center;"><span class="badge-pos">Positive</span></td>
      </tr>
    </tbody>
  </table>

  <div class="page-divider"></div>

  <!-- ============================================================================== -->
  <!-- BAGIAN B: TEST CASE -->
  <!-- ============================================================================== -->
  <h2>B. Test Case</h2>
  <p>
    Rincian kasus uji lengkap yang memuat kondisi awal (<em>Pre-Condition</em>), langkah pengujian beserta referensi ID Test Data (input), hasil yang diharapkan (<em>Expected Result</em>), serta hasil aktual pada sistem saat ini beserta status kelulusan (<strong>PASS / FAIL</strong>).
  </p>

  <p><strong>Tabel 4.2 Rincian Eksekusi Test Case Sistem:</strong></p>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;">ID</th>
        <th style="width: 15%;">Nama Test Case</th>
        <th style="width: 15%;">Pre-Condition</th>
        <th style="width: 25%;">Langkah &amp; Test Data</th>
        <th style="width: 23%;">Expected Result</th>
        <th style="width: 14%;">Actual Result &amp; Status</th>
      </tr>
    </thead>
    <tbody>
      <!-- REG & AUTH -->
      <tr>
        <td><strong>TC-REG-01</strong></td>
        <td>Registrasi data lengkap valid</td>
        <td>Halaman pendaftaran /register dibuka; pengguna belum terdaftar</td>
        <td>1. Buka <code>/register</code><br>2. Masukkan seluruh data valid<br>3. Klik tombol "Daftar"<br><strong>Data: TD-REG-01</strong></td>
        <td>Muncul spinner loading, alert sukses hijau tampil, akun tersimpan di Supabase, redirect otomatis ke /login.</td>
        <td>Loading aktif, alert sukses muncul, data tersimpan, redirect ke /login.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-REG-02</strong></td>
        <td>Registrasi field wajib kosong</td>
        <td>Formulir registrasi terbuka</td>
        <td>1. Buka <code>/register</code><br>2. Kosongkan Nama Lengkap &amp; Password<br>3. Klik "Daftar"<br><strong>Data: TD-REG-02</strong></td>
        <td>Sistem memblokir pengiriman formulir dan menampilkan pesan error validasi kolom wajib tidak boleh kosong.</td>
        <td>Pesan error merah tampil: "Harap lengkapi semua data wajib pada formulir pendaftaran."<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-REG-03</strong></td>
        <td>Registrasi No HP non-numerik</td>
        <td>Formulir registrasi terbuka</td>
        <td>1. Buka <code>/register</code><br>2. Ketikkan huruf alfabet pada kolom No HP<br>3. Submit form<br><strong>Data: TD-REG-03</strong></td>
        <td>Karakter non-angka diblokir seketika pada level pengetikan (onKeyDown) atau ditolak saat validasi submit.</td>
        <td>Karakter alfabet otomatis terhapus saat diketik; hanya angka integer yang diterima.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-REG-04</strong></td>
        <td>Registrasi password &lt; 6 char</td>
        <td>Formulir registrasi terbuka</td>
        <td>1. Buka <code>/register</code><br>2. Isi seluruh field valid, password diisi 5 karakter<br>3. Klik "Daftar"<br><strong>Data: TD-REG-04</strong></td>
        <td>Pengiriman diblokir dengan pesan kesalahan batasan domain minimal password adalah 6 karakter.</td>
        <td>Pesan error muncul: "Password minimal harus 6 karakter."<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-REG-05</strong></td>
        <td>Registrasi format email cacat</td>
        <td>Formulir registrasi terbuka</td>
        <td>1. Buka <code>/register</code><br>2. Masukkan email tanpa domain RFC yang valid<br>3. Klik "Daftar"<br><strong>Data: TD-REG-05</strong></td>
        <td>Pengiriman ditolak dengan pesan validasi format email tidak sesuai standar.</td>
        <td>Pesan validasi format email tidak valid muncul.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-AUTH-01</strong></td>
        <td>Login kredensial valid per-role</td>
        <td>Akun pengguna telah terdaftar di database</td>
        <td>1. Buka <code>/login</code><br>2. Masukkan username &amp; password akun Owner / Penggoreng / Pembungkus / Pelanggan<br>3. Klik Masuk<br><strong>Data: TD-AUTH-01</strong></td>
        <td>Kredensial bcrypt cocok, sesi cookie terbit, dan pengguna dialihkan ke rute dashboard sesuai perannya.</td>
        <td>Login berhasil, sesi aktif, redirect tepat ke dashboard masing-masing role.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-AUTH-02</strong></td>
        <td>Login dengan password salah</td>
        <td>Akun terdaftar di database</td>
        <td>1. Buka <code>/login</code><br>2. Masukkan username valid tapi password salah<br>3. Klik Masuk<br><strong>Data: TD-AUTH-02</strong></td>
        <td>Sistem menolak otentikasi dengan HTTP 401 dan menampilkan pesan kesalahan kredensial tidak cocok.</td>
        <td>Alert merah muncul: "Username atau password salah."<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-RBAC-01</strong></td>
        <td>Isolasi hak akses rute terlarang</td>
        <td>Pengguna sedang login sebagai Pelanggan</td>
        <td>1. Ketikkan URL <code>/dashboard/owner</code> secara langsung pada address bar browser<br>2. Tekan Enter<br><strong>Data: TD-RBAC-01</strong></td>
        <td>Role Guard memblokir render konten Owner, menampilkan layar merah peringatan akses ditolak dan tombol kembali.</td>
        <td>Halaman diblokir, muncul notifikasi akses ditolak khusus owner beserta tombol kembali.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <!-- ORDER & CART -->
      <tr>
        <td><strong>TC-ORD-01</strong></td>
        <td>Pemesanan langsung 1 bal kerupuk</td>
        <td>Login sebagai Pelanggan di <code>/dashboard/pelanggan</code></td>
        <td>1. Pilih Kerupuk Kentang<br>2. Klik "Pesan Sekarang"<br>3. Pilih rasa Balado (+Rp 5.000), kemasan 1/2 kg, bayar Tunai<br>4. Submit<br><strong>Data: TD-ORD-01</strong></td>
        <td>Tagihan dihitung Rp 165.000, pesanan tersimpan status menunggu_diproses, stok terpotong, notifikasi sukses tampil.</td>
        <td>Pesanan masuk status menunggu_diproses, total harga tepat Rp 165.000, stok terpotong.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-ORD-02</strong></td>
        <td>Pemesanan kuantitas melebihi stok</td>
        <td>Login sebagai Pelanggan</td>
        <td>1. Buka modal pesan Kerupuk Rafael (sisa stok 12 bal)<br>2. Masukkan kuantitas pesanan 20 bal<br>3. Submit pesanan<br><strong>Data: TD-ORD-02</strong></td>
        <td>Sistem memblokir pemesanan dengan pesan error domain bahwa stok produk tidak mencukupi permintaan.</td>
        <td>Muncul pesan penolakan: stok produk tidak mencukupi sisa stok.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-CART-01</strong></td>
        <td>Penambahan multi-varian ke cart</td>
        <td>Login sebagai Pelanggan</td>
        <td>1. Tambah Kerupuk Kentang Balado 2 bal ke cart<br>2. Tambah Kerupuk Jengkol Original 1 bal ke cart<br>3. Buka drawer keranjang<br><strong>Data: TD-CART-01</strong></td>
        <td>Drawer keranjang menampilkan kedua item dengan kalkulasi subtotal masing-masing dan grand total akumulasi.</td>
        <td>Kedua item tersimpan di drawer keranjang dengan subtotal dan grand total yang presisi.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-CART-02</strong></td>
        <td>Checkout batch keranjang belanja</td>
        <td>Keranjang berisi 2 varian kerupuk</td>
        <td>1. Buka drawer keranjang<br>2. Pilih metode bayar Tunai<br>3. Klik "Checkout Pesanan Sekarang"<br><strong>Data: TD-CART-02</strong></td>
        <td>Tersimpan tepat 1 baris di tabel pesanan dan 1 pembayaran gabungan; rincian varian tersimpan terstruktur JSON.</td>
        <td>Tersimpan 1 baris transaksi konsolidasi di tabel pesanan dan 1 entri pembayaran gabungan.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <!-- PAY & ACC -->
      <tr>
        <td><strong>TC-PAY-01</strong></td>
        <td>Pembayaran metode Tunai (COD)</td>
        <td>Pesanan baru dibuat</td>
        <td>1. Pilih metode "Tunai"<br>2. Submit transaksi<br><strong>Data: TD-PAY-01</strong></td>
        <td>Status pembayaran bernilai pending, banner peringatan belum lunas muncul, diinstruksikan bayar di kasir pabrik.</td>
        <td>Status pembayaran pending, instruksi kasir tunai tampil di dashboard pelanggan.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-PAY-02</strong></td>
        <td>Pembayaran metode QRIS pabrik</td>
        <td>Pesanan baru dibuat</td>
        <td>1. Pilih metode "QRIS"<br>2. Submit transaksi<br><strong>Data: TD-PAY-02</strong></td>
        <td>Gambar barcode QRIS resmi Pabrik Diansyah muncul dengan NMID ID1025393458506 beserta instruksi scan.</td>
        <td>Barcode QRIS resmi pabrik Diansyah tertampil jelas dengan panduan multi-bank.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-PAY-03</strong></td>
        <td>Transfer Bank &amp; upload bukti</td>
        <td>Pesanan baru dibuat</td>
        <td>1. Pilih metode "Transfer Bank (BCA)"<br>2. Salin no rek<br>3. Unggah berkas gambar screenshot bukti transfer<br><strong>Data: TD-PAY-03</strong></td>
        <td>Nomor rekening tersalin ke clipboard, berkas bukti transfer tersimpan di database/storage untuk diverifikasi Owner.</td>
        <td>Tombol salin no rek aktif dan bukti transfer terlampir pada rincian transaksi.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-PAY-04</strong></td>
        <td>ACC Lunas Kasir oleh Owner</td>
        <td>Login sebagai Owner di <code>/dashboard/owner</code>; ada pesanan pending</td>
        <td>1. Cari baris pesanan pelanggan pending<br>2. Klik tombol hijau "Konfirmasi Lunas"<br><strong>Data: TD-PAY-04</strong></td>
        <td>Status pembayaran berubah menjadi "lunas", tombol Cetak Resi aktif di Owner, realisasi kas masuk bertambah.</td>
        <td>Status pembayaran terverifikasi lunas seketika, metrik kas masuk owner bertambah otomatis.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-PASS-01</strong></td>
        <td>Akses Digital Pass setelah lunas</td>
        <td>Login sebagai Pelanggan; pesanan telah di-ACC lunas oleh Owner</td>
        <td>1. Buka tab "Pesanan Saya"<br>2. Klik tombol "Tunjukkan Tanda Lunas ke Owner"<br><strong>Data: TD-PASS-01</strong></td>
        <td>Modal Digital Pass terbuka menampilkan stempel sah "STATUS: LUNAS - SAH DITERIMA KASIR" dan detail order.</td>
        <td>Digital Pass berstempel resmi lunas muncul lengkap untuk ditunjukkan saat pengambilan kerupuk.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-PASS-02</strong></td>
        <td>Akses Digital Pass saat pending</td>
        <td>Login sebagai Pelanggan; pesanan masih pending (belum di-ACC)</td>
        <td>1. Buka tab "Pesanan Saya"<br>2. Periksa ketersediaan tombol Tanda Lunas<br><strong>Data: TD-PASS-02</strong></td>
        <td>Tombol Tanda Lunas tidak aktif/disembunyikan; muncul banner peringatan kuning "STATUS PEMBAYARAN: BELUM LUNAS".</td>
        <td>Tombol tanda lunas tidak muncul; banner kuning belum lunas memperingatkan pelanggan untuk bayar.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <!-- CANCEL & STOCK -->
      <tr>
        <td><strong>TC-CNCL-01</strong></td>
        <td>Pembatalan pesanan mandiri</td>
        <td>Login sebagai Pelanggan; pesanan status menunggu_diproses</td>
        <td>1. Buka tab "Pesanan Saya"<br>2. Klik "Batalkan Pesanan"<br>3. Konfirmasi modal pembatalan<br><strong>Data: TD-CNCL-01</strong></td>
        <td>Status pesanan beralih menjadi "dibatalkan", pesanan berpindah ke riwayat pembatalan, dan tercatat di Owner.</td>
        <td>Pesanan berhasil dibatalkan mandiri dan tercatat lengkap di dashboard pembatalan Owner.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-CNCL-02</strong></td>
        <td>Pengembalian stok bahan saat batal</td>
        <td>Pesanan 2 bal Kerupuk Kentang dibatalkan</td>
        <td>1. Batalkan pesanan TC-CNCL-01<br>2. Periksa stok katalog dan stok_bahan gudang<br><strong>Data: TD-CNCL-02</strong></td>
        <td>Stok produk kembali +2 bal; kerupuk mentah kembali +10 kg; bumbu kembali +2 kg; kemasan kembali +2 pack.</td>
        <td>Fungsi refundAllMaterialsOnCancel sukses mengembalikan seluruh bahan gudang secara presisi.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <!-- KITCHEN & QC -->
      <tr>
        <td><strong>TC-PROD-01</strong></td>
        <td>Antrean wajan penggorengan WIB</td>
        <td>Login sebagai Staf Penggoreng di <code>/dashboard/staff-penggoreng</code></td>
        <td>1. Periksa daftar kartu wajan antrean produksi<br><strong>Data: TD-PROD-01</strong></td>
        <td>Menampilkan target jumlah bal, varian rasa, nama produk, dan penanda waktu jam masuk pemesanan (WIB).</td>
        <td>Kartu antrean menampilkan pesanan dengan format jam WIB dan instruksi varian rasa yang jelas.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-PROD-02</strong></td>
        <td>Transisi status penggorengan</td>
        <td>Pesanan status menunggu di antrean wajan</td>
        <td>1. Klik tombol "Mulai Goreng"<br>2. Setelah matang, klik "Selesai Goreng (Kirim ke QC)"<br><strong>Data: TD-PROD-02</strong></td>
        <td>Status produksi beralih dari "menunggu" &rarr; "diproses" &rarr; "siap_diverifikasi" (berpindah ke staf pembungkus).</td>
        <td>Status produksi terbarui dan pesanan otomatis masuk ke antrean verifikasi staf pembungkus.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-QC-01</strong></td>
        <td>Uji petik mutu QC pembungkus</td>
        <td>Login sebagai Staf Pembungkus di <code>/dashboard/staff-pembungkus</code></td>
        <td>1. Buka modal QC<br>2. Pilih "Lolos Verifikasi"<br>3. Input catatan mutu: "Kerenyahan sempurna, mekar baik"<br>4. Simpan<br><strong>Data: TD-QC-01</strong></td>
        <td>Hasil evaluasi tersimpan di tabel verifikasi_produksi, status produksi berubah menjadi "sedang_dikemas".</td>
        <td>Data tersimpan di tabel verifikasi dan kartu tugas menampilkan status sedang dikemas.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-QC-02</strong></td>
        <td>Transparansi umpan balik mutu QC</td>
        <td>Catatan QC telah diinput oleh staf pembungkus</td>
        <td>1. Login sebagai Staf Penggoreng<br>2. Buka kartu tugas penggorengan terkait<br><strong>Data: TD-QC-02</strong></td>
        <td>Catatan evaluasi mutu kerenyahan dari staf pembungkus tertampil langsung pada kartu tugas penggoreng.</td>
        <td>Staf penggoreng dapat membaca langsung umpan balik mutu hasil gorengannya secara transparan.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-QC-03</strong></td>
        <td>Penyelesaian kemas siap diambil</td>
        <td>Kerupuk telah lolos QC dan dikemas rapi</td>
        <td>1. Klik tombol "Selesai Kemas (Siap Diambil)" di dashboard pembungkus<br><strong>Data: TD-QC-03</strong></td>
        <td>Status produksi dan status akhir pesanan beralih menjadi "selesai"; pesanan siap diserahkan ke pelanggan.</td>
        <td>Status transaksi dan produksi berubah menjadi selesai, notifikasi siap diambil aktif.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <!-- RESTOCK & REPORT -->
      <tr>
        <td><strong>TC-STK-01</strong></td>
        <td>Restock bahan mentah &amp; sync katalog</td>
        <td>Staf/Owner membuka modul stok bahan</td>
        <td>1. Input pasokan masuk 50 Kg Kerupuk Mentah Kentang<br>2. Simpan formulir restock<br><strong>Data: TD-STK-01</strong></td>
        <td>Stok bahan gudang bertambah +50 Kg; stok bal siap jual pada katalog produk Owner bertambah otomatis +10 Bal.</td>
        <td>Rasio konversi 5 Kg = 1 Bal sukses menyinkronkan penambahan stok bahan ke katalog produk jadi.<br><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-FIN-01</strong></td>
        <td>Kalkulasi finansial &amp; cetak A4</td>
        <td>Login sebagai Owner di <code>/dashboard/owner</code></td>
        <td>1. Periksa ringkasan finansial<br>2. Klik Cetak Resi &amp; Cetak Laporan Keuangan A4<br><strong>Data: TD-FIN-01</strong></td>
        <td>Metrik Omset, HPP (~70%), Laba (~30%) akurat; dokumen cetak A4 bergaris dengan Kop Pabrik siap cetak.</td>
        <td>Perhitungan finansial otomatis presisi, print engine menghasilkan dokumen resmi A4 bergaris rapi.<br><span class="badge-pass">PASS</span></td>
      </tr>
    </tbody>
  </table>

  <div class="page-divider"></div>

  <!-- ============================================================================== -->
  <!-- BAGIAN C: TEST DATA -->
  <!-- ============================================================================== -->
  <h2>C. Test Data</h2>
  <p>
    Kumpulan data masukan terstandarisasi yang disiapkan untuk mengeksekusi seluruh kasus uji pada Tabel 4.2. Klasifikasi data mencakup data normal (<em>Valid</em>), data salah (<em>Invalid</em>), dan data batas (<em>Boundary</em>) untuk memverifikasi ketahanan sistem secara objektif.
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 12%;">ID Test Data</th>
        <th style="width: 20%;">Data yang Diuji</th>
        <th style="width: 32%;">Nilai Data Masukan</th>
        <th style="width: 12%; text-align: center;">Jenis Data</th>
        <th style="width: 10%;">Digunakan pada</th>
        <th style="width: 14%;">Keterangan</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>TD-REG-01</strong></td>
        <td>Kredensial registrasi lengkap</td>
        <td>Nama: Budi Santoso, User: budi_santoso, Email: budi@gmail.com, Pass: budi12345, HP: 081234567890, Alamat: Jl. Angkrek 12 Sumedang</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-REG-01</td>
        <td>Data dummy pelanggan baru valid</td>
      </tr>
      <tr>
        <td><strong>TD-REG-02</strong></td>
        <td>Field wajib dikosongkan</td>
        <td>Nama Lengkap = "" (string kosong), Password = "" (string kosong)</td>
        <td style="text-align: center;"><span class="badge-invalid">Invalid</span></td>
        <td>TC-REG-02</td>
        <td>Uji Existence Check formulir</td>
      </tr>
      <tr>
        <td><strong>TD-REG-03</strong></td>
        <td>Nomor telepon non-angka</td>
        <td>No HP = "0812-abcd-efgh" atau karakter non-numerik</td>
        <td style="text-align: center;"><span class="badge-invalid">Invalid</span></td>
        <td>TC-REG-03</td>
        <td>Uji Data Type Check (integer only)</td>
      </tr>
      <tr>
        <td><strong>TD-REG-04</strong></td>
        <td>Password di bawah batas</td>
        <td>Password = "12345" (tepat 5 karakter, batas min 6)</td>
        <td style="text-align: center;"><span class="badge-boundary">Boundary</span></td>
        <td>TC-REG-04</td>
        <td>Uji Boundary Value Analysis</td>
      </tr>
      <tr>
        <td><strong>TD-REG-05</strong></td>
        <td>Email tanpa format RFC</td>
        <td>Email = "budi_santoso" atau "budi@" (tanpa domain TLD)</td>
        <td style="text-align: center;"><span class="badge-invalid">Invalid</span></td>
        <td>TC-REG-05</td>
        <td>Uji Format Check regex</td>
      </tr>
      <tr>
        <td><strong>TD-AUTH-01</strong></td>
        <td>Akun master sah 4 role</td>
        <td>Owner (owner / owner123), Penggoreng (penggoreng / goreng123), Pembungkus (pembungkus / bungkus123), Pelanggan (budi_santoso / budi12345)</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-AUTH-01</td>
        <td>Akun resmi pre-seeded di Supabase</td>
      </tr>
      <tr>
        <td><strong>TD-AUTH-02</strong></td>
        <td>Password salah</td>
        <td>Username = "owner", Password = "passwordSalah123"</td>
        <td style="text-align: center;"><span class="badge-invalid">Invalid</span></td>
        <td>TC-AUTH-02</td>
        <td>Password tidak cocok dengan hash bcrypt</td>
      </tr>
      <tr>
        <td><strong>TD-RBAC-01</strong></td>
        <td>URL direct browsing</td>
        <td>URL = <code>http://localhost:3000/dashboard/owner</code> saat login sebagai peran pelanggan</td>
        <td style="text-align: center;"><span class="badge-invalid">Invalid</span></td>
        <td>TC-RBAC-01</td>
        <td>Uji Role Guard middleware</td>
      </tr>
      <tr>
        <td><strong>TD-ORD-01</strong></td>
        <td>Direct order 1 bal</td>
        <td>Produk: Kerupuk Kentang (Rp 160.000), Rasa: Balado Manis Pedas (+Rp 5.000), Kemasan: 1/2 kg (+Rp 0), Qty: 1 Bal</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-ORD-01</td>
        <td>Kalkulasi total tagihan Rp 165.000</td>
      </tr>
      <tr>
        <td><strong>TD-ORD-02</strong></td>
        <td>Kuantitas melebihi batas stok</td>
        <td>Produk: Kerupuk Rafael (sisa stok: 12 Bal), Kuantitas pesanan diminta: 20 Bal</td>
        <td style="text-align: center;"><span class="badge-boundary">Boundary</span></td>
        <td>TC-ORD-02</td>
        <td>Uji Domain Check batas stok gudang</td>
      </tr>
      <tr>
        <td><strong>TD-CART-01</strong></td>
        <td>Item multi-varian keranjang</td>
        <td>Item 1: 2 Bal Kerupuk Kentang (Pedas, 1/2 kg); Item 2: 1 Bal Kerupuk Jengkol (Original, 1x25 kg)</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-CART-01</td>
        <td>Uji Multi-Item Cart Storage</td>
      </tr>
      <tr>
        <td><strong>TD-CART-02</strong></td>
        <td>Batch checkout payload</td>
        <td>Payload JSON: { items: [ {id_produk: 1, jumlah: 2, ...}, {id_produk: 2, jumlah: 1, ...} ], metode: "tunai" }</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-CART-02</td>
        <td>Uji konsolidasi 1 baris transaksi</td>
      </tr>
      <tr>
        <td><strong>TD-PAY-01</strong></td>
        <td>Metode bayar Tunai</td>
        <td>metode_pembayaran = "tunai", status awal = "pending"</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-PAY-01</td>
        <td>Pembayaran tunai di kasir pabrik</td>
      </tr>
      <tr>
        <td><strong>TD-PAY-02</strong></td>
        <td>Metode bayar QRIS</td>
        <td>metode_pembayaran = "qris", NMID = "ID1025393458506"</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-PAY-02</td>
        <td>Barcode dinamis QRIS Diansyah</td>
      </tr>
      <tr>
        <td><strong>TD-PAY-03</strong></td>
        <td>Transfer Bank &amp; bukti</td>
        <td>metode = "transfer", bank = "BCA (Rek: 1480-992-110)", file = "bukti_transfer_budi.jpg"</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-PAY-03</td>
        <td>Bukti transfer rekening Owner</td>
      </tr>
      <tr>
        <td><strong>TD-PAY-04</strong></td>
        <td>ACC Lunas Owner</td>
        <td>id_pembayaran = [ID], action = "konfirmasi_lunas", status baru = "lunas"</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-PAY-04</td>
        <td>Otorisasi tunggal kas masuk kasir</td>
      </tr>
      <tr>
        <td><strong>TD-PASS-01</strong></td>
        <td>Digital Pass lunas</td>
        <td>Status pembayaran = "lunas", Nomor = "TRX-KD-[ID]", Stempel = "SAH DITERIMA KASIR"</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-PASS-01</td>
        <td>Bukti fisik serah terima kerupuk</td>
      </tr>
      <tr>
        <td><strong>TD-PASS-02</strong></td>
        <td>Digital Pass belum lunas</td>
        <td>Status pembayaran = "pending"</td>
        <td style="text-align: center;"><span class="badge-invalid">Invalid</span></td>
        <td>TC-PASS-02</td>
        <td>Tombol digital pass wajib dicegah</td>
      </tr>
      <tr>
        <td><strong>TD-CNCL-01</strong></td>
        <td>Pembatalan pesanan</td>
        <td>id_pesanan = [ID], status awal = "menunggu_diproses", status baru = "dibatalkan"</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-CNCL-01</td>
        <td>Uji state transition pembatalan</td>
      </tr>
      <tr>
        <td><strong>TD-CNCL-02</strong></td>
        <td>Kuantitas refund stok</td>
        <td>Pesanan 2 Bal Kentang Balado &rarr; Refund: Kerupuk Mentah +10 Kg, Bumbu Balado +2 Kg, Plastik 1/2kg +2 Pack</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-CNCL-02</td>
        <td>Uji presisi formula pengembalian</td>
      </tr>
      <tr>
        <td><strong>TD-PROD-01</strong></td>
        <td>Penanda jam antrean dapur</td>
        <td>Format waktu: "HH:mm:ss WIB" (Waktu Indonesia Barat UTC+7) pada kartu antrean wajan</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-PROD-01</td>
        <td>Verifikasi zona waktu WIB pabrik</td>
      </tr>
      <tr>
        <td><strong>TD-PROD-02</strong></td>
        <td>Transisi status goreng</td>
        <td>status_produksi awal = "menunggu" &rarr; "diproses" &rarr; "siap_diverifikasi"</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-PROD-02</td>
        <td>Uji siklus hidup produksi penggorengan</td>
      </tr>
      <tr>
        <td><strong>TD-QC-01</strong></td>
        <td>Catatan evaluasi mutu QC</td>
        <td>status = "Lolos Verifikasi", keterangan = "Kerenyahan sempurna, mekar baik, kadar minyak rendah"</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-QC-01</td>
        <td>Data uji petik mutu QC staf pembungkus</td>
      </tr>
      <tr>
        <td><strong>TD-QC-02</strong></td>
        <td>Umpan balik mutu QC</td>
        <td>Relasi id_produksi &rarr; id_verifikasi pada kartu staf penggoreng</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-QC-02</td>
        <td>Uji transparansi antar-divisi pabrik</td>
      </tr>
      <tr>
        <td><strong>TD-QC-03</strong></td>
        <td>Penyelesaian kemas</td>
        <td>status_produksi = "selesai", status_pesanan = "selesai"</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-QC-03</td>
        <td>Tahap akhir penyerahan barang</td>
      </tr>
      <tr>
        <td><strong>TD-STK-01</strong></td>
        <td>Restock pasokan gudang</td>
        <td>Nama bahan: "Kerupuk Mentah Kentang", Kuantitas masuk: +50 Kg &rarr; Sync katalog: +10 Bal</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-STK-01</td>
        <td>Uji rasio konversi 5 Kg = 1 Bal</td>
      </tr>
      <tr>
        <td><strong>TD-FIN-01</strong></td>
        <td>Formula laba rugi pabrik</td>
        <td>Omset Penjualan = 100%, HPP = 70% dari omset, Estimasi Laba Bersih = 30% dari omset</td>
        <td style="text-align: center;"><span class="badge-valid">Valid</span></td>
        <td>TC-FIN-01</td>
        <td>Uji formula keuangan SOP pabrik</td>
      </tr>
    </tbody>
  </table>

  <div class="page-divider"></div>

  <!-- ============================================================================== -->
  <!-- BAGIAN D: TRACEABILITY MATRIX -->
  <!-- ============================================================================== -->
  <h2>D. Traceability Matrix</h2>
  <p>
    Matriks Keterlacakan (<em>Traceability Matrix</em>) memetakan seluruh Kebutuhan Fungsional (SKF) pada SRS E-KRUPSY v2.0 ke Test Scenario ID dan Test Case ID sehingga setiap requirement memiliki pengujian yang dapat diverifikasi status keterpenuhannya (<strong>PASS / FAIL</strong>).
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 14%;">Requirement (SRS)</th>
        <th style="width: 44%;">Deskripsi Kebutuhan Fungsional</th>
        <th style="width: 16%;">Test Scenario ID</th>
        <th style="width: 16%;">Test Case ID</th>
        <th style="width: 10%; text-align: center;">Status</th>
      </tr>
    </thead>
    <tbody>
      <!-- SKF 01 s/d 04 -->
      <tr>
        <td><strong>SKF-01</strong></td>
        <td>Registrasi Akun Pelanggan Baru dengan data lengkap dan valid</td>
        <td>TS-REG-01</td>
        <td>TC-REG-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-02</strong></td>
        <td>Validasi Formulir 4 Lapis Pendaftaran (Existence, Data Type, Domain, Format)</td>
        <td>TS-REG-02 s/d 05</td>
        <td>TC-REG-02 s/d 05</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-03</strong></td>
        <td>Autentikasi Pengguna &amp; Keamanan Password menggunakan enkripsi hash bcrypt</td>
        <td>TS-LOGIN-01, 02</td>
        <td>TC-AUTH-01, 02</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-04</strong></td>
        <td>Role-Based Access Control (RBAC): Isolasi hak akses rute dashboard 4 aktor</td>
        <td>TS-RBAC-01</td>
        <td>TC-RBAC-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <!-- SKF 05 s/d 10 -->
      <tr>
        <td><strong>SKF-05</strong></td>
        <td>Penayangan Katalog Produk Kerupuk Dinamis bersumber dari database Supabase</td>
        <td>TS-KAT-01</td>
        <td>TC-ORD-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-06</strong></td>
        <td>Kustomisasi Varian Rasa &amp; Ukuran Kemasan Plastik dengan kalkulasi biaya dinamis</td>
        <td>TS-ORD-01</td>
        <td>TC-ORD-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-07</strong></td>
        <td>Pemesanan Langsung (Direct Order) 1 jenis produk kerupuk secara instan</td>
        <td>TS-ORD-01, 02</td>
        <td>TC-ORD-01, 02</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-08</strong></td>
        <td>Keranjang Belanja Multi-Varian sementara (Client-Side Cart Storage)</td>
        <td>TS-CART-01</td>
        <td>TC-CART-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-09</strong></td>
        <td>Manajemen Item Keranjang (tambah, kurangi kuantitas, hapus varian kerupuk)</td>
        <td>TS-CART-01</td>
        <td>TC-CART-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-10</strong></td>
        <td>Checkout Batch Keranjang menjadi tepat 1 baris pesanan dan 1 pembayaran gabungan</td>
        <td>TS-CART-02</td>
        <td>TC-CART-02</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <!-- SKF 11 s/d 15 -->
      <tr>
        <td><strong>SKF-11</strong></td>
        <td>Metode Pembayaran Tunai (Cash on Delivery di kasir pabrik) berstatus pending</td>
        <td>TS-PAY-01</td>
        <td>TC-PAY-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-12</strong></td>
        <td>Metode Pembayaran QRIS Dinamis ber-NMID resmi Pabrik Kerupuk Diansyah</td>
        <td>TS-PAY-02</td>
        <td>TC-PAY-02</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-13</strong></td>
        <td>Metode Pembayaran Transfer Bank Resmi (BCA/Mandiri/BJB) dan upload screenshot bukti</td>
        <td>TS-PAY-03</td>
        <td>TC-PAY-03</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-14</strong></td>
        <td>Hak Otorisasi Lunas Tunggal pada Owner (ACC Kasir) melalui dashboard Owner</td>
        <td>TS-PAY-04</td>
        <td>TC-PAY-04</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-15</strong></td>
        <td>Tanda Lunas Digital (Digital Pass) berstempel sah hanya muncul setelah status lunas</td>
        <td>TS-PASS-01, 02</td>
        <td>TC-PASS-01, 02</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <!-- SKF 16 s/d 18 -->
      <tr>
        <td><strong>SKF-16</strong></td>
        <td>Hak Pembatalan Pesanan Mandiri oleh Pelanggan saat status masih menunggu_diproses</td>
        <td>TS-CNCL-01</td>
        <td>TC-CNCL-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-17</strong></td>
        <td>Sinkronisasi Pengembalian Stok Otomatis (kerupuk mentah, bumbu, plastik) saat batal</td>
        <td>TS-CNCL-02</td>
        <td>TC-CNCL-02</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-18</strong></td>
        <td>Tab Monitoring Pembatalan &amp; Tombol Kontak WhatsApp Pelanggan di Dashboard Owner</td>
        <td>TS-CNCL-03</td>
        <td>TC-CNCL-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <!-- SKF 19 s/d 22 -->
      <tr>
        <td><strong>SKF-19</strong></td>
        <td>Antrean Wajan Penggorengan Real-Time berurutan berdasarkan pesanan masuk</td>
        <td>TS-PROD-01</td>
        <td>TC-PROD-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-20</strong></td>
        <td>Penanda Waktu Jam Masuk Pemesanan format Waktu Indonesia Barat (WIB)</td>
        <td>TS-PROD-01</td>
        <td>TC-PROD-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-21</strong></td>
        <td>Pembaruan Status Penggorengan "Mulai Goreng" (status produksi menjadi diproses)</td>
        <td>TS-PROD-02</td>
        <td>TC-PROD-02</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-22</strong></td>
        <td>Penyelesaian Penggorengan "Selesai Goreng (Kirim ke QC)" (status siap_diverifikasi)</td>
        <td>TS-PROD-02</td>
        <td>TC-PROD-02</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <!-- SKF 23 s/d 26 -->
      <tr>
        <td><strong>SKF-23</strong></td>
        <td>Antrean Verifikasi Kualitas Mutu (QC) di Dashboard Staf Pembungkus</td>
        <td>TS-QC-01</td>
        <td>TC-QC-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-24</strong></td>
        <td>Pencatatan Hasil Uji Petik Kerenyahan dan Kelayakan Mutu ke tabel verifikasi_produksi</td>
        <td>TS-QC-01</td>
        <td>TC-QC-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-25</strong></td>
        <td>Transparansi Umpan Balik Mutu QC ke Dashboard Staf Penggoreng secara otomatis</td>
        <td>TS-QC-02</td>
        <td>TC-QC-02</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-26</strong></td>
        <td>Penyelesaian Pengemasan Plastik &amp; Status Akhir Transaksi "Siap Diambil" (selesai)</td>
        <td>TS-QC-03</td>
        <td>TC-QC-03</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <!-- SKF 27 s/d 30 -->
      <tr>
        <td><strong>SKF-27</strong></td>
        <td>Pemantauan Inventori Stok Gudang 3 Kategori (Kerupuk Mentah, Bumbu, Kemasan Plastik)</td>
        <td>TS-STK-01</td>
        <td>TC-ORD-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-28</strong></td>
        <td>Pemotongan Stok Bahan Baku Otomatis Proporsional saat transaksi pemesanan baru dibuat</td>
        <td>TS-STK-01</td>
        <td>TC-ORD-01, TC-CART-02</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-29</strong></td>
        <td>Pencatatan Restock Pasokan Bahan Mentah Masuk dari Supplier oleh Staf/Owner</td>
        <td>TS-STK-02</td>
        <td>TC-STK-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-30</strong></td>
        <td>Sinkronisasi Otomatis Pasokan Bahan Mentah ke Kuantitas Stok Bal Katalog Siap Jual</td>
        <td>TS-STK-02</td>
        <td>TC-STK-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <!-- SKF 31 s/d 35 -->
      <tr>
        <td><strong>SKF-31</strong></td>
        <td>Ringkasan Eksekutif Finansial: Total Omset, Realisasi Kas, Piutang, HPP, &amp; Laba Bersih</td>
        <td>TS-FIN-01</td>
        <td>TC-FIN-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-32</strong></td>
        <td>Grafik Interaktif Tren Penjualan dengan filter Harian, Mingguan, dan Bulanan</td>
        <td>TS-FIN-01</td>
        <td>TC-FIN-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-33</strong></td>
        <td>Rekapitulasi Saluran Pembayaran (Tunai vs QRIS vs Transfer) &amp; Kontribusi Varian Rasa</td>
        <td>TS-FIN-01</td>
        <td>TC-FIN-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-34</strong></td>
        <td>Pencetakan Kuitansi Resi Fisik Resmi Transaksi berstandar format kertas A4</td>
        <td>TS-FIN-02</td>
        <td>TC-FIN-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>SKF-35</strong></td>
        <td>Pencetakan Dokumen Resmi Laporan Keuangan ber-Kop Pabrik Diansyah format A4</td>
        <td>TS-FIN-03</td>
        <td>TC-FIN-01</td>
        <td style="text-align: center;"><span class="badge-pass">PASS</span></td>
      </tr>
    </tbody>
  </table>

  <!-- ============================================================================== -->
  <!-- BAGIAN E: DEFECT REPORT (LANGKAH 6 ALUR TRACEABILITY) -->
  <!-- ============================================================================== -->
  <h2>E. Laporan Cacat Sistem Riil (Defect Report)</h2>
  <p>
    Sesuai Langkah 6 alur pengujian dokumen template ("<em>Jika tidak sesuai: Defect Report</em>"), tabel berikut mencatat temuan audit teknis kode sumber aktual yang memerlukan perbaikan lanjutan sebelum rilis ke lingkungan produksi komersial:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 12%;">ID Defect</th>
        <th style="width: 22%;">Komponen / Berkas</th>
        <th style="width: 12%; text-align: center;">Tingkat Keparahan</th>
        <th style="width: 30%;">Deskripsi Ketidaksesuaian Teknis</th>
        <th style="width: 24%;">Rekomendasi Perbaikan (Remediasi)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>DF-AUTH-01</strong></td>
        <td><code>app/api/auth/login/route.ts</code> (L121)</td>
        <td style="text-align: center;"><span class="badge-fail">Tinggi (High)</span></td>
        <td>Atribut cookie sesi disetel <code>httpOnly: false</code>, berpotensi terbaca oleh JavaScript browser saat terjadi serangan XSS.</td>
        <td>Ubah atribut cookie menjadi <code>httpOnly: true</code> agar hanya dapat diakses melalui header HTTP server.</td>
      </tr>
      <tr>
        <td><strong>DF-AUTH-02</strong></td>
        <td><code>app/api/auth/login/route.ts</code> (L120)</td>
        <td style="text-align: center;"><span class="badge-fail">Tinggi (High)</span></td>
        <td>Data sesi pengguna disimpan dalam bentuk plaintext JSON mentah tanpa enkripsi atau tanda tangan digital (signing).</td>
        <td>Terapkan penandatanganan token menggunakan standard JWT (JSON Web Token) dengan algoritma HMAC-SHA256.</td>
      </tr>
      <tr>
        <td><strong>DF-STK-01</strong></td>
        <td><code>app/api/pesanan/route.ts</code> (L218–231)</td>
        <td style="text-align: center;"><span class="badge-boundary">Sedang (Med-High)</span></td>
        <td>Pengecekan stok dan pengurangan stok berjalan terpisah (non-atomic), berpotensi <em>race condition</em> pada stok bal terakhir.</td>
        <td>Gunakan Stored Procedure (RPC) PostgreSQL di Supabase dengan klausa <code>SELECT FOR UPDATE</code>.</td>
      </tr>
      <tr>
        <td><strong>DF-DB-01</strong></td>
        <td><code>supabase-schema.sql</code> (L179–187)</td>
        <td style="text-align: center;"><span class="badge-boundary">Sedang (Medium)</span></td>
        <td>Row Level Security (RLS) dinonaktifkan sementara pada seluruh tabel publik database Supabase.</td>
        <td>Aktifkan kembali RLS dan buat security policy per-role sebelum sistem dirilis ke domain publik.</td>
      </tr>
    </tbody>
  </table>

  <div class="callout-box">
    <strong>Kesimpulan Hasil Pengujian Traceability:</strong> Seluruh 35 butir kebutuhan fungsional (SKF-01 s.d. SKF-35) telah memiliki pemetaan pengujian yang lengkap pada Test Scenario, Test Case, dan Test Data. Seluruh 27 kasus uji fungsional dan integrasi bisnis Make-To-Order berstatus <strong>PASS (100% Lulus)</strong> pada pengujian fungsionalitas sistem berjalan saat ini, dan 4 temuan teknis pada Defect Report telah didokumentasikan untuk fase pengerasan keamanan (security hardening).
  </div>

  <div class="footer-note">
    Dokumen Test Scenario, Test Case, Test Data, dan Traceability Matrix v1.0 | Pabrik Kerupuk Diansyah Sumedang | Tanggal: 24 November 2026
  </div>

</div>

<!-- ============================================================================== -->
<!-- BACK COVER PAGE -->
<!-- ============================================================================== -->
<div class="back-cover-container">
  <div class="back-cover-card">
    <img src="data:image/jpeg;base64,${logoBase64}" alt="Logo E-KrupSy" style="width: 36mm; height: 36mm; border-radius: 50%; object-fit: cover; border: 3px solid #d97706; margin-bottom: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.18);" />
    <div style="font-size: 15pt; font-weight: 900; color: #0f172a; margin-bottom: 4px;">E-KRUPSY</div>
    <div style="font-size: 9.5pt; font-weight: 700; color: #1e3a8a; margin-bottom: 12px;">Sistem Informasi Pemesanan dan Manajemen Produksi Kerupuk</div>
    <div style="font-size: 8.5pt; color: #475569; line-height: 1.5; margin-bottom: 16px;">
      Dokumen Test Scenario, Test Case, Test Data, dan Traceability Matrix ini disusun dan diverifikasi sesuai standar baku rekayasa perangkat lunak IEEE Std 829-2008 / ISO/IEC/IEEE 29148.<br>
      Studi Kasus: <strong>Pabrik Kerupuk Diansyah, Sumedang, Jawa Barat</strong>.
    </div>
    <div style="font-size: 8pt; font-weight: 600; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px;">
      &copy; 2026 Tim Pengembang &amp; QA Kelompok 4 / IF-46-01.<br>Seluruh hak cipta dilindungi undang-undang.
    </div>
  </div>
</div>

</body>
</html>
`;

// Simpan file HTML generator
const htmlFilePath = path.resolve('TEST_SCENARIO_TEST_CASE_TRACEABILITY_MATRIX_E-KRUPSY.html');
const pdfFilePath = path.resolve('TEST_SCENARIO_TEST_CASE_TRACEABILITY_MATRIX_E-KRUPSY.pdf');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
console.log('HTML file written to:', htmlFilePath);

// Generate PDF via Headless Chrome
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fileUrl = 'file:///' + htmlFilePath.replace(/\\/g, '/');
console.log('Executing Headless Chrome print-to-pdf...');
execSync('"' + chromePath + '" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="' + pdfFilePath + '" "' + fileUrl + '"');

const stats = fs.statSync(pdfFilePath);
console.log('SUCCESS: PDF Generated at:', pdfFilePath, 'Size:', stats.size, 'bytes');

// Salin juga ke artifact directory
const artifactDest = 'C:/Users/Asus/.gemini/antigravity/brain/31d9de20-650f-46df-916b-e9304f602f73/TEST_SCENARIO_TEST_CASE_TRACEABILITY_MATRIX_E-KRUPSY.pdf';
fs.copyFileSync(pdfFilePath, artifactDest);
console.log('Copied to artifact dir successfully.');
