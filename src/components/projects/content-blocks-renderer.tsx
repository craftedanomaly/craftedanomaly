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
          <motion.div {...baseAnimation} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {block.media_urls?.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </motion.div>
        );

      case 'video':
        return (
          <motion.div {...baseAnimation} className="relative aspect-video rounded-lg overflow-hidden bg-black">
            {block.media_url && (
              <video
                controls
                className="w-full h-full"
                poster={block.content || undefined}
              >
                <source src={block.media_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </motion.div>
        );

      case 'embed':
        // Handle YouTube embeds
        if (block.content?.includes('youtube.com') || block.content?.includes('youtu.be')) {
          const getYouTubeId = (url: string) => {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
          };

          const videoId = getYouTubeId(block.content);
          
          if (videoId) {
            return (
              <motion.div {...baseAnimation} className="relative aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
              <CompareSlider beforeUrl={beforeUrl} afterUrl={afterUrl} description={block.content} />
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
