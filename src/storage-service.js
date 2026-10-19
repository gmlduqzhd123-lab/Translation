/**
 * Browser-Local Auto-Save & Session Recovery Service (IndexedDB)
 * - Stores the active document ArrayBuffer and translation review state strictly inside the user's browser
 * - Zero external server calls
 */

const DB_NAME = 'MultilingualLessonTranslatorDB';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';
const ACTIVE_SESSION_KEY = 'current_work_session';
const AUTO_SAVE_PREF_KEY = 'multilingual_translator_autosave_enabled_v1';

let lastStorageError = null;

export function getLastStorageError() {
  return lastStorageError;
}

export function isAutoSaveEnabled() {
  try {
    const val = localStorage.getItem(AUTO_SAVE_PREF_KEY);
    if (val === null) return true;
    return val !== 'false';
  } catch {
    return true;
  }
}

export function setAutoSaveEnabled(enabled) {
  const next = Boolean(enabled);
  try {
    localStorage.setItem(AUTO_SAVE_PREF_KEY, next ? 'true' : 'false');
  } catch {
    // ignore storage errors
  }
  return next;
}

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
  if (!isAutoSaveEnabled()) {
    lastStorageError = null;
    return null;
  }
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
        lastStorageError = null;
        db.close();
        resolve(payload.savedAt);
      };
      tx.onerror = () => {
        const err = tx.error;
        db.close();
        reject(err);
      };
    });
  } catch (err) {
    const isQuota =
      err?.name === 'QuotaExceededError' ||
      err?.code === 22 ||
      /quota/i.test(String(err?.message || ''));
    lastStorageError = {
      type: isQuota ? 'quota' : 'unavailable',
      message: isQuota
        ? '브라우저 저장 공간(IndexedDB)이 부족하여 임시 저장을 완료하지 못했습니다. 불필요한 브라우저 데이터를 비우거나 임시 저장을 끄고 작업 후 바로 다운로드해 주세요.'
        : '현재 브라우저 환경(시크릿 모드 또는 저장소 제한)에서 임시 저장을 사용할 수 없습니다. 작업 완료 후 바로 결과 파일을 다운로드해 주세요.'
    };
    return null;
  }
}

export async function loadWorkSessionFromBrowser() {
  if (!isAutoSaveEnabled()) {
    return null;
  }
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
  lastStorageError = null;
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
