const DB_NAME = 'discuss_cache';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('posts')) {
        db.createObjectStore('posts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('comments')) {
        db.createObjectStore('comments', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function cachePosts(posts) {
  try {
    const db = await openDB();
    const tx = db.transaction('posts', 'readwrite');
    const store = tx.objectStore('posts');
    store.clear();
    posts.forEach((p) => store.put(p));
    return new Promise((resolve) => { tx.oncomplete = resolve; });
  } catch (e) { console.warn('IndexedDB cache failed:', e); }
}

export async function getCachedPosts() {
  try {
    const db = await openDB();
    const tx = db.transaction('posts', 'readonly');
    const store = tx.objectStore('posts');
    const request = store.getAll();
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (e) { return []; }
}

export async function cacheComments(postId, comments) {
  try {
    const db = await openDB();
    const tx = db.transaction('comments', 'readwrite');
    const store = tx.objectStore('comments');
    comments.forEach((c) => store.put({ ...c, id: c.id || `${postId}_${c.timestamp}` }));
    return new Promise((resolve) => { tx.oncomplete = resolve; });
  } catch (e) { console.warn('IndexedDB cache failed:', e); }
}
