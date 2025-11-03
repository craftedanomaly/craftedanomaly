'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ArrowUpRight, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTransition } from '@/lib/motion-constants';
import { scrollPositionManager } from '@/lib/scroll-position-manager';

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

export function CategoryPageClient({ category, projects, availableTags }: CategoryPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const derivedTags = useMemo(() => {
    const map = new Map<string, Tag>();
    (projects || []).forEach((p) => {
      (p.tags || []).forEach((t) => {
        if (t && t.id) map.set(t.id, t);
      });
    });
    return Array.from(map.values());
  }, [projects]);

  const tagsList = (availableTags && availableTags.length > 0) ? availableTags : derivedTags;

  // Group projects into slides of 4 (2x2) for desktop view
  const slidesOfFour = useMemo(() => {
    const chunks: Project[][] = [];
    for (let i = 0; i < filteredProjects.length; i += 4) {
      chunks.push(filteredProjects.slice(i, i + 4));
    }
    return chunks;
  }, [filteredProjects]);

  // Restore scroll position on mount
  useEffect(() => {
    const savedPosition = scrollPositionManager.getPosition(category.slug);
    if (savedPosition && scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = savedPosition.scrollLeft;
          if (savedPosition.projectIndex !== undefined) {
            setActiveProjectIndex(savedPosition.projectIndex);
          }
        }
      }, 100);
    }
  }, [category.slug]);

  // Save scroll position on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      scrollPositionManager.savePosition(
        category.slug,
        container.scrollLeft,
        filteredProjects[activeProjectIndex]?.slug,
        activeProjectIndex
      );
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [category.slug, activeProjectIndex, filteredProjects]);

  // Mouse wheel horizontal scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Convert vertical scroll to horizontal
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Initialize from URL
  useEffect(() => {
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      const tags = tagsParam.split(',').filter(Boolean);
      setSelectedTags(tags);
    }
  }, [searchParams]);

  // Filter projects
  useEffect(() => {
    let filtered = [...projects];

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(project => 
        project.tags?.some(tag => selectedTags.includes(tag.slug))
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.blurb.toLowerCase().includes(query) ||
        project.client.toLowerCase().includes(query) ||
        project.role_en.toLowerCase().includes(query)
      );
    }

    setFilteredProjects(filtered);
  }, [selectedTags, searchQuery, projects]);

  // Update URL when tags change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','));
    } else {
      params.delete('tags');
    }

    router.replace(`/${category.slug}?${params.toString()}`, { scroll: false });
  }, [selectedTags, category.slug, router, searchParams]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && activeProjectIndex > 0) {
        e.preventDefault();
        const newIndex = activeProjectIndex - 1;
        setActiveProjectIndex(newIndex);
        scrollToProject(newIndex);
      } else if (e.key === 'ArrowRight' && activeProjectIndex < filteredProjects.length - 1) {
        e.preventDefault();
        const newIndex = activeProjectIndex + 1;
        setActiveProjectIndex(newIndex);
        scrollToProject(newIndex);
      } else if (e.key === 'Enter' && filteredProjects[activeProjectIndex]) {
        e.preventDefault();
        router.push(`/projects/${filteredProjects[activeProjectIndex].slug}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProjectIndex, filteredProjects, router]);

  const scrollToProject = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const projectCards = container.querySelectorAll('[data-project-card]');
    const targetCard = projectCards[index] as HTMLElement;
    
    if (targetCard) {
      targetCard.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  };

  const toggleTag = (tagSlug: string) => {
    setSelectedTags(prev => 
      prev.includes(tagSlug)
        ? prev.filter(slug => slug !== tagSlug)
        : [...prev, tagSlug]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };

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
      v.play().catch(err => console.debug('Video play skipped:', err));
    }
    return () => {
      const vv = videoRefs.current.get(id);
      if (vv) {
        vv.pause();
        vv.currentTime = 0;
      }
    };
  }, [hoveredProject]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {/* Left Band - Fixed */}
      <div className="fixed left-0 top-0 h-screen w-[25vw] border-r border-border bg-card overflow-y-auto scrollbar-hide">
        <div className="relative h-full p-8 md:p-12">
          {/* Subtle grain overlay */}
          <div 
            className="absolute inset-0 opacity-[0.015] pointer-events-none"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
            }}
          />

          <div className="relative space-y-8">
            {/* Back Link */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>

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
              <span className="font-semibold text-foreground">{filteredProjects.length}</span>
              {' '}
              {filteredProjects.length === 1 ? 'project' : 'projects'}
              {(selectedTags.length > 0 || searchQuery) && ' (filtered)'}
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
                      onClick={() => toggleTag(tag.slug)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                        selectedTags.includes(tag.slug)
                          ? 'bg-accent text-accent-foreground border-accent'
                          : 'bg-background text-muted-foreground border-border hover:border-accent/50'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Keyboard Hint */}
            <div className="pt-8 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Use{' '}
                <kbd className="px-2 py-1 text-xs font-semibold bg-accent/10 border border-accent/20 rounded">
                  ←
                </kbd>
                {' '}
                <kbd className="px-2 py-1 text-xs font-semibold bg-accent/10 border border-accent/20 rounded">
                  →
                </kbd>
                {' '}
                to navigate, or scroll horizontally with mouse
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Masonry Grid with Horizontal Scroll */}
      <div 
        ref={scrollContainerRef}
        className="fixed left-[25vw] top-0 right-0 h-screen overflow-x-auto overflow-y-hidden scrollbar-hide bg-background"
        style={{ scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
      >
        {/* Gradient fade on right edge */}
        <div className="fixed right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none z-50" />
        <div className="h-full flex gap-0 min-w-max">
          {filteredProjects.length === 0 ? (
            <div className="flex items-center justify-center h-full w-[50vw]">
              <div className="text-center space-y-4">
                <p className="text-lg text-muted-foreground">No projects found</p>
                {selectedTags.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-accent hover:text-accent/80 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredProjects.length >= 4 ? (
              // Slides of 4 (2x2 grid)
              slidesOfFour.map((group, sIndex) => (
                <motion.div
                  key={`slide-${sIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: sIndex * 0.05, ...getTransition('primary') }}
                  className="flex-shrink-0 h-full"
                  style={{ width: 'calc(100vw - 25vw)', scrollSnapAlign: 'start' }}
                >
                  <div className="grid grid-cols-2 grid-rows-2 gap-0 h-full">
                    {group.map((project, index) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.slug}`}
                        className="group relative overflow-hidden"
                        onMouseEnter={() => handleProjectHover(project.id, true)}
                        onMouseLeave={() => handleProjectHover(project.id, false)}
                        onClick={() => {
                          scrollPositionManager.saveActiveProject(category.slug, project.slug, (sIndex * 4) + index);
                        }}
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={project.cover_image}
                            alt={project.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 50vw, 50vw"
                            priority={sIndex === 0}
                          />
                          {project.cover_video_url && hoveredProject === project.id && (
                            <video
                              ref={el => { if (el) videoRefs.current.set(project.id, el); }}
                              src={project.cover_video_url}
                              className="absolute inset-0 w-full h-full object-cover z-10"
                              loop
                              muted
                              playsInline
                            />
                          )}
                          {/* Overlays */}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent z-20" />
                          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500 z-20" />
                          {/* Project type badge */}
                          {project.project_type && (
                            <div className="absolute left-4 top-4 z-30 px-2.5 py-1 text-[10px] uppercase tracking-widest bg-background/70 border border-border rounded-full text-foreground">
                              {project.project_type}
                            </div>
                          )}
                          <div className="absolute inset-0 flex flex-col justify-end p-5 z-30">
                            <h3 className="text-lg md:text-xl font-bold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                              {project.title}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              // Fallback: render as current single-column cards
              filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  data-project-card
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03, ...getTransition('primary') }}
                  className="flex-shrink-0 h-full"
                  style={{ width: '35vw' }}
                >
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group block relative h-full"
                    onMouseEnter={() => handleProjectHover(project.id, true)}
                    onMouseLeave={() => handleProjectHover(project.id, false)}
                    onFocus={() => setActiveProjectIndex(index)}
                    onClick={() => {
                      scrollPositionManager.saveActiveProject(category.slug, project.slug, index);
                    }}
                  >
                    <div className="relative w-full h-full overflow-hidden bg-card">
                      <Image src={project.cover_image} alt={project.title} fill className="object-cover" sizes="35vw" />
                      {project.cover_video_url && hoveredProject === project.id && (
                        <video
                          ref={el => { if (el) videoRefs.current.set(project.id, el); }}
                          src={project.cover_video_url}
                          className="absolute inset-0 w-full h-full object-cover z-10"
                          loop muted playsInline
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent z-20" />
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500 z-20" />
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
                </motion.div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}
