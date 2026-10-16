/**
 * Die Erklärseite zu Vaillants Ebenen.
 *
 * Eigene Fläche, weil das hier nicht nebenbei zu lesen ist: vier Ebenen an
 * einem durchgehenden Beispiel, mit dem, was man beim Lesen der Einstufung
 * wissen muss. Wer hierher kommt, will verstehen — nicht scrollen.
 */

import { GUIDE } from './core/vaillant-guide.js';

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

/** Wie die App-Ebene zur römischen Stufe passt. */
const TONE = { I: 'i', II: 'ii', III: 'iii', IV: 'iv' };

export function openGuide({ lang = 'de' } = {}) {
  const G = GUIDE[lang] || GUIDE.de;

  const root = el('div', { class: 'guide' });
  const close = () => {
    root.remove();
    document.body.classList.remove('is-reading');
  };

  root.append(
    el('div', { class: 'guide__bar' },
      el('button', { class: 'guide__back', type: 'button', onclick: close }, `← ${G.close}`),
      el('span', { class: 'guide__crumb' }, G.title)),

    el('div', { class: 'guide__body' },
      el('h1', { class: 'guide__title' }, G.title),
      el('p', { class: 'guide__sub' }, G.subtitle),

      ...G.intro.map(p => el('p', { class: 'guide__p' }, p)),

      el('h2', { class: 'guide__h' }, G.scenarioTitle),
      el('p', { class: 'guide__lede' }, G.scenarioLede),

      // Jede Ebene als eigene Karte statt als Tabellenzeile: auf einem Telefon
      // ist eine vierspaltige Tabelle unlesbar.
      ...G.levels.map(level => el('article', { class: `lvl lvl--${TONE[level.roman] || 'iv'}` },
        el('div', { class: 'lvl__top' },
          el('span', { class: 'lvl__roman' }, level.roman),
          el('h3', { class: 'lvl__name' }, level.name)),
        el('p', { class: 'lvl__reality' }, level.reality),
        el('div', { class: 'lvl__row' },
          el('span', { class: 'lvl__label' }, lang === 'en' ? 'Defences' : 'Abwehrformen'),
          el('span', { class: 'lvl__defs' }, level.defences)),
        el('div', { class: 'lvl__row' },
          el('span', { class: 'lvl__label' }, lang === 'en' ? 'After the failed exam' : 'Nach der nicht bestandenen Prüfung'),
          el('p', { class: 'lvl__example' }, level.example)),
        level.note ? el('p', { class: 'lvl__note' }, level.note) : null)),

      el('h2', { class: 'guide__h' }, G.readTitle),
      el('ul', { class: 'guide__list' }, G.reading.map(r => el('li', {}, r))),

      el('div', { class: 'guide__source' },
        el('h3', {}, G.sourceTitle),
        el('p', {}, G.source),
        el('p', { class: 'guide__sourcenote' }, G.sourceNote)),

      el('div', { class: 'guide__end' },
        el('button', { class: 'btn', type: 'button', onclick: close }, G.close))));

  document.body.classList.add('is-reading');
  document.body.append(root);
  root.querySelector('.guide__body').scrollTop = 0;

  const onKey = e => {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
  };
  document.addEventListener('keydown', onKey);
}
