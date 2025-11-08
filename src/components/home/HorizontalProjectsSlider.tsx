'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface Project {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string;
  blurb?: string;
  year?: number;
  categorySlug?: string;
}

interface HorizontalProjectsSliderProps {
  projects: Project[];
  activeCategory: string | null;
}

export function HorizontalProjectsSlider({ projects, activeCategory }: HorizontalProjectsSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Filter projects by active category
  const filteredProjects = activeCategory
    ? projects.filter((p) => p.categorySlug === activeCategory)
    : projects;

  // Calculate total width based on viewport
  const totalWidth = typeof window !== 'undefined' ? filteredProjects.length * window.innerWidth : 0;
  
  // Transform vertical scroll to horizontal movement
  const x = useTransform(scrollYProgress, [0, 1], [0, -totalWidth + (typeof window !== 'undefined' ? window.innerWidth : 0)]);

  if (!filteredProjects || filteredProjects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground/80">No projects available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${filteredProjects.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Section Title - Fixed */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 text-center">
          <motion.h2
            className="text-5xl md:text-7xl font-bold text-accent drop-shadow-lg"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Our Works
          </motion.h2>
        </div>

        {/* Horizontal Scrolling Container */}
        <motion.div
          className="absolute top-0 left-0 h-full flex"
          style={{ x }}
        >
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="relative h-screen flex-shrink-0"
              style={{ width: '100vw' }}
            >
              <Link href={`/projects/${project.slug}`} className="block h-full w-full group">
                {/* Project Image - Full Screen */}
                <div className="absolute inset-0">
                  <Image
                    src={project.coverImageUrl}
                    alt={project.title}
                    fill
                    className="object-cover"
                    priority={index < 3}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Masking Effect - Next Project Preview */}
                  {index < filteredProjects.length - 1 && (
                    <motion.div
                      className="absolute top-0 right-0 h-full w-32 md:w-48 overflow-hidden"
                      style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                      }}
                    >
                      <Image
                        src={filteredProjects[index + 1].coverImageUrl}
                        alt={filteredProjects[index + 1].title}
                        fill
                        className="object-cover opacity-50"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Project Info */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                      {project.title}
                    </h3>
                    {project.blurb && (
                      <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-4 line-clamp-3">
                        {project.blurb}
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      {project.year && (
                        <span className="text-accent font-bold text-lg">
                          {project.year}
                        </span>
                      )}
                      <span className="text-white/60 text-sm">
                        {index + 1} / {filteredProjects.length}
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Scroll Hint - Only on first project */}
                {index === 0 && (
                  <motion.div
                    className="absolute bottom-32 right-8 md:right-16 text-white/60 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                  >
                    <p className="mb-2">Scroll to explore</p>
                    <div className="w-px h-12 bg-white/40 mx-auto animate-pulse" />
                  </motion.div>
                )}
              </Link>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
