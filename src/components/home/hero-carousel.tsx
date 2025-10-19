'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getOptimizedImageProps, imageSizes } from '@/lib/image-utils';
// Temporarily removed next-intl imports

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

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  videoAutoPlay?: boolean;
}

export function HeroCarousel({ 
  slides, 
  autoPlay = true, 
  autoPlayInterval = 5000,
  videoAutoPlay = true
}: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Temporarily using static locale
  const locale = 'en';

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

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleVideoPlayPause = async () => {
    if (videoRef.current) {
      try {
        if (isVideoPlaying) {
          videoRef.current.pause();
          setIsVideoPlaying(false);
        } else {
          await videoRef.current.play();
          setIsVideoPlaying(true);
        }
      } catch (error) {
        console.error('Video play/pause error:', error);
      }
    }
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
      
      // Small delay to ensure video is loaded
      const timer = setTimeout(playVideo, 100);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, slides, videoAutoPlay]);

  if (!slides || slides.length === 0) {
    return (
      <div className="relative w-full h-[60vh] bg-card rounded-lg flex items-center justify-center dark:bg-card light:bg-slate-100">
        <p className="text-muted-foreground">No slides available</p>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];
  const title = currentSlideData.title;
  const ctaLabel = currentSlideData.cta_text;

  return (
    <div className="relative w-full h-[60vh] lg:h-[80vh] overflow-hidden bg-card dark:bg-card light:bg-slate-100">
      {/* Main Slide Content */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
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
                sizes={imageSizes.hero}
              />
            ) : (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  poster={currentSlideData.thumbnail_url}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onLoadedData={() => {
                    if (videoAutoPlay && videoRef.current) {
                      videoRef.current.play().then(() => {
                        setIsVideoPlaying(true);
                      }).catch((error) => {
                        console.error('Auto-play failed:', error);
                        setIsVideoPlaying(false);
                      });
                    }
                  }}
                >
                  <source src={currentSlideData.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Video Play/Pause Button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-4 right-4 bg-background/80 hover:bg-background/90"
                  onClick={toggleVideoPlayPause}
                  aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
                >
                  {isVideoPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}


            {/* Slide Content */}
            {(title || ctaLabel) && (
              <div className="absolute bottom-8 left-8 right-8 text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {title && (
                    <h2 className="text-2xl lg:text-4xl font-bold mb-4 max-w-2xl font-heading">
                      {title}
                    </h2>
                  )}
                  {ctaLabel && currentSlideData.cta_url && (
                    <Button
                      asChild
                      variant="secondary"
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <a href={currentSlideData.cta_url}>
                        {ctaLabel}
                      </a>
                    </Button>
                  )}
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
            onClick={goToPrevious}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
            onClick={goToNext}
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-accent w-8'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play Control */}
      {slides.length > 1 && autoPlay && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4 bg-background/80 hover:bg-background/90"
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
