'use client';

import { useState, useEffect } from 'react';
import { LoadingAnimation } from './LoadingAnimation';
import { HeroSwiper } from './HeroSwiper';
import { ParallaxBackground } from './ParallaxBackground';
import { FilmStripCarousel } from './FilmStripCarousel';
import { CategoryNavbar } from './CategoryNavbar';

interface HeroSlide {
  src: string;
  alt: string;
  caption?: string;
  type?: 'image' | 'video';
}

interface Project {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string;
  coverVideoUrl?: string;
  blurb?: string;
  year?: number;
  categorySlug?: string;
}

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface HomePageProps {
  heroSlides: HeroSlide[];
  projects: Project[];
  categories: Category[];
}

export function HomePage({ heroSlides, projects, categories }: HomePageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleCategoryChange = (slug: string | null) => {
    setActiveCategory(slug);
  };

  return (
    <>
      {/* Loading Animation */}
      {isLoading && <LoadingAnimation onComplete={handleLoadingComplete} />}

      {/* Hero Carousel - Fixed Background */}
      <HeroSwiper slides={heroSlides} />

      {/* Parallax SVG Shapes Background */}
      <ParallaxBackground />

      {/* Category Navigation */}
      {!isLoading && (
        <CategoryNavbar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}

      {/* Main Content */}
      {!isLoading && (
        <div className="relative z-10">
          {/* Spacer for hero section */}
          <div className="h-screen" />

          {/* Film Strip Carousel */}
          <FilmStripCarousel
            projects={projects}
            activeCategory={activeCategory}
          />
        </div>
      )}
    </>
  );
}
