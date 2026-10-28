/* EPC PLAN – αποθήκευση έργων στο κινητό (IndexedDB) */
(function () {
  const DB = 'epcplan', STORE = 'projects';
  let dbp = null;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => { r.result.createObjectStore(STORE, { keyPath: 'id' }); };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  function tx(mode, fn) {
    return open().then(db => new Promise((res, rej) => {
      const t = db.transaction(STORE, mode);
      const st = t.objectStore(STORE);
      const out = fn(st);
      t.oncomplete = () => res(out && out.result !== undefined ? out.result : out);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error);
    }));
  }
  const api = {
    all: () => tx('readonly', st => st.getAll()),
    get: (id) => tx('readonly', st => st.get(id)),
    put: (p) => tx('readwrite', st => { st.put(p); return null; }),
    del: (id) => tx('readwrite', st => { st.delete(id); return null; }),
  };
  // ζήτα μόνιμη αποθήκευση ώστε ο browser να μη σβήνει τα δεδομένα
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { }
  window.EPC_DB = api;
})();
