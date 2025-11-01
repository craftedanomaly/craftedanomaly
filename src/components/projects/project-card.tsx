'use client';

import { motion } from 'framer-motion';
import { Calendar, User, Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { getOptimizedImageProps, imageSizes } from '@/lib/image-utils';
import { useState } from 'react';

interface Project {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  cover_image: string;
  cover_video_url?: string;
  year: number;
  role_en: string;
  role_tr: string;
  client: string;
  project_type?: string;
  published_at: string;
  view_count: number;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  variant?: 'default' | 'masonry';
}

export function ProjectCard({ project, index, variant = 'default' }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const title = project.title;
  const blurb = project.blurb;
  const role = project.role_en;

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Masonry variant - minimal design with only image and title overlay
  if (variant === 'masonry') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.05, 0.5) }}
        className="group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link href={`/projects/${project.slug}`}>
          <div className="relative overflow-hidden aspect-auto">
            {/* Cover Image */}
            <div className="relative w-full overflow-hidden">
              {/* Cover Image */}
              {project.cover_image && !project.cover_image.startsWith('blob:') ? (
                <Image
                  {...getOptimizedImageProps(
                    project.cover_image,
                    title,
                    false
                  )}
                  width={800}
                  height={600}
                  className={`w-full h-auto object-cover transition-transform duration-500 ${
                    isHovered ? 'scale-110' : 'scale-100'
                  }`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
              
              {/* Hover Overlay with sliding content */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <motion.h3 
                    className="text-lg md:text-xl font-bold text-white mb-2 font-heading"
                    initial={{ y: 0 }}
                    animate={{ y: isHovered ? 0 : 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {title}
                  </motion.h3>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ 
                      y: isHovered ? 0 : 20, 
                      opacity: isHovered ? 1 : 0 
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="space-y-2"
                  >
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="bg-white/90 text-black hover:bg-white"
                    >
                      View Project
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Always visible title (slides down on hover) */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent"
                animate={{ 
                  y: isHovered ? 60 : 0,
                  opacity: isHovered ? 0 : 1
                }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-base md:text-lg font-semibold text-white font-heading">
                  {title}
                </h3>
              </motion.div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default variant - full card with details
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/projects/${project.slug}`}>
        <div 
          className="relative bg-card border border-border overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:border-accent/30"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Full-card hover media overlay (cover image spans entire card area) */}
          {project.cover_image && (
            <div className={`pointer-events-none absolute inset-0 z-40 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <img src={project.cover_image} alt={title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Full-card gradient + CTA overlay */}
          <div className={`pointer-events-none absolute inset-0 z-50 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-lg font-bold text-white mb-3 font-heading">{title}</h3>
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                View Project
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
          {/* Cover Image section */}
          <div className="relative aspect-[4/3] overflow-hidden z-0">
            {project.cover_image && !project.cover_image.startsWith('blob:') ? (
              <Image
                {...getOptimizedImageProps(
                  project.cover_image,
                  title,
                  false
                )}
                fill
                className={`object-cover transition-transform duration-700 ${
                  isHovered ? 'scale-110' : 'scale-100'
                }`}
                sizes={imageSizes.card}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No Image</span>
              </div>
            )}

            

            {/* View Count */}
            <div className="absolute top-3 right-3 z-[60] bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{project.view_count}</span>
            </div>
          </div>

          {/* Content fades quickly on hover but keeps height so overlay covers full card */}
          <div className={`p-6 transition-all duration-150 ${isHovered ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors font-heading">
                {title}
              </h3>
              {project.project_type && (
                <Badge 
                  variant="secondary"
                  className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-semibold uppercase tracking-wider mb-2"
                >
                  {project.project_type}
                </Badge>
              )}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {blurb}
              </p>
            </div>

            <div className="space-y-2 mb-4">
              {role && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{role}</span>
                </div>
              )}
              {project.client && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">Client:</span>
                  <span>{project.client}</span>
                </div>
              )}
              {project.year && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{project.year}</span>
                </div>
              )}
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full group-hover:bg-accent/10 group-hover:text-accent transition-colors"
            >
              View Project
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
