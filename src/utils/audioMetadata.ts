import { Track } from '../types/music';

/**
 * Extracts basic ID3 tags from buffer slice if available
 */
function parseId3Basic(buffer: ArrayBuffer): { title?: string; artist?: string; album?: string; artworkUrl?: string } {
  try {
    const view = new DataView(buffer);
    // Check for ID3 header "ID3"
    if (view.getUint8(0) === 0x49 && view.getUint8(1) === 0x44 && view.getUint8(2) === 0x33) {
      const version = view.getUint8(3);
      // Read tag size (synchsafe integer)
      const tagSize =
        ((view.getUint8(6) & 0x7f) << 21) |
        ((view.getUint8(7) & 0x7f) << 14) |
        ((view.getUint8(8) & 0x7f) << 7) |
        (view.getUint8(9) & 0x7f);

      let offset = 10;
      const maxOffset = Math.min(buffer.byteLength, tagSize + 10);
      let title: string | undefined;
      let artist: string | undefined;
      let album: string | undefined;
      let artworkUrl: string | undefined;

      const textDecoder = new TextDecoder('utf-8');

      while (offset < maxOffset - 10) {
        let frameId = '';
        for (let i = 0; i < 4; i++) {
          frameId += String.fromCharCode(view.getUint8(offset + i));
        }

        // Check if frameId is valid ASCII letters/digits
        if (!/^[A-Z0-9]{4}$/.test(frameId)) {
          break;
        }

        let frameSize = 0;
        if (version === 4) {
          // synchsafe integer in ID3v2.4
          frameSize =
            ((view.getUint8(offset + 4) & 0x7f) << 21) |
            ((view.getUint8(offset + 5) & 0x7f) << 14) |
            ((view.getUint8(offset + 6) & 0x7f) << 7) |
            (view.getUint8(offset + 7) & 0x7f);
        } else {
          frameSize = view.getUint32(offset + 4);
        }

        if (frameSize <= 0 || offset + 10 + frameSize > buffer.byteLength) {
          break;
        }

        const frameDataOffset = offset + 10;
        if (frameId === 'TIT2' || frameId === 'TPE1' || frameId === 'TALB') {
          const encoding = view.getUint8(frameDataOffset);
          const rawSlice = new Uint8Array(buffer, frameDataOffset + 1, frameSize - 1);
          let text = '';
          if (encoding === 0 || encoding === 3) {
            text = textDecoder.decode(rawSlice).replace(/\0/g, '').trim();
          } else {
            // UTF-16
            try {
              text = new TextDecoder('utf-16').decode(rawSlice).replace(/\0/g, '').trim();
            } catch {
              text = textDecoder.decode(rawSlice).replace(/\0/g, '').trim();
            }
          }

          if (frameId === 'TIT2' && text) title = text;
          if (frameId === 'TPE1' && text) artist = text;
          if (frameId === 'TALB' && text) album = text;
        } else if (frameId === 'APIC' && !artworkUrl) {
          // Attached picture
          try {
            const picSlice = new Uint8Array(buffer, frameDataOffset, frameSize);
            // Search for image/jpeg or image/png
            let mimeEnd = 0;
            for (let i = 1; i < Math.min(picSlice.length, 64); i++) {
              if (picSlice[i] === 0) {
                mimeEnd = i;
                break;
              }
            }
            if (mimeEnd > 0) {
              const picDataStart = mimeEnd + 3; // skip mime, picType, description
              if (picDataStart < picSlice.length) {
                const imgBlob = new Blob([picSlice.subarray(picDataStart)], { type: 'image/jpeg' });
                artworkUrl = URL.createObjectURL(imgBlob);
              }
            }
          } catch {
            // artwork extraction failure is non-fatal
          }
        }

        offset += 10 + frameSize;
      }

      return { title, artist, album, artworkUrl };
    }
  } catch {
    // ignore parsing error
  }
  return {};
}

/**
 * Parses file extension to determine audio format
 */
export function getFormatFromFilename(name: string): string {
  const parts = name.split('.');
  if (parts.length > 1) {
    const ext = parts.pop()!.toUpperCase();
    if (['MP3', 'WAV', 'FLAC', 'AAC', 'OGG', 'M4A', 'OPUS', 'AIFF'].includes(ext)) {
      return ext;
    }
    return ext;
  }
  return 'AUDIO';
}

/**
 * Parses title and artist from filename if tags are absent.
 * e.g. "Daft Punk - Around The World.mp3" -> Artist: "Daft Punk", Title: "Around The World"
 */
export function parseNameAndArtist(filename: string): { title: string; artist: string } {
  const baseName = filename.replace(/\.[^/.]+$/, '');
  const dashIndex = baseName.indexOf(' - ');
  if (dashIndex > 0) {
    const artist = baseName.substring(0, dashIndex).trim();
    const title = baseName.substring(dashIndex + 3).trim();
    return { title: title || baseName, artist: artist || 'UNKNOWN ARTIST' };
  }
  return { title: baseName, artist: 'UNKNOWN ARTIST' };
}

/**
 * Reads local audio file and returns a populated Track object.
 */
export async function parseLocalAudioFile(
  file: File,
  storageMode: 'reference' | 'copied' = 'reference'
): Promise<Track> {
  const format = getFormatFromFilename(file.name);
  const blobUrl = URL.createObjectURL(file);

  // Read header for ID3 tags (first 256KB)
  let tagInfo: { title?: string; artist?: string; album?: string; artworkUrl?: string } = {};
  try {
    const slice = await file.slice(0, 256 * 1024).arrayBuffer();
    tagInfo = parseId3Basic(slice);
  } catch {
    // ignore
  }

  const fallback = parseNameAndArtist(file.name);
  const title = tagInfo.title || fallback.title;
  const artist = tagInfo.artist || fallback.artist;
  const album = tagInfo.album || 'LOCAL ARCHIVE';

  // Determine duration and audio properties via audio element
  const audioInfo = await new Promise<{
    duration: number;
    sampleRate?: number;
    channels?: number;
  }>((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = blobUrl;

    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
    };

    const onLoaded = () => {
      const dur = audio.duration || 0;
      cleanup();
      resolve({
        duration: isFinite(dur) ? dur : 0,
        sampleRate: 44100, // standard baseline
        channels: 2,
      });
    };

    const onError = () => {
      cleanup();
      resolve({ duration: 0 });
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('error', onError);

    // Timeout safety
    setTimeout(() => {
      cleanup();
      resolve({ duration: 0 });
    }, 4000);
  });

  const duration = audioInfo.duration;
  let bitrate: string | undefined;
  if (duration > 0 && file.size > 0) {
    const kbps = Math.round((file.size * 8) / duration / 1000);
    bitrate = `${kbps} kbps`;
  }

  const track: Track = {
    id: `track_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title,
    artist,
    album,
    duration,
    format,
    sampleRate: audioInfo.sampleRate || 44100,
    bitDepth: 16,
    bitrate,
    channels: audioInfo.channels || 2,
    fileSize: file.size,
    blobUrl,
    blob: storageMode === 'copied' ? file : undefined,
    artworkUrl: tagInfo.artworkUrl,
    storageMode,
    addedAt: Date.now(),
  };

  return track;
}
