"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface VideoPlayerProps {
  src?: string;
  title?: string;
  poster?: string;
}

export function VideoPlayer({ src, title, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!src) {
    return (
      <div className="aspect-video rounded-2xl bg-surface border border-border flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
          <Play className="w-7 h-7 text-gold/60 ml-1" />
        </div>
        <div className="text-center">
          <p className="text-text-secondary text-sm font-medium">Video coming soon</p>
          <p className="text-text-muted text-xs mt-1">This content will be available shortly</p>
        </div>
      </div>
    );
  }

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
      setStarted(true);
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(isNaN(pct) ? 0 : pct);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-black relative group">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="none"
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => { setPlaying(false); setStarted(false); }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        title={title}
      />

      {/* Pre-play overlay — always visible before first play */}
      {!started && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/30"
        >
          <div className="w-20 h-20 rounded-full bg-gold/20 border-2 border-gold/50 backdrop-blur-sm flex items-center justify-center hover:bg-gold/30 hover:scale-105 transition-all duration-200 shadow-2xl shadow-black/50">
            <Play className="w-9 h-9 text-gold ml-1.5" />
          </div>
          {title && (
            <p className="text-white/80 text-sm font-medium max-w-xs text-center px-4 drop-shadow">
              {title}
            </p>
          )}
        </button>
      )}

      {/* Controls — show on hover once started, always show when paused-mid-video */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 transition-all duration-200 ${
        started ? "opacity-0 group-hover:opacity-100" : "opacity-0"
      }`}>
        <div
          className="w-full h-1 bg-white/25 rounded-full mb-3 cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-1 bg-gold rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            {playing ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
          </button>

          <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <div className="flex-1" />

          <button
            onClick={() => videoRef.current?.requestFullscreen()}
            className="text-white/70 hover:text-white transition-colors"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
