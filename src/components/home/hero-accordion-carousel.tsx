'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { getOptimizedImageProps } from '@/lib/image-utils';
import { getTransition } from '@/lib/motion-constants';

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

interface HeroAccordionCarouselProps {
  slides: HeroSlide[];
  categories: Category[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  videoAutoPlay?: boolean;
}

const heroVariants = {
  enter: (direction: 1 | -1) => ({
    x: direction === 1 ? '100%' : '-100%',
    scale: 0.98,
    opacity: 0,
  }),
  center: {
    x: '0%',
    scale: 1,
    opacity: 1,
  },
  exit: (direction: 1 | -1) => ({
    x: direction === 1 ? '-100%' : '100%',
    scale: 0.98,
    opacity: 0,
  }),
};

const ACCORDION_COLLAPSED_WIDTH = 120;
const ACCORDION_EXPANDED_WIDTH = 360;

export function HeroAccordionCarousel({
  slides,
  categories,
  autoPlay = true,
  autoPlayInterval = 5000,
  videoAutoPlay = true,
}: HeroAccordionCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [hoveredAccordionId, setHoveredAccordionId] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const categoryVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const clampIndex = useCallback(
    (value: number) => {
      if (slides.length === 0) return 0;
      return Math.min(Math.max(value, 0), slides.length);
    },
    [slides.length]
  );

  const goToIndex = useCallback(
    (next: number, fromUser = false) => {
      setCurrentIndex((prev) => {
        const clamped = clampIndex(next);
        if (clamped === prev) {
          return prev;
        }

        setDirection(clamped > prev ? 1 : -1);
        if (fromUser) {
          setIsAutoPlaying(false);
        }

        return clamped;
      });
    },
    [clampIndex]
  );

  const isComplete = currentIndex >= slides.length;

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying || currentIndex >= slides.length) return;

    const timer = setTimeout(() => {
      goToIndex(currentIndex + 1);
    }, autoPlayInterval);

    return () => clearTimeout(timer);
  }, [currentIndex, goToIndex, isAutoPlaying, autoPlayInterval, slides.length]);

  // Wheel handler for desktop
  useEffect(() => {
    let accumulatedDelta = 0;
    const threshold = 50;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (showScrollHint) setShowScrollHint(false);

      accumulatedDelta += e.deltaY;

      if (Math.abs(accumulatedDelta) >= threshold) {
        if (accumulatedDelta > 0) {
          goToIndex(currentIndex + 1, true);
        } else {
          goToIndex(currentIndex - 1, true);
        }
        accumulatedDelta = 0;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentIndex, goToIndex, showScrollHint]);

  // Touch handlers for mobile (vertical swipe = horizontal progression)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setTouchStart(e.touches[0].clientY);
      if (showScrollHint) setShowScrollHint(false);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStart === null) return;

      const touchEnd = e.changedTouches[0].clientY;
      const delta = touchStart - touchEnd;

      if (Math.abs(delta) > 60) {
        if (delta > 0) {
          goToIndex(currentIndex + 1, true);
        } else {
          goToIndex(currentIndex - 1, true);
        }
      }

      setTouchStart(null);
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, currentIndex, goToIndex, showScrollHint]);

  // Video autoplay for current slide
  useEffect(() => {
    if (isComplete) return;
    
    const currentSlide = slides[currentIndex];
    if (!currentSlide || currentSlide.type !== 'video') return;

    const video = videoRefs.current.get(currentSlide.id);
    if (video && videoAutoPlay) {
      video.play().catch(() => {});
    }

    return () => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };
  }, [currentIndex, slides, videoAutoPlay, isComplete]);

  if (!slides || slides.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No slides available</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];
  const passedSlides = slides.slice(0, currentIndex);

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
          {/* Accordion panels (left side) */}
      <div className="absolute inset-y-0 left-0 z-30 flex">
        <AnimatePresence initial={false}>
          {passedSlides.map((slide, idx) => {
            const category = categories[idx];
            if (!category) return null;

            const isHovered = hoveredAccordionId === category.id;
            const targetWidth = isHovered ? ACCORDION_EXPANDED_WIDTH : ACCORDION_COLLAPSED_WIDTH;

            return (
              <motion.div
                key={slide.id}
                layout
                initial={{ width: 0, opacity: 0, x: -40 }}
                animate={{ width: targetWidth, opacity: 1, x: 0 }}
                exit={{ width: 0, opacity: 0, x: -40 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="h-full overflow-hidden border-r border-border/30"
              >
                <Link
                  href={`/${category.slug}`}
                  className="group relative flex h-full w-full"
                  onMouseEnter={() => setHoveredAccordionId(category.id)}
                  onMouseLeave={() => setHoveredAccordionId(null)}
                >
                  {/* Category cover image */}
                  {category.cover_image && (
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8 }}
                    >
                      <Image
                        src={category.cover_image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="400px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                    </motion.div>
                  )}

                  {/* Category hover video */}
                  {category.video_url && isHovered && (
                    <video
                      ref={(el) => {
                        if (el) categoryVideoRefs.current.set(category.id, el);
                      }}
                      src={category.video_url}
                      className="absolute inset-0 h-full w-full object-cover z-10"
                      loop
                      muted
                      playsInline
                      autoPlay
                    />
                  )}

                  {/* Content overlay */}
                  <div className="relative h-full w-full flex flex-col justify-end p-6 z-20">
                    <div className="space-y-2">
                      <motion.h3
                        layout
                        transition={{ duration: 0.4 }}
                        className={`font-black text-foreground transition-all duration-500 ${
                          isHovered ? 'text-2xl' : 'text-lg writing-mode-vertical-rl rotate-180'
                        }`}
                      >
                        {category.name}
                      </motion.h3>
                      {category.description && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                          transition={{ duration: 0.4 }}
                          className="text-sm text-muted-foreground line-clamp-3"
                        >
                          {category.description}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Current hero slide (center/right) */}
      {!isComplete && currentSlide && (
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide.id}
            custom={direction}
            variants={heroVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-20"
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0">
                {currentSlide.type === 'image' ? (
                  <Image
                    {...getOptimizedImageProps(
                      currentSlide.url,
                      currentSlide.title || 'Hero slide',
                      currentIndex === 0
                    )}
                    fill
                    className="object-cover"
                    priority={currentIndex === 0}
                  />
                ) : (
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current.set(currentSlide.id, el);
                    }}
                    src={currentSlide.url}
                    poster={currentSlide.thumbnail_url}
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                  />
                )}
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/10 to-transparent pointer-events-none" />

              {/* Text overlay */}
              {(currentSlide.title || currentSlide.subtitle) && (
                <div className="absolute inset-0 flex items-end justify-start p-8 md:p-16">
                  <motion.div
                    key={`${currentSlide.id}-copy`}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="max-w-3xl space-y-4"
                  >
                    {currentSlide.title && (
                      <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground leading-tight">
                        {currentSlide.title}
                      </h1>
                    )}
                    {currentSlide.subtitle && (
                      <p className="text-lg md:text-xl text-muted-foreground">
                        {currentSlide.subtitle}
                      </p>
                    )}
                  </motion.div>
                </div>
              )}

              {/* Scroll hint */}
              <AnimatePresence>
                {showScrollHint && currentIndex === 0 && (
                  <motion.div
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-foreground/60 z-10"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={getTransition('primary')}
                  >
                    <span className="text-sm uppercase tracking-widest">Scroll</span>
                    <motion.div
                      animate={{ y: [0, 8, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ChevronDown className="h-6 w-6" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Final accordion state - all categories visible */}
      {isComplete && (
        <motion.div
          className="absolute inset-0 z-40 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {categories.map((category, idx) => {
            const isHovered = hoveredAccordionId === category.id;
            const baseWidth = 100 / categories.length;
            const expandedWidth = baseWidth * 2;

            return (
              <Link
                key={category.id}
                href={`/${category.slug}`}
                className="group relative overflow-hidden transition-all duration-700 ease-out border-r border-border/30 last:border-r-0"
                style={{
                  width: isHovered ? `${expandedWidth}%` : `${baseWidth}%`,
                }}
                onMouseEnter={() => setHoveredAccordionId(category.id)}
                onMouseLeave={() => setHoveredAccordionId(null)}
              >
                {/* Category cover image */}
                {category.cover_image && (
                  <div className="absolute inset-0">
                    <Image
                      src={category.cover_image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="50vw"
                      priority={idx < 3}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                  </div>
                )}

                {/* Category hover video */}
                {category.video_url && isHovered && (
                  <video
                    ref={(el) => {
                      if (el) categoryVideoRefs.current.set(category.id, el);
                    }}
                    src={category.video_url}
                    className="absolute inset-0 w-full h-full object-cover z-10"
                    loop
                    muted
                    playsInline
                    autoPlay
                  />
                )}

                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-8 md:p-12 z-20">
                  <div className="space-y-2">
                    <h3 className="text-2xl md:text-4xl lg:text-5xl font-black text-foreground group-hover:text-accent transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p
                        className={`text-sm md:text-base text-muted-foreground max-w-md transition-opacity duration-500 ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
