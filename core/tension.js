/**
 * Spannungsfelder — die Themen als Bild, mit ihren Gegensätzen darin.
 * Fields of tension — the themes as a picture, with their opposites inside.
 *
 * WAS HIER ANDERS IST ALS IN polarity.js
 *
 * polarity.js zählt Richtungen und stellt sie nebeneinander. Hier kommt das
 * Feld dazwischen dazu: die Einträge, in denen BEIDE Richtungen vorkommen.
 * Das ist die eigentliche Auskunft. Zwei Seiten getrennt nebeneinander liest
 * man als Widerspruch; dieselben zwei Seiten mit ihrer Schnittmenge liest man
 * als etwas, das schon zusammen dagestanden hat.
 *
 * WARUM NICHT AUFLÖSEN
 *
 * Die naheliegende Reaktion auf einen Widerspruch ist, eine Seite fallen zu
 * lassen — Festinger hat genau das als Regelfall beschrieben. Diese Ansicht
 * tut das Gegenteil: Sie hält beide Seiten sichtbar und zeigt, wo sie sich
 * überschneiden. Das folgt zwei Linien, die unabhängig voneinander zum selben
 * Schluss kommen: entwicklungspsychologisch (Kegan: Zunahme an Komplexität
 * heißt, Gegensätze halten zu können, statt sich zu entscheiden) und
 * psychoanalytisch (Klein: der Schritt von der Spaltung in gut/böse zur
 * Integration beider in ein Objekt).
 *
 * ZUR SPRACHE
 *
 * Es gelten die Regeln aus polarity.js, und eine zusätzliche: Die Sätze im
 * Abschnitt „dazwischen" sind ANGEBOTE, keine Befunde. Ein Programm, das
 * jemandem seinen Glaubenssatz mitteilt, liegt entweder falsch oder trifft —
 * und beides ist ungefragt zu viel. Deshalb stehen sie als Auswahl da, deshalb
 * gilt „keiner davon" als vollwertige Antwort, und deshalb steht die
 * Zuordnung immer beim Menschen.
 */

import { findPolarities } from './polarity.js';

/**
 * Welche Achse gehört zu welchem Thema?
 *
 * Die sieben Grundkonflikte der OPD und die sieben Achsen dieser App stehen
 * eins zu eins zueinander — nicht zufällig: Beide beschreiben dasselbe Feld,
 * die einen als Konflikt, die anderen als zwei beobachtbare Richtungen im Text.
 */
export const THEME_AXIS = {
  abhaengigkeit_autonomie: 'naehe',
  versorgung_autarkie: 'brauchen',
  unterwerfung_kontrolle: 'behaupten',
  selbstwert: 'selbstbild',
  schuld: 'verantwortung',
  identitaet: 'zeigen',
  rivalitaet: 'andere'
};

/**
 * Der Blurb: was dieses Feld überhaupt ist. Beschreibt das FELD, nicht den
 * Menschen — deshalb steht hier nichts über „deine" Einträge. Was in den
 * Einträgen steht, sagen die Zahlen und die Zitate darunter.
 */
export const FIELD_BLURBS = {
  abhaengigkeit_autonomie: {
    de: 'Manchmal fehlt dir Nähe, manchmal ist sie dir zu viel. Das kann dieselbe Person betreffen, in derselben Woche. Beides ist echt.',
    en: 'Sometimes you miss closeness, sometimes it is too much. That can be about the same person, in the same week. Both are real.'
  },
  versorgung_autarkie: {
    de: 'Hilfe brauchen und allein klarkommen — du kannst beides. Wer immer nur eins davon übt, verlernt mit der Zeit das andere.',
    en: 'Needing help and managing alone — you can do both. Practise only one and you slowly lose the other.'
  },
  unterwerfung_kontrolle: {
    de: 'Nachgeben und widersprechen sind zwei Antworten auf dieselbe Sorge: Was passiert zwischen uns, wenn ich sage, was ich will?',
    en: 'Giving in and pushing back are two answers to the same worry: what happens between us if I say what I want?'
  },
  selbstwert: {
    de: 'Hart mit dir und zufrieden mit dir — beides steht in deinen Einträgen. Nur fast nie im selben Satz.',
    en: 'Hard on yourself and pleased with yourself — both are in your entries. Just almost never in the same sentence.'
  },
  schuld: {
    de: 'Mal gibst du dir die Schuld, mal den anderen. Meistens liegt dein Anteil irgendwo dazwischen.',
    en: 'Sometimes you blame yourself, sometimes the others. Usually your share sits somewhere in between.'
  },
  identitaet: {
    de: 'Was du sagst und was du für dich behältst, kommt von derselben Person. Beides schützt etwas.',
    en: 'What you say and what you keep to yourself come from the same person. Both protect something.'
  },
  rivalitaet: {
    de: 'Jemanden bewundern und jemanden kleinreden sind zwei Arten, denselben Vergleich auszuhalten.',
    en: 'Looking up to someone and talking them down are two ways of bearing the same comparison.'
  }
};

/**
 * Die Sätze dazwischen.
 *
 * Ein Gegensatz fühlt sich nur dann unvereinbar an, wenn eine Regel dazwischen
 * steht, die beides zugleich verbietet. Solche Regeln haben in der kognitiven
 * Therapie einen Namen und eine feste Form — „wenn …, dann …" (Beck).
 *
 * Sie stehen hier in der Ich-Form, weil sie so klingen, wenn man sie bei sich
 * findet. Sie sind trotzdem keine Aussage über den Leser: Die Oberfläche muss
 * sie als Angebot zeigen, aus dem man auch nichts wählen kann.
 */
export const CONDITIONALS = {
  naehe: {
    de: ['Wenn ich jemanden nah heranlasse, verliere ich mich selbst.',
         'Wenn ich Abstand brauche, verliere ich die Person.'],
    en: ['If I let someone close, I lose myself.',
         'If I need distance, I lose the person.']
  },
  brauchen: {
    de: ['Wenn ich etwas brauche, falle ich zur Last.',
         'Wenn ich allein zurechtkomme, fragt irgendwann niemand mehr.'],
    en: ['If I need something, I become a burden.',
         'If I manage alone, eventually nobody asks any more.']
  },
  behaupten: {
    de: ['Wenn ich sage, was ich will, geht die Verbindung kaputt.',
         'Wenn ich nachgebe, zählt das, was ich will, nicht.'],
    en: ['If I say what I want, the bond breaks.',
         'If I give way, what I want does not count.']
  },
  selbstbild: {
    de: ['Wenn ich etwas an mir gelten lasse, werde ich nachlässig.',
         'Wenn ich streng mit mir bin, bleibe ich brauchbar.'],
    en: ['If I let something about myself stand, I get careless.',
         'If I stay hard on myself, I stay usable.']
  },
  verantwortung: {
    de: ['Wenn es nicht an mir liegt, kann ich auch nichts ändern.',
         'Wenn ich mir alles zuschreibe, bleibe ich handlungsfähig.'],
    en: ['If it is not down to me, there is nothing I can change either.',
         'If I attribute everything to myself, I stay able to act.']
  },
  zeigen: {
    de: ['Wenn ich zeige, wie es mir geht, wird es gegen mich verwendet.',
         'Wenn ich nichts sage, bleibe ich unangreifbar.'],
    en: ['If I show how I am, it gets used against me.',
         'If I say nothing, I stay unassailable.']
  },
  andere: {
    de: ['Wenn jemand gut ist, bin ich weniger wert.',
         'Wenn ich jemanden kleiner mache, halte ich den Vergleich aus.'],
    en: ['If someone is good, I am worth less.',
         'If I make someone smaller, I can bear the comparison.']
  }
};

/**
 * Die Literatur zu diesem Bild. Jede Stelle trägt genau eine Aussage, und
 * jede steht dort, wo sie etwas erklärt — nicht als Bibliografie am Ende.
 */
export const TENSION_LIT = {
  mixed: {
    ref: 'Larsen, J. T., McGraw, A. P. & Cacioppo, J. T. (2001). Can people feel happy and sad at the same time? Journal of Personality and Social Psychology, 81(4), 684–696.',
    de: 'Gegenläufige Gefühle können gleichzeitig auftreten und wurden auch so gemessen. Dass sich zwei Richtungen ausschließen, ist eine Annahme — kein Befund.',
    en: 'Opposing feelings can occur at the same time, and have been measured that way. That two directions exclude each other is an assumption — not a finding.'
  },
  holding: {
    ref: 'Kegan, R. (1994). In Over Our Heads: The Mental Demands of Modern Life. Harvard University Press.',
    de: 'Entwicklung zeigt sich nicht darin, sich zwischen zwei Seiten zu entscheiden, sondern darin, beide zugleich denken zu können, ohne eine davon aufzugeben.',
    en: 'Development shows itself not in choosing between two sides, but in being able to hold both at once without giving either up.'
  },
  integration: {
    ref: 'Klein, M. (1946). Notes on some schizoid mechanisms. International Journal of Psycho-Analysis, 27, 99–110. / Ogden, T. (1986). The Matrix of the Mind.',
    de: 'Das Aufteilen in ganz gut und ganz schlecht ist der ältere Umgang mit Widersprüchlichem; beides in einer Person zusammenzuhalten, ist der spätere.',
    en: 'Splitting into all-good and all-bad is the earlier way of handling contradiction; holding both in one person is the later one.'
  },
  conditional: {
    ref: 'Beck, J. S. (2011). Cognitive Behavior Therapy: Basics and Beyond (2. Aufl.). Guilford Press.',
    de: 'Zwischen zwei Seiten steht oft eine Regel in der Form „wenn …, dann …". Sie ist der Grund, warum sich beides gegenseitig auszuschließen scheint.',
    en: 'Between two sides there is often a rule of the form "if …, then …". It is the reason both appear to rule each other out.'
  },
  complexity: {
    ref: 'Linville, P. W. (1987). Self-complexity as a cognitive buffer against stress-related illness and depression. Journal of Personality and Social Psychology, 52(4), 663–676.',
    de: 'Mehrere, auch gegenläufige Seiten des Selbst zu haben, wirkte in dieser Untersuchung eher schützend als belastend.',
    en: 'Having several, including opposing, sides of the self worked out as protective rather than burdensome in this research.'
  },
  dissonance: {
    ref: 'Festinger, L. (1957). A Theory of Cognitive Dissonance. Stanford University Press.',
    de: 'Der übliche Weg aus einem inneren Widerspruch ist, eine Seite fallen zu lassen. Diese Ansicht macht das Gegenteil und lässt beide stehen.',
    en: 'The usual way out of an inner contradiction is to drop one side. This view does the opposite and lets both stand.'
  },
  culture: {
    ref: 'Spencer-Rodgers, J., Williams, M. J. & Peng, K. (2010). Cultural differences in expectations of change and tolerance for contradiction. Personality and Social Psychology Review, 14(3), 296–312.',
    de: 'Wie viel Widersprüchlichkeit als normal gilt, hängt stark von der Umgebung ab, in der jemand aufgewachsen ist.',
    en: 'How much contradiction counts as normal depends strongly on the surroundings someone grew up in.'
  }
};

/** Welche Literaturstelle steht bei welchem Feld? */
const FIELD_LIT = {
  abhaengigkeit_autonomie: 'mixed',
  versorgung_autarkie: 'complexity',
  unterwerfung_kontrolle: 'conditional',
  selbstwert: 'integration',
  schuld: 'conditional',
  identitaet: 'complexity',
  rivalitaet: 'integration'
};

/**
 * Baut die Felder: ein Blurb je Thema, mit der zugehörigen Achse darin.
 *
 * Reihenfolge und Auswahl folgen den Projekten — dieselbe Ansicht auf dieselben
 * Themen, einmal als Arbeitsliste, einmal als Bild. Ein Thema ohne belegte
 * Achse verschwindet nicht, sondern sagt, dass bisher nur eine Richtung
 * vorkommt; das ist selbst eine Auskunft.
 *
 * @param entries   alle Einträge
 * @param projects  Ergebnis von deriveProjects()
 * @param opts      { lang, recognised: string[] }
 */
export function buildTensionFields(entries, projects, { lang = 'de', recognised = [] } = {}) {
  const de = lang !== 'en';
  const axes = new Map(findPolarities(entries, { lang }).map(p => [p.id, p]));
  const marked = new Set(recognised);
  const out = [];

  for (const project of projects) {
    const axisId = THEME_AXIS[project.conflictId];
    if (!axisId) continue;

    const axis = axes.get(axisId) || null;
    const blurb = FIELD_BLURBS[project.conflictId];
    const lit = TENSION_LIT[FIELD_LIT[project.conflictId] || 'mixed'];
    const sentences = CONDITIONALS[axisId] || { de: [], en: [] };

    out.push({
      id: project.conflictId,
      axisId,
      title: project.title,
      frameworkLabel: project.frameworkLabel,
      entryCount: project.evidence.entryCount,
      emotions: project.evidence.emotions || [],
      blurb: de ? blurb.de : blurb.en,
      literature: { note: de ? lit.de : lit.en, ref: lit.ref },
      axis,
      conditionals: (de ? sentences.de : sentences.en).map((text, i) => ({
        key: `${axisId}:${i}`,
        text,
        recognised: marked.has(`${axisId}:${i}`)
      }))
    });
  }

  // Felder mit belegter Schnittmenge zuerst: dort ist am meisten zu sehen.
  return out.sort((x, y) =>
    (y.axis?.regions.both || 0) - (x.axis?.regions.both || 0) ||
    (y.axis ? 1 : 0) - (x.axis ? 1 : 0));
}

/**
 * Der Rahmentext. Steht über den Feldern, immer.
 */
export const TENSION_FRAMING = {
  de: {
    title: 'Widersprüche halten',
    lede: 'Zwei Gefühle, die sich widersprechen, kannst du gleichzeitig haben. Das ist normal. Jemanden vermissen und ihn trotzdem nicht sehen wollen. Etwas brauchen und nicht danach fragen. Beides ist echt, und keins davon ist ein Fehler.',
    why: 'Die meisten versuchen, sich für eine Seite zu entscheiden — die andere wird dann weggeschoben. Das musst du nicht. Beide Seiten nebeneinander stehen zu lassen und sie auszuhalten, ist eine Fähigkeit: Man kann sie üben, und sie wird mit der Zeit leichter. Die Bilder hier zeigen, wo du das schon getan hast. In der Mitte stehen die Tage, an denen beides zugleich da war.',
    howToRead: 'Wie du das Bild liest',
    howToReadPoints: [
      'Gezählt werden Wörter, nicht Absichten. Ein Eintrag kann in beiden Kreisen liegen — dann liegt er in der Mitte.',
      'Die Kreise sind verschieden groß, weil du über das eine öfter geschrieben hast als über das andere. Öfter heißt nicht richtiger.',
      'Eine leere Mitte heißt nicht, dass beides nicht zusammengeht. Es heißt nur: Bisher stand es nicht in einem Eintrag.',
      'Ein schiefes Bild sagt nichts über dich. An manchen Tagen schreibt man über das eine, an anderen über das andere.'
    ],
    onlyA: 'nur hier',
    onlyB: 'nur hier',
    both: 'beides',
    bothTitle: 'Tage, an denen beides da war',
    bothEmpty: 'Bisher steht beides noch in keinem einzelnen Eintrag nebeneinander.',
    sameLine: 'in einem Satz',
    acrossEntry: 'im selben Eintrag',
    beliefTitle: 'Was beides auseinanderhält',
    beliefIntro: 'Zwischen zwei Gefühlen steht oft ein Satz, der sie unvereinbar macht — eine Regel nach dem Muster „wenn …, dann …". Unten stehen Beispiele für solche Regeln. Keiner davon ist eine Aussage über dich. Kommt dir einer bekannt vor, kannst du ihn markieren. Passt keiner, ist das völlig in Ordnung und kommt häufiger vor.',
    beliefMark: 'Kommt mir bekannt vor',
    beliefUnmark: 'Markierung entfernen',
    beliefMarked: 'Von dir markiert',
    beliefNone: 'Keiner davon',
    noAxis: 'Zu diesem Thema steht bisher nur eine Seite in deinen Einträgen. Für zwei Kreise braucht es beide, jede mindestens zweimal.',
    empty: 'Hier ist noch nichts',
    emptyBody: 'Die Bilder entstehen aus deinen Themen. Sobald eines über mehrere Einträge hinweg vorkommt, und zwar von beiden Seiten, siehst du es hier.',
    entriesOn: n => `${n} ${n === 1 ? 'Eintrag' : 'Einträge'}`,
    sourceTitle: 'Woher das kommt'
  },
  en: {
    title: 'Holding Contradictions',
    lede: 'You can feel two opposite things at the same time. That is normal. Missing someone and still not wanting to see them. Needing something and not asking for it. Both are real, and neither one is a mistake.',
    why: 'Most people try to pick a side — the other one then gets pushed away. You do not have to. Letting both sides stand next to each other and holding them is a skill: you can practise it, and it gets easier over time. The pictures here show where you have already done it. The middle holds the days when both were there at once.',
    howToRead: 'How to read the picture',
    howToReadPoints: [
      'Words get counted, not intentions. One entry can sit in both circles — then it sits in the middle.',
      'The circles differ in size because you wrote about one more often than the other. More often does not mean more true.',
      'An empty middle does not mean the two cannot go together. It only means they have not been in one entry yet.',
      'A lopsided picture says nothing about you. Some days you write about the one thing, other days about the other.'
    ],
    onlyA: 'only here',
    onlyB: 'only here',
    both: 'both',
    bothTitle: 'Days when both were there',
    bothEmpty: 'So far no single entry has both of them side by side.',
    sameLine: 'in one sentence',
    acrossEntry: 'in the same entry',
    beliefTitle: 'What keeps them apart',
    beliefIntro: 'Between two feelings there is often a sentence that makes them impossible together — a rule shaped like “if …, then …”. Below are examples of such rules. None of them is a statement about you. If one sounds familiar, you can mark it. If none fits, that is completely fine and happens more often.',
    beliefMark: 'This sounds familiar',
    beliefUnmark: 'Remove mark',
    beliefMarked: 'Marked by you',
    beliefNone: 'None of these',
    noAxis: 'So far only one side of this pattern is in your entries. Two circles need both sides, each at least twice.',
    empty: 'Nothing here yet',
    emptyBody: 'The pictures grow out of your patterns. As soon as one shows up across several entries, and from both sides, you will see it here.',
    entriesOn: n => `${n} ${n === 1 ? 'entry' : 'entries'}`,
    sourceTitle: 'Where this comes from'
  }
};
