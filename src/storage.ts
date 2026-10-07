import { normalize } from './model';
import { SEED } from './seed';
import type { AppState } from './types';

const LS_KEY = 'erm-cockpit';

/* ---------- localStorage ---------- */
export function loadLocal(): AppState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? normalize(JSON.parse(raw), SEED) : null;
  } catch { return null; }
}
export function saveLocal(s: AppState): boolean {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); return true; }
  catch { return false; }
}

/* ---------- експорт / імпорт файлом ---------- */
export function exportJSON(s: AppState) {
  const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'erm-cockpit-data.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- File System Access API ---------- */
export const fsSupported = typeof window !== 'undefined' && 'showOpenFilePicker' in window;

const PICKER_TYPES = [{ description: 'ERM data', accept: { 'application/json': ['.json'] as string[] } }];

/* сховище хендла між сесіями (IndexedDB) */
function idb(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const rq = indexedDB.open('erm-fs', 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore('kv');
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
}
async function idbSet(key: string, val: unknown): Promise<void> {
  const db = await idb();
  return new Promise((res, rej) => {
    const tx = db.transaction('kv', 'readwrite');
    tx.objectStore('kv').put(val, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function idbGet<T>(key: string): Promise<T | null> {
  const db = await idb();
  return new Promise((res, rej) => {
    const rq = db.transaction('kv', 'readonly').objectStore('kv').get(key);
    rq.onsuccess = () => res((rq.result as T) ?? null);
    rq.onerror = () => rej(rq.error);
  });
}
async function idbDel(key: string): Promise<void> {
  const db = await idb();
  return new Promise((res, rej) => {
    const tx = db.transaction('kv', 'readwrite');
    tx.objectStore('kv').delete(key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

export async function persistHandle(h: FileSystemFileHandle): Promise<void> {
  try { await idbSet('handle', h); } catch { /* не критично */ }
}
export async function restoreHandle(): Promise<FileSystemFileHandle | null> {
  try { return await idbGet<FileSystemFileHandle>('handle'); } catch { return null; }
}
export async function forgetHandle(): Promise<void> {
  try { await idbDel('handle'); } catch { /* ок */ }
}

export async function ensurePermission(h: FileSystemFileHandle): Promise<boolean> {
  try {
    if ((await h.queryPermission({ mode: 'readwrite' })) === 'granted') return true;
    return (await h.requestPermission({ mode: 'readwrite' })) === 'granted';
  } catch { return false; }
}

/** Відкрити наявний файл даних (повертає handle + розпарсений стан). */
export async function openDataFile(): Promise<{ handle: FileSystemFileHandle; state: AppState } | null> {
  const [handle] = await window.showOpenFilePicker({ types: PICKER_TYPES, multiple: false });
  if (!handle) return null;
  if (!(await ensurePermission(handle))) return null;
  const file = await handle.getFile();
  const text = await file.text();
  const state = normalize(text.trim() ? JSON.parse(text) : SEED, SEED);
  await persistHandle(handle);
  return { handle, state };
}

/** Створити новий файл даних і записати туди поточний стан. */
export async function createDataFile(s: AppState): Promise<FileSystemFileHandle | null> {
  const handle = await window.showSaveFilePicker({
    suggestedName: 'erm-cockpit-data.json',
    types: PICKER_TYPES,
  });
  if (!(await ensurePermission(handle))) return null;
  await writeDataFile(handle, s);
  await persistHandle(handle);
  return handle;
}

export async function writeDataFile(h: FileSystemFileHandle, s: AppState): Promise<void> {
  const w = await h.createWritable();
  await w.write(JSON.stringify(s, null, 2));
  await w.close();
}

export async function readDataFile(h: FileSystemFileHandle): Promise<AppState> {
  const file = await h.getFile();
  const text = await file.text();
  return normalize(text.trim() ? JSON.parse(text) : SEED, SEED);
}
