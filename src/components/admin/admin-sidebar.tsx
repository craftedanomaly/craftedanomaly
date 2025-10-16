'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Image as ImageIcon, 
  MessageSquare, 
  Settings,
  LogOut,
  Home,
  Grid3X3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: Grid3X3,
  },
  {
    title: 'Hero Carousel',
    href: '/admin/hero',
    icon: ImageIcon,
  },
  {
    title: 'Projects',
    href: '/admin/projects',
    icon: FolderOpen,
  },
  {
    title: 'Messages',
    href: '/admin/messages',
    icon: MessageSquare,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('admin_authenticated');
      toast.success('Logged out successfully');
      router.push('/admin');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col dark:bg-card light:bg-white light:border-slate-200 light:shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <span className="text-accent-foreground font-bold text-sm">CA</span>
        </div>
        <h2 className="font-bold text-foreground">Admin Panel</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 space-y-2 border-t border-border">
        <Link href="/" target="_blank">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Home className="h-4 w-4 mr-2" />
            View Site
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          size="sm"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
