'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { getTransition, getPrefersReducedMotion } from '@/lib/motion-constants';

interface Project {
  id: string;
  slug: string;
  title: string;
  cover_image: string;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  cover_image?: string;
  video_url?: string;
  projects: Project[];
}

interface CategoryHorizontalRailProps {
  categories: Category[];
}

export function CategoryHorizontalRail({ categories }: CategoryHorizontalRailProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && activeCategory > 0) {
        setActiveCategory(activeCategory - 1);
        document.getElementById(`category-${activeCategory - 1}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      } else if (e.key === 'ArrowRight' && activeCategory < categories.length - 1) {
        setActiveCategory(activeCategory + 1);
        document.getElementById(`category-${activeCategory + 1}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCategory, categories.length]);

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-12 md:py-20 bg-background">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4">
            Explore Our Work
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover our creative portfolio across different disciplines
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-16">
          {categories.map((category, categoryIndex) => (
            <div
              key={category.id}
              id={`category-${categoryIndex}`}
              className="space-y-6"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-muted-foreground max-w-xl">
                      {category.description}
                    </p>
                  )}
                </div>
                <Link
                  href={`/${category.slug}`}
                  className="group inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Projects Rail */}
              {category.projects && category.projects.length > 0 ? (
                <div
                  ref={constraintsRef}
                  className="relative overflow-x-auto scrollbar-hide -mx-4 px-4"
                  style={{
                    scrollSnapType: 'x mandatory',
                    scrollBehavior: 'smooth',
                  }}
                >
                  <div className="flex gap-4 md:gap-6 pb-4">
                    {category.projects.map((project, projectIndex) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{
                          delay: projectIndex * 0.1,
                          ...getTransition('primary'),
                        }}
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <Link
                          href={`/projects/${project.slug}`}
                          className="group block"
                        >
                          <div className="relative w-[280px] md:w-[320px] lg:w-[380px] aspect-[3/4] overflow-hidden rounded-2xl bg-card border border-border">
                            {project.cover_image && (
                              <>
                                <Image
                                  src={project.cover_image}
                                  alt={project.title}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                                  sizes="(max-width: 768px) 280px, (max-width: 1024px) 320px, 380px"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                              </>
                            )}
                            <div className="absolute inset-0 flex flex-col justify-end p-6">
                              <h4 className="text-lg md:text-xl font-bold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                                {project.title}
                              </h4>
                              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                <span>View Project</span>
                                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <p>No projects available in this category yet.</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Hint */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Use <kbd className="px-2 py-1 text-xs font-semibold bg-accent/10 border border-accent/20 rounded">←</kbd>
            {' '}and{' '}
            <kbd className="px-2 py-1 text-xs font-semibold bg-accent/10 border border-accent/20 rounded">→</kbd>
            {' '}keys to navigate categories
          </p>
        </div>
      </div>
    </div>
  );
}
