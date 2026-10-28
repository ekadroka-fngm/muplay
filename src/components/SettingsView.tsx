import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  HardDrive,
  Cpu,
  Keyboard,
  RotateCcw,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';
import { AppSettings } from '../types/music';
import { dbGetStorageEstimate } from '../utils/indexedDb';
import { formatBytes } from '../utils/formatters';
import { audioEngine } from '../audio/audioEngine';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetToDemoTracks: () => void;
  onClearAllLibrary: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetToDemoTracks,
  onClearAllLibrary,
}) => {
  const [storageEstimate, setStorageEstimate] = useState<{ usedBytes: number; quotaBytes: number }>({
    usedBytes: 0,
    quotaBytes: 0,
  });

  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    dbGetStorageEstimate().then(setStorageEstimate);
  }, []);

  const audioDetails = audioEngine.getAudioContextDetails();

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#09090C] text-[#F0EFEA] p-4 md:p-6 lg:p-8 space-y-6">
      {/* Title */}
      <div className="border-b-2 border-[#454450] pb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#D7FF3F]"></span>
          <h2 className="font-['Archivo_Black'] text-2xl md:text-3xl tracking-tight text-[#F0EFEA]">
            SYSTEM SETTINGS
          </h2>
        </div>
        <div className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD] mt-1">
          LOCAL-FIRST ARCHITECTURE // ZERO TELEMETRY // PRIVATE BY DEFAULT
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Appearance & Theme (PRD 4.1, FR-14) */}
        <div className="border-2 border-[#454450] bg-[#13131A] p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#454450] pb-2">
            <Sun className="w-4 h-4 text-[#D7FF3F]" />
            <h3 className="font-['Archivo_Black'] text-sm tracking-wider text-[#F0EFEA]">
              INTERFACE THEME
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onUpdateSettings({ theme: 'dark' })}
              className={`p-3 border text-left transition-all ${
                settings.theme === 'dark'
                  ? 'bg-[#1C1C26] border-[#D7FF3F] text-[#D7FF3F] shadow-[2px_2px_0px_0px_#454450]'
                  : 'bg-[#09090C] border-[#454450] text-[#A3A1AD] hover:border-[#D7FF3F]'
              }`}
            >
              <div className="flex items-center gap-2 font-['Space_Grotesk'] font-bold text-xs">
                <Moon className="w-4 h-4" />
                <span>EXTREME DARK</span>
              </div>
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#A3A1AD] mt-1">
                DEFAULT INDUSTRIAL
              </div>
            </button>

            <button
              onClick={() => onUpdateSettings({ theme: 'light' })}
              className={`p-3 border text-left transition-all ${
                settings.theme === 'light'
                  ? 'bg-[#1C1C26] border-[#D7FF3F] text-[#D7FF3F] shadow-[2px_2px_0px_0px_#454450]'
                  : 'bg-[#09090C] border-[#454450] text-[#A3A1AD] hover:border-[#D7FF3F]'
              }`}
            >
              <div className="flex items-center gap-2 font-['Space_Grotesk'] font-bold text-xs">
                <Sun className="w-4 h-4" />
                <span>BRUTAL LIGHT</span>
              </div>
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#A3A1AD] mt-1">
                HIGH CONTRAST MONO
              </div>
            </button>
          </div>

          {/* Reduced Motion Toggle (PRD 5.3) */}
          <div className="flex items-center justify-between pt-2 border-t border-[#454450]/60">
            <div>
              <div className="font-['Space_Grotesk'] text-xs font-bold text-[#F0EFEA]">
                REDUCED MOTION MODE
              </div>
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#A3A1AD]">
                REDUCE INTENSIVE TRANSITIONS
              </div>
            </div>

            <button
              onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
              className={`px-3 py-1.5 border font-['IBM_Plex_Mono'] text-xs font-bold ${
                settings.reducedMotion
                  ? 'bg-[#D7FF3F] text-black border-[#D7FF3F]'
                  : 'bg-[#09090C] text-[#A3A1AD] border-[#454450]'
              }`}
            >
              {settings.reducedMotion ? 'ENABLED' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Section 2: Storage Modes (PRD 12.2, FR-16) */}
        <div className="border-2 border-[#454450] bg-[#13131A] p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#454450] pb-2">
            <HardDrive className="w-4 h-4 text-[#D7FF3F]" />
            <h3 className="font-['Archivo_Black'] text-sm tracking-wider text-[#F0EFEA]">
              LOCAL STORAGE ARCHITECTURE
            </h3>
          </div>

          <div className="space-y-2">
            <label
              onClick={() => onUpdateSettings({ storageMode: 'copied' })}
              className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                settings.storageMode === 'copied'
                  ? 'bg-[#1C1C26] border-[#D7FF3F]'
                  : 'bg-[#09090C] border-[#454450]'
              }`}
            >
              <input
                type="radio"
                name="storageMode"
                checked={settings.storageMode === 'copied'}
                onChange={() => onUpdateSettings({ storageMode: 'copied' })}
                className="mt-1 accent-[#D7FF3F]"
              />
              <div>
                <div className="font-['Space_Grotesk'] text-xs font-bold text-[#F0EFEA]">
                  MODE B — SALINAN LOKAL (RECOMMENDED)
                </div>
                <div className="font-['Space_Grotesk'] text-[11px] text-[#A3A1AD] mt-0.5">
                  Menyimpan file audio langsung ke IndexedDB browser agar tetap dapat diputar secara permanen bahkan setelah browser ditutup atau diputus dari jaringan.
                </div>
              </div>
            </label>

            <label
              onClick={() => onUpdateSettings({ storageMode: 'reference' })}
              className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                settings.storageMode === 'reference'
                  ? 'bg-[#1C1C26] border-[#D7FF3F]'
                  : 'bg-[#09090C] border-[#454450]'
              }`}
            >
              <input
                type="radio"
                name="storageMode"
                checked={settings.storageMode === 'reference'}
                onChange={() => onUpdateSettings({ storageMode: 'reference' })}
                className="mt-1 accent-[#D7FF3F]"
              />
              <div>
                <div className="font-['Space_Grotesk'] text-xs font-bold text-[#F0EFEA]">
                  MODE A — REFERENSI FILE ASLI
                </div>
                <div className="font-['Space_Grotesk'] text-[11px] text-[#A3A1AD] mt-0.5">
                  Hanya menyimpan referensi file pada sesi browser. Menghemat ruang IndexedDB namun mungkin memerlukan pemilihan ulang jika file dipindahkan.
                </div>
              </div>
            </label>
          </div>

          {/* Storage Quota Telemetry */}
          <div className="p-3 bg-[#09090C] border border-[#454450] font-['IBM_Plex_Mono'] text-xs space-y-1.5">
            <div className="flex justify-between text-[#A3A1AD]">
              <span>INDEXEDDB USAGE:</span>
              <span className="text-[#D7FF3F] font-bold">
                {formatBytes(storageEstimate.usedBytes)}
              </span>
            </div>
            <div className="flex justify-between text-[#A3A1AD]">
              <span>AVAILABLE QUOTA:</span>
              <span className="text-[#F0EFEA]">
                {formatBytes(storageEstimate.quotaBytes)}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Audio Engine Status (PRD 14.2) */}
        <div className="border-2 border-[#454450] bg-[#13131A] p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#454450] pb-2">
            <Cpu className="w-4 h-4 text-[#D7FF3F]" />
            <h3 className="font-['Archivo_Black'] text-sm tracking-wider text-[#F0EFEA]">
              AUDIO ENGINE STATUS
            </h3>
          </div>

          <div className="font-['IBM_Plex_Mono'] text-xs space-y-2">
            <div className="flex justify-between border-b border-[#454450]/40 pb-1">
              <span className="text-[#A3A1AD]">WEB AUDIO PIPELINE:</span>
              <span className="text-[#D7FF3F] font-bold uppercase">{audioDetails.state}</span>
            </div>
            <div className="flex justify-between border-b border-[#454450]/40 pb-1">
              <span className="text-[#A3A1AD]">HARDWARE SAMPLE RATE:</span>
              <span className="text-[#F0EFEA]">{audioDetails.sampleRate} Hz</span>
            </div>
            <div className="flex justify-between border-b border-[#454450]/40 pb-1">
              <span className="text-[#A3A1AD]">EQUALIZER STATUS:</span>
              <span className={settings.eqEnabled ? 'text-[#D7FF3F]' : 'text-[#A3A1AD]'}>
                {settings.eqEnabled ? 'ACTIVE (10 BIQUAD FILTERS)' : 'BYPASSED'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A3A1AD]">NO STREAMING GUARANTEE:</span>
              <span className="text-[#D7FF3F] font-bold">100% AIRGAPPED LOCAL</span>
            </div>
          </div>
        </div>

        {/* Section 4: Keyboard Shortcuts Guide */}
        <div className="border-2 border-[#454450] bg-[#13131A] p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#454450] pb-2">
            <Keyboard className="w-4 h-4 text-[#D7FF3F]" />
            <h3 className="font-['Archivo_Black'] text-sm tracking-wider text-[#F0EFEA]">
              KEYBOARD CONTROLS
            </h3>
          </div>

          <div className="font-['IBM_Plex_Mono'] text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#A3A1AD]">SPACE:</span>
              <span className="font-bold text-[#F0EFEA]">PLAY / PAUSE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A3A1AD]">ARROW LEFT / RIGHT:</span>
              <span className="font-bold text-[#D7FF3F]">-10S / +10S STEP SEEK</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A3A1AD]">ARROW UP / DOWN:</span>
              <span className="font-bold text-[#F0EFEA]">VOLUME ±5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A3A1AD]">KEY 'M':</span>
              <span className="font-bold text-[#F0EFEA]">MUTE / UNMUTE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A3A1AD]">KEY 'N' / 'P':</span>
              <span className="font-bold text-[#F0EFEA]">NEXT / PREVIOUS TRACK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Data Management & Reset */}
      <div className="border-2 border-[#FF5A63]/60 bg-[#13131A] p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#454450] pb-2 text-[#FF5A63]">
          <RotateCcw className="w-4 h-4" />
          <h3 className="font-['Archivo_Black'] text-sm tracking-wider">
            DANGER ZONE // REPOSITORY MAINTENANCE
          </h3>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-['Space_Grotesk'] text-xs font-bold text-[#F0EFEA]">
              RESET DEMO TRACKS OR CLEAR DATA
            </div>
            <div className="font-['Space_Grotesk'] text-[11px] text-[#A3A1AD]">
              Muplay tidak mengunggah data apa pun ke server. Seluruh data disimpan di perangkat Anda.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onResetToDemoTracks}
              className="px-3 py-2 bg-[#09090C] border border-[#454450] hover:border-[#D7FF3F] text-[#D7FF3F] font-['Space_Grotesk'] text-xs font-bold uppercase transition-colors"
            >
              LOAD SYNTHESIZED DEMO AUDIO
            </button>

            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="px-3 py-2 bg-[#09090C] border border-[#FF5A63] text-[#FF5A63] hover:bg-[#FF5A63] hover:text-black font-['Space_Grotesk'] text-xs font-bold uppercase transition-colors"
              >
                CLEAR ALL LIBRARY
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-1.5 border border-[#454450] text-xs font-['Space_Grotesk']"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    onClearAllLibrary();
                    setConfirmClear(false);
                  }}
                  className="px-3 py-1.5 bg-[#FF5A63] text-black font-['Space_Grotesk'] text-xs font-bold uppercase"
                >
                  CONFIRM PURGE
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
