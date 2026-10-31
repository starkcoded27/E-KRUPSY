import bcrypt from 'bcryptjs';
import { User, Pelanggan } from '@/types/database';

// Default Master Credentials:
// 1. Owner: owner / owner123
// 2. Staff Penggoreng: penggoreng / goreng123
// 3. Staff Pembungkus: pembungkus / bungkus123

export const DEFAULT_USERS: (User & { password_hash: string; email?: string })[] = [
  {
    id_user: 1,
    username: 'owner',
    password_hash: '$2a$10$hhtwaX192Z78kXZb4DztZ.D.32h2eeo40YPePUhcSQArd.vO2Sj2W', // owner123
    nama: 'Bapak Diansyah (Owner)',
    role: 'owner',
    email: 'owner@diansyahkerupuk.com',
  },
  {
    id_user: 2,
    username: 'penggoreng',
    password_hash: '$2a$10$IhnmMr0OrIUtmh.c7fRq0O/AoEw6j.B2XBRt1.Pr9z3hOfA6ebZEK', // goreng123
    nama: 'Asep (Staf Penggoreng)',
    role: 'staff_penggoreng',
    email: 'penggoreng@diansyahkerupuk.com',
  },
  {
    id_user: 3,
    username: 'pembungkus',
    password_hash: '$2a$10$S0lpoMLUmwQuoTbBHr78CebUH/wyqi.vsBs9Wfb6ULVh/X5YqmVXe', // bungkus123
    nama: 'Siti (Staf Pembungkus)',
    role: 'staff_pembungkus',
    email: 'pembungkus@diansyahkerupuk.com',
  },
];

// In-memory runtime cache for development/fallback when Supabase .env is not yet filled
class LocalStore {
  private users = [...DEFAULT_USERS];
  private pelangganList: Pelanggan[] = [];
  private nextUserId = 10;
  private nextPelangganId = 10;

  findUserByUsernameOrEmail(identifier: string) {
    const cleanId = identifier.trim().toLowerCase();
    return this.users.find(
      (u) => u.username.toLowerCase() === cleanId || (u.email && u.email.toLowerCase() === cleanId)
    );
  }

  addUser(userData: {
    username: string;
    nama: string;
    password_hash: string;
    email: string;
    role: 'pelanggan';
    alamat: string;
    no_telp: string;
    jenis_kelamin?: string;
  }) {
    const newUser: User & { password_hash: string; email?: string } = {
      id_user: this.nextUserId++,
      username: userData.username,
      nama: userData.nama,
      role: userData.role,
      password_hash: userData.password_hash,
      email: userData.email,
      created_at: new Date().toISOString(),
    };
    this.users.push(newUser);

    const newPelanggan: Pelanggan = {
      id_pelanggan: this.nextPelangganId++,
      id_user: newUser.id_user,
      nama_lengkap: userData.nama,
      alamat: userData.alamat,
      no_telp: userData.no_telp,
      email: userData.email,
      jenis_kelamin: userData.jenis_kelamin || 'Laki-Laki',
      created_at: new Date().toISOString(),
    };
    this.pelangganList.push(newPelanggan);

    return { user: newUser, pelanggan: newPelanggan };
  }

  getPelangganByUserId(id_user: number) {
    return this.pelangganList.find((p) => p.id_user === id_user) || null;
  }
}

// Global singleton for Next.js dev server memory
const globalForStore = global as unknown as { localStore?: LocalStore };
export const localStore = globalForStore.localStore || new LocalStore();
if (process.env.NODE_ENV !== 'production') globalForStore.localStore = localStore;
