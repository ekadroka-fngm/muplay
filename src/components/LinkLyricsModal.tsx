import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Check } from 'lucide-react';
import { Track } from '../types/music';
import { parseLyrics } from '../utils/lrcParser';

interface LinkLyricsModalProps {
  track: Track | null;
  onClose: () => void;
  onSaveLyrics: (trackId: string, content: string, fileName?: string) => void;
}

export const LinkLyricsModal: React.FC<LinkLyricsModalProps> = ({
  track,
  onClose,
  onSaveLyrics,
}) => {
  const [content, setContent] = useState(track?.lyrics?.rawText || '');
  const [formatType, setFormatType] = useState<'lrc' | 'txt'>(
    track?.lyrics?.type || 'lrc'
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!track) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setContent(text);
        if (file.name.toLowerCase().endsWith('.lrc')) {
          setFormatType('lrc');
        } else {
          setFormatType('txt');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSaveLyrics(track.id, content, formatType === 'lrc' ? 'lyrics.lrc' : 'lyrics.txt');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSave}
        className="w-full max-w-lg bg-[#13131A] border-2 border-[#454450] p-6 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-[#454450] pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#D7FF3F]"></span>
            <h3 className="font-['Archivo_Black'] text-base text-[#F0EFEA]">
              TAUTKAN LIRIK LOKAL
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:text-[#FF5A63]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="font-['Space_Grotesk'] text-xs text-[#A3A1AD] truncate">
          LAGU: <span className="font-bold text-[#F0EFEA]">{track.title}</span> — {track.artist}
        </div>

        {/* Upload file button */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".lrc,.txt"
          className="hidden"
          onChange={handleFileUpload}
        />
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-[#09090C] border border-[#454450] hover:border-[#D7FF3F] text-[#D7FF3F] font-['Space_Grotesk'] text-xs font-bold uppercase transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>PILIH BERKAS .LRC / .TXT</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD]">TIPE:</span>
            <button
              type="button"
              onClick={() => setFormatType('lrc')}
              className={`px-2 py-1 font-['IBM_Plex_Mono'] text-xs font-bold border ${
                formatType === 'lrc'
                  ? 'bg-[#D7FF3F] text-black border-[#D7FF3F]'
                  : 'bg-[#09090C] text-[#A3A1AD] border-[#454450]'
              }`}
            >
              .LRC (SYNCED)
            </button>
            <button
              type="button"
              onClick={() => setFormatType('txt')}
              className={`px-2 py-1 font-['IBM_Plex_Mono'] text-xs font-bold border ${
                formatType === 'txt'
                  ? 'bg-[#D7FF3F] text-black border-[#D7FF3F]'
                  : 'bg-[#09090C] text-[#A3A1AD] border-[#454450]'
              }`}
            >
              .TXT (PLAIN)
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div>
          <label className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD] block mb-1">
            KONTEN LIRIK (ATAU TEMPEL DI SINI):
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder={`[00:04.50] Baris lirik tersinkronisasi...\n[00:10.20] Baris berikutnya...`}
            className="w-full p-3 bg-[#09090C] border border-[#454450] text-[#F0EFEA] font-['IBM_Plex_Mono'] text-xs leading-relaxed focus:border-[#D7FF3F] focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#454450]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#454450] text-[#F0EFEA] font-['Space_Grotesk'] text-xs font-bold"
          >
            BATAL
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#D7FF3F] text-black font-['Space_Grotesk'] text-xs font-bold uppercase border border-black hover:bg-[#c6f030]"
          >
            SIMPAN LIRIK
          </button>
        </div>
      </form>
    </div>
  );
};
