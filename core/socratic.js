/**
 * Sokratischer Dialog — regelbasiert, offline, korpusgestützt.
 * Socratic dialogue — rule-based, offline, corpus-grounded.
 *
 * Haltung / stance:
 *  - Eine Frage pro Zug. Nicht drei. (Overholser, 2011)
 *  - Keine Deutung, die der Schreibende nicht selbst schon angelegt hat.
 *  - Der Dialog liest das GANZE Journal, nicht die letzte Nachricht: wie oft
 *    ein Thema vorkommt, worüber welche Spanne, was es begleitet, wo es
 *    ausnahmsweise anders ausgeht. Die Ausnahme ist dabei oft ergiebiger als
 *    die Regel — wer weiß, wann es einmal anders lief, hat einen Ansatzpunkt.
 *  - Bei Krisenmarkern: Dialog unterbrechen, auf echte Hilfe verweisen.
 *
 * Der Bogen folgt der klassischen Abfolge (Klärung → Annahme → Evidenz →
 * Perspektive → Herkunft → Konsequenz → Bilanz), ergänzt um eine
 * tiefenpsychologische Stufe („Herkunft"), die nach der Vorgeschichte eines
 * Musters fragt statt nach seiner Richtigkeit.
 */

import { CONFLICTS, DEFENCES, DOMAINS, CRISIS_MARKERS, CRISIS_RESOURCES, LITERATURE, buildMatcher } from './themes.js';
import { EMOTION_INDEX } from './emotions.js';
import { analyseEntry } from './analyze.js';

const COMPILED = {
  conflicts: CONFLICTS.map(c => ({ ...c, matcher: buildMatcher(c.terms) })),
  defences: DEFENCES.map(d => ({ ...d, matcher: buildMatcher(d.terms) })),
  domains: DOMAINS.map(d => ({ ...d, matcher: buildMatcher(d.terms) }))
};

export const STAGES = ['opening', 'clarify', 'assumption', 'evidence', 'perspective', 'origin', 'consequence', 'synthesis'];

/* ══════════════════════════════════════════════════════════════
 * 1 · KORPUSBILD  —  was das Journal insgesamt weiß
 * ══════════════════════════════════════════════════════════════ */

/**
 * Baut einmal pro Zug das Gesamtbild: Themen mit Häufigkeit und Spanne,
 * begleitende Gefühle, Ausnahmen, Gegensätze zwischen Lebensbereichen.
 * Das ist die Grundlage, aus der alle korpusgestützten Züge schöpfen.
 */
export function buildBriefing(entries, lang = 'de') {
  const de = lang !== 'en';
  const real = (entries || []).filter(e => e.analysis);
  if (!real.length) return { empty: true, entries: 0, themes: [] };

  const themes = [];

  for (const conflict of CONFLICTS) {
    const hits = real.filter(e => (e.analysis.conflicts || []).some(c => c.id === conflict.id));
    if (!hits.length) continue;

    const emo = new Map();
    for (const e of hits) {
      for (const f of e.feelings || []) emo.set(f.emotionId, (emo.get(f.emotionId) || 0) + 1);
    }

    const valences = hits.map(e => e.analysis.affect?.valence ?? 0);
    const mean = valences.reduce((a, b) => a + b, 0) / valences.length;

    // Ausnahmen: dasselbe Thema, aber es ging anders aus.
    const exceptions = hits.filter(e => (e.analysis.affect?.valence ?? 0) > Math.max(-0.1, mean + 0.35));

    themes.push({
      id: conflict.id,
      label: de ? conflict.de : conflict.en,
      note: de ? conflict.noteDe : conflict.noteEn,
      count: hits.length,
      share: hits.length / real.length,
      first: hits[0].date,
      last: hits[hits.length - 1].date,
      meanValence: round(mean),
      repeats: hits.filter(e => (e.analysis.repetition?.score || 0) > 0).length,
      topEmotions: [...emo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
        .map(([id, n]) => ({ id, n, label: labelOfEmotion(id, lang) })),
      entryIds: hits.map(e => e.id),
      exceptions: exceptions.map(e => e.id)
    });
  }

  themes.sort((a, b) => b.count - a.count || b.share - a.share);

  // Lebensbereiche mit auffällig unterschiedlicher Tönung — Stoff für
  // Kontrastfragen: dasselbe Ich, zwei sehr verschiedene Bühnen.
  const domainTone = [];
  for (const domain of DOMAINS) {
    const hits = real.filter(e => (e.analysis.domains || []).some(d => d.id === domain.id));
    if (hits.length < 2) continue;
    const mean = hits.reduce((s, e) => s + (e.analysis.affect?.valence ?? 0), 0) / hits.length;
    domainTone.push({ id: domain.id, label: de ? domain.de : domain.en, count: hits.length, mean: round(mean) });
  }
  domainTone.sort((a, b) => b.mean - a.mean);

  const attribution = tally(real, 'attribution');
  const defences = tally(real, 'defences');

  return {
    empty: false,
    entries: real.length,
    first: real[0].date,
    last: real[real.length - 1].date,
    spanDays: daysBetween(real[0].date, real[real.length - 1].date),
    themes,
    domainTone,
    attribution,
    defences,
    byId: new Map(real.map(e => [e.id, e]))
  };
}

function tally(entries, key) {
  const counts = new Map();
  for (const e of entries) {
    for (const item of (e.analysis?.[key] || [])) {
      const rec = counts.get(item.id) || { id: item.id, de: item.de, en: item.en, level: item.level, n: 0, score: 0 };
      rec.n += 1;
      rec.score += item.score;
      counts.set(item.id, rec);
    }
  }
  return [...counts.values()].sort((a, b) => b.score - a.score);
}

/* ══════════════════════════════════════════════════════════════
 * 2 · FRAGENBANK
 * ══════════════════════════════════════════════════════════════ */

const GENERIC = {
  clarify: {
    de: [
      'Wenn du die Situation wie eine Szene beschreibst — wer war da, was wurde gesagt, und an welchem Punkt genau hat sich etwas in dir umgedreht?',
      'Was davon ist gerade das Lauteste: das, was passiert ist, oder das, was es über dich zu sagen scheint?',
      'Woran hast du gemerkt, dass es dich trifft — bevor du es in Worte fassen konntest?',
      'Wenn du es auf einen einzigen Satz bringen müsstest, ohne Erklärung drumherum: was ist das Problem?',
      'Was genau meinst du damit? Ich frage nicht rhetorisch — das Wort könnte mehrere Dinge heißen.'
    ],
    en: [
      'If you describe the situation as a scene — who was there, what was said, and at what precise point did something turn over inside you?',
      'Which is louder right now: what happened, or what it seems to say about you?',
      'How did you notice it was getting to you — before you could put it into words?',
      'If you had to reduce it to a single sentence, no explanation around it: what is the problem?',
      'What exactly do you mean by that? Not rhetorical — the word could mean several things.'
    ]
  },
  assumption: {
    de: [
      'Welche Annahme müsste stimmen, damit dieses Gefühl zwingend folgt?',
      'Du gehst gerade von etwas aus, das du nicht ausgesprochen hast. Was ist es?',
      'Was hältst du hier für eine Tatsache, das eigentlich eine Erwartung ist?',
      'Angenommen, das Gegenteil wäre wahr — woran würdest du es merken?',
      'Wenn du diesen Satz jemandem sagen müsstest, den du respektierst: welcher Teil würde plötzlich wackeln?'
    ],
    en: [
      'What assumption would have to be true for this feeling to follow necessarily?',
      'You are assuming something you have not said out loud. What is it?',
      'What are you treating here as a fact that is actually an expectation?',
      'Suppose the opposite were true — how would you notice?',
      'If you had to say that sentence to someone you respect: which part would suddenly wobble?'
    ]
  },
  evidence: {
    de: [
      'Was spricht dafür — und was hast du bisher übersehen, weil es dagegen spricht?',
      'Woher weißt du das? Nicht als Zweifel gemeint, sondern als ernst gemeinte Frage nach der Quelle.',
      'Hat es je eine Situation gegeben, in der es anders ausgegangen ist? Was war da anders?',
      'Was würde jemand einwenden, der dich gut kennt und dir wohlgesonnen ist?',
      'Wenn du Belege vorlegen müsstest statt Eindrücke: was hättest du?'
    ],
    en: [
      'What speaks for it — and what have you overlooked because it speaks against it?',
      'How do you know? Not as doubt, but as a genuine question about the source.',
      'Has there ever been a situation where it turned out differently? What was different there?',
      'What would someone who knows you well and wishes you well object?',
      'If you had to produce evidence rather than impressions: what would you have?'
    ]
  },
  perspective: {
    de: [
      'Wie würde die andere Person die Szene erzählen — nicht ob sie recht hat, sondern wie sie es erlebt haben könnte?',
      'Es klingt, als gäbe es mehr als eine Stimme in dir dazu. Was sagt die leisere?',
      'Wenn ein Freund dir das genau so erzählen würde — was würdest du zuerst bemerken?',
      'Welchen Teil der Geschichte würdest du weglassen, wenn du sie jemandem erzählst — und warum diesen?',
      'Was wäre, wenn es gar nicht um dich ginge? Was bliebe dann übrig?'
    ],
    en: [
      'How would the other person tell the scene — not whether they are right, but how they might have experienced it?',
      'It sounds as if there is more than one voice in you on this. What does the quieter one say?',
      'If a friend told you exactly this — what would you notice first?',
      'Which part of the story would you leave out when telling someone — and why that part?',
      'What if it were not about you at all? What would remain?'
    ]
  },
  origin: {
    de: [
      'Wie alt fühlt sich dieses Gefühl an? Nicht wie alt du bist — wie alt es ist.',
      'Kennst du diese Situation? Nicht diese hier — die Form davon.',
      'Wann hast du zum ersten Mal gedacht, dass es so läuft?',
      'Wenn dieses Muster einmal nützlich war — wofür hat es damals gesorgt?',
      'Wer hat dir beigebracht, dass du an dieser Stelle so reagieren musst?'
    ],
    en: [
      'How old does this feeling feel? Not how old you are — how old it is.',
      'Do you know this situation? Not this one — the shape of it.',
      'When did you first think that this is how it goes?',
      'If this pattern was once useful — what did it take care of back then?',
      'Who taught you that you have to react this way at this point?'
    ]
  },
  consequence: {
    de: [
      'Wenn sich daran nichts ändert — wo bist du damit in einem Jahr?',
      'Was kostet es dich, so weiterzumachen? Und was kostet es, etwas anderes zu tun?',
      'Was wäre der kleinstmögliche Schritt, der trotzdem ein echter wäre?',
      'Angenommen, das Problem wäre morgen gelöst — woran genau würdest du es zuerst merken?',
      'Wovor schützt dich dieses Muster?'
    ],
    en: [
      'If nothing changes about it — where are you with it in a year?',
      'What does it cost you to keep going like this? And what would it cost to do something else?',
      'What would be the smallest possible step that would still be a real one?',
      'Suppose the problem were solved tomorrow — what exactly would you notice first?',
      'What does this pattern protect you from?'
    ]
  },
  synthesis: {
    de: [
      'Was nimmst du aus diesem Gespräch mit, das du vorher nicht so klar hattest?',
      'Wenn du dir selbst in einer Woche eine Zeile dazu schreiben würdest — was stünde drin?',
      'Welche Frage von vorhin lässt dich nicht los?',
      'Was bleibt offen? Nicht alles muss heute zugehen.'
    ],
    en: [
      'What do you take from this conversation that you did not have as clearly before?',
      'If you wrote yourself one line about this in a week — what would it say?',
      'Which question from earlier is not letting go of you?',
      'What stays open? Not everything has to close today.'
    ]
  }
};

const THEMED = {
  abhaengigkeit_autonomie: {
    de: ['An welchem Punkt genau kippt Nähe für dich von wohltuend zu eng?',
         'Was befürchtest du zu verlieren, wenn du dich ganz einlässt — und was, wenn du gehst?',
         'Wenn du dich zurückziehst: schützt du damit dich oder die andere Person?'],
    en: ['At what precise point does closeness tip from good to tight for you?',
         'What do you fear losing if you fully commit — and what if you leave?',
         'When you withdraw: are you protecting yourself or the other person?']
  },
  unterwerfung_kontrolle: {
    de: ['Wenn du nachgegeben hast — wohin ist die Wut gegangen?',
         'Was müsste passieren, damit du hier loslassen könntest, ohne dich ausgeliefert zu fühlen?',
         'Wem gegenüber fällt es dir leicht, deinen Willen zu zeigen — und was ist dort anders?'],
    en: ['When you gave in — where did the anger go?',
         'What would have to happen for you to let go here without feeling at someone\'s mercy?',
         'With whom is it easy to show your will — and what is different there?']
  },
  versorgung_autarkie: {
    de: ['Was hättest du gebraucht — und was hat dich davon abgehalten, danach zu fragen?',
         'Was denkst du, würde passieren, wenn du offen um Hilfe bätest?',
         'Ist „ich brauche niemanden" eine Beschreibung oder ein Schutz?'],
    en: ['What would you have needed — and what kept you from asking for it?',
         'What do you think would happen if you asked openly for help?',
         'Is "I need no one" a description or a protection?']
  },
  selbstwert: {
    de: ['Woran misst du gerade deinen Wert — und wer hat diesen Maßstab aufgestellt?',
         'Wäre der Wert eines anderen Menschen durch dasselbe Ereignis gesunken?',
         'Was bliebe von dir übrig, wenn diese Leistung wegfiele?'],
    en: ['By what are you measuring your worth right now — and who set that yardstick?',
         'Would another person\'s worth have dropped from the same event?',
         'What would be left of you if this achievement fell away?']
  },
  schuld: {
    de: ['Welcher Anteil daran gehört wirklich dir — und welchen hast du übernommen, weil ihn sonst niemand getragen hätte?',
         'Wem gegenüber fühlst du dich schuldig? Und weiß diese Person davon?',
         'Wenn Schuld ein Preis ist: wofür bezahlst du gerade?'],
    en: ['Which share genuinely belongs to you — and which did you take on because no one else would carry it?',
         'Toward whom do you feel guilty? And does that person know?',
         'If guilt is a price: what are you paying for right now?']
  },
  identitaet: {
    de: ['Wo in deinem Leben musst du dich am wenigsten verstellen?',
         'Wenn niemand zuschauen würde — was würdest du anders machen?',
         'Welche Rolle trägst du gerade, und wer hat sie dir gegeben?'],
    en: ['Where in your life do you have to pretend the least?',
         'If no one were watching — what would you do differently?',
         'Which role are you carrying right now, and who gave it to you?']
  },
  rivalitaet: {
    de: ['Was genau hat die andere Person, das du willst — die Sache selbst oder das, was sie bedeutet?',
         'Wann hast du dich zum ersten Mal als den Dritten erlebt?',
         'Wenn Neid ein Zeiger ist: worauf zeigt er?'],
    en: ['What exactly does the other person have that you want — the thing itself, or what it signifies?',
         'When did you first experience yourself as the third one?',
         'If envy is a pointer: what is it pointing at?']
  }
};

const REFLECTIONS = {
  de: ['Ich bleibe kurz bei dem, was du geschrieben hast.',
       'Das klingt nach etwas, das schon eine Weile mitläuft.',
       'Ich höre da zwei Dinge gleichzeitig.',
       'Das ist ein dichter Absatz — da steckt viel drin.',
       'Bevor ich weiterfrage: das klingt anstrengend.'],
  en: ['Let me stay with what you wrote for a moment.',
       'That sounds like something that has been running along for a while.',
       'I hear two things at once there.',
       'That is a dense paragraph — there is a lot in it.',
       'Before I ask further: that sounds tiring.']
};

const ECHO_FOLLOWUPS = {
  de: ['Das ist eine Weile her. Ist es dasselbe wie heute, oder nur ähnlich?',
       'Was verbindet die beiden Situationen — und was unterscheidet sie?',
       'Wenn das eine Linie ist: wo fängt sie an?',
       'Hättest du damals gedacht, dass es heute wieder Thema ist?',
       'Was hat sich seitdem verändert — an der Lage oder an dir?'],
  en: ['That was a while ago. Is it the same as today, or only similar?',
       'What connects the two situations — and what separates them?',
       'If that is a line: where does it begin?',
       'Back then, would you have expected this to come up again today?',
       'What has changed since — in the situation, or in you?']
};

/* ══════════════════════════════════════════════════════════════
 * 3 · ANALYSE DER NUTZERNACHRICHT
 * ══════════════════════════════════════════════════════════════ */

function detect(text) {
  const t = (text || '').toLowerCase();
  const pick = list => list
    .map(x => {
      let s = 0;
      for (const m of x.matcher) {
        const hits = t.match(m.re);
        if (hits) s += hits.length * m.weight;
      }
      return { id: x.id, de: x.de, en: x.en, noteDe: x.noteDe, noteEn: x.noteEn, level: x.level, score: s };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return {
    conflicts: pick(COMPILED.conflicts),
    defences: pick(COMPILED.defences),
    domains: pick(COMPILED.domains),
    crisis: CRISIS_MARKERS.some(m => t.includes(m)),
    length: t.split(/\s+/).filter(Boolean).length
  };
}

/* ══════════════════════════════════════════════════════════════
 * 4 · KORPUSGESTÜTZTE ZÜGE
 * ══════════════════════════════════════════════════════════════ */

/** Gesamtbild zu einem Thema — die Eröffnung eines Fadens. */
function moveOverview(theme, briefing, lang) {
  const de = lang !== 'en';
  if (!theme || theme.count < 2) return null;

  const emo = theme.topEmotions.map(e => e.label).join(de ? ' und ' : ' and ');
  const span = theme.first !== theme.last
    ? (de ? ` — von ${theme.first} bis ${theme.last}` : ` — from ${theme.first} to ${theme.last}`)
    : '';

  return de
    ? `In deinem Journal zieht sich „${theme.label}" durch ${theme.count} von ${briefing.entries} Einträgen${span}.`
      + (emo ? ` Begleitet wird es meist von ${emo}.` : '')
    : `In your journal, "${theme.label}" runs through ${theme.count} of ${briefing.entries} entries${span}.`
      + (emo ? ` It is usually accompanied by ${emo}.` : '');
}

/** Wörtliches Zitat aus einem früheren Eintrag. */
function moveEcho(theme, briefing, lang, usedIds = []) {
  const de = lang !== 'en';
  const used = new Set(usedIds);
  const candidates = (theme?.entryIds || [])
    .map(id => briefing.byId.get(id))
    .filter(e => e && !used.has(e.id)
      && (e.feelings || []).some(f => f.because && f.because.length > 25));
  if (!candidates.length) return null;

  const pool = candidates.slice(0, Math.max(1, Math.ceil(candidates.length / 2)));
  const entry = pool[Math.floor(Math.random() * pool.length)];
  const line = entry.feelings.find(f => f.because && f.because.length > 25);
  const feeling = labelOfEmotion(line.emotionId, lang);
  const quote = line.because.length > 200 ? line.because.slice(0, 199) + '…' : line.because;

  return {
    entryId: entry.id,
    text: de
      ? `Am ${entry.date} hast du geschrieben, du fühlst dich ${feeling}, weil ${lowerFirst(quote)}`
      : `On ${entry.date} you wrote that you feel ${feeling} because ${lowerFirst(quote)}`
  };
}

/**
 * Die Ausnahme. Wo dasselbe Thema auftaucht, aber anders ausgeht — das ist der
 * ergiebigste Ort im ganzen Journal, weil dort schon einmal etwas funktioniert hat.
 */
function moveException(theme, briefing, lang, usedIds = []) {
  const de = lang !== 'en';
  const used = new Set(usedIds);
  const candidates = (theme?.exceptions || [])
    .map(id => briefing.byId.get(id))
    .filter(e => e && !used.has(e.id) && (e.feelings || []).length);
  if (!candidates.length) return null;

  const entry = candidates[candidates.length - 1];
  const best = [...entry.feelings].sort((a, b) => {
    const va = EMOTION_INDEX.get(a.emotionId)?.v ?? 0;
    const vb = EMOTION_INDEX.get(b.emotionId)?.v ?? 0;
    return vb - va;
  })[0];
  const feeling = labelOfEmotion(best.emotionId, lang);

  return {
    entryId: entry.id,
    text: de
      ? `Eine Stelle fällt mir auf: Am ${entry.date} geht es um dasselbe Thema, aber du fühlst dich ${feeling}${best.because ? `, weil ${lowerFirst(trim(best.because, 160))}` : ''}.`
      : `One spot stands out: on ${entry.date} the same pattern comes up, but you feel ${feeling}${best.because ? `, because ${lowerFirst(trim(best.because, 160))}` : ''}.`,
    question: de
      ? 'Was war dort anders? Nicht an der Lage — an dir, oder an dem, was du getan hast.'
      : 'What was different there? Not in the situation — in you, or in what you did.'
  };
}

/** Zwei Lebensbereiche, zwei sehr verschiedene Tönungen. */
function moveContrast(briefing, lang) {
  const de = lang !== 'en';
  const tone = briefing.domainTone || [];
  if (tone.length < 2) return null;

  const best = tone[0];
  const worst = tone[tone.length - 1];
  if (best.id === worst.id || (best.mean - worst.mean) < 0.4) return null;

  return de
    ? `Etwas Strukturelles: In „${best.label}" liegt deine Tönung im Schnitt bei ${fmtSigned(best.mean)}, in „${worst.label}" bei ${fmtSigned(worst.mean)}. Derselbe Mensch, zwei sehr verschiedene Bühnen.`
    : `Something structural: in "${best.label}" your average tone is ${fmtSigned(best.mean)}, in "${worst.label}" it is ${fmtSigned(worst.mean)}. The same person, two very different stages.`;
}

const CONTRAST_QUESTIONS = {
  de: ['Was kannst du an der einen Stelle, das an der anderen fehlt?',
       'Wenn du etwas von dort nach hier mitnehmen könntest — was wäre es?',
       'Ist es die Situation, die den Unterschied macht, oder wer du dort sein darfst?'],
  en: ['What can you do in the one place that is missing in the other?',
       'If you could carry one thing from there to here — what would it be?',
       'Is it the situation that makes the difference, or who you are allowed to be there?']
};

/** Attributionsprofil über den ganzen Korpus. */
function moveAttribution(briefing, lang) {
  const de = lang !== 'en';
  const attr = briefing.attribution || [];
  const total = attr.reduce((s, a) => s + a.score, 0);
  if (!total || !attr.length) return null;

  const top = attr[0];
  const share = Math.round((top.score / total) * 100);
  if (share < 45) return null;

  const label = de ? top.de : top.en;
  return de
    ? `Über alle Einträge hinweg zeigen deine „weil"-Begründungen zu ${share} % in Richtung ${label}.`
    : `Across all entries, your "because" clauses point ${share}% toward ${label}.`;
}

const ATTRIBUTION_QUESTIONS = {
  selbst: {
    de: 'Wenn du einmal probeweise annimmst, dass ein Teil davon nicht bei dir liegt — welcher wäre das?',
    en: 'If you assume for a moment that part of this is not on you — which part would that be?'
  },
  andere: {
    de: 'Wo in dieser Geschichte hast du selbst Handlungsspielraum, auch wenn er klein ist?',
    en: 'Where in this story do you have room to act, even if it is small?'
  },
  umstaende: {
    de: 'Was davon sind wirklich Umstände, und was ist eine Entscheidung, die sich wie ein Umstand anfühlt?',
    en: 'What of this is genuinely circumstance, and what is a decision that feels like one?'
  },
  koerperlich: {
    de: 'Wenn der Körper hier mitspricht: worauf reagiert er deiner Vermutung nach?',
    en: 'If the body is speaking here: what do you suspect it is reacting to?'
  }
};

/* ══════════════════════════════════════════════════════════════
 * 5 · HAUPTFUNKTION
 * ══════════════════════════════════════════════════════════════ */

/**
 * Erzeugt die nächste Antwort.
 * @param {object} session  { messages, stage, usedQuestions, usedEchoes, focusConflict, projectId, lang }
 * @param {string} userText
 * @param {Array}  entries  vollständiger Journalverlauf
 */
export function respond(session, userText, entries) {
  const lang = session.lang || 'de';
  const de = lang !== 'en';
  const det = detect(userText);

  /* Sicherheit zuerst. */
  if (det.crisis) {
    const res = CRISIS_RESOURCES[de ? 'de' : 'en'];
    return {
      text: [
        de ? 'Ich halte hier kurz an. Was du schreibst, klingt nach echter Not — und dafür bin ich das falsche Gegenüber.'
           : 'I am stopping here for a moment. What you write sounds like real distress — and for that I am the wrong counterpart.',
        '', res.body, '',
        ...res.contacts.map(c => `• ${c}`), '',
        de ? 'Wenn du möchtest, schreiben wir danach weiter. Das läuft nicht weg.'
           : 'If you want, we can continue afterwards. This will keep.'
      ].join('\n'),
      stage: session.stage, crisis: true, meta: { crisis: true }
    };
  }

  const briefing = buildBriefing(entries, lang);
  const turn = (session.messages || []).filter(m => m.role === 'user').length;
  const usedEchoes = session.usedEchoes || [];

  /* Fokus bestimmen: das gewählte Projekt schlägt alles, sonst was die
     Nachricht zeigt, sonst was der Korpus insgesamt zeigt. */
  let focus = session.projectId || session.focusConflict || null;
  if (!session.projectId && det.conflicts.length && det.conflicts[0].score >= 3) {
    focus = det.conflicts[0].id;
  }
  if (!focus && briefing.themes.length) focus = briefing.themes[0].id;

  const theme = briefing.themes.find(x => x.id === focus) || briefing.themes[0] || null;

  const stageIndex = Math.min(STAGES.length - 1, Math.max(1, Math.floor(turn / 1.5) + 1));
  const stage = STAGES[stageIndex];
  const literature = (turn === 3 || turn === 7) ? literatureFor(stage, lang) : null;

  const parts = [];
  let usedEcho = null;

  /* Spiegeln — nicht jedes Mal, sonst wird es zur Masche. */
  if (det.length > 25 && turn % 2 === 1) {
    parts.push(pick(REFLECTIONS[de ? 'de' : 'en'], session.usedQuestions));
  }

  /* Korpuszug: jeder Zug hat seinen Platz im Bogen. */
  if (turn === 1 && theme) {
    const overview = moveOverview(theme, briefing, lang);
    if (overview) parts.push(overview);

  } else if (turn === 4 && theme) {
    // Die Ausnahme kommt bewusst in der Evidenzphase.
    const exception = moveException(theme, briefing, lang, usedEchoes);
    if (exception) {
      parts.push(exception.text);
      parts.push(exception.question);
      return finish(parts, stage, focus, { literature, usedEcho: exception.entryId });
    }

  } else if (turn === 6) {
    const contrast = moveContrast(briefing, lang);
    if (contrast) {
      parts.push(contrast);
      parts.push(pick(CONTRAST_QUESTIONS[de ? 'de' : 'en'], session.usedQuestions));
      return finish(parts, stage, focus, { literature });
    }

  } else if (turn === 8) {
    const attribution = moveAttribution(briefing, lang);
    if (attribution) {
      const topId = briefing.attribution[0]?.id;
      parts.push(attribution);
      parts.push((ATTRIBUTION_QUESTIONS[topId] || ATTRIBUTION_QUESTIONS.selbst)[de ? 'de' : 'en']);
      return finish(parts, stage, focus, { literature });
    }

  } else if (turn > 1 && turn % 3 === 0 && theme) {
    const echo = moveEcho(theme, briefing, lang, usedEchoes);
    if (echo) {
      parts.push(echo.text);
      parts.push(pick(ECHO_FOLLOWUPS[de ? 'de' : 'en'], session.usedQuestions));
      return finish(parts, stage, focus, { literature, usedEcho: echo.entryId });
    }
  }

  /* Abwehrhinweis — behutsam, als Beobachtung, nicht als Deutung. */
  const topDefence = det.defences[0];
  if (topDefence && topDefence.score >= 3 && turn >= 2 && turn % 4 === 0 && topDefence.level !== 'reif') {
    parts.push(de
      ? `Mir fällt an der Formulierung etwas auf — sie hat die Form von „${topDefence.de}". ${topDefence.noteDe} Das ist keine Kritik; es ist eine Frage wert, ob es hier gerade so ist.`
      : `Something strikes me about the phrasing — it has the shape of "${topDefence.en}". ${topDefence.noteEn} That is not a criticism; it is worth asking whether that fits here.`);
  }

  /* Genau eine Frage. */
  const bank = (focus && THEMED[focus] && stageIndex >= 2 && turn % 2 === 0)
    ? THEMED[focus][de ? 'de' : 'en']
    : (GENERIC[stage] || GENERIC.clarify)[de ? 'de' : 'en'];

  parts.push(pick(bank, session.usedQuestions));
  return finish(parts, stage, focus, { literature, usedEcho });
}

function finish(parts, stage, focus, extra = {}) {
  return {
    text: parts.filter(Boolean).join('\n\n'),
    stage,
    focusConflict: focus,
    literature: extra.literature || null,
    usedEcho: extra.usedEcho || null,
    meta: extra
  };
}

/* ══════════════════════════════════════════════════════════════
 * 6 · ERÖFFNUNG UND BILANZ
 * ══════════════════════════════════════════════════════════════ */

/**
 * Eröffnung — nennt, worauf sich das Gespräch stützt, und übergibt dann sofort.
 * @param {object} project optional: ein gewähltes Projekt, an dem gearbeitet wird
 */
export function openingMessage(entries, lang = 'de', project = null) {
  const de = lang !== 'en';
  const briefing = buildBriefing(entries, lang);

  if (briefing.empty) {
    return {
      text: de
        ? 'Wir fangen ohne Vorgeschichte an — es gibt noch keine Einträge, auf die ich mich beziehen könnte.\n\nWas beschäftigt dich gerade so, dass es nicht von selbst weggeht?'
        : 'We start without a history — there are no entries yet for me to refer to.\n\nWhat is on your mind in a way that will not go away by itself?',
      stage: 'opening', focusConflict: null
    };
  }

  const lines = [];

  if (project) {
    lines.push(de
      ? `Wir arbeiten an „${project.title}". Ich habe deine ${briefing.entries} Einträge dazu vor mir — ${project.evidence.entryCount} davon berühren dieses Thema, von ${project.evidence.firstDate} bis ${project.evidence.lastDate}.`
      : `We are working on "${project.title}". I have your ${briefing.entries} entries in front of me — ${project.evidence.entryCount} of them touch this pattern, from ${project.evidence.firstDate} to ${project.evidence.lastDate}.`);
  } else {
    const span = briefing.spanDays > 1
      ? (de ? ` über ${briefing.spanDays} Tage` : ` across ${briefing.spanDays} days`)
      : '';
    lines.push(de
      ? `Ich habe deine ${briefing.entries} Einträge${span} vor mir.`
      : `I have your ${briefing.entries} entries${span} in front of me.`);

    const top = briefing.themes[0];
    if (top && top.count >= 2) {
      lines.push(de
        ? `Am häufigsten kommt „${top.label}" durch — in ${top.count} Einträgen.`
        : `The pattern coming through most often is "${top.label}" — in ${top.count} entries.`);
      const second = briefing.themes[1];
      if (second && second.count >= 2) {
        lines.push(de
          ? `Daneben läuft „${second.label}" mit.`
          : `Alongside it runs "${second.label}".`);
      }
    }
  }

  lines.push('');
  lines.push(project
    ? (de ? project.openingQuestion || 'Was ist heute daran dran?' : project.openingQuestion || 'What of it is present today?')
    : (de ? 'Aber ich fange nicht damit an, sondern mit dir: Was ist heute da?'
          : 'But I will not start there — I will start with you: what is here today?'));

  return {
    text: lines.join(' ').replace(/\s+\n\s+/g, '\n\n').trim(),
    stage: 'opening',
    focusConflict: project?.conflictId || briefing.themes[0]?.id || null
  };
}

/**
 * Bilanz am Ende eines Gesprächs: was darin vorkam, in einem Stück lesbar.
 * Keine Deutung — eine Inhaltsangabe dessen, was der Schreibende selbst gesagt hat.
 */
export function closingSummary(session, entries, lang = 'de') {
  const de = lang !== 'en';
  const userTurns = (session.messages || []).filter(m => m.role === 'user');
  if (!userTurns.length) return null;

  const joined = userTurns.map(m => m.text).join('\n');
  const det = detect(joined);

  const themes = det.conflicts.slice(0, 3).map(c => de ? c.de : c.en);
  const defences = det.defences.filter(d => d.level !== 'reif').slice(0, 2).map(d => de ? d.de : d.en);
  const resources = det.defences.filter(d => d.level === 'reif').slice(0, 2).map(d => de ? d.de : d.en);
  const domains = det.domains.slice(0, 2).map(d => de ? d.de : d.en);

  const words = joined.split(/\s+/).filter(Boolean).length;

  return {
    turns: userTurns.length,
    words,
    themes, defences, resources, domains,
    stage: session.stage,
    headline: de
      ? `${userTurns.length} Züge, ${words} Wörter.`
      : `${userTurns.length} turns, ${words} words.`,
    body: [
      themes.length
        ? (de ? `Berührt hast du: ${themes.join(', ')}.` : `You touched on: ${themes.join(', ')}.`)
        : null,
      domains.length
        ? (de ? `Schauplatz war vor allem: ${domains.join(', ')}.` : `The setting was mainly: ${domains.join(', ')}.`)
        : null,
      resources.length
        ? (de ? `Auffällig als Ressource: ${resources.join(', ')}.` : `Notable as a resource: ${resources.join(', ')}.`)
        : null,
      defences.length
        ? (de ? `Als Sprachfigur tauchte auf: ${defences.join(', ')} — als Frage zu lesen, nicht als Urteil.`
              : `Appearing as a figure of speech: ${defences.join(', ')} — to be read as a question, not a verdict.`)
        : null,
      de ? 'Nichts davon muss heute zu Ende gedacht sein.'
         : 'None of this has to be thought through to the end today.'
    ].filter(Boolean)
  };
}

/* ══════════════════════════════════════════════════════════════
 * Hilfsfunktionen
 * ══════════════════════════════════════════════════════════════ */

function pick(list, used = []) {
  const fresh = list.filter(x => !used.includes(x));
  const pool = fresh.length ? fresh : list;
  return pool[Math.floor(Math.random() * pool.length)];
}

function literatureFor(stage, lang) {
  const de = lang !== 'en';
  const map = {
    clarify: LITERATURE.granularity,
    assumption: LITERATURE.mentalizing,
    evidence: LITERATURE.socratic,
    perspective: LITERATURE.mentalizing,
    origin: LITERATURE.ccrt,
    consequence: LITERATURE.defences,
    synthesis: LITERATURE.expressiveWriting
  };
  const entry = map[stage] || LITERATURE.socratic;
  return { note: de ? entry.de : entry.en, ref: entry.ref };
}

function labelOfEmotion(id, lang) {
  const m = EMOTION_INDEX.get(id);
  return m ? (lang === 'en' ? m.en : m.de) : id;
}

const lowerFirst = s => s.charAt(0).toLowerCase() + s.slice(1);
const trim = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;
const round = n => Math.round(n * 100) / 100;
const fmtSigned = n => (n < 0 ? '−' : '+') + Math.abs(n).toFixed(2);
const daysBetween = (a, b) =>
  Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);

export function ensureAnalysis(entry) {
  if (!entry.analysis) entry.analysis = analyseEntry(entry);
  return entry;
}
