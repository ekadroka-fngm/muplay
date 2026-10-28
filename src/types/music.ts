export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface LyricData {
  type: 'lrc' | 'txt';
  lines: LyricLine[];
  rawText: string;
  offsetMs: number; // custom track sync offset in ms
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  format: string; // 'MP3' | 'FLAC' | 'WAV' | 'AAC' | 'OGG' | string
  sampleRate?: number; // e.g. 44100, 48000, 96000
  bitDepth?: number; // e.g. 16, 24
  bitrate?: string; // e.g. '320 kbps'
  channels?: number; // 1 | 2
  fileSize: number; // in bytes
  blobUrl?: string; // URL for playback
  blob?: Blob; // optional persistent copy blob
  lyrics?: LyricData;
  artworkUrl?: string;
  storageMode: 'reference' | 'copied';
  addedAt: number;
}

export interface Playlist {
  id: string;
  name: string;
  icon: string;
  trackIds: string[];
  createdAt: number;
}

export interface QueueItem {
  id: string; // unique queue item id
  trackId: string;
  track: Track;
}

export interface EqualizerBand {
  frequency: number; // in Hz: 31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000
  label: string;
  gain: number; // in dB: -12 to +12
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface AppSettings {
  theme: 'dark' | 'light';
  storageMode: 'reference' | 'copied';
  reducedMotion: boolean;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  eqEnabled: boolean;
  activePreset: string;
}
