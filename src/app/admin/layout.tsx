export const dynamic = 'force-dynamic';

import { Toaster } from 'sonner';
import { Poppins } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import '@/app/globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';
import { AdminSidebarWrapper } from '@/components/admin/admin-sidebar-wrapper';

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
  return (
    <div className={`${poppins.variable} font-sans antialiased`}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <AdminAuthGuard>
            <div className="flex min-h-screen">
              <AdminSidebarWrapper />
              <main className="flex-1 ml-64">{children}</main>
            </div>
            <Toaster position="top-right" />
          </AdminAuthGuard>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}
