'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, X, Home, Film, Building, Palette, ImageIcon, Gamepad2, Book, Mail, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { getTransition, getVariants } from '@/lib/motion-constants';
import { supabase } from '@/lib/supabase/client';
import { FilmGrainToggle } from '@/components/effects/FilmGrainToggle';

interface Category {
  id: string;
  slug: string;
  name: string;
  cover_image?: string;
  cover_video_url?: string;
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
  const categoryVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

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
          logo_alt: columnData.logo_alt || 'Crafted Anomaly',
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
        logo_alt: settings.logo_alt || 'Crafted Anomaly',
      });
    } catch (error) {
      console.error('Error fetching logo settings:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      // Try API Route first
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          return;
        }
      }
      // Fallback to client supabase
      const { data: direct, error } = await supabase
        .from('categories')
        .select('id, slug, name, cover_image, cover_video_url, description');
      if (error) {
        console.error('Categories fallback error:', error);
        setCategories([]);
        return;
      }
      setCategories(direct || []);
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


  const handleCategoryHover = (categoryId: string, isEntering: boolean) => {
    const videoEl = categoryVideoRefs.current.get(categoryId);
    if (!videoEl) return;

    if (isEntering) {
      videoEl.currentTime = 0;
      const playPromise = videoEl.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Ignore autoplay restrictions
        });
      }
    } else {
      videoEl.pause();
      videoEl.currentTime = 0;
    }
  };

  // Hide header in admin panel
  if (pathname?.startsWith('/admin')) {
    return null;
  }

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

          {/* Grain toggle + Menu Button */}
          <div className="flex items-center gap-1">
            <FilmGrainToggle inline />
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
      </div>
    </header>

    {/* Fullscreen Menu */}
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[10010] bg-background/95"
            {...getVariants('fade')}
            transition={getTransition('fast')}
          />

          {/* Menu Content */}
          <motion.div
            className="fixed inset-0 z-[10011] overflow-y-auto bg-background bp-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={getTransition('primary')}
          >
            <div className="min-h-screen p-6 md:p-12 bg-background">
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

              {/* Categories Grid (simple, visible) */}
              <div className="max-w-7xl mx-auto">
                <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-8">Explore</h2>
                {categories.length === 0 ? (
                  <div className="text-center text-muted-foreground">No categories found.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/${category.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="group block relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card hover:border-accent/50 transition-all duration-300"
                        onMouseEnter={() => handleCategoryHover(category.id, true)}
                        onMouseLeave={() => handleCategoryHover(category.id, false)}
                      >
                        {category.cover_image ? (
                          <Image src={category.cover_image} alt={category.name} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                            {category.name}
                          </div>
                        )}
                        {category.cover_video_url && (
                          <video
                            ref={(el) => {
                              if (el) categoryVideoRefs.current.set(category.id, el);
                              else categoryVideoRefs.current.delete(category.id);
                            }}
                            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            src={category.cover_video_url}
                            muted
                            playsInline
                            preload="metadata"
                            loop
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        <div className="absolute inset-0 flex items-end p-4">
                          <h3 className="text-xl font-semibold text-white group-hover:text-accent transition-colors">{category.name}</h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
