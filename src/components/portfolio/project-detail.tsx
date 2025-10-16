'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectDetailProps {
  project: {
    id: string;
    slug: string;
    title: string;
    blurb: string;
    year?: number;
    role?: string;
    client?: string;
    tags: string[];
    techStack: string[];
    externalLinks: Array<{ label: string; url: string }>;
    gallery: string[];
    category: string;
  };
  relatedProjects?: Array<{
    id: string;
    slug: string;
    title: string;
    coverImage: string;
  }>;
}

export function ProjectDetail({ project, relatedProjects = [] }: ProjectDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % project.gallery.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? project.gallery.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/${project.category}`}>
          <Button variant="ghost" className="group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to {project.category}
          </Button>
        </Link>
      </div>

      {/* Hero Gallery */}
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 mb-12">
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-card">
          <Image
            src={project.gallery[currentImageIndex]}
            alt={`${project.title} - Image ${currentImageIndex + 1}`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
          />

          {/* Navigation Arrows */}
          {project.gallery.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                onClick={prevImage}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                onClick={nextImage}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-background/80 px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {project.gallery.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Gallery */}
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-4">
          {project.gallery.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative aspect-square overflow-hidden rounded-md border-2 transition-all ${
                index === currentImageIndex
                  ? 'border-accent'
                  : 'border-transparent hover:border-muted'
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="150px"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Project Details */}
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {project.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {project.blurb}
              </p>
            </motion.div>

            {/* Tags */}
            {project.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-2"
              >
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full bg-muted text-foreground text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            )}

            {/* External Links */}
            {project.externalLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-4"
              >
                {project.externalLinks.map((link, index) => (
                  <Button key={index} asChild variant="default" className="group">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.label}
                      <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-lg p-6 space-y-6"
            >
              {/* Year */}
              {project.year && (
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Year</h3>
                    <p className="text-muted-foreground">{project.year}</p>
                  </div>
                </div>
              )}

              {/* Role */}
              {project.role && (
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Role</h3>
                    <p className="text-muted-foreground">{project.role}</p>
                  </div>
                </div>
              )}

              {/* Client */}
              {project.client && (
                <div className="flex items-start space-x-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Client</h3>
                    <p className="text-muted-foreground">{project.client}</p>
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              {project.techStack.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-16 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Related Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProjects.map((relatedProject) => (
              <Link
                key={relatedProject.id}
                href={`/${project.category}/${relatedProject.slug}`}
                className="group block overflow-hidden rounded-lg border border-border hover:border-accent transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={relatedProject.coverImage}
                    alt={relatedProject.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                    {relatedProject.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
