'use client';

import { usePathname } from 'next/navigation';
import { FloatingInfoModal } from '@/components/ui/floating-info-modal';

export function SiteFloatingInfo() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return <FloatingInfoModal />;
}
