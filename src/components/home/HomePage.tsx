"use client";

import { useState, useEffect, useRef } from "react";
import { LoadingAnimation } from "./LoadingAnimation";
import { HeroSwiper } from "./HeroSwiper";
import { ParallaxBackground } from "./ParallaxBackground";
import { FilmStripCarousel } from "./FilmStripCarousel";
import { CategoryIndicator } from "./CategoryIndicator";
import { OurWorksSection } from "../ourworks/ourworks";
import { OurWorksCategoryIndicator } from "../ourworks/ourWorksCategoryIndicator";

interface HeroSlide {
  src: string;
  alt: string;
  caption?: string;
  type?: "image" | "video";
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
  const [centerProjectCategory, setCenterProjectCategory] = useState<
    string | undefined
  >(undefined);
  const scrollToCategoryRef = useRef<((categorySlug: string) => void) | null>(
    null
  );

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleCategoryChange = (slug: string | null) => {
    setActiveCategory(slug);
  };

  const handleCenterProjectChange = (
    projectId: string,
    categorySlug?: string
  ) => {
    setCenterProjectCategory(categorySlug);
  };

  const handleCategoryClick = (categorySlug: string) => {
    if (scrollToCategoryRef.current) {
      scrollToCategoryRef.current(categorySlug);
    }

    console.log("category slug from indicator:", categorySlug);
  };

  return (
    <>
      {/* Loading Animation */}
      {/* {isLoading && <LoadingAnimation onComplete={handleLoadingComplete} />} */}

      {/* Hero Carousel - Fixed Background */}
      <HeroSwiper slides={heroSlides} />

      {/* Parallax SVG Shapes Background */}
      <ParallaxBackground />

      {/* Main Content */}
      {/* {!isLoading && ( */}
      <div className="relative z-10">
        {/* Blueprint Background Section - Covers hero on scroll */}
        <div className="bp-grid mt-screen">
          {/* Film Strip Carousel */}
          {/* <FilmStripCarousel
              projects={projects}
              activeCategory={activeCategory}
              onCenterProjectChange={handleCenterProjectChange}
              scrollToCategoryRef={scrollToCategoryRef}
              categoryIndicator={
                <CategoryIndicator
                  categories={categories}
                  activeCategorySlug={centerProjectCategory}
                  onCategoryClick={handleCategoryClick}
                />
              }
            /> */}
          <OurWorksSection
            projects={projects}
            onCenterProjectChange={handleCenterProjectChange}
            scrollToCategoryRef={scrollToCategoryRef}
            categories={categories}
          />
        </div>
      </div>
      {/* )} */}
    </>
  );
}
