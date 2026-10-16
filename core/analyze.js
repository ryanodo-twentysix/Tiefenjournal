/**
 * Analyse-Engine: quantifiziert Themen, Abwehr, Attribution und Verlauf.
 * Analysis engine: quantifies themes, defences, attribution and trends.
 *
 * Arbeitet vollständig offline und deterministisch (Lexikon + Regeln).
 * Runs fully offline and deterministically (lexicon + rules).
 */

import {
  CONFLICTS, DEFENCES, DOMAINS, REPETITION_MARKERS, ATTRIBUTION,
  CRISIS_MARKERS, buildMatcher, LITERATURE
} from './themes.js';
import { EMOTION_INDEX } from './emotions.js';

/* --- Matcher einmalig kompilieren / compile matchers once --- */
const COMPILED = {
  conflicts: CONFLICTS.map(c => ({ ...c, matcher: buildMatcher(c.terms) })),
  defences: DEFENCES.map(d => ({ ...d, matcher: buildMatcher(d.terms) })),
  domains: DOMAINS.map(d => ({ ...d, matcher: buildMatcher(d.terms) })),
  repetition: buildMatcher(REPETITION_MARKERS),
  attribution: ATTRIBUTION.map(a => ({ ...a, matcher: buildMatcher(a.terms) }))
};

/**
 * Version des Analyseverfahrens. Hochzählen, sobald sich Lexikon oder Regeln
 * ändern — gespeicherte Einträge werden dann beim nächsten Laden neu bewertet.
 * Ohne das trüge ein alter Eintrag für immer die Marker von damals.
 *
 * Bump whenever lexicon or rules change; stored entries are then re-scored on
 * the next load. Without it, an old entry would carry its original markers forever.
 */
export const ANALYSIS_VERSION = 4;

/** Braucht dieser Eintrag eine frische Auswertung? */
export function needsReanalysis(entry) {
  return !entry?.analysis || entry.analysis.version !== ANALYSIS_VERSION;
}

function normalise(text) {
  return (text || '').toLowerCase().replace(/\s+/g, ' ');
}

/** Zählt Treffer einer Matcherliste; gibt Score und gefundene Begriffe zurück. */
function score(text, matcher) {
  let total = 0;
  const hits = [];
  for (const m of matcher) {
    const found = text.match(m.re);
    if (found && found.length) {
      total += found.length * m.weight;
      hits.push({ term: m.term, count: found.length });
    }
  }
  return { score: total, hits: hits.sort((a, b) => b.count - a.count).slice(0, 8) };
}

/** Der gesamte auswertbare Text eines Eintrags. */
export function entryText(entry) {
  const parts = [];
  for (const f of entry.feelings || []) if (f.because) parts.push(f.because);
  if (entry.freeText) parts.push(entry.freeText);
  if (entry.transcript) parts.push(entry.transcript);
  return parts.join('\n');
}

/** Nur die "weil"-Teile — hier steckt die Kausalzuschreibung. */
export function becauseText(entry) {
  return (entry.feelings || []).map(f => f.because || '').join('\n');
}

/**
 * Analysiert einen einzelnen Eintrag.
 * Wird beim Speichern berechnet und im Eintrag mitgeschrieben,
 * damit Auswertungen später reproduzierbar sind.
 */
export function analyseEntry(entry) {
  const full = normalise(entryText(entry));
  const because = normalise(becauseText(entry));

  const conflicts = COMPILED.conflicts
    .map(c => ({ id: c.id, de: c.de, en: c.en, ...score(full, c.matcher) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const defences = COMPILED.defences
    .map(d => ({ id: d.id, de: d.de, en: d.en, level: d.level, ...score(full, d.matcher) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const domains = COMPILED.domains
    .map(d => ({ id: d.id, de: d.de, en: d.en, ...score(full, d.matcher) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const attribution = COMPILED.attribution
    .map(a => ({ id: a.id, de: a.de, en: a.en, ...score(because, a.matcher) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const repetition = score(full, COMPILED.repetition);

  // Affektprofil aus den gewählten Emotionen
  const chosen = (entry.feelings || [])
    .map(f => ({ meta: EMOTION_INDEX.get(f.emotionId), intensity: f.intensity || 3 }))
    .filter(x => x.meta);

  const weightSum = chosen.reduce((s, c) => s + c.intensity, 0) || 1;
  const valence = chosen.reduce((s, c) => s + c.meta.v * c.intensity, 0) / weightSum;
  const arousal = chosen.reduce((s, c) => s + c.meta.a * c.intensity, 0) / weightSum;

  const families = [...new Set(chosen.map(c => c.meta.familyId))];

  // Granularität: verschiedene Familien bei mehreren Gefühlen = differenzierteres Erleben
  const granularity = chosen.length ? families.length / chosen.length : 0;

  // Ambivalenz: gleichzeitig deutlich positive und negative Gefühle
  const hasPos = chosen.some(c => c.meta.v > 0.25);
  const hasNeg = chosen.some(c => c.meta.v < -0.25);

  const wordCount = full.split(/\s+/).filter(Boolean).length;

  return {
    version: ANALYSIS_VERSION,
    computedAt: new Date().toISOString(),
    conflicts,
    defences,
    domains,
    attribution,
    repetition: { score: repetition.score, hits: repetition.hits },
    affect: {
      valence: round(valence),
      arousal: round(arousal),
      families,
      granularity: round(granularity),
      ambivalent: hasPos && hasNeg
    },
    wordCount,
    crisis: CRISIS_MARKERS.some(m => full.includes(m))
  };
}

function round(n) {
  return Math.round(n * 1000) / 1000;
}

/* ------------------------------------------------------------------ *
 * AGGREGATION ÜBER ZEIT / AGGREGATION OVER TIME
 * ------------------------------------------------------------------ */

/**
 * Baut das Gesamtbild über eine Menge von Einträgen.
 * Liefert Zeitreihen, Ranglisten, Ko-Vorkommen und erkannte Muster.
 */
export function aggregate(entries, opts = {}) {
  const lang = opts.lang || 'de';
  const list = [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const counters = {
    conflicts: new Map(),
    defences: new Map(),
    domains: new Map(),
    emotions: new Map(),
    families: new Map(),
    attribution: new Map()
  };

  const series = [];           // pro Eintrag: Datum, Valenz, Arousal
  const daily = new Map();     // Datum -> { valence[], count }
  const monthly = new Map();   // YYYY-MM -> { conflicts: Map, count, valence[] }
  const coEmotionTheme = new Map(); // "emotionId|themeId" -> count
  const repetitionEntries = [];
  let ambivalentCount = 0;
  let granularitySum = 0;
  let wordSum = 0;
  let audioCount = 0;

  for (const e of list) {
    const a = e.analysis || analyseEntry(e);
    const month = e.date.slice(0, 7);

    bump(counters.conflicts, a.conflicts, e);
    bump(counters.defences, a.defences, e);
    bump(counters.domains, a.domains, e);
    bump(counters.attribution, a.attribution, e);

    for (const f of e.feelings || []) {
      const meta = EMOTION_INDEX.get(f.emotionId);
      if (!meta) continue;
      const rec = counters.emotions.get(f.emotionId) || {
        id: f.emotionId, count: 0, intensitySum: 0, de: meta.de, en: meta.en,
        familyId: meta.familyId, hue: meta.hue, dates: []
      };
      rec.count += 1;
      rec.intensitySum += f.intensity || 3;
      rec.dates.push(e.date);
      counters.emotions.set(f.emotionId, rec);

      const fam = counters.families.get(meta.familyId) || {
        id: meta.familyId, count: 0, de: meta.familyDe, en: meta.familyEn, hue: meta.hue
      };
      fam.count += 1;
      counters.families.set(meta.familyId, fam);

      // Ko-Vorkommen Emotion x Grundkonflikt
      for (const c of a.conflicts.slice(0, 2)) {
        const key = `${f.emotionId}|${c.id}`;
        coEmotionTheme.set(key, (coEmotionTheme.get(key) || 0) + 1);
      }
    }

    series.push({
      id: e.id, date: e.date, at: e.createdAt,
      valence: a.affect.valence, arousal: a.affect.arousal,
      topConflict: a.conflicts[0]?.id || null
    });

    const d = daily.get(e.date) || { date: e.date, valence: [], arousal: [], count: 0 };
    d.valence.push(a.affect.valence);
    d.arousal.push(a.affect.arousal);
    d.count += 1;
    daily.set(e.date, d);

    const m = monthly.get(month) || { month, count: 0, valence: [], conflicts: new Map(), defences: new Map() };
    m.count += 1;
    m.valence.push(a.affect.valence);
    for (const c of a.conflicts) m.conflicts.set(c.id, (m.conflicts.get(c.id) || 0) + c.score);
    for (const x of a.defences) m.defences.set(x.id, (m.defences.get(x.id) || 0) + x.score);
    monthly.set(month, m);

    if (a.repetition.score > 0) {
      repetitionEntries.push({ id: e.id, date: e.date, score: a.repetition.score, hits: a.repetition.hits });
    }
    if (a.affect.ambivalent) ambivalentCount += 1;
    granularitySum += a.affect.granularity;
    wordSum += a.wordCount;
    if (e.audio) audioCount += 1;
  }

  const toRanked = map => [...map.values()]
    .sort((a, b) => b.score - a.score || b.entryCount - a.entryCount);

  const emotions = [...counters.emotions.values()]
    .map(r => ({ ...r, avgIntensity: round(r.intensitySum / r.count) }))
    .sort((a, b) => b.count - a.count);

  const dailyOut = [...daily.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(d => ({
      date: d.date,
      count: d.count,
      valence: round(avg(d.valence)),
      arousal: round(avg(d.arousal))
    }));

  const monthlyOut = [...monthly.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(m => ({
      month: m.month,
      count: m.count,
      valence: round(avg(m.valence)),
      topConflicts: [...m.conflicts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
        .map(([id, s]) => ({ id, score: s, label: labelOf(CONFLICTS, id, lang) })),
      topDefences: [...m.defences.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
        .map(([id, s]) => ({ id, score: s, label: labelOf(DEFENCES, id, lang) }))
    }));

  const cooccurrence = [...coEmotionTheme.entries()]
    .map(([key, count]) => {
      const [emotionId, conflictId] = key.split('|');
      const meta = EMOTION_INDEX.get(emotionId);
      return {
        emotionId, conflictId, count,
        emotionLabel: meta ? (lang === 'en' ? meta.en : meta.de) : emotionId,
        conflictLabel: labelOf(CONFLICTS, conflictId, lang)
      };
    })
    .filter(c => c.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const conflicts = toRanked(counters.conflicts);
  const defences = toRanked(counters.defences);
  const domains = toRanked(counters.domains);
  const attribution = toRanked(counters.attribution);

  const defenceBalance = summariseDefenceLevels(defences);

  return {
    generatedAt: new Date().toISOString(),
    lang,
    entryCount: list.length,
    audioCount,
    firstDate: list[0]?.date || null,
    lastDate: list[list.length - 1]?.date || null,
    conflicts, defences, domains, attribution,
    emotions,
    families: [...counters.families.values()].sort((a, b) => b.count - a.count),
    series, daily: dailyOut, monthly: monthlyOut,
    cooccurrence,
    repetitionEntries: repetitionEntries.sort((a, b) => b.score - a.score).slice(0, 20),
    stats: {
      avgValence: round(avg(series.map(s => s.valence))),
      avgArousal: round(avg(series.map(s => s.arousal))),
      avgGranularity: list.length ? round(granularitySum / list.length) : 0,
      avgWords: list.length ? Math.round(wordSum / list.length) : 0,
      ambivalentShare: list.length ? round(ambivalentCount / list.length) : 0,
      streak: currentStreak(dailyOut),
      distinctEmotions: emotions.length,
      defenceBalance
    },
    insights: deriveInsights({ conflicts, defences, domains, emotions, attribution, cooccurrence, repetitionEntries, dailyOut, monthlyOut, series, lang, stats: { defenceBalance } })
  };
}

function bump(map, items, entry) {
  for (const it of items) {
    const rec = map.get(it.id) || {
      id: it.id, de: it.de, en: it.en, level: it.level,
      score: 0, entryCount: 0, dates: [], terms: new Map()
    };
    rec.score += it.score;
    rec.entryCount += 1;
    rec.dates.push(entry.date);
    for (const h of it.hits || []) rec.terms.set(h.term, (rec.terms.get(h.term) || 0) + h.count);
    map.set(it.id, rec);
  }
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function labelOf(collection, id, lang) {
  const item = collection.find(x => x.id === id);
  if (!item) return id;
  return lang === 'en' ? item.en : item.de;
}

function summariseDefenceLevels(defences) {
  const buckets = { reif: 0, neurotisch: 0, unreif: 0 };
  for (const d of defences) if (buckets[d.level] !== undefined) buckets[d.level] += d.score;
  const total = buckets.reif + buckets.neurotisch + buckets.unreif;
  if (!total) return { ...buckets, total: 0, mature: 0 };
  return {
    ...buckets,
    total,
    mature: round(buckets.reif / total)
  };
}

function currentStreak(dailyOut) {
  if (!dailyOut.length) return 0;
  const dates = new Set(dailyOut.map(d => d.date));
  let streak = 0;
  const cursor = new Date();
  // Erlaubt, dass heute noch nichts geschrieben wurde
  if (!dates.has(isoDate(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (dates.has(isoDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/* ------------------------------------------------------------------ *
 * MUSTERERKENNUNG / PATTERN DETECTION
 * Formuliert Beobachtungen als Hypothesen, nie als Befunde.
 * ------------------------------------------------------------------ */

function deriveInsights(ctx) {
  const { lang } = ctx;
  const de = lang !== 'en';
  const out = [];
  const min = 3; // unter drei Einträgen wird nichts behauptet

  const totalEntries = ctx.series.length;
  if (totalEntries < min) {
    out.push({
      kind: 'info',
      text: de
        ? `Noch ${min - totalEntries} Eintrag/Einträge bis zur ersten Musterauswertung. Muster brauchen Wiederholung, sonst wird Zufall zur Erzählung.`
        : `${min - totalEntries} more entr(y/ies) until the first pattern read-out. Patterns need repetition, otherwise coincidence turns into narrative.`
    });
    return out;
  }

  // 1. Dominanter Grundkonflikt
  const c0 = ctx.conflicts[0];
  if (c0 && c0.entryCount >= Math.max(2, Math.ceil(totalEntries * 0.25))) {
    const share = Math.round((c0.entryCount / totalEntries) * 100);
    out.push({
      kind: 'conflict',
      themeId: c0.id,
      text: de
        ? `„${c0.de}" taucht in ${c0.entryCount} von ${totalEntries} Einträgen auf (${share} %). Das ist das Spannungsfeld, um das dein Schreiben aktuell am häufigsten kreist.`
        : `"${c0.en}" appears in ${c0.entryCount} of ${totalEntries} entries (${share}%). This is the field of tension your writing currently circles most often.`,
      literature: LITERATURE.opd.ref
    });
  }

  // 2. Wiederholungsmarker
  if (ctx.repetitionEntries.length >= 2) {
    const topTerms = [...new Set(ctx.repetitionEntries.flatMap(r => r.hits.map(h => h.term)))].slice(0, 4);
    out.push({
      kind: 'repetition',
      text: de
        ? `In ${ctx.repetitionEntries.length} Einträgen benutzt du Wiederholungsmarker wie „${topTerms.join('", „')}". Solche Formulierungen zeigen an, dass eine Situation nicht als neu, sondern als bekannt erlebt wird.`
        : `In ${ctx.repetitionEntries.length} entries you use repetition markers such as "${topTerms.join('", "')}". Such phrasings indicate a situation is experienced not as new but as familiar.`,
      literature: LITERATURE.ccrt.ref
    });
  }

  // 3. Attributionsmuster
  const attrTotal = ctx.attribution.reduce((s, a) => s + a.score, 0);
  const attrTop = ctx.attribution[0];
  if (attrTop && attrTotal > 0) {
    const share = Math.round((attrTop.score / attrTotal) * 100);
    if (share >= 50) {
      out.push({
        kind: 'attribution',
        text: de
          ? `Deine „weil"-Begründungen zeigen ${share} % in Richtung ${attrTop.de}. ${attrTop.id === 'selbst' ? 'Ein hoher Selbstanteil kann Verantwortungsübernahme sein — oder ein strenges Über-Ich, das alles zu sich zieht.' : attrTop.id === 'andere' ? 'Ein hoher Außenanteil schützt den Selbstwert, verlagert aber auch die Handlungsmacht nach außen.' : 'Umstände als Hauptgrund halten die Spannung aus dem Beziehungsraum heraus.'}`
          : `Your "because" clauses point ${share}% toward ${attrTop.en}. ${attrTop.id === 'selbst' ? 'A high self-share can mean taking responsibility — or a strict super-ego pulling everything toward itself.' : attrTop.id === 'andere' ? 'A high external share protects self-worth but also relocates agency outward.' : 'Circumstances as the main reason keep the tension out of the relational space.'}`,
        literature: LITERATURE.selfCompassion.ref
      });
    }
  }

  // 4. Abwehrprofil
  const d0 = ctx.defences[0];
  if (d0 && d0.entryCount >= 2) {
    const item = DEFENCES.find(x => x.id === d0.id);
    out.push({
      kind: 'defence',
      themeId: d0.id,
      text: de
        ? `Häufigste Bewältigungsfigur: „${d0.de}" (${d0.entryCount} Einträge). ${item?.noteDe || ''}`
        : `Most frequent coping figure: "${d0.en}" (${d0.entryCount} entries). ${item?.noteEn || ''}`,
      literature: LITERATURE.defences.ref
    });
  }
  const balance = ctx.stats?.defenceBalance;
  if (balance && balance.total > 6 && balance.mature >= 0.3) {
    out.push({
      kind: 'resource',
      text: de
        ? `${Math.round(balance.mature * 100)} % deiner erkannten Bewältigungsmuster gehören zu den reifen Formen (Humor, Mentalisieren, Sublimierung). Das ist eine Ressource, keine Nebensache.`
        : `${Math.round(balance.mature * 100)}% of the coping patterns detected fall into the mature forms (humour, mentalising, sublimation). That is a resource, not a footnote.`,
      literature: LITERATURE.mentalizing.ref
    });
  }

  // 5. Emotion x Konflikt Kopplung
  const co = ctx.cooccurrence[0];
  if (co && co.count >= 3) {
    out.push({
      kind: 'coupling',
      text: de
        ? `„${co.emotionLabel}" und „${co.conflictLabel}" treten ${co.count}-mal zusammen auf. Wenn ein Gefühl sich verlässlich an ein Thema heftet, lohnt die Frage, was davon zuerst da war.`
        : `"${co.emotionLabel}" and "${co.conflictLabel}" occur together ${co.count} times. When a feeling reliably attaches to a theme, it is worth asking which came first.`,
      literature: LITERATURE.eft.ref
    });
  }

  // 6. Verlauf der Valenz
  if (ctx.dailyOut.length >= 6) {
    const half = Math.floor(ctx.dailyOut.length / 2);
    const early = avg(ctx.dailyOut.slice(0, half).map(d => d.valence));
    const late = avg(ctx.dailyOut.slice(half).map(d => d.valence));
    const delta = late - early;
    if (Math.abs(delta) >= 0.15) {
      out.push({
        kind: 'trend',
        text: de
          ? `Die durchschnittliche Gefühlstönung hat sich über den Zeitraum ${delta > 0 ? 'aufgehellt' : 'eingetrübt'} (${early.toFixed(2)} → ${late.toFixed(2)} auf einer Skala von −1 bis +1).`
          : `Average affective tone has ${delta > 0 ? 'brightened' : 'darkened'} across the period (${early.toFixed(2)} → ${late.toFixed(2)} on a −1 to +1 scale).`
      });
    }
  }

  // 7. Granularität als Ressource
  const gran = ctx.emotions.length;
  if (gran >= 12) {
    out.push({
      kind: 'resource',
      text: de
        ? `Du hast bisher ${gran} verschiedene Gefühlsbegriffe benutzt. Diese Differenzierung ist selbst ein Wirkfaktor: genauer benennen heißt besser regulieren.`
        : `You have used ${gran} distinct feeling words so far. That differentiation is itself an active ingredient: naming more precisely means regulating better.`,
      literature: LITERATURE.granularity.ref
    });
  }

  // 8. Blinder Fleck: Lebensbereich, der auffällig fehlt
  const namedDomains = new Set(ctx.domains.map(d => d.id));
  const missing = DOMAINS.filter(d => !namedDomains.has(d.id));
  if (missing.length && totalEntries >= 8 && missing.length <= 6) {
    out.push({
      kind: 'absence',
      text: de
        ? `Nicht vorgekommen in deinen Einträgen: ${missing.map(m => m.de).join(', ')}. Abwesenheit ist kein Befund — manchmal ist dort nichts los, manchmal ist es das, worüber sich schwer schreiben lässt.`
        : `Absent from your entries: ${missing.map(m => m.en).join(', ')}. Absence is not a finding — sometimes nothing is happening there, sometimes it is what is hard to write about.`
    });
  }

  return out;
}
