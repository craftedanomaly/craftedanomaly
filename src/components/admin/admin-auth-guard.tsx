'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Shield } from 'lucide-react';

interface AdminUser {
  role: string;
  is_active: boolean;
}

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (loading) return;

      // Redirect to login if no user
      if (!user) {
        router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
        return;
      }

      try {
        // Check admin user using API endpoint
        const response = await fetch('/api/admin/check-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: user.email }),
        });

        if (!response.ok) {
          router.push('/admin/unauthorized');
          return;
        }

        const { adminUser: profile } = await response.json();

        if (!profile || !profile.is_active) {
          router.push('/admin/unauthorized');
          return;
        }

        // Check role permissions for sensitive routes
        if ((pathname.includes('/settings') || pathname.includes('/users')) && profile.role !== 'admin') {
          router.push('/admin/unauthorized');
          return;
        }

        setAdminUser(profile);
      } catch (error) {
        console.error('Admin access check error:', error);
        router.push('/login');
      } finally {
        setChecking(false);
      }
    };

    checkAdminAccess();
  }, [user, loading, pathname, router]);

  // Show loading for auth check
  if (loading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <Shield className="h-6 w-6 text-accent animate-pulse" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Checking access...</span>
          </div>
        </div>
      </div>
    );
  }

  // Skip auth for unauthorized page
  if (pathname === '/admin/unauthorized') {
    return <>{children}</>;
  }

  // Show content if user is authenticated and authorized
  if (user && adminUser) {
    return <>{children}</>;
  }

  // Fallback - should not reach here due to redirects above
  return null;
}
