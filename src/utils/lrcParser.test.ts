import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLyrics, getActiveLyricIndex } from './lrcParser';

test('parseLyrics correctly parses standard LRC format', () => {
  const lrc = `[ti:Industrial Beat]
[ar:Brutalist Sound]
[00:04.50]Echoes in the steel corridor
[00:09.80]Heavy drums begin to shake
[00:15.20]Distortion across the grid`;

  const parsed = parseLyrics(lrc, 'sample.lrc');
  assert.equal(parsed.type, 'lrc');
  assert.equal(parsed.lines.length, 3);
  assert.equal(parsed.lines[0].text, 'Echoes in the steel corridor');
  assert.equal(Math.round(parsed.lines[0].time * 100) / 100, 4.5);
  assert.equal(parsed.lines[1].text, 'Heavy drums begin to shake');
  assert.equal(Math.round(parsed.lines[1].time * 100) / 100, 9.8);
});

test('parseLyrics parses plain TXT format without timestamp error', () => {
  const txt = `Line 1 text
Line 2 text
Line 3 text`;

  const parsed = parseLyrics(txt, 'lyrics.txt');
  assert.equal(parsed.type, 'txt');
  assert.equal(parsed.lines.length, 3);
  assert.equal(parsed.lines[0].text, 'Line 1 text');
});

test('getActiveLyricIndex handles offset correctly', () => {
  const lines = [
    { time: 5.0, text: 'First' },
    { time: 10.0, text: 'Second' },
    { time: 15.0, text: 'Third' },
  ];

  // At 7s, line 0 should be active
  assert.equal(getActiveLyricIndex(lines, 7.0, 0), 0);

  // At 10.5s, line 1 should be active
  assert.equal(getActiveLyricIndex(lines, 10.5, 0), 1);

  // At 9.2s with +1000ms offset (effective 10.2s), line 1 should be active
  assert.equal(getActiveLyricIndex(lines, 9.2, 1000), 1);

  // At 10.5s with -1000ms offset (effective 9.5s), line 0 should be active
  assert.equal(getActiveLyricIndex(lines, 10.5, -1000), 0);
});
