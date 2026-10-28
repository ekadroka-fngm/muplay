import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration, formatBytes, formatFrequency } from './formatters';

test('formatDuration formats seconds correctly', () => {
  assert.equal(formatDuration(0), '00:00');
  assert.equal(formatDuration(65), '01:05');
  assert.equal(formatDuration(3665), '01:01:05');
  assert.equal(formatDuration(-10), '00:00');
});

test('formatBytes formats bytes accurately', () => {
  assert.equal(formatBytes(500), '500 B');
  assert.equal(formatBytes(1024), '1.0 KB');
  assert.equal(formatBytes(5 * 1024 * 1024), '5.0 MB');
});

test('formatFrequency formats Hz and kHz properly', () => {
  assert.equal(formatFrequency(31), '31 Hz');
  assert.equal(formatFrequency(250), '250 Hz');
  assert.equal(formatFrequency(1000), '1 kHz');
  assert.equal(formatFrequency(16000), '16 kHz');
});
