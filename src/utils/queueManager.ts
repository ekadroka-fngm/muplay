import { QueueItem, RepeatMode, Track } from '../types/music';

/**
 * Generates random unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

/**
 * Adds track to queue. If playNext is true, inserts directly after current index.
 */
export function addToQueue(
  queue: QueueItem[],
  track: Track,
  playNext: boolean = false,
  currentIndex: number = 0
): QueueItem[] {
  const newItem: QueueItem = {
    id: `q_${generateId()}`,
    trackId: track.id,
    track,
  };

  if (playNext && queue.length > 0 && currentIndex >= 0) {
    const nextQueue = [...queue];
    nextQueue.splice(currentIndex + 1, 0, newItem);
    return nextQueue;
  }

  return [...queue, newItem];
}

/**
 * Removes item from queue by queue item ID
 */
export function removeFromQueue(queue: QueueItem[], queueItemId: string): QueueItem[] {
  return queue.filter(item => item.id !== queueItemId);
}

/**
 * Reorders item in queue
 */
export function moveInQueue(queue: QueueItem[], fromIndex: number, toIndex: number): QueueItem[] {
  if (fromIndex < 0 || fromIndex >= queue.length || toIndex < 0 || toIndex >= queue.length) {
    return queue;
  }
  const result = [...queue];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Computes next queue index
 */
export function getNextIndex(
  currentIndex: number,
  totalItems: number,
  repeatMode: RepeatMode,
  isShuffle: boolean = false
): number {
  if (totalItems <= 0) return -1;
  if (repeatMode === 'one') return currentIndex;

  if (isShuffle && totalItems > 1) {
    // Pick random index different from current
    let next = Math.floor(Math.random() * totalItems);
    if (next === currentIndex) {
      next = (currentIndex + 1) % totalItems;
    }
    return next;
  }

  if (currentIndex + 1 < totalItems) {
    return currentIndex + 1;
  }

  if (repeatMode === 'all') {
    return 0;
  }

  return -1; // Reached end of queue
}

/**
 * Computes previous queue index
 */
export function getPrevIndex(
  currentIndex: number,
  totalItems: number,
  repeatMode: RepeatMode
): number {
  if (totalItems <= 0) return -1;
  if (repeatMode === 'one') return currentIndex;

  if (currentIndex > 0) {
    return currentIndex - 1;
  }

  if (repeatMode === 'all') {
    return totalItems - 1;
  }

  return 0;
}
