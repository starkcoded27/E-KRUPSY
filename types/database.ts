export type UserRole = 'owner' | 'staff_penggoreng' | 'staff_pembungkus' | 'pelanggan';

export interface User {
  id_user: number;
  username: string;
  nama: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface Pelanggan {
  id_pelanggan: number;
  id_user: number;
  nama_lengkap: string;
  alamat?: string;
  no_telp?: string;
  email?: string;
  jenis_kelamin?: string;
  created_at?: string;
}

export interface AuthSession {
  user: User;
  pelanggan?: Pelanggan | null;
  token?: string;
}

export interface RegisterInput {
  nama_lengkap: string;
  username: string;
  email: string;
  password: string;
  confirm_password?: string;
  no_telp: string;
  alamat: string;
  jenis_kelamin?: string;
}

export interface LoginInput {
  usernameOrEmail: string;
  password: string;
}

export interface Produk {
  id_produk: number;
  nama_produk: string;
  satuan: string;
  harga: number;
  stok: number;
  deskripsi?: string;
  gambar_url?: string;
  terjual?: number;
  created_at?: string;
}
