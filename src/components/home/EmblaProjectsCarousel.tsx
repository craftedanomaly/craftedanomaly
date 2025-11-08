'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Project {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string;
  blurb?: string;
  year?: number;
  categorySlug?: string;
}

interface EmblaProjectsCarouselProps {
  projects: Project[];
  activeCategory: string | null;
}

const TWEEN_FACTOR_BASE = 1.2;
const PARALLAX_FACTOR = 1.5;

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

export function EmblaProjectsCarousel({ projects, activeCategory }: EmblaProjectsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
  });

  const [tweenValues, setTweenValues] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter projects by active category
  const filteredProjects = activeCategory
    ? projects.filter((p) => p.categorySlug === activeCategory)
    : projects;

  // Reset carousel when category changes
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
      emblaApi.scrollTo(0);
    }
  }, [activeCategory, emblaApi]);

  const onScroll = useCallback(() => {
    if (!emblaApi) return;

    const engine = emblaApi.internalEngine();
    const scrollProgress = emblaApi.scrollProgress();
    const slidesInView = emblaApi.slidesInView();
    const isScrollEvent = emblaApi.scrollSnapList().length > 0;

    const styles = emblaApi.scrollSnapList().map((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress;
      const slidesInSnap = engine.slideRegistry[snapIndex];

      slidesInSnap.forEach((slideIndex) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target();

            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target);

              if (sign === -1) {
                diffToTarget = scrollSnap - (1 + scrollProgress);
              }
              if (sign === 1) {
                diffToTarget = scrollSnap + (1 - scrollProgress);
              }
            }
          });
        }
      });

      const tweenValue = 1 - Math.abs(diffToTarget * TWEEN_FACTOR_BASE);
      return numberWithinRange(tweenValue, 0, 1);
    });

    setTweenValues(styles);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onScroll();
    onSelect();
    emblaApi.on('scroll', onScroll);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onScroll);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('scroll', onScroll);
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onScroll);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onScroll, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollPrev, scrollNext]);

  if (!filteredProjects || filteredProjects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bp-grid">
        <p className="text-foreground/80">No projects available</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bp-grid flex flex-col items-center justify-center py-20 overflow-hidden">
      {/* Section Title */}
      <div className="text-center mb-8 z-10">
        <h2 className="text-5xl md:text-7xl font-bold text-accent drop-shadow-lg mb-4">
          Our Works
        </h2>
        <p className="text-lg text-foreground/80">
          {selectedIndex + 1} / {filteredProjects.length}
        </p>
      </div>

      {/* Embla Carousel - Horizontal with Parallax */}
      <div className="relative w-full" style={{ perspective: '1000px' }}>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {filteredProjects.map((project, index) => {
              const tweenValue = tweenValues[index] || 0;
              
              // Embla parallax effect
              const scale = 1 - Math.abs(tweenValue - 1) * 0.3; // 0.7 to 1.0
              const opacity = 1 - Math.abs(tweenValue - 1) * 0.5; // 0.5 to 1.0
              const translateX = (1 - tweenValue) * -50; // Parallax shift

              return (
                <div
                  key={project.id}
                  className="flex-[0_0_80%] min-w-0 pl-4"
                  style={{
                    transform: `scale(${scale}) translateX(${translateX}%)`,
                    opacity,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <Link
                    href={`/projects/${project.slug}`}
                    className={`block ${tweenValue > 0.8 ? 'cursor-pointer' : 'pointer-events-none'}`}
                  >
                    <div
                      className="relative overflow-hidden rounded-3xl border-2 shadow-2xl"
                      style={{
                        height: '75vh',
                        borderColor: tweenValue > 0.8 ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
                      }}
                    >
                      {/* Project Image */}
                      <Image
                        src={project.coverImageUrl}
                        alt={project.title}
                        fill
                        className="object-cover"
                        priority={index < 3}
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                      {/* Project Info - Only on active card */}
                      {tweenValue > 0.8 && (
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                          <h3 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                            {project.title}
                          </h3>
                          {project.blurb && (
                            <p className="text-white/90 text-lg md:text-xl mb-6 line-clamp-2 max-w-3xl">
                              {project.blurb}
                            </p>
                          )}
                          {project.year && (
                            <span className="inline-block px-5 py-2 bg-accent text-accent-foreground text-base font-medium rounded-full">
                              {project.year}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Thumbnail Navigation - Bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 max-w-[90vw] overflow-x-auto scrollbar-hide">
        {filteredProjects.map((project, index) => {
          const isActive = index === selectedIndex;
          return (
            <button
              key={project.id}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 group ${
                isActive
                  ? 'border-accent w-20 h-20'
                  : 'border-border/30 w-16 h-16 hover:border-accent/50'
              }`}
              aria-label={`Go to ${project.title}`}
            >
              <Image
                src={project.coverImageUrl}
                alt={project.title}
                fill
                className="object-cover"
                sizes="80px"
              />
              <div className={`absolute inset-0 bg-black/40 transition-opacity ${
                isActive ? 'opacity-0' : 'opacity-100 group-hover:opacity-60'
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
