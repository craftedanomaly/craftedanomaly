"use client";

import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Lock, Grid, List, ZoomIn, ZoomOut, Maximize2, Play, ChevronLeft, ChevronRight } from "lucide-react";

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
  client?: string;
  tags?: string[];
}

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface AdobeWorksSectionProps {
  projects: Project[];
  categories: Category[];
}

export function AdobeWorksSection({
  projects,
  categories,
}: AdobeWorksSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [hiddenProjects, setHiddenProjects] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [gridSize, setGridSize] = useState<number>(4);
  const [scrubPosition, setScrubPosition] = useState<number>(0);
  const [isDraggingScrub, setIsDraggingScrub] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSlideIndex, setMobileSlideIndex] = useState(0);
  const mobileSlideIndexRef = useRef(0);
  const touchStartRef = useRef(0);
  const touchHandledRef = useRef(false);
  const [isCarouselActive, setIsCarouselActive] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const mobileSliderRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Sync slide index ref
  useEffect(() => {
    mobileSlideIndexRef.current = mobileSlideIndex;
  }, [mobileSlideIndex]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Activate carousel only when section is fully visible
  useEffect(() => {
    if (!isMobile || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Activate when section is almost fully visible
        setIsCarouselActive(entry.intersectionRatio >= 0.95);
      },
      { threshold: [0, 0.5, 0.9, 0.95, 1] }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  // Filter projects by category and visibility
  const filteredProjects = useMemo(() => {
    let filtered = activeCategory === "all"
      ? projects
      : projects.filter((p) => p.categorySlug === activeCategory);
    return filtered.filter((p) => !hiddenProjects.has(p.id));
  }, [projects, activeCategory, hiddenProjects]);

  // Handle touch events natively to control scroll locking
  useEffect(() => {
    if (!isMobile || !isCarouselActive || !sectionRef.current) return;
    const section = sectionRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientY;
      touchHandledRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchCurrent = e.touches[0].clientY;
      const diff = touchStartRef.current - touchCurrent;
      const index = mobileSlideIndexRef.current;

      const isAtFirstItem = index === 0;
      const isAtLastItem = index === filteredProjects.length - 1;
      const isScrollingUp = diff < 0;
      const isScrollingDown = diff > 0;

      // Allow page scroll only at boundaries
      const shouldAllowPageScroll = (isAtFirstItem && isScrollingUp) || (isAtLastItem && isScrollingDown);

      if (!shouldAllowPageScroll) {
        if (e.cancelable) e.preventDefault();

        // Lower threshold (15px) for faster, more natural swiping (tikitiki effect)
        // Reset touchStartRef to current after triggering to allow continuous scrolling in one gesture
        if (Math.abs(diff) > 15) {
          if (isScrollingDown && !isAtLastItem) {
            setMobileSlideIndex(prev => prev + 1);
            touchStartRef.current = touchCurrent;
          } else if (isScrollingUp && !isAtFirstItem) {
            setMobileSlideIndex(prev => prev - 1);
            touchStartRef.current = touchCurrent;
          }
        }
      }
    };

    // Attach to entire section for swiping from anywhere
    section.addEventListener('touchstart', handleTouchStart, { passive: true });
    section.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      section.removeEventListener('touchstart', handleTouchStart);
      section.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile, isCarouselActive, filteredProjects.length]);

  // Toggle project visibility
  const toggleProjectVisibility = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  // Handle timeline scrub
  const handleTimelineMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDraggingScrub(true);
    updateScrubPosition(e);
  }, []);

  const handleTimelineMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingScrub) {
      updateScrubPosition(e);
    }
  }, [isDraggingScrub]);

  const handleTimelineMouseUp = useCallback(() => {
    setIsDraggingScrub(false);
  }, []);

  const updateScrubPosition = (e: React.MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setScrubPosition(percentage);

      // Update active category based on scrub position
      const allCategories = ["all", ...categories.map(c => c.slug)];
      const segmentWidth = 100 / allCategories.length;
      const categoryIndex = Math.min(Math.floor(percentage / segmentWidth), allCategories.length - 1);
      setActiveCategory(allCategories[categoryIndex]);
    }
  };

  // Get YouTube/Vimeo ID helpers
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

  // Handle video autoplay on hover
  useEffect(() => {
    if (!hoveredProjectId) return;

    const video = videoRefs.current.get(hoveredProjectId);
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => { });
    }

    return () => {
      const v = videoRefs.current.get(hoveredProjectId);
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
    };
  }, [hoveredProjectId]);

  // All projects for layers panel (including hidden)
  const allProjectsForCategory = useMemo(() => {
    return activeCategory === "all"
      ? projects
      : projects.filter((p) => p.categorySlug === activeCategory);
  }, [projects, activeCategory]);

  const selectedProject = filteredProjects.find(p => p.id === selectedProjectId);

  // Mobile slider navigation
  const handleMobileNext = () => {
    if (mobileSlideIndex < filteredProjects.length - 1) {
      setMobileSlideIndex(prev => prev + 1);
    }
  };

  const handleMobilePrev = () => {
    if (mobileSlideIndex > 0) {
      setMobileSlideIndex(prev => prev - 1);
    }
  };

  // Reset slide index when category changes
  useEffect(() => {
    setMobileSlideIndex(0);
  }, [activeCategory]);

  return (
    <section ref={sectionRef} id="adobe-works-section" className="min-h-screen relative">
      {/* Full Blueprint Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#005aff',
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 py-8">
        <div className="max-w-[1900px] mx-auto px-4">

          {/* Section Title */}
          <div className="text-center mb-8">
            <h2 className="text-5xl md:text-7xl font-bold text-[#ed5c2c] drop-shadow-lg">
              Our Works
            </h2>
          </div>

          {/* Mobile Category Filter */}
          {isMobile && (
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {["all", ...categories.map(c => c.slug)].map((slug, index) => {
                const colors = ["#ed5c2c", "#0066cc", "#7b2cbf", "#2d6a4f", "#d4a373", "#e63946"];
                const isActive = activeCategory === slug;
                const categoryName = slug === "all" ? "All" : categories.find(c => c.slug === slug)?.name || slug;

                return (
                  <button
                    key={slug}
                    onClick={() => setActiveCategory(slug)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${isActive
                        ? "text-white shadow-lg"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    style={{
                      backgroundColor: isActive ? colors[index % colors.length] : undefined
                    }}
                  >
                    {categoryName}
                  </button>
                );
              })}
            </div>
          )}

          {/* Mobile Vertical Stacked Card Carousel */}
          {isMobile && (
            <div
              ref={mobileSliderRef}
              className="relative h-[500px] overflow-hidden"
            >
              {/* Stacked Cards */}
              <div className="relative h-full flex items-center justify-center px-4">
                {filteredProjects.map((project, index) => {
                  const offset = index - mobileSlideIndex;
                  const isActive = offset === 0;
                  const isPrev = offset < 0;
                  const isNext = offset > 0;

                  // Only render cards within visible range
                  if (Math.abs(offset) > 3) return null;

                  return (
                    <motion.div
                      key={project.id}
                      className="absolute w-full cursor-pointer"
                      style={{
                        zIndex: 10 - Math.abs(offset),
                        pointerEvents: isActive ? 'auto' : 'none'
                      }}
                      initial={false}
                      animate={{
                        y: isActive ? 0 : isPrev ? -80 * Math.abs(offset) : 120 * offset,
                        scale: isActive ? 1 : 1 - (Math.abs(offset) * 0.08),
                        opacity: isActive ? 1 : Math.max(0, 1 - Math.abs(offset) * 0.4),
                        rotateX: isActive ? 0 : isPrev ? 8 : -5,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                      onClick={() => {
                        if (isActive) return;
                        setMobileSlideIndex(index);
                      }}
                    >
                      <Link href={isActive ? `/projects/${project.slug}` : '#'} onClick={(e) => !isActive && e.preventDefault()}>
                        <div
                          className={`relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl transition-shadow duration-300 ${isActive ? 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]' : ''
                            }`}
                          style={{
                            border: isActive ? '3px solid rgba(255,255,255,0.2)' : '2px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <Image
                            src={project.coverImageUrl}
                            alt={project.title}
                            fill
                            className="object-cover"
                            sizes="100vw"
                            priority={Math.abs(offset) <= 1}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          {/* Project Info - Only visible on active card */}
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 p-5"
                            animate={{ opacity: isActive ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <h3 className="text-white font-bold text-2xl mb-2 drop-shadow-lg">
                              {project.title}
                            </h3>
                            <div className="flex items-center gap-3">
                              {project.year && (
                                <span className="text-white/80 text-sm font-medium">{project.year}</span>
                              )}
                              {project.projectType && (
                                <span className="px-3 py-1 bg-[#ed5c2c] rounded-full text-xs text-white font-medium">
                                  {project.projectType}
                                </span>
                              )}
                            </div>
                          </motion.div>

                          {/* Video indicator */}
                          {project.coverVideoUrl && isActive && (
                            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Scroll Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <div className="flex gap-1.5">
                  {filteredProjects.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setMobileSlideIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${index === mobileSlideIndex
                          ? "bg-[#ed5c2c] w-8"
                          : "bg-white/30 w-1.5 hover:bg-white/50"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-white/50 text-xs">
                  {mobileSlideIndex + 1} / {filteredProjects.length}
                </span>
              </div>
            </div>
          )}

          {/* Desktop: Top Timeline Bar - Premiere Pro style */}
          {!isMobile && (
            <div className="bg-[#1e1e1e]/95 backdrop-blur border border-[#3d3d3d] rounded-t-lg overflow-hidden">
              {/* Timeline Ruler - Category Segments */}
              <div
                ref={timelineRef}
                className="relative h-10 bg-[#252525] border-b border-[#3d3d3d] cursor-pointer select-none flex"
                onMouseDown={handleTimelineMouseDown}
                onMouseMove={handleTimelineMouseMove}
                onMouseUp={handleTimelineMouseUp}
                onMouseLeave={handleTimelineMouseUp}
              >
                {/* Category segments */}
                {["all", ...categories.map(c => c.slug)].map((slug, index) => {
                  const allCategories = ["all", ...categories.map(c => c.slug)];
                  const colors = ["#ed5c2c", "#0066cc", "#7b2cbf", "#2d6a4f", "#d4a373", "#e63946"];
                  const isActive = activeCategory === slug;
                  const categoryName = slug === "all" ? "All" : categories.find(c => c.slug === slug)?.name || slug;

                  return (
                    <div
                      key={slug}
                      className={`flex-1 flex items-center justify-center border-r border-[#3d3d3d] transition-all ${isActive ? "" : "opacity-60 hover:opacity-80"
                        }`}
                      style={{
                        backgroundColor: isActive ? colors[index % colors.length] : '#1e1e1e'
                      }}
                    >
                      <span className={`text-xs font-medium truncate px-2 ${isActive ? "text-white" : "text-gray-400"
                        }`}>
                        {categoryName}
                      </span>
                    </div>
                  );
                })}

                {/* Playhead / Scrubber */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white z-20 pointer-events-none shadow-lg"
                  style={{ left: `${scrubPosition}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '8px solid white'
                    }}
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderBottom: '8px solid white'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area - Desktop Only */}
          {!isMobile && (
            <div className="flex bg-[#1e1e1e]/95 backdrop-blur border-x border-b border-[#3d3d3d] rounded-b-lg overflow-hidden min-h-[700px]">

              {/* Left Toolbar - Photoshop style */}
              <div className="w-12 bg-[#2d2d2d] border-r border-[#3d3d3d] flex flex-col items-center py-4 gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${viewMode === "grid" ? "text-[#ed5c2c] bg-[#3d3d3d]" : "text-gray-400 hover:bg-[#3d3d3d]"
                    }`}
                  title="Grid View"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${viewMode === "list" ? "text-[#ed5c2c] bg-[#3d3d3d]" : "text-gray-400 hover:bg-[#3d3d3d]"
                    }`}
                  title="List View"
                >
                  <List className="w-5 h-5" />
                </button>

                <div className="w-6 h-px bg-[#3d3d3d] my-2" />

                <button
                  onClick={() => setGridSize(Math.min(6, gridSize + 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-[#3d3d3d] rounded transition-colors"
                  title="Zoom Out (More columns)"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setGridSize(Math.max(2, gridSize - 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-[#3d3d3d] rounded transition-colors"
                  title="Zoom In (Fewer columns)"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>

                <div className="flex-1" />

                <button
                  onClick={() => {
                    const section = document.getElementById('adobe-works-section');
                    if (section) {
                      if (document.fullscreenElement) {
                        document.exitFullscreen();
                      } else {
                        section.requestFullscreen();
                      }
                    }
                  }}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-[#3d3d3d] hover:text-[#ed5c2c] rounded transition-colors"
                  title="Toggle Fullscreen"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>

              {/* Main Canvas Area - Projects Grid */}
              <div className="flex-1 relative overflow-auto p-6">
                {/* Grid of projects */}
                <div
                  className={`grid gap-4 ${viewMode === "list"
                      ? "grid-cols-1"
                      : ""
                    }`}
                  style={viewMode === "grid" ? {
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
                  } : undefined}
                >
                  {filteredProjects.map((project) => {
                    const isHovered = hoveredProjectId === project.id;
                    const videoUrl = project.coverVideoUrl?.trim() || "";
                    const ytId = videoUrl ? getYouTubeId(videoUrl) : null;
                    const vmId = videoUrl ? getVimeoId(videoUrl) : null;
                    const isDirectVideo = Boolean(videoUrl && !ytId && !vmId);

                    return (
                      <motion.div
                        key={project.id}
                        layout
                        onMouseEnter={() => setHoveredProjectId(project.id)}
                        onMouseLeave={() => setHoveredProjectId(null)}
                        className="relative group cursor-pointer"
                        animate={{
                          scale: isHovered ? 1.05 : 1,
                          zIndex: isHovered ? 20 : 1,
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <Link href={`/projects/${project.slug}`}>
                          <div
                            className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${isHovered
                                ? "border-[#ed5c2c] shadow-[0_0_30px_rgba(237,92,44,0.4)]"
                                : "border-[#3d3d3d] hover:border-[#555]"
                              }`}
                            style={{ aspectRatio: viewMode === "list" ? "21/9" : "16/10" }}
                          >
                            {/* Cover Image */}
                            <Image
                              src={project.coverImageUrl}
                              alt={project.title}
                              fill
                              className={`object-cover transition-all duration-500 ${isHovered ? "scale-110" : "scale-100"
                                }`}
                              sizes={`(max-width: 768px) 100vw, ${100 / gridSize}vw`}
                            />

                            {/* Video overlay on hover */}
                            <AnimatePresence>
                              {isHovered && videoUrl && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute inset-0 z-10"
                                >
                                  {ytId ? (
                                    <iframe
                                      className="absolute inset-0 w-full h-full"
                                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&rel=0&showinfo=0&playsinline=1`}
                                      allow="autoplay; encrypted-media"
                                      allowFullScreen
                                      style={{ border: 0 }}
                                    />
                                  ) : vmId ? (
                                    <iframe
                                      className="absolute inset-0 w-full h-full"
                                      src={`https://player.vimeo.com/video/${vmId}?autoplay=1&muted=1&background=1`}
                                      allow="autoplay; encrypted-media"
                                      allowFullScreen
                                      style={{ border: 0 }}
                                    />
                                  ) : isDirectVideo ? (
                                    <video
                                      ref={(el) => {
                                        if (el) videoRefs.current.set(project.id, el);
                                        else videoRefs.current.delete(project.id);
                                      }}
                                      src={videoUrl}
                                      className="absolute inset-0 w-full h-full object-cover"
                                      autoPlay
                                      loop
                                      muted
                                      playsInline
                                    />
                                  ) : null}
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Gradient overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-60"
                              }`} />

                            {/* Project info */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 pointer-events-none">
                              <motion.div
                                initial={false}
                                animate={{ y: isHovered ? 0 : 12, opacity: isHovered ? 1 : 0 }}
                                transition={{ duration: 0.25 }}
                              >
                                <h3 className="text-white font-semibold text-lg mb-1 drop-shadow-lg">
                                  {project.title}
                                </h3>
                                <motion.div
                                  initial={false}
                                  animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 6 }}
                                  transition={{ duration: 0.2 }}
                                  className="flex items-center gap-2"
                                >
                                  {project.year && (
                                    <span className="text-white/70 text-sm">{project.year}</span>
                                  )}
                                  {project.projectType && (
                                    <span className="px-2 py-0.5 bg-[#ed5c2c]/80 rounded text-xs text-white">
                                      {project.projectType}
                                    </span>
                                  )}
                                </motion.div>
                              </motion.div>
                            </div>

                            {/* Play icon indicator */}
                            {videoUrl && !isHovered && (
                              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                                <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                              </div>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {filteredProjects.length === 0 && (
                  <div className="flex items-center justify-center h-64 text-gray-400">
                    No visible projects. Toggle visibility in the Layers panel.
                  </div>
                )}
              </div>

              {/* Right Panel - Properties & Layers */}
              <div className="w-72 bg-[#2d2d2d] border-l border-[#3d3d3d] flex flex-col">
                {/* Properties Panel */}
                <div className="border-b border-[#3d3d3d]">
                  <div className="px-4 py-2 bg-[#252525] text-xs text-gray-400 uppercase tracking-wider font-medium">
                    Properties
                  </div>
                  {selectedProject ? (
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Client</div>
                        <div className="text-white font-medium text-sm">{selectedProject.client || selectedProject.title}</div>
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Year</div>
                          <div className="text-white font-medium text-sm">{selectedProject.year || "2024"}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Category</div>
                          <div className="text-white font-medium text-sm">
                            {categories.find(c => c.slug === selectedProject.categorySlug)?.name || "Project"}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/projects/${selectedProject.slug}`}
                        className="block w-full py-2 text-center border border-[#3d3d3d] rounded text-sm text-gray-300 hover:bg-[#ed5c2c] hover:border-[#ed5c2c] hover:text-white transition-colors"
                      >
                        View Case Study
                      </Link>
                    </div>
                  ) : (
                    <div className="p-4 text-gray-500 text-sm">
                      Click on a project to see details
                    </div>
                  )}
                </div>

                {/* Layers Panel */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-[#3d3d3d]">
                    <span className="text-xs text-white uppercase tracking-wider font-medium">Layers</span>
                  </div>

                  {/* Blend mode & opacity */}
                  <div className="flex items-center gap-4 px-4 py-2 border-b border-[#3d3d3d]">
                    <select className="bg-[#1e1e1e] border border-[#3d3d3d] rounded px-2 py-1 text-xs text-gray-300 cursor-pointer">
                      <option>Normal</option>
                      <option>Multiply</option>
                      <option>Screen</option>
                      <option>Overlay</option>
                    </select>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>Opacity:</span>
                      <span className="text-white">100%</span>
                    </div>
                  </div>

                  {/* Layers List */}
                  <div className="flex-1 overflow-y-auto">
                    {allProjectsForCategory.map((project, index) => {
                      const isHovered = hoveredProjectId === project.id;
                      const isHidden = hiddenProjects.has(project.id);

                      return (
                        <motion.div
                          key={project.id}
                          onMouseEnter={() => !isHidden && setHoveredProjectId(project.id)}
                          onMouseLeave={() => setHoveredProjectId(null)}
                          onClick={() => !isHidden && setSelectedProjectId(project.id)}
                          className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-[#3d3d3d] transition-colors ${selectedProjectId === project.id && !isHidden
                              ? "bg-[#0066cc]"
                              : isHovered && !isHidden
                                ? "bg-[#3d3d3d]"
                                : isHidden
                                  ? "bg-[#1a1a1a] opacity-50"
                                  : "hover:bg-[#3d3d3d]"
                            }`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          {/* Visibility toggle */}
                          <button
                            onClick={(e) => toggleProjectVisibility(project.id, e)}
                            className={`transition-colors ${isHidden ? "text-gray-600" : "text-gray-400 hover:text-white"}`}
                            title={isHidden ? "Show layer" : "Hide layer"}
                          >
                            {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>

                          {/* Thumbnail */}
                          <div className={`relative w-8 h-8 rounded overflow-hidden flex-shrink-0 border border-[#4d4d4d] ${isHidden ? "grayscale" : ""}`}>
                            <Image
                              src={project.coverImageUrl}
                              alt={project.title}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>

                          {/* Layer name */}
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs truncate ${selectedProjectId === project.id && !isHidden ? "text-white" : isHidden ? "text-gray-500 line-through" : "text-gray-300"
                              }`}>
                              {project.title}
                            </div>
                          </div>

                          {/* Link indicator */}
                          {selectedProjectId === project.id && !isHidden && (
                            <Link href={`/projects/${project.slug}`} className="text-white/70 hover:text-white">
                              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                            </Link>
                          )}
                        </motion.div>
                      );
                    })}

                    {/* Background layer */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-[#3d3d3d] opacity-50">
                      <button className="text-gray-400">
                        <Eye className="w-4 h-4" />
                      </button>
                      <div className="w-8 h-8 rounded bg-[#0046bf] flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0 border border-[#4d4d4d]">
                        BG
                      </div>
                      <div className="flex-1 text-xs text-gray-400">Blueprint Background</div>
                      <Lock className="w-3 h-3 text-gray-500" />
                    </div>
                  </div>

                  {/* Layer count */}
                  <div className="px-4 py-2 border-t border-[#3d3d3d] bg-[#252525] text-xs text-gray-500">
                    {filteredProjects.length} of {allProjectsForCategory.length} layers visible
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Status Bar - Desktop Only */}
          {!isMobile && (
            <div className="bg-[#1e1e1e]/95 backdrop-blur border border-t-0 border-[#3d3d3d] rounded-b-lg px-4 py-2 flex items-center text-xs text-gray-400">
              <span>Projects: {filteredProjects.length}</span>
              <span className="mx-4">|</span>
              <span>Grid: {gridSize} columns</span>
              <span className="mx-4">|</span>
              <span>Category: {activeCategory === "all" ? "All" : categories.find(c => c.slug === activeCategory)?.name}</span>
              <span className="flex-1" />
              <span>Crafted Anomaly © 2024</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
