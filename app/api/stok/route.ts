import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { validateForm } from '@/lib/validation';
import { 
  syncRawMaterialToProductCatalog, 
  reduceProductCatalogFromRawMaterial, 
  KG_PER_BAL 
} from '@/lib/stock-sync';

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
    const { action = 'add', nama_bahan, kategori, satuan, jumlah, id_user } = body;

    // =========================================================================
    // 1. ACTION: REDUCE (PENGGORENG MENGURANGI STOK BAHAN YANG DIPAKAI KE WAJAN)
    // =========================================================================
    if (action === 'reduce') {
      const validation = validateForm([
        { field: 'nama_bahan', label: 'Nama Bahan Baku', value: nama_bahan, required: true, dataType: 'string' },
        { 
          field: 'jumlah', 
          label: 'Jumlah yang Dipakai', 
          value: jumlah, 
          required: true, 
          dataType: 'integer', 
          domain: { min: 1, max: 10000 } 
        },
      ]);

      if (!validation.isValid) {
        return NextResponse.json({
          message: validation.firstError || 'Data pengurangan stok tidak valid.',
          errors: validation.errors,
        }, { status: 400 });
      }

      const cleanNama = String(nama_bahan).trim();

      // Cari item stok di database
      const { data: existingItem, error: findErr } = await supabase
        .from('stok_bahan')
        .select('*')
        .eq('nama_bahan', cleanNama)
        .maybeSingle();

      if (findErr || !existingItem) {
        return NextResponse.json({
          message: `Item bahan "${cleanNama}" tidak ditemukan di database stok dapur.`,
        }, { status: 404 });
      }

      const reduceAmount = Number(jumlah);

      // Validasi ketersediaan stok
      if (existingItem.jumlah < reduceAmount) {
        return NextResponse.json({
          message: `Stok "${cleanNama}" tidak mencukupi! Tersedia saat ini hanya ${existingItem.jumlah} ${existingItem.satuan}, tidak dapat mengurangi ${reduceAmount} ${existingItem.satuan}.`,
        }, { status: 400 });
      }

      const updatedTotal = existingItem.jumlah - reduceAmount;

      const { data: updated, error: updateErr } = await supabase
        .from('stok_bahan')
        .update({
          jumlah: updatedTotal,
          id_user: id_user ? Number(id_user) : existingItem.id_user,
          tanggal_update: new Date().toISOString().split('T')[0],
        })
        .eq('id_stok', existingItem.id_stok)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ message: 'Gagal mencatat pemakaian stok: ' + updateErr.message }, { status: 500 });
      }

      // Jika kategori Kerupuk Mentah, otomatis kurangi stok di katalog produk Owner & Pelanggan
      const isMentah = existingItem.kategori === 'Kerupuk Mentah' || kategori === 'Kerupuk Mentah';
      let syncInfo = '';

      if (isMentah) {
        await reduceProductCatalogFromRawMaterial(supabase, cleanNama, reduceAmount);
        const balReduced = Math.floor(reduceAmount / KG_PER_BAL);
        if (balReduced > 0) {
          syncInfo = ` (Otomatis mengurangi -${balReduced} Bal di katalog Owner & Pelanggan)`;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Pemakaian "${cleanNama}" sebanyak ${reduceAmount} ${existingItem.satuan} berhasil dicatat. Sisa stok dapur: ${updatedTotal} ${existingItem.satuan}.${syncInfo}`,
        data: updated,
      });
    }

    // =========================================================================
    // 2. ACTION: ADD / RESTOCK (OWNER MENAMBAH PASOKAN BAHAN MASUK DARI SUPPLIER)
    // =========================================================================
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

    const cleanNama = String(nama_bahan).trim();

    // Cek apakah item sudah ada di stok_bahan (jika ada, tambahkan jumlahnya)
    const { data: existingItem } = await supabase
      .from('stok_bahan')
      .select('id_stok, jumlah, kategori, satuan')
      .eq('nama_bahan', cleanNama)
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

      // Sinkronisasi otomatis ke katalog Owner jika kategori adalah Kerupuk Mentah
      if (kategori === 'Kerupuk Mentah' || existingItem.kategori === 'Kerupuk Mentah') {
        await syncRawMaterialToProductCatalog(supabase, cleanNama, Number(jumlah));
      }

      const balAdded = Math.floor(Number(jumlah) / KG_PER_BAL);
      const syncInfo = (kategori === 'Kerupuk Mentah' || existingItem.kategori === 'Kerupuk Mentah') && balAdded > 0
        ? ` (Otomatis menambah +${balAdded} Bal di katalog Owner)`
        : '';

      return NextResponse.json({
        success: true,
        message: `Stok "${cleanNama}" berhasil ditambahkan (+${jumlah} ${satuan}). Total sekarang: ${updatedTotal} ${satuan}.${syncInfo}`,
        data: updated,
      });
    }

    // Jika belum ada, insert baru
    const { data: newItem, error: insertErr } = await supabase
      .from('stok_bahan')
      .insert({
        nama_bahan: cleanNama,
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

    // Sinkronisasi otomatis ke katalog Owner
    if (kategori === 'Kerupuk Mentah') {
      await syncRawMaterialToProductCatalog(supabase, cleanNama, Number(jumlah));
    }

    const balAdded = Math.floor(Number(jumlah) / KG_PER_BAL);
    const syncInfo = kategori === 'Kerupuk Mentah' && balAdded > 0
      ? ` (Otomatis terkonversi +${balAdded} Bal di katalog Owner)`
      : '';

    return NextResponse.json({
      success: true,
      message: `Item stok "${cleanNama}" (${jumlah} ${satuan}) berhasil disimpan di database.${syncInfo}`,
      data: newItem,
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Terjadi kesalahan sistem: ' + err.message }, { status: 500 });
  }
}
