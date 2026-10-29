import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  FileText,
  X,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  HardDrive,
  Radio,
  FileAudio,
  ListPlus,
  Plus,
  Minus,
} from 'lucide-react';
import { Track, QueueItem, RepeatMode, LyricData } from '../types/music';
import { formatDuration, formatBytes } from '../utils/formatters';
import { getActiveLyricIndex } from '../utils/lrcParser';
import { getTrackArtwork, generateBrutalistArtwork } from '../utils/artworkCache';

interface NowPlayingViewProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  volume: number;
  isMuted: boolean;
  queue: QueueItem[];
  currentQueueIndex: number;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSeekStep: (seconds: number) => void;
  onSeekTo?: (seconds: number) => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onVolumeStep: (delta: number) => void;
  onToggleMute: () => void;
  onRemoveFromQueue: (queueItemId: string) => void;
  onMoveQueueItem: (fromIdx: number, toIdx: number) => void;
  onSelectQueueItem: (index: number) => void;
  onUpdateLyricOffset: (trackId: string, deltaMs: number, reset?: boolean) => void;
}

export const NowPlayingView: React.FC<NowPlayingViewProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  repeatMode,
  isShuffle,
  volume,
  isMuted,
  queue,
  currentQueueIndex,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onSeekStep,
  onSeekTo,
  onToggleRepeat,
  onToggleShuffle,
  onVolumeStep,
  onToggleMute,
  onRemoveFromQueue,
  onMoveQueueItem,
  onSelectQueueItem,
  onUpdateLyricOffset,
}) => {
  const [showLyrics, setShowLyrics] = useState(false);
  const activeLyricRef = useRef<HTMLDivElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState<number | null>(null);
  const [artworkSrc, setArtworkSrc] = useState<string>('');

  useEffect(() => {
    if (currentTrack) {
      setArtworkSrc(getTrackArtwork(currentTrack));
    }
  }, [currentTrack?.id, currentTrack?.artworkUrl]);

  const activeLyricIndex =
    currentTrack?.lyrics?.type === 'lrc'
      ? getActiveLyricIndex(
          currentTrack.lyrics.lines,
          currentTime,
          currentTrack.lyrics.offsetMs || 0
        )
      : -1;

  // Auto scroll lyrics smoothly to active line
  useEffect(() => {
    if (showLyrics && activeLyricRef.current && lyricsContainerRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLyricIndex, showLyrics]);

  if (!currentTrack) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none bg-[#09090C]">
        <div className="border-2 border-[#454450] p-8 max-w-md w-full bg-[#13131A] text-left">
          <div className="font-['Archivo_Black'] text-2xl text-[#F0EFEA] mb-2 tracking-wide">
            NO TRACK LOADED
          </div>
          <p className="font-['Space_Grotesk'] text-sm text-[#A3A1AD] mb-6">
            PILIH LAGU DARI LIBRARY ATAU IMPOR FILE AUDIO LOKAL UNTUK MEMULAI PEMUTARAN OFFLINE.
          </p>
          <div className="font-['IBM_Plex_Mono'] text-xs text-[#D7FF3F] border-t border-[#454450] pt-4">
            STATUS: STANDBY // ENGINE READY
          </div>
        </div>
      </div>
    );
  }

  const effectiveDuration = duration > 0 ? duration : currentTrack.duration;
  const currentOffset = currentTrack.lyrics?.offsetMs || 0;

  const displayTime = isScrubbing && scrubTime !== null ? scrubTime : currentTime;
  const currentRatio = effectiveDuration > 0 ? Math.min(1, Math.max(0, displayTime / effectiveDuration)) : 0;

  const calculateSeekTime = (clientX: number): number => {
    if (!progressBarRef.current || effectiveDuration <= 0) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * effectiveDuration;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Safe fallback if pointer capture is unsupported or synthetic
    }
    setIsScrubbing(true);
    const target = calculateSeekTime(e.clientX);
    setScrubTime(target);
    if (onSeekTo) {
      onSeekTo(target);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    const target = calculateSeekTime(e.clientX);
    setScrubTime(target);
    if (onSeekTo) {
      onSeekTo(target);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
    if (isScrubbing && scrubTime !== null && onSeekTo) {
      onSeekTo(scrubTime);
    }
    setIsScrubbing(false);
    setScrubTime(null);
  };

  const handleClickScrubber = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = calculateSeekTime(e.clientX);
    setScrubTime(target);
    if (onSeekTo) {
      onSeekTo(target);
    }
  };

  const handleKeyDownScrubber = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onSeekStep(-5);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onSeekStep(5);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#09090C] text-[#F0EFEA] p-4 md:p-6 lg:p-8 space-y-6">
      {/* Top Banner / Track Heading */}
      <div className="flex items-center justify-between border-b-2 border-[#454450] pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-['IBM_Plex_Mono'] text-xs px-2 py-0.5 bg-[#1C1C26] border border-[#454450] text-[#D7FF3F] font-bold">
              {currentTrack.format}
            </span>
            <span className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD]">
              TRACK {currentQueueIndex + 1} OF {Math.max(1, queue.length)}
            </span>
          </div>
          <h2 className="font-['Archivo_Black'] text-xl md:text-3xl tracking-tight text-[#F0EFEA] truncate mt-1">
            {currentTrack.title}
          </h2>
          <div className="font-['Space_Grotesk'] text-sm md:text-base text-[#A3A1AD] font-semibold truncate">
            {currentTrack.artist} {currentTrack.album ? `— ${currentTrack.album}` : ''}
          </div>
        </div>

        {/* Floating / Direct Lyrics Mode Toggle */}
        <button
          onClick={() => setShowLyrics(!showLyrics)}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-['Space_Grotesk'] font-bold uppercase border transition-all ${
            showLyrics
              ? 'bg-[#D7FF3F] text-black border-[#D7FF3F] shadow-[2px_2px_0px_0px_#454450]'
              : 'bg-[#13131A] text-[#F0EFEA] border-[#454450] hover:border-[#D7FF3F]'
          }`}
          aria-label={showLyrics ? 'Close lyrics panel' : 'Open lyrics panel'}
          aria-expanded={showLyrics}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">LYRICS</span>
          <span className="font-['IBM_Plex_Mono'] text-[10px]">
            {showLyrics ? '[ON]' : '[OFF]'}
          </span>
        </button>
      </div>

      {/* Main Core: Artwork & Side Lyrics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Artwork & Audio Metadata */}
        <div
          className={`transition-all duration-300 ease-out ${
            showLyrics ? 'lg:col-span-6 lg:order-2' : 'lg:col-span-6 lg:col-start-4'
          }`}
        >
          {/* Artwork Container */}
          <div
            className={`relative border-2 ${
              isPlaying
                ? 'border-[#D7FF3F] shadow-[4px_4px_0px_0px_rgba(215,255,63,0.35)]'
                : 'border-[#454450]'
            } bg-[#13131A] aspect-square w-full max-w-[420px] mx-auto overflow-hidden group transition-all duration-200`}
          >
            {/* Real Artwork Display (from embedded metadata or local cached artwork) */}
            <img
              src={artworkSrc || getTrackArtwork(currentTrack)}
              alt={`${currentTrack.title} artwork`}
              className={`w-full h-full object-cover select-none transition-transform duration-500 ${
                isPlaying ? 'scale-[1.02]' : 'scale-100 opacity-90'
              }`}
              onError={() => {
                setArtworkSrc(
                  generateBrutalistArtwork(
                    currentTrack.title,
                    currentTrack.artist,
                    currentTrack.format,
                    currentTrack.id
                  )
                );
              }}
            />

            {/* Playback Status Badge (Live metadata / cache feedback) */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-black/85 backdrop-blur-sm border border-[#454450] text-[10px] font-['IBM_Plex_Mono'] font-bold select-none">
              <span
                className={`w-2 h-2 ${
                  isPlaying
                    ? 'bg-[#D7FF3F] animate-pulse shadow-[0_0_8px_#D7FF3F]'
                    : 'bg-[#A3A1AD]'
                }`}
              />
              <span className={isPlaying ? 'text-[#D7FF3F]' : 'text-[#A3A1AD]'}>
                {isPlaying ? 'PLAYING // ACTIVE' : 'PAUSED // STANDBY'}
              </span>
            </div>

            {/* Audio Stream Visual Indicator when playing */}
            {isPlaying && (
              <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2 py-1 bg-black/85 backdrop-blur-sm border border-[#454450]">
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-1 bg-[#D7FF3F] animate-[bounce_0.8s_infinite_100ms] h-2.5" />
                  <span className="w-1 bg-[#D7FF3F] animate-[bounce_0.8s_infinite_300ms] h-3.5" />
                  <span className="w-1 bg-[#D7FF3F] animate-[bounce_0.8s_infinite_200ms] h-2" />
                </div>
                <span className="text-[9px] font-['IBM_Plex_Mono'] text-[#F0EFEA] uppercase font-bold tracking-wider">
                  METADATA CACHE OK
                </span>
              </div>
            )}

            {/* Floating corner lyric indicator */}
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className={`absolute top-3 right-3 z-10 border p-2 transition-colors ${
                showLyrics
                  ? 'bg-[#D7FF3F] text-black border-[#D7FF3F]'
                  : 'bg-black/85 text-[#F0EFEA] border-[#454450] hover:border-[#D7FF3F] hover:text-[#D7FF3F]'
              }`}
              title="Toggle Lyrics Panel"
              aria-label="Toggle Lyrics Panel"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>

          {/* AUDIO METADATA DIRECTLY UNDER ARTWORK (PRD 7.1, 7.3: SINGLE HORIZONTAL LINE) */}
          <div className="mt-2.5 p-1.5 sm:p-2 bg-[#13131A] border border-[#454450] max-w-[420px] mx-auto flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2.5 font-['IBM_Plex_Mono'] text-[10px] sm:text-xs text-[#A3A1AD] select-none">
            <span className="font-bold text-[#D7FF3F] px-1 py-0.5 bg-[#09090C] border border-[#454450] shrink-0">
              {currentTrack.format}
            </span>
            <span className="shrink-0">{currentTrack.sampleRate ? `${currentTrack.sampleRate / 1000}k` : '44.1k'}</span>
            <span className="text-[#454450] shrink-0">/</span>
            <span className="shrink-0">{currentTrack.bitDepth ? `${currentTrack.bitDepth}b` : '16b'}</span>
            <span className="text-[#454450] shrink-0">/</span>
            <span className="text-[#F0EFEA] font-bold shrink-0">{currentTrack.bitrate || '1411k'}</span>
            <span className="text-[#454450] shrink-0">/</span>
            <span className="shrink-0">{currentTrack.channels === 1 ? 'MONO' : 'STEREO'}</span>
            <span className="text-[#454450] shrink-0">/</span>
            <span className="shrink-0">{formatBytes(currentTrack.fileSize)}</span>
          </div>
        </div>

        {/* Right / Beside: Panel Lirik (PRD 7.1, 11.2) */}
        {showLyrics && (
          <div className="lg:col-span-6 lg:order-1 border-2 border-[#454450] bg-[#13131A] flex flex-col h-[480px]">
            {/* Lyrics Header & Offset Sync Controls (NO SLIDERS - PRD 11.2) */}
            <div className="p-3 border-b-2 border-[#454450] bg-[#1C1C26] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#D7FF3F]"></span>
                <span className="font-['Archivo_Black'] text-sm tracking-wide text-[#F0EFEA]">
                  LIRIK LOKAL ({currentTrack.lyrics?.type?.toUpperCase() || 'NONE'})
                </span>
              </div>

              {/* Step Offset Controls */}
              {currentTrack.lyrics?.type === 'lrc' && (
                <div className="flex items-center gap-1.5 font-['IBM_Plex_Mono'] text-xs">
                  <span className="text-[10px] text-[#A3A1AD] hidden sm:inline">SYNC:</span>
                  <button
                    onClick={() => onUpdateLyricOffset(currentTrack.id, -100)}
                    className="px-1.5 py-1 bg-[#09090C] border border-[#454450] hover:border-[#D7FF3F] text-[#F0EFEA] hover:text-[#D7FF3F] font-bold"
                    title="Delay lyrics 100ms"
                    aria-label="Decrease lyric offset 100ms"
                  >
                    -100MS
                  </button>
                  <span className="px-1.5 py-0.5 bg-[#09090C] border border-[#454450] text-[#D7FF3F] font-bold min-w-[58px] text-center">
                    {currentOffset > 0 ? `+${currentOffset}` : currentOffset}MS
                  </span>
                  <button
                    onClick={() => onUpdateLyricOffset(currentTrack.id, 100)}
                    className="px-1.5 py-1 bg-[#09090C] border border-[#454450] hover:border-[#D7FF3F] text-[#F0EFEA] hover:text-[#D7FF3F] font-bold"
                    title="Advance lyrics 100ms"
                    aria-label="Increase lyric offset 100ms"
                  >
                    +100MS
                  </button>
                  {currentOffset !== 0 && (
                    <button
                      onClick={() => onUpdateLyricOffset(currentTrack.id, 0, true)}
                      className="px-1.5 py-1 bg-[#09090C] border border-[#454450] hover:border-[#FF5A63] text-[#A3A1AD] hover:text-[#FF5A63]"
                      title="Reset offset to 0ms"
                      aria-label="Reset lyric offset"
                    >
                      RESET
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Lyrics Content Body */}
            <div
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 font-['IBM_Plex_Mono'] text-sm select-text"
            >
              {currentTrack.lyrics && currentTrack.lyrics.lines.length > 0 ? (
                currentTrack.lyrics.type === 'lrc' ? (
                  currentTrack.lyrics.lines.map((line, idx) => {
                    const isActive = idx === activeLyricIndex;
                    return (
                      <div
                        key={idx}
                        ref={isActive ? activeLyricRef : null}
                        className={`transition-all duration-200 py-1.5 px-2 border-l-2 ${
                          isActive
                            ? 'bg-[#1C1C26] border-[#D7FF3F] text-[#D7FF3F] font-bold text-base scale-[1.01]'
                            : 'border-transparent text-[#A3A1AD] hover:text-[#F0EFEA]'
                        }`}
                      >
                        <span className="text-[10px] text-[#A3A1AD] mr-3 opacity-60">
                          {formatDuration(line.time)}
                        </span>
                        <span>{line.text}</span>
                      </div>
                    );
                  })
                ) : (
                  <pre className="font-['IBM_Plex_Mono'] text-sm text-[#F0EFEA] whitespace-pre-wrap leading-relaxed">
                    {currentTrack.lyrics.rawText}
                  </pre>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <FileText className="w-10 h-10 text-[#454450]" />
                  <div className="font-['Space_Grotesk'] text-sm text-[#A3A1AD] font-semibold">
                    TIDAK ADA LIRIK DITEMUKAN UNTUK LAGU INI
                  </div>
                  <div className="font-['IBM_Plex_Mono'] text-xs text-[#454450]">
                    [OFFLINE METADATA // NO EMBEDDED LYRICS]
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* INTERACTIVE PLAYBACK SCRUBBER SLIDER */}
      <div className="border-2 border-[#454450] p-4 bg-[#13131A] space-y-4">
        <div>
          <div className="flex justify-between items-center font-['IBM_Plex_Mono'] text-xs mb-2 select-none">
            <span className="text-[#D7FF3F] font-bold">{formatDuration(displayTime)}</span>
            <span className="text-[#A3A1AD] uppercase text-[10px]">
              {isScrubbing ? 'SCRUBBING // SEEK' : 'TRACK PROGRESS'}
            </span>
            <span className="text-[#F0EFEA] font-bold">{formatDuration(effectiveDuration)}</span>
          </div>

          {/* Interactive Brutalist Scrubber Slider */}
          <div
            ref={progressBarRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={handleClickScrubber}
            onKeyDown={handleKeyDownScrubber}
            tabIndex={0}
            role="slider"
            aria-valuenow={Math.round(displayTime)}
            aria-valuemin={0}
            aria-valuemax={Math.round(effectiveDuration)}
            aria-label="Playback Progress Scrubber"
            className="group relative h-3.5 sm:h-4 w-full bg-[#09090C] border-2 border-[#454450] hover:border-[#D7FF3F] cursor-pointer touch-none select-none flex items-center transition-colors"
          >
            {/* Progress Fill Track */}
            <div
              className="h-full bg-[#D7FF3F] transition-[width] duration-75 ease-out pointer-events-none"
              style={{ width: `${currentRatio * 100}%` }}
            />

            {/* Brutalist Scrubber Handle/Thumb */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-6 bg-[#D7FF3F] border-2 border-[#09090C] shadow-[1px_1px_0px_0px_#454450] pointer-events-none transition-transform ${
                isScrubbing ? 'scale-115 bg-[#F0EFEA]' : 'group-hover:scale-110'
              }`}
              style={{ left: `${currentRatio * 100}%` }}
            >
              <div className="w-0.5 h-3 bg-[#09090C] mx-auto mt-1" />
            </div>

            {/* Scrub Tooltip on hover/drag */}
            {isScrubbing && (
              <div
                className="absolute -top-7 -translate-x-1/2 px-1.5 py-0.5 bg-[#09090C] border border-[#D7FF3F] text-[#D7FF3F] font-['IBM_Plex_Mono'] text-[10px] font-bold pointer-events-none z-20 whitespace-nowrap"
                style={{ left: `${currentRatio * 100}%` }}
              >
                {formatDuration(displayTime)}
              </div>
            )}
          </div>
        </div>

        {/* PLAYBACK CONTROLS */}
        <div className="pt-1">
          {/* Core Playback Controls (Shuffle, Prev, Play/Pause, Next, Repeat) */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 w-full">
            <button
              onClick={onToggleShuffle}
              className={`p-2 sm:p-2.5 border transition-all shrink-0 ${
                isShuffle
                  ? 'bg-[#D7FF3F] text-black border-[#D7FF3F]'
                  : 'bg-[#09090C] text-[#A3A1AD] border-[#454450] hover:border-[#D7FF3F] hover:text-[#F0EFEA]'
              }`}
              title={`Shuffle: ${isShuffle ? 'ON' : 'OFF'}`}
              aria-label={`Shuffle: ${isShuffle ? 'ON' : 'OFF'}`}
            >
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={onPrevTrack}
              className="p-2 sm:p-2.5 bg-[#09090C] border border-[#454450] hover:border-[#D7FF3F] text-[#F0EFEA] hover:text-[#D7FF3F] transition-colors shrink-0"
              title="Previous Track"
              aria-label="Previous Track"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Main Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              className="flex-1 sm:flex-initial px-5 sm:px-8 py-2.5 sm:py-3 bg-[#D7FF3F] text-black border-2 border-black font-['Archivo_Black'] text-sm sm:text-base tracking-wider hover:bg-[#c6f030] transition-transform active:scale-95 shadow-[3px_3px_0px_0px_#454450] max-w-[150px] flex items-center justify-center"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
                )}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </div>
            </button>

            <button
              onClick={onNextTrack}
              className="p-2 sm:p-2.5 bg-[#09090C] border border-[#454450] hover:border-[#D7FF3F] text-[#F0EFEA] hover:text-[#D7FF3F] transition-colors shrink-0"
              title="Next Track"
              aria-label="Next Track"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={onToggleRepeat}
              className={`p-2 sm:p-2.5 border transition-all shrink-0 ${
                repeatMode !== 'off'
                  ? 'bg-[#D7FF3F] text-black border-[#D7FF3F]'
                  : 'bg-[#09090C] text-[#A3A1AD] border-[#454450] hover:border-[#D7FF3F] hover:text-[#F0EFEA]'
              }`}
              title={`Repeat: ${repeatMode.toUpperCase()}`}
              aria-label={`Repeat: ${repeatMode.toUpperCase()}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* QUEUE ON NOW PLAYING SCREEN (PRD 7.1, 7.2, 9.2) */}
      <div className="border-2 border-[#454450] bg-[#13131A] p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#454450] pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#D7FF3F]"></span>
            <h3 className="font-['Archivo_Black'] text-sm tracking-wider text-[#F0EFEA]">
              ANTREAN BERIKUTNYA ({queue.length} TRACKS)
            </h3>
          </div>
          <span className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD]">
            PLAYING INDEX: #{currentQueueIndex + 1}
          </span>
        </div>

        {/* Queue Items List (Strict 1-Row per Track, Truncated) */}
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {queue.length === 0 ? (
            <div className="font-['Space_Grotesk'] text-xs text-[#A3A1AD] py-3 text-center">
              ANTREAN KOSONG
            </div>
          ) : (
            queue.map((item, index) => {
              const isCurrent = index === currentQueueIndex;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-2 border font-['Space_Grotesk'] text-xs transition-colors ${
                    isCurrent
                      ? 'bg-[#1C1C26] border-[#D7FF3F] text-[#D7FF3F]'
                      : 'bg-[#09090C] border-[#454450] text-[#F0EFEA] hover:border-[#D7FF3F]'
                  }`}
                >
                  {/* Left: Index & Track Info */}
                  <div
                    onClick={() => onSelectQueueItem(index)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#A3A1AD] w-6 shrink-0">
                      {isCurrent ? '▶' : `${index + 1}.`}
                    </span>
                    <div className="truncate font-semibold text-[#F0EFEA]">
                      {item.track.title}
                    </div>
                    <span className="text-[#A3A1AD] truncate text-[11px] hidden sm:inline">
                      {item.track.artist}
                    </span>
                  </div>

                  {/* Right: Duration & Actions */}
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#A3A1AD]">
                      {formatDuration(item.track.duration)}
                    </span>

                    {/* Move Up */}
                    <button
                      disabled={index === 0}
                      onClick={() => onMoveQueueItem(index, index - 1)}
                      className="p-1 hover:bg-[#1C1C26] disabled:opacity-30 disabled:pointer-events-none text-[#F0EFEA]"
                      title="Move Up"
                      aria-label={`Move ${item.track.title} up in queue`}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      disabled={index === queue.length - 1}
                      onClick={() => onMoveQueueItem(index, index + 1)}
                      className="p-1 hover:bg-[#1C1C26] disabled:opacity-30 disabled:pointer-events-none text-[#F0EFEA]"
                      title="Move Down"
                      aria-label={`Move ${item.track.title} down in queue`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => onRemoveFromQueue(item.id)}
                      className="p-1 hover:bg-[#FF5A63] hover:text-black text-[#A3A1AD] transition-colors"
                      title="Remove from Queue"
                      aria-label={`Remove ${item.track.title} from queue`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
