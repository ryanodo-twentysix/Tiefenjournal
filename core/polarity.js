/**
 * Gegensätze — zwei Seiten desselben Themas.
 * Opposites — two sides of the same subject.
 *
 * ZUR SPRACHE, WEIL SIE HIER ALLES ENTSCHEIDET
 *
 * Diese Auswertung zeigt einem Menschen, wo er sich im eigenen Text
 * widerspricht. Das kann verletzen. Deshalb gelten hier strengere Regeln als
 * im Rest der App:
 *
 *   1. Gesagt wird, was im TEXT steht — nie, wie die Person IST.
 *      „In diesen Einträgen steht X, in jenen Y." Nicht: „Du willst X, aber Y."
 *
 *   2. Kein Ratgeberton. Kein „spannend", kein „vielleicht lohnt es sich",
 *      kein Hinweis, was man damit machen sollte. Das Material steht da;
 *      was es bedeutet, entscheidet der Mensch, nicht das Programm.
 *
 *   3. Kein Wort, das ein Urteil trägt: nicht „Widerspruch", nicht
 *      „inkonsequent", nicht „unbewusst". „Gegensatz" beschreibt zwei
 *      Richtungen, ohne eine davon falsch zu nennen.
 *
 *   4. Der Ausweg steht immer dabei: Zwei Seiten im Text sind kein Fehler.
 *      Menschen wollen gleichzeitig Verschiedenes, empfinden zu verschiedenen
 *      Zeiten verschieden und verhalten sich in verschiedenen Lagen anders.
 *
 *   5. Nichts davon erscheint ungefragt. Es ist abgeschaltet, bis jemand es
 *      einschaltet.
 *
 * On language, because here it decides everything: this read-out shows a person
 * where their own text pulls in two directions. That can hurt. So: describe the
 * text, never the person; no advice register; no word that carries a verdict;
 * always state that two sides are not an error; and never show it unasked.
 */

import { buildMatcher } from './themes.js';

/**
 * Jede Achse hat ein Thema und zwei Richtungen. Die Richtungen sind bewusst
 * als Verhalten formuliert („Nähe suchen"), nicht als Eigenschaft
 * („anhänglich") — Verhalten kann man ändern, Eigenschaften klingen endgültig.
 */
export const POLARITIES = [
  {
    id: 'naehe',
    subject: { de: 'Nähe', en: 'Closeness' },
    a: {
      de: 'Nähe gesucht', en: 'reaching for closeness',
      terms: [
        { t: 'vermisse', w: 2 }, { t: 'sehnsucht', w: 2 }, { t: 'sehne mich', w: 2 },
        { t: 'brauche ihn', w: 2 }, { t: 'brauche sie', w: 2 }, { t: 'nicht allein sein', w: 2 },
        { t: 'gemeldet', w: 1 }, { t: 'näher', w: 1 }, { t: 'umarm*', w: 2 },
        { t: 'geborgen', w: 2 }, { t: 'zusammen sein', w: 2 }, { t: 'gebraucht werden', w: 2 },
        { t: 'missed', w: 2 }, { t: 'longing', w: 2 }, { t: 'reached out', w: 2 },
        { t: 'need him', w: 2 }, { t: 'need her', w: 2 }, { t: 'need them', w: 2 },
        { t: 'not be alone', w: 2 }, { t: 'closer', w: 1 }, { t: 'held', w: 1 }
      ]
    },
    b: {
      de: 'Nähe abgewehrt', en: 'holding closeness off',
      terms: [
        { t: 'zurückgezog*', w: 2 }, { t: 'abstand', w: 2 }, { t: 'zu nah', w: 2 },
        { t: 'eingeengt', w: 2 }, { t: 'erdrückt', w: 2 }, { t: 'ruhe haben', w: 2 },
        { t: 'allein sein wollen', w: 2 }, { t: 'nicht gemeldet', w: 2 },
        { t: 'abgesagt', w: 1 }, { t: 'melde mich nicht', w: 2 }, { t: 'luft brauchen', w: 2 },
        { t: 'withdrew', w: 2 }, { t: 'withdrawn', w: 2 }, { t: 'distance', w: 2 },
        { t: 'too close', w: 2 }, { t: 'suffocating', w: 2 }, { t: 'needed space', w: 2 },
        { t: 'did not reach out', w: 2 }, { t: 'cancelled', w: 1 }, { t: 'kept to myself', w: 2 }
      ]
    }
  },

  {
    id: 'brauchen',
    subject: { de: 'Angewiesensein', en: 'Needing' },
    a: {
      de: 'etwas gebraucht', en: 'needing something',
      terms: [
        { t: 'gebraucht hätte', w: 2 }, { t: 'hätte gebraucht', w: 2 }, { t: 'um hilfe', w: 2 },
        { t: 'bedürftig', w: 2 }, { t: 'brauche', w: 1 }, { t: 'unterstützung', w: 2 },
        { t: 'nicht schaffen', w: 2 }, { t: 'überfordert', w: 1 },
        { t: 'needed help', w: 2 }, { t: 'asked for help', w: 2 }, { t: 'i needed', w: 2 },
        { t: 'support', w: 1 }, { t: 'could not manage', w: 2 }, { t: 'overwhelmed', w: 1 }
      ]
    },
    b: {
      de: 'ohne andere ausgekommen', en: 'managing without',
      terms: [
        { t: 'brauche niemanden', w: 2 }, { t: 'keine hilfe', w: 2 }, { t: 'alleine geschafft', w: 2 },
        { t: 'alleine durch', w: 2 }, { t: 'niemanden belasten', w: 2 }, { t: 'für mich behalten', w: 2 },
        { t: 'selbst schaffen', w: 2 }, { t: 'komme klar', w: 2 },
        { t: 'need no one', w: 2 }, { t: 'on my own', w: 2 }, { t: 'managed alone', w: 2 },
        { t: 'burden anyone', w: 2 }, { t: 'kept it to myself', w: 2 }, { t: 'self-sufficient', w: 2 }
      ]
    }
  },

  {
    id: 'behaupten',
    subject: { de: 'Der eigene Wille', en: 'Your own will' },
    a: {
      de: 'nachgegeben', en: 'giving way',
      terms: [
        { t: 'nachgegeben', w: 2 }, { t: 'nachgeb*', w: 1 }, { t: 'klein beigegeben', w: 2 },
        { t: 'nichts gesagt', w: 2 }, { t: 'nichts sagen', w: 2 }, { t: 'zugestimmt', w: 1 },
        { t: 'mitgemacht', w: 1 }, { t: 'zurückgesteckt', w: 2 }, { t: 'nicht nein', w: 2 },
        { t: 'gave in', w: 2 }, { t: 'backed down', w: 2 }, { t: 'said nothing', w: 2 },
        { t: 'went along with', w: 2 }, { t: 'could not say no', w: 2 }
      ]
    },
    b: {
      de: 'widersprochen', en: 'pushing back',
      terms: [
        { t: 'widersproch*', w: 2 }, { t: 'durchgesetzt', w: 2 }, { t: 'nein gesagt', w: 2 },
        { t: 'gewehrt', w: 2 }, { t: 'abgegrenzt', w: 2 }, { t: 'gesagt, was ich', w: 2 },
        { t: 'standgehalten', w: 2 }, { t: 'bestanden auf', w: 2 },
        { t: 'spoke up', w: 2 }, { t: 'stood my ground', w: 2 }, { t: 'said no', w: 2 },
        { t: 'pushed back', w: 2 }, { t: 'insisted', w: 2 }, { t: 'boundaried', w: 2 }
      ]
    }
  },

  {
    id: 'selbstbild',
    subject: { de: 'Der Blick auf dich', en: 'How you see yourself' },
    a: {
      de: 'abwertend über dich', en: 'writing yourself down',
      terms: [
        { t: 'ich bin so dumm', w: 2 }, { t: 'versagt', w: 2 }, { t: 'nicht gut genug', w: 2 },
        { t: 'typisch ich', w: 2 }, { t: 'wertlos', w: 2 }, { t: 'peinlich', w: 1 },
        { t: 'schäme mich', w: 2 }, { t: 'mein fehler', w: 2 }, { t: 'zu viel', w: 1 },
        { t: 'hasse mich', w: 2 }, { t: 'unfähig', w: 2 },
        { t: 'so stupid', w: 2 }, { t: 'failure', w: 2 }, { t: 'not good enough', w: 2 },
        { t: 'typical me', w: 2 }, { t: 'worthless', w: 2 }, { t: 'ashamed', w: 2 },
        { t: 'my fault', w: 2 }, { t: 'hate myself', w: 2 }
      ]
    },
    b: {
      de: 'anerkennend über dich', en: 'crediting yourself',
      terms: [
        { t: 'stolz auf mich', w: 2 }, { t: 'stolz', w: 1 }, { t: 'geschafft', w: 1 },
        { t: 'gut gemacht', w: 2 }, { t: 'zufrieden mit mir', w: 2 }, { t: 'tatsächlich', w: 1 },
        { t: 'zum ersten mal', w: 2 }, { t: 'gelungen', w: 2 }, { t: 'selbstwirksam', w: 2 },
        { t: 'proud', w: 1 }, { t: 'managed to', w: 2 }, { t: 'for the first time', w: 2 },
        { t: 'pleased with myself', w: 2 }, { t: 'actually did', w: 2 }
      ]
    }
  },

  {
    id: 'verantwortung',
    subject: { de: 'Wo die Ursache liegt', en: 'Where the cause sits' },
    a: {
      de: 'bei dir gesucht', en: 'placed with you',
      terms: [
        { t: 'meine schuld', w: 2 }, { t: 'mein fehler', w: 2 }, { t: 'hätte ich', w: 2 },
        { t: 'selbst schuld', w: 2 }, { t: 'ich habe es', w: 1 }, { t: 'an mir', w: 2 },
        { t: 'my fault', w: 2 }, { t: 'should have', w: 2 }, { t: 'on me', w: 2 },
        { t: 'because of me', w: 2 }
      ]
    },
    b: {
      de: 'bei anderen gesucht', en: 'placed with others',
      terms: [
        { t: 'er hat', w: 1 }, { t: 'sie hat', w: 1 }, { t: 'die anderen', w: 2 },
        { t: 'niemand hat', w: 2 }, { t: 'man hat mir', w: 2 }, { t: 'wurde ich', w: 1 },
        { t: 'seine schuld', w: 2 }, { t: 'ihre schuld', w: 2 }, { t: 'immer die', w: 2 },
        { t: 'they never', w: 2 }, { t: 'nobody', w: 1 }, { t: 'his fault', w: 2 },
        { t: 'her fault', w: 2 }, { t: 'their fault', w: 2 }, { t: 'no one ever', w: 2 }
      ]
    }
  },

  {
    id: 'andere',
    subject: { de: 'Der Blick auf andere', en: 'How you see others' },
    a: {
      de: 'erhöhend', en: 'raising them up',
      terms: [
        { t: 'bewunder*', w: 2 }, { t: 'der beste', w: 2 }, { t: 'die beste', w: 2 },
        { t: 'unglaublich gut', w: 2 }, { t: 'perfekt', w: 1 }, { t: 'dankbar für', w: 1 },
        { t: 'admire', w: 2 }, { t: 'the best', w: 2 }, { t: 'amazing', w: 1 }
      ]
    },
    b: {
      de: 'abwertend', en: 'writing them off',
      terms: [
        { t: 'lächerlich', w: 2 }, { t: 'erbärmlich', w: 2 }, { t: 'inkompetent', w: 2 },
        { t: 'nichts wert', w: 2 }, { t: 'egal was', w: 1 }, { t: 'überschätzt', w: 2 },
        { t: 'pathetic', w: 2 }, { t: 'ridiculous', w: 2 }, { t: 'incompetent', w: 2 },
        { t: 'overrated', w: 2 }
      ]
    }
  },

  {
    id: 'zeigen',
    subject: { de: 'Was gesagt wird', en: 'What gets said' },
    a: {
      de: 'ausgesprochen', en: 'spoken out',
      terms: [
        { t: 'gesagt', w: 1 }, { t: 'angesprochen', w: 2 }, { t: 'erzählt', w: 1 },
        { t: 'geredet', w: 1 }, { t: 'zugegeben', w: 2 }, { t: 'offen gesagt', w: 2 },
        { t: 'told', w: 1 }, { t: 'brought it up', w: 2 }, { t: 'talked about', w: 2 },
        { t: 'admitted', w: 2 }
      ]
    },
    b: {
      de: 'für dich behalten', en: 'kept in',
      terms: [
        { t: 'nicht gesagt', w: 2 }, { t: 'nicht angesprochen', w: 2 }, { t: 'verschwiegen', w: 2 },
        { t: 'für mich behalten', w: 2 }, { t: 'runtergeschluckt', w: 2 }, { t: 'niemandem erzählt', w: 2 },
        { t: 'did not say', w: 2 }, { t: 'did not bring it up', w: 2 }, { t: 'kept it in', w: 2 },
        { t: 'swallowed it', w: 2 }, { t: 'told no one', w: 2 }
      ]
    }
  }
];

const COMPILED = POLARITIES.map(p => ({
  ...p,
  matchA: buildMatcher(p.a.terms),
  matchB: buildMatcher(p.b.terms)
}));

function textOf(entry) {
  const parts = [];
  for (const f of entry.feelings || []) if (f.because) parts.push(f.because);
  if (entry.freeText) parts.push(entry.freeText);
  return parts.join('\n').toLowerCase();
}

/**
 * Verneinungen, die dem folgenden Ausdruck den Sinn umdrehen.
 * „nicht nein gesagt" ist das Gegenteil von „nein gesagt" — und auf einer
 * Achse, die Gegensätze zeigt, landet so ein Satz sonst auf der falschen
 * Seite. Das wäre hier besonders schlimm: Der Zweck ist, Widersprüche zu
 * zeigen, also darf die Auswertung keine erfinden.
 */
const NEGATORS = [
  'nicht', 'nichts', 'kein', 'keine', 'keinen', 'keinem', 'keiner',
  'nie', 'niemals', 'ohne', 'kaum', 'statt',
  'not', 'no', 'never', 'nothing', 'without', 'barely', 'instead of',
  'cannot', "can't", 'could not', "couldn't", 'did not', "didn't",
  'do not', "don't", 'was not', "wasn't", 'is not', "isn't"
];

// Steht unmittelbar vor der Fundstelle eine Verneinung?
const NEGATED = new RegExp(`(?:${NEGATORS.map(n => n.replace(/'/g, "['’]")).join('|')})\\s+(?:\\S+\\s+){0,1}$`, 'iu');

function isNegated(text, index) {
  return NEGATED.test(text.slice(Math.max(0, index - 26), index));
}

function score(text, matcher) {
  let total = 0;
  for (const m of matcher) {
    m.re.lastIndex = 0;
    for (const hit of text.matchAll(m.re)) {
      if (isNegated(text, hit.index)) continue;
      total += m.weight;
    }
  }
  return total;
}

/** Ein Zitat, das die Seite belegt — aus den eigenen Worten, nie zusammengefasst. */
function quoteFrom(entry, matcher) {
  const candidates = [
    ...(entry.feelings || []).map(f => f.because).filter(Boolean),
    entry.freeText
  ].filter(Boolean);

  let best = null;
  let bestScore = 0;
  for (const line of candidates) {
    const s = score(line.toLowerCase(), matcher);
    if (s > bestScore) { bestScore = s; best = line; }
  }
  if (!best) return null;
  return { date: entry.date, text: best.length > 170 ? best.slice(0, 169) + '…' : best };
}

/**
 * Sucht Achsen, auf denen beide Seiten im Journal vorkommen.
 *
 * @param entries   alle Einträge
 * @param opts      { lang, minPerSide }
 */
export function findPolarities(entries, { lang = 'de', minPerSide = 2, includeDemo = true } = {}) {
  const de = lang !== 'en';
  const pool = entries.filter(e => includeDemo || !e.demo);
  if (pool.length < 4) return [];

  const out = [];

  for (const p of COMPILED) {
    const sideA = [];
    const sideB = [];
    const overlap = [];

    for (const entry of pool) {
      const text = textOf(entry);
      if (!text) continue;
      const a = score(text, p.matchA);
      const b = score(text, p.matchB);
      // Ein Eintrag kann beide Seiten enthalten — dann zählt er für beide.
      if (a > 0) sideA.push({ entry, weight: a });
      if (b > 0) sideB.push({ entry, weight: b });
      // …und genau dann gehört er in die Schnittmenge.
      if (a > 0 && b > 0) overlap.push({ entry, weight: Math.min(a, b) });
    }

    if (sideA.length < minPerSide || sideB.length < minPerSide) continue;

    const quotesA = sideA
      .sort((x, y) => y.weight - x.weight).slice(0, 2)
      .map(x => quoteFrom(x.entry, p.matchA)).filter(Boolean);
    const quotesB = sideB
      .sort((x, y) => y.weight - x.weight).slice(0, 2)
      .map(x => quoteFrom(x.entry, p.matchB)).filter(Boolean);

    if (!quotesA.length || !quotesB.length) continue;

    const total = sideA.length + sideB.length;

    out.push({
      id: p.id,
      subject: de ? p.subject.de : p.subject.en,
      a: {
        label: de ? p.a.de : p.a.en,
        count: sideA.length,
        share: Math.round((sideA.length / total) * 100),
        quotes: quotesA
      },
      b: {
        label: de ? p.b.de : p.b.en,
        count: sideB.length,
        share: Math.round((sideB.length / total) * 100),
        quotes: quotesB
      },
      regions: regionsOf(sideA, sideB, overlap, p),
      // Wie ausgeglichen? 1 = beide Seiten gleich stark, 0 = einseitig.
      balance: Math.round((1 - Math.abs(sideA.length - sideB.length) / total) * 100) / 100,
      entryCount: new Set([...sideA, ...sideB].map(x => x.entry.id)).size
    });
  }

  // Die ausgeglichensten zuerst: dort stehen beide Seiten wirklich nebeneinander.
  return out.sort((x, y) => y.balance - x.balance || y.entryCount - x.entryCount);
}

/**
 * Die drei Felder einer Achse: nur die eine Seite, nur die andere, und beide
 * im selben Eintrag.
 *
 * Das mittlere Feld ist das eigentlich interessante und war bisher nicht
 * sichtbar. Es ist keine Deutung, sondern eine Auszählung: Einträge, in denen
 * beide Richtungen nebeneinander stehen. Wo ein einzelner SATZ beide trägt,
 * wird das eigens vermerkt — das ist der dichteste Beleg dafür, dass zweierlei
 * gleichzeitig möglich war.
 */
function regionsOf(sideA, sideB, overlap, p) {
  const idsA = new Set(sideA.map(x => x.entry.id));
  const idsB = new Set(sideB.map(x => x.entry.id));
  const bothIds = new Set([...idsA].filter(id => idsB.has(id)));

  const pairs = overlap
    .sort((x, y) => y.weight - x.weight)
    .slice(0, 3)
    .map(({ entry }) => {
      const fromA = quoteFrom(entry, p.matchA);
      const fromB = quoteFrom(entry, p.matchB);
      if (!fromA || !fromB) return null;
      const sameLine = fromA.text === fromB.text;
      return { date: entry.date, sameLine, a: fromA.text, b: sameLine ? null : fromB.text };
    })
    .filter(Boolean);

  return {
    onlyA: [...idsA].filter(id => !idsB.has(id)).length,
    onlyB: [...idsB].filter(id => !idsA.has(id)).length,
    both: bothIds.size,
    // Ein einzelner Satz, der beides trägt — falls es ihn gibt.
    sameLine: pairs.filter(q => q.sameLine).length,
    quotes: pairs
  };
}

/**
 * Der Rahmentext. Steht immer über den Achsen, nie darunter — wer die Zahlen
 * zuerst liest, liest sie sonst als Befund.
 */
export const FRAMING = {
  de: {
    title: 'Gegensätze im Text',
    intro: 'Manche Themen kommen in deinen Einträgen von zwei Seiten vor. Hier stehen beide Seiten nebeneinander, belegt mit dem, was du geschrieben hast.',
    caveat: 'Zwei Seiten im Text sind kein Widerspruch im Leben. Menschen wollen gleichzeitig Verschiedenes, empfinden zu verschiedenen Zeiten verschieden und verhalten sich in verschiedenen Lagen anders. Ob hier etwas zusammengehört, weißt nur du.',
    method: 'Gezählt werden Formulierungen, nicht Absichten. Ein Eintrag kann auf beiden Seiten stehen.',
    entriesOn: n => `${n} ${n === 1 ? 'Eintrag' : 'Einträge'}`,
    show: 'Gegensätze zeigen',
    hide: 'Gegensätze ausblenden',
    empty: 'Noch keine Achse, auf der beide Seiten vorkommen.',
    emptyHint: 'Dafür braucht es mehrere Einträge, in denen dasselbe Thema in verschiedene Richtungen geht.'
  },
  en: {
    title: 'Two sides in the text',
    intro: 'Some subjects appear in your entries from two directions. Both sides stand here side by side, evidenced by what you wrote.',
    caveat: 'Two sides in a text are not a contradiction in a life. People want different things at once, feel differently at different times, and act differently in different situations. Whether these belong together is yours to say.',
    method: 'Phrasings are counted, not intentions. One entry can appear on both sides.',
    entriesOn: n => `${n} ${n === 1 ? 'entry' : 'entries'}`,
    show: 'Show the two sides',
    hide: 'Hide',
    empty: 'No axis yet where both sides appear.',
    emptyHint: 'That needs several entries in which the same subject runs in different directions.'
  }
};
