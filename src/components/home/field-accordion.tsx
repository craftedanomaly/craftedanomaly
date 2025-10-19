'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { getOptimizedImageProps, imageSizes } from '@/lib/image-utils';

interface Project {
  id: string;
  slug: string;
  title: string;
  cover_image: string;
  category_id: string;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  cover_image?: string | null;
  projects: Project[];
}

interface FieldAccordionProps {
  categories: Category[];
  locale: string;
}

export function FieldAccordion({ categories /* locale kept for signature, site is EN */, locale }: FieldAccordionProps) {
  const [sectionSettings, setSectionSettings] = useState<any>({});

  useEffect(() => {
    fetchSectionSettings();
  }, []);

  const fetchSectionSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .in('setting_key', [
          'homepage_fields_title_en', 'homepage_fields_title_tr',
          'homepage_fields_subtitle_en', 'homepage_fields_subtitle_tr'
        ]);

      const settings: any = {};
      data?.forEach((setting: any) => {
        settings[setting.setting_key] = setting.setting_value || '';
      });

      setSectionSettings(settings);
    } catch (error) {
      console.error('Error fetching section settings:', error);
    }
  };

  return (
    <section className="py-16 mt-16">
      {/* Title section - contained */}
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-heading">
            {sectionSettings.homepage_fields_title_en || 'our fields'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {sectionSettings.homepage_fields_subtitle_en || 'explore our diverse portfolio of creative disciplines, each crafted with precision and passion'}
          </p>
        </div>
      </div>

      {/* Categories section - responsive layout */}
      
      {/* Desktop: Horizontal slices */}
      <div className="hidden md:flex w-full h-[72vh] overflow-hidden">
        {categories.map((category, index) => {
          const preview = category.projects?.[0];
          const img = category.cover_image || preview?.cover_image;
          const href = `/${category.slug}`;
          return (
            <Link href={href} className="relative flex-1 min-w-0 group block" aria-label={category.name} key={category.id}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="h-full w-full"
              >
                <div className="absolute inset-0">
                  {img && !img.startsWith('blob:') ? (
                    <Image
                      {...getOptimizedImageProps(
                        img,
                        category.name,
                        index < 3 // Priority for first 3 categories
                      )}
                      fill
                      className="object-cover"
                      sizes={imageSizes.categorySlice}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">No Image</span>
                    </div>
                  )}
                  {/* Gradient overlay for hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Click feedback overlay */}
                  <div className="absolute inset-0 bg-muted/20 opacity-0 group-active:opacity-100 transition-opacity duration-150" />
                  
                  {/* Bottom gradient for text readability - always visible */}
                  <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/70 via-background/40 to-transparent" />
                </div>

                {/* Default state - always visible */}
                <div className="absolute inset-0 p-6 lg:p-8 flex items-end group-hover:opacity-0 transition-opacity duration-300">
                  <div className="max-w-sm">
                    <h3 className="text-xl lg:text-2xl font-heading text-foreground mb-2">{category.name}</h3>
                    <div className="inline-flex items-center px-2 py-1 rounded-md bg-accent/80 backdrop-blur-sm text-xs text-accent-foreground font-medium">
                      {(category.projects?.length || 0)} {(category.projects?.length === 1 ? 'project' : 'projects')}
                    </div>
                  </div>
                </div>

                {/* Hover state - centered content */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-center w-full h-full bg-accent/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 lg:p-8">
                    <div className="inline-flex items-center px-2 py-1 rounded-md bg-background/30 backdrop-blur-sm text-xs uppercase tracking-wide text-foreground mb-3">
                      {(category.projects?.length || 0)} {(category.projects?.length === 1 ? 'project' : 'projects')}
                    </div>
                    <h3 className="text-xl lg:text-2xl font-heading mb-3" style={{ color: '#7a4072' }}>{category.name}</h3>
                    {category.description && (
                      <p className="text-sm mb-6 line-clamp-3 leading-relaxed text-black font-medium">{category.description}</p>
                    )}
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90 pointer-events-none">
                      explore
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Mobile: Card grid */}
      <div className="md:hidden px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((category, index) => {
            const preview = category.projects?.[0];
            const img = category.cover_image || preview?.cover_image;
            const href = `/${category.slug}`;
            return (
              <Link href={href} className="group block" aria-label={category.name} key={category.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="relative overflow-hidden rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-[4/3]">
                    {img && !img.startsWith('blob:') ? (
                      <Image
                        src={img}
                        alt={category.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                    
                    {/* Card content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <h3 className="text-xl font-heading text-foreground mb-2">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground/90 mb-3 line-clamp-2">{category.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center px-2 py-1 rounded-md bg-background/20 backdrop-blur-sm text-xs text-muted-foreground">
                          {(category.projects?.length || 0)} {(category.projects?.length === 1 ? 'project' : 'projects')}
                        </div>
                        <Button variant="ghost" size="sm" className="text-accent hover:text-accent hover:bg-accent/10 pointer-events-none">
                          explore
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
