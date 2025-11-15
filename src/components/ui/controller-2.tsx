import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import screenfull from "screenfull";
import ReactPlayer from "react-player";
import { CircleStop, Fullscreen, Pause, Play } from "lucide-react";
import Duration from "@/components/ui/VideoDuration";
import { AnimatePresence } from "framer-motion";

type ControllerProps = {
  src: string;
};

export default function Controller2({ src }: ControllerProps) {
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
  const [_transition, startTransition] = useTransition();

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

  //   This one lagging during time change
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

  //   Works fine during time change
  useEffect(() => {
    let animationFrame: any = null;

    const update = () => {
      const player = playerRef.current;
      if (!player || state.seeking) {
        animationFrame = requestAnimationFrame(update);
        return;
      }

      if (!player.duration) {
        animationFrame = requestAnimationFrame(update);
        return;
      }

      //   setState((prevState) => ({
      //     ...prevState,
      //     playedSeconds: player.currentTime,
      //     played: player.currentTime / player.duration,
      //   }));

      setState((prevState) => ({
        ...prevState,
        playedSeconds: player.currentTime,
        played: Math.min(Math.max(player.currentTime / player.duration, 0), 1),
      }));

      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationFrame);
  }, [state.seeking]);

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
      <ReactPlayer
        className="react-player"
        ref={setPlayerRef}
        src={src}
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
        // onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onDurationChange={handleDurationChange}
        width="100%"
        height="100%"
        style={{
          objectFit: "cover",
        }}
      />

      {/* Custom Controller */}
      <div className="max-w-[992px] w-full mx-auto absolute bottom-8 right-0 left-1/2 -translate-x-[50%] text-white">
        <div className="grid grid-cols-12 justify-center items-center gap-x-4">
          {/* Controller Header */}

          {/* Controller Content with smooth animation */}

          {/* Controller */}
          <div className="flex justify-center items-center col-span-2">
            <div className="flex items-center justify-center flex-1">
              <button
                type="button"
                onClick={handlePlayPause}
                className=" cursor-pointer"
              >
                {playing ? (
                  <Pause width={20} height={20} />
                ) : (
                  <Play width={20} height={20} />
                )}
              </button>
            </div>

            {/* Current duration */}

            <Duration
              seconds={duration * played}
              className="min-w-[50px] flex flex-1 justify-center items-center"
            />
          </div>

          {/* Seek */}
          <div className="relative cursor-pointer overflow-hidden col-span-8">
            {/* Dashed track (background) */}
            <div
              className="absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none"
              style={{
                height: "1px",
                backgroundImage:
                  "linear-gradient(to right, white 33%, rgba(255,255,255,0) 0%)",
                backgroundPosition: "bottom",
                backgroundSize: "5px 1px",
                backgroundRepeat: "repeat-x",
              }}
            />

            {/* Played portion */}
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 pointer-events-none z-10"
              style={{
                height: "2px",
                width: `${played * 100}%`, // played between 0-1 float
                backgroundColor: "white",
              }}
            />

            {/* Slider input */}
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
              className="w-full h-2 bg-transparent appearance-none z-20 relative cursor-pointer controller-thumb box-border "
              style={{
                WebkitAppearance: "none",
              }}
            />
          </div>

          {/* Muted & Loop */}
          <div className="flex justify-between col-span-2">
            <div>
              <span>
                <Duration seconds={duration} />
              </span>
            </div>
            <div
              onClick={handleToggleMuted}
              className="whitespace-nowrap cursor-pointer flex justify-center items-center"
            >
              {muted ? "SOUNDS OFF" : "SOUNDS ON"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
