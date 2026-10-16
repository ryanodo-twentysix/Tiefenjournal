/**
 * Aussehen: Farbpalette und Form der Flächen.
 *
 * Jede Palette ist ein Paar Komplementärfarben auf demselben Grundgerüst wie
 * das Original: eine Farbe für alles, was du tust (Eingabe, Auswahl,
 * Navigation), die gegenüberliegende für alles, was wächst (Themen, Bereiche,
 * Widersprüche). Die Bedeutung bleibt, nur der Ton ändert sich. Alle Paare
 * halten für Text auf farbigen Knöpfen mindestens 4,5 : 1 Kontrast.
 *
 * Gemerkt wird im localStorage, nicht in der Datenbank: Das Aussehen muss
 * stehen, bevor irgendetwas geladen ist, sonst blitzt beim Öffnen die
 * Ausgangsfarbe auf.
 */

const LOOK_KEY = 'tiefenjournal.look';

export const PALETTES = [
  { id: 'salbei',  de: 'Taube & Salbei',      en: 'Dove & Sage',        a: '#5b8aa6', b: '#6d9077', paper: '#f7f3e8' },
  { id: 'ocker',   de: 'Indigo & Ocker',      en: 'Indigo & Ochre',     a: '#5865a8', b: '#b58a3c', paper: '#f7f3e8' },
  { id: 'koralle', de: 'Petrol & Koralle',    en: 'Teal & Coral',       a: '#3a8a8c', b: '#d27a62', paper: '#f6f4ee' },
  { id: 'pflaume', de: 'Pflaume & Lindgrün',  en: 'Plum & Lime',        a: '#87639e', b: '#8d9e45', paper: '#f7f4ef' },
  { id: 'nacht',   de: 'Nacht & Bernstein',   en: 'Night & Amber',      a: '#7fa6d6', b: '#e0a458', paper: '#181b20', dark: true }
];

export const SHAPES = [
  { id: 'weich',  de: 'Weich',       en: 'Soft' },
  { id: 'rund',   de: 'Rund',        en: 'Round' },
  { id: 'kantig', de: 'Kantig',      en: 'Crisp' },
  { id: 'blatt',  de: 'Blatt',       en: 'Leaf' },
  { id: 'blase',  de: 'Sprechblase', en: 'Speech bubble' }
];

const TEXT = {
  de: {
    title: 'Optionen', palette: 'Farbpalette', shape: 'Formen',
    paletteHint: 'Je zwei Gegenfarben: eine für das, was du tust, eine für das, was wächst.',
    shapeHint: 'Die Form der Karten, Knöpfe und Sprechblasen.',
    walk: 'Rundgang noch einmal', close: 'Schließen'
  },
  en: {
    title: 'Options', palette: 'Colour palette', shape: 'Shapes',
    paletteHint: 'Two opposite colours each: one for what you do, one for what grows.',
    shapeHint: 'The shape of cards, buttons and speech bubbles.',
    walk: 'Take the tour again', close: 'Close'
  }
};

export function readLook() {
  let look = {};
  try { look = JSON.parse(localStorage.getItem(LOOK_KEY) || '{}') || {}; } catch { /* Standard */ }
  return {
    palette: PALETTES.some(p => p.id === look.palette) ? look.palette : 'salbei',
    shape: SHAPES.some(s => s.id === look.shape) ? look.shape : 'weich'
  };
}

export function applyLook(look = readLook()) {
  const root = document.documentElement;
  root.dataset.palette = look.palette;
  root.dataset.shape = look.shape;
  const dark = PALETTES.find(p => p.id === look.palette)?.dark;
  root.style.colorScheme = dark ? 'dark' : 'light';
}

function saveLook(look) {
  try { localStorage.setItem(LOOK_KEY, JSON.stringify(look)); } catch { /* gilt dann nur bis zum Schließen */ }
  applyLook(look);
}

/**
 * Das Optionsmenü hinter den drei Punkten. Ein kleines Blatt unter der
 * Kopfleiste, kein Modal: Die App bleibt dahinter sichtbar, damit man die
 * Wirkung einer Farbe sofort sieht.
 */
export function initOptions({ button, panel, el, lang, onWalk }) {
  const close = () => {
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
  };

  const paint = () => {
    const tx = TEXT[lang()] || TEXT.de;
    const en = lang() === 'en';
    const look = readLook();
    panel.textContent = '';
    panel.setAttribute('aria-label', tx.title);

    panel.append(el('p', { class: 'opts__h' }, tx.palette),
      el('p', { class: 'opts__d' }, tx.paletteHint));
    const swatches = el('div', { class: 'opts__swatches', role: 'radiogroup', 'aria-label': tx.palette });
    for (const p of PALETTES) {
      swatches.append(el('button', {
        type: 'button', role: 'radio', class: 'swatch' + (p.id === look.palette ? ' on' : ''),
        'aria-checked': p.id === look.palette ? 'true' : 'false',
        onclick: () => { saveLook({ ...readLook(), palette: p.id }); paint(); }
      },
        el('span', { class: 'swatch__dots', style: `background:${p.paper}` },
          el('i', { style: `background:${p.a}` }), el('i', { style: `background:${p.b}` })),
        el('span', { class: 'swatch__n' }, en ? p.en : p.de)));
    }
    panel.append(swatches);

    panel.append(el('p', { class: 'opts__h' }, tx.shape),
      el('p', { class: 'opts__d' }, tx.shapeHint));
    const shapes = el('div', { class: 'opts__shapes', role: 'radiogroup', 'aria-label': tx.shape });
    for (const s of SHAPES) {
      shapes.append(el('button', {
        type: 'button', role: 'radio', class: 'shapebtn' + (s.id === look.shape ? ' on' : ''),
        'aria-checked': s.id === look.shape ? 'true' : 'false',
        onclick: () => { saveLook({ ...readLook(), shape: s.id }); paint(); }
      },
        el('span', { class: `shapebtn__p shapebtn__p--${s.id}`, 'aria-hidden': 'true' }),
        el('span', {}, en ? s.en : s.de)));
    }
    panel.append(shapes);

    panel.append(el('div', { class: 'opts__row' },
      el('button', { class: 'btn btn--tiny', type: 'button', onclick: () => { close(); onWalk(); } }, tx.walk),
      el('button', { class: 'btn btn--tiny', type: 'button', onclick: close }, tx.close)));
  };

  button.addEventListener('click', ev => {
    ev.stopPropagation();
    if (!panel.hidden) { close(); return; }
    paint();
    panel.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    panel.querySelector('.on')?.focus();
  });
  // composedPath statt contains: Eine Wahl zeichnet das Menü neu, und der
  // angeklickte Knopf hängt dann schon nicht mehr darin.
  document.addEventListener('click', ev => {
    if (!panel.hidden && !ev.composedPath().includes(panel) && ev.target !== button) close();
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && !panel.hidden) { close(); button.focus(); }
  });

  return { close };
}
