'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
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

interface ExpoProjectsSliderProps {
  projects: Project[];
  activeCategory: string | null;
}

const CARD_WIDTH = 400;
const CARD_HEIGHT = 550;
const CARD_SPACING = 50;

export function ExpoProjectsSlider({ projects, activeCategory }: ExpoProjectsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dragX = useMotionValue(0);

  // Filter projects by active category
  const filteredProjects = activeCategory
    ? projects.filter((p) => p.categorySlug === activeCategory)
    : projects;

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredProjects.length]);

  if (!filteredProjects || filteredProjects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bp-grid">
        <p className="text-foreground/80">No projects available</p>
      </div>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredProjects.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length);
  };

  const onDragEnd = () => {
    const x = dragX.get();
    if (x < -50) {
      handleNext();
    } else if (x > 50) {
      handlePrev();
    }
    animate(dragX, 0, { type: 'spring', stiffness: 300, damping: 30 });
  };

  return (
    <div className="relative min-h-screen bp-grid flex flex-col items-center justify-center py-20 overflow-hidden">
      {/* Section Title */}
      <motion.div
        className="text-center mb-16 z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-5xl md:text-7xl font-bold text-accent drop-shadow-lg mb-4">
          Our Works
        </h2>
        <p className="text-lg text-foreground/80">
          {currentIndex + 1} / {filteredProjects.length}
        </p>
      </motion.div>

      {/* Advanced Parallax Carousel */}
      <div className="relative w-full h-[650px] flex items-center justify-center" style={{ perspective: '1000px' }}>
        <motion.div
          className="flex items-center justify-center"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          style={{ x: dragX }}
          onDragEnd={onDragEnd}
        >
          {filteredProjects.map((project, index) => {
            const offset = index - currentIndex;
            const absOffset = Math.abs(offset);
            
            // Calculate transforms for advanced parallax
            const isVisible = absOffset <= 2;
            const scale = 1 - absOffset * 0.15;
            const opacity = absOffset === 0 ? 1 : Math.max(0, 1 - absOffset * 0.3);
            const rotateY = offset * -15; // 3D rotation
            const translateX = offset * (CARD_WIDTH + CARD_SPACING);
            const translateZ = -absOffset * 100; // depth
            const zIndex = 50 - absOffset;

            if (!isVisible) return null;

            return (
              <motion.div
                key={project.id}
                className="absolute"
                animate={{
                  scale,
                  opacity,
                  x: translateX,
                  rotateY,
                  z: translateZ,
                  zIndex,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                }}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className={`block ${offset === 0 ? 'cursor-pointer' : 'pointer-events-none'}`}
                >
                  <div
                    className="relative overflow-hidden rounded-2xl border-2 shadow-2xl"
                    style={{
                      width: `${CARD_WIDTH}px`,
                      height: `${CARD_HEIGHT}px`,
                      borderColor: offset === 0 ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {/* Project Image */}
                    <Image
                      src={project.coverImageUrl}
                      alt={project.title}
                      fill
                      className="object-cover"
                      priority={absOffset < 2}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {/* Project Info - Only on center card */}
                    {offset === 0 && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                          {project.title}
                        </h3>
                        {project.blurb && (
                          <p className="text-white/90 text-sm mb-3 line-clamp-2">
                            {project.blurb}
                          </p>
                        )}
                        {project.year && (
                          <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                            {project.year}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-6 mt-12 z-10">
        <button
          onClick={handlePrev}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-accent hover:border-accent transition-all duration-300 group"
          aria-label="Previous project"
        >
          <ChevronLeft className="h-6 w-6 text-foreground group-hover:text-accent-foreground transition-colors" />
        </button>

        <button
          onClick={handleNext}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-accent hover:border-accent transition-all duration-300 group"
          aria-label="Next project"
        >
          <ChevronRight className="h-6 w-6 text-foreground group-hover:text-accent-foreground transition-colors" />
        </button>
      </div>

      {/* Drag/Keyboard Hint */}
      <motion.p
        className="text-sm text-foreground/60 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Drag, use arrow keys, or click buttons to navigate
      </motion.p>
    </div>
  );
}
