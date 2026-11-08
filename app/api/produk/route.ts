import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { validateForm } from '@/lib/validation';
import { productToBahanName, KG_PER_BAL } from '@/lib/stock-sync';

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

  // Hitung jumlah terjual secara live otomatis dari tabel pesanan (hanya pesanan aktif/selesai, bukan dibatalkan)
  const { data: pesananList, error: orderErr } = await supabase
    .from('pesanan')
    .select('id_produk, jumlah, status_pesanan');

  const soldMap: Record<number, number> = {};
  if (!orderErr && Array.isArray(pesananList)) {
    for (const ord of pesananList) {
      if (ord.id_produk && ord.status_pesanan !== 'dibatalkan') {
        const qty = Number(ord.jumlah) || 0;
        soldMap[ord.id_produk] = (soldMap[ord.id_produk] || 0) + qty;
      }
    }
  }

  // Gabungkan jumlah terjual ke masing-masing produk
  const enrichedProducts = (data || []).map((prod: any) => ({
    ...prod,
    terjual: (soldMap[prod.id_produk] || 0) + (Number(prod.terjual) || 0),
  }));

  return NextResponse.json({ success: true, data: enrichedProducts });
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Database Supabase tidak terhubung.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { nama_produk, satuan, harga, stok, deskripsi, gambar_url } = body;

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

    const cleanNama = String(nama_produk).trim();

    // Validasi Duplikasi Produk: Mencegah penambahan produk dengan nama yang sama (Case-Insensitive)
    const { data: existingProducts, error: checkError } = await supabase
      .from('produk')
      .select('id_produk, nama_produk');

    if (checkError) {
      console.error('Error saat memeriksa duplikasi katalog produk:', checkError);
    }

    const isDuplicate = existingProducts?.some(
      (p) => p.nama_produk && p.nama_produk.trim().toLowerCase() === cleanNama.toLowerCase()
    );

    if (isDuplicate) {
      return NextResponse.json(
        {
          success: false,
          field: 'nama_produk',
          message: `Produk "${cleanNama}" sudah ada di dalam katalog. Tidak dapat menambahkan produk yang sama!`,
          errors: {
            nama_produk: `Produk "${cleanNama}" sudah terdaftar di katalog. Tidak dapat menambahkan produk yang sama.`,
          },
        },
        { status: 400 }
      );
    }

    const { data: newProd, error } = await supabase
      .from('produk')
      .insert({
        nama_produk: cleanNama,
        satuan: String(satuan).trim(),
        harga: Number(harga),
        stok: Number(stok),
        deskripsi: deskripsi ? String(deskripsi).trim() : null,
        gambar_url: gambar_url ? String(gambar_url).trim() : null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: 'Gagal menyimpan produk ke database: ' + error.message }, { status: 500 });
    }

    // Sinkronisasi otomatis ke stok_bahan (Dapur Penggorengan Dadakan)
    const bahanName = productToBahanName(cleanNama);
    const kgEquivalent = Number(stok) * KG_PER_BAL;

    const { data: existingBahan } = await supabase
      .from('stok_bahan')
      .select('id_stok, jumlah')
      .ilike('nama_bahan', bahanName)
      .maybeSingle();

    if (existingBahan) {
      await supabase
        .from('stok_bahan')
        .update({
          jumlah: (existingBahan.jumlah || 0) + kgEquivalent,
          tanggal_update: new Date().toISOString().split('T')[0],
        })
        .eq('id_stok', existingBahan.id_stok);
    } else {
      await supabase
        .from('stok_bahan')
        .insert({
          nama_bahan: bahanName,
          kategori: 'Kerupuk Mentah',
          satuan: 'Kg',
          jumlah: kgEquivalent,
          tanggal_update: new Date().toISOString().split('T')[0],
        });
    }

    return NextResponse.json({
      success: true,
      message: `Produk kerupuk baru berhasil ditambahkan (${stok} Bal setara ${kgEquivalent} Kg mentah di dapur).`,
      data: newProd,
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Terjadi kesalahan sistem: ' + err.message }, { status: 500 });
  }
}

/**
 * PATCH: Restock / Tambah Stok Produk oleh Owner (Pasokan Supplier)
 * Otomatis menambah stok Bal di produk dan stok Kg di stok_bahan (Dapur Wajan Penggoreng)
 */
export async function PATCH(req: NextRequest) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Database Supabase tidak terhubung.' }, { status: 500 });
  }

  try {
    const body = await req.json();

    // Mode Edit Data & Foto Produk
    if (body.action === 'edit') {
      const { id_produk, nama_produk, satuan, harga, deskripsi, gambar_url } = body;
      const validation = validateForm([
        { field: 'id_produk', label: 'ID Produk', value: id_produk, required: true, dataType: 'integer' },
        { field: 'nama_produk', label: 'Nama Produk', value: nama_produk, required: true, dataType: 'string' },
        { field: 'harga', label: 'Harga Jual', value: harga, required: true, dataType: 'number', domain: { min: 1000 } },
      ]);

      if (!validation.isValid) {
        return NextResponse.json({
          message: validation.firstError || 'Data edit produk tidak valid.',
          errors: validation.errors,
        }, { status: 400 });
      }

      const { data: updatedProd, error: updateErr } = await supabase
        .from('produk')
        .update({
          nama_produk: String(nama_produk).trim(),
          satuan: satuan ? String(satuan).trim() : 'Bal',
          harga: Number(harga),
          deskripsi: deskripsi ? String(deskripsi).trim() : null,
          gambar_url: gambar_url ? String(gambar_url).trim() : null,
        })
        .eq('id_produk', Number(id_produk))
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ message: 'Gagal mengubah produk: ' + updateErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Produk "${updatedProd.nama_produk}" berhasil diperbarui!`,
        data: updatedProd,
      });
    }

    const { id_produk, additional_stok } = body;

    const validation = validateForm([
      { field: 'id_produk', label: 'ID Produk', value: id_produk, required: true, dataType: 'integer' },
      { 
        field: 'additional_stok', 
        label: 'Jumlah Tambahan Bal', 
        value: additional_stok, 
        required: true, 
        dataType: 'integer', 
        domain: { min: 1, max: 5000 } 
      },
    ]);

    if (!validation.isValid) {
      return NextResponse.json({
        message: validation.firstError || 'Data restock tidak valid.',
        errors: validation.errors,
      }, { status: 400 });
    }

    const { data: currentProd, error: fetchErr } = await supabase
      .from('produk')
      .select('*')
      .eq('id_produk', Number(id_produk))
      .maybeSingle();

    if (fetchErr || !currentProd) {
      return NextResponse.json({ message: 'Produk tidak ditemukan di katalog.' }, { status: 404 });
    }

    const addBal = Number(additional_stok);
    const newStokBal = (currentProd.stok || 0) + addBal;

    const { data: updatedProd, error: updateErr } = await supabase
      .from('produk')
      .update({ stok: newStokBal })
      .eq('id_produk', Number(id_produk))
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ message: 'Gagal memperbarui stok produk: ' + updateErr.message }, { status: 500 });
    }

    // Sinkronisasi otomatis ke stok_bahan (Dapur Penggorengan Dadakan)
    // 1 Bal = 5 Kg kerupuk mentah
    const bahanName = productToBahanName(currentProd.nama_produk);
    const kgEquivalent = addBal * KG_PER_BAL;

    const { data: existingBahan } = await supabase
      .from('stok_bahan')
      .select('id_stok, jumlah')
      .ilike('nama_bahan', bahanName)
      .maybeSingle();

    if (existingBahan) {
      const newKg = (existingBahan.jumlah || 0) + kgEquivalent;
      await supabase
        .from('stok_bahan')
        .update({
          jumlah: newKg,
          tanggal_update: new Date().toISOString().split('T')[0],
        })
        .eq('id_stok', existingBahan.id_stok);
    } else {
      await supabase
        .from('stok_bahan')
        .insert({
          nama_bahan: bahanName,
          kategori: 'Kerupuk Mentah',
          satuan: 'Kg',
          jumlah: kgEquivalent,
          tanggal_update: new Date().toISOString().split('T')[0],
        });
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil restock ${currentProd.nama_produk}: +${addBal} Bal (Otomatis menambah +${kgEquivalent} Kg bahan mentah di dapur). Total stok sekarang: ${newStokBal} Bal.`,
      data: updatedProd,
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Terjadi kesalahan sistem: ' + err.message }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Database Supabase tidak terhubung.' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'ID Produk wajib disertakan.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('produk')
      .delete()
      .eq('id_produk', Number(id));

    if (error) {
      return NextResponse.json({ message: 'Gagal menghapus produk: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus dari katalog pabrik.' });
  } catch (err: any) {
    return NextResponse.json({ message: 'Terjadi kesalahan sistem: ' + err.message }, { status: 500 });
  }
}
