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
    .from('produk')
    .select('*')
    .order('id_produk', { ascending: true });

  if (error) {
    return NextResponse.json({ message: 'Gagal mengambil data produk: ' + error.message }, { status: 500 });
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
    const { nama_produk, satuan, harga, stok, deskripsi } = body;

    // 4 Jenis Validasi Input
    const validation = validateForm([
      { field: 'nama_produk', label: 'Nama Produk', value: nama_produk, required: true, dataType: 'string' },
      { field: 'satuan', label: 'Satuan', value: satuan, required: true, domain: { allowedValues: ['Bal', 'Kg', 'Pack', 'Bungkus'] } },
      { field: 'harga', label: 'Harga Jual', value: harga, required: true, dataType: 'number', domain: { min: 1000 } },
      { field: 'stok', label: 'Jumlah Stok Awal', value: stok, required: true, dataType: 'integer', domain: { min: 0 } },
    ]);

    if (!validation.isValid) {
      return NextResponse.json({
        message: validation.firstError || 'Validasi formulir produk gagal.',
        errors: validation.errors,
      }, { status: 400 });
    }

    const { data: newProd, error } = await supabase
      .from('produk')
      .insert({
        nama_produk: String(nama_produk).trim(),
        satuan: String(satuan).trim(),
        harga: Number(harga),
        stok: Number(stok),
        deskripsi: deskripsi ? String(deskripsi).trim() : null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: 'Gagal menyimpan produk ke database: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Produk kerupuk baru berhasil ditambahkan.',
      data: newProd,
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Terjadi kesalahan sistem: ' + err.message }, { status: 500 });
  }
}
