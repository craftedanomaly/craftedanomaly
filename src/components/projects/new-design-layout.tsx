"use client";

import { useWindowSize } from "@/hooks/useWindowSize";
import { supabase } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Clapperboard } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import WheelGesturesPlugin from "embla-carousel-wheel-gestures";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { EmblaCarouselType } from "embla-carousel";
import { useRouter } from "next/navigation";
import ReactPlayer from "react-player";
interface CategoryRelation {
  categories: {
    id: string;
    slug: string;
    name: string;
  };
}

interface MediaItem {
  id: string;
  media_type: "cover_image" | "cover_video" | "image" | "video";
  media_url: string;
  url: string;
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
    cover_image: string;
    cover_video_url: string;
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

export function NewDesignLayout({
  project,
  media,
  tags,
  blocks,
}: VisualDesignLayoutProps) {
  const rightSpanRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [scrollLength, setScrollLength] = useState<number>(-1);
  const { width, height } = useWindowSize();
  const [logoSettings, setLogoSettings] = useState({
    logo_light_url: "/Anomaly.png",
    logo_dark_url: "/Anomaly.png",
    logo_alt: "Crafted Anomaly",
  });
  const { resolvedTheme } = useTheme();

  const backgroundColor = project.background_color || "#0b0b0c";
  const textColor = (project as any).text_color || "#ffffff";
  const categoryInfo = project.project_categories?.[0]?.categories;

  const router = useRouter();
  const [coverVideoPlay, setCoverVideoPlay] = useState<boolean>(false);

  useEffect(() => {
    document.body.classList.add("hide-header");
    return () => {
      document.body.classList.remove("hide-header");
    };
  }, []);

  // Slider Script
  const [emblaRef, emblaApi] = useEmblaCarousel(
    width > 1280
      ? {
          loop: false,
          dragFree: true,
          dragThreshold: 50,
          containScroll: "trimSnaps",
        }
      : undefined,
    width > 1280
      ? [
          WheelGesturesPlugin({
            forceWheelAxis: "y",
            target: document.documentElement,
          }),
        ]
      : undefined
  );

  // Next Slide
  const scrollPrev = useCallback(() => {
    if (!isScrolling) setIsScrolling(true);
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  // Previous Slide
  const scrollNext = useCallback(() => {
    if (!isScrolling) setIsScrolling(true);
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) setScrollLength(emblaApi?.scrollSnapList().length);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onScroll = () => {
      setIsScrolling(true);
    };
    // const onSettle = () => setIsScrolling(false);

    emblaApi.on("scroll", onScroll);
    // emblaApi.on("settle", onSettle);

    return () => {
      emblaApi.off("scroll", onScroll);
      // emblaApi.off("settle", onSettle);
    };
  }, [emblaApi]);

  // Scroll progress
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  //  const smoothProgress = useSpring(scrollYProgress, {
  //     stiffness: 120,
  //     damping: 25,
  //     mass: 0.7,
  //     restDelta: 0.001,
  //   });

  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    setScrollProgress(progress * 100);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onScroll(emblaApi);
    emblaApi
      .on("reInit", onScroll)
      .on("scroll", onScroll)
      .on("slideFocus", onScroll);
  }, [emblaApi, onScroll]);

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

  // Map items
  const coverImageMedia = project.cover_image
    ? [
        {
          media_type: "cover_image",
          media_url: project.cover_image,
        },
      ]
    : [];

  const processedMedia = media.map((m) => ({
    media_type: m.media_type === "image" ? "image" : "video",
    media_url: m.url ? m.url : "failed",
  }));

  const combinedMedia = [...coverImageMedia, ...processedMedia]?.filter(
    (i) => i.media_url !== "failed"
  );

  // Smooth progress pagination
  // component top-level
  const scrollMotion = useMotionValue(0); // between 0-100
  const normalizedProgress = useTransform(scrollMotion, [0, 100], [0, 1]);

  useEffect(() => {
    scrollMotion.set(scrollProgress); // scrollProgress = 0-100
  }, [scrollProgress, scrollMotion]);

  const segmentCount = combinedMedia.length;

  // Segment progress
  // loop öncesi
  const segmentProgresses = combinedMedia.map((_, index) =>
    useTransform(
      normalizedProgress,
      [index / segmentCount, (index + 1) / segmentCount],
      [0, 1]
    )
  );

  const segmentOpacities = combinedMedia.map((_, index) =>
    useTransform(
      normalizedProgress,
      [
        index / segmentCount - 0.1,
        index / segmentCount,
        (index + 1) / segmentCount,
        (index + 1) / segmentCount + 0.1,
      ],
      [0.2, 0.8, 0.8, 0.2]
    )
  );

  const smoothSegmentProgresses = segmentProgresses.map((p) =>
    useSpring(p, { stiffness: 120, damping: 25, mass: 0.7, restDelta: 0.001 })
  );
  const smoothSegmentOpacities = segmentOpacities.map((o) =>
    useSpring(o, { stiffness: 120, damping: 25, mass: 0.7, restDelta: 0.001 })
  );

  console.log("project media:", media);
  console.log("combined media:", combinedMedia);
  console.log("cover video:", project.cover_video_url);

  return (
    <>
      {/* customized div as header */}
      <div className="absolute top-0 left-0 right-0 z-50 w-full bg-transparent ">
        <div
          className="w-full"
          style={{ paddingLeft: "1%", paddingRight: "1%" }}
        >
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative h-[53px] w-auto">
                <Image
                  src={
                    resolvedTheme === "dark"
                      ? logoSettings.logo_dark_url
                      : logoSettings.logo_light_url
                  }
                  alt={logoSettings.logo_alt}
                  width={265}
                  height={106}
                  className="h-full w-auto object-contain"
                  priority
                />
              </div>
            </Link>

            {/* navigate -1 button */}
            <button
              onClick={() => {
                if (coverVideoPlay) {
                  setCoverVideoPlay(false);
                } else {
                  router.push("/");
                }
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full text-foreground transition-colors cursor-pointer max-xl:cursor-default hover:opacity-80"
              aria-label="Close menu"
              style={{
                backgroundColor: textColor,
              }}
            >
              <X className="h-5 w-5" style={{ color: backgroundColor }} />
            </button>
          </div>
        </div>
      </div>
      <div
        className="grid grid-cols-12 overflow-x-hidden z-[61]"
        style={{
          backgroundColor,
          color: textColor,
        }}
      >
        {/* left side */}
        <div className="h-screen border-r border-border overflow-y-auto scrollbar-hide max-xl:col-span-12 col-span-3 max-xl:h-auto z-10 max-xl:py-[60px]">
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
              <div className="space-y-4 mt-10">
                {project.project_type && (
                  <div className="text-[11px] uppercase tracking-[0.32em] opacity-80">
                    {project.project_type}
                  </div>
                )}
                <h1
                  className="text-4xl xl:text-5xl text-foreground leading-tight"
                  style={{
                    color: textColor,
                  }}
                >
                  {project.title}
                </h1>

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
              </div>
              {project.blurb && (
                <p className="text-[17px] leading-relaxed max-w-xl">
                  {project.blurb}
                </p>
              )}

              {/* Keyboard Hint */}
              <div className="pt-8 border-t border-border max-xl:hidden cursor-default">
                <p
                  className="text-xs text-muted-foreground"
                  style={{
                    color: textColor,
                  }}
                >
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
        {/* right side */}
        <div
          className="col-span-9 max-xl:col-span-12 relative"
          ref={rightSpanRef}
        >
          {/* Scroll Hint - Only on slide */}
          {!isScrolling && scrollLength > 1 && !coverVideoPlay && (
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-[50%] -translate-y-[50%] z-[30] pointer-events-auto cursor-pointer p-2 max-xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => scrollNext()}
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

          {/* Scroll Progress */}
          {!coverVideoPlay && (
            <div className="flex gap-2 absolute z-10 bottom-8 left-1/2 -translate-x-[50%] max-xl:hidden">
              <div className="flex items-center gap-1.5">
                {combinedMedia.map((_, index) => {
                  // const segmentStart = index / segmentCount;
                  // const segmentEnd = (index + 1) / segmentCount;

                  // const segmentProgress = useTransform(
                  //   normalizedProgress,
                  //   [segmentStart, segmentEnd],
                  //   [0, 1]
                  // );

                  // const segmentOpacity = useTransform(
                  //   normalizedProgress,
                  //   [
                  //     segmentStart - 0.1, // fade-in start
                  //     segmentStart, // fade-in completed
                  //     segmentEnd, // during segment opacity
                  //     segmentEnd + 0.1, // fade-out start
                  //   ],
                  //   [0.2, 0.8, 0.8, 0.2]
                  // );

                  // const smoothSegmentProgress = useSpring(segmentProgress, {
                  //   stiffness: 120,
                  //   damping: 25,
                  //   mass: 0.7,
                  //   restDelta: 0.001,
                  // });

                  // const smoothSegmentOpacity = useSpring(segmentOpacity, {
                  //   stiffness: 120,
                  //   damping: 25,
                  //   mass: 0.7,
                  //   restDelta: 0.001,
                  // });
                  return (
                    <button
                      key={index}
                      onClick={() => emblaApi?.scrollTo(index)}
                      className="relative h-1.5 w-8 rounded-full cursor-pointer overflow-hidden"
                    >
                      {/* bg */}
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          backgroundColor: textColor,
                          opacity:
                            scrollProgress === 0 && index === 0
                              ? 0.8
                              : // : smoothSegmentOpacity,
                                smoothSegmentOpacities[index],
                        }}
                      />

                      {/* dynamic progress */}
                      <motion.div
                        className="absolute inset-0 rounded-full origin-left"
                        style={{
                          // scaleX: smoothSegmentProgress,
                          scaleX: smoothSegmentProgresses[index],
                          backgroundColor: textColor,
                          opacity: 1,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!coverVideoPlay && project.cover_video_url && (
            <div
              className="flex gap-2 absolute z-10 bottom-8 left-8 max-xl:hidden "
              style={{}}
            >
              <button
                onClick={() => {
                  setCoverVideoPlay(true);
                }}
                className="flex h-12 w-12 items-center justify-center rounded-full text-foreground transition-colors cursor-pointer max-xl:cursor-default hover:opacity-80"
                aria-label="Close menu"
                style={{
                  backgroundColor: textColor,
                }}
              >
                <Clapperboard
                  className="h-5 w-5"
                  style={{ color: backgroundColor }}
                />
              </button>
            </div>
          )}

          <div className="embla">
            <div className="embla__viewport" ref={emblaRef}>
              <div className="embla__container max-xl:flex max-xl:flex-col">
                {combinedMedia.map((item, i) => {
                  const parentWidth = rightSpanRef.current?.clientWidth || 0;

                  let widthValue = parentWidth; // %100
                  let heightValue = height; // default fallback 100%

                  if (width > 1280) {
                    widthValue = parentWidth;
                    heightValue = height;
                  } else {
                    widthValue = parentWidth;
                    heightValue = 350;
                  }
                  return (
                    <div className="embla_slide " key={i}>
                      {/* Scroll Pagination */}
                      <div className="flex">
                        <div
                          style={{
                            width: widthValue,
                            height: width < 1280 ? "40dvh" : `${heightValue}px`,
                          }}
                        >
                          <div
                            className={`relative w-full h-full  ${
                              project.slug === "otis-tarda" ? "bg-black" : ""
                            }`}
                          >
                            {project.cover_video_url && coverVideoPlay && (
                              <>
                                {project.cover_video_url.includes(
                                  "youtube.com"
                                ) ||
                                project.cover_video_url.includes("youtu.be") ? (
                                  <ReactPlayer
                                    src={project.cover_video_url}
                                    controls // use YouTube controller
                                    muted
                                    loop
                                    width="100%"
                                    height="100%"
                                    playing
                                  />
                                ) : (
                                  <ReactPlayer
                                    src={project.cover_video_url}
                                    controls={true} // use Custom controller
                                    muted
                                    loop
                                    width="100%"
                                    height="100%"
                                    playing
                                  />
                                  /* build Custom controller */
                                )}
                              </>
                            )}

                            {!coverVideoPlay && (
                              <>
                                {item.media_type === "cover_image" &&
                                item.media_url ? (
                                  <Image
                                    src={item.media_url}
                                    alt={`${project.title} + media ${i} + url ${item.media_url}`}
                                    fill
                                    className={`${
                                      project.slug === "otis-tarda"
                                        ? "object-contain"
                                        : "object-cover"
                                    }`}
                                  />
                                ) : item.media_type === "image" &&
                                  item.media_url ? (
                                  <Image
                                    src={item.media_url}
                                    alt={`${project.title} + media ${i} + url ${item.media_url}`}
                                    fill
                                    className={`${
                                      project.slug === "otis-tarda"
                                        ? "object-contain"
                                        : "object-cover"
                                    }`}
                                  />
                                ) : null}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
