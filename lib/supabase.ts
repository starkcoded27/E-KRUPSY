import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

// Client-side Supabase client
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Server-side admin Supabase client with bypass RLS if service key is provided
export const getSupabaseServerClient = () => {
  if (!isSupabaseConfigured) return null;
  return createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
    auth: { persistSession: false },
  });
};

// Konstanta query relasi tabel pesanan untuk menghindari Shotgun Surgery dan Duplikasi Query
export const PESANAN_RELATION_QUERY = `
  *,
  produk:id_produk (*),
  pelanggan:id_pelanggan (*),
  pembayaran (*),
  produksi (*, verifikasi:verifikasi_produksi (*))
`;
