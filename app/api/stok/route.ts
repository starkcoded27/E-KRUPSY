import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { validateForm } from '@/lib/validation';
import { 
  syncRawMaterialToProductCatalog, 
  KG_PER_BAL 
} from '@/lib/stock-sync';
import { getCached, setCached, invalidateCache } from '@/lib/api-cache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/stok
 * Menampilkan daftar seluruh stok bahan baku (Hanya Kerupuk Mentah, Bumbu, & Plastik)
 */
export async function GET() {
  const cached = getCached('api:stok', 4000);
  if (cached) {
    return NextResponse.json({ success: true, data: cached });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Database Supabase tidak terhubung.' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('stok_bahan')
    .select('*')
    .order('kategori', { ascending: true })
    .order('nama_bahan', { ascending: true });

  if (error) {
    return NextResponse.json({ message: 'Gagal mengambil data stok: ' + error.message }, { status: 500 });
  }

  // Filter ketat: Pastikan tidak ada stok minyak goreng yang tampil
  const filteredData = (data || []).filter(
    (item: any) => !item.nama_bahan.toLowerCase().includes('minyak')
  );

  setCached('api:stok', filteredData);

  return NextResponse.json({ success: true, data: filteredData });
}

/**
 * POST /api/stok
 * Menambah stok baru atau restock pasokan masuk supplier (KHUSUS OWNER)
 */
export async function POST(req: NextRequest) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Database Supabase tidak terhubung.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { action = 'add', nama_bahan, kategori, satuan, jumlah, id_user, role } = body;

    // Hak Akses Ketat: Hanya Owner yang boleh mengelola (CRUD) stok!
    if (role && role !== 'owner') {
      return NextResponse.json({
        message: 'Akses ditolak! Hanya Owner yang memiliki izin menambah atau memodifikasi stok bahan.',
      }, { status: 403 });
    }

    // Blokir jika mencoba input minyak
    if (nama_bahan && String(nama_bahan).toLowerCase().includes('minyak')) {
      return NextResponse.json({
        message: 'Stok minyak goreng telah dinonaktifkan dari sistem. Hanya boleh mengelola Kerupuk Mentah, Bumbu, dan Plastik.',
      }, { status: 400 });
    }

    // 4 Jenis Validasi Input
    const validation = validateForm([
      { field: 'nama_bahan', label: 'Nama Bahan / Kemasan', value: nama_bahan, required: true, dataType: 'string' },
      { 
        field: 'kategori', 
        label: 'Kategori Bahan', 
        value: kategori, 
        required: true, 
        domain: { allowedValues: ['Kerupuk Mentah', 'Bumbu', 'Plastik'] } 
      },
      { 
        field: 'satuan', 
        label: 'Satuan', 
        value: satuan, 
        required: true, 
        domain: { allowedValues: ['Kg', 'Pack', 'Bal', 'Pcs', 'Bungkus'] } 
      },
      { 
        field: 'jumlah', 
        label: 'Jumlah Stok', 
        value: jumlah, 
        required: true, 
        dataType: 'integer', 
        domain: { min: 1, max: 50000 } 
      },
    ]);

    if (!validation.isValid) {
      return NextResponse.json({
        message: validation.firstError || 'Data input stok tidak valid.',
        errors: validation.errors,
      }, { status: 400 });
    }

    const cleanNama = String(nama_bahan).trim();
    const cleanKat = String(kategori).trim();
    const cleanSat = String(satuan).trim();
    const inputJumlah = Number(jumlah);
    const today = new Date().toISOString().split('T')[0];

    // Cek apakah item sudah ada di database
    const { data: existingItem } = await supabase
      .from('stok_bahan')
      .select('id_stok, jumlah, kategori, satuan')
      .ilike('nama_bahan', cleanNama)
      .maybeSingle();

    if (existingItem) {
      // Jika sudah ada, tambahkan stoknya (Restock)
      const updatedTotal = (existingItem.jumlah || 0) + inputJumlah;
      const { data: updated, error: updateErr } = await supabase
        .from('stok_bahan')
        .update({
          jumlah: updatedTotal,
          id_user: id_user ? Number(id_user) : null,
          tanggal_update: today,
        })
        .eq('id_stok', existingItem.id_stok)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ message: 'Gagal memperbarui stok: ' + updateErr.message }, { status: 500 });
      }

      // Sinkronisasi otomatis ke katalog Owner jika kategori adalah Kerupuk Mentah
      if (cleanKat === 'Kerupuk Mentah' || existingItem.kategori === 'Kerupuk Mentah') {
        await syncRawMaterialToProductCatalog(supabase, cleanNama, inputJumlah);
      }

      const balAdded = Math.floor(inputJumlah / KG_PER_BAL);
      const syncInfo = (cleanKat === 'Kerupuk Mentah' || existingItem.kategori === 'Kerupuk Mentah') && balAdded > 0
        ? ` (Otomatis menambah +${balAdded} Bal di katalog Owner)`
        : '';

      invalidateCache();

      return NextResponse.json({
        success: true,
        message: `Stok "${cleanNama}" berhasil ditambahkan (+${inputJumlah} ${existingItem.satuan}). Total sekarang: ${updatedTotal} ${existingItem.satuan}.${syncInfo}`,
        data: updated,
      });
    }

    // Jika belum ada, buat record baru
    const { data: newItem, error: insertErr } = await supabase
      .from('stok_bahan')
      .insert({
        nama_bahan: cleanNama,
        kategori: cleanKat,
        satuan: cleanSat,
        jumlah: inputJumlah,
        id_user: id_user ? Number(id_user) : null,
        tanggal_update: today,
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ message: 'Gagal menambah data stok baru: ' + insertErr.message }, { status: 500 });
    }

    // Sinkronisasi otomatis ke katalog jika Kerupuk Mentah
    if (cleanKat === 'Kerupuk Mentah') {
      await syncRawMaterialToProductCatalog(supabase, cleanNama, inputJumlah);
    }

    const balAdded = Math.floor(inputJumlah / KG_PER_BAL);
    const syncInfo = cleanKat === 'Kerupuk Mentah' && balAdded > 0
      ? ` (Otomatis terkonversi +${balAdded} Bal di katalog Owner)`
      : '';

    invalidateCache();

    return NextResponse.json({
      success: true,
      message: `Item stok baru "${cleanNama}" (${inputJumlah} ${cleanSat}) berhasil ditambahkan.${syncInfo}`,
      data: newItem,
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Terjadi kesalahan sistem: ' + err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/stok
 * Mengubah data stok bahan baku (Edit Jumlah / Keterangan) (KHUSUS OWNER)
 */
export async function PATCH(req: NextRequest) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Database Supabase tidak terhubung.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { id_stok, nama_bahan, kategori, satuan, jumlah, role } = body;

    // Hak Akses Ketat: Hanya Owner yang boleh mengedit stok
    if (role && role !== 'owner') {
      return NextResponse.json({
        message: 'Akses ditolak! Hanya Owner yang memiliki izin mengedit stok.',
      }, { status: 403 });
    }

    if (!id_stok) {
      return NextResponse.json({ message: 'ID Stok wajib disertakan.' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    const updatePayload: Record<string, any> = {
      tanggal_update: today,
    };

    if (nama_bahan !== undefined) updatePayload.nama_bahan = String(nama_bahan).trim();
    if (kategori !== undefined) updatePayload.kategori = String(kategori).trim();
    if (satuan !== undefined) updatePayload.satuan = String(satuan).trim();
    if (jumlah !== undefined) updatePayload.jumlah = Math.max(0, Number(jumlah));

    const { data: updated, error } = await supabase
      .from('stok_bahan')
      .update(updatePayload)
      .eq('id_stok', Number(id_stok))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: 'Gagal mengedit stok: ' + error.message }, { status: 500 });
    }

    invalidateCache();

    return NextResponse.json({
      success: true,
      message: `Data stok "${updated.nama_bahan}" berhasil diperbarui. Total stok saat ini: ${updated.jumlah} ${updated.satuan}.`,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Terjadi kesalahan sistem: ' + err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/stok
 * Menghapus item stok bahan baku dari database (KHUSUS OWNER)
 */
export async function DELETE(req: NextRequest) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Database Supabase tidak terhubung.' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id_stok = searchParams.get('id_stok');
    const role = searchParams.get('role');

    // Hak Akses Ketat: Hanya Owner yang boleh menghapus item stok
    if (role && role !== 'owner') {
      return NextResponse.json({
        message: 'Akses ditolak! Hanya Owner yang memiliki izin menghapus stok.',
      }, { status: 403 });
    }

    if (!id_stok) {
      return NextResponse.json({ message: 'ID Stok wajib disertakan.' }, { status: 400 });
    }

    const { data: deleted, error } = await supabase
      .from('stok_bahan')
      .delete()
      .eq('id_stok', Number(id_stok))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: 'Gagal menghapus data stok: ' + error.message }, { status: 500 });
    }

    invalidateCache();

    return NextResponse.json({
      success: true,
      message: `Item stok "${deleted?.nama_bahan || '#' + id_stok}" berhasil dihapus dari sistem.`,
      data: deleted,
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Terjadi kesalahan sistem: ' + err.message }, { status: 500 });
  }
}
