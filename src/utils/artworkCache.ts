/**
 * Artwork cache and procedural brutalist cover generator
 */

// Memory cache for fast synchronous lookup
const artworkMemoryCache = new Map<string, string>();

/**
 * Generate a 32-bit hash from a string
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generate a deterministic brutalist SVG artwork for a track based on its metadata
 */
export function generateBrutalistArtwork(
  title: string,
  artist: string = 'UNKNOWN ARTIST',
  format: string = 'AUDIO',
  seedId: string = ''
): string {
  const seed = hashString(`${title}_${artist}_${seedId}`);

  // Palette selection
  const palettes = [
    { bg: '#09090C', card: '#13131A', accent: '#D7FF3F', sub: '#F0EFEA' }, // Neon Volt
    { bg: '#0E0E14', card: '#181824', accent: '#9B72FF', sub: '#F0EFEA' }, // Electric Purple
    { bg: '#140A0A', card: '#1F1010', accent: '#FF5A63', sub: '#F0EFEA' }, // Industrial Red
    { bg: '#081014', card: '#0E1A20', accent: '#00F0FF', sub: '#F0EFEA' }, // Cyber Cyan
  ];
  const p = palettes[seed % palettes.length];

  // Geometric pattern variant (0: concentric circles, 1: diagonal monolithic grid, 2: seismic waveform, 3: architectural polygons)
  const variant = seed % 4;
  const safeTitle = (title || 'UNTITLED').toUpperCase().replace(/[&<>"']/g, '').slice(0, 20);
  const safeArtist = (artist || 'UNKNOWN ARTIST').toUpperCase().replace(/[&<>"']/g, '').slice(0, 24);
  const safeFormat = (format || 'PCM').toUpperCase().slice(0, 6);
  const serialNo = `RAW-${(seed % 900 + 100).toString()}`;

  let graphicElements = '';
  if (variant === 0) {
    graphicElements = `
      <circle cx="250" cy="250" r="140" fill="none" stroke="${p.accent}" stroke-width="3" stroke-dasharray="10 6"/>
      <circle cx="250" cy="250" r="90" fill="none" stroke="#454450" stroke-width="3"/>
      <circle cx="250" cy="250" r="50" fill="${p.accent}" opacity="0.9"/>
      <circle cx="250" cy="250" r="16" fill="${p.bg}"/>
      <line x1="20" y1="250" x2="480" y2="250" stroke="#454450" stroke-width="1"/>
      <line x1="250" y1="20" x2="250" y2="480" stroke="#454450" stroke-width="1"/>
    `;
  } else if (variant === 1) {
    graphicElements = `
      <polygon points="250,60 440,380 60,380" fill="none" stroke="${p.accent}" stroke-width="4"/>
      <polygon points="250,150 380,360 120,360" fill="${p.accent}" opacity="0.2"/>
      <line x1="60" y1="220" x2="440" y2="220" stroke="#F0EFEA" stroke-width="2"/>
      <rect x="230" y="200" width="40" height="40" fill="${p.accent}"/>
    `;
  } else if (variant === 2) {
    graphicElements = `
      <path d="M40 250 Q 140 80 250 250 T 460 250" fill="none" stroke="${p.accent}" stroke-width="5"/>
      <path d="M40 250 Q 140 420 250 250 T 460 250" fill="none" stroke="#454450" stroke-width="3"/>
      <line x1="50" y1="120" x2="450" y2="120" stroke="#454450" stroke-width="1" stroke-dasharray="4 4"/>
      <line x1="50" y1="380" x2="450" y2="380" stroke="#454450" stroke-width="1" stroke-dasharray="4 4"/>
    `;
  } else {
    graphicElements = `
      <rect x="100" y="100" width="300" height="300" fill="none" stroke="${p.accent}" stroke-width="4"/>
      <rect x="140" y="140" width="220" height="220" fill="${p.accent}" opacity="0.2"/>
      <rect x="200" y="200" width="100" height="100" fill="${p.accent}"/>
      <line x1="40" y1="40" x2="460" y2="460" stroke="#454450" stroke-width="2"/>
      <line x1="40" y1="460" x2="460" y2="40" stroke="#454450" stroke-width="2"/>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
    <rect width="500" height="500" fill="${p.bg}"/>
    <rect x="16" y="16" width="468" height="468" fill="${p.card}" stroke="#454450" stroke-width="2"/>
    ${graphicElements}
    <text x="32" y="60" font-family="monospace" font-size="12" font-weight="700" fill="${p.accent}">[${safeFormat} // ${serialNo}]</text>
    <text x="32" y="415" font-family="sans-serif" font-size="22" font-weight="900" fill="${p.sub}">${safeTitle}</text>
    <text x="32" y="445" font-family="monospace" font-size="13" font-weight="700" fill="${p.accent}">${safeArtist}</text>
  </svg>`.trim().replace(/\s+/g, ' ');

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Retrieve cached artwork or generate fallback
 */
export function getTrackArtwork(track: {
  id: string;
  title: string;
  artist?: string;
  format?: string;
  artworkUrl?: string;
}): string {
  // If track already has an artwork URL and it's valid
  if (track.artworkUrl && track.artworkUrl.trim().length > 0) {
    artworkMemoryCache.set(track.id, track.artworkUrl);
    return track.artworkUrl;
  }

  // Check in-memory cache
  if (artworkMemoryCache.has(track.id)) {
    return artworkMemoryCache.get(track.id)!;
  }

  // Check localStorage cache if window is available
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const cached = window.localStorage.getItem(`artwork_cache_${track.id}`);
      if (cached) {
        artworkMemoryCache.set(track.id, cached);
        return cached;
      }
    } catch {
      // ignore
    }
  }

  // Generate deterministic brutalist artwork
  const generated = generateBrutalistArtwork(track.title, track.artist, track.format, track.id);
  artworkMemoryCache.set(track.id, generated);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(`artwork_cache_${track.id}`, generated);
    } catch {
      // ignore quota exceeded
    }
  }

  return generated;
}

/**
 * Store artwork in cache
 */
export function cacheTrackArtwork(trackId: string, artworkUrl: string): void {
  if (!trackId || !artworkUrl) return;
  artworkMemoryCache.set(trackId, artworkUrl);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(`artwork_cache_${trackId}`, artworkUrl);
    } catch {
      // ignore
    }
  }
}
