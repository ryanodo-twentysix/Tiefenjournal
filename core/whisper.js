/**
 * Spracheingabe ohne Google.
 * Speech input without Google.
 *
 * Aufnahme über MediaRecorder, Transkription über ein lokal laufendes
 * Whisper-Modell (WebAssembly). Es verlässt nichts das Telefon; nach dem
 * einmaligen Modelldownload funktioniert alles offline.
 *
 * Der Preis gegenüber der eingebauten Spracherkennung: der Text erscheint
 * nicht live beim Sprechen, sondern ein paar Sekunden nach dem Stopp.
 */

export const MODELS = [
  {
    id: 'Xenova/whisper-tiny',
    de: 'Klein — schnell, ungenauer',
    en: 'Tiny — fast, less accurate',
    sizeMB: 42,
    noteDe: 'Für Stichworte und kurze Notizen. Bei Fachwörtern und Dialekt schwach.',
    noteEn: 'For keywords and short notes. Weak on jargon and dialect.'
  },
  {
    id: 'Xenova/whisper-base',
    de: 'Mittel — empfohlen',
    en: 'Base — recommended',
    sizeMB: 78,
    noteDe: 'Guter Kompromiss auf dem Telefon. Deutsch wird solide erkannt.',
    noteEn: 'A good compromise on a phone. German is recognised solidly.'
  },
  {
    id: 'Xenova/whisper-small',
    de: 'Groß — genau, langsam',
    en: 'Small — accurate, slow',
    sizeMB: 250,
    noteDe: 'Deutlich bessere Satzzeichen und Endungen, braucht aber spürbar länger.',
    noteEn: 'Noticeably better punctuation and word endings, but takes visibly longer.'
  }
];

const LANG_MAP = { de: 'german', en: 'english' };

let worker = null;
let seq = 0;
const pending = new Map();

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL('./whisper-worker.js', import.meta.url), { type: 'module' });

  worker.onmessage = ev => {
    const { type, id, text, message, payload, model } = ev.data || {};
    const job = pending.get(id);
    if (!job) return;

    if (type === 'progress') { job.onProgress?.(payload); return; }
    if (type === 'result')   { pending.delete(id); job.resolve(text); return; }
    if (type === 'ready')    { pending.delete(id); job.resolve(model); return; }
    if (type === 'disposed') { pending.delete(id); job.resolve(true); return; }
    if (type === 'error')    { pending.delete(id); job.reject(new Error(message)); return; }
  };

  worker.onerror = err => {
    for (const [, job] of pending) job.reject(new Error(err.message || 'Worker-Fehler'));
    pending.clear();
  };

  return worker;
}

function send(payload, onProgress, transfer = []) {
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, onProgress });
    getWorker().postMessage({ ...payload, id }, transfer);
  });
}

/* ─────────────────── Aufnahme ─────────────────── */

export class Recorder {
  constructor() {
    this.recorder = null;
    this.stream = null;
    this.chunks = [];
    this.startedAt = 0;
    this.analyser = null;
    this.audioContext = null;
  }

  get isRecording() {
    return this.recorder?.state === 'recording';
  }

  /** Startet die Aufnahme. onLevel bekommt fortlaufend einen Pegel von 0..1. */
  async start(onLevel) {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });

    const mime = [
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/webm',
      'audio/mp4'
    ].find(m => MediaRecorder.isTypeSupported?.(m));

    this.chunks = [];
    this.recorder = new MediaRecorder(this.stream, mime ? { mimeType: mime } : undefined);
    this.recorder.ondataavailable = e => { if (e.data.size) this.chunks.push(e.data); };
    this.recorder.start(250);
    this.startedAt = Date.now();

    if (onLevel) this.#meter(onLevel);
    return true;
  }

  #meter(onLevel) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new Ctx();
    const src = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    src.connect(this.analyser);

    const data = new Uint8Array(this.analyser.frequencyBinCount);
    const tick = () => {
      if (!this.analyser) return;
      this.analyser.getByteTimeDomainData(data);
      let peak = 0;
      for (const v of data) peak = Math.max(peak, Math.abs(v - 128) / 128);
      onLevel(peak);
      requestAnimationFrame(tick);
    };
    tick();
  }

  /** Beendet die Aufnahme und liefert { blob, durationMs }. */
  stop() {
    return new Promise(resolve => {
      if (!this.recorder || this.recorder.state === 'inactive') {
        resolve(null);
        return;
      }
      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.recorder.mimeType || 'audio/webm' });
        const durationMs = Date.now() - this.startedAt;
        this.#cleanup();
        resolve({ blob, durationMs });
      };
      this.recorder.stop();
    });
  }

  cancel() {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.onstop = null;
      this.recorder.stop();
    }
    this.#cleanup();
  }

  #cleanup() {
    this.stream?.getTracks().forEach(t => t.stop());
    this.analyser = null;
    if (this.audioContext?.state !== 'closed') this.audioContext?.close().catch(() => {});
    this.audioContext = null;
    this.stream = null;
    this.recorder = null;
  }
}

/* ─────────────────── Transkription ─────────────────── */

/**
 * Whisper erwartet Mono mit 16 kHz als Float32.
 * Whisper expects mono Float32 at 16 kHz.
 */
export async function blobToPcm(blob) {
  const buf = await blob.arrayBuffer();
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const decodeCtx = new Ctx();
  let decoded;
  try {
    decoded = await decodeCtx.decodeAudioData(buf.slice(0));
  } finally {
    decodeCtx.close().catch(() => {});
  }

  const targetRate = 16000;
  const frames = Math.ceil(decoded.duration * targetRate);
  const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const offline = new OfflineCtx(1, frames, targetRate);

  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();

  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}

/** Lädt das Modell vor, damit die erste echte Aufnahme nicht warten muss. */
export function warmup(model, onProgress) {
  return send({ type: 'warmup', model }, onProgress);
}

export async function transcribe(blob, { model, lang, onProgress } = {}) {
  const pcm = await blobToPcm(blob);
  // Der Puffer wird übergeben statt kopiert — spart auf dem Telefon spürbar Speicher.
  const buffer = pcm.buffer;
  return send(
    { type: 'transcribe', model, audio: pcm, language: LANG_MAP[lang] || null },
    onProgress,
    [buffer]
  );
}

export function dispose() {
  if (!worker) return Promise.resolve(true);
  return send({ type: 'dispose' });
}

export function isSupported() {
  return typeof Worker !== 'undefined'
    && typeof WebAssembly !== 'undefined'
    && Boolean(navigator.mediaDevices?.getUserMedia);
}

/**
 * Warum geht das Diktat hier nicht?
 *
 * Die Antwort muss genau sein. „Funktioniert nicht" ist für jemanden, der es
 * dreimal versucht hat, keine Auskunft — und der häufigste Grund ist nicht
 * behebbar, sondern nur erklärbar: Ein eingebettetes Fenster bekommt vom
 * Browser kein Mikrofon, und die Seite kann sich die Erlaubnis nicht selbst
 * erteilen.
 *
 * Die Reihenfolge ist Absicht: „eingebettet" wird zuerst geprüft, weil im
 * Artefakt auch die anderen Prüfungen fehlschlagen würden und man dann die
 * falsche Erklärung bekäme.
 */
export function environmentState() {
  const embedded = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();

  if (embedded) return { ok: false, reason: 'embedded' };
  if (!window.isSecureContext) return { ok: false, reason: 'insecure' };
  if (!isSupported()) return { ok: false, reason: 'unsupported' };
  return { ok: true, reason: null };
}

/** Wurde das Modell schon einmal geladen? Dann ist die App offline voll nutzbar. */
export async function isModelCached(model) {
  if (!('caches' in window)) return false;
  try {
    const keys = await caches.keys();
    for (const key of keys) {
      const cache = await caches.open(key);
      const reqs = await cache.keys();
      if (reqs.some(r => r.url.includes(model))) return true;
    }
  } catch { /* Cache nicht lesbar */ }
  return false;
}

/** Menschlich lesbarer Fortschritt für die Modellanzeige. */
export function formatProgress(p) {
  if (!p) return null;
  if (p.status === 'progress' && p.total) {
    return {
      file: p.file || '',
      percent: Math.round((p.loaded / p.total) * 100),
      loadedMB: (p.loaded / 1048576).toFixed(1),
      totalMB: (p.total / 1048576).toFixed(1)
    };
  }
  if (p.status === 'done') return { file: p.file || '', percent: 100 };
  return null;
}
