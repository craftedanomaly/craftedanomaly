'use client';

import { useState, useMemo } from 'react';
import { MasonryGrid } from './masonry-grid';
import { FilterBar } from './filter-bar';
import { HeroCarousel } from '../home/hero-carousel';

interface CategoryPageProps {
  category: string;
  title: string;
  description: string;
  projects: any[];
  heroSlides?: any[];
}

export function CategoryPage({
  category,
  title,
  description,
  projects,
  heroSlides = [],
}: CategoryPageProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  // Extract unique tags and years
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach((project) => {
      project.tags.forEach((tag: string) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [projects]);

  const allYears = useMemo(() => {
    const years = new Set<number>();
    projects.forEach((project) => {
      if (project.year) years.add(project.year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const tagMatch =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => project.tags.includes(tag));
      const yearMatch =
        selectedYears.length === 0 ||
        (project.year && selectedYears.includes(project.year));
      return tagMatch && yearMatch;
    });
  }, [projects, selectedTags, selectedYears]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleYearToggle = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSelectedYears([]);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {heroSlides.length > 0 && (
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-8">
          <HeroCarousel slides={heroSlides} autoPlay={false} />
        </div>
      )}

      {/* Page Header */}
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
          {title}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          {description}
        </p>
      </div>

      {/* Filter Bar */}
      {(allTags.length > 0 || allYears.length > 0) && (
        <FilterBar
          tags={allTags}
          years={allYears}
          selectedTags={selectedTags}
          selectedYears={selectedYears}
          onTagToggle={handleTagToggle}
          onYearToggle={handleYearToggle}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Projects Grid */}
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
        </div>
        <MasonryGrid projects={filteredProjects} />
      </div>
    </div>
  );
}
