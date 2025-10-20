'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, ExternalLink, Play, Pause } from 'lucide-react';
import { getEmbedInfo } from '@/lib/video-utils';
import { Badge } from '@/components/ui/badge';
import { TestimonialsScroll } from './testimonials-scroll';
import { ContentBlocksRenderer } from './content-blocks-renderer';

interface ProjectDetailClientProps {
  project: {
    id: string;
    slug: string;
    title: string;
    blurb: string;
    content?: string | null;
    cover_image: string;
    cover_video_url?: string | null;
    testimonials?: string[] | null;
    year?: number | null;
    role_en?: string | null;
    role_tr?: string | null;
    client?: string | null;
    live_url?: string | null;
    status: string;
    categories?: {
      id: string;
      slug: string;
      name: string;
    } | null;
    project_categories?: Array<{
      categories: {
        id: string;
        slug: string;
        name: string;
      };
    }>;
  };
  media: Array<{
    id: string;
    url: string;
    media_type: string;
    display_order: number;
    layout?: 'single' | 'masonry' | null;
  }>;
  tags: Array<{
    id: string;
    slug: string;
    name: string;
  }>;
  blocks: Array<{
    id: string;
    block_type: string;
    content?: string | null;
    media_url?: string | null;
    media_urls?: string[] | null;
    display_order: number;
  }>;
}

function JustifiedGrid({ items, alt }: { items: Array<{ id: string; url: string }>; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<
    Array<{ id: string; url: string; width: number; height: number }>
  >([]);

  useEffect(() => {
    let disposed = false;

    const compute = async () => {
      const el = containerRef.current;
      if (!el) return;

      const containerWidth = el.clientWidth;
      if (containerWidth <= 0) return;

      // target row height responsive
      const vw = window.innerWidth;
      const targetRowHeight = vw >= 1536 ? 520 : vw >= 1280 ? 460 : vw >= 1024 ? 400 : vw >= 768 ? 360 : 280;
      const gap = 0;

      // load natural sizes
      const ratios = await Promise.all(
        items.map(
          (it) =>
            new Promise<{ id: string; url: string; ratio: number }>((resolve) => {
              const img = new Image();
              img.onload = () => {
                const r = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1.7778;
                resolve({ id: it.id, url: it.url, ratio: r });
              };
              img.onerror = () => resolve({ id: it.id, url: it.url, ratio: 1.7778 });
              img.src = it.url;
            })
        )
      );

      const next: Array<{ id: string; url: string; width: number; height: number }> = [];
      let row: typeof ratios = [];
      let rowWidth = 0;

      const pushRow = () => {
        if (row.length === 0) return;
        const baseWidth = row.reduce((sum, it) => sum + it.ratio * targetRowHeight, 0);
        const totalGaps = gap * Math.max(row.length - 1, 0);
        const scale = (containerWidth - totalGaps) / baseWidth;
        const h = Math.max(160, targetRowHeight * scale);
        for (const it of row) {
          next.push({
            id: it.id,
            url: it.url,
            width: Math.round(it.ratio * h),
            height: Math.round(h),
          });
        }
        row = [];
        rowWidth = 0;
      };

      for (const it of ratios) {
        const w = it.ratio * targetRowHeight;
        // if next item would overflow, finalize row then start new
        if (rowWidth + w + (row.length > 0 ? gap : 0) > containerWidth && row.length > 0) {
          pushRow();
        }
        row.push(it);
        rowWidth += w + (row.length > 1 ? gap : 0);
      }

      // finalize last row: also fill to width for consistent look
      pushRow();

      if (!disposed) setLayout(next);
    };

    compute();

    const ro = new ResizeObserver(() => compute());
    if (containerRef.current) ro.observe(containerRef.current);
    const onResize = () => compute();
    window.addEventListener('resize', onResize);
    return () => {
      disposed = true;
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [items]);

  // Render as wrapped rows using explicit sizes
  return (
    <div ref={containerRef} className="w-full">
      <div className="flex flex-wrap gap-0">
        {layout.map((it) => (
          <img key={it.id} src={it.url} alt={alt} style={{ width: it.width, height: it.height }} className="block" />
        ))}
      </div>
    </div>
  );
}

export default function ProjectDetailClient({ project, media, tags, blocks }: ProjectDetailClientProps) {

  const orderedMedia = useMemo(
    () => media.filter((item) => item.url && !item.url.startsWith('blob:')).sort((a, b) => a.display_order - b.display_order),
    [media]
  );

  const categorySlug = project.categories?.slug;
  const categoryName = project.categories?.name;
  const projectRole = project.role_en || project.role_tr || undefined;
  
  const allCategories = project.project_categories?.map(pc => pc.categories) || 
    (project.categories ? [project.categories] : []);

  const galleryItems = useMemo(() => {
    return orderedMedia.filter((item) => item.url !== project.cover_image);
  }, [orderedMedia, project.cover_image]);

  

  const [isPlaying, setIsPlaying] = useState(false);
  const embedInfo = useMemo(() => getEmbedInfo(project.cover_video_url || ''), [project.cover_video_url]);

  // Split gallery items by layout
  const singleItems = useMemo(() => {
    return galleryItems.filter((m) => (m.layout || 'masonry') === 'single');
  }, [galleryItems]);
  const masonryItems = useMemo(() => {
    return galleryItems.filter((m) => (m.layout || 'masonry') === 'masonry');
  }, [galleryItems]);

  // Only textual blocks for left column
  const textBlocks = useMemo(() => {
    const allowed = new Set(['text', 'quote', 'code']);
    return blocks.filter((b) => allowed.has(b.block_type));
  }, [blocks]);

  // Normalize before/after blocks coming from gallery marker
  const normalizedBeforeAfterBlocks = useMemo(() => {
    return blocks
      .filter((b) => b.block_type === 'before_after' || (b.block_type === 'gallery' && b.content === '__before_after__'))
      .map((b) => ({
        ...b,
        block_type: 'before_after',
      }));
  }, [blocks]);

  const videoBlocks = useMemo(() => {
    return blocks.filter((b) => b.block_type === 'video' && !!b.media_url);
  }, [blocks]);

  // Right panel ref to coordinate scroll
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rightRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (window.innerWidth < 1024) return; // only lg+
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
        return; // allow default to bubble to page
      }
      e.preventDefault();
      el.scrollTop += e.deltaY;
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel as any);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="w-full lg:h-screen lg:overflow-hidden" style={{ paddingLeft: '1%', paddingRight: '1%' }}>
        <div className="flex flex-col lg:flex-row lg:h-full gap-0">
          {/* Left fixed info panel */}
          <section className="shrink-0 w-full lg:w-[32%] xl:w-[30%] lg:h-full overflow-hidden lg:border-r border-border/40">
            <div className="h-full flex flex-col py-8 pr-6">
              <Link
                href={categorySlug ? `/${categorySlug}` : '/'}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to {categoryName || 'Home'}
              </Link>

              {allCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {allCategories.map((category) => (
                    <Badge
                      key={category.id}
                      variant="outline"
                      className="cursor-pointer border-border/60 bg-background/60 text-xs uppercase tracking-widest transition hover:bg-accent/20"
                      asChild
                    >
                      <Link href={`/${category.slug}`}>
                        {category.name}
                      </Link>
                    </Badge>
                  ))}
                </div>
              )}

              <motion.h1 layout className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                {project.title}
              </motion.h1>

              {project.blurb && (
                <p className="text-base lg:text-lg leading-relaxed text-muted-foreground mb-8">
                  {project.blurb}
                </p>
              )}

            <dl className="grid gap-4 text-sm text-muted-foreground">
              {project.client && (
                <div>
                  <dt className="font-semibold uppercase tracking-widest text-xs text-muted-foreground/80">Client</dt>
                  <dd className="mt-1 text-foreground">{project.client}</dd>
                </div>
              )}
              {project.year && (
                <div>
                  <dt className="font-semibold uppercase tracking-widest text-xs text-muted-foreground/80">Year</dt>
                  <dd className="mt-1 inline-flex items-center gap-2 text-foreground">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {project.year}
                  </dd>
                </div>
              )}
              {projectRole && (
                <div>
                  <dt className="font-semibold uppercase tracking-widest text-xs text-muted-foreground/80">Role</dt>
                  <dd className="mt-1 inline-flex items-center gap-2 text-foreground">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {projectRole}
                  </dd>
                </div>
              )}
              {project.live_url && (
                <div>
                  <dt className="font-semibold uppercase tracking-widest text-xs text-muted-foreground/80">Live Link</dt>
                  <dd className="mt-1 inline-flex items-center gap-2 text-foreground">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-4 transition hover:underline"
                    >
                      Visit project
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            {tags.length > 0 && (
              <div className="space-y-3">
                <dt className="font-semibold uppercase tracking-widest text-xs text-muted-foreground/80">Tags</dt>
                <dd className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="border-border/60 bg-background/60 text-xs uppercase tracking-wide">
                      {tag.name}
                    </Badge>
                  ))}
                </dd>
              </div>
            )}
            {(project.content || textBlocks.length > 0) && (
              <div className="space-y-8 mt-8 pr-2">
                {project.content && (
                  <div className="prose prose-sm lg:prose lg:max-w-none text-foreground/90">
                    <div dangerouslySetInnerHTML={{ __html: project.content }} />
                  </div>
                )}
                {textBlocks.length > 0 && (
                  <ContentBlocksRenderer
                    blocks={textBlocks as any}
                  />
                )}
              </div>
            )}
            </div>
          </section>

          {/* Right scrollable column */}
          <aside ref={rightRef} className="flex-1 lg:min-h-0 lg:h-full lg:overflow-y-auto scrollbar-hide overscroll-contain">
            {/* Cover at top, edge-to-edge */}
            {project.cover_image && (
              <div className="relative">
                {isPlaying && project.cover_video_url ? (
                  embedInfo.kind === 'direct' ? (
                    <video className="w-full h-auto bg-black" src={embedInfo.embedUrl} autoPlay muted playsInline />
                  ) : embedInfo.embedUrl ? (
                    <div className="w-full aspect-video">
                      <iframe
                        src={embedInfo.embedUrl}
                        className="w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        frameBorder={0}
                      />
                    </div>
                  ) : null
                ) : (
                  <img src={project.cover_image} alt={project.title} className="block w-full h-auto" />
                )}
                {project.cover_video_url && (
                  <button
                    type="button"
                    onClick={() => setIsPlaying((p) => !p)}
                    className="absolute bottom-3 right-3 z-10 h-12 w-12 rounded-full bg-white/85 text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    aria-label={isPlaying ? 'Pause cover video' : 'Play cover video'}
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </button>
                )}
              </div>
            )}

            {/* Testimonials directly under cover */}
            {project.testimonials && project.testimonials.length > 0 && (
              <TestimonialsScroll testimonials={project.testimonials} />
            )}

            {/* Single (edge-to-edge) images in order */}
            {singleItems.map((m) => (
              <div key={m.id} className="w-full">
                <img src={m.url} alt={project.title} className="block w-full h-auto" />
              </div>
            ))}

            {/* Content-block videos as singles */}
            {videoBlocks.map((b) => (
              <div key={`vb-${b.id}`} className="w-full">
                <video src={b.media_url!} className="w-full h-auto" controls playsInline />
              </div>
            ))}

            {/* Content-block before/after as singles (use renderer for slider) */}
            {normalizedBeforeAfterBlocks.map((b) => (
              <div key={`ba-${b.id || b.display_order}`} className="w-full">
                <ContentBlocksRenderer blocks={[b] as any} />
              </div>
            ))}

            {/* Justified rows for masonry items and image-type content blocks */}
            {(() => {
              const items = [
                ...masonryItems.map((m) => ({ id: m.id, url: m.url })),
                ...blocks.flatMap((b) => (b.block_type === 'image' && b.media_url ? [{ id: `b-${b.id}`, url: b.media_url }] : [] as Array<{ id: string; url: string }>)),
              ];
              return <JustifiedGrid items={items} alt={project.title} />;
            })()}
          </aside>
        </div>
      </div>

    </div>
  );
}
