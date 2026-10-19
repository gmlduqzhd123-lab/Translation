/**
 * Browser-Local Auto-Save & Session Recovery Service (IndexedDB)
 * - Stores the active document ArrayBuffer and translation review state strictly inside the user's browser
 * - Zero external server calls
 */

const DB_NAME = 'MultilingualLessonTranslatorDB';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';
const ACTIVE_SESSION_KEY = 'current_work_session';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IndexedDB open failed'));
  });
}

export async function saveWorkSessionToBrowser(sessionData) {
  try {
    const db = await openDatabase();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const payload = {
        ...sessionData,
        savedAt: Date.now()
      };
      store.put(payload, ACTIVE_SESSION_KEY);
      tx.oncomplete = () => {
        db.close();
        resolve(payload.savedAt);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    return null;
  }
}

export async function loadWorkSessionFromBrowser() {
  try {
    const db = await openDatabase();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(ACTIVE_SESSION_KEY);
      getReq.onsuccess = () => {
        db.close();
        resolve(getReq.result || null);
      };
      getReq.onerror = () => {
        db.close();
        reject(getReq.error);
      };
    });
  } catch {
    return null;
  }
}

export async function clearWorkSessionFromBrowser() {
  try {
    const db = await openDatabase();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(ACTIVE_SESSION_KEY);
      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => {
        db.close();
        resolve(false);
      };
    });
  } catch {
    return false;
  }
}
