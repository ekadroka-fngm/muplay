import React, { useState } from 'react';
import {
  ListMusic,
  Plus,
  Play,
  Trash2,
  Edit2,
  Disc,
  Flame,
  Skull,
  Zap,
  Radio,
  CassetteTape,
  Terminal,
  Shield,
  Waves,
  Box,
  Target,
  Crosshair,
  Star,
  FileAudio,
} from 'lucide-react';
import { Playlist, Track } from '../types/music';
import { formatDuration } from '../utils/formatters';

interface PlaylistsViewProps {
  playlists: Playlist[];
  tracks: Track[];
  currentTrackId?: string;
  isPlaying: boolean;
  activePlaylistId?: string | null;
  onCreatePlaylist: (name: string, icon: string) => void;
  onDeletePlaylist: (id: string) => void;
  onRenamePlaylist: (id: string, name: string, icon: string) => void;
  onPlayPlaylist: (playlist: Playlist) => void;
  onPlayTrack: (track: Track) => void;
  onRemoveTrackFromPlaylist: (playlistId: string, trackId: string) => void;
}

export const PLAYLIST_ICONS = [
  { id: 'disc', label: 'Vinyl Disc', icon: Disc },
  { id: 'tape', label: 'Cassette', icon: CassetteTape },
  { id: 'flame', label: 'Flame', icon: Flame },
  { id: 'skull', label: 'Brutal Skull', icon: Skull },
  { id: 'zap', label: 'Voltage Zap', icon: Zap },
  { id: 'radio', label: 'Radio Signal', icon: Radio },
  { id: 'terminal', label: 'Terminal Code', icon: Terminal },
  { id: 'shield', label: 'Armor Shield', icon: Shield },
  { id: 'waves', label: 'Audio Waves', icon: Waves },
  { id: 'box', label: 'Monolith Box', icon: Box },
  { id: 'target', label: 'Target Grid', icon: Target },
  { id: 'star', label: 'Brutalist Star', icon: Star },
];

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  playlists,
  tracks,
  currentTrackId,
  isPlaying,
  activePlaylistId,
  onCreatePlaylist,
  onDeletePlaylist,
  onRenamePlaylist,
  onPlayPlaylist,
  onPlayTrack,
  onRemoveTrackFromPlaylist,
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    playlists.length > 0 ? playlists[0].id : null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistIcon, setNewPlaylistIcon] = useState('disc');

  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0] || null;

  // Get track objects inside current playlist
  const playlistTracks = selectedPlaylist
    ? selectedPlaylist.trackIds
        .map((id) => tracks.find((t) => t.id === id))
        .filter((t): t is Track => t !== undefined)
    : [];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim(), newPlaylistIcon);
    setNewPlaylistName('');
    setIsCreating(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlaylist || !editingPlaylist.name.trim()) return;
    onRenamePlaylist(editingPlaylist.id, editingPlaylist.name.trim(), editingPlaylist.icon);
    setEditingPlaylist(null);
  };

  const renderIcon = (iconName: string, className: string = 'w-4 h-4') => {
    const item = PLAYLIST_ICONS.find((i) => i.id === iconName);
    const IconComp = item ? item.icon : Disc;
    return <IconComp className={className} />;
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#09090C] text-[#F0EFEA]">
      {/* Left Column: Playlist Index & Creation */}
      <div className="w-full md:w-72 lg:w-80 border-b-2 md:border-b-0 md:border-r-2 border-[#454450] bg-[#13131A] flex flex-col shrink-0">
        <div className="p-4 border-b-2 border-[#454450] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#D7FF3F]"></span>
            <h2 className="font-['Archivo_Black'] text-lg text-[#F0EFEA] tracking-wide">
              PLAYLISTS
            </h2>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#D7FF3F] text-black font-['Space_Grotesk'] text-xs font-bold uppercase border border-black hover:bg-[#c6f030]"
            title="Create New Playlist"
            aria-label="Create New Playlist"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NEW</span>
          </button>
        </div>

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {playlists.length === 0 ? (
            <div className="p-6 text-center font-['Space_Grotesk'] text-xs text-[#A3A1AD] space-y-2">
              <div>BELUM ADA PLAYLIST</div>
              <button
                onClick={() => setIsCreating(true)}
                className="px-3 py-1.5 bg-[#09090C] border border-[#454450] text-[#D7FF3F] hover:border-[#D7FF3F] text-xs font-bold"
              >
                + BUAT PLAYLIST PERTAMA
              </button>
            </div>
          ) : (
            playlists.map((pl) => {
              const isSelected = selectedPlaylist?.id === pl.id;
              const isActivePlaying = activePlaylistId === pl.id;
              return (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylistId(pl.id)}
                  className={`group flex items-center justify-between p-2.5 border cursor-pointer font-['Space_Grotesk'] text-xs transition-colors ${
                    isSelected
                      ? 'bg-[#1C1C26] border-[#D7FF3F] text-[#D7FF3F]'
                      : 'bg-[#09090C] border-[#454450] text-[#F0EFEA] hover:border-[#D7FF3F]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-[#D7FF3F] shrink-0">
                      {renderIcon(pl.icon, 'w-4 h-4')}
                    </span>
                    <div className="truncate font-bold">{pl.name}</div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#A3A1AD]">
                      {pl.trackIds.length}
                    </span>

                    {isActivePlaying && (
                      <span className="w-2 h-2 bg-[#D7FF3F] rounded-full animate-ping"></span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Selected Playlist Content & Track Rows */}
      <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
        {selectedPlaylist ? (
          <>
            {/* Playlist Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#454450] pb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-3 bg-[#13131A] border-2 border-[#454450] text-[#D7FF3F] shrink-0">
                  {renderIcon(selectedPlaylist.icon, 'w-8 h-8')}
                </div>
                <div className="min-w-0">
                  <div className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD] uppercase">
                    PLAYLIST // {playlistTracks.length} TRACKS
                  </div>
                  <h3 className="font-['Archivo_Black'] text-2xl md:text-3xl tracking-tight text-[#F0EFEA] truncate">
                    {selectedPlaylist.name}
                  </h3>
                </div>
              </div>

              {/* Actions: Play Playlist, Edit, Delete */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  disabled={playlistTracks.length === 0}
                  onClick={() => onPlayPlaylist(selectedPlaylist)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#D7FF3F] text-black font-['Archivo_Black'] text-xs tracking-wider uppercase border border-black hover:bg-[#c6f030] disabled:opacity-40 disabled:pointer-events-none shadow-[2px_2px_0px_0px_#454450]"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>PUTAR PLAYLIST</span>
                </button>

                <button
                  onClick={() => setEditingPlaylist(selectedPlaylist)}
                  className="p-2 bg-[#13131A] border border-[#454450] text-[#F0EFEA] hover:border-[#D7FF3F] hover:text-[#D7FF3F]"
                  title="Rename / Change Icon"
                  aria-label="Edit playlist"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeleteConfirmId(selectedPlaylist.id)}
                  className="p-2 bg-[#13131A] border border-[#454450] text-[#A3A1AD] hover:border-[#FF5A63] hover:text-[#FF5A63]"
                  title="Delete Playlist"
                  aria-label="Delete playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Playlist Track List: Strictly 1 Row Per Track */}
            <div className="space-y-1">
              {playlistTracks.length === 0 ? (
                <div className="border-2 border-dashed border-[#454450] p-10 text-center bg-[#13131A]">
                  <FileAudio className="w-10 h-10 text-[#454450] mx-auto mb-2" />
                  <div className="font-['Space_Grotesk'] text-sm text-[#A3A1AD]">
                    PLAYLIST INI MASIH KOSONG
                  </div>
                  <div className="font-['Space_Grotesk'] text-xs text-[#A3A1AD]/70 mt-1">
                    Buka Library dan klik tombol "+" untuk menambahkan lagu ke playlist ini.
                  </div>
                </div>
              ) : (
                playlistTracks.map((track, idx) => {
                  const isCurrent = track.id === currentTrackId;
                  return (
                    <div
                      key={track.id}
                      className={`group flex items-center justify-between px-3 py-2 border transition-colors ${
                        isCurrent
                          ? 'bg-[#1C1C26] border-[#D7FF3F] text-[#D7FF3F]'
                          : 'bg-[#13131A] border-[#454450] text-[#F0EFEA] hover:border-[#D7FF3F]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                        <span className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD] w-6 shrink-0">
                          {idx + 1}.
                        </span>

                        <button
                          onClick={() => onPlayTrack(track)}
                          className={`w-6 h-6 flex items-center justify-center shrink-0 border ${
                            isCurrent && isPlaying
                              ? 'bg-[#D7FF3F] text-black border-[#D7FF3F]'
                              : 'bg-[#09090C] text-[#F0EFEA] border-[#454450] group-hover:border-[#D7FF3F]'
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                        </button>

                        <div className="min-w-0 flex-1 flex items-center gap-2">
                          <span className="font-['Space_Grotesk'] text-sm font-bold truncate text-[#F0EFEA]">
                            {track.title}
                          </span>
                          <span className="font-['Space_Grotesk'] text-xs text-[#A3A1AD] truncate hidden sm:inline">
                            — {track.artist}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD]">
                          {formatDuration(track.duration)}
                        </span>

                        <button
                          onClick={() => onRemoveTrackFromPlaylist(selectedPlaylist.id, track.id)}
                          className="p-1 text-[#A3A1AD] hover:text-[#FF5A63]"
                          title="Remove from Playlist"
                          aria-label={`Remove ${track.title} from playlist`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="p-8 text-center font-['Space_Grotesk'] text-sm text-[#A3A1AD]">
            PILIH ATAU BUAT PLAYLIST UNTUK MELIHAT DAFTAR LAGU.
          </div>
        )}
      </div>

      {/* CREATE PLAYLIST MODAL */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-md bg-[#13131A] border-2 border-[#D7FF3F] p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-[#454450] pb-2">
              <span className="font-['Archivo_Black'] text-lg text-[#F0EFEA]">
                CREATE PLAYLIST
              </span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-[#A3A1AD] hover:text-[#FF5A63]"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD] block mb-1">
                PLAYLIST NAME:
              </label>
              <input
                type="text"
                required
                autoFocus
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="e.g. INDUSTRIAL METAL ARCHIVE"
                className="w-full px-3 py-2 bg-[#09090C] border border-[#454450] text-[#F0EFEA] font-['Space_Grotesk'] text-sm focus:border-[#D7FF3F] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD] block mb-2">
                SELECT BRUTALIST ICON:
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PLAYLIST_ICONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = newPlaylistIcon === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNewPlaylistIcon(item.id)}
                      className={`p-2.5 flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-[#D7FF3F] text-black border-[#D7FF3F]'
                          : 'bg-[#09090C] text-[#F0EFEA] border-[#454450] hover:border-[#D7FF3F]'
                      }`}
                      title={item.label}
                    >
                      <IconComp className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#454450]">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 border border-[#454450] text-[#F0EFEA] font-['Space_Grotesk'] text-xs font-bold hover:bg-[#1C1C26]"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#D7FF3F] text-black border border-black font-['Space_Grotesk'] text-xs font-bold uppercase hover:bg-[#c6f030]"
              >
                CREATE PLAYLIST
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT PLAYLIST MODAL */}
      {editingPlaylist && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleEditSubmit}
            className="w-full max-w-md bg-[#13131A] border-2 border-[#454450] p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-[#454450] pb-2">
              <span className="font-['Archivo_Black'] text-lg text-[#F0EFEA]">
                EDIT PLAYLIST
              </span>
              <button
                type="button"
                onClick={() => setEditingPlaylist(null)}
                className="text-[#A3A1AD] hover:text-[#FF5A63]"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD] block mb-1">
                PLAYLIST NAME:
              </label>
              <input
                type="text"
                required
                value={editingPlaylist.name}
                onChange={(e) =>
                  setEditingPlaylist({ ...editingPlaylist, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#09090C] border border-[#454450] text-[#F0EFEA] font-['Space_Grotesk'] text-sm focus:border-[#D7FF3F] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD] block mb-2">
                CHANGE ICON:
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PLAYLIST_ICONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = editingPlaylist.icon === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEditingPlaylist({ ...editingPlaylist, icon: item.id })}
                      className={`p-2.5 flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-[#D7FF3F] text-black border-[#D7FF3F]'
                          : 'bg-[#09090C] text-[#F0EFEA] border-[#454450] hover:border-[#D7FF3F]'
                      }`}
                      title={item.label}
                    >
                      <IconComp className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#454450]">
              <button
                type="button"
                onClick={() => setEditingPlaylist(null)}
                className="px-4 py-2 border border-[#454450] text-[#F0EFEA] font-['Space_Grotesk'] text-xs font-bold"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#D7FF3F] text-black border border-black font-['Space_Grotesk'] text-xs font-bold uppercase hover:bg-[#c6f030]"
              >
                SAVE CHANGES
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#13131A] border-2 border-[#FF5A63] p-6 space-y-4">
            <div className="font-['Archivo_Black'] text-base text-[#FF5A63]">
              HAPUS PLAYLIST?
            </div>
            <p className="font-['Space_Grotesk'] text-xs text-[#F0EFEA]">
              Menghapus playlist ini tidak akan menghapus file musik asli atau lagu dari library Anda.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 border border-[#454450] text-[#F0EFEA] font-['Space_Grotesk'] text-xs"
              >
                BATAL
              </button>
              <button
                onClick={() => {
                  onDeletePlaylist(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-1.5 bg-[#FF5A63] text-black font-['Space_Grotesk'] text-xs font-bold uppercase hover:bg-[#e03b44]"
              >
                HAPUS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
