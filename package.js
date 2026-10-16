/**
 * Mitnehmen: die App und die Daten als Datei.
 * Take it with you: the app and the data as a file.
 *
 * Zwei Wege, weil sie verschiedene Dinge können — und weil es unehrlich wäre,
 * das zu verwischen:
 *
 *   App-Paket (.zip)   Die vollständige App plus deine Daten. Auf einen
 *                      HTTPS-Ort gelegt, läuft sie voll: schreiben, auswerten,
 *                      offline, zum Startbildschirm hinzufügbar.
 *
 *   Archiv (.html)     Eine einzige Datei, die dein Journal lesbar macht —
 *                      überall, ohne alles. Sie kann nicht schreiben.
 *
 * Warum nicht eine Datei, die alles kann: Öffnet man eine HTML-Datei direkt
 * vom Telefonspeicher (file://), verweigern Browser den dauerhaften Speicher.
 * Lesen geht, Schreiben nicht. Ein Journal, das nichts behält, wäre eine
 * Attrappe — deshalb steht das hier so dran.
 */

const APP_FILES = [
  // package.js gehört dazu: app.js importiert es, und ohne die Datei würde
  // die ausgepackte App beim Laden abbrechen. Nebeneffekt: die mitgenommene
  // Fassung kann sich selbst wieder einpacken.
  'index.html', 'app.js', 'db.js', 'styles.css', 'package.js', 'express.js', 'guide.js',
  'dictate.js', 'core/whisper.js', 'core/whisper-worker.js',
  'core/i18n.js', 'core/emotions.js', 'core/themes.js', 'core/analyze.js',
  'core/reports.js', 'core/socratic.js', 'core/patterns.js', 'core/projects.js',
  'core/encouragement.js', 'core/structure.js', 'core/defence-reference.js',
  'core/polarity.js', 'core/mindmap.js', 'core/vaillant-guide.js',
  'core/tension.js', 'core/venn.js'
];

/* ══════════════ ZIP ohne Bibliothek ══════════════ */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Echte Kompression, wenn der Browser sie mitbringt; sonst unkomprimiert. */
async function deflateRaw(bytes) {
  if (typeof CompressionStream === 'undefined') return null;
  try {
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    const out = new Uint8Array(await new Response(stream).arrayBuffer());
    return out.length < bytes.length ? out : null;
  } catch {
    return null;
  }
}

/** DOS-Zeitstempel, wie das ZIP-Format ihn erwartet. */
function dosTime(date = new Date()) {
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
    date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  };
}

/**
 * @param {Array<{name: string, data: string|Uint8Array}>} files
 * @returns {Promise<Blob>}
 */
export async function buildZip(files) {
  const encoder = new TextEncoder();
  const stamp = dosTime();
  const parts = [];
  const central = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const raw = typeof file.data === 'string' ? encoder.encode(file.data) : file.data;
    const packed = await deflateRaw(raw);
    const body = packed || raw;
    const method = packed ? 8 : 0;
    const sum = crc32(raw);

    const header = new DataView(new ArrayBuffer(30));
    header.setUint32(0, 0x04034b50, true);
    header.setUint16(4, 20, true);
    header.setUint16(6, 0x0800, true);          // UTF-8-Namen
    header.setUint16(8, method, true);
    header.setUint16(10, stamp.time, true);
    header.setUint16(12, stamp.date, true);
    header.setUint32(14, sum, true);
    header.setUint32(18, body.length, true);
    header.setUint32(22, raw.length, true);
    header.setUint16(26, nameBytes.length, true);
    header.setUint16(28, 0, true);

    parts.push(new Uint8Array(header.buffer), nameBytes, body);

    const entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 0x02014b50, true);
    entry.setUint16(4, 20, true);
    entry.setUint16(6, 20, true);
    entry.setUint16(8, 0x0800, true);
    entry.setUint16(10, method, true);
    entry.setUint16(12, stamp.time, true);
    entry.setUint16(14, stamp.date, true);
    entry.setUint32(16, sum, true);
    entry.setUint32(20, body.length, true);
    entry.setUint32(24, raw.length, true);
    entry.setUint16(28, nameBytes.length, true);
    entry.setUint32(42, offset, true);
    central.push(new Uint8Array(entry.buffer), nameBytes);

    offset += 30 + nameBytes.length + body.length;
  }

  const centralSize = central.reduce((n, p) => n + p.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);

  return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
}

/* ══════════════ Symbole ══════════════ */

/** Zeichnet das Zeichen der App auf eine Leinwand — Blau nach Grün, wie im Start. */
function drawIcon(size) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f7f3e8';
  ctx.fillRect(0, 0, size, size);

  const inset = size * 0.18;
  const box = size - inset * 2;
  const radius = box * 0.28;
  const gradient = ctx.createLinearGradient(inset, inset, inset + box, inset + box);
  gradient.addColorStop(0, '#5b8aa6');
  gradient.addColorStop(1, '#6d9077');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(inset, inset, box, box, radius);
  else ctx.rect(inset, inset, box, box);
  ctx.fill();

  return canvas;
}

function canvasToBytes(canvas) {
  return new Promise(resolve => {
    canvas.toBlob(async blob => {
      resolve(blob ? new Uint8Array(await blob.arrayBuffer()) : null);
    }, 'image/png');
  });
}

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#5b8aa6"/><stop offset="1" stop-color="#6d9077"/>
  </linearGradient></defs>
  <rect width="512" height="512" fill="#f7f3e8"/>
  <rect x="92" y="92" width="328" height="328" rx="92" fill="url(#g)"/>
</svg>
`;

/* ══════════════ Beiwerk für die App ══════════════ */

function manifest(lang) {
  const de = lang !== 'en';
  return JSON.stringify({
    name: 'Tiefenjournal',
    short_name: 'Journal',
    description: de
      ? 'Journal mit Emotionsdifferenzierung, eigenen Bereichen und sokratischem Dialog.'
      : 'Journal with emotion differentiation, your own areas and Socratic dialogue.',
    lang,
    start_url: './index.html',
    scope: './',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f7f3e8',
    theme_color: '#f7f3e8',
    icons: [
      { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }, null, 2);
}

function serviceWorker(files) {
  const list = ['./', ...files, 'manifest.webmanifest', 'icons/icon.svg',
    'icons/icon-192.png', 'icons/icon-512.png'];
  return `/**
 * Hält die App offline lauffähig. Nach dem ersten Laden braucht sie kein Netz.
 */
const CACHE = 'tiefenjournal-v1';
const FILES = ${JSON.stringify(list, null, 2)};

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(FILES.map(f => cache.add(f).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(event.request);
    const network = fetch(event.request).then(res => {
      if (res && res.ok) cache.put(event.request, res.clone()).catch(() => {});
      return res;
    }).catch(() => null);
    if (hit) { event.waitUntil(network); return hit; }
    const fresh = await network;
    if (fresh) return fresh;
    if (event.request.mode === 'navigate') {
      const fallback = await cache.match('./index.html');
      if (fallback) return fallback;
    }
    return new Response('', { status: 504 });
  })());
});
`;
}

/**
 * Das Artefakt liefert nur den Seiteninhalt; Rahmen, Kopf und der kleine
 * Reset kommen sonst vom Gastgeber. Für die eigenständige Fassung muss das
 * Dokument vollständig sein.
 */
function wrapDocument(inner, lang) {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#f7f3e8">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<style>
  :root { color-scheme: light; }
  html, body { margin: 0; }
  img { max-width: 100%; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
${inner}
<script>
  if ('serviceWorker' in navigator) {
    addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
</script>
</body>
</html>
`;
}

function readme(lang) {
  const de = lang !== 'en';
  if (de) {
    return `TIEFENJOURNAL — auf dein Telefon bringen
========================================

In diesem Paket steckt die vollständige App und deine bisherigen Daten
(daten.json). Es braucht kein Konto, keinen Server und kein Internet —
nach dem ersten Laden läuft alles auf dem Gerät.

Eine Sache vorweg, damit du nicht in eine Sackgasse läufst:
Eine HTML-Datei, die du direkt aus dem Dateispeicher öffnest (file://),
darf vom Browser nichts dauerhaft speichern. Zum Lesen reicht das,
zum Schreiben nicht. Die App muss deshalb von einer Adresse geladen
werden — lokal oder aus dem Netz. Beides ist unten beschrieben.


WEG A · Auf einen eigenen Ort legen (dauerhaft, empfohlen)
---------------------------------------------------------
1. Den Inhalt dieses Ordners auf einen beliebigen statischen
   HTTPS-Speicherplatz laden. Kostenlos geht das z. B. mit
   Cloudflare Pages, Netlify, GitHub Pages oder eigenem Webspace.
   Hochgeladen wird nur die App — deine Einträge entstehen erst
   im Browser auf deinem Gerät.
2. Die Adresse auf dem Telefon öffnen.
3. ANDROID (Firefox): Menü ☰ → „Zum Startbildschirm hinzufügen".
   ANDROID (Chrome):  Menü ⋮ → „App installieren".
   IPHONE (Safari):   Teilen-Symbol → „Zum Home-Bildschirm".
4. Die App startet ab jetzt im eigenen Fenster und funktioniert offline.
5. In der App: Mehr → Import → daten.json wählen.


WEG B · Nur schnell ausprobieren (vom Rechner aus)
--------------------------------------------------
Im Ordner ein Terminal öffnen und einen der Befehle ausführen:

   python3 -m http.server 8080
   npx serve .

Dann im Browser http://localhost:8080 aufrufen. Solange der Rechner
läuft und im selben WLAN ist, geht auch die Netzwerkadresse des
Rechners — allerdings ohne HTTPS, sodass die Installation zum
Startbildschirm entfällt.


DIKTIEREN
---------
Hier funktioniert die Spracheingabe — im eingebetteten Artefakt konnte
sie es nicht, weil ein eingebettetes Fenster vom Browser kein Mikrofon
bekommt.

Beim ersten Drücken des Mikrofonknopfs fragt die App, ob das
Spracherkennungsmodell geladen werden darf (etwa 78 MB). Mach das im
WLAN. Danach liegt es im Browser und wird nie wieder geladen; alles
Weitere rechnet das Gerät selbst. Kein Ton geht irgendwohin, auch nicht
zu Google, und nach dem Laden braucht das Diktat kein Netz mehr.

Bedienung: Knopf gedrückt halten, sprechen, loslassen. Der Text steht
ein paar Sekunden später im Feld.

Voraussetzung ist HTTPS (Weg A). Über Weg B ohne HTTPS gibt der Browser
das Mikrofon nur auf localhost frei.


WAS DRIN IST
------------
index.html, app.js, db.js, styles.css   die App
dictate.js, core/whisper*.js            Diktat auf dem Gerät
core/                                   Lexikon, Analyse, Dialog, Projekte
manifest.webmanifest, sw.js, icons/     für Installation und Offlinebetrieb
daten.json                              deine Einträge, Bereiche und Dialoge


DEINE DATEN
-----------
Sie liegen ausschließlich im Browser auf deinem Gerät. Niemand sonst
hat Zugriff — aber wenn du die Seitendaten löschst, sind sie weg.
Exportiere von Zeit zu Zeit über Mehr → Sichern.

Und noch einmal in aller Deutlichkeit: Dies ist kein medizinisches
Werkzeug und ersetzt keine Behandlung.
`;
  }

  return `TIEFENJOURNAL — getting it onto your phone
=========================================

This package holds the complete app plus your data so far (daten.json).
No account, no server, no internet needed — after the first load
everything runs on the device.

One thing up front, so you do not hit a dead end:
An HTML file opened straight from device storage (file://) is not
allowed to store anything persistently. Fine for reading, not for
writing. The app therefore has to be served from an address — local
or online. Both are described below.


ROUTE A · Put it somewhere of your own (permanent, recommended)
--------------------------------------------------------------
1. Upload the contents of this folder to any static HTTPS host.
   Free options include Cloudflare Pages, Netlify, GitHub Pages or
   your own web space. Only the app is uploaded — your entries are
   created later, in the browser on your device.
2. Open that address on your phone.
3. ANDROID (Firefox): menu ☰ → "Add to Home screen".
   ANDROID (Chrome):  menu ⋮ → "Install app".
   IPHONE (Safari):   share icon → "Add to Home Screen".
4. The app now starts in its own window and works offline.
5. In the app: More → Import → choose daten.json.


ROUTE B · Just try it quickly (from a computer)
-----------------------------------------------
Open a terminal in this folder and run one of:

   python3 -m http.server 8080
   npx serve .

Then visit http://localhost:8080. While the computer is running and on
the same Wi-Fi, its network address works from the phone too — but
without HTTPS, so installing to the home screen is unavailable.


DICTATION
---------
Speech input works here — it could not in the embedded artifact, because
an embedded frame gets no microphone from the browser.

The first time you press the microphone button the app asks whether the
speech model may be fetched (about 78 MB). Do that on Wi-Fi. Afterwards
it sits in the browser and is never fetched again; everything else the
device computes itself. No audio goes anywhere, not to Google either,
and after the download dictation needs no network at all.

How to use it: hold the button down, speak, let go. The text appears in
the field a few seconds later.

It needs HTTPS (route A). On route B without HTTPS the browser only
releases the microphone on localhost.


WHAT IS INSIDE
--------------
index.html, app.js, db.js, styles.css   the app
dictate.js, core/whisper*.js            on-device dictation
core/                                   lexicon, analysis, dialogue, projects
manifest.webmanifest, sw.js, icons/     installation and offline support
daten.json                              your entries, areas and dialogues


YOUR DATA
---------
It lives only in the browser on your device. Nobody else has access —
but clearing site data clears it. Export from time to time via
More → Back up.

And once more, plainly: this is not a medical tool and replaces no
treatment.
`;
}

/* ══════════════ App-Paket ══════════════ */

async function fetchOwn(path) {
  const res = await fetch(new URL(path, location.href).href, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.text();
}

/**
 * Sammelt die eigenen Quelldateien und schnürt daraus ein lauffähiges Paket.
 * @param {object} opts { lang, data, onProgress }
 */
export async function buildAppPackage({ lang = 'de', data = null, onProgress = null } = {}) {
  const files = [];
  const step = (done, total, name) => onProgress?.({ done, total, name });
  const total = APP_FILES.length + 5;
  let done = 0;

  for (const path of APP_FILES) {
    const text = await fetchOwn(path);
    files.push({
      name: path,
      data: path === 'index.html' ? wrapDocument(text, lang) : text
    });
    step(++done, total, path);
  }

  files.push({ name: 'manifest.webmanifest', data: manifest(lang) });
  step(++done, total, 'manifest.webmanifest');

  files.push({ name: 'sw.js', data: serviceWorker(APP_FILES) });
  step(++done, total, 'sw.js');

  files.push({ name: 'icons/icon.svg', data: ICON_SVG });
  for (const size of [192, 512]) {
    const bytes = await canvasToBytes(drawIcon(size));
    if (bytes) files.push({ name: `icons/icon-${size}.png`, data: bytes });
  }
  step(++done, total, 'icons');

  if (data) {
    files.push({ name: 'daten.json', data: JSON.stringify(data, null, 2) });
  }
  step(++done, total, 'daten.json');

  files.push({ name: lang === 'en' ? 'READ-ME.txt' : 'LIESMICH.txt', data: readme(lang) });
  step(++done, total, 'readme');

  return buildZip(files);
}

/* ══════════════ Lesbares Archiv ══════════════ */

const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * Eine einzige Datei, die das Journal lesbar macht — ohne App, ohne Netz,
 * auf jedem Telefon zu öffnen. Sie kann nichts schreiben, und das steht drin.
 */
export function buildArchive({ lang = 'de', data, emotionLabel }) {
  const de = lang !== 'en';
  const entries = [...(data.entries || [])].reverse();
  const areas = data.structures || [];
  const goals = data.goals || [];
  const dialogues = data.dialogues || [];

  const T = de ? {
    title: 'Tiefenjournal — Archiv',
    made: 'Erstellt am',
    readonly: 'Dies ist eine Lesefassung. Sie zeigt, was zum Zeitpunkt des Exports da war, und kann nichts speichern. Die vollständige App liegt im App-Paket (.zip).',
    entries: 'Einträge', areas: 'Bereiche', goals: 'Ziele', dialogues: 'Gespräche',
    because: 'weil', feel: 'Ich fühle mich', none: 'Nichts vorhanden.',
    open: 'offen', done: 'erledigt', me: 'Ich', them: 'Dialog',
    dataTitle: 'Rohdaten', dataNote: 'Der folgende Block lässt sich in der App unter Mehr → Import wieder einlesen.'
  } : {
    title: 'Tiefenjournal — Archive',
    made: 'Created on',
    readonly: 'This is a reading copy. It shows what existed at the time of export and cannot save anything. The complete app is in the app package (.zip).',
    entries: 'Entries', areas: 'Areas', goals: 'Goals', dialogues: 'Conversations',
    because: 'because', feel: 'I feel', none: 'Nothing here.',
    open: 'open', done: 'done', me: 'Me', them: 'Dialogue',
    dataTitle: 'Raw data', dataNote: 'The block below can be read back into the app under More → Import.'
  };

  const pathOf = node => {
    const byId = new Map(areas.map(a => [a.id, a]));
    const parts = [node.title];
    let current = node, guard = 0;
    while (current?.parentId && guard++ < 10) {
      current = byId.get(current.parentId);
      if (current) parts.unshift(current.title);
    }
    return parts.join(' › ');
  };

  const entryHtml = e => {
    const when = new Date(e.createdAt).toLocaleString(de ? 'de-DE' : 'en-GB',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const feelings = (e.feelings || []).map(f => `
      <p class="feel"><em>${escapeHtml(T.feel)}</em> <b>${escapeHtml(emotionLabel(f.emotionId))}</b>
      <span class="dots">${'●'.repeat(f.intensity || 3)}${'○'.repeat(5 - (f.intensity || 3))}</span>
      <em>, ${escapeHtml(T.because)}</em> ${escapeHtml(f.because)}</p>`).join('');
    const free = e.freeText ? `<p class="free">${escapeHtml(e.freeText)}</p>` : '';
    return `<article class="entry"><h3>${escapeHtml(when)}</h3>${feelings}${free}</article>`;
  };

  const areaHtml = a => `<li>${escapeHtml(pathOf(a))}${a.note ? ` — <span class="note">${escapeHtml(a.note)}</span>` : ''}</li>`;

  const goalHtml = g => `<li class="${g.doneAt ? 'is-done' : ''}">${escapeHtml(g.title)}
    <span class="tagly">${escapeHtml(g.doneAt ? T.done : T.open)}</span></li>`;

  const dialogueHtml = d => `<article class="entry">
      <h3>${escapeHtml(d.title || new Date(d.createdAt).toLocaleDateString(de ? 'de-DE' : 'en-GB'))}</h3>
      ${(d.messages || []).map(m => `<p class="msg ${m.role}"><b>${escapeHtml(m.role === 'user' ? T.me : T.them)}</b><br>${escapeHtml(m.text).replace(/\n/g, '<br>')}</p>`).join('')}
    </article>`;

  const section = (title, body, count) =>
    `<section><h2>${escapeHtml(title)} <span class="count">${count}</span></h2>${count ? body : `<p class="none">${escapeHtml(T.none)}</p>`}</section>`;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(T.title)}</title>
<style>
  :root { color-scheme: light; }
  body {
    margin: 0; padding: 26px 18px 60px;
    background: #f8f7f3; color: #23282c;
    font: 16px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  .wrap { max-width: 680px; margin: 0 auto; }
  h1 { font-size: 1.5rem; margin: 0 0 4px; letter-spacing: -.02em; }
  h2 { font-size: 1.05rem; margin: 30px 0 12px; display: flex; align-items: baseline; gap: 9px; }
  h3 { font-size: .8rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
       color: #868d92; margin: 0 0 9px; }
  .made { color: #868d92; font-size: .8rem; margin-bottom: 16px; }
  .count { font-size: .75rem; font-weight: 600; color: #4f7359; background: #e7eee8;
           padding: 2px 9px; border-radius: 999px; }
  .readonly { background: #fdfcf9; border: 1px solid #e2e0d7; border-left: 3px solid #5b8aa6;
              border-radius: 12px; padding: 13px 15px; font-size: .88rem; color: #565f66; }
  .entry { background: #fdfcf9; border: 1px solid #e2e0d7; border-radius: 12px;
           padding: 15px 16px; margin-bottom: 10px; }
  .feel { font-family: "Iowan Old Style", Georgia, serif; font-size: 1rem; margin: 0 0 7px; }
  .feel em { font-style: normal; color: #565f66; }
  .dots { color: #868d92; font-size: .8rem; }
  .free { font-family: "Iowan Old Style", Georgia, serif; color: #565f66;
          border-top: 1px solid #edece5; padding-top: 9px; margin: 9px 0 0; white-space: pre-wrap; }
  ul { padding-left: 20px; margin: 0; }
  li { margin-bottom: 7px; }
  li.is-done { color: #868d92; text-decoration: line-through; }
  .tagly { font-size: .72rem; color: #4f7359; background: #e7eee8; padding: 1px 8px;
           border-radius: 999px; margin-left: 6px; text-decoration: none; display: inline-block; }
  .note { color: #868d92; font-size: .9rem; }
  .none { color: #868d92; font-size: .9rem; }
  .msg { margin: 0 0 11px; font-family: "Iowan Old Style", Georgia, serif; }
  .msg b { font-family: inherit; font-size: .7rem; letter-spacing: .07em; text-transform: uppercase;
           color: #868d92; font-weight: 700; }
  .msg.user { background: #e5eef2; border-radius: 10px; padding: 10px 12px; }
  details { margin-top: 30px; }
  summary { cursor: pointer; font-size: .85rem; color: #565f66; }
  pre { background: #edece5; padding: 12px; border-radius: 10px; overflow-x: auto;
        font-size: .7rem; line-height: 1.4; white-space: pre-wrap; word-break: break-all; }
</style>
</head>
<body>
<div class="wrap">
  <h1>${escapeHtml(T.title)}</h1>
  <p class="made">${escapeHtml(T.made)} ${escapeHtml(new Date().toLocaleString(de ? 'de-DE' : 'en-GB'))}</p>
  <p class="readonly">${escapeHtml(T.readonly)}</p>

  ${section(T.entries, entries.map(entryHtml).join(''), entries.length)}
  ${section(T.areas, `<ul>${areas.map(areaHtml).join('')}</ul>`, areas.length)}
  ${section(T.goals, `<ul>${goals.map(goalHtml).join('')}</ul>`, goals.length)}
  ${section(T.dialogues, dialogues.map(dialogueHtml).join(''), dialogues.length)}

  <details>
    <summary>${escapeHtml(T.dataTitle)}</summary>
    <p class="note">${escapeHtml(T.dataNote)}</p>
    <pre>${escapeHtml(JSON.stringify(data))}</pre>
  </details>
</div>
</body>
</html>
`;
}
