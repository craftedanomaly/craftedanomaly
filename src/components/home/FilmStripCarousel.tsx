"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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

interface FilmStripCarouselProps {
  projects: Project[];
  activeCategory: string | null;
  onCenterProjectChange?: (projectId: string, categorySlug?: string) => void;
  scrollToCategoryRef?: React.RefObject<
    ((categorySlug: string) => void) | null
  >;
  categoryIndicator?: React.ReactNode;
}

export function FilmStripCarousel({
  projects,
  activeCategory,
  onCenterProjectChange,
  scrollToCategoryRef,
  categoryIndicator,
}: FilmStripCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [centerProjectIndex, setCenterProjectIndex] = useState(0);

  const scrollProgress = useMotionValue(0);
  const smoothScroll = useSpring(scrollProgress, {
    stiffness: 160,
    damping: 32,
  });

  // Filter projects by active category
  const filteredProjects = activeCategory
    ? projects.filter((p) => p.categorySlug === activeCategory)
    : projects;

  // Triple projects for infinite loop
  const loopedProjects = useMemo(() => {
    if (filteredProjects.length === 0) return [];
    return [...filteredProjects, ...filteredProjects, ...filteredProjects];
  }, [filteredProjects]);

  // Helpers for provider embeds
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

  // Mouse wheel scroll handler (faster, infinite loop)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 1.5; // faster but controlled
      const current = scrollProgress.get();
      const singleSetWidth = filteredProjects.length * 400;
      let newScroll = current + delta;

      // Infinite loop logic
      if (newScroll < 0) {
        newScroll = singleSetWidth + newScroll;
      } else if (newScroll > singleSetWidth * 2) {
        newScroll = singleSetWidth + (newScroll % singleSetWidth);
      }

      scrollProgress.set(newScroll);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [scrollProgress, filteredProjects.length]);

  // Calculate scroll position
  const scrollX = useTransform(smoothScroll, (value) => -value);

  // Track center project
  useEffect(() => {
    const unsubscribe = smoothScroll.on("change", (latest) => {
      const cardWidth = 400 + 24; // card + gap
      const centerIndex =
        Math.round(latest / cardWidth) % filteredProjects.length;
      const actualIndex =
        centerIndex < 0 ? filteredProjects.length + centerIndex : centerIndex;

      if (actualIndex !== centerProjectIndex && filteredProjects[actualIndex]) {
        setCenterProjectIndex(actualIndex);
        onCenterProjectChange?.(
          filteredProjects[actualIndex].id,
          filteredProjects[actualIndex].categorySlug
        );
      }
    });

    return () => unsubscribe();
  }, [
    smoothScroll,
    filteredProjects,
    centerProjectIndex,
    onCenterProjectChange,
  ]);

  // Scroll to first project of a category
  const scrollToCategory = useCallback(
    (categorySlug: string) => {
      const firstProjectIndex = filteredProjects.findIndex(
        (p) => p.categorySlug === categorySlug
      );
      if (firstProjectIndex !== -1) {
        const targetScroll = firstProjectIndex * 424; // card width + gap
        scrollProgress.set(targetScroll);
      }
    },
    [filteredProjects, scrollProgress]
  );

  // Expose scrollToCategory to parent
  useEffect(() => {
    if (scrollToCategoryRef) {
      scrollToCategoryRef.current = scrollToCategory;
    }
  }, [scrollToCategory, scrollToCategoryRef]);

  // Handle video playback on hover
  const handleMouseEnter = (
    projectId: string,
    index: number,
    categorySlug?: string,
    videoUrl?: string
  ) => {
    setHoveredIndex(index);
    // If URL is YouTube/Vimeo, we render an iframe (no programmatic play needed)
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
    // Notify parent of hovered project
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

  return (
    <div className="relative min-h-screen bp-grid flex flex-col items-center justify-center py-20 overflow-hidden">
      {/* Section Title */}
      <div className="text-center mb-8 z-10">
        <h2
          className="text-5xl md:text-7xl font-bold drop-shadow-lg mb-6"
          style={{ color: "#ed5c2c" }}
        >
          Our Works
        </h2>
        {/* Category Indicator */}
        {categoryIndicator}
      </div>

      {/* Film Strip Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[70vh] cursor-grab active:cursor-grabbing"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          className="absolute top-1/2 left-0 -translate-y-1/2 flex gap-6 px-[50vw]"
          style={{ x: scrollX }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDrag={(_, info) => {
            const current = scrollProgress.get();
            scrollProgress.set(current - info.delta.x);
          }}
        >
          {loopedProjects.map((project, index) => {
            const key = `${project.id}-${index}`;
            const isHovered = hoveredIndex === index;
            const isDimmed = hoveredIndex !== null && hoveredIndex !== index;
            const scale = isHovered ? 1.05 : 1;
            const height = "60vh";
            const width = 380;
            const borderColor = isHovered
              ? "var(--accent)"
              : "rgba(255,255,255,0.2)";
            const zIndex = isHovered
              ? 60
              : 20 - (index % filteredProjects.length);

            return (
              <motion.div
                key={`${project.id}-${index}`}
                className="relative flex-shrink-0"
                onMouseEnter={() =>
                  handleMouseEnter(
                    project.id,
                    index,
                    project.categorySlug,
                    project.coverVideoUrl
                  )
                }
                onMouseLeave={() => handleMouseLeave(project.id, index)}
                animate={{
                  scale,
                  z: isHovered ? 60 : 0,
                }}
                transition={{ type: "spring", stiffness: 150, damping: 25 }}
                style={{ zIndex }}
              >
                <Link href={`/projects/${project.slug}`}>
                  <div
                    className="relative overflow-hidden rounded-2xl border-2 shadow-2xl"
                    style={{
                      width,
                      height,
                      borderColor,
                    }}
                  >
                    {/* Project Image */}
                    <Image
                      src={project.coverImageUrl}
                      alt={project.title}
                      fill
                      className="object-cover"
                      priority={index < 5}
                    />

                    {/* Video on Hover (supports mp4/webm and YouTube/Vimeo) */}
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

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                    {/* Project Type Badge */}
                    {project.projectType && (
                      <div className="absolute left-4 top-4 z-20 px-2.5 py-1 text-[10px] uppercase tracking-widest bg-background/70 border border-border rounded-full text-foreground pointer-events-none">
                        {project.projectType}
                      </div>
                    )}

                    {/* Project Info - Always visible */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 p-6"
                      initial={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                        {project.title}
                      </h3>
                      {project.year && (
                        <span className="inline-block px-3 py-1 bg-accent/80 text-accent-foreground text-xs font-medium rounded-full">
                          {project.year}
                        </span>
                      )}
                    </motion.div>

                    {/* Hover Details */}
                    {isHovered && project.blurb && (
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
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
