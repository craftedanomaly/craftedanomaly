"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { scrollPositionManager } from "@/lib/scroll-position-manager";
import { HorizontalScrollIndicator } from "@/components/ui/horizontal-scroll-indicator";
import { useWindowSize } from "@/hooks/useWindowSize";
import useEmblaCarousel from "embla-carousel-react";
interface Tag {
  id: string;
  slug: string;
  name: string;
}

interface Project {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  cover_image: string;
  cover_video_url?: string;
  year: number;
  role_en: string;
  client: string;
  project_type?: string;
  tags?: Tag[];
}

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
}

interface CategoryPageClientProps {
  category: Category;
  projects: Project[];
  availableTags?: Tag[];
}

export function CategoryPageClient({
  category,
  projects,
  availableTags,
}: CategoryPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);

  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const { width, height } = useWindowSize();

  const derivedTags = useMemo(() => {
    const map = new Map<string, Tag>();
    (projects || []).forEach((p) => {
      (p.tags || []).forEach((t) => {
        if (t && t.id) map.set(t.id, t);
      });
    });
    return Array.from(map.values());
  }, [projects]);

  const tagsList =
    Array.isArray(availableTags) && availableTags.length > 0
      ? availableTags
      : derivedTags;

  console.log("Category page tags debug:", {
    availableTags,
    derivedTags,
    tagsList,
    projectsWithTags: projects.map((p) => ({
      id: p.id,
      title: p.title,
      tags: p.tags,
    })),
  });

  // Initialize from URL
  useEffect(() => {
    const tagsParam = searchParams.get("tags");
    if (tagsParam) {
      const tags = tagsParam.split(",").filter(Boolean);
      setSelectedTags(tags);
    }
  }, [searchParams]);

  // Update URL when tags change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedTags.length > 0) {
      params.set("tags", selectedTags.join(","));
    } else {
      params.delete("tags");
    }

    router.replace(`/${category.slug}?${params.toString()}`, { scroll: false });
  }, [selectedTags, category.slug, router, searchParams]);

  const toggleTag = (tagSlug: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagSlug)
        ? prev.filter((slug) => slug !== tagSlug)
        : [...prev, tagSlug]
    );
  };

  const clearFilters = () => {
    setFilteredProjects(projects);
    setSelectedTags([]);
  };

  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredProjects(projects);
    }
  }, [selectedTags, projects]);

  // Handle hover state only; actual play happens in effect after mount
  const handleProjectHover = (projectId: string, isHovering: boolean) => {
    setHoveredProject(isHovering ? projectId : null);
  };

  // Autoplay hovered video's element after it mounts
  useEffect(() => {
    const id = hoveredProject;
    if (!id) return;
    const v = videoRefs.current.get(id);
    if (v) {
      v.play().catch((err) => console.debug("Video play skipped:", err));
    }
    return () => {
      const vv = videoRefs.current.get(id);
      if (vv) {
        vv.pause();
        vv.currentTime = 0;
      }
    };
  }, [hoveredProject]);

  // Filter projects
  useEffect(() => {
    let filtered = [...projects.flat()];

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((project) =>
        project.tags?.some((tag) => selectedTags.includes(tag.slug))
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title?.toLowerCase().includes(query) ||
          project.blurb?.toLowerCase().includes(query) ||
          project.client?.toLowerCase().includes(query) ||
          project.role_en?.toLowerCase().includes(query)
      );
    }

    // Grid system settings (First render(non dynamic))
    let displayedProjects = [];
    if (filtered.length > 4) {
      displayedProjects = filtered.slice(0, 4);
    } else {
      displayedProjects = filtered.slice(0, filtered.length);
    }

    if (selectedTags.length || searchQuery) {
      setFilteredProjects(displayedProjects);
    }
  }, [selectedTags, searchQuery, projects]);

  // Slider Script
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  useEffect(() => {
    if (emblaApi) {
      console.log(emblaApi.slideNodes()); // Access API
    }
  }, [emblaApi]);

  // Next Slide
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  // Previous Slide
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Catch Key Strokes for slide
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      scrollPrev();
    } else if (event.key === "ArrowRight") {
      scrollNext();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [scrollPrev, scrollNext]);

  const chunkArray = (arr: Project[], chunkSize: number) => {
    const chunks: Project[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const slides = chunkArray(filteredProjects, 4);

  return (
    <>
      {/* Gradient fade on right edge */}
      <div className="fixed right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      <div>
        <div className="grid grid-cols-12 bp-grid overflow-x-hidden">
          {/* Left Band - Fixed */}
          <div className="h-screen border-r border-border bg-card overflow-y-auto scrollbar-hide max-xl:col-span-12 col-span-3 bp-grid max-xl:h-auto z-10">
            <div
              className="relative h-full p-4 flex flex-col justify-center items-center"
              style={{
                paddingTop: width <= 1440 ? "40px" : "16px",
              }}
            >
              {/* Subtle grain overlay */}
              <div
                className="absolute inset-0 opacity-[0.015] pointer-events-none"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E\")",
                }}
              />

              <div className="relative space-y-8">
                {/* Category Info */}
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-black text-foreground leading-tight">
                    {category.name}
                  </h1>
                  {category.description && (
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>

                {/* Project Count */}
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {selectedTags.length > 0 || searchQuery
                      ? filteredProjects.length
                      : projects.length}{" "}
                  </span>{" "}
                  {(selectedTags.length > 0 || searchQuery
                    ? filteredProjects.length
                    : projects.length) === 1
                    ? "project"
                    : "projects"}{" "}
                  {(selectedTags.length > 0 || searchQuery) && " (filtered)"}
                </div>

                {/* Tags Filter - Always visible if tags exist */}
                {tagsList.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                        Filter by Tag
                      </h3>
                      {selectedTags.length > 0 && (
                        <button
                          onClick={clearFilters}
                          className="text-xs text-accent hover:text-accent/80 transition-colors"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tagsList.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => {
                            toggleTag(tag.slug);
                          }}
                          className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                            selectedTags.includes(tag.slug)
                              ? "bg-accent text-accent-foreground border-accent"
                              : "bg-background text-muted-foreground border-border hover:border-accent/50"
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keyboard Hint */}
                <div className="pt-8 border-t border-border max-md:hidden cursor-default">
                  <p className="text-xs text-muted-foreground">
                    Use{" "}
                    <kbd className="px-2 py-1 text-xs font-semibold bg-accent/10 border border-accent/20 rounded">
                      ←
                    </kbd>{" "}
                    <kbd className="px-2 py-1 text-xs font-semibold bg-accent/10 border border-accent/20 rounded">
                      →
                    </kbd>{" "}
                    to navigate, or scroll horizontally with mouse
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Masonry Grid with Horizontal Scroll */}
          {/* <div
            ref={scrollContainerRef}
            className="h-screen scrollbar-hide max-xl:col-span-12 col-span-9 transition-all duration-500"
            style={{
              scrollSnapType: "x mandatory",
              scrollBehavior: "smooth",
              transform: width > 768 ? "translateX(0vw)" : "initial",
            }}
          > */}
          {/* Horizontal scroll indicator */}
          {/* {filteredProjects.length >= 4 && (
            <HorizontalScrollIndicator containerRef={scrollContainerRef} />
          )} */}

          <div className="col-span-9">
            <div className="embla w-[100dvw]">
              <div className="embla__viewport" ref={emblaRef}>
                <div className="embla__container">
                  {slides?.map((projectsGroup: any, slideIndex: number) => {
                    const count = projectsGroup?.length;
                    const firstRow = projectsGroup?.slice(0, 2);
                    const secondRow = projectsGroup?.slice(2);

                    // First Row width/height settings
                    let widthValue = "40vw";
                    let heightValue = 250; // default fallback

                    if (count === 4 || count === 3) {
                      widthValue = "40vw";
                      heightValue = height * 0.5;
                    } else if (count === 2) {
                      widthValue = "40vw";
                      heightValue = height;
                    } else if (count === 1) {
                      widthValue = "100vw";
                      heightValue = height;
                    }

                    return (
                      <div className="embla_slide" key={slideIndex}>
                        {/* First Row */}
                        <div className="flex w-[100dvw]">
                          {firstRow.map((project: any, index: number) => (
                            <div
                              key={project.id}
                              style={{
                                width: widthValue,
                                height: `${heightValue}px`,
                              }}
                            >
                              <Link
                                href={`/projects/${project.slug}`}
                                className="group block relative h-full"
                                onMouseEnter={() =>
                                  handleProjectHover(project.id, true)
                                }
                                onMouseLeave={() =>
                                  handleProjectHover(project.id, false)
                                }
                                onFocus={() => setActiveProjectIndex(index)}
                                onClick={() => {
                                  scrollPositionManager.saveActiveProject(
                                    category.slug,
                                    project.slug,
                                    index
                                  );
                                }}
                              >
                                <div className="relative w-full h-full overflow-hidden bg-card">
                                  <Image
                                    src={project.cover_image}
                                    alt={project.title}
                                    fill
                                    className="object-cover"
                                    sizes="35vw"
                                  />
                                  {project.cover_video_url &&
                                    hoveredProject === project.id && (
                                      <video
                                        ref={(el) => {
                                          if (el)
                                            videoRefs.current.set(
                                              project.id,
                                              el
                                            );
                                        }}
                                        src={project.cover_video_url}
                                        className="absolute inset-0 w-full h-full object-cover z-10"
                                        loop
                                        muted
                                        playsInline
                                      />
                                    )}
                                  {project.project_type && (
                                    <div className="absolute left-4 top-4 z-30 px-2.5 py-1 text-[10px] uppercase tracking-widest bg-background/70 border border-border rounded-full text-foreground">
                                      {project.project_type}
                                    </div>
                                  )}
                                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-30">
                                    <h3 className="text-xl md:text-2xl font-bold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                                      {project.title}
                                    </h3>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          ))}
                        </div>

                        {/* Second Row */}
                        {count > 2 && secondRow.length > 0 && (
                          <div className="flex w-[100dvw]">
                            {secondRow.map((project: any, index: number) => {
                              let widthValue = "40vw";
                              let heightValue = height * 0.5;

                              if (count === 3) {
                                widthValue = "100vw";
                                heightValue = height * 0.5;
                              }

                              return (
                                <div
                                  key={project.id}
                                  style={{
                                    width: widthValue,
                                    height: `${heightValue}px`,
                                  }}
                                >
                                  <Link
                                    href={`/projects/${project.slug}`}
                                    className="group block relative h-full"
                                    onMouseEnter={() =>
                                      handleProjectHover(project.id, true)
                                    }
                                    onMouseLeave={() =>
                                      handleProjectHover(project.id, false)
                                    }
                                    onFocus={() =>
                                      setActiveProjectIndex(
                                        index + firstRow.length
                                      )
                                    }
                                    onClick={() => {
                                      scrollPositionManager.saveActiveProject(
                                        category.slug,
                                        project.slug,
                                        index + firstRow.length
                                      );
                                    }}
                                  >
                                    <div className="relative w-full h-full overflow-hidden bg-card">
                                      <Image
                                        src={project.cover_image}
                                        alt={project.title}
                                        fill
                                        className="object-cover"
                                        sizes="35vw"
                                      />
                                      {project.cover_video_url &&
                                        hoveredProject === project.id && (
                                          <video
                                            ref={(el) => {
                                              if (el)
                                                videoRefs.current.set(
                                                  project.id,
                                                  el
                                                );
                                            }}
                                            src={project.cover_video_url}
                                            className="absolute inset-0 w-full h-full object-cover z-10"
                                            loop
                                            muted
                                            playsInline
                                          />
                                        )}
                                      {project.project_type && (
                                        <div className="absolute left-4 top-4 z-30 px-2.5 py-1 text-[10px] uppercase tracking-widest bg-background/70 border border-border rounded-full text-foreground">
                                          {project.project_type}
                                        </div>
                                      )}
                                      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-30">
                                        <h3 className="text-xl md:text-2xl font-bold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                                          {project.title}
                                        </h3>
                                      </div>
                                    </div>
                                  </Link>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
