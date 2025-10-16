'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Home, Film, Building, Palette, ImageIcon, Gamepad2, Book, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase/client';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [logoSettings, setLogoSettings] = useState({
    logo_light_url: '/Anomaly.png',
    logo_dark_url: '/Anomaly.png',
    logo_alt: 'Crafted Anomaly'
  });
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const locale = 'en'; // Static English (no longer used for routing)
  const router = useRouter();
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    fetchLogoSettings();
    fetchMenuItems();
  }, []);

  const fetchLogoSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('logo_light_url, logo_dark_url, logo_alt')
        .limit(1)
        .single();

      setLogoSettings({
        logo_light_url: data?.logo_light_url || '/Anomaly.png',
        logo_dark_url: data?.logo_dark_url || '/Anomaly.png',
        logo_alt: data?.logo_alt || 'Crafted Anomaly'
      });
    } catch (error) {
      console.error('Error fetching logo settings:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('display_order');

      const dynamicMenuItems = [
        { label: 'Home', href: '/', icon: Home },
        ...(data || []).map((category: any) => ({
          label: category.name_en,
          href: `/${category.slug}`,
          icon: getIconForCategory(category.slug),
        })),
        { label: 'Contact', href: '/contact', icon: Mail },
      ];

      setMenuItems(dynamicMenuItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      // Fallback to static menu
      setMenuItems([
        { label: 'Home', href: '/', icon: Home },
        { label: 'Films', href: '/films', icon: Film },
        { label: 'Spatial Design', href: '/mekan-tasarimi', icon: Building },
        { label: 'Visual Design', href: '/gorsel-tasarim', icon: Palette },
        { label: 'Poster & Title Design', href: '/afis-jenerik', icon: ImageIcon },
        { label: 'App Design', href: '/uygulama-tasarimi', icon: Palette },
        { label: 'Games', href: '/games', icon: Gamepad2 },
        { label: 'Books', href: '/books', icon: Book },
        { label: 'Contact', href: '/contact', icon: Mail },
      ]);
    }
  };

  const getIconForCategory = (slug: string) => {
    const iconMap: any = {
      'films': Film,
      'mekan-tasarimi': Building,
      'spatial-design': Building,
      'gorsel-tasarim': Palette,
      'visual-design': Palette,
      'afis-jenerik': ImageIcon,
      'poster-title-design': ImageIcon,
      'uygulama-tasarimi': Palette,
      'app-design': Palette,
      'games': Gamepad2,
      'books': Book,
    };
    return iconMap[slug] || Palette;
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-background/95 light:bg-white/95 light:backdrop-blur-sm light:border-slate-200">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-10 w-auto">
              <Image 
                src={resolvedTheme === 'dark' ? logoSettings.logo_dark_url : logoSettings.logo_light_url} 
                alt={logoSettings.logo_alt} 
                width={200} 
                height={80} 
                className="h-full w-auto object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation - Hidden for now, will be added later */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Desktop menu items would go here */}
          </nav>

          {/* Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <ThemeToggle />
            

            {/* Mobile Menu Trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full border border-border/20 hover:border-accent/30 hover:bg-accent/5 transition-all duration-300 backdrop-blur-sm bg-background/80"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[420px] p-0 border-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Main navigation menu with links to different sections
                </SheetDescription>
                
                {/* Background with gradient */}
                <div className="relative h-full bg-gradient-to-br from-background via-background/95 to-card/50 backdrop-blur-xl dark:from-background light:bg-white light:shadow-xl">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-20 left-0 w-24 h-24 bg-accent/3 rounded-full blur-2xl"></div>
                  
                  <div className="relative flex flex-col h-full p-6">
                    {/* Header */}
                    <div className="pt-6 pb-12">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">
                          Navigation
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Explore our creative universe
                        </p>
                      </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1">
                      <ul className="space-y-1">
                        {menuItems.map((item, index) => {
                          const IconComponent = item.icon;
                          return (
                            <li key={index}>
                              <Link
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="group flex items-center gap-4 py-4 px-5 rounded-2xl text-base font-medium text-foreground/80 hover:text-foreground hover:bg-accent/8 border border-transparent hover:border-accent/20 transition-all duration-300 hover:shadow-sm dark:text-foreground/80 light:text-slate-700 light:hover:text-violet-700 light:hover:bg-violet-50 light:hover:border-violet-200"
                              >
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/5 group-hover:bg-accent/15 transition-all duration-300 dark:bg-accent/5 light:bg-violet-100 light:group-hover:bg-violet-200">
                                  <IconComponent className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors duration-300 dark:text-muted-foreground light:text-violet-600 light:group-hover:text-violet-700" />
                                </div>
                                <span className="flex-1 group-hover:translate-x-1 transition-transform duration-300">
                                  {item.label}
                                </span>
                                <div className="w-2 h-2 rounded-full bg-accent/0 group-hover:bg-accent/60 transition-all duration-300"></div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </nav>

                    {/* Footer */}
                    <div className="pt-8 space-y-6">
                      {/* Controls */}
                      <div className="flex items-center justify-center">
                        {/* Theme */}
                        <div className="bg-background/60 backdrop-blur-sm rounded-full p-1 border border-border/20">
                          <ThemeToggle />
                        </div>
                      </div>
                      
                      {/* Brand */}
                      <div className="text-center pt-4 border-t border-border/20">
                        <p className="text-xs font-medium text-muted-foreground/60 tracking-widest uppercase">
                          Crafted Anomaly
                        </p>
                        <p className="text-xs text-muted-foreground/40 mt-1">
                          Design Studio
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
