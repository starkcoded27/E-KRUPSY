import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { validateForm } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Database Supabase tidak terhubung.' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('stok_bahan')
    .select('*')
    .order('id_stok', { ascending: true });

  if (error) {
    return NextResponse.json({ message: 'Gagal mengambil data stok: ' + error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Database Supabase tidak terhubung.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { nama_bahan, kategori, satuan, jumlah, id_user } = body;

    // 4 Jenis Validasi Input
    const validation = validateForm([
      { field: 'nama_bahan', label: 'Nama Bahan / Plastik', value: nama_bahan, required: true, dataType: 'string' },
      { 
        field: 'kategori', 
        label: 'Kategori Bahan', 
        value: kategori, 
        required: true, 
        domain: { allowedValues: ['Kerupuk Mentah', 'Bumbu', 'Plastik', 'Bahan Baku'] } 
      },
      { field: 'satuan', label: 'Satuan', value: satuan, required: true, domain: { allowedValues: ['Kg', 'Pack', 'Liter', 'Pcs', 'Rol'] } },
      { 
        field: 'jumlah', 
        label: 'Jumlah Stok Masuk', 
        value: jumlah, 
        required: true, 
        dataType: 'integer', 
        domain: { min: 1, max: 10000 } 
      },
    ]);

    if (!validation.isValid) {
      return NextResponse.json({
        message: validation.firstError || 'Data input stok tidak valid.',
        errors: validation.errors,
      }, { status: 400 });
    }

    // Cek apakah item sudah ada di stok_bahan (jika ada, tambahkan jumlahnya)
    const { data: existingItem } = await supabase
      .from('stok_bahan')
      .select('id_stok, jumlah')
      .eq('nama_bahan', String(nama_bahan).trim())
      .maybeSingle();

    if (existingItem) {
      const updatedTotal = existingItem.jumlah + Number(jumlah);
      const { data: updated, error: updateErr } = await supabase
        .from('stok_bahan')
        .update({
          jumlah: updatedTotal,
          id_user: id_user ? Number(id_user) : null,
          tanggal_update: new Date().toISOString().split('T')[0],
        })
        .eq('id_stok', existingItem.id_stok)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ message: 'Gagal memperbarui stok: ' + updateErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Stok "${nama_bahan}" berhasil ditambahkan (+${jumlah} ${satuan}). Total sekarang: ${updatedTotal} ${satuan}.`,
        data: updated,
      });
    }

    // Jika belum ada, insert baru
    const { data: newItem, error: insertErr } = await supabase
      .from('stok_bahan')
      .insert({
        nama_bahan: String(nama_bahan).trim(),
        kategori,
        satuan,
        jumlah: Number(jumlah),
        id_user: id_user ? Number(id_user) : null,
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ message: 'Gagal menambah data stok baru: ' + insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Item stok "${nama_bahan}" (${jumlah} ${satuan}) berhasil disimpan di database.`,
      data: newItem,
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Terjadi kesalahan sistem: ' + err.message }, { status: 500 });
  }
}
