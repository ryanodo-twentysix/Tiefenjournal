/**
 * Sprechen statt tippen.
 * Speaking instead of typing.
 *
 * Halten, sprechen, loslassen — wie eine Sprachnachricht. Der Text erscheint
 * ein paar Sekunden später im Feld, an der Stelle, an der der Cursor stand.
 *
 * WO DAS LÄUFT UND WO NICHT
 *
 * Ein eingebettetes Fenster bekommt vom Browser kein Mikrofon. Das lässt sich
 * von innen nicht ändern — die Seite kann sich die Erlaubnis nicht selbst
 * erteilen, und die umgebende Seite gibt sie nicht. Im Artefakt bleibt der
 * Knopf deshalb sichtbar, sagt aber beim Antippen, warum er hier nichts tut
 * und wo es funktioniert. Ein Knopf, der stumm nichts tut, wäre schlimmer als
 * gar keiner; eine App, die das Diktat verschweigt, hilft aber auch nicht
 * beim Herunterladen.
 *
 * WARUM NICHT DIE EINGEBAUTE SPRACHERKENNUNG
 *
 * Die Web-Speech-API wäre in zwei Zeilen fertig, schickt in Chrome aber jedes
 * gesprochene Wort an Google. Für ein Tagebuch ist das die falsche Abmachung.
 * Hier läuft Whisper im Browser selbst: einmal Modell laden, danach verlässt
 * kein Ton das Gerät, und es geht auch ohne Netz.
 */

import { Recorder, transcribe, environmentState, isModelCached, MODELS, formatProgress }
  from './core/whisper.js';

/* Die Lageerkennung selbst steht bei der Fähigkeit, die sie prüft. */
export { environmentState as dictationState } from './core/whisper.js';

/**
 * Was der Browser uns mit seiner Absage sagen wollte.
 *
 * `NotAllowedError` ist doppeldeutig: Sie kommt, wenn der Mensch „nein" sagt,
 * und genauso, wenn der Rahmen das Mikrofon gar nicht erst durchreicht. Im
 * eingebetteten Fenster ist das Zweite fast immer der Fall — dort kommt der
 * Browser nämlich nicht einmal dazu, jemanden zu fragen.
 */
function reasonFromError(err) {
  const embedded = !environmentState().ok && environmentState().reason === 'embedded';
  if (err?.name === 'NotAllowedError') return embedded ? 'embedded' : 'denied';
  if (err?.name === 'NotFoundError') return 'nomic';
  return environmentState().reason || 'failed';
}

/* ══════════════ Texte ══════════════ */

const T = {
  de: {
    hint: 'Zum Sprechen gedrückt halten, zum Beenden loslassen — wie eine Sprachnachricht. Der Text landet danach im Feld.',
    hold: 'Halten & sprechen',
    listening: 'Ich höre …',
    working: 'Wird geschrieben …',
    tooShort: 'Zu kurz — halte den Knopf, solange du sprichst.',
    nothing: 'Nichts verstanden. Noch einmal?',
    failed: 'Das Diktat hat nicht geklappt.',
    denied: 'Der Browser hat das Mikrofon nicht freigegeben. In den Seiteneinstellungen des Browsers lässt sich das ändern.',
    label: 'Diktieren',
    stop: 'Fertig',

    // Warum es hier nicht geht
    whyEmbedded: 'Hier im eingebetteten Fenster gibt der Browser kein Mikrofon frei — das kann die Seite nicht selbst ändern.',
    whyInsecure: 'Ohne HTTPS gibt der Browser kein Mikrofon frei.',
    whyUnsupported: 'Dieser Browser kann im Hintergrund nicht rechnen, was für das Diktat nötig wäre.',
    whyNoMic: 'Dieses Gerät meldet kein Mikrofon.',
    whereItWorks: 'In der heruntergeladenen App auf deinem Telefon läuft es: dort wird ein Spracherkennungsmodell einmal geladen und danach auf dem Gerät gerechnet — ohne Netz, ohne Google, ohne dass Ton irgendwohin geht.',
    toDownload: 'Zum Herunterladen',
    close: 'Verstanden',

    // Einmaliger Modelldownload
    setupTitle: 'Einmal Spracherkennung einrichten',
    setupBody: mb => `Für das Diktat wird ein Modell von etwa ${mb} MB geladen. Danach läuft alles auf diesem Gerät: kein Ton verlässt das Telefon, und es geht auch offline. Über Mobilfunk lohnt es sich zu warten, bis du im WLAN bist.`,
    setupGo: 'Modell laden',
    setupCancel: 'Später',
    setupLoading: 'Wird geladen …',
    setupDone: 'Fertig. Halte den Knopf und sprich.',
    setupFailed: 'Das Modell konnte nicht geladen werden. Besteht eine Verbindung?'
  },
  en: {
    hint: 'Press and hold to speak, let go to finish — like a voice message. The text lands in the field afterwards.',
    hold: 'Hold & speak',
    listening: 'Listening …',
    working: 'Writing it down …',
    tooShort: 'Too short — hold the button while you speak.',
    nothing: 'Did not catch that. Once more?',
    failed: 'The dictation did not work.',
    denied: 'The browser did not release the microphone. That can be changed in the browser’s site settings.',
    label: 'Dictate',
    stop: 'Done',

    whyEmbedded: 'Here in the embedded frame the browser releases no microphone — the page cannot change that by itself.',
    whyInsecure: 'Without HTTPS the browser releases no microphone.',
    whyUnsupported: 'This browser cannot do the background computation the dictation needs.',
    whyNoMic: 'This device reports no microphone.',
    whereItWorks: 'It runs in the downloaded app on your phone: a speech model is fetched once and then computed on the device — no network, no Google, no audio going anywhere.',
    toDownload: 'To the download',
    close: 'Understood',

    setupTitle: 'Set up speech recognition once',
    setupBody: mb => `Dictation needs a model of about ${mb} MB. After that everything runs on this device: no audio leaves the phone, and it works offline. On mobile data it is worth waiting for Wi-Fi.`,
    setupGo: 'Fetch the model',
    setupCancel: 'Later',
    setupLoading: 'Loading …',
    setupDone: 'Ready. Hold the button and speak.',
    setupFailed: 'The model could not be loaded. Is there a connection?'
  }
};

const txt = lang => T[lang] || T.de;

/* ══════════════ Werkzeug ══════════════ */

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'style') n.setAttribute('style', v);
    else if (k.startsWith('on')) n.addEventListener(k.slice(2).toLowerCase(), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) {
    if (c === null || c === undefined || c === false) continue;
    n.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return n;
}

/** Das voreingestellte Modell — der Mittelweg aus Größe und Genauigkeit. */
const DEFAULT_MODEL = 'Xenova/whisper-base';
const modelInfo = id => MODELS.find(m => m.id === id) || MODELS[1];

/* ══════════════ Der Knopf ══════════════ */

/**
 * Hängt „halten und sprechen" an einen Knopf.
 *
 * @param button   der Knopf
 * @param opts.field      Textfeld, in das geschrieben wird
 * @param opts.lang       'de' | 'en'
 * @param opts.model      Modell-Id
 * @param opts.onStatus   (text, kind) — Rückmeldung für die Zeile daneben
 * @param opts.onDone     (text) — nachdem etwas eingefügt wurde
 * @param opts.onNeedApp  () — im eingebetteten Fenster: Weg zum Download
 */
export function attachDictation(button, opts = {}) {
  const L = () => txt(opts.lang?.() || 'de');

  /* Der Knopf wird NICHT vorab abgeschaltet.
   *
   * Vorher entschied eine Vermutung („wir stecken in einem Rahmen, also gibt
   * es kein Mikrofon"), ob überhaupt etwas versucht wird. Das war zweimal
   * falsch: Es macht den Knopf tot, wo er vielleicht funktioniert hätte, und
   * die Erklärung kam als kleine Zeile, die man übersieht. Jetzt wird immer
   * gefragt — und wenn der Browser ablehnt, steht die Erklärung als Fläche da,
   * an der niemand vorbeisieht. */
  const looksBlocked = !environmentState().ok;
  if (looksBlocked) button.classList.add('mic--unsure');

  const rec = new Recorder();
  let busy = false;
  let holding = false;
  let startedAt = 0;

  const status = (text, kind) => opts.onStatus?.(text, kind);

  async function begin() {
    if (busy || holding) return;
    const L2 = L();

    // Zuerst das Mikrofon, dann das Modell: Wenn der Browser den Zugriff
    // ohnehin verweigert, soll niemand vorher 78 MB herunterladen.
    let stream = false;
    try {
      holding = true;
      button.classList.add('is-live');
      stream = await rec.start(level => {
        button.style.setProperty('--level', String(Math.min(1, level * 2.4)));
      });
    } catch (err) {
      holding = false;
      button.classList.remove('is-live');
      button.classList.add('mic--off');
      explain(reasonFromError(err), L2, opts.onNeedApp);
      status('', null);
      return;
    }

    if (!stream) { holding = false; button.classList.remove('is-live'); return; }

    // Das Mikrofon läuft. Fehlt jetzt noch das Modell, wird gefragt — die
    // Aufnahme läuft dabei weiter, sonst wäre der Anfang des Satzes weg.
    const model = opts.model?.() || DEFAULT_MODEL;
    if (!(await isModelCached(model))) {
      rec.cancel();
      holding = false;
      button.classList.remove('is-live');
      const got = await offerSetup(model, L2, opts.lang?.() || 'de');
      if (got) status(L2.setupDone, 'live');
      return;
    }

    startedAt = Date.now();
    status(L2.listening, 'live');
  }

  async function end() {
    if (!holding) return;
    holding = false;
    button.classList.remove('is-live');
    button.style.removeProperty('--level');

    const L2 = L();
    const heldMs = Date.now() - startedAt;

    // Ein Fehltipper ist keine Aufnahme.
    if (heldMs < 500) {
      rec.cancel();
      status(L2.tooShort, 'bad');
      return;
    }

    busy = true;
    button.classList.add('is-working');
    status(L2.working, 'work');

    try {
      const take = await rec.stop();
      if (!take?.blob?.size) { status(L2.nothing, 'bad'); return; }

      const text = (await transcribe(take.blob, {
        model: opts.model?.() || DEFAULT_MODEL,
        lang: opts.lang?.() || 'de'
      })).trim();

      if (!text) { status(L2.nothing, 'bad'); return; }

      insert(opts.field, text);
      status('', null);
      opts.onDone?.(text);
    } catch (err) {
      status(err?.message ? `${L2.failed} ${err.message}` : L2.failed, 'bad');
    } finally {
      busy = false;
      button.classList.remove('is-working');
    }
  }

  /* Zeigefinger, Maus und Stift laufen alle über Pointer-Ereignisse. Der
     Abbruch (`pointercancel`) ist auf dem Telefon der wichtigste davon: er
     kommt, sobald die Geste als Scrollen gewertet wird. */
  const onDown = e => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    // Das Einfangen des Zeigers ist Komfort — es hält `pointerup` beim Knopf,
    // wenn der Finger beim Sprechen verrutscht. Es darf die Aufnahme aber
    // nicht verhindern: Ist der Zeiger schon wieder weg, wirft der Aufruf.
    try { button.setPointerCapture?.(e.pointerId); } catch { /* auch ohne geht es */ }
    begin();
  };
  const onUp = () => end();
  const onCancel = () => { if (holding) end(); };

  button.addEventListener('pointerdown', onDown);
  button.addEventListener('pointerup', onUp);
  button.addEventListener('pointercancel', onCancel);
  button.addEventListener('lostpointercapture', onCancel);
  // Auf dem Telefon sonst: langes Drücken öffnet das Kontextmenü.
  button.addEventListener('contextmenu', e => e.preventDefault());

  // Mit der Tastatur: Leertaste/Eingabe halten.
  button.addEventListener('keydown', e => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); begin(); }
  });
  button.addEventListener('keyup', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); end(); }
  });

  return () => {
    rec.cancel();
    button.removeEventListener('pointerdown', onDown);
    button.removeEventListener('pointerup', onUp);
    button.removeEventListener('pointercancel', onCancel);
  };
}

/** An der Cursorstelle einfügen, nicht ans Ende — sonst zerstört es Korrekturen. */
function insert(field, text) {
  if (!field) return;
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? field.value.length;
  const before = field.value.slice(0, start);
  const after = field.value.slice(end);

  const glue = before && !/\s$/.test(before) ? ' ' : '';
  const next = before + glue + text + after;

  field.value = next;
  const caret = (before + glue + text).length;
  field.setSelectionRange?.(caret, caret);
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.focus();
}

/* ══════════════ Die beiden Erklärflächen ══════════════ */

function sheet(...children) {
  const back = el('div', { class: 'mic-sheet' });
  const card = el('div', { class: 'mic-sheet__card' }, ...children);
  back.append(card);
  document.body.append(back);
  requestAnimationFrame(() => back.classList.add('is-in'));

  const close = () => {
    back.classList.remove('is-in');
    setTimeout(() => back.remove(), 180);
  };
  back.addEventListener('click', e => { if (e.target === back) close(); });
  return { close, card };
}

/** Warum der Knopf hier nichts tut — und wo er etwas tut. */
function explain(reason, L, onNeedApp) {
  const why = reason === 'insecure' ? L.whyInsecure
    : reason === 'unsupported' ? L.whyUnsupported
    : reason === 'denied' ? L.denied
    : reason === 'nomic' ? L.whyNoMic
    : L.whyEmbedded;

  const { close } = sheet(
    el('h3', {}, L.label),
    el('p', {}, why),
    el('p', { class: 'mic-sheet__good' }, L.whereItWorks),
    el('div', { class: 'mic-sheet__row' },
      onNeedApp
        ? el('button', {
            class: 'btn btn--primary', type: 'button',
            onclick: () => { close(); onNeedApp(); }
          }, L.toDownload)
        : null,
      el('button', { class: 'btn', type: 'button', onclick: () => close() }, L.close)));
}

/**
 * Der einmalige Modelldownload. Fragen, nicht einfach laden: 78 MB über
 * Mobilfunk sind für manche echtes Geld.
 */
function offerSetup(model, L, lang) {
  const info = modelInfo(model);

  return new Promise(resolve => {
    let done = false;
    const finish = v => { if (!done) { done = true; resolve(v); } };

    const bar = el('div', { class: 'mic-bar' }, el('i'));
    const note = el('p', { class: 'mic-sheet__note' });

    const go = el('button', { class: 'btn btn--primary', type: 'button' }, L.setupGo);
    const later = el('button', { class: 'btn', type: 'button' }, L.setupCancel);

    const { close } = sheet(
      el('h3', {}, L.setupTitle),
      el('p', {}, L.setupBody(info.sizeMB)),
      el('p', { class: 'mic-sheet__note' }, lang === 'en' ? info.noteEn : info.noteDe),
      bar, note,
      el('div', { class: 'mic-sheet__row' }, go, later));

    bar.hidden = true;

    later.addEventListener('click', () => { close(); finish(false); });

    go.addEventListener('click', async () => {
      go.disabled = true;
      later.disabled = true;
      bar.hidden = false;
      note.textContent = L.setupLoading;

      try {
        const { warmup } = await import('./core/whisper.js');
        await warmup(model, p => {
          const f = formatProgress(p);
          if (!f?.percent) return;
          bar.firstChild.style.width = `${f.percent}%`;
          note.textContent = f.totalMB
            ? `${f.loadedMB} / ${f.totalMB} MB`
            : `${f.percent} %`;
        });
        note.textContent = L.setupDone;
        setTimeout(() => { close(); finish(true); }, 700);
      } catch {
        note.textContent = L.setupFailed;
        go.disabled = false;
        later.disabled = false;
      }
    });
  });
}

/**
 * Die Erklärzeile über den Feldern — kurz, einmal, nicht bei jedem Feld.
 *
 * Sie sagt nur noch, wie der Knopf bedient wird. Ob das Mikrofon freigegeben
 * wird, entscheidet der Browser erst beim Drücken; es vorher anzukündigen hieß
 * entweder eine Absage zu behaupten, die vielleicht gar nicht kommt, oder eine
 * Anleitung für etwas zu geben, das gleich nicht passiert.
 */
export function dictationHint(lang) {
  return txt(lang).hint;
}
