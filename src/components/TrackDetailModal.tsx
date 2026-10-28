import React from 'react';
import { X, FileAudio, Info, CheckCircle2 } from 'lucide-react';
import { Track } from '../types/music';
import { formatBytes, formatDuration } from '../utils/formatters';

interface TrackDetailModalProps {
  track: Track | null;
  onClose: () => void;
}

export const TrackDetailModal: React.FC<TrackDetailModalProps> = ({ track, onClose }) => {
  if (!track) return null;

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#13131A] border-2 border-[#454450] p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[#454450] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#D7FF3F]"></span>
            <h3 className="font-['Archivo_Black'] text-lg text-[#F0EFEA] tracking-wide">
              AUDIO FILE METADATA
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-[#454450] hover:bg-[#D7FF3F] hover:text-black text-[#F0EFEA] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-[10px] font-['IBM_Plex_Mono'] text-[#A3A1AD] uppercase">TITLE</div>
            <div className="font-['Archivo_Black'] text-xl text-[#F0EFEA]">{track.title}</div>
          </div>

          <div className="grid grid-cols-2 gap-3 font-['IBM_Plex_Mono'] text-xs">
            <div className="p-2 border border-[#454450] bg-[#09090C]">
              <div className="text-[10px] text-[#A3A1AD]">ARTIST</div>
              <div className="font-bold text-[#F0EFEA] truncate">{track.artist}</div>
            </div>

            <div className="p-2 border border-[#454450] bg-[#09090C]">
              <div className="text-[10px] text-[#A3A1AD]">ALBUM</div>
              <div className="font-bold text-[#F0EFEA] truncate">{track.album || 'UNKNOWN'}</div>
            </div>

            <div className="p-2 border border-[#454450] bg-[#09090C]">
              <div className="text-[10px] text-[#A3A1AD]">CODEC / CONTAINER</div>
              <div className="font-bold text-[#D7FF3F]">{track.format}</div>
            </div>

            <div className="p-2 border border-[#454450] bg-[#09090C]">
              <div className="text-[10px] text-[#A3A1AD]">DURATION</div>
              <div className="font-bold text-[#F0EFEA]">{formatDuration(track.duration)}</div>
            </div>

            <div className="p-2 border border-[#454450] bg-[#09090C]">
              <div className="text-[10px] text-[#A3A1AD]">SAMPLE RATE</div>
              <div className="font-bold text-[#F0EFEA]">
                {track.sampleRate ? `${track.sampleRate / 1000} kHz` : '—'}
              </div>
            </div>

            <div className="p-2 border border-[#454450] bg-[#09090C]">
              <div className="text-[10px] text-[#A3A1AD]">CHANNELS</div>
              <div className="font-bold text-[#F0EFEA]">
                {track.channels === 1 ? '1.0 MONO' : '2.0 STEREO'}
              </div>
            </div>

            <div className="p-2 border border-[#454450] bg-[#09090C]">
              <div className="text-[10px] text-[#A3A1AD]">ESTIMATED BITRATE</div>
              <div className="font-bold text-[#D7FF3F]">{track.bitrate || '—'}</div>
            </div>

            <div className="p-2 border border-[#454450] bg-[#09090C]">
              <div className="text-[10px] text-[#A3A1AD]">FILE SIZE</div>
              <div className="font-bold text-[#F0EFEA]">{formatBytes(track.fileSize)}</div>
            </div>

            <div className="p-2 border border-[#454450] bg-[#09090C] col-span-2">
              <div className="text-[10px] text-[#A3A1AD]">STORAGE MODE</div>
              <div className="font-bold text-[#F0EFEA]">
                {track.storageMode === 'copied'
                  ? 'PERSISTENT LOCAL COPY (INDEXEDDB)'
                  : 'TEMPORARY FILE REFERENCE'}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#09090C] border border-[#454450] font-['Space_Grotesk'] text-[11px] text-[#A3A1AD]">
          * Sesuai PRD 2.1 & 7.3: Metadata di atas merupakan data sumber aktual file, bukan pembuktian bit-perfect hardware output.
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#D7FF3F] text-black font-['Space_Grotesk'] text-xs font-bold uppercase border border-black hover:bg-[#c6f030]"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};
