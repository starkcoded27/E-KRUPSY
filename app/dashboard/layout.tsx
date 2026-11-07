import React from 'react';
import DashboardHeader from '@/components/layout/dashboard-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col print:min-h-0 print:bg-white">
      <DashboardHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 print:max-w-none">
        {children}
      </main>
      <footer className="border-t border-gray-200 bg-white py-4 px-6 text-center text-xs text-gray-500 print:hidden">
        &copy; {new Date().getFullYear()} Pabrik Kerupuk Diansyah &bull; Sistem E-KRUPSY
      </footer>
    </div>
  );
}
