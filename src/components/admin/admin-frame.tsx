'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { AdminSidebarWrapper } from '@/components/admin/admin-sidebar-wrapper';
import { AuthProvider } from '@/contexts/auth-context';
import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';

function AdminContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/unauthorized';
  
  return (
    <>
      <AdminSidebarWrapper />
      <main className={`flex-1 min-h-screen ${isAuthPage ? '' : 'ml-64'}`}>{children}</main>
    </>
  );
}

export function AdminFrame({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminAuthGuard>
        <Suspense fallback={<div className="min-h-screen" />}>
          <div className="flex min-h-screen">
            <AdminContent>{children}</AdminContent>
          </div>
        </Suspense>
        <Toaster position="top-right" />
      </AdminAuthGuard>
    </AuthProvider>
  );
}
