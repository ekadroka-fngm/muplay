/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu } from 'lucide-react';
import {
  Track,
  Playlist,
  QueueItem,
  RepeatMode,
  AppSettings,
  EqualizerBand,
} from './types/music';
import { DEFAULT_EQ_BANDS, EQ_PRESETS } from './utils/equalizerPresets';
import {
  dbGetAllTracks,
  dbSaveTrack,
  dbDeleteTrack,
  dbGetAllPlaylists,
  dbSavePlaylist,
  dbDeletePlaylist,
  dbSaveLyrics,
  dbGetSetting,
  dbSetSetting,
  dbClearAll,
} from './utils/indexedDb';
import { generateSampleTracks } from './utils/sampleTracks';
import { parseLocalAudioFile } from './utils/audioMetadata';
import { parseLyrics } from './utils/lrcParser';
import {
  addToQueue,
  removeFromQueue,
  moveInQueue,
  getNextIndex,
  getPrevIndex,
  generateId,
} from './utils/queueManager';
import { audioEngine } from './audio/audioEngine';

import { Sidebar, NavTab } from './components/Sidebar';
import { BottomPlaylistStrip } from './components/BottomPlaylistStrip';
import { NowPlayingView } from './components/NowPlayingView';
import { LibraryView } from './components/LibraryView';
import { PlaylistsView } from './components/PlaylistsView';
import { EqualizerView } from './components/EqualizerView';
import { SettingsView } from './components/SettingsView';
import { TrackDetailModal } from './components/TrackDetailModal';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { LinkLyricsModal } from './components/LinkLyricsModal';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('now-playing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Music & Playback State
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [activePlaylist, setActivePlaylist] = useState<{ id: string; name: string; icon: string } | null>(null);

  // Equalizer State
  const [bands, setBands] = useState<EqualizerBand[]>(DEFAULT_EQ_BANDS);
  const [activePreset, setActivePreset] = useState<string>('Flat');
  const [eqEnabled, setEqEnabled] = useState<boolean>(true);

  // Settings State
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    storageMode: 'copied',
    reducedMotion: false,
    volume: 0.85,
    isMuted: false,
    repeatMode: 'off',
    isShuffle: false,
    eqEnabled: true,
    activePreset: 'Flat',
  });

  // Import State
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);

  // Modals
  const [detailTrack, setDetailTrack] = useState<Track | null>(null);
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<Track | null>(null);
  const [attachLyricsTrack, setAttachLyricsTrack] = useState<Track | null>(null);

  const currentTrack: Track | null = queue[currentQueueIndex]?.track || tracks[0] || null;

  // Initialize DB & Seed Data
  useEffect(() => {
    async function init() {
      // Load settings
      const savedTheme = await dbGetSetting<'dark' | 'light'>('theme', 'dark');
      const savedStorageMode = await dbGetSetting<'reference' | 'copied'>('storageMode', 'copied');
      const savedEqBands = await dbGetSetting<EqualizerBand[]>('eqBands', DEFAULT_EQ_BANDS);
      const savedPreset = await dbGetSetting<string>('activePreset', 'Flat');
      const savedEqEnabled = await dbGetSetting<boolean>('eqEnabled', true);

      setSettings((prev) => ({
        ...prev,
        theme: savedTheme,
        storageMode: savedStorageMode,
        eqEnabled: savedEqEnabled,
        activePreset: savedPreset,
      }));
      setBands(savedEqBands);
      setEqEnabled(savedEqEnabled);
      setActivePreset(savedPreset);

      document.documentElement.setAttribute('data-theme', savedTheme);

      // Load tracks & playlists
      const loadedTracks = await dbGetAllTracks();
      const loadedPlaylists = await dbGetAllPlaylists();

      if (loadedTracks.length === 0) {
        // Generate initial synthesized brutalist tracks and sample playlist
        const demos = generateSampleTracks();
        for (const demo of demos) {
          await dbSaveTrack(demo);
        }
        const samplePlaylist: Playlist = {
          id: 'sample_pl_1',
          name: 'BRUTALIST PROTOCOL',
          icon: 'disc',
          trackIds: demos.map((d) => d.id),
          createdAt: Date.now(),
        };
        await dbSavePlaylist(samplePlaylist);

        setTracks(demos);
        setPlaylists([samplePlaylist]);
        setActivePlaylist({ id: samplePlaylist.id, name: samplePlaylist.name, icon: samplePlaylist.icon });

        // Initialize queue with sample tracks
        const initialQueue: QueueItem[] = demos.map((track) => ({
          id: `q_${generateId()}`,
          trackId: track.id,
          track,
        }));
        setQueue(initialQueue);
        setCurrentQueueIndex(0);

        if (demos[0].blobUrl) {
          audioEngine.setTrackSource(demos[0].blobUrl);
        }
      } else {
        // Restore existing tracks
        setTracks(loadedTracks);
        setPlaylists(loadedPlaylists);

        // Populate initial queue
        const initialQueue: QueueItem[] = loadedTracks.map((track) => ({
          id: `q_${generateId()}`,
          trackId: track.id,
          track,
        }));
        setQueue(initialQueue);
        setCurrentQueueIndex(0);

        if (loadedTracks[0].blobUrl) {
          audioEngine.setTrackSource(loadedTracks[0].blobUrl);
        }
      }
    }
    init();
  }, []);

  // Update theme on DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    dbSetSetting('theme', settings.theme);
  }, [settings.theme]);

  // Audio Engine Event Listeners
  useEffect(() => {
    const audio = audioEngine.getAudioElement();

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      handleNextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [queue, currentQueueIndex, settings.repeatMode, settings.isShuffle]);

  // Playback Control Handlers
  const handlePlayTrack = useCallback(
    async (track: Track, fromPlaylist?: { id: string; name: string; icon: string } | null) => {
      // Find track in queue or add it
      let targetIndex = queue.findIndex((q) => q.trackId === track.id);
      let newQueue = queue;

      if (targetIndex === -1) {
        newQueue = addToQueue(queue, track);
        targetIndex = newQueue.length - 1;
        setQueue(newQueue);
      }

      setCurrentQueueIndex(targetIndex);
      if (fromPlaylist !== undefined) {
        setActivePlaylist(fromPlaylist);
      }

      if (track.blobUrl) {
        audioEngine.setTrackSource(track.blobUrl);
        try {
          await audioEngine.play();
        } catch {
          // auto-play blocked until user interaction
        }
      }
    },
    [queue]
  );

  const handleTogglePlay = useCallback(async () => {
    const audio = audioEngine.getAudioElement();
    if (audio.paused) {
      if (!audio.src && currentTrack?.blobUrl) {
        audioEngine.setTrackSource(currentTrack.blobUrl);
      }
      try {
        await audioEngine.play();
      } catch (err) {
        console.error('Playback error', err);
      }
    } else {
      audioEngine.pause();
    }
  }, [currentTrack]);

  const handleNextTrack = useCallback(() => {
    if (queue.length === 0) return;
    const nextIdx = getNextIndex(
      currentQueueIndex,
      queue.length,
      settings.repeatMode,
      settings.isShuffle
    );

    if (nextIdx !== -1) {
      setCurrentQueueIndex(nextIdx);
      const nextTrack = queue[nextIdx].track;
      if (nextTrack.blobUrl) {
        audioEngine.setTrackSource(nextTrack.blobUrl);
        audioEngine.play().catch(() => {});
      }
    } else {
      audioEngine.pause();
      setCurrentTime(0);
    }
  }, [queue, currentQueueIndex, settings.repeatMode, settings.isShuffle]);

  const handlePrevTrack = useCallback(() => {
    if (queue.length === 0) return;
    const audio = audioEngine.getAudioElement();
    // If playing more than 3s, restart current song instead
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    const prevIdx = getPrevIndex(currentQueueIndex, queue.length, settings.repeatMode);
    if (prevIdx !== -1) {
      setCurrentQueueIndex(prevIdx);
      const prevTrack = queue[prevIdx].track;
      if (prevTrack.blobUrl) {
        audioEngine.setTrackSource(prevTrack.blobUrl);
        audioEngine.play().catch(() => {});
      }
    }
  }, [queue, currentQueueIndex, settings.repeatMode]);

  // Step seek (-10s / +10s) without slider (PRD 7.4)
  const handleSeekStep = useCallback((seconds: number) => {
    const newPos = audioEngine.seekStep(seconds);
    setCurrentTime(newPos);
  }, []);

  const handleVolumeStep = useCallback(
    (delta: number) => {
      const newVol = Math.max(0, Math.min(1, settings.volume + delta));
      setSettings((s) => ({ ...s, volume: newVol, isMuted: false }));
      audioEngine.setVolume(newVol, false);
    },
    [settings.volume]
  );

  const handleToggleMute = useCallback(() => {
    const newMute = !settings.isMuted;
    setSettings((s) => ({ ...s, isMuted: newMute }));
    audioEngine.setVolume(settings.volume, newMute);
  }, [settings.isMuted, settings.volume]);

  const handleToggleRepeat = useCallback(() => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const curIdx = modes.indexOf(settings.repeatMode);
    const nextMode = modes[(curIdx + 1) % modes.length];
    setSettings((s) => ({ ...s, repeatMode: nextMode }));
  }, [settings.repeatMode]);

  const handleToggleShuffle = useCallback(() => {
    setSettings((s) => ({ ...s, isShuffle: !s.isShuffle }));
  }, []);

  // Queue Operations (PRD 9.2)
  const handleAddToQueue = useCallback(
    (track: Track, playNext: boolean = false) => {
      const updated = addToQueue(queue, track, playNext, currentQueueIndex);
      setQueue(updated);
    },
    [queue, currentQueueIndex]
  );

  const handleRemoveFromQueue = useCallback(
    (queueItemId: string) => {
      const updated = removeFromQueue(queue, queueItemId);
      setQueue(updated);
      if (currentQueueIndex >= updated.length) {
        setCurrentQueueIndex(Math.max(0, updated.length - 1));
      }
    },
    [queue, currentQueueIndex]
  );

  const handleMoveQueueItem = useCallback(
    (fromIdx: number, toIdx: number) => {
      const updated = moveInQueue(queue, fromIdx, toIdx);
      setQueue(updated);
      if (currentQueueIndex === fromIdx) {
        setCurrentQueueIndex(toIdx);
      } else if (fromIdx < currentQueueIndex && toIdx >= currentQueueIndex) {
        setCurrentQueueIndex(currentQueueIndex - 1);
      } else if (fromIdx > currentQueueIndex && toIdx <= currentQueueIndex) {
        setCurrentQueueIndex(currentQueueIndex + 1);
      }
    },
    [queue, currentQueueIndex]
  );

  const handleSelectQueueItem = useCallback(
    (index: number) => {
      if (index >= 0 && index < queue.length) {
        setCurrentQueueIndex(index);
        const trk = queue[index].track;
        if (trk.blobUrl) {
          audioEngine.setTrackSource(trk.blobUrl);
          audioEngine.play().catch(() => {});
        }
      }
    },
    [queue]
  );

  // Equalizer Handlers (PRD 10.1, 10.2)
  const handleUpdateBandGain = useCallback(
    (bandIndex: number, gainDb: number) => {
      const updatedBands = bands.map((b, idx) => (idx === bandIndex ? { ...b, gain: gainDb } : b));
      setBands(updatedBands);
      setActivePreset('Custom');
      audioEngine.setBandGain(bandIndex, gainDb);
      dbSetSetting('eqBands', updatedBands);
      dbSetSetting('activePreset', 'Custom');
    },
    [bands]
  );

  const handleApplyPreset = useCallback(
    (presetName: string, gains: number[]) => {
      const updatedBands = bands.map((b, idx) => ({ ...b, gain: gains[idx] ?? 0 }));
      setBands(updatedBands);
      setActivePreset(presetName);
      audioEngine.setAllBands(gains);
      dbSetSetting('eqBands', updatedBands);
      dbSetSetting('activePreset', presetName);
    },
    [bands]
  );

  const handleToggleEq = useCallback(() => {
    const nextState = !eqEnabled;
    setEqEnabled(nextState);
    audioEngine.setEqEnabled(
      nextState,
      bands.map((b) => b.gain)
    );
    setSettings((s) => ({ ...s, eqEnabled: nextState }));
    dbSetSetting('eqEnabled', nextState);
  }, [eqEnabled, bands]);

  const handleResetEq = useCallback(() => {
    handleApplyPreset('Flat', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }, [handleApplyPreset]);

  // Lyric Offset Sync Handler (PRD 11.2)
  const handleUpdateLyricOffset = useCallback(
    async (trackId: string, deltaMs: number, reset: boolean = false) => {
      setTracks((prev) =>
        prev.map((t) => {
          if (t.id === trackId && t.lyrics) {
            const newOffset = reset ? 0 : (t.lyrics.offsetMs || 0) + deltaMs;
            const updatedLyrics = { ...t.lyrics, offsetMs: newOffset };
            dbSaveLyrics(trackId, updatedLyrics);
            return { ...t, lyrics: updatedLyrics };
          }
          return t;
        })
      );

      // Also update in current queue
      setQueue((prev) =>
        prev.map((q) => {
          if (q.track.id === trackId && q.track.lyrics) {
            const newOffset = reset ? 0 : (q.track.lyrics.offsetMs || 0) + deltaMs;
            return {
              ...q,
              track: {
                ...q.track,
                lyrics: { ...q.track.lyrics, offsetMs: newOffset },
              },
            };
          }
          return q;
        })
      );
    },
    []
  );

  // Attach Lyrics Handler
  const handleSaveLyrics = useCallback(
    async (trackId: string, content: string, fileName?: string) => {
      const parsed = parseLyrics(content, fileName);
      await dbSaveLyrics(trackId, parsed);

      setTracks((prev) =>
        prev.map((t) => (t.id === trackId ? { ...t, lyrics: parsed } : t))
      );
      setQueue((prev) =>
        prev.map((q) => (q.track.id === trackId ? { ...q, track: { ...q.track, lyrics: parsed } } : q))
      );
    },
    []
  );

  // Batch Audio Files / Folder Import (PRD 12.1: NO ARTIFICIAL LIMIT)
  const handleImportFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const allFiles = Array.from(fileList);
      if (allFiles.length === 0) return;

      setIsImporting(true);
      setImportProgress({ current: 0, total: allFiles.length });

      // Separate audio files and lyric files
      const audioFiles: File[] = [];
      const lyricFiles: Map<string, File> = new Map();

      for (const file of allFiles) {
        const lowerName = file.name.toLowerCase();
        if (
          lowerName.endsWith('.lrc') ||
          lowerName.endsWith('.txt')
        ) {
          const baseName = lowerName.replace(/\.[^/.]+$/, '');
          lyricFiles.set(baseName, file);
        } else if (
          file.type.startsWith('audio/') ||
          /\.(mp3|wav|flac|aac|ogg|m4a|opus)$/i.test(file.name)
        ) {
          audioFiles.push(file);
        }
      }

      const importedTracks: Track[] = [];

      for (let i = 0; i < audioFiles.length; i++) {
        const file = audioFiles[i];
        setImportProgress({ current: i + 1, total: audioFiles.length });

        try {
          const track = await parseLocalAudioFile(file, settings.storageMode);

          // Check if matching lyric file was uploaded in same batch
          const fileBase = file.name.toLowerCase().replace(/\.[^/.]+$/, '');
          if (lyricFiles.has(fileBase)) {
            const lyricFile = lyricFiles.get(fileBase)!;
            const text = await lyricFile.text();
            track.lyrics = parseLyrics(text, lyricFile.name);
          }

          await dbSaveTrack(track);
          importedTracks.push(track);
        } catch (err) {
          console.warn(`Failed parsing audio file: ${file.name}`, err);
        }
      }

      if (importedTracks.length > 0) {
        setTracks((prev) => [...prev, ...importedTracks]);
        // Also append to queue
        const newQueueItems: QueueItem[] = importedTracks.map((trk) => ({
          id: `q_${generateId()}`,
          trackId: trk.id,
          track: trk,
        }));
        setQueue((prev) => [...prev, ...newQueueItems]);
      }

      setIsImporting(false);
      setImportProgress(null);
    },
    [settings.storageMode]
  );

  // Playlists Handlers
  const handleCreatePlaylist = useCallback(async (name: string, icon: string) => {
    const newPl: Playlist = {
      id: `pl_${Date.now()}_${generateId()}`,
      name,
      icon,
      trackIds: [],
      createdAt: Date.now(),
    };
    await dbSavePlaylist(newPl);
    setPlaylists((prev) => [...prev, newPl]);
  }, []);

  const handleDeletePlaylist = useCallback(async (id: string) => {
    await dbDeletePlaylist(id);
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    setActivePlaylist((curr) => (curr?.id === id ? null : curr));
  }, []);

  const handleRenamePlaylist = useCallback(
    async (id: string, name: string, icon: string) => {
      setPlaylists((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            const updated = { ...p, name, icon };
            dbSavePlaylist(updated);
            return updated;
          }
          return p;
        })
      );
      setActivePlaylist((curr) => (curr?.id === id ? { id, name, icon } : curr));
    },
    []
  );

  const handlePlayPlaylist = useCallback(
    (playlist: Playlist) => {
      const plTracks = playlist.trackIds
        .map((tid) => tracks.find((t) => t.id === tid))
        .filter((t): t is Track => t !== undefined);

      if (plTracks.length === 0) return;

      const newQueue: QueueItem[] = plTracks.map((t) => ({
        id: `q_${generateId()}`,
        trackId: t.id,
        track: t,
      }));

      setQueue(newQueue);
      setCurrentQueueIndex(0);
      setActivePlaylist({ id: playlist.id, name: playlist.name, icon: playlist.icon });

      if (plTracks[0].blobUrl) {
        audioEngine.setTrackSource(plTracks[0].blobUrl);
        audioEngine.play().catch(() => {});
      }
    },
    [tracks]
  );

  const handleAddTrackToPlaylist = useCallback(
    async (playlistId: string, trackId: string) => {
      setPlaylists((prev) =>
        prev.map((p) => {
          if (p.id === playlistId && !p.trackIds.includes(trackId)) {
            const updated = { ...p, trackIds: [...p.trackIds, trackId] };
            dbSavePlaylist(updated);
            return updated;
          }
          return p;
        })
      );
    },
    []
  );

  const handleCreateAndAddToPlaylist = useCallback(
    async (name: string, icon: string, trackId: string) => {
      const newPl: Playlist = {
        id: `pl_${Date.now()}_${generateId()}`,
        name,
        icon,
        trackIds: [trackId],
        createdAt: Date.now(),
      };
      await dbSavePlaylist(newPl);
      setPlaylists((prev) => [...prev, newPl]);
    },
    []
  );

  const handleRemoveTrackFromPlaylist = useCallback(
    async (playlistId: string, trackId: string) => {
      setPlaylists((prev) =>
        prev.map((p) => {
          if (p.id === playlistId) {
            const updated = { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) };
            dbSavePlaylist(updated);
            return updated;
          }
          return p;
        })
      );
    },
    []
  );

  const handleDeleteTrack = useCallback(
    async (trackId: string) => {
      await dbDeleteTrack(trackId);
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
      setQueue((prev) => prev.filter((q) => q.trackId !== trackId));
      // Remove from playlists
      setPlaylists((prev) =>
        prev.map((p) => ({ ...p, trackIds: p.trackIds.filter((id) => id !== trackId) }))
      );
    },
    []
  );

  // Settings & Maintenance Handlers
  const handleUpdateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.theme) {
        dbSetSetting('theme', newSettings.theme);
      }
      if (newSettings.storageMode) {
        dbSetSetting('storageMode', newSettings.storageMode);
      }
      return updated;
    });
  }, []);

  const handleResetToDemoTracks = useCallback(async () => {
    const demos = generateSampleTracks();
    for (const d of demos) {
      await dbSaveTrack(d);
    }
    const samplePl: Playlist = {
      id: `pl_demo_${Date.now()}`,
      name: 'BRUTALIST PROTOCOL',
      icon: 'disc',
      trackIds: demos.map((d) => d.id),
      createdAt: Date.now(),
    };
    await dbSavePlaylist(samplePl);

    setTracks(demos);
    setPlaylists([samplePl]);
    setActivePlaylist({ id: samplePl.id, name: samplePl.name, icon: samplePl.icon });

    const q: QueueItem[] = demos.map((t) => ({
      id: `q_${generateId()}`,
      trackId: t.id,
      track: t,
    }));
    setQueue(q);
    setCurrentQueueIndex(0);
    if (demos[0].blobUrl) {
      audioEngine.setTrackSource(demos[0].blobUrl);
    }
  }, []);

  const handleClearAllLibrary = useCallback(async () => {
    audioEngine.pause();
    await dbClearAll();
    setTracks([]);
    setPlaylists([]);
    setQueue([]);
    setCurrentQueueIndex(0);
    setActivePlaylist(null);
  }, []);

  // Keyboard Shortcuts (Space, Left/Right seek, Up/Down vol, M, N, P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in form inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeekStep(-10);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeekStep(10);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        handleVolumeStep(0.05);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        handleVolumeStep(-0.05);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleNextTrack();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handlePrevTrack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleTogglePlay,
    handleSeekStep,
    handleVolumeStep,
    handleToggleMute,
    handleNextTrack,
    handlePrevTrack,
  ]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#09090C] text-[#F0EFEA] font-['Space_Grotesk']">
      {/* Left Sidebar Navigation (PRD 6.1: No bottom navigation) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        trackCount={tracks.length}
        playlistCount={playlists.length}
        isPlaying={isPlaying}
        theme={settings.theme}
        onToggleTheme={() =>
          handleUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
        }
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* Mobile Top App Bar (Only visible on small screens to toggle sidebar) */}
        <header className="md:hidden flex items-center justify-between p-3 bg-[#13131A] border-b-2 border-[#454450] select-none shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 border border-[#454450] text-[#F0EFEA] hover:bg-[#D7FF3F] hover:text-black transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#D7FF3F]"></span>
              <span className="font-['Archivo_Black'] text-base tracking-wider text-[#F0EFEA]">
                MUPLAY
              </span>
            </div>
          </div>

          <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#A3A1AD] tracking-widest">
            VER 0.3
          </div>
        </header>

        {/* View Switcher */}
        {activeTab === 'now-playing' && (
          <NowPlayingView
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            repeatMode={settings.repeatMode}
            isShuffle={settings.isShuffle}
            volume={settings.volume}
            isMuted={settings.isMuted}
            queue={queue}
            currentQueueIndex={currentQueueIndex}
            onTogglePlay={handleTogglePlay}
            onNextTrack={handleNextTrack}
            onPrevTrack={handlePrevTrack}
            onSeekStep={handleSeekStep}
            onToggleRepeat={handleToggleRepeat}
            onToggleShuffle={handleToggleShuffle}
            onVolumeStep={handleVolumeStep}
            onToggleMute={handleToggleMute}
            onRemoveFromQueue={handleRemoveFromQueue}
            onMoveQueueItem={handleMoveQueueItem}
            onSelectQueueItem={handleSelectQueueItem}
            onUpdateLyricOffset={handleUpdateLyricOffset}
            onOpenAttachLyrics={(t) => setAttachLyricsTrack(t)}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            tracks={tracks}
            currentTrackId={currentTrack?.id}
            isPlaying={isPlaying}
            onPlayTrack={(track) => handlePlayTrack(track, null)}
            onAddToQueue={handleAddToQueue}
            onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
            onOpenDetails={(track) => setDetailTrack(track)}
            onOpenAttachLyrics={(track) => setAttachLyricsTrack(track)}
            onDeleteTrack={handleDeleteTrack}
            onImportFiles={handleImportFiles}
            isImporting={isImporting}
            importProgress={importProgress}
          />
        )}

        {activeTab === 'playlists' && (
          <PlaylistsView
            playlists={playlists}
            tracks={tracks}
            currentTrackId={currentTrack?.id}
            isPlaying={isPlaying}
            activePlaylistId={activePlaylist?.id}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onRenamePlaylist={handleRenamePlaylist}
            onPlayPlaylist={handlePlayPlaylist}
            onPlayTrack={(track) =>
              handlePlayTrack(
                track,
                activePlaylist || (playlists[0] ? { id: playlists[0].id, name: playlists[0].name, icon: playlists[0].icon } : null)
              )
            }
            onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
          />
        )}

        {activeTab === 'equalizer' && (
          <EqualizerView
            bands={bands}
            isEnabled={eqEnabled}
            activePreset={activePreset}
            onUpdateBandGain={handleUpdateBandGain}
            onApplyPreset={handleApplyPreset}
            onToggleEnabled={handleToggleEq}
            onReset={handleResetEq}
            isPlaying={isPlaying}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetToDemoTracks={handleResetToDemoTracks}
            onClearAllLibrary={handleClearAllLibrary}
          />
        )}

        {/* Minimal Bottom Strip: ONLY Displays Active Playlist Icon & Name (PRD 6.2, FR-13) */}
        <BottomPlaylistStrip
          activePlaylistName={activePlaylist?.name}
          activePlaylistIcon={activePlaylist?.icon}
        />
      </main>

      {/* Global Modals */}
      {detailTrack && (
        <TrackDetailModal track={detailTrack} onClose={() => setDetailTrack(null)} />
      )}

      {addToPlaylistTrack && (
        <AddToPlaylistModal
          track={addToPlaylistTrack}
          playlists={playlists}
          onClose={() => setAddToPlaylistTrack(null)}
          onAddTrackToPlaylist={handleAddTrackToPlaylist}
          onCreateAndAdd={handleCreateAndAddToPlaylist}
        />
      )}

      {attachLyricsTrack && (
        <LinkLyricsModal
          track={attachLyricsTrack}
          onClose={() => setAttachLyricsTrack(null)}
          onSaveLyrics={handleSaveLyrics}
        />
      )}
    </div>
  );
}
