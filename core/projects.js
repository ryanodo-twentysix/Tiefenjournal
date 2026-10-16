/**
 * Projekte — die Syntheseebene.
 * Projects — the synthesis layer.
 *
 * Ein Projekt ist kein Befund und keine Aufgabe. Es ist ein Arbeitsschwerpunkt,
 * den die App aus dem gesamten Journal herausliest: ein Spannungsfeld, das oft
 * genug wiederkehrt, um daran zu arbeiten, zusammen mit dem Material, das dafür
 * spricht, und dem psychotherapeutischen Rahmen, an dem es sich messen lässt.
 *
 * A project is neither a finding nor a task. It is a working focus the app reads
 * out of the whole journal: a field of tension that recurs often enough to be
 * worth working on, together with the material that speaks for it and the
 * psychotherapeutic frame it can be held against.
 *
 * Drei Zutaten, die ein Projekt von einer bloßen Statistik unterscheiden:
 *   1. Häufigkeit über Zeit — nicht ein Ausreißer, sondern ein Muster.
 *   2. Bewegung — wird es leichter, schwerer, oder steht es?
 *   3. Rahmen — woran lässt sich das Erleben vergleichend lesen?
 */

import { CONFLICTS, DEFENCES, DOMAINS, LITERATURE } from './themes.js';
import { EMOTION_INDEX } from './emotions.js';

/**
 * Arbeitstitel statt Diagnosebegriffe. „Unterwerfung vs. Kontrolle" beschreibt
 * einen Konflikt; „Deinen Willen zeigen und verbunden bleiben" beschreibt etwas,
 * woran man arbeiten kann. Der Fachbegriff bleibt als Untertitel sichtbar.
 */
const WORKING_TITLES = {
  abhaengigkeit_autonomie: {
    de: 'Nähe zulassen, ohne dich zu verlieren',
    en: 'Letting closeness in without losing yourself',
    askDe: 'Woran merkst du, dass Nähe von wohltuend zu eng kippt?',
    askEn: 'How do you notice closeness tipping from good to tight?'
  },
  unterwerfung_kontrolle: {
    de: 'Deinen Willen zeigen und verbunden bleiben',
    en: 'Showing your will and staying connected',
    askDe: 'Wohin geht die Wut, wenn du nachgibst?',
    askEn: 'Where does the anger go when you give in?'
  },
  versorgung_autarkie: {
    de: 'Etwas brauchen dürfen',
    en: 'Being allowed to need something',
    askDe: 'Was hättest du gebraucht — und was hält dich vom Fragen ab?',
    askEn: 'What would you have needed — and what stops you asking?'
  },
  selbstwert: {
    de: 'Dein Wert, unabhängig von der Leistung',
    en: 'Your worth, apart from what you achieve',
    askDe: 'Woran misst du deinen Wert, und wer hat den Maßstab aufgestellt?',
    askEn: 'By what do you measure your worth, and who set that yardstick?'
  },
  schuld: {
    de: 'Deinen Anteil richtig bemessen',
    en: 'Sizing your share correctly',
    askDe: 'Welcher Teil davon gehört wirklich dir?',
    askEn: 'Which part of this genuinely belongs to you?'
  },
  identitaet: {
    de: 'Weniger Rolle, mehr du',
    en: 'Less role, more you',
    askDe: 'Wo musst du dich am wenigsten verstellen?',
    askEn: 'Where do you have to pretend the least?'
  },
  rivalitaet: {
    de: 'Wollen dürfen, was du willst',
    en: 'Being allowed to want what you want',
    askDe: 'Worauf zeigt der Neid, wenn man ihn als Hinweis liest?',
    askEn: 'What does the envy point at, read as a signal?'
  }
};

/** Welcher Rahmen passt zu welchem Konflikt? */
const FRAMES = {
  abhaengigkeit_autonomie: LITERATURE.attachment,
  unterwerfung_kontrolle: LITERATURE.opd,
  versorgung_autarkie: LITERATURE.attachment,
  selbstwert: LITERATURE.selfCompassion,
  schuld: LITERATURE.defences,
  identitaet: LITERATURE.structure,
  rivalitaet: LITERATURE.ccrt
};

const MIN_ENTRIES = 2;   // darunter ist es ein Ereignis, kein Muster
const MIN_DAYS = 0;

/**
 * Leitet Projekte aus dem gesamten Journal ab.
 * @param {Array} entries  alle Einträge (mit .analysis)
 * @param {object} agg     Ergebnis von aggregate()
 * @param {object} opts    { lang, adopted: string[] }
 */
export function deriveProjects(entries, agg, opts = {}) {
  const lang = opts.lang || 'de';
  const de = lang !== 'en';
  const adopted = new Set(opts.adopted || []);
  const real = entries.filter(e => !e.demo || opts.includeDemo);

  if (!real.length) return [];

  const out = [];

  for (const conflict of CONFLICTS) {
    const matching = real.filter(e =>
      (e.analysis?.conflicts || []).some(c => c.id === conflict.id));
    if (matching.length < MIN_ENTRIES) continue;

    const share = matching.length / real.length;
    const first = matching[0].date;
    const last = matching[matching.length - 1].date;
    const spanDays = daysBetween(first, last);
    if (spanDays < MIN_DAYS) continue;

    // Welche Gefühle begleiten dieses Thema?
    const emoCount = new Map();
    for (const e of matching) {
      for (const f of e.feelings || []) {
        emoCount.set(f.emotionId, (emoCount.get(f.emotionId) || 0) + 1);
      }
    }
    const emotions = [...emoCount.entries()]
      .sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([id, n]) => {
        const m = EMOTION_INDEX.get(id);
        return { id, n, label: m ? (de ? m.de : m.en) : id, hue: m?.hue ?? 210 };
      });

    // In welchen Lebensbereichen zeigt es sich?
    const domains = rankSub(matching, 'domains', DOMAINS, de, 3);

    // Welche Bewältigungsfigur begleitet es?
    const defences = rankSub(matching, 'defences', DEFENCES, de, 2);

    // Bewegt sich etwas? Erste gegen zweite Hälfte der betroffenen Einträge.
    const movement = measureMovement(matching, de);

    // Wiederholungsmarker: spricht dafür, dass es sich alt anfühlt.
    const repeats = matching.filter(e => (e.analysis?.repetition?.score || 0) > 0).length;

    const title = WORKING_TITLES[conflict.id] || { de: conflict.de, en: conflict.en };
    const frame = FRAMES[conflict.id] || LITERATURE.opd;

    // Stärke: Häufigkeit zählt, aber Spannweite und Wiederholung auch —
    // ein Thema über acht Wochen wiegt mehr als dreimal in einer Woche.
    const strength = matching.length * 2
      + Math.min(spanDays / 7, 8)
      + repeats * 1.5
      + share * 6;

    out.push({
      id: `p-${conflict.id}`,
      conflictId: conflict.id,
      adopted: adopted.has(conflict.id),
      title: de ? title.de : title.en,
      frameworkLabel: de ? conflict.de : conflict.en,
      frameworkNote: de ? conflict.noteDe : conflict.noteEn,
      framework: { note: de ? frame.de : frame.en, ref: frame.ref },
      openingQuestion: de ? (title.askDe || '') : (title.askEn || ''),
      evidence: {
        entryCount: matching.length,
        share: Math.round(share * 100),
        firstDate: first,
        lastDate: last,
        spanDays,
        repeats,
        emotions,
        domains,
        defences,
        entryIds: matching.map(e => e.id)
      },
      movement,
      strength: Math.round(strength * 10) / 10
    });
  }

  out.sort((a, b) => (b.adopted - a.adopted) || (b.strength - a.strength));
  return out;
}

function rankSub(entries, key, catalogue, de, limit) {
  const counts = new Map();
  for (const e of entries) {
    for (const item of (e.analysis?.[key] || [])) {
      counts.set(item.id, (counts.get(item.id) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1]).slice(0, limit)
    .map(([id, n]) => {
      const item = catalogue.find(x => x.id === id);
      return { id, n, label: item ? (de ? item.de : item.en) : id };
    });
}

/**
 * Bewegung: vergleicht die Gefühlstönung der frühen mit der späten Hälfte
 * der Einträge zu diesem Thema. Bewusst vorsichtig formuliert — eine
 * Stichprobe von vier Einträgen ist kein Verlauf.
 */
function measureMovement(matching, de) {
  if (matching.length < 4) {
    return {
      direction: 'unklar',
      delta: 0,
      note: de
        ? 'Noch zu wenige Einträge, um von einer Richtung zu sprechen.'
        : 'Still too few entries to speak of a direction.'
    };
  }

  const half = Math.floor(matching.length / 2);
  const early = avg(matching.slice(0, half).map(v));
  const late = avg(matching.slice(half).map(v));
  const delta = late - early;

  let direction = 'stabil';
  if (delta >= 0.15) direction = 'leichter';
  else if (delta <= -0.15) direction = 'schwerer';

  const notes = {
    leichter: de
      ? `Die Tönung rund um dieses Thema hat sich aufgehellt (${fmt(early)} → ${fmt(late)}). Das heißt nicht, dass es gelöst ist — aber etwas bewegt sich.`
      : `The tone around this theme has brightened (${fmt(early)} → ${fmt(late)}). That does not mean it is solved — but something is moving.`,
    schwerer: de
      ? `Die Tönung rund um dieses Thema hat sich eingetrübt (${fmt(early)} → ${fmt(late)}). Das ist ein Grund, genauer hinzusehen, kein Grund zur Sorge.`
      : `The tone around this theme has darkened (${fmt(early)} → ${fmt(late)}). A reason to look closer, not a reason to worry.`,
    stabil: de
      ? `Die Tönung bleibt ähnlich (${fmt(early)} → ${fmt(late)}). Themen halten sich oft lange, bevor sie kippen.`
      : `The tone stays similar (${fmt(early)} → ${fmt(late)}). Themes often hold for a long time before they shift.`
  };

  return { direction, delta: Math.round(delta * 100) / 100, early, late, note: notes[direction] };

  function v(e) { return e.analysis?.affect?.valence ?? 0; }
}

function avg(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function fmt(n) {
  const s = Math.abs(n).toFixed(2);
  return n < 0 ? `−${s}` : `+${s}`;
}

function daysBetween(a, b) {
  return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
}

/* ══════════════════════════════════════════════════════════
 * Ziele — die Ebene unter dem Projekt
 * ══════════════════════════════════════════════════════════
 *
 * Ein Projekt ist ein Spannungsfeld; ein Ziel ist etwas, das du daran tun
 * willst. Die App schlägt Projekte vor, aber sie formuliert keine Ziele —
 * ein Ziel, das nicht von dir stammt, ist eine Hausaufgabe.
 *
 * Absichtlich ohne Fristen und ohne Fortschrittsbalken: beides macht aus
 * einem Vorhaben eine Schuld, sobald es nicht klappt. Ein Ziel ist offen
 * oder erledigt, und erledigt darf auch wieder offen werden.
 */

export function makeGoal({ projectId, title, note = '' }) {
  return {
    id: `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    projectId,
    title: String(title || '').trim().slice(0, 120),
    note: String(note || '').trim().slice(0, 400),
    createdAt: new Date().toISOString(),
    doneAt: null
  };
}

export function goalsFor(projectId, goals) {
  return (goals || [])
    .filter(g => g.projectId === projectId)
    .sort((a, b) => (a.doneAt ? 1 : 0) - (b.doneAt ? 1 : 0)
      || a.createdAt.localeCompare(b.createdAt));
}

/**
 * Anregungen, keine Ziele. Halbe Sätze, die der Schreibende zu Ende bringt —
 * so bleibt die Formulierung bei ihm.
 */
const GOAL_STARTERS = {
  abhaengigkeit_autonomie: {
    de: ['Einmal sagen, dass mir das zu nah ist, statt mich zurückzuziehen',
         'Bemerken, an welchem Punkt ich anfange, Abstand zu brauchen'],
    en: ['Say once that this is too close, instead of withdrawing',
         'Notice the point where I start needing distance']
  },
  unterwerfung_kontrolle: {
    de: ['Einmal widersprechen, wo ich sonst nachgebe',
         'Nach einem Nachgeben aufschreiben, wohin die Wut gegangen ist'],
    en: ['Contradict once where I usually give in',
         'After giving in, write down where the anger went']
  },
  versorgung_autarkie: {
    de: ['Einmal um etwas bitten, ohne es zu begründen',
         'Bemerken, wann ich „ich brauche niemanden" denke'],
    en: ['Ask for something once without justifying it',
         'Notice when I think "I need no one"']
  },
  selbstwert: {
    de: ['Einen Tag lang nicht vergleichen',
         'Aufschreiben, wessen Maßstab ich gerade benutze'],
    en: ['Go a day without comparing',
         'Write down whose yardstick I am using']
  },
  schuld: {
    de: ['Bei einem Vorwurf den Anteil aufteilen, der wirklich meiner ist',
         'Einmal nicht vorauseilend entschuldigen'],
    en: ['With a reproach, separate out the share that is genuinely mine',
         'Once, not apologise pre-emptively']
  },
  identitaet: {
    de: ['Einen Ort suchen, an dem ich mich nicht verstellen muss',
         'Bemerken, welche Rolle ich gerade trage'],
    en: ['Find a place where I do not have to pretend',
         'Notice which role I am carrying']
  },
  rivalitaet: {
    de: ['Beim Neid nachsehen, worauf er zeigt',
         'Einmal aussprechen, was ich eigentlich will'],
    en: ['With envy, look at what it points to',
         'Say out loud once what I actually want']
  }
};

export function goalStarters(conflictId, lang = 'de') {
  const set = GOAL_STARTERS[conflictId];
  if (!set) return [];
  return lang === 'en' ? set.en : set.de;
}

/**
 * Kurzfassung für den Dialog: was das Journal über dieses Projekt weiß,
 * in einem Absatz, den der Fragenmotor zitieren kann.
 */
export function projectBriefing(project, lang = 'de') {
  if (!project) return null;
  const de = lang !== 'en';
  const ev = project.evidence;

  const emo = ev.emotions.map(e => e.label).join(', ');
  const dom = ev.domains.map(d => d.label).join(', ');

  return de
    ? `„${project.title}" zieht sich durch ${ev.entryCount} Einträge (${ev.share} %), von ${ev.firstDate} bis ${ev.lastDate}.`
      + (emo ? ` Begleitet wird es meist von ${emo}.` : '')
      + (dom ? ` Es zeigt sich vor allem in: ${dom}.` : '')
      + (ev.repeats ? ` In ${ev.repeats} dieser Einträge benutzt du Wiederholungsmarker — die Situation fühlt sich nicht neu an.` : '')
    : `"${project.title}" runs through ${ev.entryCount} entries (${ev.share}%), from ${ev.firstDate} to ${ev.lastDate}.`
      + (emo ? ` It is usually accompanied by ${emo}.` : '')
      + (dom ? ` It shows up mainly in: ${dom}.` : '')
      + (ev.repeats ? ` In ${ev.repeats} of those you use repetition markers — the situation does not feel new.` : '');
}
