'use client';

import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export function AdminSidebarWrapper() {
  const pathname = usePathname();
  // Hide sidebar on unauthorized page only (login is now outside admin tree)
  if (pathname === '/admin/unauthorized') return null;
  return <AdminSidebar />;
}
