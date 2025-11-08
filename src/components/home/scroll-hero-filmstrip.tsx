'use client';

import { useState, useEffect, useRef } from 'react';
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

interface ScrollHeroFilmstripProps {
  slides: HeroSlide[];
  categories: Category[];
  projects: Project[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  videoAutoPlay?: boolean;
}

export function ScrollHeroFilmstrip({
  slides,
  categories,
  projects,
  autoPlay = true,
  autoPlayInterval = 5000,
  videoAutoPlay = true,
}: ScrollHeroFilmstripProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const heroVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const categoryVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Parallax transforms
  const worksY = useTransform(smoothScrollProgress, [0, 0.5, 1], ['10vh', '-10vh', '-40vh']);
  const worksOpacity = useTransform(smoothScrollProgress, [0, 0.2, 0.5, 0.9], [0, 0.8, 0.6, 0.2]);
  const projectsY = useTransform(smoothScrollProgress, [0, 0.4, 1], ['120vh', '20vh', '-10vh']);
  const projectsOpacity = useTransform(smoothScrollProgress, [0.2, 0.5, 0.7], [0, 0.7, 1]);

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

  // Category hover video playback
  useEffect(() => {
    if (!hoveredCategoryId) return;

    const video = categoryVideoRefs.current.get(hoveredCategoryId);
    if (video) {
      video.play().catch(() => {});
    }

    return () => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };
  }, [hoveredCategoryId]);

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
      {/* Hero Carousel Section - Fixed at top during initial scroll */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Hero Slides */}
        <div className="relative h-full w-full z-10">
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

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
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
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground leading-tight">
                    {slide.title}
                  </h1>
                )}
                {slide.subtitle && (
                  <p className="text-xl md:text-2xl text-muted-foreground">
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
            <span className="text-sm uppercase tracking-widest">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="h-6 w-6" />
            </motion.div>
          </motion.div>
        </div>

        {/* Parallax WORKS text - behind everything */}
        <motion.div
          style={{ y: worksY, opacity: worksOpacity }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-5 overflow-hidden"
        >
          <h2 className="text-[25vw] md:text-[20vw] font-black text-foreground/10 select-none whitespace-nowrap tracking-tighter">
            WORKS
          </h2>
        </motion.div>

        {/* Category Filmstrip Navigation - Flies up on scroll */}
        <motion.div
          className="absolute top-0 left-0 right-0 z-30"
          style={{
            y: useTransform(smoothScrollProgress, [0, 0.3], ['100vh', '0vh']),
          }}
        >
          <div className="flex h-24 border-b border-border/50 bg-background/95 backdrop-blur-md">
            {categories.map((category, idx) => {
              const isHovered = hoveredCategoryId === category.id;
              
              // Stagger animation for each category
              const categoryY = useTransform(
                smoothScrollProgress,
                [0.05 + idx * 0.03, 0.25 + idx * 0.03],
                ['120vh', '0vh']
              );

              return (
                <motion.div
                  key={category.id}
                  className="relative flex-1 overflow-visible border-r border-border/50 last:border-r-0"
                  style={{ y: categoryY }}
                  onMouseEnter={() => setHoveredCategoryId(category.id)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                >
                  <Link
                    href={`/${category.slug}`}
                    className="group relative flex h-full w-full items-center justify-center"
                  >
                    {/* Background image */}
                    {category.cover_image && (
                      <div className="absolute inset-0">
                        <Image
                          src={category.cover_image}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="20vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-background/30" />
                      </div>
                    )}

                    {/* Category name (always visible in filmstrip) */}
                    <span className="relative z-10 px-4 py-2 text-sm font-bold uppercase tracking-wider text-foreground transition-all group-hover:scale-110 group-hover:text-primary">
                      {category.name}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Hover video overlay - Fixed position, full screen height, 50vw width */}
        <AnimatePresence>
          {hoveredCategoryId && (
            <motion.div
              key={hoveredCategoryId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-1/2 -translate-x-1/2 h-screen w-[50vw] z-50 pointer-events-none"
            >
              {(() => {
                const category = categories.find((c) => c.id === hoveredCategoryId);
                if (!category?.video_url) return null;

                return (
                  <>
                    <video
                      ref={(el) => {
                        if (el) categoryVideoRefs.current.set(category.id, el);
                      }}
                      src={category.video_url}
                      className="h-full w-full object-cover"
                      loop
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />

                    {/* Category info on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-12">
                      <motion.h3
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl md:text-6xl font-black text-foreground mb-4"
                      >
                        {category.name}
                      </motion.h3>
                      {category.description && (
                        <motion.p
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-xl text-muted-foreground max-w-2xl"
                        >
                          {category.description}
                        </motion.p>
                      )}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Projects Grid - Parallax from bottom */}
        <motion.div
          style={{ y: projectsY, opacity: projectsOpacity }}
          className="absolute inset-0 z-15 overflow-visible pt-24"
        >
          <div className="min-h-screen w-full px-6 md:px-12 py-16 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-12 text-center"
            >
              <h2 className="text-4xl md:text-6xl font-black text-foreground mb-4">
                All Projects
              </h2>
              <p className="text-lg text-muted-foreground">
                Explore our complete portfolio
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
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
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
