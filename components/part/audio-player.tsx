"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Headphones } from "lucide-react";

interface AudioPlayerProps {
  src?: string;
  title?: string;
  partNumber?: number;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ src, title, partNumber }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoaded = () => setDuration(audio.duration);
    audio.addEventListener("loadedmetadata", onLoaded);
    return () => audio.removeEventListener("loadedmetadata", onLoaded);
  }, []);

  if (!src) {
    return (
      <div className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-surface">
        <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
          <Headphones className="w-5 h-5 text-gold/50" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-secondary">Audio coming soon</p>
          <p className="text-xs text-text-muted mt-0.5">Audio version will be available shortly</p>
        </div>
      </div>
    );
  }

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(isNaN(pct) ? 0 : pct);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + seconds);
  };

  return (
    <div className="p-5 rounded-2xl border border-border bg-surface">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Track info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
          <Headphones className="w-4 h-4 text-gold" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-text truncate">
            {title || `Part ${partNumber} — Audio`}
          </p>
          <p className="text-xs text-text-muted">Audio Version</p>
        </div>
        <button
          onClick={() => {
            if (!audioRef.current) return;
            audioRef.current.muted = !muted;
            setMuted(!muted);
          }}
          className="ml-auto text-text-muted hover:text-text-secondary transition-colors"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-1.5 bg-surface-raised rounded-full mb-3 cursor-pointer group/bar"
        onClick={handleSeek}
      >
        <div
          className="h-1.5 bg-gold rounded-full transition-all relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gold opacity-0 group-hover/bar:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Time */}
      <div className="flex justify-between text-xs text-text-muted mb-4">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => skip(-15)}
          className="text-text-muted hover:text-text-secondary transition-colors"
          title="Back 15s"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-gold text-ink hover:bg-gold-light transition-colors flex items-center justify-center shadow-lg shadow-gold/20"
        >
          {playing ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        <button
          onClick={() => skip(15)}
          className="text-text-muted hover:text-text-secondary transition-colors"
          title="Forward 15s"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
