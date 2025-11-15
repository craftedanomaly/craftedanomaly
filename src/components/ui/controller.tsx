import { useCallback, useRef, useState } from "react";
import screenfull from "screenfull";
import ReactPlayer from "react-player";
import { CircleStop, Fullscreen, Pause, Play } from "lucide-react";
import Duration from "@/components/ui/VideoDuration";

type ControllerProps = {
  src: string;
};

export default function Controller({ src }: ControllerProps) {
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
            isOpen ? "max-h-[1000px] opacity-100 p-4" : "max-h-0 opacity-0"
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
            <label htmlFor="seek" className="block text-xs mb-1 text-gray-400">
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
              Remaining: <Duration seconds={duration * (1 - played)} />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
