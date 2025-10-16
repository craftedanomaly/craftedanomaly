'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, ExternalLink, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BeforeAfterSlider } from '@/components/ui/before-after-slider';
import Link from 'next/link';
import Image from 'next/image';

interface Project {
  id: string;
  slug: string;
  title_en: string;
  title_tr: string;
  blurb_en: string;
  blurb_tr: string;
  content_en: string; // may be empty; content is now driven by blocks
  content_tr: string;
  cover_image: string;
  year: number;
  role_en: string;
  role_tr: string;
  client: string;
  categories: {
    id: string;
    slug: string;
    name_en: string;
    name_tr: string;
  };
}

interface Media {
  id: string;
  url: string;
  media_type: 'image' | 'video' | 'before_after';
  before_url?: string;
  after_url?: string;
  alt_text?: string;
  display_order: number;
}

interface Tag {
  id: string;
  slug: string;
  name: string;
}

interface ProjectDetailClientProps {
  project: Project;
  media: Media[];
  tags: Tag[];
  blocks: Array<{
    id: string;
    block_type: 'text' | 'image' | 'video' | 'gallery' | 'quote' | 'code' | 'embed';
    content_en: string;
    content_tr?: string;
    media_url?: string;
    media_urls?: string[];
    display_order: number;
  }>;
}

export function ProjectDetailClient({ project, media, tags, blocks }: ProjectDetailClientProps) {
  const [copied, setCopied] = useState(false);
  const title = project.title_en;
  const blurb = project.blurb_en;
  const role = project.role_en;
  const categoryName = project.categories?.name_en;

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: `${title} | Crafted Anomaly`, url });
      } else if (navigator.clipboard && url) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      // swallow errors (user cancelled share, permissions, etc.)
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        {project.cover_image && !project.cover_image.startsWith('blob:') && (
          <Image
            src={project.cover_image}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-8 left-8 z-10">
          <Link href={project.categories ? `/${project.categories.slug}` : `/`}>
            <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        {/* Project Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto max-w-screen-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              {/* Category Badge */}
              {project.categories && (
                <Link href={`/${project.categories.slug}`}>
                  <Badge variant="outline" className="mb-4 bg-background/80 backdrop-blur-sm hover:bg-accent/10">
                    {categoryName}
                  </Badge>
                </Link>
              )}

              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 font-heading">
                {title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-6">
                {blurb}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {role && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{role}</span>
                  </div>
                )}
                
                {project.client && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Client:</span>
                    <span>{project.client}</span>
                  </div>
                )}
                
                {project.year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{project.year}</span>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Fallback: render legacy HTML content if no blocks exist */}
            {(!blocks || blocks.length === 0) && project.content_en && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="prose prose-lg max-w-none dark:prose-invert mb-12"
                dangerouslySetInnerHTML={{ __html: project.content_en }}
              />
            )}

            {Array.isArray(blocks) && blocks.length > 0 && (
              <div className="space-y-10 mb-12">
                {blocks.sort((a, b) => a.display_order - b.display_order).map((block) => {
                  switch (block.block_type) {
                    case 'text':
                      return (
                        <motion.div
                          key={block.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="prose prose-lg max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: block.content_en || '' }}
                        />
                      );
                    case 'image':
                      return (
                        <motion.figure
                          key={block.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-3"
                        >
                          {block.media_url && (
                            <div className="relative aspect-video rounded-lg overflow-hidden">
                              <Image src={block.media_url} alt={block.content_en || title} fill className="object-cover" />
                            </div>
                          )}
                          {block.content_en && (
                            <figcaption className="text-sm text-muted-foreground text-center">{block.content_en}</figcaption>
                          )}
                        </motion.figure>
                      );
                    case 'video':
                      return (
                        <motion.div key={block.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          {block.media_url && (
                            <video src={block.media_url} controls className="w-full rounded-lg" />
                          )}
                          {block.content_en && (
                            <p className="text-sm text-muted-foreground text-center mt-2">{block.content_en}</p>
                          )}
                        </motion.div>
                      );
                    case 'gallery':
                      return (
                        <motion.div key={block.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(block.media_urls || []).map((url, idx) => (
                            <div key={`${block.id}-${idx}`} className="relative aspect-video rounded-lg overflow-hidden">
                              <Image src={url} alt={`${title} - ${idx + 1}`} fill className="object-cover" />
                            </div>
                          ))}
                        </motion.div>
                      );
                    case 'quote':
                      return (
                        <motion.blockquote key={block.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border-l-4 border-accent pl-4 italic text-lg text-foreground/90">
                          {block.content_en}
                        </motion.blockquote>
                      );
                    case 'code':
                      return (
                        <motion.pre key={block.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-muted/20 border border-border rounded-lg p-4 overflow-auto text-sm">
                          <code>{block.content_en}</code>
                        </motion.pre>
                      );
                    case 'embed':
                      return (
                        <motion.div key={block.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose max-w-none dark:prose-invert">
                          <div dangerouslySetInnerHTML={{ __html: block.content_en || '' }} />
                        </motion.div>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            )}

            {/* Media Gallery */}
            {media.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-8"
              >
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Project Gallery
                </h2>
                
                <div className="space-y-12">
                  {media.filter(m => !(m.url?.startsWith('blob:') || m.before_url?.startsWith('blob:') || m.after_url?.startsWith('blob:'))).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="space-y-4"
                    >
                      {item.media_type === 'before_after' && item.before_url && item.after_url ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-foreground">
                            Before & After Comparison
                          </h3>
                          <BeforeAfterSlider
                            beforeImage={item.before_url}
                            afterImage={item.after_url}
                            beforeAlt={`${title} - Before`}
                            afterAlt={`${title} - After`}
                            className="max-w-4xl mx-auto"
                          />
                          {item.alt_text && (
                            <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
                              {item.alt_text}
                            </p>
                          )}
                        </div>
                      ) : item.media_type === 'image' ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden max-w-4xl mx-auto">
                          <Image
                            src={item.url}
                            alt={item.alt_text || title}
                            fill
                            className="object-cover"
                          />
                          {item.alt_text && (
                            <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-3 rounded-lg backdrop-blur-sm">
                              <p className="text-sm">{item.alt_text}</p>
                            </div>
                          )}
                        </div>
                      ) : item.media_type === 'video' ? (
                        <div className="max-w-4xl mx-auto">
                          <video
                            src={item.url}
                            controls
                            className="w-full rounded-lg"
                          />
                          {item.alt_text && (
                            <p className="text-sm text-muted-foreground text-center mt-3">
                              {item.alt_text}
                            </p>
                          )}
                        </div>
                      ) : null}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-8 space-y-8"
            >
              {/* Project Details */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Project Details
                </h3>
                
                <div className="space-y-4">
                  {project.client && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Client
                      </dt>
                      <dd className="text-foreground">{project.client}</dd>
                    </div>
                  )}
                  
                  {role && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Role
                      </dt>
                      <dd className="text-foreground">{role}</dd>
                    </div>
                  )}
                  
                  {project.year && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Year
                      </dt>
                      <dd className="text-foreground">{project.year}</dd>
                    </div>
                  )}

                  {project.categories && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Category
                      </dt>
                      <dd>
                        <Link href={`/${project.categories.slug}`}>
                          <Badge variant="outline" className="hover:bg-accent/10">
                            {categoryName}
                          </Badge>
                        </Link>
                      </dd>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Tags
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Share Project
                </h3>
                
                <Button variant="outline" className="w-full" onClick={handleShare}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {copied ? 'Link Copied' : 'Copy Link'}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
