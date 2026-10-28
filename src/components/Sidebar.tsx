import React from 'react';
import {
  Disc,
  Library,
  ListMusic,
  Sliders,
  Settings,
  Sun,
  Moon,
  Volume2,
  X,
  Music2,
  AudioWaveform,
} from 'lucide-react';

export type NavTab = 'now-playing' | 'library' | 'playlists' | 'equalizer' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  trackCount: number;
  playlistCount: number;
  isPlaying: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  trackCount,
  playlistCount,
  isPlaying,
  theme,
  onToggleTheme,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'now-playing' as NavTab,
      label: 'NOW PLAYING',
      icon: AudioWaveform,
      badge: isPlaying ? 'ACTIVE' : undefined,
    },
    {
      id: 'library' as NavTab,
      label: 'LIBRARY',
      icon: Library,
      badge: `${trackCount}`,
    },
    {
      id: 'playlists' as NavTab,
      label: 'PLAYLISTS',
      icon: ListMusic,
      badge: `${playlistCount}`,
    },
    {
      id: 'equalizer' as NavTab,
      label: 'EQUALIZER',
      icon: Sliders,
      badge: '10-BAND',
    },
    {
      id: 'settings' as NavTab,
      label: 'SETTINGS',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#09090C] border-r-2 border-[#454450] flex flex-col justify-between transition-transform duration-200 ease-out select-none ${
          isOpenMobile
            ? 'translate-x-0 pointer-events-auto shadow-2xl'
            : '-translate-x-full md:translate-x-0 md:pointer-events-auto pointer-events-none'
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="p-4 border-b-2 border-[#454450] flex items-center justify-between bg-[#13131A]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#D7FF3F] inline-block"></span>
                <h1 className="font-['Archivo_Black'] text-xl tracking-wider text-[#F0EFEA]">
                  MUPLAY
                </h1>
              </div>
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#A3A1AD] tracking-widest mt-0.5">
                VER 0.3 // OFFLINE
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 border border-[#454450] text-[#F0EFEA] hover:bg-[#D7FF3F] hover:text-black transition-colors"
              aria-label="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-3 text-left font-['Space_Grotesk'] text-sm tracking-wide font-bold transition-all border ${
                    isActive
                      ? 'bg-[#D7FF3F] text-black border-[#D7FF3F] shadow-[3px_3px_0px_0px_#454450]'
                      : 'bg-[#13131A] text-[#F0EFEA] border-[#454450] hover:bg-[#1C1C26] hover:border-[#D7FF3F]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`font-['IBM_Plex_Mono'] text-[11px] px-1.5 py-0.5 border ${
                        isActive
                          ? 'bg-black text-[#D7FF3F] border-black font-semibold'
                          : 'bg-[#09090C] text-[#A3A1AD] border-[#454450]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Theme Toggle & Architecture Info */}
        <div className="p-3 border-t-2 border-[#454450] bg-[#13131A] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#A3A1AD] uppercase">
              THEME: {theme.toUpperCase()}
            </span>
            <button
              onClick={onToggleTheme}
              className="p-1.5 border border-[#454450] text-[#F0EFEA] hover:bg-[#D7FF3F] hover:text-black transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title="Toggle Dark / Light Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="pt-2 border-t border-[#454450]/60 flex items-center justify-between text-[10px] font-['IBM_Plex_Mono'] text-[#A3A1AD]">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 ${isPlaying ? 'bg-[#D7FF3F] animate-pulse' : 'bg-[#454450]'}`}></span>
              {isPlaying ? 'ENGINE PLAYING' : 'ENGINE IDLE'}
            </span>
            <span>NO CLOUD SYNC</span>
          </div>
        </div>
      </aside>
    </>
  );
};
