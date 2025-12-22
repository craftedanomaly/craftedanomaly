"use client";

import { useWindowSize } from "@/hooks/useWindowSize";
import { supabase } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  X,
  Clapperboard,
  CircleStop,
  Pause,
  Play,
  Fullscreen,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import WheelGesturesPlugin from "embla-carousel-wheel-gestures";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { EmblaCarouselType } from "embla-carousel";
import { useRouter } from "next/navigation";
import ReactPlayer from "react-player";
import screenfull from "screenfull";
import Duration from "@/components/ui/VideoDuration";
import Controller from "@/components/ui/controller";
import Controller2 from "@/components/ui/controller-2";
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
  display_order: number;
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
    media_url: string;
    display_order: number;
    content: any;
  }>;
}

const VideoSlide = ({
  url,
  isYouTube,
  width,
  height,
}: {
  url: string,
  isYouTube: boolean,
  width: number,
  height: number,
  isScrolling: boolean
}) => {
  const slideHeightValue = width > 1280 ? height : 350;
  const preferredVideoWidth = slideHeightValue * (16 / 9);
  const videoWidthPx = Math.max(preferredVideoWidth, width);

  return (
    <div
      className="absolute inset-0 bg-black overflow-hidden pointer-events-none"
    >
      {isYouTube ? (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: videoWidthPx ? `${videoWidthPx}px` : "120%",
            height: slideHeightValue ? `${slideHeightValue}px` : "100%",
            minWidth: "100%",
          }}
        >
          <ReactPlayer
            src={url}
            controls={false}
            width="100%"
            height="100%"
            muted={true}
            playing={true}
            loop={true}
          />
        </div>
      ) : (
        <Controller2 src={url} />
      )}
    </div>
  );
};

export function NewDesignLayout({

  project,
  media,
  tags,
  blocks,
}: VisualDesignLayoutProps) {
  const rightSpanRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [activeSlideIndex, setActiveSldieIndex] = useState<number | null>(0);
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

  const [isDragging, setIsDragging] = useState<boolean>(false);

  const rightPaneWidth = rightSpanRef.current?.clientWidth || width || 0;
  const coverFrameHeight = width > 1280 ? height : 350;
  const coverVideoWidth = coverFrameHeight
    ? Math.max(coverFrameHeight * (16 / 9), rightPaneWidth)
    : rightPaneWidth;

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
        dragFree: false, // Changed for snapping
        containScroll: "trimSnaps",
        align: "start",
        duration: 10, // Faster snap
      }
      : undefined,
    width > 1280
      ? [
        WheelGesturesPlugin({
          forceWheelAxis: "y",
          target: document.documentElement,
          // @ts-ignore
          wheelScale: 8, // 8x faster
        }),
      ]
      : undefined
  );

  // Next Slide
  const scrollPrev = useCallback(() => {
    if (!isScrolling) setIsScrolling(true);
    setIsScrolled(true);
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  // Previous Slide
  const scrollNext = useCallback(() => {
    if (!isScrolling) setIsScrolling(true);
    setIsScrolled(true);
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) setScrollLength(emblaApi?.scrollSnapList().length);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setActiveSldieIndex(emblaApi.selectedScrollSnap());
    };

    const onScroll = () => {
      setIsScrolled(true);
      setIsScrolling(true);
    };
    const onSettle = () => setIsScrolling(false);

    emblaApi.on("select", onSelect);
    emblaApi.on("scroll", onScroll);
    emblaApi.on("settle", onSettle);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("scroll", onScroll);
      emblaApi.off("settle", onSettle);
    };
  }, [emblaApi]);

  // Scroll progress
  const [scrollProgress, setScrollProgress] = useState<number>(0);

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
        display_order: -1,
      },
    ]
    : [];

  const processedMedia = media.map((m) => ({
    media_type: m.media_type === "image" ? "image" : "video",
    media_url: m.url ? m.url : "failed",
    display_order: m.display_order,
  }));

  let combinedMedia = [...coverImageMedia, ...processedMedia]?.filter(
    (i) => i.media_url !== "failed"
  );

  // add blocks if video, before_after or testimonial type
  blocks.forEach((block) => {
    if (["video", "before_after", "testimonial"].includes(block.block_type)) {
      const newDisplayOrder = block.display_order + 1;
      combinedMedia.forEach((item) => {
        if (
          item.display_order !== undefined &&
          item.display_order >= newDisplayOrder
        ) {
          item.display_order += 1;
        }
      });
      combinedMedia.push({
        media_type: block.block_type,
        media_url: block.media_url,
        display_order: newDisplayOrder,
      });
    }
  });

  const nonMediaBlocks = blocks.filter(
    (b) => !["video", "before_after", "testimonial"].includes(b.block_type)
  );

  combinedMedia.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  // Smooth progress pagination
  const scrollMotion = useMotionValue(0); // between 0-100
  const normalizedProgress = useTransform(scrollMotion, [0, 100], [0, 1]);

  useEffect(() => {
    scrollMotion.set(scrollProgress); // scrollProgress = 0-100
  }, [scrollProgress, scrollMotion]);

  const segmentCount = combinedMedia.length;

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

  // non youtube video controller states/settings
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const initialState = {
    pip: false,
    playing: false,
    controls: false,
    light: false,
    volume: 1,
    muted: false,
    played: 0,
    loaded: 0,
    duration: 0,
    playbackRate: 1.0,
    loop: false,
    seeking: false,
    loadedSeconds: 0,
    playedSeconds: 0,
  };

  type PlayerState = Omit<typeof initialState, "src"> & {
    src?: string;
  };

  const [state, setState] = useState<PlayerState>(initialState);

  const handlePlayPause = () => {
    setState((prevState) => ({ ...prevState, playing: !prevState.playing }));
  };

  const handleStop = () => {
    setState((prevState) => ({ ...prevState, playing: false }));
  };

  const handleToggleLoop = () => {
    setState((prevState) => ({ ...prevState, loop: !prevState.loop }));
  };

  const handleVolumeChange = (
    event: React.SyntheticEvent<HTMLInputElement>
  ) => {
    const inputTarget = event.target as HTMLInputElement;
    setState((prevState) => ({
      ...prevState,
      volume: Number.parseFloat(inputTarget.value),
    }));
  };

  const handleToggleMuted = () => {
    setState((prevState) => ({ ...prevState, muted: !prevState.muted }));
  };
  const handleSetPlaybackRate = (
    event: React.SyntheticEvent<HTMLButtonElement>
  ) => {
    const buttonTarget = event.target as HTMLButtonElement;
    setState((prevState) => ({
      ...prevState,
      playbackRate: Number.parseFloat(`${buttonTarget.dataset.value}`),
    }));
  };

  const handleRateChange = () => {
    const player = playerRef.current;
    if (!player) return;

    setState((prevState) => ({
      ...prevState,
      playbackRate: player.playbackRate,
    }));
  };

  const handlePlay = () => {
    console.log("onPlay");
    setState((prevState) => ({ ...prevState, playing: true }));
  };

  const handlePause = () => {
    console.log("onPause");
    setState((prevState) => ({ ...prevState, playing: false }));
  };

  const handleSeekMouseDown = () => {
    setState((prevState) => ({ ...prevState, seeking: true }));
  };

  const handleSeekChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const inputTarget = event.target as HTMLInputElement;
    setState((prevState) => ({
      ...prevState,
      played: Number.parseFloat(inputTarget.value),
    }));
  };

  const handleSeekMouseUp = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const inputTarget = event.target as HTMLInputElement;
    setState((prevState) => ({ ...prevState, seeking: false }));
    if (playerRef.current) {
      playerRef.current.currentTime =
        Number.parseFloat(inputTarget.value) * playerRef.current.duration;
    }
  };

  const handleProgress = () => {
    const player = playerRef.current;
    if (!player || state.seeking || !player.buffered?.length) return;

    setState((prevState) => ({
      ...prevState,
      loadedSeconds: player.buffered?.end(player.buffered?.length - 1),
      loaded:
        player.buffered?.end(player.buffered?.length - 1) / player.duration,
    }));
  };

  const handleTimeUpdate = () => {
    const player = playerRef.current;
    if (!player || state.seeking) return;

    if (!player.duration) return;

    setState((prevState) => ({
      ...prevState,
      playedSeconds: player.currentTime,
      played: player.currentTime / player.duration,
    }));
  };

  const handleEnded = () => {
    console.log("onEnded");
    setState((prevState) => ({ ...prevState, playing: prevState.loop }));
  };

  const handleClickFullscreen = () => {
    const reactPlayer = document.querySelector(".react-player");
    if (reactPlayer) screenfull.request(reactPlayer);
  };

  const handleDurationChange = () => {
    const player = playerRef.current;
    if (!player) return;
    setState((prevState) => ({ ...prevState, duration: player.duration }));
  };

  const setPlayerRef = useCallback((player: HTMLVideoElement) => {
    if (!player) return;
    playerRef.current = player;
  }, []);

  const {
    playing,
    controls,
    light,
    volume,
    muted,
    loop,
    played,
    loaded,
    duration,
    playbackRate,
    pip,
  } = state;

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
            <div>
              <div className="relative flex flex-col w-full mb-10 max-md:mb-0">
                {/* Category Info - Animated */}
                <motion.div
                  className="flex justify-center"
                  animate={{
                    y: (activeSlideIndex || 0) > 0 ? -40 : 0,
                    scale: (activeSlideIndex || 0) > 0 ? 0.9 : 1,
                    opacity: (activeSlideIndex || 0) > 0 ? 0.8 : 1
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <div className="min-h-[400px] max-md:min-h-auto">
                    <div className="space-y-4 mt-10 max-md:mt-0">
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
                      <p className="text-[17px] leading-relaxed max-w-xl mt-8">
                        {project.blurb}
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* --- nonMediaBlocks --- */}
                <div
                  className="relative mt-0"
                  style={{
                    display: width <= 768 ? "none" : "initial",
                  }}
                >
                  <div className="min-h-[100dvh] absolute w-full top-0"> {/* Adjusted positioning */}
                    <AnimatePresence mode="wait">
                      {nonMediaBlocks.map((block) => {
                        if (block.display_order !== activeSlideIndex)
                          return null;
                        const isActive =
                          block.display_order === activeSlideIndex;

                        return (
                          <motion.div
                            key={block.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{
                              opacity: isActive ? 1 : 0,
                              y: isActive ? 0 : 30,
                            }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="overflow-hidden mt-auto pt-8"
                          >
                            {block.block_type === "text" && (
                              <div
                                className="prose max-w-xl text-lg"
                                dangerouslySetInnerHTML={{
                                  __html: block.content,
                                }}
                              />
                            )}

                            {block.block_type === "quote" && (
                              <blockquote className="border-l-4 border-current pl-6 py-4 italic text-lg opacity-90">
                                {block.content}
                              </blockquote>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Keyboard Hint */}
                {/* <div className="pt-8 border-t border-border max-xl:hidden cursor-default">
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
              </div> */}
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
          {!isScrolled && scrollLength > 1 && !coverVideoPlay && (
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

          {coverVideoPlay && project.cover_video_url ? (
            <div className="relative h-full">
              {project.cover_video_url.includes("youtube.com") ||
                project.cover_video_url.includes("youtu.be") ? (
                <div className="absolute inset-0 overflow-hidden bg-black">
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      width: coverVideoWidth
                        ? `${Math.max(coverVideoWidth, rightPaneWidth)}px`
                        : "120%",
                      height: coverFrameHeight
                        ? `${coverFrameHeight}px`
                        : "100%",
                      minWidth: "100%",
                    }}
                  >
                    <ReactPlayer
                      src={project.cover_video_url}
                      controls // use YouTube controller
                      muted
                      loop
                      playing
                      width="100%"
                      height="100%"
                    />
                  </div>
                </div>
              ) : (
                <Controller2 src={project.cover_video_url} />
              )}
            </div>
          ) : (
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

                    const isYouTube =
                      item.media_url?.includes("youtube.com") ||
                      item.media_url?.includes("youtu.be");
                    const slideHeightValue = width > 1280 ? heightValue : 350;
                    const preferredVideoWidth =
                      (slideHeightValue || heightValue || 0) * (16 / 9);
                    const videoWidthPx = Math.max(
                      preferredVideoWidth || 0,
                      widthValue || 0
                    );

                    return (
                      <div
                        className="embla_slide cursor-default"
                        key={i}
                        onMouseDown={() => setIsDragging(true)}
                        onMouseUp={() => setIsDragging(false)}
                        style={{ cursor: isDragging ? "grabbing" : "grab" }}
                      >
                        {/* play btn for cover video */}
                        {!coverVideoPlay &&
                          project.cover_video_url &&
                          item.media_type === "cover_image" && (
                            <div
                              className="flex gap-2 absolute z-10 bottom-8 left-8 max-xl:hidden "
                              style={{}}
                            >
                              <button
                                onClick={() => {
                                  setCoverVideoPlay(true);
                                  handlePlayPause();
                                  setIsOpen(true);
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

                        {/* slide content */}
                        <div className="flex">
                          <div
                            style={{
                              width: widthValue,
                              height:
                                width < 1280 ? "298px" : `${heightValue}px`,
                            }}
                          >
                            <div
                              className={`relative w-full h-full  ${project.slug === "otis-tarda" ? "bg-black" : ""
                                }`}
                            >
                              {/* IMAGE RENDER */}
                              {!coverVideoPlay &&
                                (item.media_type === "image" ||
                                  item.media_type === "cover_image") && (
                                  <Image
                                    src={item.media_url}
                                    alt={`${project.title} + media ${i} + url ${item.media_url}`}
                                    fill
                                    className={`${project.slug === "otis-tarda"
                                      ? "object-contain"
                                      : "object-cover"
                                      }`}
                                  />
                                )}

                              {/* VIDEO RENDER */}
                              {!coverVideoPlay &&
                                item.media_type === "video" && (
                                  <VideoSlide
                                    url={item.media_url}
                                    isYouTube={isYouTube}
                                    width={widthValue}
                                    height={heightValue}
                                    isScrolling={isScrolling}
                                  />
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
          )}
        </div>
      </div >
    </>
  );
}
