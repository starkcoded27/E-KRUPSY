import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';
import { localStore } from '@/lib/mock-data';
import { UserRole } from '@/types/database';

export const dynamic = 'force-dynamic';

function getRedirectPathByRole(role: UserRole): string {
  switch (role) {
    case 'owner':
      return '/dashboard/owner';
    case 'staff_penggoreng':
      return '/dashboard/staff-penggoreng';
    case 'staff_pembungkus':
      return '/dashboard/staff-pembungkus';
    case 'pelanggan':
    default:
      return '/dashboard/pelanggan';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { usernameOrEmail, password } = body;

    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { message: 'Harap isi username/email dan password' },
        { status: 400 }
      );
    }

    const cleanIdentifier = String(usernameOrEmail).trim();
    const cleanPassword = String(password).trim();

    let authenticatedUser: any = null;
    let pelangganData: any = null;
    let dataSource = 'local_fallback';

    // 1. Try Supabase if configured
    if (isSupabaseConfigured) {
      const supabase = getSupabaseServerClient();
      if (supabase) {
        try {
          // Cari user berdasarkan username
          const { data: userResult, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', cleanIdentifier)
            .maybeSingle();

          if (!error && userResult) {
            const isMatch = await bcrypt.compare(cleanPassword, userResult.password);
            if (isMatch) {
              authenticatedUser = userResult;
              dataSource = 'supabase';

              // Jika role adalah pelanggan, ambil data pelanggan
              if (userResult.role === 'pelanggan') {
                const { data: pelData } = await supabase
                  .from('pelanggan')
                  .select('*')
                  .eq('id_user', userResult.id_user)
                  .maybeSingle();
                pelangganData = pelData || null;
              }
            }
          }
        } catch (dbErr) {
          console.error('Supabase query error, fallback to local store:', dbErr);
        }
      }
    }

    // 2. Fallback to local store / pre-seeded accounts if not found in Supabase
    if (!authenticatedUser) {
      const userResult = localStore.findUserByUsernameOrEmail(cleanIdentifier);
      if (userResult) {
        const isMatch = await bcrypt.compare(cleanPassword, userResult.password_hash);
        if (isMatch) {
          authenticatedUser = userResult;
          dataSource = 'local_store';
          if (userResult.role === 'pelanggan') {
            pelangganData = localStore.getPelangganByUserId(userResult.id_user);
          }
        }
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { message: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    const safeUser = {
      id_user: authenticatedUser.id_user,
      username: authenticatedUser.username,
      nama: authenticatedUser.nama,
      role: authenticatedUser.role as UserRole,
    };

    const redirectUrl = getRedirectPathByRole(safeUser.role);

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: safeUser,
      pelanggan: pelangganData,
      redirectUrl,
      source: dataSource,
    });

    // Simpan session cookie sederhana
    response.cookies.set({
      name: 'ekrupsy_session',
      value: JSON.stringify({ user: safeUser, pelanggan: pelangganData }),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan sistem saat proses login.' },
      { status: 500 }
    );
  }
}
