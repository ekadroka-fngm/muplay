import React from 'react';
import {
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
  ListMusic,
} from 'lucide-react';

interface BottomPlaylistStripProps {
  activePlaylistName?: string | null;
  activePlaylistIcon?: string | null;
}

const ICON_MAP: Record<string, React.ElementType> = {
  disc: Disc,
  flame: Flame,
  skull: Skull,
  zap: Zap,
  radio: Radio,
  tape: CassetteTape,
  terminal: Terminal,
  shield: Shield,
  waves: Waves,
  box: Box,
  target: Target,
  crosshair: Crosshair,
  star: Star,
};

export const BottomPlaylistStrip: React.FC<BottomPlaylistStripProps> = ({
  activePlaylistName,
  activePlaylistIcon,
}) => {
  if (!activePlaylistName) {
    return null;
  }

  const IconComponent = (activePlaylistIcon && ICON_MAP[activePlaylistIcon]) || ListMusic;

  return (
    <div
      role="status"
      aria-label="Active Playlist Indicator"
      className="h-8 bg-[#13131A] border-t-2 border-[#454450] flex items-center justify-center px-4 select-none shrink-0"
    >
      <div className="flex items-center gap-2 font-['IBM_Plex_Mono'] text-xs font-bold tracking-wider text-[#D7FF3F] uppercase truncate">
        <IconComponent className="w-3.5 h-3.5 shrink-0 text-[#D7FF3F]" />
        <span className="truncate">{activePlaylistName}</span>
      </div>
    </div>
  );
};
