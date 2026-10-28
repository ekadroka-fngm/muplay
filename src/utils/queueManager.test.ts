import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addToQueue,
  removeFromQueue,
  moveInQueue,
  getNextIndex,
  getPrevIndex,
} from './queueManager';
import { Track } from '../types/music';

const mockTrack1: Track = {
  id: 't1',
  title: 'Track One',
  artist: 'Artist A',
  album: 'Album 1',
  duration: 180,
  format: 'MP3',
  fileSize: 4000000,
  storageMode: 'reference',
  addedAt: Date.now(),
};

const mockTrack2: Track = {
  id: 't2',
  title: 'Track Two',
  artist: 'Artist B',
  album: 'Album 2',
  duration: 200,
  format: 'FLAC',
  fileSize: 20000000,
  storageMode: 'reference',
  addedAt: Date.now(),
};

test('addToQueue appends by default and inserts with playNext', () => {
  const q0 = addToQueue([], mockTrack1);
  assert.equal(q0.length, 1);
  assert.equal(q0[0].trackId, 't1');

  // Append track 2
  const q1 = addToQueue(q0, mockTrack2);
  assert.equal(q1.length, 2);
  assert.equal(q1[1].trackId, 't2');

  // playNext at index 0
  const mockTrack3 = { ...mockTrack1, id: 't3' };
  const q2 = addToQueue(q1, mockTrack3, true, 0);
  assert.equal(q2.length, 3);
  assert.equal(q2[1].trackId, 't3');
});

test('removeFromQueue and moveInQueue mutate order correctly', () => {
  const q = [
    { id: 'item1', trackId: 't1', track: mockTrack1 },
    { id: 'item2', trackId: 't2', track: mockTrack2 },
    { id: 'item3', trackId: 't3', track: mockTrack1 },
  ];

  const removed = removeFromQueue(q, 'item2');
  assert.equal(removed.length, 2);
  assert.equal(removed.find(i => i.id === 'item2'), undefined);

  const moved = moveInQueue(q, 0, 2);
  assert.equal(moved[0].id, 'item2');
  assert.equal(moved[2].id, 'item1');
});

test('getNextIndex and getPrevIndex follow repeat and bounds', () => {
  assert.equal(getNextIndex(0, 3, 'off'), 1);
  assert.equal(getNextIndex(2, 3, 'off'), -1);
  assert.equal(getNextIndex(2, 3, 'all'), 0);
  assert.equal(getNextIndex(2, 3, 'one'), 2);

  assert.equal(getPrevIndex(2, 3, 'off'), 1);
  assert.equal(getPrevIndex(0, 3, 'off'), 0);
  assert.equal(getPrevIndex(0, 3, 'all'), 2);
});
