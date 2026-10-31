import { NextResponse } from 'next/server';
import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !anonKey || url === 'https://your-project.supabase.co') {
    return NextResponse.json({
      connected: false,
      status: 'unconfigured',
      message: 'Kredensial Supabase belum diisi di file .env.local',
      tip: 'Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di file .env.local lalu restart server (npm run dev).',
    });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({
      connected: false,
      status: 'client_error',
      message: 'Gagal membuat Supabase client.',
    });
  }

  try {
    // Tes query ke tabel users yang baru saja dibuat
    const { data: users, error, count } = await supabase
      .from('users')
      .select('id_user, username, role, nama', { count: 'exact' });

    if (error) {
      return NextResponse.json({
        connected: false,
        status: 'query_error',
        message: 'Gagal terhubung ke database Supabase: ' + error.message,
        details: error,
      });
    }

    return NextResponse.json({
      connected: true,
      status: 'connected',
      message: 'Berhasil terhubung ke database Supabase Pabrik Kerupuk Diansyah!',
      totalUsersInSupabase: users?.length || 0,
      users: users,
    });
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      status: 'error',
      message: 'Terjadi kesalahan: ' + err.message,
    });
  }
}
