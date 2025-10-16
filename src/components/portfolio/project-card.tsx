'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';

interface Project {
  id: string;
  slug: string;
  title: string;
  year?: number;
  tags: string[];
  coverImage: string;
  coverVideo?: string;
  category: string;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/${project.category}/${project.slug}`}
      className="group block relative overflow-hidden rounded-lg bg-card border border-border hover:border-accent transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image/Video Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={project.coverImage}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Video Play Indicator */}
        {project.coverVideo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm"
          >
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              <Play className="h-8 w-8 text-accent-foreground ml-1" fill="currentColor" />
            </div>
          </motion.div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Project Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
            {project.title}
          </h3>
          {project.year && (
            <span className="text-sm text-muted-foreground ml-2 flex-shrink-0">
              {project.year}
            </span>
          )}
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hover Border Effect */}
      <motion.div
        className="absolute inset-0 border-2 border-accent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        initial={false}
      />
    </Link>
  );
}
