import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';

export const metadata: Metadata = {
  title: 'E-KRUPSY - Pabrik Kerupuk Diansyah',
  description: 'Sistem Informasi Pemesanan dan Produksi Pabrik Kerupuk Diansyah Berbasis Web',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50 text-gray-900 selection:bg-brand-maroon selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
