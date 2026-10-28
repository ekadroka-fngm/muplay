import { Track, LyricData } from '../types/music';
import { parseLyrics } from './lrcParser';

/**
 * Creates a valid PCM 16-bit Stereo WAV Blob from synthesized audio data.
 */
function createWavBlob(
  durationSec: number,
  synthFn: (t: number, sampleRate: number) => [number, number]
): Blob {
  const sampleRate = 44100;
  const numChannels = 2;
  const numSamples = Math.floor(sampleRate * durationSec);
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // subchunk1 size (16 for PCM)
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // 16 bits per sample

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const [left, right] = synthFn(t, sampleRate);

    // Clamp between -1 and 1 and convert to 16-bit integer
    const clampLeft = Math.max(-1, Math.min(1, left));
    const clampRight = Math.max(-1, Math.min(1, right));

    view.setInt16(offset, clampLeft < 0 ? clampLeft * 0x8000 : clampLeft * 0x7fff, true);
    view.setInt16(offset + 2, clampRight < 0 ? clampRight * 0x8000 : clampRight * 0x7fff, true);
    offset += 4;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Brutalist SVG artworks
export const ARTWORK_1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500"><rect width="500" height="500" fill="%2309090C"/><rect x="20" y="20" width="460" height="460" fill="none" stroke="%23454450" stroke-width="2"/><line x1="20" y1="250" x2="480" y2="250" stroke="%23454450" stroke-width="1"/><line x1="250" y1="20" x2="250" y2="480" stroke="%23454450" stroke-width="1"/><rect x="60" y="60" width="380" height="380" fill="%2313131A" stroke="%23D7FF3F" stroke-width="3"/><circle cx="250" cy="250" r="120" fill="none" stroke="%23D7FF3F" stroke-width="4" stroke-dasharray="8 8"/><circle cx="250" cy="250" r="60" fill="%23D7FF3F"/><text x="80" y="110" font-family="monospace" font-size="28" font-weight="900" fill="%23F0EFEA">VOID // 01</text><text x="80" y="410" font-family="monospace" font-size="14" font-weight="700" fill="%23D7FF3F">KINETIC OVERLOAD // 128 BPM</text><text x="350" y="410" font-family="monospace" font-size="14" fill="%23A3A1AD">WAV 44.1K</text></svg>`;

export const ARTWORK_2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500"><rect width="500" height="500" fill="%2313131A"/><rect x="30" y="30" width="440" height="440" fill="%2309090C" stroke="%239B72FF" stroke-width="4"/><polygon points="250,70 430,410 70,410" fill="none" stroke="%23F0EFEA" stroke-width="3"/><polygon points="250,150 370,380 130,380" fill="%239B72FF" opacity="0.3"/><line x1="70" y1="200" x2="430" y2="200" stroke="%23D7FF3F" stroke-width="2"/><text x="50" y="80" font-family="monospace" font-size="24" font-weight="900" fill="%239B72FF">MONOLITH 09</text><text x="50" y="450" font-family="monospace" font-size="13" font-weight="700" fill="%23F0EFEA">CONCRETE ARCHITECTURE // ST-09</text></svg>`;

export const ARTWORK_3 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500"><rect width="500" height="500" fill="%2309090C"/><rect x="15" y="15" width="470" height="470" fill="none" stroke="%23FF5A63" stroke-width="3"/><path d="M50 250 Q 150 50 250 250 T 450 250" fill="none" stroke="%23FF5A63" stroke-width="5"/><path d="M50 250 Q 150 450 250 250 T 450 250" fill="none" stroke="%23D7FF3F" stroke-width="3"/><text x="40" y="70" font-family="monospace" font-size="26" font-weight="900" fill="%23F0EFEA">KRYPT // 808</text><text x="40" y="100" font-family="monospace" font-size="14" fill="%23A3A1AD">SUB-ZERO DISTORTION</text><text x="40" y="450" font-family="monospace" font-size="13" font-weight="700" fill="%23FF5A63">10-BAND EQ CALIBRATED</text></svg>`;

export function generateSampleTracks(): Track[] {
  // Synthesize Track 1: Industrial Electronic Beat (32 seconds)
  const blob1 = createWavBlob(32, (t) => {
    const bpm = 128;
    const beat = t * (bpm / 60);
    const beatFraction = beat % 1;

    // Kick drum: pitch envelope 150Hz -> 45Hz every beat
    const kickEnv = Math.max(0, 1 - beatFraction * 4);
    const kickFreq = 45 + 110 * kickEnv;
    const kick = Math.sin(2 * Math.PI * kickFreq * beatFraction * 0.3) * kickEnv * 0.7;

    // Hi-hat on offbeats
    const offbeatFraction = (beat + 0.5) % 1;
    const hatEnv = Math.max(0, 1 - offbeatFraction * 8);
    const hat = (Math.random() * 2 - 1) * hatEnv * 0.15;

    // Bass note: changing every 4 beats
    const note = Math.floor(beat / 4) % 4;
    const rootFreq = [55, 65.4, 49, 58.2][note]; // A1, C2, G1, Bb1
    const bass = (Math.sin(2 * Math.PI * rootFreq * t) + 0.4 * Math.sin(2 * Math.PI * rootFreq * 2 * t)) * 0.35;

    // Arpeggiated lead synth
    const arpNote = Math.floor(beat * 4) % 8;
    const arpFreq = rootFreq * 4 * Math.pow(1.05946, [0, 3, 7, 10, 12, 10, 7, 3][arpNote]);
    const leadEnv = Math.max(0, 1 - (beat * 4 % 1) * 2);
    const lead = Math.sin(2 * Math.PI * arpFreq * t) * leadEnv * 0.18;

    const left = kick + bass + lead * 0.7 + hat * 0.8;
    const right = kick + bass + lead * 0.9 + hat * 0.6;
    return [left * 0.8, right * 0.8];
  });

  // Track 1 LRC Lyrics
  const lrc1 = parseLyrics(`[ti:KINETIC OVERLOAD]
[ar:VOID // SECTOR]
[al:GRID PROTOCOL]
[00:00.00]// SYSTEM INITIALIZED //
[00:03.20]VOID PROTOCOL RUNNING OFFLINE
[00:06.50]EXTREME CONTRAST IN THE HARD GRID
[00:10.00]NO NEUMORPHISM · NO ROUNDED CORNERS
[00:13.50]HIGH VOLTAGE INDUSTRIAL PULSE
[00:17.00]TEMPO LOCKED AT 128 BPM
[00:20.50]MONOLITHIC FREQUENCIES ENGAGED
[00:24.00]10-BAND REALTIME EQUALIZER READY
[00:27.50]LOCAL SOUND REPOSITORY VERIFIED
[00:30.00]// TRANSMISSION COMPLETE //`);

  // Track 2: Concrete Monolith (30 seconds)
  const blob2 = createWavBlob(30, (t) => {
    const bpm = 110;
    const beat = t * (bpm / 60);
    const beatFraction = beat % 1;

    // Deep sub bass pulse (40Hz to 60Hz)
    const sub = Math.sin(2 * Math.PI * 46 * t) * 0.45;
    // Snare / metal clap on beats 2 & 4
    const clapBeat = (beat + 1) % 2;
    const clapEnv = Math.max(0, 1 - clapBeat * 4);
    const clap = (Math.random() * 2 - 1) * clapEnv * 0.25;

    // Resonant synth chord
    const chord = (Math.sin(2 * Math.PI * 184 * t) + Math.sin(2 * Math.PI * 220 * t)) * 0.15;

    return [(sub + clap * 0.8 + chord) * 0.75, (sub + clap * 0.7 + chord * 1.1) * 0.75];
  });

  const lrc2 = parseLyrics(`[ti:CONCRETE MONOLITH]
[ar:MONOLITH 09]
[al:STRUCTURAL RAW]
[00:00.00][SECTOR 09] STRUCTURAL INTEGRITY
[00:04.00]ARCHIVO BLACK TYPOGRAPHY
[00:08.00]RAW CONCRETE AND SOLID STEEL
[00:12.00]OFFLINE-FIRST ARCHITECTURE
[00:16.00]PRIVACY BY DEFAULT
[00:20.00]ZERO TELEMETRY DETECTED
[00:24.00]RESONANT FREQUENCY HARMONICS
[00:28.00]STATIC STEP SEEKING ACTIVE`);

  // Track 3: Sub-Zero Distortion (28 seconds)
  const blob3 = createWavBlob(28, (t) => {
    const bpm = 140;
    const beat = t * (bpm / 60);

    // 808 glide sub
    const glide = 38 + 15 * Math.sin(t * 0.5);
    const sub808 = Math.sin(2 * Math.PI * glide * t) * 0.5;

    // Fast 16th note hi-hat
    const hatTick = (beat * 4) % 1;
    const hat = (Math.random() * 2 - 1) * Math.max(0, 1 - hatTick * 4) * 0.12;

    return [(sub808 + hat) * 0.75, (sub808 + hat * 0.85) * 0.75];
  });

  const lrc3 = parseLyrics(`[ti:SUB-ZERO DISTORTION]
[ar:KRYPT 808]
[al:CYBERPULSE]
[00:00.00][AUDIO ENGINE ONLINE]
[00:03.50]44.1 KHZ · 16 BIT STEREO
[00:07.00]1411 KBPS LOSSLESS STREAM
[00:10.50]STEPPING +10S / -10S
[00:14.00]ZERO CAROUSELS · ZERO SLIDERS
[00:18.00]DIRECT FREQUENCY NODE CONTROL
[00:22.00]LOWSHELF BOOST AT 31 HZ
[00:25.50]HIGHSHELF FILTER AT 16 KHZ`);

  const track1: Track = {
    id: 'demo_track_1',
    title: 'KINETIC OVERLOAD',
    artist: 'VOID // SECTOR',
    album: 'GRID PROTOCOL',
    duration: 32,
    format: 'WAV',
    sampleRate: 44100,
    bitDepth: 16,
    bitrate: '1411 kbps',
    channels: 2,
    fileSize: blob1.size,
    blobUrl: URL.createObjectURL(blob1),
    blob: blob1,
    lyrics: lrc1,
    artworkUrl: ARTWORK_1,
    storageMode: 'copied',
    addedAt: Date.now() - 3000,
  };

  const track2: Track = {
    id: 'demo_track_2',
    title: 'CONCRETE MONOLITH',
    artist: 'MONOLITH 09',
    album: 'STRUCTURAL RAW',
    duration: 30,
    format: 'WAV',
    sampleRate: 44100,
    bitDepth: 16,
    bitrate: '1411 kbps',
    channels: 2,
    fileSize: blob2.size,
    blobUrl: URL.createObjectURL(blob2),
    blob: blob2,
    lyrics: lrc2,
    artworkUrl: ARTWORK_2,
    storageMode: 'copied',
    addedAt: Date.now() - 2000,
  };

  const track3: Track = {
    id: 'demo_track_3',
    title: 'SUB-ZERO DISTORTION',
    artist: 'KRYPT 808',
    album: 'CYBERPULSE',
    duration: 28,
    format: 'WAV',
    sampleRate: 44100,
    bitDepth: 16,
    bitrate: '1411 kbps',
    channels: 2,
    fileSize: blob3.size,
    blobUrl: URL.createObjectURL(blob3),
    blob: blob3,
    lyrics: lrc3,
    artworkUrl: ARTWORK_3,
    storageMode: 'copied',
    addedAt: Date.now() - 1000,
  };

  return [track1, track2, track3];
}
