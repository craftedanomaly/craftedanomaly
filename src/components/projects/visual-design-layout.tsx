"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
} from "framer-motion";

interface CategoryRelation {
  categories: {
    id: string;
    slug: string;
    name: string;
  };
}

interface MediaItem {
  id: string;
  url: string;
  media_type: string;
  display_order: number;
}

interface VisualDesignLayoutProps {
  project: {
    id: string;
    slug: string;
    title: string;
    blurb: string;
    year?: number | null;
    role_en?: string | null;
    client?: string | null;
    project_type?: string | null;
    background_color?: string | null;
    project_categories?: CategoryRelation[];
  };
  media: MediaItem[];
  tags: Array<{
    id: string;
    slug: string;
    name: string;
  }>;
  blocks: Array<{
    id: string;
    block_type: string;
    content: any;
    display_order: number;
  }>;
}

export function VisualDesignLayout({
  project,
  media,
  tags,
  blocks,
}: VisualDesignLayoutProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const contentBlocksRef = useRef<HTMLDivElement>(null);
  const infoGroupRef = useRef<HTMLDivElement>(null);
  const infoContainerRef = useRef<HTMLDivElement>(null);
  const blurbRef = useRef<HTMLParagraphElement>(null);
  const [totalWidth, setTotalWidth] = useState(0);
  const [vw, setVw] = useState(0);
  const [vh, setVh] = useState(0);
  const [slideWidths, setSlideWidths] = useState<number[]>([]);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [contentHasOverflow, setContentHasOverflow] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [safeInfoTop, setSafeInfoTop] = useState(96);
  const [safeBlocksTop, setSafeBlocksTop] = useState(220);
  const [collapsedBlocksTop, setCollapsedBlocksTop] = useState(0);
  const [detailsHeight, setDetailsHeight] = useState(0);
  const [blurbHeight, setBlurbHeight] = useState(0);

  // Hide scroll hint on first scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollHint(false);
      window.removeEventListener("scroll", handleScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle mouse wheel on testimonials to prevent page scroll (slower with easing)
  useEffect(() => {
    const testimonialsEl = testimonialsRef.current;
    if (!testimonialsEl) return;

    let isScrolling = false;
    let scrollTarget = testimonialsEl.scrollLeft;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Faster scroll speed (60% of original, increased from 30%)
      scrollTarget += e.deltaY * 0.6;

      if (!isScrolling) {
        isScrolling = true;

        const smoothScroll = () => {
          const current = testimonialsEl.scrollLeft;
          const diff = scrollTarget - current;

          // Ease out effect
          if (Math.abs(diff) > 0.5) {
            testimonialsEl.scrollLeft = current + diff * 0.2;
            requestAnimationFrame(smoothScroll);
          } else {
            testimonialsEl.scrollLeft = scrollTarget;
            isScrolling = false;
          }
        };

        requestAnimationFrame(smoothScroll);
      }
    };

    testimonialsEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => testimonialsEl.removeEventListener("wheel", handleWheel);
  }, []);

  const categorySlug =
    project.project_categories?.[0]?.categories?.slug || "visual-design";
  const backgroundColor = project.background_color || "#0b0b0c";
  const textColor = (project as any).text_color || "#ffffff";

  const imageMedia = useMemo(() => {
    const filtered = media.filter((item) =>
      isRenderableImage(item.url, item.media_type)
    );

    // Add cover image as first item if it exists and is not already in media
    const coverImage = (project as any).cover_image;
    if (coverImage) {
      const coverExists = filtered.some((item) => item.url === coverImage);
      if (!coverExists) {
        filtered.unshift({
          id: "cover-image",
          url: coverImage,
          media_type: "image",
          display_order: -1,
        } as any);
      }
    }

    return filtered;
  }, [media, project]);

  // Merge images and content blocks into a linear timeline
  const sections = useMemo(() => {
    const combined: Array<{
      type: "image" | "text";
      data: any;
      order: number;
    }> = [];

    // Add images
    imageMedia.forEach((img, idx) => {
      combined.push({
        type: "image",
        data: img,
        order: img.display_order || idx,
      });
    });

    // Add overlay/content blocks (text, quotes, videos, before/after, testimonials) by order
    blocks.forEach((block) => {
      if (
        block.block_type === "text" ||
        block.block_type === "rich_text" ||
        block.block_type === "quote" ||
        block.block_type === "video" ||
        block.block_type === "before_after" ||
        block.block_type === "testimonial"
      ) {
        combined.push({
          type: "text",
          data: block,
          order: block.display_order,
        });
      }
    });

    // Sort by display order
    const sorted = combined.sort((a, b) => a.order - b.order);

    console.log("Visual Design Layout - Sections:", sorted);
    console.log("Visual Design Layout - Background Color:", backgroundColor);
    console.log("Visual Design Layout - Blocks:", blocks);

    return sorted;
  }, [imageMedia, blocks, backgroundColor]);

  // Extract only image slides and map text blocks to nearest image
  const images = useMemo(
    () =>
      sections
        .filter((s) => s.type === "image")
        .map((s) => s.data as MediaItem),
    [sections]
  );

  // Calculate viewport sizes
  useEffect(() => {
    const updateViewport = () => {
      if (typeof window === "undefined") return;
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Preload image dimensions to compute exact widths at full-height
  useEffect(() => {
    if (!vh || images.length === 0) {
      setSlideWidths([]);
      return;
    }
    let cancelled = false;
    Promise.all(
      images.map(
        (m) =>
          new Promise<number>((resolve) => {
            const img = new window.Image();
            img.onload = () => {
              const ratio =
                img.naturalWidth && img.naturalHeight
                  ? img.naturalWidth / img.naturalHeight
                  : 1.5;
              resolve(Math.max(1, vh * ratio));
            };
            img.onerror = () => resolve(Math.round(vh * 1.5));
            img.src = m.url;
          })
      )
    ).then((widths) => {
      if (!cancelled) setSlideWidths(widths);
    });
    return () => {
      cancelled = true;
    };
  }, [images, vh]);

  const overlaysBySlide = useMemo(() => {
    const imagePositions: number[] = [];
    sections.forEach((s, i) => {
      if (s.type === "image") imagePositions.push(i);
    });

    const map: Record<number, any[]> = {};
    sections.forEach((s, idx) => {
      if (s.type !== "text") return;
      // find nearest previous image index in the timeline
      let slideIndex = -1;
      for (let ii = 0, count = 0; ii < sections.length; ii++) {
        if (sections[ii].type === "image") {
          if (ii <= idx) slideIndex = count;
          count++;
        }
      }
      if (slideIndex === -1) slideIndex = 0;
      if (!map[slideIndex]) map[slideIndex] = [];
      map[slideIndex].push(s.data);
    });
    return map;
  }, [sections]);

  useEffect(() => {
    const update = () => {
      const width = typeof window !== "undefined" ? window.innerWidth : 0;
      setVw(width);
      setTotalWidth(sections.length * width);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [sections.length]);

  // Track vertical scroll and convert to horizontal transform
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    mass: 0.7,
    restDelta: 0.001,
  });

  // Horizontal travel based on total content width
  const computedTotal =
    slideWidths.length === images.length && images.length > 0
      ? slideWidths.reduce((a, b) => a + b, 0)
      : images.length * (vw || 0);
  const travel = Math.max(computedTotal - vw, 0);
  const x = useTransform(smoothProgress, [0, 1], [0, -travel]);

  // Offsets for each image
  const offsets = useMemo(() => {
    if (slideWidths.length === images.length && images.length > 0) {
      const arr: number[] = [];
      let acc = 0;
      for (let i = 0; i < slideWidths.length; i++) {
        arr.push(acc);
        acc += slideWidths[i];
      }
      return arr;
    }
    return Array.from({ length: images.length }, (_, i) => i * (vw || 0));
  }, [slideWidths, images.length, vw]);

  const infoPanelWidth = Math.max(320, Math.round((vw || 0) * 0.25));

  // Category info for link rendering
  const categoryInfo = project.project_categories?.[0]?.categories;

  // Build content blocks HTML for left panel (exclude videos, before_after, and testimonials)
  const contentBlocksHtml = useMemo(() => {
    const blocks: string[] = [];
    Object.keys(overlaysBySlide).forEach((k) => {
      const idx = Number(k);
      const blocksArr = overlaysBySlide[idx];
      if (blocksArr && blocksArr.length) {
        blocksArr
          .filter(
            (b: any) =>
              b.block_type !== "video" &&
              b.block_type !== "before_after" &&
              b.block_type !== "testimonial"
          )
          .forEach((b: any) => {
            if (b.block_type === "quote") {
              blocks.push(
                `<blockquote class="border-l-4 border-current pl-6 py-4 italic text-xl opacity-90">${String(
                  b.content || ""
                )}</blockquote>`
              );
            } else {
              blocks.push(String(b.content || ""));
            }
          });
      }
    });
    return blocks.join(
      '<div class="my-8 border-t border-current opacity-30"></div>'
    );
  }, [overlaysBySlide]);

  // Build testimonials separately (also check project.testimonials)
  const testimonialsHtml = useMemo(() => {
    const testimonials: string[] = [];

    // From content blocks
    Object.keys(overlaysBySlide).forEach((k) => {
      const idx = Number(k);
      const blocksArr = overlaysBySlide[idx];
      if (blocksArr && blocksArr.length) {
        blocksArr
          .filter((b: any) => b.block_type === "testimonial")
          .forEach((b: any) => {
            try {
              const testimonial = b.content ? JSON.parse(b.content) : {};
              testimonials.push(`
              <div class="bg-current/5 rounded-lg p-6 my-4">
                <p class="italic text-base mb-4 leading-relaxed">"${
                  testimonial.text || ""
                }"</p>
                <div class="flex items-center gap-3">
                  ${
                    testimonial.image
                      ? `<img src="${testimonial.image}" alt="${testimonial.name}" class="w-12 h-12 rounded-full object-cover" />`
                      : ""
                  }
                  <div>
                    <p class="font-bold text-sm">${testimonial.name || ""}</p>
                    ${
                      testimonial.role
                        ? `<p class="text-xs opacity-70">${testimonial.role}</p>`
                        : ""
                    }
                  </div>
                </div>
              </div>
            `);
            } catch (e) {
              // Skip invalid testimonials
            }
          });
      }
    });

    // From project.testimonials (award images) - will be rendered separately as horizontal scroll
    // Skipping here to avoid duplication

    console.log("Testimonials found:", testimonials.length);
    return testimonials.join("");
  }, [overlaysBySlide, project]);

  // Detect overflow in left content blocks area to toggle "Read more"
  useEffect(() => {
    const checkOverflow = () => {
      const el = contentBlocksRef.current;
      if (!el) return;
      const hasOverflow = el.scrollHeight - 2 > el.clientHeight;
      setContentHasOverflow(hasOverflow);
    };

    checkOverflow();
    const handleResize = () => checkOverflow();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [contentBlocksHtml, testimonialsHtml, showFullContent]);

  // Compute safe top paddings based on logo and info heights
  useEffect(() => {
    const updateSafe = () => {
      const viewportHeight =
        vh || (typeof window !== "undefined" ? window.innerHeight : 0);
      const viewportWidth =
        vw || (typeof window !== "undefined" ? window.innerWidth : 0);
      const logoTop = viewportWidth >= 768 ? 32 : 24; // md:top-8 else top-6
      const logoH = 56; // h-14
      const infoTop = Math.round(logoTop + logoH + viewportHeight * 0.03); // 3% below logo bottom
      setSafeInfoTop(infoTop);

      const measuredDetails =
        infoGroupRef.current?.getBoundingClientRect().height || 0;
      const measuredBlurb =
        blurbRef.current?.getBoundingClientRect().height || 0;
      setDetailsHeight(measuredDetails);
      setBlurbHeight(measuredBlurb);

      const gap = Math.max(32, Math.round(viewportHeight * 0.05));
      setCollapsedBlocksTop(Math.round(infoTop + measuredDetails + gap));
      setSafeBlocksTop(
        Math.round(infoTop + measuredDetails + measuredBlurb + gap)
      );
    };
    updateSafe();
    window.addEventListener("resize", updateSafe);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && infoContainerRef.current) {
      ro = new ResizeObserver(updateSafe);
      ro.observe(infoContainerRef.current);
    }
    return () => {
      window.removeEventListener("resize", updateSafe);
      ro?.disconnect();
    };
  }, [vw, vh, project.title, project.blurb, tags?.length, showFullContent]);

  // Calculate scroll offset for blocks reveal and blurb motion
  const infoScale = useTransform(smoothProgress, [0, 0.2], [1, 0.85]);
  const blurbOpacity = useTransform(smoothProgress, [0, 0.1, 0.2], [1, 0.8, 0]);
  const blurbY = useTransform(smoothProgress, [0, 0.1, 0.2], [0, -8, -20]);

  // Content blocks appear from bottom as info moves up (15% higher)
  const blockLift = Math.max(0, safeBlocksTop - collapsedBlocksTop);
  const blocksY = useTransform(smoothProgress, (value) => {
    if (showFullContent) return 0;
    const startOffset = 90;
    const progress = Math.min(Math.max((value - 0.18) / 0.17, 0), 1);
    const eased = progress * progress * (3 - 2 * progress); // smoothstep ease
    return startOffset * (1 - eased) - blockLift * eased;
  });
  const blocksOpacity = useTransform(
    smoothProgress,
    [0, 0.18, 0.3],
    [0, 0.4, 1]
  );

  // Testimonials appear later (more delay)
  const testimonialsOpacity = useTransform(
    smoothProgress,
    [0, 0.25, 0.35],
    [0, 0, 1]
  );
  const testimonialsY = useTransform(
    smoothProgress,
    [0, 0.25, 0.35],
    [20, 10, 0]
  );

  // Auto-scroll testimonials based on page scroll (faster)
  const testimonialScrollX = useTransform(smoothProgress, [0, 1], [0, -400]);

  // Cover video URL
  const coverVideoUrl = (project as any).cover_video_url;

  // Build row: images + video content blocks + before/after sliders (cover video is overlay on cover image)
  const rowItems = useMemo(() => {
    const items: Array<{
      type: "image" | "video" | "before_after";
      img?: MediaItem;
      block?: any;
      hasCoverVideo?: boolean;
    }> = [];

    // Add cover image (with cover video flag)
    if (images.length > 0) {
      items.push({
        type: "image" as const,
        img: images[0],
        hasCoverVideo: !!coverVideoUrl,
      });
    }

    // Add remaining images and their video/before_after blocks
    for (let i = 1; i < images.length; i++) {
      items.push({ type: "image" as const, img: images[i] });

      // Add video and before_after blocks after corresponding image
      const blocksArr = overlaysBySlide[i];
      if (blocksArr && blocksArr.length) {
        const videoBlocks = blocksArr.filter(
          (b: any) => b.block_type === "video"
        );
        videoBlocks.forEach((vb: any) => {
          items.push({ type: "video" as const, block: vb });
        });

        const beforeAfterBlocks = blocksArr.filter(
          (b: any) => b.block_type === "before_after"
        );
        beforeAfterBlocks.forEach((ba: any) => {
          items.push({ type: "before_after" as const, block: ba });
        });
      }
    }

    return items;
  }, [images, overlaysBySlide, coverVideoUrl]);

  // Compute widths and offsets for the combined row (images + videos + before_after)
  const videoSlideWidth = Math.round(vw * 0.6); // 60% viewport width for videos
  const beforeAfterWidth = Math.round(vw * 0.7); // 70% viewport width for before/after

  const rowWidths = useMemo(() => {
    const widths: number[] = [];
    let imgIdx = 0;
    for (const it of rowItems) {
      if (it.type === "image") {
        widths.push(slideWidths[imgIdx] || vw);
        imgIdx++;
      } else if (it.type === "video") {
        widths.push(videoSlideWidth);
      } else if (it.type === "before_after") {
        widths.push(beforeAfterWidth);
      }
    }
    return widths;
  }, [rowItems, slideWidths, vw, videoSlideWidth, beforeAfterWidth]);

  const rowOffsets = useMemo(() => {
    const offs: number[] = [];
    let acc = 0;
    for (const w of rowWidths) {
      offs.push(acc);
      acc += w;
    }
    return offs;
  }, [rowWidths]);

  const rowTotal = useMemo(
    () => rowWidths.reduce((a, b) => a + b, 0),
    [rowWidths]
  );
  const rowTravel = Math.max(rowTotal - (vw - infoPanelWidth), 0); // Account for panel width
  const xRow = useTransform(smoothProgress, [0, 1], [0, -rowTravel]);

  // Mobile layout: clean vertical stack
  if (vw > 0 && vw < 768) {
    return (
      <>
        {/* Block MainLayout header/footer on mobile */}
        <div className="fixed inset-0 z-[9998]" style={{ backgroundColor }} />

        <div
          className="relative z-[9999] min-h-screen w-full"
          style={{ backgroundColor, color: textColor }}
        >
          {/* Logo + Close */}
          <Link
            href="/"
            className="fixed left-4 top-4 z-50 transition-opacity hover:opacity-80"
            aria-label="Back to home"
          >
            <Image
              src="/Anomaly.png"
              alt="Crafted Anomaly"
              width={40}
              height={40}
              className="h-10 w-10 object-contain drop-shadow-lg"
              priority
            />
          </Link>
          <Link
            href={`/${categorySlug}`}
            className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition hover:opacity-80"
            style={{ backgroundColor: textColor }}
            aria-label="Close"
          >
            <X className="h-5 w-5" style={{ color: backgroundColor }} />
          </Link>

          {/* Project Info */}
          <div className="px-6 py-20 pb-12" style={{ color: textColor }}>
            {project.project_type && (
              <div className="text-[10px] uppercase tracking-[0.3em] opacity-80 mb-2">
                {project.project_type}
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4">
              {project.title}
            </h1>
            {project.blurb && (
              <p className="text-sm leading-relaxed opacity-80 mb-6">
                {project.blurb}
              </p>
            )}

            <div className="text-xs opacity-70 space-y-1">
              {categoryInfo && (
                <div>
                  <b>Category:</b> {categoryInfo.name}
                </div>
              )}
              {project.client && (
                <div>
                  <b>Client:</b> {project.client}
                </div>
              )}
              {project.year && (
                <div>
                  <b>Year:</b> {project.year}
                </div>
              )}
              {project.role_en && (
                <div>
                  <b>Role:</b> {project.role_en}
                </div>
              )}
            </div>
          </div>

          {/* Images & Content Blocks */}
          <div className="space-y-0">
            {rowItems.map((item, index) => {
              if (item.type === "image" && item.img) {
                return (
                  <div key={item.img.id} className="relative w-full">
                    <div
                      className="relative w-full"
                      style={{ aspectRatio: "16/9" }}
                    >
                      <Image
                        src={item.img.url}
                        alt={`Project image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="100vw"
                      />
                    </div>
                  </div>
                );
              } else if (item.type === "video" && item.block) {
                const videoInfo =
                  item.block.content || item.block.media_url || "";
                return (
                  <div
                    key={`video-${index}`}
                    className="relative w-full bg-black"
                  >
                    <div
                      className="relative w-full"
                      style={{ aspectRatio: "16/9" }}
                    >
                      {videoInfo.includes("youtube.com") ||
                      videoInfo.includes("youtu.be") ? (
                        <iframe
                          src={videoInfo
                            .replace("watch?v=", "embed/")
                            .replace("youtu.be/", "youtube.com/embed/")}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : videoInfo.includes("vimeo.com") ? (
                        <iframe
                          src={videoInfo.replace(
                            "vimeo.com/",
                            "player.vimeo.com/video/"
                          )}
                          className="w-full h-full"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={videoInfo}
                          controls
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Content Blocks */}
          {contentBlocksHtml && (
            <div className="px-6 py-10" style={{ color: textColor }}>
              <div
                className="prose prose-sm max-w-none"
                style={{ color: textColor }}
                dangerouslySetInnerHTML={{ __html: contentBlocksHtml }}
              />
            </div>
          )}

          {/* Testimonials */}
          {(project as any).testimonials &&
            Array.isArray((project as any).testimonials) &&
            (project as any).testimonials.length > 0 && (
              <div className="px-6 py-10">
                <div className="flex flex-wrap gap-4 justify-center">
                  {((project as any).testimonials as string[]).map(
                    (imgUrl: string, idx: number) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt={`Award ${idx + 1}`}
                        className="h-10 w-auto object-contain opacity-70"
                      />
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header/Footer blocker - blocks MainLayout header/footer */}
      <div className="fixed inset-0 z-[9998]" style={{ backgroundColor }} />

      {/* Scroll container - creates vertical scroll space */}
      <div
        ref={scrollContainerRef}
        className="relative z-[9999] scrollbar-hide"
        style={{ height: `${(vh || 0) + rowTravel}px` }}
      />

      {/* Fixed viewport */}
      <div
        className="fixed inset-0 z-[10000] overflow-hidden pointer-events-none"
        style={{ backgroundColor }}
      >
        {/* Logo + Close */}
        <Link
          href="/"
          className="absolute left-6 top-6 z-50 transition-opacity hover:opacity-70 md:left-10 md:top-8 pointer-events-auto"
          aria-label="Back to home"
        >
          <Image
            src="/Anomaly.png"
            alt="Crafted Anomaly"
            width={56}
            height={56}
            className="h-14 w-14 object-contain drop-shadow-lg"
            priority
          />
        </Link>
        <Link
          href={`/${categorySlug}`}
          className="absolute right-6 top-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg backdrop-blur-sm transition hover:opacity-80 md:right-10 md:top-8 pointer-events-auto"
          style={{ backgroundColor: textColor }}
          aria-label="Close"
        >
          <X className="h-5 w-5" style={{ color: backgroundColor }} />
        </Link>

        {/* Progress bar - clickable */}
        <div className="fixed bottom-8 left-1/2 z-50 hidden -translate-x-1/2 md:block pointer-events-auto">
          <div className="flex items-center gap-1.5">
            {images.map((_, i) => (
              <ProgressSegment
                key={i}
                index={i}
                total={images.length}
                smoothProgress={smoothProgress}
                textColor={textColor}
                vh={vh}
                rowTravel={rowTravel}
              />
            ))}
          </div>
        </div>

        {/* Logo top left */}
        <Link
          href="/"
          className="fixed left-6 top-6 z-[60] pointer-events-auto"
          aria-label="Back to home"
        >
          <Image
            src="/Anomaly.png"
            alt="Crafted Anomaly"
            width={56}
            height={56}
            className="h-14 w-14 object-contain drop-shadow-lg"
            priority
          />
        </Link>

        {/* Fixed left panel with project info and content blocks */}
        <div
          className="fixed left-0 top-0 z-[50] h-screen pointer-events-auto overflow-y-auto"
          style={{ width: infoPanelWidth, backgroundColor }}
        >
          <div
            className="relative h-full pointer-events-auto"
            style={{ color: textColor }}
          >
            {/* Project info */}
            <motion.div
              className="absolute inset-x-8"
              style={{
                top: safeInfoTop,
                opacity: showFullContent ? 0 : 1,
                pointerEvents: showFullContent ? "none" : "auto",
              }}
            >
              <div
                ref={infoContainerRef}
                className="flex flex-col gap-6 pr-2"
                style={{ overflowY: showFullContent ? "auto" : "visible" }}
              >
                <motion.div
                  ref={infoGroupRef}
                  // style={{ scale: infoScale, originX: 0, originY: 0 }}
                  className="space-y-3"
                >
                  {project.project_type && (
                    <div className="text-[11px] uppercase tracking-[0.32em] opacity-80">
                      {project.project_type}
                    </div>
                  )}
                  <h1 className="text-[46px] md:text-[57px] font-black leading-tight m-0">
                    {project.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13.5px] opacity-90">
                    {project.client && (
                      <span>
                        <b>Client:</b> {project.client}
                      </span>
                    )}
                    {project.year && (
                      <span>
                        <b>Year:</b> {project.year}
                      </span>
                    )}
                    {project.role_en && (
                      <span>
                        <b>Role:</b> {project.role_en}
                      </span>
                    )}
                    {categoryInfo && (
                      <span>
                        <b>Category:</b>{" "}
                        <Link
                          href={`/${categoryInfo.slug}`}
                          className="underline hover:opacity-80 pointer-events-auto"
                        >
                          {categoryInfo.name}
                        </Link>
                      </span>
                    )}
                  </div>
                  {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-full border border-current/30 px-3 py-1 text-xs uppercase tracking-wide opacity-80"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>

                {project.blurb && (
                  <motion.p
                    ref={blurbRef}
                    className="text-[17px] leading-relaxed max-w-xl"
                    style={{
                      opacity: showFullContent ? 0 : blurbOpacity,
                      y: showFullContent ? -40 : blurbY,
                    }}
                  >
                    {project.blurb}
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Content blocks */}
            <motion.div
              className="absolute inset-x-8 pb-12"
              style={{
                top: showFullContent ? safeInfoTop : safeBlocksTop,
                height: `calc(100% - ${
                  showFullContent ? safeInfoTop : safeBlocksTop
                }px)`,
                opacity: showFullContent ? 1 : blocksOpacity,
                y: showFullContent ? 0 : blocksY,
              }}
            >
              {/* {!showFullContent && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/45 to-transparent" />
              )} */}
              <div
                ref={contentBlocksRef}
                className={`relative h-full overflow-auto scrollbar-hide pr-2 ${
                  showFullContent ? "" : "pb-16"
                }`}
                style={{ color: textColor }}
              >
                {contentBlocksHtml && (
                  <div
                    className="prose prose-lg max-w-none mb-8"
                    style={{ color: textColor }}
                    dangerouslySetInnerHTML={{ __html: contentBlocksHtml }}
                  />
                )}
                {testimonialsHtml && testimonialsHtml.length > 0 && (
                  <>
                    <div className="my-8 border-t border-current opacity-30"></div>
                    <div
                      className="space-y-4"
                      style={{ color: textColor }}
                      dangerouslySetInnerHTML={{ __html: testimonialsHtml }}
                    />
                  </>
                )}
                {(project as any).testimonials &&
                  Array.isArray((project as any).testimonials) &&
                  (project as any).testimonials.length > 0 && (
                    <motion.div
                      style={{ opacity: testimonialsOpacity, y: testimonialsY }}
                    >
                      <div className="my-8 border-t border-current opacity-30"></div>
                      <div
                        ref={testimonialsRef}
                        className="overflow-x-auto scrollbar-hide -mx-8 px-8"
                      >
                        <motion.div
                          className="flex gap-4 py-4 min-w-max"
                          style={{ x: testimonialScrollX }}
                        >
                          {((project as any).testimonials as string[]).map(
                            (imgUrl: string, idx: number) => (
                              <div
                                key={idx}
                                className="flex-shrink-0 transition-transform hover:scale-150 duration-300"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Award ${idx + 1}`}
                                  className="h-14 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                                />
                              </div>
                            )
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                {(contentHasOverflow || showFullContent) && (
                  <div className="mt-10 flex">
                    <button
                      type="button"
                      onClick={() => setShowFullContent((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-full border border-current/40 px-5 py-2 text-xs uppercase tracking-[0.28em] transition hover:bg-current/10"
                    >
                      {showFullContent ? "Show less" : "Read more"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll hint animation - shows for 3 seconds */}
        {showScrollHint && (
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ x: [0, 20, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex items-center gap-2 text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span className="text-lg font-medium">Scroll to explore</span>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.div>
              <motion.div className="w-32 h-1 bg-white/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  animate={{ x: [-128, 128] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ width: "50%" }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Horizontal row wrapper: images only */}
        <motion.div
          ref={wrapperRef}
          className="relative z-[5] h-screen touch-pan-y"
          style={{
            x: xRow,
            width: rowTotal,
            willChange: "transform",
            left: infoPanelWidth,
          }}
        >
          {rowItems.map((it, idx) => {
            if (it.type === "image" && it.img) {
              return (
                <ImageSlide
                  key={it.img.id}
                  img={it.img}
                  offset={rowOffsets[idx] || 0}
                  width={rowWidths[idx] || vw}
                  xMV={xRow}
                  vw={vw}
                  overlays={undefined}
                  backgroundColor={backgroundColor}
                  textColor={textColor}
                  coverVideoUrl={it.hasCoverVideo ? coverVideoUrl : undefined}
                  panelWidth={infoPanelWidth}
                />
              );
            } else if (it.type === "video" && it.block) {
              return (
                <VideoSlide
                  key={`video-${it.block.id}`}
                  block={it.block}
                  offset={rowOffsets[idx] || 0}
                  width={rowWidths[idx] || videoSlideWidth}
                  xMV={xRow}
                  vw={vw}
                  backgroundColor={backgroundColor}
                />
              );
            } else if (it.type === "before_after" && it.block) {
              return (
                <BeforeAfterSlide
                  key={`before-after-${it.block.id}`}
                  block={it.block}
                  offset={rowOffsets[idx] || 0}
                  width={rowWidths[idx] || beforeAfterWidth}
                  xMV={xRow}
                  vw={vw}
                  backgroundColor={backgroundColor}
                />
              );
            }
            return null;
          })}
        </motion.div>
      </div>
    </>
  );
}

function ProgressSegment({
  index,
  total,
  smoothProgress,
  textColor,
  vh,
  rowTravel,
}: {
  index: number;
  total: number;
  smoothProgress: any;
  textColor: string;
  vh: number;
  rowTravel: number;
}) {
  const segmentProgress = useTransform(
    smoothProgress,
    [index / total, (index + 1) / total],
    [0, 1]
  );

  const segmentOpacity = useTransform(
    smoothProgress,
    [
      index / total - 0.1,
      index / total,
      (index + 1) / total,
      (index + 1) / total + 0.1,
    ],
    [0.2, 0.8, 0.8, 0.2]
  );

  return (
    <button
      onClick={() => {
        const targetProgress = (index + 0.5) / total;
        const targetScroll = targetProgress * (vh + rowTravel);
        window.scrollTo({ top: targetScroll, behavior: "smooth" });
      }}
      className="relative h-1.5 w-8 rounded-full cursor-pointer transition-opacity hover:opacity-90 overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: textColor,
          opacity: segmentOpacity,
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full origin-left"
        style={{
          scaleX: segmentProgress,
          backgroundColor: textColor,
          opacity: 1,
        }}
      />
    </button>
  );
}

function ImageSlide({
  img,
  offset,
  width,
  xMV,
  vw,
  overlays,
  backgroundColor,
  textColor,
  coverVideoUrl,
  panelWidth,
}: {
  img: MediaItem;
  offset: number;
  width: number;
  xMV: any;
  vw: number;
  overlays?: any[];
  backgroundColor: string;
  textColor: string;
  coverVideoUrl?: string;
  panelWidth?: number;
}) {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for video end/pause to close overlay
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "videoPaused" || event.data === "videoEnded") {
        setShowVideo(false);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  const viewportX = useTransform(xMV, (val: number) => -val);
  const leftClip = useTransform(viewportX, (v: number) =>
    Math.max(0, Math.min(width, v - offset))
  );
  const rightClip = useTransform(viewportX, (v: number) => {
    const viewRight = v + vw;
    return Math.max(0, Math.min(width, offset + width - viewRight));
  });
  const clipPath = useMotionTemplate`inset(0 ${rightClip}px 0 ${leftClip}px)`;

  // Extract video info for cover video
  const getVideoInfo = (content: string) => {
    if (!content) return null;

    if (content.includes("youtube.com") || content.includes("youtu.be")) {
      const regExp =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = content.match(regExp);
      if (match && match[1]) {
        return {
          type: "youtube",
          embedUrl: `https://www.youtube.com/embed/${match[1]}?autoplay=1&controls=1&rel=0`,
        };
      }
    }

    if (content.includes("vimeo.com")) {
      const match = content.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (match && match[1]) {
        return {
          type: "vimeo",
          embedUrl: `https://player.vimeo.com/video/${match[1]}?autoplay=1`,
        };
      }
    }

    if (content.match(/\.(mp4|webm|ogg)$/i)) {
      return { type: "direct", url: content };
    }

    return null;
  };

  const videoInfo = coverVideoUrl ? getVideoInfo(coverVideoUrl) : null;

  return (
    <div
      className="absolute top-0 h-screen"
      style={{ left: offset, width, zIndex: 10 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ clipPath, willChange: "clip-path" }}
      >
        <div
          className="absolute inset-0 bg-left bg-no-repeat"
          style={{
            backgroundImage: `url(${img.url})`,
            backgroundSize: "auto 100%",
          }}
        />

        {/* Cover video overlay - same size as image */}
        {coverVideoUrl && (
          <>
            {showVideo && videoInfo ? (
              <div className="absolute inset-0 bg-black z-20 pointer-events-auto">
                {videoInfo.type === "direct" ? (
                  <video
                    ref={videoRef}
                    src={videoInfo.url}
                    controls
                    autoPlay
                    className="absolute inset-0 w-full h-full pointer-events-auto"
                    style={{ objectFit: "contain" }}
                    onEnded={() => setShowVideo(false)}
                    onPause={() => setShowVideo(false)}
                  />
                ) : (
                  <iframe
                    ref={iframeRef}
                    src={videoInfo.embedUrl}
                    className="absolute inset-0 w-full h-full pointer-events-auto"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: "none" }}
                  />
                )}
                {/* Close video button */}
                <button
                  onClick={() => setShowVideo(false)}
                  className="absolute top-4 right-4 z-30 bg-black/70 hover:bg-black/90 rounded-full p-3 transition-colors pointer-events-auto"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowVideo(true)}
                className="absolute bottom-16 left-8 z-20 bg-white/90 hover:bg-white rounded-full p-6 transition-all hover:scale-110 shadow-2xl pointer-events-auto group"
              >
                <svg
                  className="w-8 h-8 text-black ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </button>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

function BeforeAfterSlide({
  block,
  offset,
  width,
  xMV,
  vw,
  backgroundColor,
}: {
  block: any;
  offset: number;
  width: number;
  xMV: any;
  vw: number;
  backgroundColor: string;
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const viewportX = useTransform(xMV, (val: number) => -val);
  const leftClip = useTransform(viewportX, (v: number) =>
    Math.max(0, Math.min(width, v - offset))
  );
  const rightClip = useTransform(viewportX, (v: number) => {
    const viewRight = v + vw;
    return Math.max(0, Math.min(width, offset + width - viewRight));
  });
  const clipPath = useMotionTemplate`inset(0 ${rightClip}px 0 ${leftClip}px)`;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSliderPosition(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      updateSliderPosition(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateSliderPosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      updateSliderPosition(e.touches[0].clientX);
    }
  };

  const updateSliderPosition = (clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    }
  };

  const beforeImage = (block.media_urls && block.media_urls[0]) || "";
  const afterImage = (block.media_urls && block.media_urls[1]) || "";

  console.log("Before/After block:", { beforeImage, afterImage, block });

  return (
    <div
      className="absolute top-0 h-screen"
      style={{ left: offset, width, zIndex: 15 }}
    >
      <motion.div
        ref={containerRef}
        className="absolute inset-0 pointer-events-auto overflow-hidden cursor-ew-resize select-none"
        style={{ clipPath, willChange: "clip-path", backgroundColor }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* After image (background) - full */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${afterImage})`,
            backgroundSize: "auto 100%",
            backgroundPosition: "left center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Before image (clipped) - slides over */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${beforeImage})`,
            backgroundSize: "auto 100%",
            backgroundPosition: "left center",
            backgroundRepeat: "no-repeat",
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
            transition: isDragging ? "none" : "clip-path 0.1s ease-out",
          }}
        />

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-xl z-10"
          style={{
            left: `${sliderPosition}%`,
            transform: "translateX(-50%)",
            transition: isDragging ? "none" : "left 0.1s ease-out",
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-2xl pointer-events-none">
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-black"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <svg
                className="w-4 h-4 text-black"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-semibold pointer-events-none backdrop-blur-sm">
          Before
        </div>
        <div className="absolute top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-semibold pointer-events-none backdrop-blur-sm">
          After
        </div>
      </motion.div>
    </div>
  );
}

function VideoSlide({
  block,
  offset,
  width,
  xMV,
  vw,
  backgroundColor,
}: {
  block: any;
  offset: number;
  width: number;
  xMV: any;
  vw: number;
  backgroundColor: string;
}) {
  const viewportX = useTransform(xMV, (val: number) => -val);
  const leftClip = useTransform(viewportX, (v: number) =>
    Math.max(0, Math.min(width, v - offset))
  );
  const rightClip = useTransform(viewportX, (v: number) => {
    const viewRight = v + vw;
    return Math.max(0, Math.min(width, offset + width - viewRight));
  });
  const clipPath = useMotionTemplate`inset(0 ${rightClip}px 0 ${leftClip}px)`;

  // Extract video info from content
  const getVideoInfo = (content: string) => {
    if (!content) return null;

    // YouTube
    if (content.includes("youtube.com") || content.includes("youtu.be")) {
      const regExp =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = content.match(regExp);
      if (match && match[1]) {
        return {
          type: "youtube",
          id: match[1],
          embedUrl: `https://www.youtube.com/embed/${match[1]}?controls=1&rel=0`,
        };
      }
    }

    // Vimeo
    if (content.includes("vimeo.com")) {
      const match = content.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (match && match[1]) {
        return {
          type: "vimeo",
          id: match[1],
          embedUrl: `https://player.vimeo.com/video/${match[1]}?controls=1`,
        };
      }
    }

    // Direct video URL (.mp4, .webm, etc.)
    if (content.match(/\.(mp4|webm|ogg)$/i)) {
      return {
        type: "direct",
        url: content,
      };
    }

    return null;
  };

  const videoInfo = getVideoInfo(block.content || block.media_url || "");

  return (
    <div
      className="absolute top-0 h-screen"
      style={{ left: offset, width, zIndex: 15 }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-auto"
        style={{ clipPath, willChange: "clip-path" }}
      >
        {/* Video icon indicator */}
        <div className="absolute top-4 right-4 z-10 bg-black/70 rounded-full p-2 backdrop-blur-sm pointer-events-none">
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        </div>

        {videoInfo?.type === "direct" ? (
          <video
            src={videoInfo.url}
            controls
            className="absolute inset-0 h-full w-auto mx-auto pointer-events-auto"
            style={{ backgroundColor }}
          />
        ) : videoInfo ? (
          <iframe
            src={videoInfo.embedUrl}
            className="absolute inset-0 h-full w-auto mx-auto pointer-events-auto"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ backgroundColor }}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor }}
          >
            <div className="text-white text-center">
              <svg
                className="w-24 h-24 mx-auto mb-4 opacity-50"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <p className="text-sm opacity-70">Video</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ContentBlockSlide({
  block,
  index,
  scrollProgress,
  totalSections,
}: {
  block: any;
  index: number;
  scrollProgress: any;
  totalSections: number;
}) {
  const start = index / totalSections;
  const end = (index + 1) / totalSections;

  const y = useTransform(
    scrollProgress,
    [start - 0.1, start, end, end + 0.1],
    [100, 0, 0, -100]
  );
  const opacity = useTransform(
    scrollProgress,
    [start - 0.1, start, end, end + 0.1],
    [0, 1, 1, 0]
  );

  return (
    <motion.div
      className="pointer-events-none relative z-10 flex h-full w-full items-center justify-center px-8 md:px-16"
      style={{ y, opacity }}
    >
      <div
        className="prose prose-lg max-w-4xl rounded-3xl bg-white px-12 py-16 shadow-2xl md:prose-xl lg:px-16 lg:py-20"
        dangerouslySetInnerHTML={{
          __html: block.content || "<p>No content</p>",
        }}
      />
    </motion.div>
  );
}

function TextOverlay({
  project,
  tags,
  scrollProgress,
  totalSections,
}: {
  project: VisualDesignLayoutProps["project"];
  tags: VisualDesignLayoutProps["tags"];
  scrollProgress: any;
  totalSections: number;
}) {
  // Position on first section (first image)
  const titleY = useTransform(scrollProgress, [0, 0.3], [0, -200]);
  const titleOpacity = useTransform(scrollProgress, [0, 0.2], [1, 0]);

  return (
    <>
      {/* Main title overlay on first image */}
      <motion.div
        className="pointer-events-none absolute left-0 top-0 flex h-screen w-screen items-center justify-center px-12"
        style={{ y: titleY, opacity: titleOpacity }}
      >
        <div className="w-full max-w-6xl text-center">
          {project.project_type && (
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-block rounded-full bg-white/90 px-6 py-3 text-xs font-bold uppercase tracking-[0.4em] text-black shadow-2xl backdrop-blur-md"
            >
              {project.project_type}
            </motion.span>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-balance text-6xl font-black leading-[0.95] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] md:text-8xl lg:text-9xl"
          >
            {project.title}
          </motion.h1>

          {project.blurb && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mx-auto mt-8 max-w-3xl text-balance text-lg leading-relaxed text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] md:text-2xl"
            >
              {project.blurb}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white"
          >
            {project.client && (
              <div className="rounded-full bg-white/10 px-6 py-3 backdrop-blur-md">
                <span className="font-bold">Client:</span> {project.client}
              </div>
            )}
            {project.year && (
              <div className="rounded-full bg-white/10 px-6 py-3 backdrop-blur-md">
                <span className="font-bold">Year:</span> {project.year}
              </div>
            )}
            {project.role_en && (
              <div className="rounded-full bg-white/10 px-6 py-3 backdrop-blur-md">
                <span className="font-bold">Role:</span> {project.role_en}
              </div>
            )}
          </motion.div>

          {tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 flex flex-wrap justify-center gap-3"
            >
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white backdrop-blur-md"
                >
                  {tag.name}
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Additional text overlays for other sections can be added here */}
    </>
  );
}

// Helper functions

function isDark(color: string) {
  try {
    const hex = color.replace("#", "");
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 140;
  } catch {
    return true;
  }
}

function isRenderableImage(url: string, mediaType?: string) {
  if (mediaType?.startsWith("image/")) return true;
  return /(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url);
}
