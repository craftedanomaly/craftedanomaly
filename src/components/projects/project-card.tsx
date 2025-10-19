'use client';

import { motion } from 'framer-motion';
import { Calendar, User, Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { getOptimizedImageProps, imageSizes } from '@/lib/image-utils';

interface Project {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  cover_image: string;
  year: number;
  role_en: string;
  role_tr: string;
  client: string;
  published_at: string;
  view_count: number;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  variant?: 'default' | 'masonry';
}

export function ProjectCard({ project, index, variant = 'default' }: ProjectCardProps) {
  const title = project.title;
  const blurb = project.blurb;
  const role = project.role_en;

  // Masonry variant - minimal design with only image and title overlay
  if (variant === 'masonry') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.05, 0.5) }}
        className="group"
      >
        <Link href={`/projects/${project.slug}`}>
          <div className="relative overflow-hidden rounded-lg aspect-auto">
            {/* Cover Image */}
            <div className="relative w-full overflow-hidden">
              {project.cover_image && !project.cover_image.startsWith('blob:') ? (
                <Image
                  {...getOptimizedImageProps(
                    project.cover_image,
                    title,
                    false
                  )}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
              
              {/* Dark Overlay with Title */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1 font-heading">
                    {title}
                  </h3>
                  {project.year && (
                    <p className="text-sm text-white/80">{project.year}</p>
                  )}
                </div>
              </div>

              {/* Subtle Title on Image (always visible) */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent group-hover:opacity-0 transition-opacity duration-300">
                <h3 className="text-base md:text-lg font-semibold text-white font-heading">
                  {title}
                </h3>
              </div>
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
        <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:border-accent/30">
          {/* Cover Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {project.cover_image && !project.cover_image.startsWith('blob:') ? (
              <Image
                {...getOptimizedImageProps(
                  project.cover_image,
                  title,
                  false // Not priority for card images
                )}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes={imageSizes.card}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No Image</span>
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* View Count */}
            <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{project.view_count}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors font-heading">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {blurb}
              </p>
            </div>

            {/* Meta */}
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

            {/* Action */}
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
