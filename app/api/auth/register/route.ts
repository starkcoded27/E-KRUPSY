import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';
import { localStore } from '@/lib/mock-data';
import { validateForm } from '@/lib/validation';

export const dynamic = 'force-dynamic';

// Konstanta batas karakter & angka untuk menghilangkan Code Smell Magic Numbers
const MIN_PASSWORD_LENGTH = 6;
const MIN_PHONE_DIGITS = 9;
const MAX_PHONE_DIGITS = 15;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nama_lengkap,
      username,
      email,
      password,
      no_telp,
      alamat,
      jenis_kelamin,
    } = body;

    // Refactoring: Menggunakan modul validasi terpusat (lib/validation.ts) menggantikan if-else bertumpuk
    const validation = validateForm([
      { field: 'nama_lengkap', label: 'Nama Lengkap', value: nama_lengkap, required: true },
      { field: 'username', label: 'Username', value: username, required: true },
      { field: 'email', label: 'Email', value: email, required: true, format: 'email' },
      { 
        field: 'password', 
        label: 'Password', 
        value: password, 
        required: true,
        customValidator: (val) => {
          if (String(val).length < MIN_PASSWORD_LENGTH) {
            return `Password minimal harus ${MIN_PASSWORD_LENGTH} karakter.`;
          }
          return null;
        }
      },
      { 
        field: 'no_telp', 
        label: 'Nomor Telepon', 
        value: no_telp, 
        required: true,
        customValidator: (val) => {
          const clean = String(val).trim();
          if (!/^[0-9]+$/.test(clean)) {
            return 'Nomor telepon harus berupa angka (integer), tidak boleh mengandung huruf atau simbol.';
          }
          if (clean.length < MIN_PHONE_DIGITS || clean.length > MAX_PHONE_DIGITS) {
            return `Nomor telepon harus terdiri dari ${MIN_PHONE_DIGITS} hingga ${MAX_PHONE_DIGITS} digit angka.`;
          }
          return null;
        }
      },
      { field: 'alamat', label: 'Alamat', value: alamat, required: true },
    ]);

    if (!validation.isValid) {
      return NextResponse.json(
        { message: validation.firstError || 'Harap lengkapi semua data formulir pendaftaran.' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanNama = String(nama_lengkap).trim();
    const cleanNoTelp = String(no_telp).trim();
    const cleanAlamat = String(alamat).trim();

    // 1. Cek duplikasi di Supabase jika terkonfigurasi
    if (isSupabaseConfigured) {
      const supabase = getSupabaseServerClient();
      if (supabase) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id_user')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (existingUser) {
          return NextResponse.json(
            { message: 'Username sudah digunakan, silakan pilih username lain.' },
            { status: 409 }
          );
        }

        const { data: existingPelanggan } = await supabase
          .from('pelanggan')
          .select('id_pelanggan')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existingPelanggan) {
          return NextResponse.json(
            { message: 'Email sudah terdaftar. Silakan gunakan email lain atau langsung login.' },
            { status: 409 }
          );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert ke tabel users (role = 'pelanggan')
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            username: cleanUsername,
            password: passwordHash,
            nama: cleanNama,
            role: 'pelanggan',
          })
          .select()
          .single();

        if (userError || !newUser) {
          console.error('Error creating user in Supabase:', userError);
          return NextResponse.json(
            { message: 'Gagal membuat akun di Supabase: ' + (userError?.message || 'Database error') },
            { status: 500 }
          );
        }

        // Insert ke tabel pelanggan
        const { error: pelError } = await supabase
          .from('pelanggan')
          .insert({
            id_user: newUser.id_user,
            nama_lengkap: cleanNama,
            alamat: cleanAlamat,
            no_telp: cleanNoTelp,
            email: cleanEmail,
            jenis_kelamin: jenis_kelamin || 'Laki-Laki',
          });

        if (pelError) {
          console.error('Error creating pelanggan in Supabase:', pelError);
          // Tetap berhasil membuat akun user
        }

        return NextResponse.json({
          success: true,
          message: 'Pendaftaran berhasil! Akun Anda telah tersimpan di Supabase. Silakan login.',
        });
      }
    }

    // 2. Fallback local store jika Supabase belum dihubungkan
    const existing = localStore.findUserByUsernameOrEmail(cleanUsername);
    if (existing) {
      return NextResponse.json(
        { message: 'Username sudah terdaftar di sistem.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    localStore.addUser({
      username: cleanUsername,
      nama: cleanNama,
      password_hash: passwordHash,
      email: cleanEmail,
      role: 'pelanggan',
      alamat: cleanAlamat,
      no_telp: cleanNoTelp,
      jenis_kelamin,
    });

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil! Akun pelanggan berhasil dibuat. Silakan login.',
      isLocal: true,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada sistem saat proses pendaftaran.' },
      { status: 500 }
    );
  }
}
