"use client";

import { useRef, useState, useMemo, useEffect, useCallback, useLayoutEffect } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
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
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const midColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  const [activeCategory, setActiveCategory] = useState<string>("");
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const { width, height } = useWindowSize();

  const filteredProjects = activeCategory
    ? projects.filter((p) => p.categorySlug === activeCategory)
    : projects;

  const shouldReduceMotion = useReducedMotion();
  const columnsCount = width >= 1024 ? 3 : width >= 640 ? 2 : 1;

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

  const scrollToCategory = useCallback(
    (categorySlug: string) => {
      setActiveCategory(categorySlug);
      // ensure the section is visible after filter switch
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    []
  );

  useEffect(() => {
    if (!scrollToCategoryRef) return;
    if (!("current" in scrollToCategoryRef)) return;
    scrollToCategoryRef.current = scrollToCategory;
    return () => {
      // avoid leaking an old closure
      if (scrollToCategoryRef.current === scrollToCategory) {
        scrollToCategoryRef.current = null;
      }
    };
  }, [scrollToCategoryRef, scrollToCategory]);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    // sticky stage: progress 0 at stage top, 1 at stage bottom
    // IMPORTANT: for a pinned (sticky) viewport, the scrollable distance is
    // (stageHeight - viewportHeight). Using "end end" matches that distance and
    // ensures we hit the final translateY *before* the sticky unpins.
    offset: ["start start", "end end"],
  });

  // Measure column heights to create a "pinned" scroll area (Buena Suerte feel)
  // Stage height must be long enough so users never hit blank space before seeing all projects.
  const [stageHeightPx, setStageHeightPx] = useState<number>(
    Math.max(1, height ? height * 3 : 2400)
  );
  const [maxScrollLeft, setMaxScrollLeft] = useState(0);
  const [maxScrollMid, setMaxScrollMid] = useState(0);
  const [maxScrollRight, setMaxScrollRight] = useState(0);

  const desktopBump = 900;
  const tabletBump = 650;
  const bumpStrength =
    shouldReduceMotion || columnsCount === 1
      ? 0
      : width >= 1024
        ? desktopBump
        : tabletBump;

  useLayoutEffect(() => {
    const measure = () => {
      // Measure the *actual* pinned viewport height (not window.innerHeight),
      // otherwise maxScroll can be over/under-estimated and cause blank space.
      const viewportH = viewportRef.current?.clientHeight || height || window.innerHeight || 0;
      if (!viewportH) return;

      const leftH = leftColRef.current?.scrollHeight || 0;
      const midH = midColRef.current?.scrollHeight || 0;
      const rightH = rightColRef.current?.scrollHeight || 0;

      // Inner visible height (account for the outer `p-px` border = 2px total)
      const contentViewportH = Math.max(0, viewportH - 2);
      // Tiny pixel buffer for rounding
      const pxBuffer = 1;

      const leftMax = Math.max(0, leftH - contentViewportH + pxBuffer);
      const midMax = Math.max(0, midH - contentViewportH + pxBuffer);
      const rightMax = Math.max(0, rightH - contentViewportH + pxBuffer);

      setMaxScrollLeft(leftMax);
      setMaxScrollMid(midMax);
      setMaxScrollRight(rightMax);

      const maxTravel = Math.max(leftMax, midMax, rightMax);
      // Make the pinned stage be the *end of the page*:
      // stage height = exactly the travel we need (no extra blank scroll after content ends).
      setStageHeightPx(Math.max(viewportH + maxTravel, viewportH));
    };

    // First measure after layout
    const raf = requestAnimationFrame(measure);

    // Keep measuring as images/layout settle
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => measure());
      if (leftColRef.current) ro.observe(leftColRef.current);
      if (midColRef.current) ro.observe(midColRef.current);
      if (rightColRef.current) ro.observe(rightColRef.current);
    }

    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, [columnsCount, height, filteredProjects.length, shouldReduceMotion, bumpStrength]);

  // Non-linear scroll curves per column (same endpoints, very different mid positions)
  const baseLeft = useTransform(
    scrollYProgress,
    [0, 0.45, 1],
    [0, -maxScrollLeft * 0.18, -maxScrollLeft]
  );
  const baseMid = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, -maxScrollMid * 0.55, -maxScrollMid]
  );
  const baseRight = useTransform(
    scrollYProgress,
    [0, 0.55, 1],
    [0, -maxScrollRight * 0.88, -maxScrollRight]
  );

  // Use direct transforms (no spring) to avoid overshoot that can reveal blank space.
  const yLeft = baseLeft;
  const yMid = baseMid;
  const yRight = baseRight;

  const columns = useMemo(() => {
    const cols: Project[][] = Array.from({ length: columnsCount }, () => []);
    filteredProjects.forEach((p, index) => {
      cols[index % columnsCount].push(p);
    });
    return cols;
  }, [filteredProjects, columnsCount]);

  // Autoplay hovered video (only for direct video files we render as <video>)
  useEffect(() => {
    const id = hoveredProjectId;
    if (!id) return;
    const v = videoRefs.current.get(id);
    if (!v) return;

    try {
      v.currentTime = 0;
      void v.play();
    } catch {
      // ignore autoplay restrictions
    }

    return () => {
      const vv = videoRefs.current.get(id);
      if (!vv) return;
      vv.pause();
      vv.currentTime = 0;
    };
  }, [hoveredProjectId]);

  if (!filteredProjects || filteredProjects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bp-grid">
        <p className="text-foreground/80">No projects available</p>
      </div>
    );
  }

  const getActiveCategoryFromCategoryIndicator = (data: Category) => {
    setActiveCategory(data.slug);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      ref={sectionRef}
      className="relative min-h-screen bp-grid flex flex-col items-center justify-start overflow-hidden"
    >
      <div className="text-center z-10 pt-20 pb-10">
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

      {/* Pinned (sticky) stage: boundaries fixed, projects move inside */}
      <div ref={stageRef} className="relative w-full" style={{ height: stageHeightPx }}>
        <div ref={viewportRef} className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Outer 1px border */}
          <div className="w-full h-full bg-[#0046bf] p-px">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px items-start h-full">
              {columns.map((colProjects, colIndex) => {
                const y =
                  columnsCount === 1
                    ? yMid
                    : columnsCount === 2
                      ? colIndex === 0
                        ? yLeft
                        : yRight
                      : colIndex === 0
                        ? yLeft
                        : colIndex === 1
                          ? yMid
                          : yRight;

                const colRef =
                  columnsCount === 1
                    ? midColRef
                    : columnsCount === 2
                      ? colIndex === 0
                        ? leftColRef
                        : rightColRef
                      : colIndex === 0
                        ? leftColRef
                        : colIndex === 1
                          ? midColRef
                          : rightColRef;

                return (
                  <motion.div
                    key={`col-${colIndex}`}
                    style={{ y }}
                    className="flex flex-col gap-px will-change-transform"
                    ref={colRef}
                  >
                    {colProjects.map((project, itemIndex) => {
                      const key = `${project.id}-${project.slug}-${colIndex}-${itemIndex}`;
                      const aspectPatterns =
                        columnsCount === 1
                          ? ["aspect-[4/5]"]
                          : ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[16/10]"];
                      const aspectClass =
                        aspectPatterns[(itemIndex + colIndex) % aspectPatterns.length] ??
                        "aspect-[4/5]";

                      const videoUrl = project.coverVideoUrl?.trim() || "";
                      const yt = videoUrl ? getYouTubeId(videoUrl) : null;
                      const vm = videoUrl ? getVimeoId(videoUrl) : null;
                      const isDirectVideo = Boolean(videoUrl && !yt && !vm);
                      const isHovered = hoveredProjectId === project.id;

                      return (
                        <Link
                          key={key}
                          href={`/projects/${project.slug}`}
                          className="group block"
                          onFocus={() =>
                            onCenterProjectChange?.(project.id, project.categorySlug)
                          }
                          onMouseEnter={() => {
                            onCenterProjectChange?.(project.id, project.categorySlug);
                            setHoveredProjectId(project.id);
                          }}
                          onMouseLeave={() => setHoveredProjectId(null)}
                        >
                          <div className={`relative w-full overflow-hidden bg-card ${aspectClass}`}>
                            <Image
                              src={project.coverImageUrl}
                              alt={project.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              priority={itemIndex < 2 && colIndex === 0}
                            />

                            {/* hover autoplay video (same place) */}
                            {width >= 768 && videoUrl ? (
                              yt ? (
                                isHovered ? (
                                  <iframe
                                    className="absolute inset-0 w-full h-full pointer-events-none"
                                    src={`https://www.youtube.com/embed/${yt}?autoplay=1&mute=1&controls=0&rel=0&showinfo=0&playsinline=1`}
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                    style={{ opacity: 1, zIndex: 10, border: "0" }}
                                  />
                                ) : null
                              ) : vm ? (
                                isHovered ? (
                                  <iframe
                                    className="absolute inset-0 w-full h-full pointer-events-none"
                                    src={`https://player.vimeo.com/video/${vm}?autoplay=1&muted=1&background=1&dnt=1`}
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                    style={{ opacity: 1, zIndex: 10, border: "0" }}
                                  />
                                ) : null
                              ) : isDirectVideo ? (
                                <video
                                  ref={(el) => {
                                    if (el) videoRefs.current.set(project.id, el);
                                    else videoRefs.current.delete(project.id);
                                  }}
                                  src={videoUrl}
                                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                  style={{
                                    opacity: isHovered ? 1 : 0,
                                    transition: "opacity 0.2s ease",
                                    zIndex: 10,
                                  }}
                                  loop
                                  muted
                                  playsInline
                                  preload="metadata"
                                />
                              ) : null
                            ) : null}

                            {/* subtle base gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

                            {/* hover overlay (always visible on touch sizes) */}
                            <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5 z-20">
                              <div className="max-md:opacity-100 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                                <div className="text-white drop-shadow">
                                  <div className="text-lg md:text-xl font-semibold leading-tight">
                                    {project.title}
                                  </div>
                                  {project.year ? (
                                    <div className="mt-1 text-xs text-white/80">
                                      {project.year}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
