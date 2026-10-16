/**
 * „Ohne Worte" — zeichnen oder sprechen statt schreiben.
 * "Without words" — draw or speak instead of writing.
 *
 * Der einzige Ort, an dem die App die Seitenstruktur verlässt: eine leere
 * Fläche, sonst nichts. Das ist Absicht. Wer etwas ausdrücken will, das sich
 * nicht formulieren lässt, braucht keinen Rahmen aus Knöpfen um sich herum.
 *
 * ZUR BESCHRIFTUNG
 * „Zeichnen? Ton aufnehmen?" klingt nach einer Aufgabe, und eine Aufgabe
 * erzeugt Leistungsdruck — genau das, was hier stört. Deshalb steht bei jeder
 * Möglichkeit, dass sie nichts werden muss: Kritzeln zählt, Summen zählt.
 * Und es steht dabei, dass die Stimme nicht in Text verwandelt wird; wer
 * fürchtet, mitgeschrieben zu werden, spricht anders.
 *
 * The only place the app leaves its page structure: an empty surface, nothing
 * else. Someone expressing what cannot be phrased does not need a frame of
 * buttons around them.
 */

const INKS = ['#3f6b86', '#4f7359', '#b08356', '#a3615a', '#23282c'];
const WIDTHS = [3, 8, 18];
const CANVAS_W = 1000;
const CANVAS_H = 1300;

const TEXT = {
  de: {
    title: 'Ohne Worte',
    lede: 'Manches lässt sich leichter zeichnen oder sagen als schreiben.',
    draw: 'Zeichnen',
    drawHint: 'Linien, Farbe, Gekritzel. Es muss nichts darstellen und niemand sieht es außer dir.',
    voice: 'Stimme',
    voiceHint: 'Sprechen, summen, singen. Wird nicht in Text umgewandelt — die Aufnahme bleibt Ton.',
    voiceOff: 'Aufnehmen geht hier nicht',
    voiceOffHint: 'Der eingebettete Rahmen gibt kein Mikrofon frei. In der heruntergeladenen Fassung funktioniert es.',
    close: 'Zurück',
    undo: 'Zurück',
    clear: 'Leeren',
    save: 'Behalten',
    saved: 'Behalten',
    discard: 'Verwerfen',
    recording: 'läuft',
    start: 'Aufnehmen',
    stop: 'Beenden',
    again: 'Noch einmal',
    listen: 'Anhören',
    empty: 'Noch nichts auf der Fläche.',
    micDenied: 'Kein Zugriff aufs Mikrofon.'
  },
  en: {
    title: 'Without words',
    lede: 'Some things are easier to draw or say than to write.',
    draw: 'Draw',
    drawHint: 'Lines, colour, scribble. It does not have to depict anything and nobody sees it but you.',
    voice: 'Voice',
    voiceHint: 'Speak, hum, sing. It is not turned into text — the recording stays sound.',
    voiceOff: 'Recording is unavailable here',
    voiceOffHint: 'The embedded frame grants no microphone. It works in the downloaded build.',
    close: 'Back',
    undo: 'Undo',
    clear: 'Clear',
    save: 'Keep',
    saved: 'Kept',
    discard: 'Discard',
    recording: 'recording',
    start: 'Record',
    stop: 'Stop',
    again: 'Again',
    listen: 'Listen',
    empty: 'Nothing on the surface yet.',
    micDenied: 'No microphone access.'
  }
};

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

const canRecord = () => Boolean(
  navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined' && window.isSecureContext
);

const fmtTime = ms => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * Öffnet die Fläche. Löst mit { kind, blob, durationMs } auf, oder mit null,
 * wenn nichts behalten wurde.
 */
export function openExpress({ lang = 'de' } = {}) {
  const T = TEXT[lang] || TEXT.de;

  return new Promise(resolve => {
    const root = el('div', { class: 'express' });
    let cleanup = () => {};

    const finish = result => {
      cleanup();
      root.remove();
      document.body.classList.remove('is-expressing');
      resolve(result || null);
    };

    const header = (title, onBack) => el('div', { class: 'express__bar' },
      el('button', { class: 'express__back', type: 'button', onclick: onBack }, `← ${T.close}`),
      el('span', { class: 'express__title' }, title));

    /* ── Auswahl ── */
    function showChoice() {
      root.textContent = '';
      root.append(
        header(T.title, () => finish(null)),
        el('div', { class: 'express__choice' },
          el('p', { class: 'express__lede' }, T.lede),

          el('button', { class: 'express__opt', type: 'button', onclick: showDraw },
            el('b', {}, T.draw),
            el('span', {}, T.drawHint)),

          canRecord()
            ? el('button', { class: 'express__opt', type: 'button', onclick: showVoice },
                el('b', {}, T.voice),
                el('span', {}, T.voiceHint))
            : el('div', { class: 'express__opt is-off' },
                el('b', {}, T.voiceOff),
                el('span', {}, T.voiceOffHint))
        ));
    }

    /* ── Zeichnen ── */
    function showDraw() {
      root.textContent = '';

      const canvas = el('canvas', { class: 'express__canvas', width: CANVAS_W, height: CANVAS_H });
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fdfcf9';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.lineCap = ctx.lineJoin = 'round';

      const strokes = [];
      let current = null;
      let ink = INKS[0];
      let width = WIDTHS[1];

      const repaint = () => {
        ctx.fillStyle = '#fdfcf9';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        for (const s of strokes) {
          ctx.strokeStyle = s.ink;
          ctx.lineWidth = s.width;
          ctx.beginPath();
          s.points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
          if (s.points.length === 1) {
            ctx.arc(s.points[0].x, s.points[0].y, s.width / 2, 0, Math.PI * 2);
            ctx.fillStyle = s.ink;
            ctx.fill();
          } else ctx.stroke();
        }
      };

      const toCanvas = ev => {
        const r = canvas.getBoundingClientRect();
        return {
          x: (ev.clientX - r.left) / r.width * CANVAS_W,
          y: (ev.clientY - r.top) / r.height * CANVAS_H
        };
      };

      canvas.addEventListener('pointerdown', ev => {
        ev.preventDefault();
        canvas.setPointerCapture(ev.pointerId);
        current = { ink, width, points: [toCanvas(ev)] };
        strokes.push(current);
        repaint();
      });
      canvas.addEventListener('pointermove', ev => {
        if (!current) return;
        ev.preventDefault();
        current.points.push(toCanvas(ev));
        repaint();
      });
      const endStroke = () => { current = null; };
      canvas.addEventListener('pointerup', endStroke);
      canvas.addEventListener('pointercancel', endStroke);
      canvas.addEventListener('pointerleave', endStroke);

      const inkRow = el('div', { class: 'express__inks' },
        INKS.map(colour => el('button', {
          class: `express__ink${colour === ink ? ' on' : ''}`,
          type: 'button',
          style: `--c:${colour}`,
          'aria-label': colour,
          onclick: ev => {
            ink = colour;
            for (const b of inkRow.children) b.classList.remove('on');
            ev.currentTarget.classList.add('on');
          }
        })));

      const widthRow = el('div', { class: 'express__widths' },
        WIDTHS.map(w => el('button', {
          class: `express__width${w === width ? ' on' : ''}`,
          type: 'button',
          'aria-label': String(w),
          onclick: ev => {
            width = w;
            for (const b of widthRow.children) b.classList.remove('on');
            ev.currentTarget.classList.add('on');
          }
        }, el('i', { style: `width:${Math.max(4, w)}px;height:${Math.max(4, w)}px` }))));

      root.append(
        header(T.draw, showChoice),
        el('div', { class: 'express__stage' }, canvas),
        el('div', { class: 'express__tools' },
          inkRow, widthRow,
          el('div', { class: 'express__acts' },
            el('button', {
              class: 'btn btn--tiny', type: 'button',
              onclick: () => { strokes.pop(); repaint(); }
            }, T.undo),
            el('button', {
              class: 'btn btn--tiny', type: 'button',
              onclick: () => { strokes.length = 0; repaint(); }
            }, T.clear),
            el('button', {
              class: 'btn btn--tiny btn--green', type: 'button',
              onclick: () => {
                if (!strokes.length) return;
                canvas.toBlob(blob => {
                  if (blob) finish({ kind: 'drawing', blob, mimeType: 'image/png' });
                }, 'image/png');
              }
            }, T.save))));
    }

    /* ── Stimme ── */
    function showVoice() {
      root.textContent = '';

      let recorder = null;
      let stream = null;
      let chunks = [];
      let startedAt = 0;
      let timer = null;
      let result = null;
      let url = null;

      cleanup = () => {
        clearInterval(timer);
        try { recorder?.state !== 'inactive' && recorder?.stop(); } catch { /* egal */ }
        stream?.getTracks().forEach(t => t.stop());
        if (url) URL.revokeObjectURL(url);
      };

      const state = el('p', { class: 'express__state' }, T.voiceHint);
      const clock = el('p', { class: 'express__clock' }, '0:00');
      const player = el('audio', { class: 'express__player', controls: true, hidden: true });
      const pulse = el('span', { class: 'express__pulse' });

      const mainBtn = el('button', { class: 'express__rec', type: 'button', 'aria-pressed': 'false' }, pulse);
      const keepBtn = el('button', { class: 'btn btn--tiny btn--green', type: 'button', hidden: true },
        T.save);
      const againBtn = el('button', { class: 'btn btn--tiny', type: 'button', hidden: true }, T.again);

      const stop = async () => {
        clearInterval(timer);
        mainBtn.setAttribute('aria-pressed', 'false');
        await new Promise(done => {
          recorder.onstop = () => {
            result = { blob: new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }),
                       durationMs: Date.now() - startedAt };
            done();
          };
          recorder.stop();
        });
        stream?.getTracks().forEach(t => t.stop());
        if (result.blob.size) {
          url = URL.createObjectURL(result.blob);
          player.src = url;
          player.hidden = false;
          keepBtn.hidden = false;
          againBtn.hidden = false;
          state.textContent = `${fmtTime(result.durationMs)}`;
          mainBtn.hidden = true;
        }
      };

      const start = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
          state.textContent = T.micDenied;
          return;
        }
        const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
          .find(m => MediaRecorder.isTypeSupported?.(m));
        chunks = [];
        recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
        recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
        recorder.start(250);
        startedAt = Date.now();
        mainBtn.setAttribute('aria-pressed', 'true');
        state.textContent = T.recording;
        timer = setInterval(() => { clock.textContent = fmtTime(Date.now() - startedAt); }, 400);
      };

      mainBtn.addEventListener('click', () => {
        if (mainBtn.getAttribute('aria-pressed') === 'true') stop();
        else start();
      });

      keepBtn.addEventListener('click', () => {
        if (!result?.blob) return;
        finish({ kind: 'voice', blob: result.blob, durationMs: result.durationMs,
                 mimeType: result.blob.type });
      });

      againBtn.addEventListener('click', () => {
        if (url) { URL.revokeObjectURL(url); url = null; }
        result = null;
        player.hidden = true;
        keepBtn.hidden = true;
        againBtn.hidden = true;
        mainBtn.hidden = false;
        clock.textContent = '0:00';
        state.textContent = T.voiceHint;
      });

      root.append(
        header(T.voice, showChoice),
        el('div', { class: 'express__voice' },
          mainBtn, clock, state, player,
          el('div', { class: 'express__acts' }, againBtn, keepBtn)));
    }

    document.body.classList.add('is-expressing');
    document.body.append(root);
    showChoice();
  });
}
