'use client';

import { motion } from 'framer-motion';
import { Calendar, User, Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

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

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="space-y-6">
      {projects.map((project, index) => {
        const title = project.title_en;
        const blurb = project.blurb_en;
        const role = project.role_en;

        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <Link href={`/projects/${project.slug}`}>
              <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:border-accent/30">
                <div className="flex flex-col sm:flex-row">
                  {/* Cover Image */}
                  <div className="relative w-full sm:w-64 h-48 sm:h-32 flex-shrink-0">
                    {project.cover_image && !project.cover_image.startsWith('blob:') ? (
                      <Image
                        src={project.cover_image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">No Image</span>
                      </div>
                    )}
                    
                    {/* View Count */}
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{project.view_count}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                          {title}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {blurb}
                        </p>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {role && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{role}</span>
                            </div>
                          )}
                          
                          {project.client && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Client:</span>
                              <span>{project.client}</span>
                            </div>
                          )}
                          
                          {project.year && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{project.year}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="mt-4 sm:mt-0 sm:ml-6">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="group-hover:bg-accent/10 group-hover:text-accent transition-colors"
                        >
                          View Project
                          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
