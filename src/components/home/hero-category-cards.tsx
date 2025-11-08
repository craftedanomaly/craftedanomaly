'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { getOptimizedImageProps } from '@/lib/image-utils';

interface HeroSlide {
  id: string;
  display_order: number;
  active: boolean;
  type: 'image' | 'video';
  url: string;
  thumbnail_url?: string;
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_url?: string;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  cover_image?: string;
  video_url?: string;
}

interface Project {
  id: string;
  slug: string;
  title: string;
  blurb?: string;
  year?: number;
  cover_image?: string;
  category_id?: string;
}

const NAV_EASE = [0.22, 1, 0.36, 1] as const;

const categoryCardVariants = {
  hidden: (index: number) => {
    const direction = index % 3;
    const x = direction === 0 ? -140 : direction === 2 ? 140 : 0;
    const y = direction === 1 ? 140 : 100;
    const rotate = direction === 0 ? -6 : direction === 2 ? 6 : 0;

    return {
      opacity: 0,
      x,
      y,
      rotate,
      scale: 0.9,
    };
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 1,
      ease: NAV_EASE,
    },
  },
};

const blueprintOverlayStyle: CSSProperties = {
  backgroundImage: `
    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
  `,
  backgroundSize: '140px 140px, 140px 140px, 24px 24px, 24px 24px',
  backgroundPosition: '-1px -1px',
};

interface HeroCategoryCardsProps {
  slides: HeroSlide[];
  categories: Category[];
  projects: Project[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  videoAutoPlay?: boolean;
}

export function HeroCategoryCards({
  slides,
  categories,
  projects,
  autoPlay = true,
  autoPlayInterval = 5000,
  videoAutoPlay = true,
}: HeroCategoryCardsProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [categoriesActive, setCategoriesActive] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const heroVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const categoryVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  // Hero carousel moves up on scroll
  const heroY = useTransform(smoothScrollProgress, [0, 0.4], ['0vh', '-100vh']);
  const heroOpacity = useTransform(smoothScrollProgress, [0, 0.25, 0.4], [1, 0.6, 0]);

  // Parallax WORKS text
  const worksY = useTransform(smoothScrollProgress, [0, 0.5, 1], ['15vh', '-15vh', '-50vh']);
  const worksOpacity = useTransform(smoothScrollProgress, [0, 0.2, 0.4, 0.7], [0, 0.9, 0.6, 0.2]);
  
  // Categories appear and stay visible
  const categoriesY = useTransform(smoothScrollProgress, [0.35, 0.5], ['30vh', '0vh']);
  const categoriesOpacity = useTransform(smoothScrollProgress, [0.35, 0.5], [0, 1]);
  
  // All Projects section appears last
  const allProjectsY = useTransform(smoothScrollProgress, [0.6, 0.85], ['30vh', '0vh']);
  const allProjectsOpacity = useTransform(smoothScrollProgress, [0.6, 0.75], [0, 1]);

  useEffect(() => {
    const unsubscribe = smoothScrollProgress.on('change', (value) => {
      setCategoriesActive((prev) => prev || value >= 0.32);
    });

    return () => unsubscribe();
  }, [smoothScrollProgress]);

  // Hero carousel auto-play
  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isAutoPlaying, autoPlayInterval, slides.length]);

  // Video playback for current hero slide
  useEffect(() => {
    const slide = slides[currentSlide];
    if (!slide || slide.type !== 'video') return;

    const video = heroVideoRefs.current.get(slide.id);
    if (video && videoAutoPlay) {
      video.play().catch(() => {});
    }

    return () => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };
  }, [currentSlide, slides, videoAutoPlay]);

  const handleCategoryHover = useCallback((categoryId: string) => {
    const video = categoryVideoRefs.current.get(categoryId);
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }, []);

  const handleCategoryLeave = useCallback((categoryId: string) => {
    const video = categoryVideoRefs.current.get(categoryId);
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No content available</p>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div ref={containerRef} className="relative min-h-[300vh] bg-background">
      {/* Hero Carousel Section - Scrolls up */}
      <motion.div 
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="relative h-full w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {slide.type === 'image' ? (
                <Image
                  {...getOptimizedImageProps(slide.url, slide.title || 'Hero', currentSlide === 0)}
                  fill
                  className="object-cover"
                  priority={currentSlide === 0}
                />
              ) : (
                <video
                  ref={(el) => {
                    if (el) heroVideoRefs.current.set(slide.id, el);
                  }}
                  src={slide.url}
                  poster={slide.thumbnail_url}
                  className="h-full w-full object-cover"
                  loop
                  muted
                  playsInline
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Hero text content */}
          {(slide.title || slide.subtitle) && (
            <div className="absolute inset-0 flex items-end justify-start p-8 md:p-16 z-10">
              <motion.div
                key={`${slide.id}-text`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="max-w-4xl space-y-4"
              >
                {slide.title && (
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                    {slide.title}
                  </h1>
                )}
                {slide.subtitle && (
                  <p className="text-xl md:text-2xl text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                    {slide.subtitle}
                  </p>
                )}
              </motion.div>
            </div>
          )}

          {/* Carousel navigation */}
          <div className="absolute bottom-8 right-8 z-20 flex items-center gap-4">
            <button
              onClick={prevSlide}
              className="group flex h-12 w-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-background hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-0.5" />
            </button>
            
            <div className="flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentSlide(idx);
                    setIsAutoPlaying(false);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide
                      ? 'w-8 bg-foreground'
                      : 'w-2 bg-foreground/30 hover:bg-foreground/50'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="group flex h-12 w-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-background hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Scroll hint */}
          <motion.div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-foreground/60 z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <span className="text-sm uppercase tracking-widest">Scroll Down</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="h-6 w-6" />
            </motion.div>
          </motion.div>
        </div>

        {/* Parallax WORKS text */}
        <motion.div
          style={{ y: worksY, opacity: worksOpacity }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        >
          <h2 className="text-[25vw] md:text-[20vw] font-black text-foreground/20 select-none whitespace-nowrap tracking-tighter">
            WORKS
          </h2>
        </motion.div>
      </motion.div>

      {/* Categories Navbar - Sticky with animated cards */}
      <div className="sticky top-0 z-50 border-b border-border/30 px-4 py-6 bg-background/95 backdrop-blur-md">
        <AnimatePresence>
        <div
          className="relative mx-auto flex flex-wrap items-stretch justify-center gap-6 max-w-6xl"
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-60"
            style={blueprintOverlayStyle}
          />
          {categories.map((category, idx) => (
            <motion.div
              key={category.id}
              custom={idx}
              variants={categoryCardVariants}
              initial="hidden"
              animate={categoriesActive ? 'visible' : 'hidden'}
              className="h-32 w-64 sm:w-60 md:w-64"
            >
              <Link
                href={`/${category.slug}`}
                className="group relative flex h-full w-full items-end overflow-hidden rounded-2xl border border-border/40 bg-transparent shadow-lg transition-transform duration-700 hover:-translate-y-2 hover:shadow-2xl"
                onMouseEnter={() => handleCategoryHover(category.id)}
                onMouseLeave={() => handleCategoryLeave(category.id)}
                onTouchStart={() => handleCategoryHover(category.id)}
                onTouchEnd={() => handleCategoryLeave(category.id)}
              >
                {category.cover_image && (
                  <Image
                    src={category.cover_image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 80vw, (max-width: 1024px) 40vw, 25vw"
                    priority={idx < 3}
                  />
                )}

                {category.video_url && (
                  <video
                    ref={(el) => {
                      if (el) categoryVideoRefs.current.set(category.id, el);
                    }}
                    src={category.video_url}
                    className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    loop
                    muted
                    playsInline
                    preload="none"
                  />
                )}

                <div className="relative z-10 flex h-full w-full items-end bg-gradient-to-t from-black/60 via-black/0 to-transparent p-4">
                  <h3 className="text-2xl font-black text-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                    {category.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        </AnimatePresence>
      </div>

      {/* All Projects Grid */}
      <div className="relative min-h-screen py-20 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="text-5xl md:text-7xl font-black text-foreground mb-6">
            All Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Every project from all categories
          </p>
        </motion.div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  delay: (idx % 8) * 0.05,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-muted shadow-lg hover:shadow-2xl transition-shadow duration-500"
                >
                  {project.cover_image && (
                    <Image
                      src={project.cover_image}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 bg-black/40 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
                      {project.title}
                    </h3>
                    {project.blurb && (
                      <p className="text-sm text-muted-foreground line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {project.blurb}
                      </p>
                    )}
                    {project.year && (
                      <p className="text-xs text-muted-foreground mt-2 font-medium">
                        {project.year}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-white text-lg">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
}
