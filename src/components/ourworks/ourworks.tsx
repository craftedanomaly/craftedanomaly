"use client";

import { useRef, useState, useMemo, useEffect, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { OurWorksCategoryIndicator } from "./ourWorksCategoryIndicator";
import { useWindowSize } from "@/hooks/useWindowSize";

interface Project {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string;
  coverVideoUrl?: string;
  blurb?: string;
  year?: number;
  categorySlug?: string;
  projectType?: string;
}

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface OurWorksSectionProps {
  projects: Project[];
  onCenterProjectChange?: (projectId: string, categorySlug?: string) => void;
  scrollToCategoryRef?: React.RefObject<
    ((categorySlug: string) => void) | null
  >;
  categories: Category[];
}

export function OurWorksSection({
  projects,
  onCenterProjectChange,
  scrollToCategoryRef,
  categories,
}: OurWorksSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [centerProjectIndex, setCenterProjectIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const { width } = useWindowSize();

  const containerRefs = useRef<HTMLDivElement[]>([]);
  containerRefs.current = [];

  console.log("scroll to category ref:", scrollToCategoryRef);

  const filteredProjects = activeCategory
    ? projects.filter((p) => p.categorySlug === activeCategory)
    : projects;

  const loopedProjects = useMemo(() => {
    if (filteredProjects.length === 0) return [];
    return [...filteredProjects];
  }, [filteredProjects]);

  console.log("filtered projects:", filteredProjects);

  const getYouTubeId = (url: string): string | null => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
      if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
      return null;
    } catch {
      return null;
    }
  };

  const getVimeoId = (url: string): string | null => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("vimeo.com"))
        return u.pathname.split("/").filter(Boolean)[0] || null;
      return null;
    } catch {
      return null;
    }
  };

  const handleMouseEnter = (
    projectId: string,
    index: number,
    categorySlug?: string,
    videoUrl?: string
  ) => {
    setHoveredIndex(index);
    const yt = videoUrl ? getYouTubeId(videoUrl) : null;
    const vm = videoUrl ? getVimeoId(videoUrl) : null;
    if (!yt && !vm) {
      const key = `${projectId}-${index}`;
      const video = videoRefs.current[key];
      if (video) {
        try {
          video.currentTime = 0;
          void video.play();
        } catch (error) {
          console.warn("Video playback failed", error);
        }
      }
    }
    const actualIndex = index % filteredProjects.length;
    onCenterProjectChange?.(filteredProjects[actualIndex]?.id, categorySlug);
  };

  const handleMouseLeave = (projectId: string, index: number) => {
    setHoveredIndex(null);
    const key = `${projectId}-${index}`;
    const video = videoRefs.current[key];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }

    const centerCategory = filteredProjects[centerProjectIndex]?.categorySlug;
    if (filteredProjects[centerProjectIndex]) {
      onCenterProjectChange?.(
        filteredProjects[centerProjectIndex].id,
        centerCategory
      );
    }
  };

  if (!filteredProjects || filteredProjects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bp-grid">
        <p className="text-foreground/80">No projects available</p>
      </div>
    );
  }

  console.log("categories:", categories);

  const getActiveCategoryFromCategoryIndicator = (data: Category) => {
    setActiveCategory(data.slug);

    console.log("data:", data);
  };

  return (
    <div className="relative min-h-screen bp-grid flex flex-col items-center justify-start py-20 overflow-hidden">
      <div className="text-center mb-8 z-10">
        <h2
          className="text-5xl md:text-7xl font-bold drop-shadow-lg mb-6"
          style={{ color: "#ed5c2c" }}
        >
          Our Works
        </h2>
        <OurWorksCategoryIndicator
          categories={categories}
          onCategoryClick={getActiveCategoryFromCategoryIndicator}
        />
      </div>

      {/* Works Carousel */}
      <div
        ref={containerRef}
        style={{ perspective: "1000px" }}
        className="relative w-full h-[100%] flex flex-col gap-6 max-md:gap-0"
      >
        {loopedProjects.map((project, index) => {
          const key = `${project.id}-${index}`;
          const isHovered = hoveredIndex === index;
          const borderColor = isHovered
            ? "var(--accent)"
            : "rgba(255,255,255,0.2)";

          return (
            <motion.div key={key} className="relative flex-shrink-0">
              <Link
                href={`/projects/${project.slug}`}
                className="cursor-default pointer-events-none"
              >
                <div
                  onMouseEnter={() =>
                    handleMouseEnter(
                      project.id,
                      index,
                      project.categorySlug,
                      project.coverVideoUrl
                    )
                  }
                  onMouseLeave={() => handleMouseLeave(project.id, index)}
                  className="relative mx-auto overflow-hidden shadow-2xl cursor-pointer pointer-events-auto max-md:rounded-none border-t-2 border-b-2"
                  style={{
                    width: width < 768 ? "100%" : "100%",
                    minHeight: width < 768 ? "40dvh" : "100dvh",
                    borderColor,
                  }}
                >
                  <Image
                    src={project.coverImageUrl}
                    alt={project.title}
                    fill
                    className="object-cover"
                    priority={index < 5}
                  />

                  {project.coverVideoUrl &&
                    project.coverVideoUrl.trim() &&
                    (() => {
                      const url = project.coverVideoUrl!;
                      const yt = getYouTubeId(url);
                      const vm = getVimeoId(url);
                      if (yt) {
                        return isHovered ? (
                          <iframe
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            src={`https://www.youtube.com/embed/${yt}?autoplay=1&mute=1&controls=0&rel=0&showinfo=0&playsinline=1`}
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            style={{ opacity: 1, zIndex: 10, border: "0" }}
                          />
                        ) : null;
                      }
                      if (vm) {
                        return isHovered ? (
                          <iframe
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            src={`https://player.vimeo.com/video/${vm}?autoplay=1&muted=1&background=1&dnt=1`}
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            style={{ opacity: 1, zIndex: 10, border: "0" }}
                          />
                        ) : null;
                      }
                      return (
                        <video
                          ref={(el) => {
                            if (el) videoRefs.current[key] = el;
                            else delete videoRefs.current[key];
                          }}
                          src={url}
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                          style={{
                            opacity: isHovered ? 1 : 0,
                            transition: "opacity 0.25s ease",
                            zIndex: isHovered ? 10 : 0,
                          }}
                          loop
                          muted
                          playsInline
                          preload="metadata"
                        />
                      );
                    })()}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                  {project.projectType && (
                    <div className="absolute left-4 top-4 z-20 px-2.5 py-1 text-[10px] uppercase tracking-widest bg-background/70 border border-border rounded-full text-foreground pointer-events-none">
                      {project.projectType}
                    </div>
                  )}

                  {isHovered && project.blurb && (
                    <>
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 p-6"
                        whileHover={{ opacity: 1 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h4>{project.categorySlug}</h4>
                        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                          {project.title}
                        </h3>
                        {project.year && (
                          <span className="inline-block px-3 py-1 bg-accent/80 text-accent-foreground text-xs font-medium rounded-full">
                            {project.year}
                          </span>
                        )}
                      </motion.div>
                      <motion.div
                        className="absolute top-0 left-0 right-0 p-6 bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-white/90 text-sm line-clamp-3">
                          {project.blurb}
                        </p>
                      </motion.div>
                    </>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
