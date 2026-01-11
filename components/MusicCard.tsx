"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MusicData } from "@/lib/notion";
import NotionImage from "@/components/NotionImage"; // ✅ 추가

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

/* YouTube ID 추출 */
function extractYoutubeId(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

function formatTime(sec: number) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MusicCard({ list }: { list: MusicData[] }) {
  const tracks = list ?? [];
  const [index, setIndex] = useState(0);

  const currentTrack = tracks[index] ?? null;

  const videoId = useMemo(
    () => extractYoutubeId(currentTrack?.url),
    [currentTrack?.url]
  );

  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  /* YouTube API 로드 */
  useEffect(() => {
    if (!videoId) return;

    const loadApi = () =>
      new Promise<void>((resolve) => {
        if (window.YT?.Player) return resolve();

        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);

        window.onYouTubeIframeAPIReady = () => resolve();
      });

    let cancelled = false;

    (async () => {
      await loadApi();
      if (cancelled || !hostRef.current) return;

      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        resetProgress();
        return;
      }

      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (e: any) => {
            setDuration(e.target.getDuration());
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setPlaying(true);
              startLoop();
            }
            if (e.data === window.YT.PlayerState.PAUSED) {
              setPlaying(false);
              stopLoop();
            }
            if (e.data === window.YT.PlayerState.ENDED) {
              stopLoop();
              goNext();
            }
          },
        },
      });
    })();

    return () => {
      cancelled = true;
      stopLoop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  /* 진행바 RAF 루프 */
  const startLoop = () => {
    stopLoop();

    const tick = () => {
      if (!playerRef.current) return;

      const cur = playerRef.current.getCurrentTime();
      const dur = playerRef.current.getDuration();

      setCurrent(cur);
      setDuration(dur);
      setProgress(dur > 0 ? (cur / dur) * 100 : 0);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const stopLoop = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const resetProgress = () => {
    stopLoop();
    setCurrent(0);
    setDuration(0);
    setProgress(0);
    setPlaying(false);
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    const state = playerRef.current.getPlayerState();
    if (state === window.YT.PlayerState.PLAYING)
      playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const goPrev = () => {
    if (!tracks.length) return;
    resetProgress();
    setIndex((i) => (i - 1 + tracks.length) % tracks.length);
  };

  const goNext = () => {
    if (!tracks.length) return;
    resetProgress();
    setIndex((i) => (i + 1) % tracks.length);
  };

  return (
    <div className="card p-10 flex flex-col items-center">
      {/* iframe host */}
      <div
        ref={hostRef}
        className="absolute -left-[9999px] top-0 w-px h-px"
      />

      {/* Cover */}
      <div className="w-[220px] h-[220px] rounded-[36px] overflow-hidden bg-slate-100">
        {currentTrack?.cover ? (
         <NotionImage src={currentTrack.cover}
            alt="cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            ♪
          </div>
        )}
      </div>

      {/* Title */}
      <div className="mt-6 text-center">
        <div className="text-[20px] font-semibold">
          {currentTrack?.title ?? "music"}
        </div>
        <div className="mt-1 text-[14px] text-slate-500">
          {currentTrack?.singer ?? ""}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 w-full">
        <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-blue-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-slate-400">
          <span>{formatTime(current)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center gap-6">
        <button
          onClick={goPrev}
          className="w-9 h-9 rounded-full bg-sky-50 text-sky-700"
        >
          ‹
        </button>

        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-blue-500 text-white text-xl"
        >
          {playing ? "❚❚" : "▶"}
        </button>

        <button
          onClick={goNext}
          className="w-9 h-9 rounded-full bg-sky-50 text-sky-700"
        >
          ›
        </button>
      </div>
    </div>
  );
}
