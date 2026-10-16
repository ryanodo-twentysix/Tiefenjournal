/**
 * Auswertungsansichten.
 * Read-out views.
 *
 * Zwei Renderer, bewusst getrennt:
 *
 *   renderSynthesis — was sich zusammenfügen lässt: Lebensbereiche,
 *                     Zuschreibung, Beobachtungen. Gehört nach oben, weil es
 *                     Bedeutung trägt statt Zahlen.
 *
 *   renderMetrics   — die Zählwerte, samt Einordnung und Warnhinweisen.
 *                     Gehört weiter unten hin: eine Zahl über das eigene
 *                     Fühlen sollte nichts sein, worauf man zuerst stößt.
 *
 * Bewusst KEINE Verlaufsdiagramme. Eine fallende Stimmungskurve ist kein
 * neutrales Bild — sie ist eine Rückmeldung, die das verstärken kann, was sie
 * misst. Der Verlauf steht als Satz in den Beobachtungen, wo er eingeordnet
 * werden kann, nicht als Linie, die für sich spricht.
 *
 * Deliberately NO trend charts. A falling mood line is not a neutral picture —
 * it is feedback that can reinforce what it measures.
 */

import { LEVELS, METRIC_CAVEATS, defenceDef, VAILLANT_REF } from './defence-reference.js';

/* ══════════════ Synthese ══════════════ */

export function renderSynthesis(root, data, ctx) {
  const { t, lang, el } = ctx;
  const de = lang !== 'en';
  const label = x => de ? x.de : x.en;

  if (!data.entryCount) return;

  // Beobachtungen, die keine Affektzahlen sind — die gehören zu den Metriken.
  const insights = (data.insights || []).filter(i => i.kind !== 'trend');
  if (insights.length) {
    root.append(block(el, t('patterns.observations'), null,
      insights.map(i => el('div', { class: `note note--${i.kind}` },
        el('div', {},
          el('p', {}, i.text),
          i.literature ? el('p', { class: 'note__lit' }, i.literature) : null)))));
  }

  if (data.domains.length) {
    root.append(block(el, t('patterns.domains'), t('patterns.domainsNote'),
      [barList(el, data.domains.slice(0, 8), label, t, {})]));
  }

  if (data.attribution.length) {
    root.append(block(el, t('patterns.attribution'), t('patterns.attributionNote'),
      [barList(el, data.attribution, label, t, {})]));
  }
}

/* ══════════════ Metriken ══════════════ */

/**
 * @param ctx.openDefence   id der aufgeklappten Definition (oder null)
 * @param ctx.onDefence     Callback zum Auf-/Zuklappen
 */
export function renderMetrics(root, data, ctx) {
  const { t, lang, el } = ctx;
  const de = lang !== 'en';
  const label = x => de ? x.de : x.en;

  if (!data.entryCount) {
    root.append(el('div', { class: 'blank' },
      el('h3', {}, t('patterns.empty')),
      el('p', {}, t('patterns.emptyBody'))));
    return;
  }

  // Vorwarnung vor den Zahlen, nicht dahinter.
  root.append(el('div', { class: 'warn warn--info' },
    el('h3', {}, t('metrics.careTitle')),
    el('p', {}, t('metrics.careBody'))));

  root.append(el('div', { class: 'stats' },
    stat(el, data.entryCount, t('patterns.entries'),
      data.firstDate ? `${data.firstDate} → ${data.lastDate}` : ''),
    stat(el, data.stats.distinctEmotions, t('patterns.vocab'), t('patterns.vocabNote')),
    stat(el, data.stats.streak, t('patterns.streak'), t('patterns.streakNote')),
    stat(el, `${Math.round((data.stats.ambivalentShare || 0) * 100)} %`,
      t('patterns.ambivalence'), t('metrics.ambivalenceNote')),
    stat(el, data.stats.avgWords, t('metrics.words'), t('metrics.wordsNote')),
    stat(el, data.emotions.length ? data.emotions[0][de ? 'de' : 'en'] : '–',
      t('metrics.mostNamed'), t('metrics.mostNamedNote'))
  ));

  const trend = (data.insights || []).find(i => i.kind === 'trend');
  if (trend) {
    root.append(block(el, t('metrics.courseTitle'), t('metrics.courseNote'),
      [el('div', { class: 'note' }, el('div', {}, el('p', {}, trend.text)))]));
  }

  if (data.emotions.length) {
    root.append(block(el, t('patterns.emotions'), t('metrics.emotionsNote'),
      [emotionBars(el, data.emotions.slice(0, 12), de)]));
  }

  if (data.defences.length) root.append(defenceBlock(data, ctx));

  if (data.cooccurrence.length) {
    root.append(block(el, t('patterns.coupling'), t('patterns.couplingIntro'),
      [el('div', { class: 'co' },
        data.cooccurrence.slice(0, 8).map(c => el('div', { class: 'co__i' },
          el('b', {}, c.emotionLabel),
          el('span', { class: 'muted' }, '↔'),
          el('span', {}, c.conflictLabel),
          el('span', {}, `${c.count}×`))))]));
  }

  // Die Warnhinweise am Ende noch einmal vollständig.
  root.append(el('div', { class: 'warn' },
    el('h3', {}, t('metrics.caveatsTitle')),
    el('ul', {}, (METRIC_CAVEATS[de ? 'de' : 'en']).map(c => el('li', {}, c)))));
}

/* ══════════════ Abwehrprofil mit Einordnung ══════════════ */

function defenceBlock(data, ctx) {
  const { t, lang, el } = ctx;
  const de = lang !== 'en';
  const b = data.stats.defenceBalance || {};
  const box = el('div', { class: 'block' });

  box.append(el('div', { class: 'block__head' },
    el('h2', {}, t('patterns.defences')),
    el('p', { class: 'block__sub' }, t('metrics.defencesIntro'))));

  if (b.total) {
    box.append(el('div', { class: 'levels' },
      b.reif ? el('div', { class: 'lv-reif', style: `flex:${b.reif}` },
        pct(b.reif, b.total) > 15 ? t('patterns.mature') : '') : null,
      b.neurotisch ? el('div', { class: 'lv-neurotisch', style: `flex:${b.neurotisch}` },
        pct(b.neurotisch, b.total) > 15 ? t('patterns.neurotic') : '') : null,
      b.unreif ? el('div', { class: 'lv-unreif', style: `flex:${b.unreif}` },
        pct(b.unreif, b.total) > 15 ? t('patterns.immature') : '') : null));

    // Was die drei Ebenen überhaupt heißen — direkt unter dem Balken.
    const key = el('div', { class: 'levelkey' });
    for (const id of ['reif', 'neurotisch', 'unreif']) {
      const info = de ? LEVELS[id].de : LEVELS[id].en;
      key.append(el('div', { class: `levelkey__i levelkey__i--${id}` },
        el('b', {}, `${info.label} · ${info.roman}`),
        el('span', {}, info.text)));
    }
    box.append(key);
  }

  // Der Weg zur ausführlichen Erklärung steht direkt bei der Einstufung,
  // nicht irgendwo in den Einstellungen.
  if (ctx.onGuide) {
    box.append(el('button', {
      class: 'btn btn--tiny', type: 'button', style: 'margin-bottom:12px',
      onclick: () => ctx.onGuide()
    }, t('metrics.explainLevels')));
  }

  box.append(el('p', { class: 'muted', style: 'font-size:.78rem;margin:2px 0 14px' },
    t('metrics.tapForDef')));

  const label = x => de ? x.de : x.en;
  const max = Math.max(...data.defences.map(d => d.score), 1);
  const list = el('div', { class: 'bars' });

  for (const d of data.defences.slice(0, 10)) {
    const open = ctx.openDefence === d.id;
    const def = defenceDef(d.id, lang);

    const row = el('div', { class: 'bar bar--tappable' },
      el('button', {
        class: 'bar__l bar__l--btn', type: 'button',
        'aria-expanded': open ? 'true' : 'false',
        onclick: () => ctx.onDefence?.(open ? null : d.id)
      }, label(d), el('span', { class: 'bar__caret' }, open ? '−' : '?')),
      el('span', { class: 'bar__n' }, `${t('patterns.entriesShort', d.entryCount)} · ${d.score}`),
      el('div', { class: 'bar__t' },
        el('div', { class: `bar__f bar__f--${d.level}`, style: `width:${(d.score / max * 100).toFixed(1)}%` })));

    if (open && def) {
      row.append(el('div', { class: 'def' },
        el('p', { class: 'def__text' }, def.text),
        def.levelInfo ? el('p', { class: 'def__level' },
          el('b', {}, `${def.levelInfo.label} (${def.levelInfo.roman}): `), def.levelInfo.text) : null,
        def.note ? el('p', { class: 'def__note' }, def.note) : null,
        el('p', { class: 'def__ref' },
          def.source === 'adapted' ? t('metrics.notVaillant') : (def.ref || VAILLANT_REF))));
    }

    list.append(row);
  }

  box.append(list);
  return box;
}

/* ══════════════ Bausteine ══════════════ */

function block(el, title, sub, children) {
  return el('div', { class: 'block' },
    el('div', { class: 'block__head' },
      el('h2', {}, title),
      sub ? el('p', { class: 'block__sub' }, sub) : null),
    children);
}

function stat(el, value, label, note) {
  return el('div', { class: 'stat' },
    el('div', { class: 'stat__v' }, String(value)),
    el('div', { class: 'stat__l' }, label),
    note ? el('div', { class: 'stat__n' }, note) : null);
}

function barList(el, items, label, t, opts) {
  const max = Math.max(...items.map(i => i.score), 1);
  return el('div', { class: 'bars' },
    items.map(i => el('div', { class: 'bar' },
      el('span', { class: 'bar__l' }, label(i)),
      el('span', { class: 'bar__n' }, `${t('patterns.entriesShort', i.entryCount)} · ${i.score}`),
      el('div', { class: 'bar__t' },
        el('div', { class: 'bar__f', style: `width:${(i.score / max * 100).toFixed(1)}%` })),
      opts.showTerms && i.topTerms?.length
        ? el('div', {
            class: 'bar__terms',
            html: i.topTerms.slice(0, 4)
              .map(([term, n]) => `<code>${escapeHtml(term)}</code>${n > 1 ? `×${n}` : ''}`).join(' ')
          })
        : null
    )));
}

function emotionBars(el, items, de) {
  const max = Math.max(...items.map(i => i.count), 1);
  return el('div', { class: 'bars' },
    items.map(i => el('div', { class: 'bar' },
      el('span', { class: 'bar__l' }, de ? i.de : i.en),
      el('span', { class: 'bar__n' }, `${i.count}× · ⌀${i.avgIntensity.toFixed(1)}`),
      el('div', { class: 'bar__t' },
        el('div', {
          class: 'bar__f',
          style: `width:${(i.count / max * 100).toFixed(1)}%;background:hsl(${i.hue} 26% 58%)`
        }))
    )));
}

function pct(part, total) {
  return total ? (part / total) * 100 : 0;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
