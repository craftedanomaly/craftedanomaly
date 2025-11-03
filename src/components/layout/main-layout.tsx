import { Header } from './header';
import { FloatingInfoModal } from '@/components/ui/floating-info-modal';
import { ScrollProgress } from '@/components/ui/scroll-progress';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollProgress />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <FloatingInfoModal />
    </div>
  );
}
