import test from 'node:test';
import assert from 'node:assert/strict';
import { getFormatFromFilename, parseNameAndArtist } from './audioMetadata';

test('getFormatFromFilename handles various extensions', () => {
  assert.equal(getFormatFromFilename('song.mp3'), 'MP3');
  assert.equal(getFormatFromFilename('audio.FLAC'), 'FLAC');
  assert.equal(getFormatFromFilename('track.wav'), 'WAV');
  assert.equal(getFormatFromFilename('recording.m4a'), 'M4A');
  assert.equal(getFormatFromFilename('test.ogg'), 'OGG');
});

test('parseNameAndArtist splits artist and title correctly', () => {
  const result1 = parseNameAndArtist('Aphex Twin - Selected Ambient.mp3');
  assert.equal(result1.artist, 'Aphex Twin');
  assert.equal(result1.title, 'Selected Ambient');

  const result2 = parseNameAndArtist('Industrial_Complex_09.wav');
  assert.equal(result2.artist, 'UNKNOWN ARTIST');
  assert.equal(result2.title, 'Industrial_Complex_09');
});
