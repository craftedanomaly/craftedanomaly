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

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { EmblaCarouselType } from "embla-carousel";
import { useRouter } from "next/navigation";
import ReactPlayer from "react-player";
import screenfull from "screenfull";
import Duration from "@/components/ui/VideoDuration";
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
    // We only want to update time slider if we are not currently seeking
    if (!player || state.seeking || !player.buffered?.length) return;

    console.log("onProgress");

    setState((prevState) => ({
      ...prevState,
      loadedSeconds: player.buffered?.end(player.buffered?.length - 1),
      loaded:
        player.buffered?.end(player.buffered?.length - 1) / player.duration,
    }));
  };

  const handleTimeUpdate = () => {
    const player = playerRef.current;
    // We only want to update time slider if we are not currently seeking
    if (!player || state.seeking) return;

    console.log("onTimeUpdate", player.currentTime);

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

    console.log("onDurationChange", player.duration);
    setState((prevState) => ({ ...prevState, duration: player.duration }));
  };

  const setPlayerRef = useCallback((player: HTMLVideoElement) => {
    if (!player) return;
    playerRef.current = player;
    console.log(player);
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

          {coverVideoPlay && project.cover_video_url ? (
            <div className="relative h-full">
              {project.cover_video_url.includes("youtube.com") ||
              project.cover_video_url.includes("youtu.be") ? (
                <ReactPlayer
                  src={project.cover_video_url}
                  controls // use YouTube controller
                  muted
                  loop
                  width="100%"
                  height="100%"
                  playing
                  style={{
                    objectFit: "cover",
                  }}
                />
              ) : (
                <>
                  <ReactPlayer
                    className="react-player"
                    ref={setPlayerRef}
                    src={project.cover_video_url}
                    pip={pip}
                    playing={playing}
                    controls={false}
                    light={light}
                    loop={loop}
                    playbackRate={playbackRate}
                    volume={volume}
                    muted={muted}
                    config={{
                      youtube: {
                        color: "white",
                      },
                      vimeo: {
                        color: "ffffff",
                      },
                      spotify: {
                        preferVideo: true,
                      },
                      tiktok: {
                        fullscreen_button: true,
                        progress_bar: true,
                        play_button: true,
                        volume_control: true,
                        timestamp: false,
                        music_info: false,
                        description: false,
                        rel: false,
                        native_context_menu: true,
                        closed_caption: false,
                      },
                    }}
                    onLoadStart={() => console.log("onLoadStart")}
                    onReady={() => console.log("onReady")}
                    onStart={(e) => console.log("onStart", e)}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onRateChange={handleRateChange}
                    onSeeking={(e) => console.log("onSeeking", e)}
                    onSeeked={(e) => console.log("onSeeked", e)}
                    onEnded={handleEnded}
                    onError={(e) => console.log("onError", e)}
                    onTimeUpdate={handleTimeUpdate}
                    onProgress={handleProgress}
                    onDurationChange={handleDurationChange}
                    width="100%"
                    height="100%"
                    style={{
                      objectFit: "cover",
                    }}
                  />

                  {/* Custom Controller */}
                  {/* <div className="absolute bottom-8 left-8">
                    <div className="flex">
                      <button type="button" onClick={handleStop}>
                        Stop
                      </button>
                      <button type="button" onClick={handlePlayPause}>
                        {playing ? "Pause" : "Play"}
                      </button>
                      <button type="button" onClick={handleClickFullscreen}>
                        Fullscreen
                      </button>
                    </div>

                    <div>Speed</div>
                    <button
                      type="button"
                      onClick={handleSetPlaybackRate}
                      data-value={1}
                    >
                      1x
                    </button>
                    <button
                      type="button"
                      onClick={handleSetPlaybackRate}
                      data-value={1.5}
                    >
                      1.5x
                    </button>
                    <button
                      type="button"
                      onClick={handleSetPlaybackRate}
                      data-value={2}
                    >
                      2x
                    </button>
                    <div>
                      <label htmlFor="seek">Seek</label>
                    </div>
                    <div>
                      <input
                        id="seek"
                        type="range"
                        min={0}
                        max={0.999999}
                        step="any"
                        value={played}
                        onMouseDown={handleSeekMouseDown}
                        onChange={handleSeekChange}
                        onMouseUp={handleSeekMouseUp}
                      />
                    </div>
                    <div>Volume</div>
                    <input
                      id="volume"
                      type="range"
                      min={0}
                      max={1}
                      step="any"
                      value={volume}
                      onChange={handleVolumeChange}
                    />

                    <div>Muted</div>
                    <input
                      id="muted"
                      type="checkbox"
                      checked={muted}
                      onChange={handleToggleMuted}
                    />

                    <div>Loop</div>
                    <input
                      id="loop"
                      type="checkbox"
                      checked={loop}
                      onChange={handleToggleLoop}
                    />
                    <div>Played</div>
                    <progress max={1} value={played} />
                    <div>Loaded</div>
                    <progress max={1} value={loaded} />

                    <div>Duration</div>
                    <Duration seconds={duration * played} />
                    <div>Remaining</div>
                    <Duration seconds={duration * (1 - played)} />
                  </div> */}

                  <div className="absolute bottom-0 right-0 w-80">
                    {/* Controller Header */}
                    <div
                      onClick={() => setIsOpen(!isOpen)}
                      className="text-white px-4 py-2 cursor-pointer select-none flex justify-between items-center backdrop-blur-md backdrop-brightness-150 shadow-lg rounded-tl-2xl overflow-hidden border-r-0 border-b-0"
                      style={{
                        borderLeft: "2px solid rgba(0,0,0,0.2)",
                        borderTop: "2px solid rgba(0,0,0,0.2)",
                      }}
                    >
                      <span className="text-sm">Controller</span>
                      <span className="text-sm">{isOpen ? "−" : "+"}</span>
                    </div>

                    {/* Controller Content with smooth animation */}
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        isOpen
                          ? "max-h-[1000px] opacity-100 p-4"
                          : "max-h-0 opacity-0"
                      } bg-gray-950/80 rounded-b-lg shadow-lg backdrop-blur-md text-white space-y-4 backdrop-brightness-150 `}
                    >
                      {/* Controller */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleStop}
                          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md transition"
                        >
                          <CircleStop width={20} height={20} />
                        </button>
                        <button
                          type="button"
                          onClick={handlePlayPause}
                          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md transition"
                        >
                          {playing ? (
                            <Pause width={20} height={20} />
                          ) : (
                            <Play width={20} height={20} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleClickFullscreen}
                          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md transition"
                        >
                          <Fullscreen width={20} height={20} />
                        </button>
                      </div>

                      {/* Speed */}
                      <div className="flex items-center gap-2">
                        {[1, 1.5, 2].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={handleSetPlaybackRate}
                            data-value={rate}
                            className={`px-2 text-xs py-1 rounded-md transition ${
                              playbackRate === rate
                                ? "bg-gray-700 border border-transparent"
                                : "border hover:bg-gray-700 transition-all duration-300 cursor-pointer "
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>

                      {/* Seek */}
                      <div>
                        <label
                          htmlFor="seek"
                          className="block text-xs mb-1 text-gray-400"
                        >
                          Seek
                        </label>
                        <div className="video-timeline">
                          <input
                            id="seek"
                            type="range"
                            min={0}
                            max={0.999999}
                            step="any"
                            value={played}
                            onMouseDown={handleSeekMouseDown}
                            onChange={handleSeekChange}
                            onMouseUp={handleSeekMouseUp}
                            className="w-full h-2 rounded-lg smooth-seek"
                          />
                        </div>
                      </div>

                      {/* Volume */}
                      <div>
                        <label
                          htmlFor="volume"
                          className="block text-xs mb-1 text-gray-400"
                        >
                          Volume
                        </label>
                        <input
                          id="volume"
                          type="range"
                          min={0}
                          max={1}
                          step="any"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-full h-2 rounded-lg smooth-volume"
                        />
                      </div>

                      {/* Muted & Loop */}
                      <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-1 text-xs text-gray-400">
                          <input
                            type="checkbox"
                            checked={muted}
                            onChange={handleToggleMuted}
                            className="accent-red-600"
                          />
                          Muted
                        </label>
                        <label className="flex items-center gap-1 text-xs text-gray-400">
                          <input
                            type="checkbox"
                            checked={loop}
                            onChange={handleToggleLoop}
                            className="accent-yellow-600"
                          />
                          Loop
                        </label>
                      </div>

                      {/* Progress Bars */}
                      {/* <div> */}
                      {/* <div className="flex justify-between text-xs mb-1">
                          <label className="block text-xs mb-1 text-gray-400">
                            Played
                          </label>
                          <label className="block text-xs mb-1 text-gray-400">
                            Loaded
                          </label>
                        </div> */}
                      {/* <div className="flex gap-2">
                          <progress
                            max={1}
                            value={played}
                            className="w-1/2 h-2 rounded-lg bg-gray-700 accent-blue-400"
                          />
                          <progress
                            max={1}
                            value={loaded}
                            className="w-1/2 h-2 rounded-lg bg-gray-700 accent-green-400"
                          />
                        </div> */}
                      {/* </div> */}

                      {/* Duration & Remaining */}
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>
                          Duration: <Duration seconds={duration * played} />
                        </span>
                        <span>
                          Remaining:{" "}
                          <Duration seconds={duration * (1 - played)} />
                        </span>
                      </div>
                    </div>
                  </div>
                </>
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
                    return (
                      <div className="embla_slide " key={i}>
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
                        <div className="flex">
                          <div
                            style={{
                              width: widthValue,
                              height:
                                width < 1280 ? "298px" : `${heightValue}px`,
                            }}
                          >
                            <div
                              className={`relative w-full h-full  ${
                                project.slug === "otis-tarda" ? "bg-black" : ""
                              }`}
                            >
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
          )}
        </div>
      </div>
    </>
  );
}
