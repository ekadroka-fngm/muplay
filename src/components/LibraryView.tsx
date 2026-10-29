import React, { useState, useMemo, useRef } from 'react';
import {
  Upload,
  FolderOpen,
  Search,
  Play,
  ListPlus,
  Plus,
  Info,
  Trash2,
  FileAudio,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Track } from '../types/music';
import { formatDuration, formatBytes } from '../utils/formatters';
import { getTrackArtwork } from '../utils/artworkCache';

interface LibraryViewProps {
  tracks: Track[];
  currentTrackId?: string;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onAddToQueue: (track: Track, playNext?: boolean) => void;
  onOpenAddToPlaylist: (track: Track) => void;
  onOpenDetails: (track: Track) => void;
  onDeleteTrack: (trackId: string) => void;
  onImportFiles: (files: FileList | File[]) => Promise<void>;
  isImporting: boolean;
  importProgress: { current: number; total: number } | null;
}

type SortField = 'title' | 'artist' | 'duration' | 'addedAt' | 'fileSize';

export const LibraryView: React.FC<LibraryViewProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onAddToQueue,
  onOpenAddToPlaylist,
  onOpenDetails,
  onDeleteTrack,
  onImportFiles,
  isImporting,
  importProgress,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('addedAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered and sorted tracks
  const filteredTracks = useMemo(() => {
    let result = tracks;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album?.toLowerCase().includes(q) ||
          t.format.toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'artist') {
        comparison = a.artist.localeCompare(b.artist);
      } else if (sortField === 'duration') {
        comparison = a.duration - b.duration;
      } else if (sortField === 'fileSize') {
        comparison = a.fileSize - b.fileSize;
      } else if (sortField === 'addedAt') {
        comparison = a.addedAt - b.addedAt;
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [tracks, searchQuery, sortField, sortAsc]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await onImportFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col overflow-y-auto bg-[#09090C] text-[#F0EFEA] p-4 md:p-6 lg:p-8 space-y-6 ${
        isDragOver ? 'ring-4 ring-[#D7FF3F] bg-[#13131A]' : ''
      }`}
    >
      {/* Hidden file & folder inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onImportFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is standard for folder picker
        webkitdirectory="true"
        directory="true"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onImportFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Top Banner: Library Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#454450] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#D7FF3F]"></span>
            <h2 className="font-['Archivo_Black'] text-2xl md:text-3xl tracking-tight text-[#F0EFEA]">
              MUSIC REPOSITORY
            </h2>
          </div>
          <div className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD] mt-1">
            TOTAL TRACKS: {tracks.length} // STORAGE: LOCAL DISK / OPFS
          </div>
        </div>

        {/* Import Action Buttons (NO ARTIFICIAL LIMIT - PRD 12.1) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 px-3 py-2 bg-[#D7FF3F] text-black font-['Space_Grotesk'] text-xs font-bold uppercase border border-black hover:bg-[#c6f030] active:scale-95 transition-all shadow-[2px_2px_0px_0px_#454450]"
          >
            <Upload className="w-4 h-4" />
            <span>IMPORT FILES</span>
          </button>

          <button
            onClick={() => folderInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 px-3 py-2 bg-[#13131A] text-[#F0EFEA] font-['Space_Grotesk'] text-xs font-bold uppercase border border-[#454450] hover:border-[#D7FF3F] hover:text-[#D7FF3F] transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            <span>IMPORT FOLDER</span>
          </button>
        </div>
      </div>

      {/* Import Progress Notification Bar (PRD 12.1) */}
      {isImporting && importProgress && (
        <div className="p-3 bg-[#13131A] border-2 border-[#D7FF3F] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#D7FF3F]" />
            <span className="font-['Space_Grotesk'] text-xs font-bold text-[#F0EFEA]">
              PROCESSING LOCAL AUDIO BATCH...
            </span>
          </div>
          <span className="font-['IBM_Plex_Mono'] text-xs font-bold text-[#D7FF3F]">
            {importProgress.current} / {importProgress.total} COMPLETED
          </span>
        </div>
      )}

      {/* Search and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#13131A] p-3 border-2 border-[#454450]">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A3A1AD] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH BY TITLE, ARTIST, ALBUM, FORMAT..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#09090C] border border-[#454450] text-[#F0EFEA] font-['Space_Grotesk'] text-xs placeholder:text-[#454450] focus:border-[#D7FF3F] focus:outline-none"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#A3A1AD] hidden sm:inline">
            SORT:
          </span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="bg-[#09090C] border border-[#454450] px-2 py-1.5 text-xs font-['IBM_Plex_Mono'] text-[#F0EFEA] focus:border-[#D7FF3F] focus:outline-none"
          >
            <option value="addedAt">DATE ADDED</option>
            <option value="title">TITLE</option>
            <option value="artist">ARTIST</option>
            <option value="duration">DURATION</option>
            <option value="fileSize">SIZE</option>
          </select>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="p-1.5 bg-[#09090C] border border-[#454450] text-[#F0EFEA] hover:border-[#D7FF3F]"
            title={`Sort ${sortAsc ? 'Ascending' : 'Descending'}`}
            aria-label={`Sort ${sortAsc ? 'Ascending' : 'Descending'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TRACKS LIST: STRICTLY ONE ROW PER TRACK, NO WRAPPING, NO CAROUSEL (PRD 8.1, 8.2) */}
      <div className="space-y-1">
        {filteredTracks.length === 0 ? (
          <div className="border-2 border-dashed border-[#454450] p-12 text-center bg-[#13131A] space-y-4">
            <FileAudio className="w-12 h-12 text-[#454450] mx-auto" />
            <div className="font-['Archivo_Black'] text-lg text-[#F0EFEA]">
              {searchQuery ? 'TIDAK ADA LAGU YANG COCOK' : 'REPOSITORI MUSIK KOSONG'}
            </div>
            <p className="font-['Space_Grotesk'] text-xs text-[#A3A1AD] max-w-sm mx-auto">
              TARIK & LEPAS FILE ATAU FOLDER MUSIK KE AREA INI UNTUK MEMUTARNYA SECARA OFFLINE.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-[#D7FF3F] text-black font-['Space_Grotesk'] text-xs font-bold uppercase border border-black hover:bg-[#c6f030]"
            >
              PILIH FILE MUSIK LOKAL
            </button>
          </div>
        ) : (
          filteredTracks.map((track, index) => {
            const isCurrent = track.id === currentTrackId;
            return (
              <div
                key={track.id}
                className={`group flex items-center justify-between px-3 py-2 border transition-colors ${
                  isCurrent
                    ? 'bg-[#1C1C26] border-[#D7FF3F] text-[#D7FF3F]'
                    : 'bg-[#13131A] border-[#454450] hover:bg-[#1C1C26] hover:border-[#D7FF3F] text-[#F0EFEA]'
                }`}
              >
                {/* Left: Play Button, Index, Artwork / Icon, Title & Artist (Truncated) */}
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                  {/* Play / Status Indicator */}
                  <button
                    onClick={() => onPlayTrack(track)}
                    className={`w-7 h-7 flex items-center justify-center shrink-0 border transition-all ${
                      isCurrent && isPlaying
                        ? 'bg-[#D7FF3F] text-black border-[#D7FF3F]'
                        : 'bg-[#09090C] text-[#F0EFEA] border-[#454450] group-hover:border-[#D7FF3F]'
                    }`}
                    title={isCurrent && isPlaying ? 'Playing' : 'Play Track'}
                    aria-label={`Play ${track.title}`}
                  >
                    <Play className={`w-3.5 h-3.5 fill-current ${isCurrent && isPlaying ? 'scale-110' : ''}`} />
                  </button>

                  {/* Artwork thumbnail from metadata or cache */}
                  <div className="w-8 h-8 shrink-0 bg-[#09090C] border border-[#454450] overflow-hidden flex items-center justify-center">
                    <img
                      src={getTrackArtwork(track)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Title and Artist: strictly 1 row, truncated with ellipsis, NO wrap (PRD 8.1, 8.2) */}
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <span className="font-['Space_Grotesk'] text-sm font-bold truncate text-[#F0EFEA]">
                      {track.title}
                    </span>
                    <span className="font-['Space_Grotesk'] text-xs text-[#A3A1AD] truncate shrink-0 max-w-[140px] sm:max-w-[200px] hidden sm:inline">
                      — {track.artist}
                    </span>
                  </div>
                </div>

                {/* Right: Badges, Duration & Action Icons */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {/* Format Badge (IBM Plex Mono) */}
                  <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold px-1.5 py-0.5 bg-[#09090C] border border-[#454450] text-[#A3A1AD] hidden md:inline">
                    {track.format}
                  </span>

                  {/* Duration */}
                  <span className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD] min-w-[42px] text-right">
                    {formatDuration(track.duration)}
                  </span>

                  {/* Add to Queue */}
                  <button
                    onClick={() => onAddToQueue(track)}
                    className="p-1.5 text-[#A3A1AD] hover:text-[#D7FF3F] hover:bg-[#09090C] border border-transparent hover:border-[#454450]"
                    title="Add to Queue"
                    aria-label={`Add ${track.title} to queue`}
                  >
                    <ListPlus className="w-4 h-4" />
                  </button>

                  {/* Add to Playlist */}
                  <button
                    onClick={() => onOpenAddToPlaylist(track)}
                    className="p-1.5 text-[#A3A1AD] hover:text-[#D7FF3F] hover:bg-[#09090C] border border-transparent hover:border-[#454450]"
                    title="Add to Playlist"
                    aria-label={`Add ${track.title} to playlist`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* File Metadata Details */}
                  <button
                    onClick={() => onOpenDetails(track)}
                    className="p-1.5 text-[#A3A1AD] hover:text-[#F0EFEA] hover:bg-[#09090C] border border-transparent hover:border-[#454450]"
                    title="View Technical Audio Details"
                    aria-label={`View audio details for ${track.title}`}
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  {/* Delete from library */}
                  <button
                    onClick={() => onDeleteTrack(track.id)}
                    className="p-1.5 text-[#A3A1AD] hover:text-[#FF5A63] hover:bg-[#09090C] border border-transparent hover:border-[#FF5A63]"
                    title="Remove from Library"
                    aria-label={`Remove ${track.title} from library`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
