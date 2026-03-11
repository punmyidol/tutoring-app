// IndexedDB helpers for persisting user-uploaded videos across page refreshes.
// Stores the raw video Blob so a fresh blob URL can be created on every load.

const DB_NAME = "eduScroll";
const DB_VERSION = 1;
const STORE = "userVideos";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess  = (e) => resolve(e.target.result);
    req.onerror    = (e) => reject(e.target.error);
  });
}

/** Persist a video. `metadata` is everything except localSrc. */
export async function saveVideo(id, blob, metadata) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ id, blob, metadata });
    tx.oncomplete = resolve;
    tx.onerror    = (e) => reject(e.target.error);
  });
}

/** Load all videos, recreating fresh blob URLs for each. */
export async function loadAllVideos() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = (e) =>
      resolve(
        e.target.result.map(({ blob, metadata }) => ({
          ...metadata,
          localSrc: URL.createObjectURL(blob),
        }))
      );
    req.onerror = (e) => reject(e.target.error);
  });
}

/** Remove a single video. */
export async function deleteVideo(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = resolve;
    tx.onerror    = (e) => reject(e.target.error);
  });
}
