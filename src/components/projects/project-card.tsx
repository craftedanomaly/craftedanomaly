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
  title_en: string;
  title_tr: string;
  blurb_en: string;
  blurb_tr: string;
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
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const title = project.title_en;
  const blurb = project.blurb_en;
  const role = project.role_en;

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
