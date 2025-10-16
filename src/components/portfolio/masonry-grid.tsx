'use client';

import { motion } from 'framer-motion';
import { ProjectCard } from './project-card';

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

interface MasonryGridProps {
  projects: Project[];
}

export function MasonryGrid({ projects }: MasonryGridProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-lg">No projects found</p>
      </div>
    );
  }

  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          className="break-inside-avoid"
        >
          <ProjectCard project={project} />
        </motion.div>
      ))}
    </div>
  );
}
