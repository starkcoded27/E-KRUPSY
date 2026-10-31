'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Pelanggan, UserRole, RegisterInput } from '@/types/database';

interface AuthContextType {
  user: User | null;
  pelanggan: Pelanggan | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; message?: string; redirectUrl?: string }>;
  register: (data: RegisterInput) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pelanggan, setPelanggan] = useState<Pelanggan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
            setPelanggan(data.pelanggan || null);
          }
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || 'Login gagal.' };
      }

      setUser(data.user);
      setPelanggan(data.pelanggan || null);

      return {
        success: true,
        redirectUrl: data.redirectUrl,
        message: data.message,
      };
    } catch (err: any) {
      return { success: false, message: 'Gagal terhubung ke server.' };
    }
  };

  const register = async (inputData: RegisterInput) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || 'Pendaftaran gagal.' };
      }

      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: 'Gagal mengirim data pendaftaran.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setPelanggan(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, pelanggan, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
