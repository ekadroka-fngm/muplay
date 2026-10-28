import { EqualizerBand } from '../types/music';

export const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQ_BAND_LABELS = [
  '31 Hz',
  '62 Hz',
  '125 Hz',
  '250 Hz',
  '500 Hz',
  '1 kHz',
  '2 kHz',
  '4 kHz',
  '8 kHz',
  '16 kHz',
];

export const DEFAULT_EQ_BANDS: EqualizerBand[] = EQ_FREQUENCIES.map((freq, i) => ({
  frequency: freq,
  label: EQ_BAND_LABELS[i],
  gain: 0,
}));

export interface EqPreset {
  name: string;
  gains: number[]; // 10 gain values (-12 to +12 dB)
}

export const EQ_PRESETS: EqPreset[] = [
  {
    name: 'Flat',
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    name: 'Industrial / Heavy',
    gains: [6, 5, 3, 1, -1, 1, 3, 5, 6, 7],
  },
  {
    name: 'Bass Boost',
    gains: [8, 7, 5.5, 3.5, 1.5, 0, 0, 0, 0, 0],
  },
  {
    name: 'Rock',
    gains: [4.5, 3.5, 1.5, 0, -1, 1.5, 3, 4, 4.5, 5],
  },
  {
    name: 'Electronic',
    gains: [5.5, 5, 2, 0, -2, 2, 1, 3.5, 5, 5.5],
  },
  {
    name: 'Metal',
    gains: [6, 4.5, -1, -3, -1, 2, 4.5, 5.5, 6.5, 6.5],
  },
  {
    name: 'Vocal Clarity',
    gains: [-2, -1, 0, 2.5, 4.5, 5, 3.5, 1, 0, -1],
  },
  {
    name: 'Classical',
    gains: [4, 3.5, 2.5, 2, -1, -1, 0, 2.5, 3.5, 4],
  },
  {
    name: 'Acoustic',
    gains: [3, 2, 1, 1.5, 2, 2, 2.5, 3, 3.5, 4],
  },
];
