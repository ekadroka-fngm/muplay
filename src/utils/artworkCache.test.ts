import test from 'node:test';
import assert from 'node:assert/strict';
import { generateBrutalistArtwork, getTrackArtwork, hashString } from './artworkCache';

test('hashString returns deterministic non-negative integer', () => {
  const h1 = hashString('test_track_title');
  const h2 = hashString('test_track_title');
  assert.equal(h1, h2);
  assert.ok(h1 >= 0);
});

test('generateBrutalistArtwork produces valid data URI with SVG', () => {
  const art = generateBrutalistArtwork('Industrial Pulse', 'Sector 7', 'FLAC', 'track_123');
  assert.ok(art.startsWith('data:image/svg+xml;utf8,'));
  assert.ok(art.includes('%3Csvg'));
  assert.ok(art.includes('FLAC'));
});

test('getTrackArtwork prefers existing artworkUrl if provided', () => {
  const customUrl = 'data:image/svg+xml;utf8,<svg>custom</svg>';
  const art = getTrackArtwork({
    id: 't_custom',
    title: 'Custom Song',
    artworkUrl: customUrl,
  });
  assert.equal(art, customUrl);
});

test('getTrackArtwork generates deterministic fallback when artworkUrl is missing', () => {
  const art1 = getTrackArtwork({
    id: 't_fallback_1',
    title: 'Analog Void',
    artist: 'Synthesizer Lab',
    format: 'WAV',
  });
  const art2 = getTrackArtwork({
    id: 't_fallback_1',
    title: 'Analog Void',
    artist: 'Synthesizer Lab',
    format: 'WAV',
  });
  assert.ok(art1.startsWith('data:image/svg+xml;utf8,'));
  assert.equal(art1, art2);
});
