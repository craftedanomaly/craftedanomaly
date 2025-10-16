"use client";
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Toaster } from 'sonner';
import { Poppins } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import '@/app/globals.css';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/auth-context';
import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/unauthorized';

  return (
    <div className={`${poppins.variable} font-sans antialiased`}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {isAuthPage ? (
          <>
            <main className="min-h-screen">{children}</main>
            <Toaster position="top-right" />
          </>
        ) : (
          <AuthProvider>
            <AdminAuthGuard>
              <div className="flex min-h-screen">
                <AdminSidebar />
                <main className="flex-1 ml-64">{children}</main>
              </div>
              <Toaster position="top-right" />
            </AdminAuthGuard>
          </AuthProvider>
        )}
      </ThemeProvider>
    </div>
  );
}
