'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ContentBlocksRenderer } from './content-blocks-renderer';

interface ProjectDetailClientProps {
  project: {
    id: string;
    slug: string;
    title: string;
    blurb: string;
    content?: string | null;
    cover_image: string;
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

  const leftRef = useRef<HTMLDivElement>(null);
  const [leftHeight, setLeftHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = leftRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        if (h && h !== leftHeight) setLeftHeight(h);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [leftRef]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero with Title Overlay */}
      {project.cover_image && (
        <div className="relative h-[70vh] w-full overflow-hidden">
          <Image
            src={project.cover_image}
            alt={project.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Title and Description Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-16">
            <div className="max-w-4xl">
              <Link
                href={categorySlug ? `/${categorySlug}` : '/'}
                className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white mb-6"
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
                      className="cursor-pointer border-white/30 bg-white/10 text-white text-xs uppercase tracking-widest transition hover:bg-white/20"
                      asChild
                    >
                      <Link href={`/${category.slug}`}>
                        {category.name}
                      </Link>
                    </Badge>
                  ))}
                </div>
              )}

              <motion.h1
                layout
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6"
              >
                {project.title}
              </motion.h1>

              {project.blurb && (
                <p className="text-lg lg:text-xl leading-relaxed text-white/90 max-w-3xl">
                  {project.blurb}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="w-full py-12 lg:py-20" style={{ paddingLeft: '5%', paddingRight: '1%' }}>
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[minmax(0,2.3fr)_minmax(0,2.7fr)]">
          {/* Text column */}
          <section ref={leftRef} className="space-y-10">

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

            {(project.content || blocks.length > 0) && (
              <div className="space-y-10">
                {project.content && (
                  <div className="prose prose-lg max-w-none text-foreground/90">
                    <div dangerouslySetInnerHTML={{ __html: project.content }} />
                  </div>
                )}
                {blocks.length > 0 && (
                  <ContentBlocksRenderer
                    blocks={blocks.map((block) => {
                      const isBeforeAfterMarker = block.block_type === 'gallery' && block.content === '__before_after__';
                      const mapped = isBeforeAfterMarker
                        ? { ...block, block_type: 'before_after', content: undefined }
                        : block;
                      return {
                        ...mapped,
                        content: mapped.content ?? undefined,
                        media_url: mapped.media_url ?? undefined,
                        media_urls: mapped.media_urls ?? undefined,
                      } as any;
                    })}
                  />
                )}
              </div>
            )}
          </section>

          {/* Gallery column */}
          <aside className="lg:overflow-y-auto lg:pr-2 scrollbar-hide" style={{ height: leftHeight ? `${leftHeight}px` : undefined }}>
            <div className="grid gap-6">
              {galleryItems.map((item, index) => (
                <div
                  key={item.id}
                  className="relative block overflow-hidden rounded-2xl"
                >
                  <Image
                    src={item.url}
                    alt={`${project.title} image ${index + 1}`}
                    width={1200}
                    height={800}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>

    </div>
  );
}
