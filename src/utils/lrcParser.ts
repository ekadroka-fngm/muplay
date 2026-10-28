import { LyricData, LyricLine } from '../types/music';

/**
 * Parses LRC or plain TXT content into structured LyricData.
 */
export function parseLyrics(content: string, fileName?: string): LyricData {
  if (!content || !content.trim()) {
    return {
      type: 'txt',
      lines: [],
      rawText: '',
      offsetMs: 0,
    };
  }

  const isLrc = fileName ? fileName.toLowerCase().endsWith('.lrc') : /\[\d{2}:\d{2}/.test(content);
  const rawLines = content.split(/\r?\n/);

  if (!isLrc) {
    const lines: LyricLine[] = rawLines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((text, idx) => ({
        time: idx,
        text,
      }));

    return {
      type: 'txt',
      lines,
      rawText: content,
      offsetMs: 0,
    };
  }

  // Parse LRC lines
  // Standard format: [mm:ss.xx] lyric text or [mm:ss.xxx]
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/g;
  const parsedLines: LyricLine[] = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for ID tags like [offset:+100], [ti:...], [ar:...]
    if (/^\[(ti|ar|al|au|by|offset):/i.test(trimmed)) {
      continue;
    }

    const matches = Array.from(trimmed.matchAll(timeRegex));
    if (matches.length > 0) {
      // The text is whatever remains after stripping all timestamps
      const text = trimmed.replace(timeRegex, '').trim();
      for (const match of matches) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const msPart = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
        const totalSeconds = minutes * 60 + seconds + msPart / 1000;
        parsedLines.push({
          time: totalSeconds,
          text: text || '♪',
        });
      }
    }
  }

  // Sort chronologically
  parsedLines.sort((a, b) => a.time - b.time);

  return {
    type: 'lrc',
    lines: parsedLines,
    rawText: content,
    offsetMs: 0,
  };
}

/**
 * Finds current active lyric index based on playback time in seconds and user offset in ms.
 */
export function getActiveLyricIndex(
  lines: LyricLine[],
  currentTimeSec: number,
  offsetMs: number = 0
): number {
  if (!lines || lines.length === 0) return -1;

  // Apply offset: positive offset means lyric is delayed, so effective time is currentTime - offset
  const effectiveTime = currentTimeSec + offsetMs / 1000;

  if (effectiveTime < lines[0].time) {
    return 0;
  }

  let activeIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= effectiveTime) {
      activeIndex = i;
    } else {
      break;
    }
  }

  return activeIndex;
}
