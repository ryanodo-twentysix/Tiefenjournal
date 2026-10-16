/**
 * Speicher: IndexedDB, ausschließlich in diesem Browser auf diesem Gerät.
 *
 * Bewusste Entscheidung gegen die serverseitige `db`-Fähigkeit des Artefakts:
 * Journaleinträge sind das Persönlichste, was diese App anfasst, und sollen
 * dieses Gerät nicht verlassen. Der Preis dafür steht offen in den
 * Einstellungen — löscht man die Seitendaten, sind die Einträge weg.
 *
 * Deliberately NOT the artifact's server-side `db` capability: journal entries
 * are the most personal thing this app touches and should not leave the device.
 * The cost is stated plainly in Settings — clearing site data clears the journal.
 */

const DB_NAME = 'tiefenjournal';
const DB_VERSION = 4;
const S = {
  entries: 'entries', audio: 'audio', dialogues: 'dialogues',
  config: 'config', structures: 'structures', goals: 'goals', media: 'media'
};

/* ══════════════════════════════════════════════════════════
 * Verbindung
 * ══════════════════════════════════════════════════════════
 *
 * Zwei Dinge, die hier schon schiefgegangen sind und nicht wieder
 * schiefgehen dürfen:
 *
 *   „Blockiert" heißt nicht „kaputt". Wenn eine neue Fassung die Datenbank
 *   hochzieht, während ein anderer Tab noch die alte offen hält, meldet der
 *   Browser `blocked`. Das Öffnen kann danach trotzdem gelingen — sobald die
 *   andere Verbindung geht. Deshalb wird hier gewartet statt abgebrochen, und
 *   jede offene Verbindung räumt bei `versionchange` von selbst das Feld.
 *
 *   Ein Fehlschlag darf sich nicht einbrennen. Früher blieb die abgelehnte
 *   Zusage stehen, und damit war die App bis zum Neuladen tot. Jetzt wird
 *   zurückgesetzt, sodass ein erneuter Versuch möglich ist.
 *
 * Und wenn gar nichts geht, läuft die App im Arbeitsspeicher weiter, statt
 * mit einer Fehlermeldung stehenzubleiben. Ein Journal, das sich nicht öffnen
 * lässt, ist schlimmer als eines, das für diese Sitzung nichts behält — sofern
 * offen dabeisteht, dass nichts behalten wird.
 */

let dbPromise = null;
let memory = null;
let lastFailure = null;

const BLOCKED_GRACE_MS = 3500;

function createStores(db) {
  if (!db.objectStoreNames.contains(S.entries)) {
    const s = db.createObjectStore(S.entries, { keyPath: 'id' });
    s.createIndex('date', 'date');
  }
  if (!db.objectStoreNames.contains(S.audio)) db.createObjectStore(S.audio, { keyPath: 'id' });
  if (!db.objectStoreNames.contains(S.dialogues)) db.createObjectStore(S.dialogues, { keyPath: 'id' });
  if (!db.objectStoreNames.contains(S.config)) db.createObjectStore(S.config, { keyPath: 'key' });
  if (!db.objectStoreNames.contains(S.structures)) db.createObjectStore(S.structures, { keyPath: 'id' });
  if (!db.objectStoreNames.contains(S.goals)) db.createObjectStore(S.goals, { keyPath: 'id' });
  if (!db.objectStoreNames.contains(S.media)) db.createObjectStore(S.media, { keyPath: 'id' });
}

/**
 * Eigener Fehler mit Ursachencode.
 *
 * Wichtig: NICHT den Originalfehler verändern. Ein DOMException hat `code` nur
 * lesend — `Object.assign` darauf wirft eine TypeError und verschluckt damit
 * den eigentlichen Fehler. Genau daran ist der Start schon einmal gescheitert.
 */
function storageError(code, cause) {
  const err = new Error(`storage: ${code}`);
  err.code = code;
  err.cause = cause || null;
  return err;
}

/** Warum ließ sich nicht öffnen? */
function reasonFor(error) {
  const name = error?.name || '';
  if (name === 'VersionError') return 'newer';        // andernorts läuft eine neuere Fassung
  if (name === 'QuotaExceededError') return 'full';
  if (name === 'SecurityError' || name === 'InvalidStateError') return 'unavailable';
  return 'error';
}

function open() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    let req;
    try { req = indexedDB.open(DB_NAME, DB_VERSION); }
    catch (e) { reject(storageError('unavailable', e)); return; }

    let blockedTimer = null;
    let settled = false;
    const done = fn => (...args) => { if (!settled) { settled = true; clearTimeout(blockedTimer); fn(...args); } };
    const ok = done(resolve);
    const bad = done(reject);

    req.onupgradeneeded = () => createStores(req.result);

    req.onsuccess = () => {
      const db = req.result;
      // Macht Platz, sobald eine neuere Fassung hochziehen will — sonst
      // blockiert dieser Tab den nächsten auf Dauer.
      db.onversionchange = () => { try { db.close(); } catch { /* egal */ } dbPromise = null; };
      db.onclose = () => { dbPromise = null; };
      ok(db);
    };

    req.onerror = () => bad(storageError(reasonFor(req.error), req.error));

    req.onblocked = () => {
      // Nicht ablehnen: onsuccess kann noch kommen, wenn der andere Tab geht.
      clearTimeout(blockedTimer);
      blockedTimer = setTimeout(() => bad(storageError('blocked')), BLOCKED_GRACE_MS);
    };
  });

  // Einen Fehlschlag nicht festschreiben, damit ein neuer Versuch greifen kann.
  dbPromise.catch(err => {
    lastFailure = err?.code || 'error';
    dbPromise = null;
  });

  return dbPromise;
}

/* ── Ablage: echte Datenbank oder Arbeitsspeicher ── */

function memoryStores() {
  if (!memory) {
    memory = {};
    for (const name of Object.values(S)) memory[name] = new Map();
  }
  return memory;
}

const keyOf = (name, value) => (name === S.config ? value.key : value.id);

/** Einheitlicher Zugriff, egal woher die Daten kommen. */
async function shelf(name) {
  if (!memory) {
    try {
      const db = await open();
      return {
        get: key => idb(db, name, 'readonly', s => s.get(key)),
        put: value => idb(db, name, 'readwrite', s => s.put(value)).then(() => value),
        del: key => idb(db, name, 'readwrite', s => s.delete(key)).then(() => true),
        delete: key => idb(db, name, 'readwrite', s => s.delete(key)).then(() => true),
        getAll: () => idb(db, name, 'readonly', s => s.getAll()).then(r => r || []),
        clear: () => idb(db, name, 'readwrite', s => s.clear()).then(() => true)
      };
    } catch {
      memoryStores();   // ab hier für diese Sitzung im Speicher weiter
    }
  }

  const map = memoryStores()[name];
  return {
    get: async key => map.get(key),
    put: async value => { map.set(keyOf(name, value), value); return value; },
    del: async key => { map.delete(key); return true; },
    delete: async key => { map.delete(key); return true; },
    getAll: async () => [...map.values()],
    clear: async () => { map.clear(); return true; }
  };
}

function idb(db, name, mode, fn) {
  return new Promise((resolve, reject) => {
    let t;
    try { t = db.transaction(name, mode); }
    catch (e) { reject(e); return; }
    let req;
    try { req = fn(t.objectStore(name)); } catch (e) { reject(e); return; }
    t.oncomplete = () => resolve(req && 'result' in req ? req.result : undefined);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

const tx = async (name, _mode, fn) => {
  // Rückwärtskompatible Hülle: die alten Aufrufe erwarten einen IDB-Store.
  const s = await shelf(name);
  return fn(s);
};

const all = async name => (await shelf(name)).getAll();

/**
 * Versucht zu öffnen und sagt, was dabei herauskam.
 * @returns {Promise<{ok: boolean, mode: 'idb'|'memory', reason: string|null}>}
 */
export async function initStorage() {
  if (memory) return { ok: false, mode: 'memory', reason: lastFailure || 'unavailable' };
  try {
    await open();
    return { ok: true, mode: 'idb', reason: null };
  } catch (err) {
    memoryStores();
    return { ok: false, mode: 'memory', reason: err?.code || 'error' };
  }
}

/** Noch einmal versuchen — etwa, nachdem andere Tabs geschlossen wurden. */
export async function retryStorage() {
  memory = null;
  dbPromise = null;
  lastFailure = null;
  return initStorage();
}

export const isMemoryOnly = () => Boolean(memory);

/** Ist überhaupt ein Speicher verfügbar? (Privates Fenster, blockierte Daten.) */
export async function isAvailable() {
  const r = await initStorage();
  return r.ok;
}

export async function requestPersistence() {
  if (!navigator.storage?.persist) return { supported: false, persisted: false };
  try {
    if (await navigator.storage.persisted?.()) return { supported: true, persisted: true };
    return { supported: true, persisted: await navigator.storage.persist() };
  } catch { return { supported: false, persisted: false }; }
}

export async function storageEstimate() {
  try {
    if (!navigator.storage?.estimate) return null;
    const { usage, quota } = await navigator.storage.estimate();
    return { usage, quota };
  } catch { return null; }
}

export function newId(d = new Date()) {
  return d.toISOString().replace(/[:.]/g, '-');
}

/* ── Einträge ── */

export const putEntry = entry => tx(S.entries, 'readwrite', s => s.put(entry)).then(() => entry);
export const getEntry = id => tx(S.entries, 'readonly', s => s.get(id));
export const listEntries = () =>
  all(S.entries).then(list => list.sort((a, b) => a.createdAt.localeCompare(b.createdAt)));

export async function deleteEntry(id) {
  await tx(S.entries, 'readwrite', s => s.delete(id));
  await tx(S.audio, 'readwrite', s => s.delete(id));
  await tx(S.media, 'readwrite', s => s.delete(id));
  return true;
}

/* ── Zeichnungen und Stimmaufnahmen ── */

export async function putMedia(id, blob, meta = {}) {
  await tx(S.media, 'readwrite', s => s.put({
    id, blob,
    kind: meta.kind || 'drawing',
    mimeType: blob.type || 'application/octet-stream',
    bytes: blob.size,
    durationMs: meta.durationMs || null
  }));
  return { kind: meta.kind || 'drawing', bytes: blob.size, mimeType: blob.type,
           durationMs: meta.durationMs || null };
}

export const getMedia = id => tx(S.media, 'readonly', s => s.get(id));

export async function mediaUrl(id) {
  const rec = await getMedia(id);
  return rec?.blob ? URL.createObjectURL(rec.blob) : null;
}

/** Entfernt alle Beispieleinträge auf einmal. */
export async function deleteDemoEntries() {
  const demo = (await listEntries()).filter(e => e.demo);
  for (const e of demo) await deleteEntry(e.id);
  return demo.length;
}

/* ── Aufnahmen ── */

export async function putAudio(id, blob, meta = {}) {
  await tx(S.audio, 'readwrite', s => s.put({
    id, blob, mimeType: blob.type || 'audio/webm', bytes: blob.size,
    durationMs: meta.durationMs || null
  }));
  return { file: `idb:${id}`, bytes: blob.size, durationMs: meta.durationMs || null, mimeType: blob.type };
}

export const getAudio = id => tx(S.audio, 'readonly', s => s.get(id));

export async function audioUrl(id) {
  const rec = await getAudio(id);
  return rec?.blob ? URL.createObjectURL(rec.blob) : null;
}

/* ── Dialoge ── */

export const putDialogue = d => tx(S.dialogues, 'readwrite', s => s.put(d)).then(() => d);
export const getDialogue = id => tx(S.dialogues, 'readonly', s => s.get(id));
export const deleteDialogue = id => tx(S.dialogues, 'readwrite', s => s.delete(id)).then(() => true);
export const listDialogues = () =>
  all(S.dialogues).then(list => list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));

/* ── Bereiche (Struktur) ── */

export const putStructure = n => tx(S.structures, 'readwrite', s => s.put(n)).then(() => n);
export const listStructures = () =>
  all(S.structures).then(list => list.sort((a, b) => a.createdAt.localeCompare(b.createdAt)));

export async function putStructures(nodes) {
  for (const n of nodes) await putStructure(n);
  return nodes;
}

export async function deleteStructures(ids) {
  for (const id of ids) await tx(S.structures, 'readwrite', s => s.delete(id));
  return ids.length;
}

/* ── Ziele ── */

export const putGoal = g => tx(S.goals, 'readwrite', s => s.put(g)).then(() => g);
export const listGoals = () =>
  all(S.goals).then(list => list.sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
export const deleteGoal = id => tx(S.goals, 'readwrite', s => s.delete(id)).then(() => true);

/* ── Einstellungen ── */

// `langChosen` unterscheidet „noch nie gefragt" von „Deutsch gewählt".
const DEFAULTS = {
  lang: 'de', langChosen: false, feelingSlots: 3, keepAudio: true, seeded: false,
  // Sätze aus den Spannungsfeldern, die der Mensch selbst als bekannt markiert
  // hat. Nur seine Markierung — die App trägt hier nichts von sich aus ein.
  recognisedBeliefs: []
};

export async function loadConfig() {
  try {
    const rows = await all(S.config);
    return { ...DEFAULTS, ...Object.fromEntries(rows.map(r => [r.key, r.value])) };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function saveConfig(patch) {
  for (const [key, value] of Object.entries(patch)) {
    await tx(S.config, 'readwrite', s => s.put({ key, value }));
  }
  return loadConfig();
}

/* ── Export & Import ── */

const blobToDataUrl = blob => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = () => reject(r.error);
  r.readAsDataURL(blob);
});

function dataUrlToBlob(dataUrl) {
  const [head, b64] = String(dataUrl).split(',');
  const mime = /:(.*?);/.exec(head)?.[1] || 'audio/webm';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** Beispieleinträge bleiben draußen — sie sind nicht deine Geschichte. */
export async function exportAll({ withAudio = true } = {}) {
  const [entries, dialogues, config, structures, goals] = await Promise.all([
    listEntries(), listDialogues(), loadConfig(), listStructures(), listGoals()
  ]);
  const real = entries.filter(e => !e.demo);

  const out = [];
  for (const e of real) {
    const copy = { ...e };
    if (withAudio && e.audio) {
      const rec = await getAudio(e.id);
      if (rec?.blob) copy.audioData = await blobToDataUrl(rec.blob);
    }
    // Zeichnungen sind klein und gehören zum Eintrag — sie kommen immer mit.
    if (e.media) {
      const rec = await getMedia(e.id);
      if (rec?.blob && (withAudio || rec.kind === 'drawing')) {
        copy.mediaData = await blobToDataUrl(rec.blob);
      }
    }
    out.push(copy);
  }

  return {
    exportedAt: new Date().toISOString(),
    app: 'tiefenjournal',
    source: 'artifact',
    version: 1,
    config: { lang: config.lang, feelingSlots: config.feelingSlots },
    entries: out,
    dialogues,
    structures,
    goals
  };
}

/** Führt zusammen statt zu überschreiben: bekannte IDs bleiben unangetastet. */
export async function importAll(data) {
  const known = new Set((await listEntries()).map(e => e.id));
  const knownDlg = new Set((await listDialogues()).map(d => d.id));
  let addedEntries = 0, addedAudio = 0, addedDialogues = 0, skipped = 0;

  for (const raw of data.entries || []) {
    if (!raw?.id) continue;
    if (known.has(raw.id)) { skipped++; continue; }
    const { audioData, mediaData, ...entry } = raw;
    if (audioData) {
      try {
        entry.audio = await putAudio(entry.id, dataUrlToBlob(audioData), { durationMs: entry.audio?.durationMs });
        addedAudio++;
      } catch { entry.audio = null; }
    }
    if (mediaData) {
      try {
        entry.media = await putMedia(entry.id, dataUrlToBlob(mediaData), {
          kind: entry.media?.kind, durationMs: entry.media?.durationMs
        });
      } catch { entry.media = null; }
    }
    await putEntry(entry);
    addedEntries++;
  }

  for (const d of data.dialogues || []) {
    if (!d?.id || knownDlg.has(d.id)) continue;
    await putDialogue(d);
    addedDialogues++;
  }

  const knownNodes = new Set((await listStructures()).map(n => n.id));
  let addedAreas = 0;
  for (const n of data.structures || []) {
    if (!n?.id || knownNodes.has(n.id)) continue;
    await putStructure(n);
    addedAreas++;
  }

  const knownGoals = new Set((await listGoals()).map(g => g.id));
  let addedGoals = 0;
  for (const g of data.goals || []) {
    if (!g?.id || knownGoals.has(g.id)) continue;
    await putGoal(g);
    addedGoals++;
  }

  return { addedEntries, addedAudio, addedDialogues, addedAreas, addedGoals, skipped };
}

export async function wipeAll() {
  for (const store of Object.values(S)) await tx(store, 'readwrite', s => s.clear());
}
