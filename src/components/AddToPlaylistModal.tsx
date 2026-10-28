import React, { useState } from 'react';
import { X, Plus, Check, Disc } from 'lucide-react';
import { Playlist, Track } from '../types/music';
import { PLAYLIST_ICONS } from './PlaylistsView';

interface AddToPlaylistModalProps {
  track: Track | null;
  playlists: Playlist[];
  onClose: () => void;
  onAddTrackToPlaylist: (playlistId: string, trackId: string) => void;
  onCreateAndAdd: (name: string, icon: string, trackId: string) => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  track,
  playlists,
  onClose,
  onAddTrackToPlaylist,
  onCreateAndAdd,
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistIcon, setNewPlaylistIcon] = useState('disc');

  if (!track) return null;

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreateAndAdd(newPlaylistName.trim(), newPlaylistIcon, track.id);
    onClose();
  };

  const renderIcon = (iconName: string) => {
    const item = PLAYLIST_ICONS.find((i) => i.id === iconName);
    const IconComp = item ? item.icon : Disc;
    return <IconComp className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#13131A] border-2 border-[#454450] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#454450] pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#D7FF3F]"></span>
            <h3 className="font-['Archivo_Black'] text-base text-[#F0EFEA]">
              TAMBAHKAN KE PLAYLIST
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:text-[#FF5A63]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="font-['Space_Grotesk'] text-xs text-[#A3A1AD] truncate">
          LAGU: <span className="font-bold text-[#F0EFEA]">{track.title}</span> — {track.artist}
        </div>

        {!isCreatingNew ? (
          <div className="space-y-3">
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {playlists.length === 0 ? (
                <div className="p-4 text-center text-xs font-['Space_Grotesk'] text-[#A3A1AD]">
                  Belum ada playlist. Buat playlist baru sekarang.
                </div>
              ) : (
                playlists.map((pl) => {
                  const alreadyIn = pl.trackIds.includes(track.id);
                  return (
                    <button
                      key={pl.id}
                      disabled={alreadyIn}
                      onClick={() => {
                        onAddTrackToPlaylist(pl.id, track.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-2.5 border text-left font-['Space_Grotesk'] text-xs transition-colors ${
                        alreadyIn
                          ? 'bg-[#09090C] border-[#454450] text-[#A3A1AD] opacity-60'
                          : 'bg-[#09090C] border-[#454450] text-[#F0EFEA] hover:border-[#D7FF3F] hover:text-[#D7FF3F]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[#D7FF3F]">{renderIcon(pl.icon)}</span>
                        <span className="font-bold truncate">{pl.name}</span>
                      </div>
                      {alreadyIn ? (
                        <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#A3A1AD]">SUDAH ADA</span>
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setIsCreatingNew(true)}
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-[#09090C] border border-[#D7FF3F] text-[#D7FF3F] font-['Space_Grotesk'] text-xs font-bold uppercase hover:bg-[#D7FF3F] hover:text-black transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ BUAT PLAYLIST BARU</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateAndAdd} className="space-y-3">
            <div>
              <label className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD] block mb-1">
                NAMA PLAYLIST:
              </label>
              <input
                type="text"
                required
                autoFocus
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="CONTOH: HEAVY INDUSTRIAL"
                className="w-full px-3 py-1.5 bg-[#09090C] border border-[#454450] text-[#F0EFEA] font-['Space_Grotesk'] text-xs focus:border-[#D7FF3F] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD] block mb-1">
                PILIH IKON:
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {PLAYLIST_ICONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = newPlaylistIcon === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNewPlaylistIcon(item.id)}
                      className={`p-2 flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-[#D7FF3F] text-black border-[#D7FF3F]'
                          : 'bg-[#09090C] text-[#F0EFEA] border-[#454450] hover:border-[#D7FF3F]'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#454450]">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-3 py-1.5 border border-[#454450] text-xs font-['Space_Grotesk']"
              >
                KEMBALI
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#D7FF3F] text-black font-['Space_Grotesk'] text-xs font-bold uppercase hover:bg-[#c6f030]"
              >
                BUAT & TAMBAHKAN
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
