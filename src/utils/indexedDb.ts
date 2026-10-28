import { AppSettings, Playlist, Track, LyricData } from '../types/music';

const DB_NAME = 'muplay_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('tracks')) {
        db.createObjectStore('tracks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('playlists')) {
        db.createObjectStore('playlists', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('lyrics')) {
        db.createObjectStore('lyrics', { keyPath: 'trackId' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

export async function dbGetAllTracks(): Promise<Track[]> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction('tracks', 'readonly');
      const store = tx.objectStore('tracks');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    console.error('Failed to get tracks from DB', err);
    return [];
  }
}

export async function dbSaveTrack(track: Track): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction('tracks', 'readwrite');
    const store = tx.objectStore('tracks');
    store.put(track);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save track to DB', err);
  }
}

export async function dbDeleteTrack(id: string): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction('tracks', 'readwrite');
    tx.objectStore('tracks').delete(id);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.error('Failed to delete track', err);
  }
}

export async function dbGetAllPlaylists(): Promise<Playlist[]> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction('playlists', 'readonly');
      const store = tx.objectStore('playlists');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    console.error('Failed to get playlists', err);
    return [];
  }
}

export async function dbSavePlaylist(playlist: Playlist): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction('playlists', 'readwrite');
    tx.objectStore('playlists').put(playlist);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.error('Failed to save playlist', err);
  }
}

export async function dbDeletePlaylist(id: string): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction('playlists', 'readwrite');
    tx.objectStore('playlists').delete(id);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.error('Failed to delete playlist', err);
  }
}

export async function dbSaveLyrics(trackId: string, lyrics: LyricData): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction('lyrics', 'readwrite');
    tx.objectStore('lyrics').put({ trackId, lyrics });
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.error('Failed to save lyrics', err);
  }
}

export async function dbGetLyrics(trackId: string): Promise<LyricData | null> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction('lyrics', 'readonly');
      const req = tx.objectStore('lyrics').get(trackId);
      req.onsuccess = () => resolve(req.result ? req.result.lyrics : null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error('Failed to get lyrics', err);
    return null;
  }
}

export async function dbGetSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction('settings', 'readonly');
      const req = tx.objectStore('settings').get(key);
      req.onsuccess = () => resolve(req.result !== undefined ? req.result.value : defaultValue);
      req.onerror = () => resolve(defaultValue);
    });
  } catch {
    return defaultValue;
  }
}

export async function dbSetSetting<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction('settings', 'readwrite');
    tx.objectStore('settings').put({ key, value });
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.error('Failed to set setting', err);
  }
}

export async function dbGetStorageEstimate(): Promise<{ usedBytes: number; quotaBytes: number }> {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        usedBytes: estimate.usage || 0,
        quotaBytes: estimate.quota || 0,
      };
    } catch {
      // fallback
    }
  }
  return { usedBytes: 0, quotaBytes: 0 };
}

export async function dbClearAll(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(['tracks', 'playlists', 'lyrics', 'settings'], 'readwrite');
  tx.objectStore('tracks').clear();
  tx.objectStore('playlists').clear();
  tx.objectStore('lyrics').clear();
  tx.objectStore('settings').clear();
  return new Promise((resolve) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}
