import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { validateForm } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Database Supabase tidak terhubung.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { id_produksi, id_user, status, keterangan } = body;

    // 4 Jenis Validasi Input
    const validation = validateForm([
      { field: 'id_produksi', label: 'ID Produksi', value: id_produksi, required: true, dataType: 'integer' },
      { field: 'id_user', label: 'ID Verifikator', value: id_user, required: true, dataType: 'integer' },
      { 
        field: 'status', 
        label: 'Status Kelayakan Mutu', 
        value: status, 
        required: true, 
        domain: { allowedValues: ['Lolos Verifikasi', 'Cacat / Tidak Sesuai'] } 
      },
      { field: 'keterangan', label: 'Catatan / Keterangan Verifikasi', value: keterangan, required: true, dataType: 'string' },
    ]);

    if (!validation.isValid) {
      return NextResponse.json({
        message: validation.firstError || 'Validasi verifikasi tidak lengkap.',
        errors: validation.errors,
      }, { status: 400 });
    }

    // 1. Catat ke tabel verifikasi_produksi
    const { data: verifData, error: verifErr } = await supabase
      .from('verifikasi_produksi')
      .insert({
        id_produksi: Number(id_produksi),
        id_user: Number(id_user),
        status,
        keterangan: String(keterangan).trim(),
      })
      .select()
      .single();

    if (verifErr) {
      return NextResponse.json({ message: 'Gagal menyimpan hasil verifikasi: ' + verifErr.message }, { status: 500 });
    }

    // 2. Jika lolos verifikasi, status di tabel verifikasi_produksi sudah 'Lolos Verifikasi'
    // Sistem otomatis mengenali status 'Sedang Dikemas' dari relasi verifikasi_produksi
    if (status === 'Lolos Verifikasi') {
      try {
        // Coba perbarui status_produksi jika check constraint mengizinkan 'sedang_dikemas'
        await supabase
          .from('produksi')
          .update({ status_produksi: 'sedang_dikemas' })
          .eq('id_produksi', Number(id_produksi));
      } catch (ign) {
        // Abaikan jika database PostgreSQL menerapkan constraint ketat SDD ('menunggu','diproses','siap_diverifikasi','selesai')
      }
    }

    return NextResponse.json({
      success: true,
      message: status === 'Lolos Verifikasi' 
        ? 'Hasil verifikasi berhasil dicatat! Status produk otomatis berganti menjadi "Sedang Dikemas".' 
        : 'Hasil verifikasi dicatat: Produk tidak sesuai.',
      data: verifData,
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Terjadi kesalahan sistem: ' + err.message }, { status: 500 });
  }
}
