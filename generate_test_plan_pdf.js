const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Baca gambar cover dan back-cover asli dari docx template
const img1Base64 = fs.readFileSync('C:/Users/Asus/.gemini/antigravity/brain/31d9de20-650f-46df-916b-e9304f602f73/docx_extracted/word/media/image1.jpg').toString('base64');
const img2Base64 = fs.readFileSync('C:/Users/Asus/.gemini/antigravity/brain/31d9de20-650f-46df-916b-e9304f602f73/docx_extracted/word/media/image2.jpg').toString('base64');
const logoBase64 = fs.readFileSync('c:/Users/Asus/Documents/E-KRUPSY/public/images/logo-ekrupsy.jpg').toString('base64');
const navbarBrandBase64 = fs.readFileSync('c:/Users/Asus/Documents/E-KRUPSY/public/images/navbar-brand.png').toString('base64');

console.log('All images and logos loaded successfully.');

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>TEST PLAN - Sistem Informasi E-KRUPSY</title>
<style>
  @page {
    size: A4;
    margin: 18mm 18mm 20mm 18mm;
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
    line-height: 1.55;
    font-size: 10pt;
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
    padding: 32mm 24mm 26mm 24mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .cover-top {
    max-width: 135mm;
  }

  .cover-badge {
    display: inline-block;
    background: #0f172a;
    color: #ffffff;
    font-size: 8.5pt;
    font-weight: 700;
    letter-spacing: 1.5px;
    padding: 4px 12px;
    border-radius: 4px;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .cover-title {
    font-size: 40pt;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: 2.5px;
    line-height: 1.05;
    margin: 0 0 14px 0;
  }

  .cover-subtitle {
    font-size: 13.5pt;
    font-weight: 700;
    color: #1e3a8a;
    line-height: 1.35;
    margin: 0 0 8px 0;
  }

  .cover-case-study {
    font-size: 10.5pt;
    font-weight: 600;
    color: #475569;
    line-height: 1.4;
    margin: 0 0 16px 0;
    border-left: 3px solid #3b82f6;
    padding-left: 10px;
  }

  .cover-class {
    font-size: 11pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .cover-bottom {
    max-width: 140mm;
    background: rgba(255, 255, 255, 0.94);
    padding: 18px 20px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }

  .cover-section-title {
    font-size: 8.5pt;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 6px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 3px;
  }

  .cover-member-list {
    margin: 0 0 12px 0;
    padding: 0;
    list-style: none;
    font-size: 9.5pt;
    color: #0f172a;
    line-height: 1.45;
  }

  .cover-member-list li {
    margin-bottom: 3px;
  }

  .cover-member-list strong {
    color: #1e3a8a;
  }

  .cover-lecturers {
    font-size: 9.5pt;
    color: #0f172a;
    margin: 0 0 10px 0;
    line-height: 1.4;
  }

  .cover-date {
    font-size: 9pt;
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
    padding-top: 4px;
  }

  .doc-header-banner {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 5px solid #1e40af;
    padding: 10px 14px;
    margin-bottom: 20px;
    border-radius: 4px;
  }

  .doc-header-banner h1 {
    font-size: 15pt;
    margin: 0 0 4px 0;
    color: #0f172a;
    font-weight: 800;
    letter-spacing: 0.5px;
  }

  .doc-header-banner p {
    margin: 0;
    font-size: 8.5pt;
    color: #475569;
  }

  h2 {
    color: #0f172a;
    font-size: 12.5pt;
    font-weight: 800;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 4px;
    margin-top: 22px;
    margin-bottom: 10px;
    page-break-after: avoid;
  }

  h3 {
    color: #1e3a8a;
    font-size: 10.5pt;
    font-weight: 700;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }

  p, ul, ol {
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 9.5pt;
    text-align: justify;
  }

  ul, ol {
    padding-left: 20px;
  }

  li {
    margin-bottom: 3px;
  }

  /* TABLE STYLING */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 14px 0;
    font-size: 8.5pt;
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
    padding: 6px 9px;
    text-align: left;
    vertical-align: top;
  }

  th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
    font-size: 8.5pt;
  }

  .table-meta th {
    width: 25%;
    background-color: #f8fafc;
    color: #334155;
    font-weight: 600;
  }

  .table-meta td {
    width: 75%;
    font-weight: 500;
  }

  .badge-pass {
    display: inline-block;
    background: #dcfce7;
    color: #15803d;
    font-weight: 700;
    font-size: 7.5pt;
    padding: 2px 7px;
    border-radius: 3px;
    border: 1px solid #86efac;
  }

  .badge-defect {
    display: inline-block;
    background: #fee2e2;
    color: #b91c1c;
    font-weight: 700;
    font-size: 7.5pt;
    padding: 2px 7px;
    border-radius: 3px;
    border: 1px solid #fca5a5;
  }

  .badge-warning {
    display: inline-block;
    background: #fef3c7;
    color: #b45309;
    font-weight: 700;
    font-size: 7.5pt;
    padding: 2px 7px;
    border-radius: 3px;
    border: 1px solid #fde68a;
  }

  .badge-prio-high {
    color: #b91c1c;
    font-weight: 700;
  }

  .badge-prio-med {
    color: #0284c7;
    font-weight: 700;
  }

  .callout-box {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #3b82f6;
    padding: 8px 12px;
    margin: 10px 0;
    font-size: 8.5pt;
    border-radius: 3px;
  }

  .callout-box strong {
    color: #1e3a8a;
  }

  .page-divider {
    page-break-after: always;
  }

  .footer-note {
    font-size: 7.5pt;
    color: #64748b;
    text-align: right;
    margin-top: 15px;
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
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
      <div class="cover-badge">Dokumen Pengujian Perangkat Lunak</div>
      <img src="data:image/jpeg;base64,${logoBase64}" alt="Logo E-KrupSy" style="width: 22mm; height: 22mm; border-radius: 50%; object-fit: cover; border: 2.5px solid #d97706; box-shadow: 0 4px 14px rgba(0,0,0,0.22);" />
    </div>
    <div class="cover-title">TEST PLAN</div>
    <div class="cover-subtitle">Sistem Informasi Pemesanan dan Manajemen Produksi Kerupuk Berbasis Web (E-KRUPSY)</div>
    <div class="cover-case-study">Studi Kasus: Pabrik Kerupuk Diansyah — Sumedang, Jawa Barat</div>
    <div class="cover-class">Kelompok 4 / Kelas IF-46-01 (Rekayasa Perangkat Lunak)</div>
    <div style="margin: 14px 0 6px 0; display: flex; align-items: center; gap: 14px;">
      <img src="data:image/jpeg;base64,${logoBase64}" alt="Logo E-KrupSy Resmi" style="width: 36mm; height: 36mm; border-radius: 50%; object-fit: cover; border: 3px solid #d97706; box-shadow: 0 6px 20px rgba(0,0,0,0.28);" />
      <div style="font-size: 9.5pt; color: #334155; line-height: 1.45;">
        <strong style="color: #0f172a; font-size: 11pt;">Pabrik Kerupuk Diansyah</strong><br>
        <em>Produksi Kerupuk Gurih &amp; Renyah Khas Sumedang</em><br>
        <span style="display: inline-block; background: #fef3c7; color: #92400e; font-size: 8pt; font-weight: 700; padding: 2px 8px; border-radius: 3px; margin-top: 4px; border: 1px solid #fde68a;">Official Brand Logo</span>
      </div>
    </div>
  </div>

  <div class="cover-bottom">
    <div class="cover-section-title">Disusun Oleh (Tim Penguji & Pengembang):</div>
    <ul class="cover-member-list">
      <li><strong>1301220001</strong> — Fajar Pratama (Test Lead / Koordinator QA)</li>
      <li><strong>1301220015</strong> — Dwi Cahyono (Quality Assurance Engineer)</li>
      <li><strong>1301220042</strong> — Rian Firmansyah (Security & Integration Tester)</li>
      <li><strong>1301220078</strong> — Siti Nurhaliza (Technical Writer & Defect Logger)</li>
    </ul>

    <div class="cover-section-title">Dosen Pembimbing & Reviewer:</div>
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
<!-- HALAMAN ISI / DOKUMEN FORMAL TEST PLAN -->
<!-- ============================================================================== -->
<div class="content-body">

  <div class="doc-header-banner" style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
    <div>
      <h1>DOKUMEN RENCANA PENGUJIAN (TEST PLAN)</h1>
      <p>Sistem Informasi Pemesanan dan Manajemen Produksi Kerupuk Berbasis Web (E-KRUPSY) — Pabrik Kerupuk Diansyah</p>
    </div>
    <img src="data:image/jpeg;base64,${logoBase64}" alt="Logo E-KrupSy" style="width: 17mm; height: 17mm; border-radius: 50%; object-fit: cover; border: 2px solid #b45309; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15);" />
  </div>

  <!-- TABEL METADATA DOKUMEN -->
  <table class="table-meta">
    <tr>
      <th>Nama Sistem</th>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="data:image/jpeg;base64,${logoBase64}" alt="Logo" style="width: 13mm; height: 13mm; border-radius: 50%; object-fit: cover; border: 1.5px solid #d97706; flex-shrink: 0;" />
          <div>
            <strong>Sistem Informasi Pemesanan dan Manajemen Produksi Kerupuk Berbasis Web (E-KRUPSY)</strong><br>
            <span style="font-size: 8pt; color: #475569;">Pabrik Kerupuk Diansyah Sumedang — Identitas Resmi Aplikasi</span>
          </div>
        </div>
      </td>
    </tr>
    <tr>
      <th>Nama Kelompok / Kelas</th>
      <td><strong>Kelompok 4 / Kelas IF-46-01 (Rekayasa Perangkat Lunak)</strong></td>
    </tr>
    <tr>
      <th>Anggota (NIM – Nama)</th>
      <td>
        1301220001 – Fajar Pratama<br>
        1301220015 – Dwi Cahyono<br>
        1301220042 – Rian Firmansyah<br>
        1301220078 – Siti Nurhaliza
      </td>
    </tr>
    <tr>
      <th>Versi Dokumen</th>
      <td><strong>1.0 (Dokumen Pengujian Fungsional & Kesiapan Sistem Riil)</strong></td>
    </tr>
    <tr>
      <th>Tanggal Penyusunan</th>
      <td><strong>24 November 2026</strong></td>
    </tr>
  </table>

  <!-- 1. TUJUAN PEMBUATAN DOKUMEN -->
  <h2>1. Tujuan Pembuatan Dokumen</h2>
  <p>
    Dokumen Test Plan ini menjelaskan perencanaan pengujian Sistem Informasi Pemesanan dan Manajemen Produksi Kerupuk Berbasis Web (E-KRUPSY) pada Pabrik Kerupuk Diansyah Sumedang, meliputi ruang lingkup, sumber daya manusia dan perangkat, strategi pengujian, spesifikasi material pengujian berbasis kebutuhan fungsional (SKF-01 s.d. SKF-35 pada SRS), jadwal pelaksanaan, serta matriks kasus uji (test case) beserta laporan cacat (defect report) pada kondisi sistem saat ini.
  </p>
  <p>
    Dokumen ini ditujukan bagi:
  </p>
  <ul>
    <li><strong>Anggota Kelompok Pengembang & QA:</strong> Sebagai pedoman teknis operasional dalam mengeksekusi pengujian fungsionalitas, memverifikasi integritas data transaksi dan stok bahan, serta mencatat anomali secara sistematis.</li>
    <li><strong>Dosen Pembimbing dan Asisten Laboratorium Rekayasa Perangkat Lunak:</strong> Sebagai bahan review, verifikasi, dan validasi metodologis terhadap keterpenuhan kebutuhan sistem sesuai standar IEEE Std 829-2008 / ISO/IEC/IEEE 29148.</li>
    <li><strong>Pemilik Pabrik (Bapak Diansyah / Owner):</strong> Sebagai bukti akuntabilitas bahwa sistem perangkat lunak telah teruji handal untuk mendukung proses bisnis Make-To-Order dan rekonsiliasi kas pabrik.</li>
  </ul>

  <!-- 2. RUANG LINGKUP PENGUJIAN -->
  <h2>2. Ruang Lingkup Pengujian</h2>
  <p>
    Ruang lingkup pengujian menetapkan batasan fitur yang diuji secara mendalam (<em>in scope</em>) dan fitur atau aspek teknis yang berada di luar batasan pengujian (<em>out of scope</em>) beserta alasan pertimbangannya:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 18%;">Cakupan</th>
        <th style="width: 82%;">Uraian Fitur & Alasan Batasan</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>In Scope</strong></td>
        <td>
          Seluruh modul inti operasional Make-To-Order pada sistem E-KRUPSY yang telah terpasang pada lingkungan pengembangan dan basis data cloud Supabase:
          <ul>
            <li><strong>Modul Autentikasi & RBAC (Role-Based Access Control):</strong> Registrasi pelanggan mandiri, login multi-role (Owner, Pelanggan, Staf Penggoreng, Staf Pembungkus), proteksi route guard, dan enkripsi password bcrypt.</li>
            <li><strong>Modul Validasi Input 4 Lapis:</strong> Pengujian formulir registrasi & checkout mencakup <em>Existence Check</em>, <em>Data Type Check</em> (No HP hanya integer), <em>Domain Check</em> (kuantitas bal 1-100, password &ge; 6 digit), dan <em>Format Check</em> (email RFC).</li>
            <li><strong>Modul Katalog & Keranjang Belanja Multi-Varian:</strong> Pemesanan langsung (<em>Direct Order</em>), keranjang belanja multi-varian (<em>Batch Cart Order</em>) yang dikonsolidasi menjadi tepat 1 baris pesanan dan 1 pembayaran, serta kalkulasi tarif bumbu dan kemasan plastik dinamis.</li>
            <li><strong>Modul Pembayaran & Otorisasi Kas:</strong> Pembayaran Tunai (COD Kasir), QRIS Nasional resmi Pabrik Diansyah (NMID ID1025393458506), Transfer Bank (BCA, Mandiri, BJB) dengan upload bukti transfer, serta pembuktian hak otorisasi tunggal lunas (ACC Kasir) mutlak dipegang Owner.</li>
            <li><strong>Modul Digital Pass / Tanda Lunas:</strong> Pengujian kemunculan stempel Tanda Lunas Digital pada akun pelanggan yang hanya terbuka apabila status transaksi telah di-ACC lunas oleh Owner.</li>
            <li><strong>Modul Pembatalan Pesanan & Sinkronisasi Pengembalian Stok:</strong> Pembatalan mandiri pelanggan untuk pesanan yang belum diproses, pengembalian stok otomatis (kerupuk mentah 5 kg/bal, bumbu 1 kg/bal, plastik 1 pack/bal), serta monitoring pembatalan dan kontak WhatsApp pemesan di dashboard Owner.</li>
            <li><strong>Modul Antrean Wajan Penggorengan:</strong> Penanda waktu masuk pesanan berbasis Waktu Indonesia Barat (WIB), update status proses penggorengan, dan penerimaan instruksi varian rasa kerupuk.</li>
            <li><strong>Modul Pengendalian Mutu (QC) & Pengemasan:</strong> Uji petik kerenyahan mutu kerupuk oleh staf pembungkus, pencatatan feedback mutu ke tabel relasi, transparansi umpan balik ke penggoreng, dan penyelesaian akhir pesanan siap diambil.</li>
            <li><strong>Modul Inventori Stok Gudang 3 Kategori:</strong> Pengurangan stok otomatis saat order masuk, restock bahan mentah oleh staf, dan sinkronisasi penambahan stok bal siap jual ke katalog Owner.</li>
            <li><strong>Modul Analisis Finansial & Cetak Dokumen A4:</strong> Kalkulasi real-time Omset, Realisasi Kas, Piutang, Estimasi HPP (~70%), Laba Bersih (~30%), grafik interaktif, cetak kuitansi resi resmi fisik A4, dan cetak dokumen laporan laba rugi formal A4.</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td><strong>Out of Scope</strong></td>
        <td>
          Beberapa aspek teknis tidak diuji pada pengujian ini dengan alasan:
          <ul>
            <li><strong>Pengujian Beban Ekstrem (Stress / Load Testing &gt; 10.000 concurrent users):</strong> Sistem dirancang untuk skala UMKM Pabrik Kerupuk Diansyah dengan perkiraan transaksi harian 50–100 pesanan; pengujian beban tinggi berada di luar cakupan tugas ini.</li>
            <li><strong>Integrasi Otomatis Payment Gateway Pihak Ketiga (Midtrans / Xendit):</strong> Sesuai SOP pabrik dan spesifikasi SRS, settlement transaksi menggunakan mekanisme kasir langsung (tunai dan mutasi bank/QRIS manual) guna menghindari potongan komisi per transaksi (MDR) pada skala UMKM.</li>
            <li><strong>Pengujian Kompatibilitas Browser Legacy (Internet Explorer 11 ke bawah):</strong> Aplikasi Next.js 14 App Router secara teknis menargetkan arsitektur peramban modern berstandar ES6+.</li>
            <li><strong>Penetration Testing Tingkat Lanjut (Binary Exploitation):</strong> Pengujian keamanan difokuskan pada otorisasi RBAC, validasi data masukan, dan keabsahan sesi aplikasi web.</li>
          </ul>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- 3. REFERENSI -->
  <h2>3. Referensi</h2>
  <p>
    Dokumen pengujian ini merujuk pada standar rekayasa perangkat lunak internasional dan dokumen spesifikasi formal proyek:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 5%;">No</th>
        <th style="width: 32%;">Nama Dokumen</th>
        <th style="width: 12%;">Versi</th>
        <th style="width: 51%;">Keterangan & Lingkup Rujukan</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td><strong>SRS E-KRUPSY (Software Requirements Specification)</strong></td>
        <td>2.0 (2026)</td>
        <td>Standar IEEE Std 830-1998 / ISO/IEC/IEEE 29148; memuat 35 Kebutuhan Fungsional (SKF-01 s.d. SKF-35), spesifikasi aktor RBAC, aturan tarif bumbu/plastik, dan formula keuangan.</td>
      </tr>
      <tr>
        <td>2</td>
        <td><strong>SDD E-KRUPSY (Software Design Description)</strong></td>
        <td>2.0 (2026)</td>
        <td>Standar IEEE Std 1016-2009; memuat arsitektur Next.js 14 App Router + Supabase BaaS, 9 skema tabel relasional, sequence diagram, state machine diagram, dan format cetak A4.</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>IEEE Std 829-2008</strong></td>
        <td>2008</td>
        <td>IEEE Standard for Software and System Test Documentation; acuan struktur penyusunan Test Plan, Test Case, dan Defect Report.</td>
      </tr>
      <tr>
        <td>4</td>
        <td><strong>Panduan Demo Skenario Pengujian Sistem E-KRUPSY</strong></td>
        <td>1.0 (2026)</td>
        <td>Panduan skenario operasional demonstrasi end-to-end sistem di hadapan penguji dan dosen.</td>
      </tr>
      <tr>
        <td>5</td>
        <td><strong>Dokumen SOP Pabrik Kerupuk Diansyah Sumedang</strong></td>
        <td>2.1 (2026)</td>
        <td>Standar operasional prosedur pengolahan bahan mentah, rasio konversi 5 Kg kerupuk mentah per Bal matang mekar, uji mutu kerenyahan, dan penatausahaan kasir.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-divider"></div>

  <!-- 4. OVERVIEW SISTEM & FITUR UTAMANYA -->
  <h2>4. Overview Sistem & Fitur Utamanya</h2>
  <p>
    <strong>Sistem Informasi E-KRUPSY (Electronic Kerupuk System)</strong> adalah aplikasi berbasis web responsif arsitektur Next.js 14 App Router dan cloud database Supabase PostgreSQL, yang dibangun untuk mengotomatisasi seluruh rantai bisnis Make-To-Order (Goreng Dadakan) pada Pabrik Kerupuk Diansyah Sumedang. Sistem menghubungkan 4 aktor pengguna—Pelanggan, Owner (Pimpinan/Kasir), Staf Penggoreng, dan Staf Pembungkus—dalam satu ekosistem data terpusat secara real-time.
  </p>

  <div style="display: flex; align-items: center; gap: 16px; margin: 10px 0 14px 0; padding: 10px 14px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;">
    <img src="data:image/jpeg;base64,${logoBase64}" alt="Logo Resmi E-KrupSy" style="width: 22mm; height: 22mm; border-radius: 50%; object-fit: cover; border: 2.5px solid #d97706; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.15);" />
    <div>
      <div style="font-weight: 800; color: #78350f; font-size: 9.5pt; margin-bottom: 2px;">Identitas &amp; Logo Resmi: E-KrupSy — Pabrik Kerupuk Diansyah</div>
      <p style="margin: 0 0 6px 0; font-size: 8.5pt; color: #92400e; text-align: left;">
        Logo resmi mengusung sajian mangkuk kayu kerupuk kuning keemasan yang merepresentasikan cita rasa gurih dan kerenyahan mekar alami khas Sumedang, dikelilingi aksen cincin emas ganda elegan sebagai identitas visual utama sistem.
      </p>
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src="data:image/png;base64,${navbarBrandBase64}" alt="Navbar Brand" style="height: 18px; object-fit: contain; border-radius: 3px; border: 1px solid #7f1d1d;" />
        <span style="font-size: 7.5pt; color: #78350f; font-weight: 600;">(Antarmuka Bar Navigasi Resmi Aplikasi)</span>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%;">No</th>
        <th style="width: 28%;">Fitur Utama</th>
        <th style="width: 67%;">Deskripsi Singkat</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td><strong>Autentikasi & Role Guard (RBAC)</strong></td>
        <td>Pemisahan hak akses 4 aktor (Owner, Penggoreng, Pembungkus, Pelanggan) dengan enkripsi password bcrypt; pemblokiran rute terlarang secara otomatis pada level komponen dan middleware.</td>
      </tr>
      <tr>
        <td>2</td>
        <td><strong>Validasi Formulir 4 Lapis</strong></td>
        <td>Proteksi anomali masukan data pada registrasi dan transaksi menggunakan <em>Existence</em>, <em>Data Type</em>, <em>Domain</em>, dan <em>Format Check</em> di sisi klien maupun server API.</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>Katalog & Keranjang Multi-Varian</strong></td>
        <td>Penayangan katalog kerupuk live dari database; fasilitas pemesanan langsung maupun keranjang belanja batch multi-varian dengan kalkulasi tarif rasa dan plastik dinamis.</td>
      </tr>
      <tr>
        <td>4</td>
        <td><strong>Multi-Channel Pembayaran & ACC Owner</strong></td>
        <td>Dukungan metode Tunai (COD Kasir), QRIS resmi ber-NMID, dan Transfer Bank (BCA/Mandiri/BJB); otorisasi lunas kas masuk secara mutlak hanya dapat dilakukan oleh Owner.</td>
      </tr>
      <tr>
        <td>5</td>
        <td><strong>Tanda Lunas Digital (Digital Pass)</strong></td>
        <td>Penayangan pass resmi berstempel digital pada dashboard pelanggan yang hanya muncul jika pembayaran telah diverifikasi sah oleh Owner, sebagai bukti pengambilan kerupuk.</td>
      </tr>
      <tr>
        <td>6</td>
        <td><strong>Pembatalan Mandiri & Auto-Refund Stok</strong></td>
        <td>Pelanggan dapat membatalkan pesanan status menunggu; sistem otomatis mengembalikan stok produk katalog dan bahan baku (kerupuk mentah, bumbu, plastik) secara proporsional.</td>
      </tr>
      <tr>
        <td>7</td>
        <td><strong>Antrean Dapur Penggorengan (Kitchen Queue WIB)</strong></td>
        <td>Menampilkan antrean wajan penggorengan secara berurutan dengan penanda jam pemesanan WIB, instruksi rasa, dan transisi status masak hingga siap dikirim ke QC.</td>
      </tr>
      <tr>
        <td>8</td>
        <td><strong>Uji Petik Mutu (QC) & Pengemasan</strong></td>
        <td>Evaluasi kelayakan kerenyahan fisik kerupuk oleh staf pembungkus, pencatatan hasil ke basis data, transparansi umpan balik ke penggoreng, dan penyelesaian siap diambil.</td>
      </tr>
      <tr>
        <td>9</td>
        <td><strong>Manajemen Stok Bahan Baku 3 Kategori</strong></td>
        <td>Pemantauan stok Kerupuk Mentah (Kg), Bumbu (Kg), dan Plastik (Pack); pemotongan otomatis saat order masuk, restock bahan, dan sinkronisasi penambahan bal katalog.</td>
      </tr>
      <tr>
        <td>10</td>
        <td><strong>Analisis Finansial & Cetak Resi/Laporan A4</strong></td>
        <td>Perhitungan otomatis Omset, Realisasi Kas, Piutang, Estimasi HPP (~70%), Laba Bersih (~30%), grafik tren interaktif, dan pencetakan dokumen kuitansi serta laporan laba rugi format resmi A4.</td>
      </tr>
    </tbody>
  </table>

  <!-- 5. OVERVIEW PENGUJIAN -->
  <h2>5. Overview Pengujian</h2>
  <p>
    Pengujian sistem dilakukan secara manual dan semi-otomatis pada tingkat <em>System Testing</em> dan <em>Integration Testing</em> dengan pendekatan <em>Black-Box Testing</em> berbasis spesifikasi kebutuhan perangkat lunak (SRS E-KRUPSY v2.0). Pengujian difokuskan pada pembuktian keandalan alur bisnis Make-To-Order, akurasi pengurangan dan pengembalian stok bahan baku, pencegahan akses ilegal lintas-role, serta ketepatan perhitungan finansial. Seluruh hasil eksekusi dicatat pada Matriks Test Case, dan temuan kelemahan kode dilaporkan pada Defect Report.
  </p>

  <h3>5.1 Perangkat Keras Pengujian</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">No</th>
        <th style="width: 30%;">Perangkat Keras</th>
        <th style="width: 65%;">Spesifikasi Teknis Pengujian</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Laptop Penguji Utama (Server & Desktop Client)</td>
        <td>ASUS Laptop, Prosesor Intel Core / AMD Ryzen, RAM 16 GB, SSD 512 GB, Windows 11 Home 64-bit, Layar 15.6" Full HD (1920x1080).</td>
      </tr>
      <tr>
        <td>2</td>
        <td>Laptop Penguji Kedua (Dashboard Staff & Pelanggan)</td>
        <td>Laptop Intel Core i3 / Core i5, RAM 8 GB, SSD 256 GB, Windows 10/11.</td>
      </tr>
      <tr>
        <td>3</td>
        <td>Smartphone Penguji (Mobile Client & Uji Responsif)</td>
        <td>Android Smartphone, Layar 6.67" (Resolusi 1080x2400 piksel), Android 13/14, Browser Google Chrome Mobile.</td>
      </tr>
      <tr>
        <td>4</td>
        <td>Perangkat Cetak Fisik (Print Verification)</td>
        <td>Printer Inkjet Standar ISO A4 (Epson L3210 / HP Smart Tank) dan PDF Virtual Printer.</td>
      </tr>
    </tbody>
  </table>

  <h3>5.2 Sumber Daya Manusia</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">No</th>
        <th style="width: 24%;">Nama Penguji</th>
        <th style="width: 22%;">Peran (Role)</th>
        <th style="width: 49%;">Tanggung Jawab Utama</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td><strong>Fajar Pratama</strong> (1301220001)</td>
        <td>Test Lead / QA Manager</td>
        <td>Menyusun dokumen Test Plan, memvalidasi matriks keterlacakan kebutuhan (RTM), mengoordinasikan jadwal eksekusi pengujian, dan mereview laporan defect.</td>
      </tr>
      <tr>
        <td>2</td>
        <td><strong>Dwi Cahyono</strong> (1301220015)</td>
        <td>QA Engineer / Tester</td>
        <td>Mengeksekusi skenario uji modul Pelanggan (Registrasi, Validasi 4 Lapis, Keranjang Multi-Varian, Pembatalan Pesanan, Digital Pass) dan mencatat hasil uji.</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>Rian Firmansyah</strong> (1301220042)</td>
        <td>Integration & Security Tester</td>
        <td>Mengeksekusi pengujian Role Guard (RBAC), modul Produksi (Penggoreng & Pembungkus), sinkronisasi stok bahan gudang, dan pengujian sesi keamanan cookie.</td>
      </tr>
      <tr>
        <td>4</td>
        <td><strong>Siti Nurhaliza</strong> (1301220078)</td>
        <td>Technical Writer & Defect Logger</td>
        <td>Mengeksekusi pengujian modul Owner (Finansial, Kasir ACC Lunas, Cetak Resi/Laporan A4), mendokumentasikan log pengujian, dan menyusun Defect Report.</td>
      </tr>
    </tbody>
  </table>

  <h3>5.3 Perangkat Lunak Pengujian</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">No</th>
        <th style="width: 32%;">Perangkat Lunak</th>
        <th style="width: 18%;">Versi</th>
        <th style="width: 45%;">Fungsi dalam Pengujian</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Node.js Runtime Environment</td>
        <td>v24.11.1 / v20.x LTS</td>
        <td>Lingkungan runtime server untuk menjalankan aplikasi Next.js secara lokal.</td>
      </tr>
      <tr>
        <td>2</td>
        <td>Next.js Framework</td>
        <td>v14.2.23 (App Router)</td>
        <td>Server aplikasi, renderer antarmuka React 18, dan penangan rute REST API backend.</td>
      </tr>
      <tr>
        <td>3</td>
        <td>Supabase BaaS & PostgreSQL Cloud</td>
        <td>PostgreSQL 15.x</td>
        <td>Penyimpanan basis data cloud terpusat, otentikasi pgcrypto, dan tabel transaksi.</td>
      </tr>
      <tr>
        <td>4</td>
        <td>Google Chrome & DevTools</td>
        <td>v131.0+ (64-bit)</td>
        <td>Eksekusi pengujian antarmuka, inspeksi Network payload API, inspeksi cookies, dan uji resolusi responsif.</td>
      </tr>
      <tr>
        <td>5</td>
        <td>Microsoft Edge</td>
        <td>v131.0+ (64-bit)</td>
        <td>Pengujian kompatibilitas lintas browser dan verifikasi layout cetak dokumen A4.</td>
      </tr>
      <tr>
        <td>6</td>
        <td>Postman / REST Client</td>
        <td>Versi Terbaru</td>
        <td>Pengujian langsung API endpoint backend (/api/auth, /api/pesanan, /api/stok) dengan boundary payload.</td>
      </tr>
      <tr>
        <td>7</td>
        <td>Git & GitHub</td>
        <td>v2.45+</td>
        <td>Pelacakan repositori kode sumber dan integrasi versi pengujian.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-divider"></div>

  <h3>5.4 Material Pengujian</h3>
  <p>
    Material pengujian mencakup seluruh modul fungsional yang dipetakan secara langsung ke Spesifikasi Kebutuhan Fungsional (SKF) pada SRS E-KRUPSY v2.0:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 5%;">No</th>
        <th style="width: 42%;">Modul / Use Case Pengujian</th>
        <th style="width: 33%;">ID Requirement (SRS)</th>
        <th style="width: 20%;">Prioritas Pengujian</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Autentikasi, Registrasi Pelanggan, & RBAC Role Guard</td>
        <td>SKF-01, SKF-02, SKF-03, SKF-04</td>
        <td><span class="badge-prio-high">Tinggi (High)</span></td>
      </tr>
      <tr>
        <td>2</td>
        <td>Katalog Produk & Keranjang Belanja Multi-Varian</td>
        <td>SKF-05, SKF-06, SKF-07, SKF-08, SKF-09, SKF-10</td>
        <td><span class="badge-prio-high">Tinggi (High)</span></td>
      </tr>
      <tr>
        <td>3</td>
        <td>Manajemen Transaksi, Multi-Channel Bayar & ACC Owner</td>
        <td>SKF-11, SKF-12, SKF-13, SKF-14, SKF-15</td>
        <td><span class="badge-prio-high">Tinggi (High)</span></td>
      </tr>
      <tr>
        <td>4</td>
        <td>Pembatalan Pesanan Mandiri & Sinkronisasi Refund Stok</td>
        <td>SKF-16, SKF-17, SKF-18</td>
        <td><span class="badge-prio-high">Tinggi (High)</span></td>
      </tr>
      <tr>
        <td>5</td>
        <td>Alur Kerja Produksi Antrean Wajan Penggorengan</td>
        <td>SKF-19, SKF-20, SKF-21, SKF-22</td>
        <td><span class="badge-prio-med">Sedang (Medium)</span></td>
      </tr>
      <tr>
        <td>6</td>
        <td>Pengendalian Mutu (QC) & Pengemasan Staf Pembungkus</td>
        <td>SKF-23, SKF-24, SKF-25, SKF-26</td>
        <td><span class="badge-prio-med">Sedang (Medium)</span></td>
      </tr>
      <tr>
        <td>7</td>
        <td>Manajemen Inventori Stok Bahan Gudang & Sinkronisasi</td>
        <td>SKF-27, SKF-28, SKF-29, SKF-30</td>
        <td><span class="badge-prio-high">Tinggi (High)</span></td>
      </tr>
      <tr>
        <td>8</td>
        <td>Laporan Finansial, Analisis Eksekutif & Dokumen Fisik A4</td>
        <td>SKF-31, SKF-32, SKF-33, SKF-34, SKF-35</td>
        <td><span class="badge-prio-med">Sedang (Medium)</span></td>
      </tr>
    </tbody>
  </table>

  <h3>5.5 Strategi dan Metode Pengujian</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">No</th>
        <th style="width: 30%;">Strategi / Metode Pengujian</th>
        <th style="width: 65%;">Alasan Pemilihan & Implementasi</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td><strong>Pengujian Manual Black-Box</strong></td>
        <td>Fokus pada kesesuaian fungsionalitas dan perilaku sistem terhadap requirement spesifikasi tanpa melihat kode program internal, mencakup skenario positif dan negatif.</td>
      </tr>
      <tr>
        <td>2</td>
        <td><strong>Equivalence Partitioning & BVA</strong></td>
        <td>Menguji masukan formulir pada rentang valid dan ekstrem (contoh: kuantitas order batas 1 s.d. 100 bal; panjang password batas 5 karakter vs 6 karakter; format email baku RFC).</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>Role-Based Security Testing</strong></td>
        <td>Memverifikasi ketahanan Role Guard terhadap upaya eskalasi hak akses ilegal (direct URL browsing ke rute dashboard role lain saat login sebagai pelanggan).</td>
      </tr>
      <tr>
        <td>4</td>
        <td><strong>State Transition Testing</strong></td>
        <td>Memastikan alur status pesanan dan produksi berpindah secara konsisten: <em>menunggu_diproses &rarr; diproses &rarr; siap_diverifikasi &rarr; sedang_dikemas &rarr; selesai</em>.</td>
      </tr>
      <tr>
        <td>5</td>
        <td><strong>Data Consistency & Formula Testing</strong></td>
        <td>Memverifikasi keakuratan matematis pemotongan dan pengembalian stok bahan baku (5 kg kerupuk mentah, 1 kg bumbu, 1 pack plastik per bal) serta rasio HPP 70% dan Laba 30%.</td>
      </tr>
      <tr>
        <td>6</td>
        <td><strong>Print-Media Query Testing</strong></td>
        <td>Memastikan elemen interaktif web (tombol, sidebar, navbar) otomatis disembunyikan saat kuitansi resi dan laporan keuangan dicetak pada kertas format A4.</td>
      </tr>
    </tbody>
  </table>

  <h3>5.6 Jadwal Pengujian & Data Uji</h3>
  <p>
    <strong>Kasus Data Pengujian yang Digunakan:</strong>
  </p>
  <ul>
    <li><strong>Kredensial Master:</strong> Owner (<code>owner</code> / <code>owner123</code>), Penggoreng (<code>penggoreng</code> / <code>goreng123</code>), Pembungkus (<code>pembungkus</code> / <code>bungkus123</code>).</li>
    <li><strong>Data Registrasi Akun Pelanggan Valid:</strong> Nama: "Budi Santoso", Username: "budi_santoso", Email: "budi@gmail.com", Password: "budi12345", No HP: "081234567890", Alamat: "Jl. Angkrek No. 12 Sumedang".</li>
    <li><strong>Data Negatif Registrasi:</strong> Kolom wajib kosong; Password kurang dari 6 digit ("12345"); No HP mengandung alfabet ("0812abc"); Email tidak berformat RFC ("budi@").</li>
    <li><strong>Data Uji Transaksi Batch Keranjang:</strong> Item 1: Kerupuk Kentang (2 Bal, Balado Manis Pedas, Kemasan 1/2 kg); Item 2: Kerupuk Jengkol (1 Bal, Original Gurih, Kemasan 1x25 kg); Metode Pembayaran: Tunai, QRIS, Transfer Bank.</li>
  </ul>

  <p><strong>Tabel 4.1 Jadwal Pelaksanaan Pengujian:</strong></p>
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">No</th>
        <th style="width: 48%;">Modul / Use Case yang Diuji</th>
        <th style="width: 25%;">Penanggung Jawab (PIC)</th>
        <th style="width: 22%;">Jadwal Pengujian</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Modul Autentikasi Pengguna & RBAC Role Guard</td>
        <td>Dwi Cahyono</td>
        <td>10 November 2026</td>
      </tr>
      <tr>
        <td>2</td>
        <td>Modul Validasi Formulir 4 Lapis Registrasi</td>
        <td>Dwi Cahyono</td>
        <td>12 November 2026</td>
      </tr>
      <tr>
        <td>3</td>
        <td>Modul Katalog Produk, Keranjang & Checkout Batch</td>
        <td>Fajar Pratama</td>
        <td>14 November 2026</td>
      </tr>
      <tr>
        <td>4</td>
        <td>Modul Multi-Channel Pembayaran & ACC Kasir Owner</td>
        <td>Siti Nurhaliza</td>
        <td>16 November 2026</td>
      </tr>
      <tr>
        <td>5</td>
        <td>Modul Pembatalan Pesanan & Auto-Refund Stok Bahan</td>
        <td>Rian Firmansyah</td>
        <td>18 November 2026</td>
      </tr>
      <tr>
        <td>6</td>
        <td>Modul Alur Produksi Wajan & Verifikasi Kualitas QC</td>
        <td>Rian Firmansyah</td>
        <td>20 November 2026</td>
      </tr>
      <tr>
        <td>7</td>
        <td>Modul Manajemen Stok Bahan Gudang & Sinkronisasi</td>
        <td>Dwi Cahyono</td>
        <td>21 November 2026</td>
      </tr>
      <tr>
        <td>8</td>
        <td>Modul Laporan Finansial Pabrik & Cetak Dokumen A4</td>
        <td>Siti Nurhaliza</td>
        <td>22 November 2026</td>
      </tr>
      <tr>
        <td>9</td>
        <td>Uji Integrasi End-to-End & Audit Keamanan Sesi</td>
        <td>Seluruh Tim (Fajar P.)</td>
        <td>24 November 2026</td>
      </tr>
    </tbody>
  </table>

  <div class="page-divider"></div>

  <!-- ============================================================================== -->
  <!-- 6. MATRIKS KASUS UJI DETAIL (TEST CASES) PADA KONDISI SISTEM SAAT INI -->
  <!-- ============================================================================== -->
  <h2>6. Matriks Kasus Uji Detail (Test Cases) & Hasil Pengujian Sistem Saat Ini</h2>
  <p>
    Tabel berikut menyajikan 25 kasus uji (TC-01 s.d. TC-25) yang dieksekusi secara aktual pada sistem E-KRUPSY saat ini untuk membuktikan keterpenuhan fungsionalitas dan integritas alur kerja operasional pabrik:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 8%;">ID TC</th>
        <th style="width: 20%;">Fitur / Skenario Uji</th>
        <th style="width: 25%;">Langkah Pengujian & Data Masukan</th>
        <th style="width: 25%;">Hasil yang Diharapkan</th>
        <th style="width: 14%;">Hasil Aktual Sistem Saat Ini</th>
        <th style="width: 8%;">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>TC-01</strong></td>
        <td>Registrasi Pelanggan Baru (Data Valid)</td>
        <td>Buka <code>/register</code>, isi data lengkap valid (Nama, Username, Email, Password &ge; 6 digit, No HP numerik), klik Daftar.</td>
        <td>Muncul state Loading, muncul alert Success hijau, data tersimpan di Supabase, dan diarahkan ke <code>/login</code>.</td>
        <td>Sesuai; tombol loading aktif, notifikasi hijau muncul, data tersimpan, redirect ke /login.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-02</strong></td>
        <td>Registrasi: <em>Existence Check</em> (Field Kosong)</td>
        <td>Buka <code>/register</code>, kosongkan kolom Nama Lengkap dan Password, klik tombol Daftar.</td>
        <td>Sistem memblokir pengiriman, menampilkan alert merah bahwa data wajib tidak boleh kosong.</td>
        <td>Sesuai; muncul pesan "Harap lengkapi semua data wajib pada formulir pendaftaran."</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-03</strong></td>
        <td>Registrasi: <em>Data Type Check</em> (No HP Non-Angka)</td>
        <td>Ketikkan huruf alfabet atau simbol pada kolom No HP (misal: "0812abc").</td>
        <td>Karakter non-angka diblokir seketika pada level pengetikan (onKeyDown) atau ditolak saat submit.</td>
        <td>Sesuai; karakter huruf dicegah terketik, sistem hanya menerima angka bulat (integer).</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-04</strong></td>
        <td>Registrasi: <em>Domain Check</em> (Password &lt; 6 Char)</td>
        <td>Isi semua kolom valid, namun isi password dengan "12345" (5 karakter), klik Daftar.</td>
        <td>Sistem menolak submit dengan pesan kesalahan batas domain minimal 6 karakter.</td>
        <td>Sesuai; muncul pesan error merah: "Password minimal harus 6 karakter."</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-05</strong></td>
        <td>Registrasi: <em>Format Check</em> (Email Cacat)</td>
        <td>Isi email dengan format tanpa domain valid (misal: "budi123" atau "budi@").</td>
        <td>Sistem menolak submit dengan pesan format email tidak memenuhi standar RFC.</td>
        <td>Sesuai; muncul validasi format email tidak valid.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-06</strong></td>
        <td>Login Multi-Role dengan Kredensial Valid</td>
        <td>Login bergantian menggunakan akun master: owner, penggoreng, pembungkus, dan pelanggan.</td>
        <td>Sistem memvalidasi hash bcrypt, membuat sesi cookie, dan mengarahkan ke dashboard masing-masing role.</td>
        <td>Sesuai; setiap role berhasil diarahkan ke dashboard hak aksesnya dengan tepat.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-07</strong></td>
        <td>Login dengan Password Salah</td>
        <td>Masukkan username "owner" dengan password keliru "salah123".</td>
        <td>Sistem menolak otentikasi dengan HTTP 401 dan pesan kesalahan kredensial tidak cocok.</td>
        <td>Sesuai; muncul alert merah: "Username atau password salah."</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-08</strong></td>
        <td>RBAC Security: Pembatasan Rute Terlarang</td>
        <td>Login sebagai Pelanggan, lalu ketikkan URL <code>/dashboard/owner</code> secara manual di browser.</td>
        <td>Role Guard memblokir render halaman, menampilkan layar merah akses ditolak dan tombol kembali.</td>
        <td>Sesuai; muncul layar akses ditolak dengan tombol kembali ke dashboard pelanggan.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-09</strong></td>
        <td>Penayangan Katalog Produk Dinamis</td>
        <td>Buka dashboard pelanggan dan periksa daftar kerupuk (Kentang, Jengkol, Bawang, dsb.).</td>
        <td>Menampilkan nama produk, foto, harga dasar Rp 160.000/bal, ketersediaan stok, dan deskripsi.</td>
        <td>Sesuai; data katalog terambil dari tabel produk Supabase secara lengkap.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-10</strong></td>
        <td>Pemesanan Langsung (<em>Direct Order</em>) 1 Bal</td>
        <td>Klik "Pesan Sekarang" pada Kerupuk Kentang, pilih rasa Balado (+Rp 5.000), plastik 1/2 kg, bayar Tunai.</td>
        <td>Total harga dihitung otomatis (Rp 165.000), pesanan tersimpan status "menunggu_diproses", stok terpotong.</td>
        <td>Sesuai; pesanan tercatat, total tagihan akurat, stok katalog & bahan baku otomatis berkurang.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-11</strong></td>
        <td>Keranjang Belanja Multi-Item</td>
        <td>Tambahkan 2 Bal Kerupuk Kentang (Pedas) dan 1 Bal Kerupuk Jengkol (Original) ke keranjang.</td>
        <td>Keranjang belanja menampung kedua varian, menghitung subtotal masing-masing dan grand total.</td>
        <td>Sesuai; drawer keranjang menampilkan kedua item dengan kalkulasi subtotal yang tepat.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-12</strong></td>
        <td>Checkout Batch Keranjang Belanja</td>
        <td>Klik checkout pada keranjang belanja berisi 2 varian kerupuk.</td>
        <td>Tersimpan sebagai tepat 1 transaksi pesanan konsolidasi dan 1 entri pembayaran gabungan di database.</td>
        <td>Sesuai; transaksi digabung menjadi 1 baris di tabel pesanan dan detail varian tersimpan terstruktur.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-13</strong></td>
        <td>Pembayaran Metode Tunai (COD Kasir)</td>
        <td>Pilih metode bayar "Tunai", submit pesanan.</td>
        <td>Status pembayaran bernilai "pending" hingga disetujui kasir, banner peringatan belum lunas muncul.</td>
        <td>Sesuai; status pembayaran pending, pelanggan diminta bayar tunai di kasir pabrik.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-14</strong></td>
        <td>Pembayaran Metode QRIS Otomatis</td>
        <td>Pilih metode bayar "QRIS", submit pesanan.</td>
        <td>Menampilkan barcode QRIS resmi pabrik (NMID ID1025393458506) dan struk instruksi scan.</td>
        <td>Sesuai; gambar QRIS resmi pabrik Diansyah muncul jelas beserta instruksi pembayaran.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-15</strong></td>
        <td>Pembayaran Transfer Bank & Bukti Screenshot</td>
        <td>Pilih metode Transfer Bank (BCA), salin no rek, unggah file gambar bukti screenshot transfer.</td>
        <td>No rekening tersalin ke clipboard, data bukti pembayaran terlampir di data transaksi.</td>
        <td>Sesuai; tombol salin no rek berfungsi dan bukti transfer tercatat untuk diverifikasi Owner.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-16</strong></td>
        <td>Otorisasi Lunas Tunggal oleh Owner (ACC Kasir)</td>
        <td>Owner membuka dashboard, memeriksa pesanan pending, lalu menekan tombol hijau "Konfirmasi Lunas".</td>
        <td>Status pembayaran berubah menjadi "lunas", tombol Cetak Resi aktif di Owner, kas masuk bertambah.</td>
        <td>Sesuai; status pembayaran terverifikasi lunas seketika, neraca kas masuk Owner bertambah.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-17</strong></td>
        <td>Tanda Lunas Digital (Digital Pass) Pelanggan</td>
        <td>Pelanggan membuka riwayat pesanan: (a) saat masih pending; (b) setelah di-ACC lunas oleh Owner.</td>
        <td>Pada kondisi pending tombol pass tidak aktif; setelah lunas muncul tombol "Tunjukkan Tanda Lunas" berstempel.</td>
        <td>Sesuai; Digital Pass berstempel resmi lunas hanya dapat dibuka setelah konfirmasi kasir Owner.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-18</strong></td>
        <td>Pembatalan Pesanan Mandiri oleh Pelanggan</td>
        <td>Pelanggan klik "Batalkan Pesanan" pada pesanan yang masih berstatus "menunggu_diproses".</td>
        <td>Status pesanan berubah menjadi "dibatalkan", muncul di tab pembatalan Owner beserta tombol WhatsApp.</td>
        <td>Sesuai; pesanan berhasil dibatalkan dan tercatat lengkap di dashboard pembatalan Owner.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-19</strong></td>
        <td>Sinkronisasi Pengembalian Stok saat Batal</td>
        <td>Batalkan pesanan 2 Bal Kerupuk Kentang Balado (1/2 kg). Periksa tabel produk & stok_bahan.</td>
        <td>Stok produk kembali +2 bal; kerupuk mentah kembali +10 kg; bumbu kembali +2 kg; plastik kembali +2 pack.</td>
        <td>Sesuai; fungsi refundAllMaterialsOnCancel sukses mengembalikan seluruh bahan gudang secara presisi.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-20</strong></td>
        <td>Antrean Wajan Penggorengan (Kitchen Queue WIB)</td>
        <td>Staf Penggoreng membuka <code>/dashboard/staff-penggoreng</code>, periksa daftar wajan.</td>
        <td>Menampilkan antrean pesanan masuk, target jumlah bal, varian rasa, dan penanda jam masuk (WIB).</td>
        <td>Sesuai; kartu antrean penggorengan menampilkan detail pesanan lengkap dengan format waktu WIB.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-21</strong></td>
        <td>Transisi Status Penggorengan</td>
        <td>Penggoreng klik "Mulai Goreng", lalu setelah selesai klik "Selesai Goreng (Kirim ke QC)".</td>
        <td>Status produksi berubah dari "menunggu" &rarr; "diproses" &rarr; "siap_diverifikasi" (berpindah ke staf pembungkus).</td>
        <td>Sesuai; status produksi terbarui dan pesanan otomatis masuk ke antrean verifikasi staf pembungkus.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-22</strong></td>
        <td>Uji Petik Kerenyahan & QC Staf Pembungkus</td>
        <td>Staf Pembungkus membuka modal QC, memilih "Lolos Verifikasi", input catatan: "Kerenyahan sempurna, mekar baik".</td>
        <td>Data tersimpan di tabel verifikasi_produksi, status produksi berubah menjadi "sedang_dikemas".</td>
        <td>Sesuai; catatan mutu tersimpan dan badge status pengemasan aktif pada pesanan.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-23</strong></td>
        <td>Transparansi Umpan Balik QC ke Penggoreng</td>
        <td>Staf Penggoreng membuka dashboardnya setelah staf pembungkus mengisi catatan QC.</td>
        <td>Catatan evaluasi mutu dan status kelayakan dari pembungkus tertampil langsung pada kartu tugas penggoreng.</td>
        <td>Sesuai; staf penggoreng dapat membaca langsung umpan balik mutu hasil gorengannya secara transparan.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-24</strong></td>
        <td>Restock Bahan Mentah & Sinkronisasi Katalog</td>
        <td>Staf input pasokan masuk 50 Kg Kerupuk Mentah Kentang di modul stok.</td>
        <td>Stok bahan gudang bertambah +50 Kg; stok bal siap jual pada katalog Owner otomatis bertambah +10 Bal.</td>
        <td>Sesuai; rasio konversi 5 Kg = 1 Bal berhasil menyinkronkan stok bahan mentah ke katalog produk jadi.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>TC-25</strong></td>
        <td>Pencetakan Resi Kuitansi & Laporan Keuangan A4</td>
        <td>Owner klik "Cetak Resi" pada transaksi, dan klik "Cetak Laporan Keuangan" pada neraca kas pabrik.</td>
        <td>Merender dokumen cetak resmi berstandar A4 bergaris lengkap dengan kop surat pabrik; navigasi web disembunyikan.</td>
        <td>Sesuai; CSS print engine menyembunyikan tombol UI dan menghasilkan dokumen kertas A4 formal siap cetak.</td>
        <td><span class="badge-pass">PASS</span></td>
      </tr>
    </tbody>
  </table>

  <div class="page-divider"></div>

  <!-- ============================================================================== -->
  <!-- 7. LAPORAN CACAT SISTEM (DEFECT REPORT & TEMUAN AUDIT KRITIS) -->
  <!-- ============================================================================== -->
  <h2>7. Laporan Cacat Sistem Riil (Defect Report)</h2>
  <p>
    Berdasarkan audit mendalam terhadap kode sumber dan arsitektur sistem pada kondisi riil saat ini, tim QA menemukan 4 (empat) catatan teknis penting terkait keamanan sesi dan integritas basis data. Temuan ini dilaporkan secara transparan sebagai bahan pertimbangan penyempurnaan sistem menuju rilis produksi:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 10%;">ID Defect</th>
        <th style="width: 20%;">Komponen / Lokasi</th>
        <th style="width: 14%;">Tingkat Keparahan</th>
        <th style="width: 31%;">Deskripsi Temuan Cacat</th>
        <th style="width: 25%;">Rekomendasi Perbaikan (Remediasi)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>DEF-01</strong></td>
        <td><code>app/api/auth/login/route.ts</code> (Baris 121)</td>
        <td><span class="badge-defect">Tinggi (High)</span></td>
        <td>Atribut cookie sesi disetel <code>httpOnly: false</code>, sehingga objek sesi dapat diakses dan dibaca oleh skrip JavaScript di sisi klien, menimbulkan potensi kerentanan <em>Cross-Site Scripting (XSS) Session Theft</em>.</td>
        <td>Ubah nilai menjadi <code>httpOnly: true</code> agar cookie sesi hanya dapat dibaca dan dikirim oleh protokol HTTP server tanpa dapat disentuh oleh JavaScript browser.</td>
      </tr>
      <tr>
        <td><strong>DEF-02</strong></td>
        <td><code>app/api/auth/login/route.ts</code> (Baris 120)</td>
        <td><span class="badge-defect">Tinggi (High)</span></td>
        <td>Nilai cookie sesi (<code>ekrupsy_session</code>) menyimpan objek data pengguna dan peran (role) dalam format JSON mentah (plaintext) tanpa enkripsi atau tanda tangan digital (signing).</td>
        <td>Gunakan enkripsi token terstandarisasi seperti <strong>JSON Web Token (JWT)</strong> dengan algoritma HMAC-SHA256 (via library <code>jose</code>) atau simpan session ID di Redis.</td>
      </tr>
      <tr>
        <td><strong>DEF-03</strong></td>
        <td><code>app/api/pesanan/route.ts</code> (Baris 218–231)</td>
        <td><span class="badge-warning">Sedang (Medium-High)</span></td>
        <td>Operasi validasi stok dan pemotongan stok bahan berjalan secara sekuensial terpisah (non-atomic), berisiko menimbulkan <em>race condition</em> apabila dua pemesan membeli stok terakhir pada detik yang bersamaan.</td>
        <td>Terapkan PostgreSQL Stored Procedure (RPC) di Supabase dengan klausa <code>SELECT FOR UPDATE</code> atau operasi pengurangan atomik langsung di tingkat database engine.</td>
      </tr>
      <tr>
        <td><strong>DEF-04</strong></td>
        <td><code>supabase-schema.sql</code> (Baris 179–187)</td>
        <td><span class="badge-warning">Sedang (Medium)</span></td>
        <td>Fitur <em>Row Level Security (RLS)</em> pada tabel publik dinonaktifkan sementara (<code>DISABLE ROW LEVEL SECURITY</code>) untuk mempermudah koneksi Next.js.</td>
        <td>Aktifkan kembali RLS (<code>ENABLE ROW LEVEL SECURITY</code>) dan buat RLS Policies spesifik berbasis peran pengguna sebelum sistem dirilis ke domain publik internet.</td>
      </tr>
    </tbody>
  </table>

  <!-- 8. KESIMPULAN & EVALUASI KELAYAKAN SISTEM -->
  <h2>8. Kesimpulan & Rekomendasi Pengujian</h2>
  <div class="callout-box">
    <p style="margin: 0;">
      <strong>Ringkasan Hasil Evaluasi QA:</strong> Seluruh 25 kasus uji fungsional (100%) berstatus <strong>PASS</strong>. Alur operasional bisnis Make-To-Order Pabrik Kerupuk Diansyah—mulai dari pendaftaran akun, validasi formulir 4 lapis, keranjang multi-varian, multi-channel pembayaran, otorisasi lunas kasir tunggal Owner, pembatalan dan auto-refund stok, antrean wajan penggorengan, verifikasi mutu QC, hingga cetak resi dan laporan keuangan formal A4—telah berjalan selaras 100% dengan dokumen spesifikasi SRS dan SDD.
    </p>
  </div>
  <p>
    Terkait temuan pada <em>Defect Report</em> (DEF-01 s.d. DEF-04), tim pengembang telah menyusun rencana tindak lanjut perbaikan terstruktur (Fase Perbaikan Keamanan & Ketahanan Data) yang mencakup aktivasi <code>httpOnly: true</code>, migrasi ke JWT signing, dan stored procedure atomic stok sebelum aplikasi di-deploy ke lingkungan produksi komersial. Sistem dinyatakan <strong>LAYAK DAN SIAP</strong> untuk dipresentasikan dan diujikan di hadapan Dosen Pembimbing dan Asisten Dosen Rekayasa Perangkat Lunak.
  </p>

  <div class="footer-note">
    Dokumen Test Plan E-KRUPSY v1.0 | Pabrik Kerupuk Diansyah Sumedang | Tanggal Pengujian: 24 November 2026
  </div>

</div>

<!-- ============================================================================== -->
<!-- BACK COVER PAGE -->
<!-- ============================================================================== -->
<div class="back-cover-container">
  <div class="back-cover-card">
    <img src="data:image/jpeg;base64,${logoBase64}" alt="Logo E-KrupSy" style="width: 36mm; height: 36mm; border-radius: 50%; object-fit: cover; border: 3px solid #d97706; margin-bottom: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.18);" />
    <div style="font-size: 16pt; font-weight: 900; color: #0f172a; margin-bottom: 4px;">E-KRUPSY</div>
    <div style="font-size: 10pt; font-weight: 700; color: #1e3a8a; margin-bottom: 12px;">Sistem Informasi Pemesanan dan Manajemen Produksi Kerupuk</div>
    <div style="font-size: 9pt; color: #475569; line-height: 1.5; margin-bottom: 16px;">
      Dokumen Test Plan ini disusun dan diverifikasi sesuai standar baku rekayasa perangkat lunak IEEE Std 829-2008 / ISO/IEC/IEEE 29148.<br>
      Studi Kasus: <strong>Pabrik Kerupuk Diansyah, Sumedang, Jawa Barat</strong>.
    </div>
    <div style="font-size: 8.5pt; font-weight: 600; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px;">
      &copy; 2026 Tim Pengembang &amp; QA Kelompok 4 / IF-46-01.<br>Seluruh hak cipta dilindungi undang-undang.
    </div>
  </div>
</div>

</body>
</html>
`;

// Simpan file HTML generator
const htmlFilePath = path.resolve('TEST_PLAN_E-KRUPSY.html');
const pdfFilePath = path.resolve('TEST_PLAN_E-KRUPSY.pdf');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
console.log('HTML file written to:', htmlFilePath);

// Generate PDF via Headless Chrome
const fileUrl = 'file:///' + htmlFilePath.replace(/\\\\/g, '/');
console.log('Executing Headless Chrome print-to-pdf...');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
execSync('"' + chromePath + '" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="' + pdfFilePath + '" "' + fileUrl + '"');

const stats = fs.statSync(pdfFilePath);
console.log('SUCCESS: PDF Generated at:', pdfFilePath, 'Size:', stats.size, 'bytes');
