'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface ContentBlock {
  id?: string;
  block_type: string;
  content?: string;
  media_url?: string;
  media_urls?: string[];
  display_order: number;
}

interface ContentBlocksRendererProps {
  blocks: ContentBlock[];
}

export function ContentBlocksRenderer({ blocks }: ContentBlocksRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  const CompareSlider = ({ beforeUrl, afterUrl, description }: { beforeUrl: string; afterUrl: string; description?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [percent, setPercent] = useState(50);
    const [dragging, setDragging] = useState(false);

    const updateFromEvent = (clientX: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      setPercent(Math.round((x / rect.width) * 100));
    };

    return (
      <div className="space-y-3">
        <div
          ref={containerRef}
          className="relative aspect-video rounded-lg overflow-hidden select-none cursor-col-resize"
          onMouseDown={(e) => { setDragging(true); updateFromEvent(e.clientX); }}
          onMouseMove={(e) => { if (dragging) updateFromEvent(e.clientX); }}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          onTouchStart={(e) => { if (e.touches[0]) { e.preventDefault(); updateFromEvent(e.touches[0].clientX); } }}
          onTouchMove={(e) => { if (e.touches[0]) { e.preventDefault(); updateFromEvent(e.touches[0].clientX); } }}
        >
          {/* After image (background) */}
          <Image src={afterUrl} alt="After" fill className="object-cover" />

          {/* Before image (clipped via clip-path to avoid image shifting) */}
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - percent}% 0 0)`, willChange: 'clip-path' }}
          >
            <Image src={beforeUrl} alt="Before" fill className="object-cover" />
          </div>

          {/* Divider handle */}
          <div
            className="absolute top-0 bottom-0"
            style={{ left: `${percent}%`, transform: 'translateX(-50%)' }}
          >
            <div className="h-full w-[2px] bg-white/70 shadow" />
            <div className="absolute top-1/2 -translate-y-1/2 -ml-3 flex items-center gap-1">
              <div className="h-6 w-6 rounded-full bg-white/90 shadow border border-black/10 flex items-center justify-center text-xs text-black">⇔</div>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute left-3 top-3 text-xs font-medium px-2 py-1 rounded bg-black/60 text-white">Before</div>
          <div className="absolute right-3 top-3 text-xs font-medium px-2 py-1 rounded bg-black/60 text-white">After</div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    );
  };

  const renderBlock = (block: ContentBlock, index: number) => {
    const baseAnimation = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: index * 0.1 }
    };

    switch (block.block_type) {
      case 'text':
        return (
          <motion.div {...baseAnimation} className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: block.content || '' }} />
          </motion.div>
        );

      case 'image':
        return (
          <motion.div {...baseAnimation} className="relative aspect-video rounded-lg overflow-hidden">
            {block.media_url && (
              <Image
                src={block.media_url}
                alt=""
                fill
                className="object-cover"
              />
            )}
          </motion.div>
        );

      case 'gallery':
        return (
          <motion.div
            {...baseAnimation}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {block.media_urls?.map((url, idx) => (
              <div
                key={idx}
                className="relative w-full h-[320px] rounded-lg overflow-hidden border border-orange-500 dark:border-white bg-background/30 dark:bg-background/60"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                />
              </div>
            ))}
          </motion.div>
        );

      case 'video':
        if (block.media_url) {
          const raw = String(block.media_url || '').trim();
          const url = raw;
          const lower = url.toLowerCase();
          const isYouTube = lower.includes('youtu'); // covers youtube.com, youtu.be, shorts
          const isVimeo = lower.includes('vimeo.com');

          if (isYouTube) {
            const getYouTubeId = (u: string) => {
              try {
                const parsed = new URL(u);
                const host = parsed.hostname.toLowerCase();
                if (host.includes('youtu.be')) {
                  // /<id>
                  const seg = parsed.pathname.split('/').filter(Boolean)[0];
                  if (seg && seg.length === 11) return seg;
                }
                if (parsed.pathname.startsWith('/watch')) {
                  const v = parsed.searchParams.get('v');
                  if (v && v.length === 11) return v;
                }
                // /embed/<id>, /v/<id>, /shorts/<id>
                const parts = parsed.pathname.split('/').filter(Boolean);
                const idx = parts.findIndex(p => ['embed', 'v', 'shorts'].includes(p));
                if (idx !== -1 && parts[idx + 1] && parts[idx + 1].length === 11) return parts[idx + 1];
              } catch {}
              // Regex fallback
              const regExp = /^.*(?:youtu\.be\/|shorts\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11}).*/;
              const match = u.match(regExp);
              return match ? match[1] : null;
            };
            const id = getYouTubeId(url);
            if (id) {
              return (
                <motion.div {...baseAnimation} className="relative aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${id}?rel=0`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </motion.div>
              );
            }
          }

          if (isVimeo) {
            const getVimeoId = (u: string) => {
              const m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
              return m ? m[1] : null;
            };
            const id = getVimeoId(url);
            if (id) {
              return (
                <motion.div {...baseAnimation} className="relative aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={`https://player.vimeo.com/video/${id}`}
                    title="Vimeo video player"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </motion.div>
              );
            }
          }

          // Fallback to direct video
          return (
            <motion.div {...baseAnimation} className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <video
                controls
                className="w-full h-full"
                poster={block.content || undefined}
              >
                <source src={url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </motion.div>
          );
        }
        return null;

      case 'embed':
        // Handle YouTube embeds
        if (block.content?.includes('youtube.com') || block.content?.includes('youtu.be')) {
          const getYouTubeId = (url: string) => {
            // Support shorts and other URL patterns, capture exactly 11-char ID
            const regExp = /^.*(?:youtu\.be\/|shorts\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11}).*/;
            const match = url.match(regExp);
            return match ? match[1] : null;
          };

          const videoId = getYouTubeId(block.content);
          
          if (videoId) {
            return (
              <motion.div {...baseAnimation} className="relative aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full h-full"
                />
              </motion.div>
            );
          }
        }

        // Handle Vimeo embeds
        if (block.content?.includes('vimeo.com')) {
          const getVimeoId = (url: string) => {
            // Matches vimeo.com/123456789 or player.vimeo.com/video/123456789
            const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
            return m ? m[1] : null;
          };
          const vimeoId = getVimeoId(block.content);
          if (vimeoId) {
            return (
              <motion.div {...baseAnimation} className="relative aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={`https://player.vimeo.com/video/${vimeoId}`}
                  title="Vimeo video player"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full h-full"
                />
              </motion.div>
            );
          }
        }

        // Handle other embeds
        return (
          <motion.div {...baseAnimation} className="relative aspect-video rounded-lg overflow-hidden">
            <div dangerouslySetInnerHTML={{ __html: block.content || '' }} />
          </motion.div>
        );

      case 'quote':
        return (
          <motion.div {...baseAnimation} className="border-l-4 border-primary pl-6 py-4">
            <blockquote className="text-xl italic text-muted-foreground">
              "{block.content}"
            </blockquote>
          </motion.div>
        );

      case 'code':
        return (
          <motion.div {...baseAnimation} className="bg-muted rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm">
              <code>{block.content}</code>
            </pre>
          </motion.div>
        );

      case 'before_after': {
        const beforeUrl = block.media_urls?.[0];
        const afterUrl = block.media_urls?.[1];
        if (!beforeUrl && !afterUrl) return null;

        if (beforeUrl && afterUrl) {
          return (
            <motion.div {...baseAnimation}>
              <CompareSlider 
                beforeUrl={beforeUrl} 
                afterUrl={afterUrl} 
                description={block.content && block.content !== '__before_after__' ? block.content : undefined} 
              />
            </motion.div>
          );
        }

        const singleUrl = beforeUrl || afterUrl!;
        const singleLabel = beforeUrl ? 'Before' : 'After';
        return (
          <motion.div {...baseAnimation} className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">{singleLabel}</h4>
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image src={singleUrl} alt={singleLabel} fill className="object-cover" />
              </div>
            </div>
          </motion.div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {blocks
        .sort((a, b) => a.display_order - b.display_order)
        .map((block, index) => (
          <div key={block.id || index}>
            {renderBlock(block, index)}
          </div>
        ))}
    </div>
  );
}
