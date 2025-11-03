'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';
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

interface HeroCarouselWithScrollProps {
  slides: HeroSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  videoAutoPlay?: boolean;
}

export function HeroCarouselWithScroll({ 
  slides, 
  autoPlay = true, 
  autoPlayInterval = 5000,
  videoAutoPlay = true
}: HeroCarouselWithScrollProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll progress (0 to 1 over first 15-20vh)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Map scroll progress to exit effect (0vh to 20vh)
  const scrollProgress = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  const smoothProgress = useSpring(scrollProgress, { stiffness: 100, damping: 30, mass: 0.5 });

  // Animation values
  const reducedMotion = getPrefersReducedMotion();
  
  const scale = useTransform(
    smoothProgress,
    [0, 1],
    reducedMotion ? [1, 1] : [1, 1.1]
  );
  
  const opacity = useTransform(smoothProgress, [0, 0.8, 1], [1, 0.5, 0]);
  
  const blur = useTransform(
    smoothProgress,
    [0, 1],
    reducedMotion ? ['blur(0px)', 'blur(0px)'] : ['blur(0px)', 'blur(8px)']
  );

  // Hide scroll hint on first scroll
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      if (latest > 0.05 && showScrollHint) {
        setShowScrollHint(false);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, showScrollHint]);

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
      <div className="relative w-full h-[60vh] bg-card rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No slides available</p>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];
  const title = currentSlideData.title;

  return (
    <div ref={containerRef} className="relative w-full h-[100vh] overflow-hidden">
      {/* Hero Content - with scroll animations */}
      <motion.div
        className="sticky top-0 w-full h-screen"
        style={{ 
          scale,
          opacity,
          filter: blur,
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
                {currentSlideData.cta_text && currentSlideData.cta_url && (
                  <Button
                    asChild
                    size="lg"
                    className="mt-6"
                  >
                    <a href={currentSlideData.cta_url}>
                      {currentSlideData.cta_text}
                    </a>
                  </Button>
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
    </div>
  );
}
