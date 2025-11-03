'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Home, Film, Building, Palette, ImageIcon, Gamepad2, Book, Mail, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase/client';
import { getTransition, getVariants } from '@/lib/motion-constants';

interface Category {
  id: string;
  slug: string;
  name: string;
  cover_image?: string;
  description?: string;
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
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
    fetchCategories();
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchLogoSettings = async () => {
    try {
      // Try column-based approach first
      const { data: columnData } = await supabase
        .from('site_settings')
        .select('logo_light_url, logo_dark_url, logo_url, logo_alt')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (columnData && (columnData.logo_light_url || columnData.logo_dark_url || columnData.logo_url)) {
        setLogoSettings({
          logo_light_url: columnData.logo_light_url || columnData.logo_url || '/Anomaly.png',
          logo_dark_url: columnData.logo_dark_url || columnData.logo_url || '/Anomaly.png',
          logo_alt: columnData.logo_alt || 'Crafted Anomaly'
        });
        return;
      }

      // Fallback to key-value approach
      const { data: kvData } = await supabase
        .from('site_settings')
        .select('id, setting_key, setting_value')
        .in('setting_key', ['logo_light_url', 'logo_dark_url', 'logo_url', 'logo_alt'])
        .order('id', { ascending: false });

      const settings: Record<string, string> = {};
      kvData?.forEach((row: any) => {
        if (row.setting_key && settings[row.setting_key] == null) {
          settings[row.setting_key] = row.setting_value;
        }
      });

      setLogoSettings({
        logo_light_url: settings.logo_light_url || settings.logo_url || '/Anomaly.png',
        logo_dark_url: settings.logo_dark_url || settings.logo_url || '/Anomaly.png',
        logo_alt: settings.logo_alt || 'Crafted Anomaly'
      });
    } catch (error) {
      console.error('Error fetching logo settings:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('id, slug, name, cover_image, description')
        .eq('active', true)
        .order('display_order');

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
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
    <>
    <header className="absolute top-0 left-0 right-0 z-50 w-full bg-transparent">
      <div className="w-full" style={{ paddingLeft: '1%', paddingRight: '1%' }}>
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-[53px] w-auto">
              <Image 
                src={resolvedTheme === 'dark' ? logoSettings.logo_dark_url : logoSettings.logo_light_url} 
                alt={logoSettings.logo_alt} 
                width={265} 
                height={106} 
                className="h-full w-auto object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation - Hidden for now, will be added later */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Desktop menu items would go here */}
          </nav>

          {/* Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="h-11 w-11 rounded-full border border-border/20 hover:border-accent/30 hover:bg-accent/5 transition-all duration-300 bg-transparent"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>

    {/* Fullscreen Menu */}
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-background"
            {...getVariants('fade')}
            transition={getTransition('fast')}
          />

          {/* Menu Content */}
          <motion.div
            className="fixed inset-0 z-[101] overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={getTransition('primary')}
          >
            <div className="min-h-screen p-6 md:p-12">
              {/* Header */}
              <div className="flex items-center justify-between mb-12">
                <Link href="/" onClick={() => setIsOpen(false)} className="relative h-[53px] w-auto">
                  <Image 
                    src={resolvedTheme === 'dark' ? logoSettings.logo_dark_url : logoSettings.logo_light_url} 
                    alt={logoSettings.logo_alt} 
                    width={265} 
                    height={106} 
                    className="h-full w-auto object-contain"
                    priority
                  />
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-foreground hover:bg-accent/20 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Categories Grid */}
              <div className="max-w-7xl mx-auto">
                <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-8">Explore</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {categories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, ...getTransition('primary') }}
                    >
                      <Link
                        href={`/${category.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="group block relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card hover:border-accent/50 transition-all duration-500"
                      >
                        {category.cover_image && (
                          <div className="absolute inset-0">
                            <Image
                              src={category.cover_image}
                              alt={category.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex flex-col justify-end p-6">
                          <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Contact Link */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categories.length * 0.1, ...getTransition('primary') }}
                >
                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-2 text-lg font-medium text-muted-foreground hover:text-accent transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                    Get in Touch
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
