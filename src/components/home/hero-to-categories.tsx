'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { getOptimizedImageProps } from '@/lib/image-utils';
import { getTransition, getPrefersReducedMotion } from '@/lib/motion-constants';

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

interface HeroToCategoriesProps {
  slides: HeroSlide[];
  categories: Category[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  videoAutoPlay?: boolean;
}

export function HeroToCategories({ 
  slides, 
  categories,
  autoPlay = true, 
  autoPlayInterval = 5000,
  videoAutoPlay = true
}: HeroToCategoriesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const categoryVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  
  // Transition progress (0 = hero, 1 = categories)
  const transitionProgress = useMotionValue(0);
  const smoothProgress = useSpring(transitionProgress, { stiffness: 100, damping: 30, mass: 0.5 });

  // Animation values
  const reducedMotion = getPrefersReducedMotion();
  
  const heroScale = useTransform(
    smoothProgress,
    [0, 1],
    reducedMotion ? [1, 1] : [1, 1.1]
  );
  
  const heroOpacity = useTransform(smoothProgress, [0, 0.8, 1], [1, 0.5, 0]);
  
  const heroBlur = useTransform(
    smoothProgress,
    [0, 1],
    reducedMotion ? ['blur(0px)', 'blur(0px)'] : ['blur(0px)', 'blur(8px)']
  );

  const categoriesOpacity = useTransform(smoothProgress, [0, 0.1, 1], [0, 0.6, 1]);
  const categoriesY = useTransform(smoothProgress, [0, 0.3, 1], [40, 10, 0]);
  const categoriesPointer = useTransform(smoothProgress, [0, 0.01], ['auto', 'auto']);
  const heroPointer = useTransform(smoothProgress, [0, 0.12], ['auto', 'none']);

  // Wheel event handler
  useEffect(() => {
    let scrollAccumulator = 0;
    const scrollThreshold = 100; // Total scroll needed to complete transition

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Hide scroll hint on first interaction
      if (showScrollHint) {
        setShowScrollHint(false);
      }

      // Accumulate scroll
      scrollAccumulator += e.deltaY;
      
      // Clamp between 0 and scrollThreshold
      scrollAccumulator = Math.max(0, Math.min(scrollThreshold, scrollAccumulator));
      
      // Update progress (0 to 1)
      const progress = scrollAccumulator / scrollThreshold;
      transitionProgress.set(progress);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [transitionProgress, showScrollHint]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, slides.length, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsVideoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsVideoPlaying(false);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsVideoPlaying(false);
  };

  // Reset video state when slide changes
  useEffect(() => {
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [currentSlide]);

  // Auto-play video when it's a video slide
  useEffect(() => {
    const currentSlideData = slides[currentSlide];
    if (currentSlideData?.type === 'video' && videoRef.current && videoAutoPlay) {
      const playVideo = async () => {
        try {
          await videoRef.current?.play();
          setIsVideoPlaying(true);
        } catch (error) {
          console.error('Auto-play failed:', error);
          setIsVideoPlaying(false);
        }
      };
      
      const timer = setTimeout(playVideo, 100);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, slides, videoAutoPlay]);

  if (!slides || slides.length === 0) {
    return (
      <div className="fixed inset-0 bg-card flex items-center justify-center">
        <p className="text-muted-foreground">No slides available</p>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];
  const title = currentSlideData.title;

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Hero Layer */}
      <motion.div
        className="absolute inset-0 z-10"
        style={{ 
          scale: heroScale,
          opacity: heroOpacity,
          filter: heroBlur,
          pointerEvents: heroPointer,
        }}
      >
        <div className="relative w-full h-full bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={getTransition('fast')}
              className="absolute inset-0"
            >
              {currentSlideData.type === 'image' ? (
                <Image
                  {...getOptimizedImageProps(
                    currentSlideData.url,
                    title || 'Hero slide',
                    currentSlide === 0
                  )}
                  fill
                  className="object-cover"
                  priority={currentSlide === 0}
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    src={currentSlideData.url}
                    poster={currentSlideData.thumbnail_url}
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/20 to-transparent pointer-events-none" />

          {/* Text overlay */}
          {(title || currentSlideData.subtitle) && (
            <div className="absolute inset-0 flex items-end justify-start p-8 md:p-16">
              <div className="max-w-3xl space-y-4">
                {title && (
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground leading-tight">
                    {title}
                  </h1>
                )}
                {currentSlideData.subtitle && (
                  <p className="text-lg md:text-xl text-muted-foreground">
                    {currentSlideData.subtitle}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation controls */}
          {slides.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-background/20 backdrop-blur-sm border border-foreground/10 text-foreground hover:bg-background/40 transition-all z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-background/20 backdrop-blur-sm border border-foreground/10 text-foreground hover:bg-background/40 transition-all z-10"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Slide indicators */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? 'w-8 bg-foreground'
                        : 'w-2 bg-foreground/40 hover:bg-foreground/60'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Scroll hint */}
          <AnimatePresence>
            {showScrollHint && (
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
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ChevronDown className="h-6 w-6" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Categories Layer - Horizontal Accordion */}
      <motion.div
        className="absolute inset-0 z-20 overflow-hidden"
        style={{
          opacity: categoriesOpacity,
          y: categoriesY,
          pointerEvents: categoriesPointer,
        }}
      >
        <div className="h-full flex">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/${category.slug}`}
              className="group relative flex-1 overflow-hidden transition-all duration-500 hover:flex-[3]"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Background Image */}
              {category.cover_image && (
                <div className="absolute inset-0">
                  <Image
                    src={category.cover_image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="33vw"
                    priority={index < 3}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
                </div>
              )}

              {/* Background Video - Plays on hover */}
              {category.video_url && hoveredCategory === category.id && (
                <video
                  ref={el => {
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
                  <h3 className="text-xl md:text-3xl lg:text-4xl font-black text-foreground group-hover:text-accent transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-xs md:text-sm text-muted-foreground max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Right border divider */}
              {index < categories.length - 1 && (
                <div className="absolute top-0 bottom-0 right-0 w-px bg-border/30" />
              )}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
