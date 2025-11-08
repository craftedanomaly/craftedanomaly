'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface Project {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string;
  coverVideoUrl?: string;
  blurb?: string;
  year?: number;
  categorySlug?: string;
}

interface FilmStripCarouselProps {
  projects: Project[];
  activeCategory: string | null;
}

export function FilmStripCarousel({ projects, activeCategory }: FilmStripCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  
  const scrollProgress = useMotionValue(0);
  const smoothScroll = useSpring(scrollProgress, { stiffness: 100, damping: 30 });
  
  // Filter projects by active category
  const filteredProjects = activeCategory
    ? projects.filter((p) => p.categorySlug === activeCategory)
    : projects;

  // Mouse wheel scroll handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.5; // Adjust sensitivity
      const current = scrollProgress.get();
      const maxScroll = filteredProjects.length * 400;
      const newScroll = Math.max(0, Math.min(maxScroll, current + delta));
      scrollProgress.set(newScroll);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [scrollProgress, filteredProjects.length]);

  // Calculate scroll position
  const scrollX = useTransform(smoothScroll, (value) => -value);

  // Handle video playback on hover
  const handleMouseEnter = (projectId: string, index: number) => {
    setHoveredIndex(index);
    const video = videoRefs.current[projectId];
    if (video) {
      video.play().catch(() => {});
    }
  };

  const handleMouseLeave = (projectId: string) => {
    setHoveredIndex(null);
    const video = videoRefs.current[projectId];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

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
      <div className="text-center mb-12 z-10">
        <h2 className="text-5xl md:text-7xl font-bold text-accent drop-shadow-lg mb-4">
          Our Works
        </h2>
        <p className="text-sm text-foreground/60">
          Move your mouse to scroll through projects
        </p>
      </div>

      {/* Film Strip Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[70vh] cursor-none"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="absolute top-1/2 left-0 -translate-y-1/2 flex gap-6 px-[50vw]"
          style={{ x: scrollX }}
        >
          {filteredProjects.map((project, index) => {
            const isHovered = hoveredIndex === index;
            
            return (
              <motion.div
                key={project.id}
                className="relative flex-shrink-0"
                onMouseEnter={() => handleMouseEnter(project.id, index)}
                onMouseLeave={() => handleMouseLeave(project.id)}
                whileHover={{ scale: 1.08, z: 50 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Link href={`/projects/${project.slug}`}>
                  <div
                    className="relative overflow-hidden rounded-2xl border-2 shadow-2xl"
                    style={{
                      width: '380px',
                      height: '60vh',
                      borderColor: isHovered ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
                    }}
                  >
                    {/* Project Image */}
                    <Image
                      src={project.coverImageUrl}
                      alt={project.title}
                      fill
                      className="object-cover"
                      priority={index < 5}
                    />

                    {/* Video on Hover */}
                    {project.coverVideoUrl && (
                      <video
                        ref={(el) => {
                          if (el) videoRefs.current[project.id] = el;
                        }}
                        src={project.coverVideoUrl}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                          opacity: isHovered ? 1 : 0,
                          transition: 'opacity 0.3s ease',
                        }}
                        loop
                        muted
                        playsInline
                      />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    {/* Project Info - Always visible */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 p-6"
                      initial={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                        {project.title}
                      </h3>
                      {project.year && (
                        <span className="inline-block px-3 py-1 bg-accent/80 text-accent-foreground text-xs font-medium rounded-full">
                          {project.year}
                        </span>
                      )}
                    </motion.div>

                    {/* Hover Details */}
                    {isHovered && project.blurb && (
                      <motion.div
                        className="absolute top-0 left-0 right-0 p-6 bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-white/90 text-sm line-clamp-3">
                          {project.blurb}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="mt-8 flex items-center gap-2 text-foreground/60 text-sm">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span>Move mouse left/right to browse</span>
      </div>
    </div>
  );
}
