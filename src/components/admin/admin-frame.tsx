'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { AdminSidebarWrapper } from '@/components/admin/admin-sidebar-wrapper';
import { AuthProvider } from '@/contexts/auth-context';
import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';

export function AdminFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/unauthorized';

  if (isAuthPage) {
    return (
      <AuthProvider>
        <main className="min-h-screen">{children}</main>
        <Toaster position="top-right" />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <AdminAuthGuard>
        <div className="flex min-h-screen">
          <AdminSidebarWrapper />
          <main className="flex-1 ml-64">{children}</main>
        </div>
        <Toaster position="top-right" />
      </AdminAuthGuard>
    </AuthProvider>
  );
}
