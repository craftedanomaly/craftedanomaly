'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Pagination } from 'swiper/modules';
import Image from 'next/image';
import { motion } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

interface HeroSlide {
  src: string;
  alt: string;
  caption?: string;
  type?: 'image' | 'video';
}

interface HeroSwiperProps {
  slides: HeroSlide[];
}

export function HeroSwiper({ slides }: HeroSwiperProps) {
  if (!slides || slides.length === 0) {
    return (
      <div className="fixed inset-0 z-0 bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No hero slides available</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0">
      <Swiper
        modules={[EffectFade, Autoplay, Pagination]}
        effect="fade"
        speed={1200}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet !bg-white/50',
          bulletActiveClass: 'swiper-pagination-bullet-active !bg-accent',
        }}
        loop={true}
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full w-full">
              {slide.type === 'video' ? (
                <video
                  src={slide.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

              {/* Caption */}
              {slide.caption && (
                <motion.div
                  className="absolute bottom-20 left-8 md:left-16 max-w-2xl"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <h2 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                    {slide.caption}
                  </h2>
                </motion.div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
