/**
 * Tiefenpsychologisch fundiertes Themenlexikon.
 * Depth-psychology informed theme lexicon.
 *
 * WICHTIG / IMPORTANT
 * Das hier ist *keine* Diagnostik. Es ist ein Lesehilfsmittel: ein Wörterbuch,
 * das im eigenen Text wiederkehrende Sprachfiguren sichtbar macht. Die Kategorien
 * sind an etablierte Modelle angelehnt, nicht mit ihnen identisch:
 *
 *  - Konfliktachse: angelehnt an die OPD (Arbeitskreis OPD, "Operationalisierte
 *    Psychodynamische Diagnostik OPD-3", Hogrefe) sowie Mentzos, "Neurotische
 *    Konfliktverarbeitung".
 *  - Abwehrmechanismen: Anna Freud, "Das Ich und die Abwehrmechanismen" (1936);
 *    Vaillant's hierarchische Ordnung (reif / neurotisch / unreif).
 *  - Beziehungsmuster: Luborsky & Crits-Christoph, "Understanding Transference:
 *    The Core Conflictual Relationship Theme Method" (CCRT).
 *  - Struktur / Regulation: Rudolf, "Strukturbezogene Psychotherapie".
 *
 * This is NOT diagnostics. It is a reading aid — a dictionary that makes recurring
 * figures of speech in your own text visible.
 *
 * Gewichte: w = 1 normales Signalwort, w = 2 starkes/spezifisches Signalwort.
 */

/**
 * Hilfsfunktion: Wortliste -> Regex mit Wortgrenzen, Unicode-tauglich.
 *
 * Ein abschließendes `*` macht den Begriff zu einem Präfix: `kontrollier*`
 * trifft auch „kontrolliert", „kontrollierend", „kontrollierte". Das fängt die
 * deutsche Flexion weitgehend ab. Was es nicht abfängt, sind Partizipien mit
 * ge-Infix („nachgegeben") und Infinitive mit zu-Infix („durchzusetzen") —
 * die stehen unten als eigene Einträge.
 *
 * A trailing `*` turns the term into a prefix match, which covers most German
 * inflection. Forms with an infix (ge-/zu-) are listed separately below.
 */
export function buildMatcher(terms) {
  return terms.map(({ t, w = 1 }) => {
    const wildcard = t.endsWith('*');
    const bare = wildcard ? t.slice(0, -1) : t;
    const escaped = bare.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return {
      weight: w,
      term: t,
      re: new RegExp(
        `(?<![\\p{L}])${escaped}${wildcard ? '' : '(?![\\p{L}])'}`,
        'giu'
      )
    };
  });
}

/* ------------------------------------------------------------------ *
 * 1. GRUNDKONFLIKTE  /  CORE CONFLICTS
 * ------------------------------------------------------------------ */

export const CONFLICTS = [
  {
    id: 'abhaengigkeit_autonomie',
    de: 'Abhängigkeit vs. Autonomie',
    en: 'Dependence vs. Autonomy',
    noteDe: 'Der Wunsch nach Nähe und Gehaltenwerden steht gegen den Wunsch, frei und unabhängig zu sein. Typisch: Rückzug genau dann, wenn es eng wird — oder Anklammern genau dann, wenn Distanz entsteht.',
    noteEn: 'The wish for closeness and being held stands against the wish to be free. Typical: withdrawing exactly when things get close — or clinging exactly when distance appears.',
    terms: [
      { t: 'abhängig', w: 2 }, { t: 'anklammer*', w: 2 }, { t: 'klammer*', w: 2 },
      { t: 'eigenständig', w: 1 }, { t: 'unabhängig', w: 2 }, { t: 'autonomie', w: 2 },
      { t: 'auf eigenen beinen', w: 2 }, { t: 'loslassen', w: 1 }, { t: 'freiheit', w: 1 },
      { t: 'eingeengt', w: 2 }, { t: 'einengend', w: 2 }, { t: 'erdrückt', w: 2 },
      { t: 'zu nah', w: 2 }, { t: 'distanz', w: 1 }, { t: 'rückzug', w: 1 },
      { t: 'alleine schaffen', w: 2 }, { t: 'brauche ihn', w: 2 }, { t: 'brauche sie', w: 2 },
      { t: 'nicht ohne', w: 1 }, { t: 'verlassen werden', w: 2 }, { t: 'verlustangst', w: 2 },
      // zu-Infinitiv und Umgangsformen — sonst rutscht genau der häufigste
      // Satz durch: „Angst, verlassen zu werden".
      { t: 'verlassen zu werden', w: 2 }, { t: 'im stich gelassen', w: 2 },
      { t: 'allein gelassen', w: 2 }, { t: 'abstand', w: 2 }, { t: 'nähe', w: 1 },
      { t: 'anhänglich', w: 2 }, { t: 'erwachsen', w: 1 },
      { t: 'wie ein kind behandelt', w: 2 }, { t: 'traut mir nicht zu', w: 2 },
      { t: 'dependent', w: 2 }, { t: 'clingy', w: 2 }, { t: 'smothered', w: 2 },
      { t: 'independent', w: 2 }, { t: 'autonomy', w: 2 }, { t: 'on my own', w: 2 },
      { t: 'suffocating', w: 2 }, { t: 'too close', w: 2 }, { t: 'need him', w: 2 },
      { t: 'need her', w: 2 }, { t: 'need them', w: 2 }, { t: 'let go', w: 1 },
      { t: 'space', w: 1 }, { t: 'abandonment', w: 2 },
      { t: 'being abandoned', w: 2 }, { t: 'being left', w: 2 }, { t: 'pulled away', w: 2 },
      { t: 'needed space', w: 2 }, { t: 'wanted distance', w: 2 }, { t: 'grow up', w: 1 },
      { t: 'treated like a child', w: 2 }
    ]
  },
  {
    id: 'unterwerfung_kontrolle',
    de: 'Unterwerfung vs. Kontrolle',
    en: 'Submission vs. Control',
    noteDe: 'Wer bestimmt? Entweder man fügt sich und spürt hinterher Groll, oder man muss alles steuern und kann nicht abgeben. Oft begleitet von unterdrückter Wut.',
    noteEn: 'Who decides? Either you comply and feel resentment afterwards, or you must steer everything and cannot delegate. Often accompanied by suppressed anger.',
    terms: [
      { t: 'kontrolle', w: 2 }, { t: 'kontrollier*', w: 2 }, { t: 'bestimm*', w: 1 },
      { t: 'gehorch*', w: 2 }, { t: 'fügen', w: 2 }, { t: 'gefügt', w: 2 },
      { t: 'unterordn*', w: 2 }, { t: 'untergeordnet', w: 2 }, { t: 'unterzuordnen', w: 2 },
      { t: 'nachgeb*', w: 1 }, { t: 'nachgegeben', w: 2 }, { t: 'nachgibt', w: 1 },
      { t: 'durchsetz*', w: 2 }, { t: 'durchzusetzen', w: 2 }, { t: 'durchgesetzt', w: 2 },
      { t: 'machtlos', w: 2 }, { t: 'ohnmächtig', w: 2 }, { t: 'bevormundet', w: 2 },
      { t: 'vorschreib*', w: 2 }, { t: 'vorgeschrieben', w: 2 },
      { t: 'muss ich', w: 1 }, { t: 'zwing*', w: 2 }, { t: 'gezwungen', w: 2 },
      { t: 'zwang', w: 2 }, { t: 'widerstand', w: 1 }, { t: 'trotz', w: 1 },
      { t: 'sturheit', w: 1 }, { t: 'regeln', w: 1 }, { t: 'ordnung', w: 1 },
      { t: 'loslassen können', w: 2 }, { t: 'delegier*', w: 1 }, { t: 'macht', w: 1 },
      { t: 'nichts sagen', w: 2 }, { t: 'nichts sagen können', w: 2 },
      // Die alltäglichen Formen, in denen sich der Konflikt wirklich zeigt.
      { t: 'nicht nein', w: 2 }, { t: 'nein zu sagen', w: 2 }, { t: 'nein gesagt', w: 1 },
      { t: 'übergang*', w: 2 }, { t: 'überging', w: 2 }, { t: 'überstimmt', w: 2 },
      { t: 'widersproch*', w: 2 }, { t: 'widersprech*', w: 2 }, { t: 'widerspruch', w: 1 },
      { t: 'zugesagt', w: 1 }, { t: 'zurückgesteckt', w: 2 }, { t: 'klein beigegeben', w: 2 },
      { t: 'control', w: 2 }, { t: 'controlling', w: 2 }, { t: 'obey', w: 2 },
      { t: 'comply', w: 2 }, { t: 'submit', w: 2 }, { t: 'give in', w: 1 },
      // Gebeugte Formen — im Englischen genauso nötig wie im Deutschen.
      { t: 'gave in', w: 2 }, { t: 'giving in', w: 2 }, { t: 'backed down', w: 2 },
      { t: 'went along with', w: 2 }, { t: 'said nothing', w: 2 },
      { t: 'passed over', w: 2 }, { t: 'overruled', w: 2 }, { t: 'talked over', w: 2 },
      { t: 'spoke up', w: 2 }, { t: 'stood my ground', w: 2 }, { t: 'said no', w: 1 },
      { t: 'powerless', w: 2 }, { t: 'helpless', w: 1 }, { t: 'forced', w: 2 },
      { t: 'have to', w: 1 }, { t: 'stubborn', w: 1 }, { t: 'resist', w: 1 },
      { t: 'in charge', w: 2 }, { t: 'micromanage', w: 2 }
    ]
  },
  {
    id: 'versorgung_autarkie',
    de: 'Versorgung vs. Autarkie',
    en: 'Care vs. Self-sufficiency',
    noteDe: 'Darf ich etwas brauchen? Entweder ein starker, oft unausgesprochener Wunsch versorgt zu werden — oder ein demonstratives „ich brauche niemanden", das denselben Wunsch verdeckt.',
    noteEn: 'Am I allowed to need? Either a strong, often unspoken wish to be cared for — or a demonstrative "I need no one" which covers the same wish.',
    terms: [
      { t: 'versorg*', w: 2 }, { t: 'umsorgt', w: 2 }, { t: 'fürsorge', w: 2 },
      { t: 'brauche niemanden', w: 2 }, { t: 'keine hilfe', w: 2 }, { t: 'um hilfe bitten', w: 2 },
      { t: 'alleine durch', w: 2 }, { t: 'selbst schaffen', w: 1 }, { t: 'bedürfnis', w: 1 },
      { t: 'bedürftig', w: 2 }, { t: 'aufopfer*', w: 2 }, { t: 'kümmern', w: 1 },
      { t: 'gebraucht werden', w: 2 }, { t: 'geben und nehmen', w: 2 }, { t: 'zu kurz', w: 2 },
      { t: 'nichts bekommen', w: 2 }, { t: 'leer ausgehen', w: 2 }, { t: 'selbstgenügsam', w: 2 },
      { t: 'anspruchslos', w: 2 }, { t: 'verwöhnt', w: 1 },
      { t: 'taken care of', w: 2 }, { t: 'need no one', w: 2 }, { t: 'ask for help', w: 2 },
      { t: 'self-sufficient', w: 2 }, { t: 'needy', w: 2 }, { t: 'caretaker', w: 2 },
      { t: 'looking after', w: 1 }, { t: 'needed', w: 1 }, { t: 'nurture', w: 1 },
      { t: 'my needs', w: 2 }, { t: 'short-changed', w: 2 }
    ]
  },
  {
    id: 'selbstwert',
    de: 'Selbstwertkonflikt',
    en: 'Self-worth Conflict',
    noteDe: 'Der Wert der eigenen Person steht ständig zur Verhandlung. Schwankt zwischen Grandiosität und Entwertung; Kritik trifft unverhältnismäßig tief.',
    noteEn: 'The worth of the self is permanently up for negotiation. Swings between grandiosity and devaluation; criticism lands disproportionately deep.',
    terms: [
      { t: 'selbstwert', w: 2 }, { t: 'nicht gut genug', w: 2 }, { t: 'nicht genug', w: 2 },
      { t: 'versagt', w: 2 }, { t: 'versag*', w: 2 }, { t: 'peinlich', w: 1 },
      { t: 'blamiert', w: 2 }, { t: 'minderwertig', w: 2 }, { t: 'wertlos', w: 2 },
      { t: 'anerkennung', w: 2 }, { t: 'bestätigung', w: 2 }, { t: 'gelobt', w: 1 },
      { t: 'kritik', w: 1 }, { t: 'kritisier*', w: 2 }, { t: 'vergleiche mich', w: 2 },
      { t: 'besser als', w: 1 }, { t: 'schlechter als', w: 2 }, { t: 'beweis*', w: 2 },
      { t: 'leistung', w: 1 }, { t: 'perfekt', w: 1 }, { t: 'stolz auf mich', w: 2 },
      { t: 'schäme mich', w: 2 }, { t: 'zweifle an mir', w: 2 },
      { t: 'self-worth', w: 2 }, { t: 'self-esteem', w: 2 }, { t: 'not good enough', w: 2 },
      { t: 'worthless', w: 2 }, { t: 'failure', w: 2 }, { t: 'validation', w: 2 },
      { t: 'recognition', w: 1 }, { t: 'criticism', w: 1 }, { t: 'compare myself', w: 2 },
      { t: 'prove myself', w: 2 }, { t: 'ashamed', w: 2 }, { t: 'inadequate', w: 2 }
    ]
  },
  {
    id: 'schuld',
    de: 'Schuldkonflikt',
    en: 'Guilt Conflict',
    noteDe: 'Schuld wird entweder übernommen, wo sie nicht hingehört, oder konsequent von sich gewiesen. Ein strenges Über-Ich meldet sich in Sätzen mit „hätte ich nur".',
    noteEn: 'Guilt is either taken on where it does not belong, or consistently deflected. A strict super-ego shows up in "if only I had" sentences.',
    terms: [
      { t: 'schuld', w: 2 }, { t: 'schuldig', w: 2 }, { t: 'meine schuld', w: 2 },
      { t: 'schuldgefühl', w: 2 }, { t: 'hätte ich', w: 2 }, { t: 'vorwurf', w: 2 },
      { t: 'vorwürfe', w: 2 }, { t: 'entschuldigt', w: 1 }, { t: 'verantwortlich', w: 1 },
      { t: 'wiedergutmachen', w: 2 }, { t: 'büßen', w: 2 }, { t: 'gewissen', w: 2 },
      { t: 'schlechtes gewissen', w: 2 }, { t: 'verzeih*', w: 1 }, { t: 'bereu*', w: 2 },
      { t: 'falsch gemacht', w: 2 }, { t: 'nicht verdient', w: 2 },
      { t: 'guilt', w: 2 }, { t: 'guilty', w: 2 }, { t: 'my fault', w: 2 },
      { t: 'should have', w: 2 }, { t: 'blame', w: 2 }, { t: 'blamed', w: 2 },
      { t: 'conscience', w: 2 }, { t: 'make up for', w: 2 }, { t: 'regret', w: 2 },
      { t: 'apologise', w: 1 }, { t: 'apologize', w: 1 }, { t: 'forgive', w: 1 }
    ]
  },
  {
    id: 'identitaet',
    de: 'Identitätskonflikt',
    en: 'Identity Conflict',
    noteDe: 'Wer bin ich — und wer bin ich für andere? Rollen fühlen sich geliehen an, das Gefühl von Kontinuität fehlt.',
    noteEn: 'Who am I — and who am I for others? Roles feel borrowed, the sense of continuity is missing.',
    terms: [
      { t: 'wer ich bin', w: 2 }, { t: 'wer ich wirklich', w: 2 }, { t: 'identität', w: 2 },
      { t: 'rolle', w: 1 }, { t: 'maske', w: 2 }, { t: 'fassade', w: 2 },
      { t: 'echt sein', w: 2 }, { t: 'authentisch', w: 2 }, { t: 'verstell*', w: 2 },
      { t: 'anpassen', w: 1 }, { t: 'anpass*', w: 2 }, { t: 'fremd', w: 1 },
      { t: 'nicht ich selbst', w: 2 }, { t: 'zugehörigkeit', w: 1 }, { t: 'heimat', w: 1 },
      { t: 'lebenssinn', w: 2 }, { t: 'richtiger weg', w: 2 },
      { t: 'who i am', w: 2 }, { t: 'identity', w: 2 }, { t: 'mask', w: 2 },
      { t: 'facade', w: 2 }, { t: 'authentic', w: 2 }, { t: 'real me', w: 2 },
      { t: 'pretending', w: 2 }, { t: 'belong', w: 1 }, { t: 'not myself', w: 2 },
      { t: 'true self', w: 2 }
    ]
  },
  {
    id: 'rivalitaet',
    de: 'Rivalität & Begehren (ödipale Ebene)',
    en: 'Rivalry & Desire (oedipal level)',
    noteDe: 'Dreieckskonstellationen: konkurrieren, begehren, ausgeschlossen sein. Zeigt sich auch dort, wo es nicht um Liebe geht — etwa bei Beförderungen oder Freundeskreisen.',
    noteEn: 'Triangular constellations: competing, desiring, being excluded. Shows up where love is not the topic too — promotions, friendship groups.',
    terms: [
      { t: 'konkurrenz*', w: 2 }, { t: 'rivale', w: 2 }, { t: 'rivalität', w: 2 },
      { t: 'eifersucht', w: 2 }, { t: 'eifersüchtig', w: 2 }, { t: 'neid', w: 2 },
      { t: 'neidisch', w: 2 }, { t: 'ausgeschlossen', w: 2 }, { t: 'dritte', w: 1 },
      { t: 'wettbewerb', w: 2 }, { t: 'gewinn*', w: 1 }, { t: 'verlieren gegen', w: 2 },
      { t: 'begehren', w: 2 }, { t: 'anziehung', w: 1 }, { t: 'vorgezogen', w: 2 },
      { t: 'lieblingskind', w: 2 }, { t: 'zurückgesetzt', w: 2 },
      { t: 'rivalry', w: 2 }, { t: 'rival', w: 2 }, { t: 'jealous', w: 2 },
      { t: 'jealousy', w: 2 }, { t: 'envy', w: 2 }, { t: 'left out', w: 2 },
      { t: 'excluded', w: 2 }, { t: 'competition', w: 2 }, { t: 'compete', w: 2 },
      { t: 'favourite', w: 1 }, { t: 'favorite', w: 1 }, { t: 'desire', w: 1 }
    ]
  }
];

/* ------------------------------------------------------------------ *
 * 2. ABWEHR / DEFENCES
 * Ordnung nach Vaillant: reif > neurotisch > unreif.
 * ------------------------------------------------------------------ */

export const DEFENCES = [
  {
    id: 'rationalisierung',
    de: 'Rationalisierung',
    en: 'Rationalisation',
    level: 'neurotisch',
    noteDe: 'Gute Gründe statt des echten Grundes. Erkennbar an der Dichte von „eigentlich", „logischerweise", „es ergibt ja Sinn".',
    noteEn: 'Good reasons instead of the real reason. Recognisable by the density of "actually", "logically", "it makes sense".',
    terms: [
      { t: 'eigentlich', w: 1 }, { t: 'im grunde', w: 1 }, { t: 'logisch', w: 1 },
      { t: 'macht ja sinn', w: 2 }, { t: 'ist doch normal', w: 2 }, { t: 'objektiv betrachtet', w: 2 },
      { t: 'rational', w: 1 }, { t: 'vernünftig', w: 1 }, { t: 'nicht so schlimm', w: 2 },
      { t: 'war ja klar', w: 1 }, { t: 'gute gründe', w: 2 },
      { t: 'actually', w: 1 }, { t: 'logically', w: 1 }, { t: 'makes sense', w: 2 },
      { t: 'it is normal', w: 2 }, { t: 'rationally', w: 1 }, { t: 'not that bad', w: 2 },
      { t: 'good reason', w: 2 }
    ]
  },
  {
    id: 'intellektualisierung',
    de: 'Intellektualisierung',
    en: 'Intellectualisation',
    level: 'neurotisch',
    noteDe: 'Über das Gefühl reden statt es zu fühlen. Die Sprache wird abstrakt, distanziert, oft fachlich — genau an der Stelle, wo es wehtun würde.',
    noteEn: 'Talking about the feeling instead of feeling it. Language turns abstract, distanced, often technical — exactly where it would hurt.',
    terms: [
      { t: 'analysier*', w: 2 }, { t: 'im prinzip', w: 1 }, { t: 'theoretisch', w: 2 },
      { t: 'konzept', w: 1 }, { t: 'mechanismus', w: 2 }, { t: 'muster', w: 1 },
      { t: 'struktur', w: 1 }, { t: 'objektiv', w: 1 }, { t: 'distanziert', w: 2 },
      { t: 'man könnte sagen', w: 2 }, { t: 'interessant ist', w: 1 }, { t: 'faktisch', w: 2 },
      { t: 'analyse', w: 1 }, { t: 'betrachtet man', w: 2 },
      { t: 'theoretically', w: 2 }, { t: 'in principle', w: 2 }, { t: 'objectively', w: 1 },
      { t: 'mechanism', w: 2 }, { t: 'one could say', w: 2 }, { t: 'interesting that', w: 1 },
      { t: 'analyse', w: 1 }, { t: 'analyze', w: 1 }, { t: 'framework', w: 1 }
    ]
  },
  {
    id: 'projektion',
    de: 'Projektion',
    en: 'Projection',
    level: 'unreif',
    noteDe: 'Das eigene Gefühl wird im Gegenüber vermutet. Sprachlich auffällig: sehr sichere Aussagen darüber, was andere denken oder fühlen.',
    noteEn: 'One\'s own feeling is assumed in the other. Linguistically striking: very confident statements about what others think or feel.',
    terms: [
      { t: 'er denkt', w: 2 }, { t: 'sie denkt', w: 2 }, { t: 'die denken', w: 2 },
      { t: 'er findet mich', w: 2 }, { t: 'sie findet mich', w: 2 }, { t: 'alle finden', w: 2 },
      { t: 'man merkt doch', w: 2 }, { t: 'offensichtlich will', w: 2 }, { t: 'er hasst', w: 2 },
      { t: 'sie hasst', w: 2 }, { t: 'die wollen mich', w: 2 }, { t: 'hält mich für', w: 2 },
      { t: 'schaut mich an als', w: 2 }, { t: 'sicher denkt', w: 2 },
      { t: 'he thinks', w: 2 }, { t: 'she thinks', w: 2 }, { t: 'they think', w: 2 },
      { t: 'everyone thinks', w: 2 }, { t: 'obviously wants', w: 2 }, { t: 'they all', w: 1 },
      { t: 'sees me as', w: 2 }, { t: 'must think', w: 2 }
    ]
  },
  {
    id: 'verleugnung',
    de: 'Verleugnung / Verharmlosung',
    en: 'Denial / Minimisation',
    level: 'unreif',
    noteDe: 'Das Problem wird kleingeredet, während der Körper oder die Stimmung etwas anderes sagt.',
    noteEn: 'The problem is talked down while the body or the mood says something else.',
    terms: [
      { t: 'ist schon ok', w: 2 }, { t: 'halb so wild', w: 2 }, { t: 'kein problem', w: 1 },
      { t: 'geht schon', w: 2 }, { t: 'passt schon', w: 2 }, { t: 'nicht der rede wert', w: 2 },
      { t: 'egal', w: 1 }, { t: 'stört mich nicht', w: 2 }, { t: 'kein drama', w: 2 },
      { t: 'übertreibe', w: 2 }, { t: 'stelle mich an', w: 2 }, { t: 'anderen geht es schlechter', w: 2 },
      { t: 'it is fine', w: 2 }, { t: 'no big deal', w: 2 }, { t: 'i am fine', w: 2 },
      { t: 'whatever', w: 1 }, { t: 'does not bother me', w: 2 }, { t: 'overreacting', w: 2 },
      { t: 'others have it worse', w: 2 }
    ]
  },
  {
    id: 'wendung_gegen_selbst',
    de: 'Wendung gegen das Selbst',
    en: 'Turning against the self',
    level: 'unreif',
    noteDe: 'Aggression, die eigentlich jemandem gilt, richtet sich nach innen. Erscheint als harte Selbstkritik direkt nach einer Kränkung.',
    noteEn: 'Aggression meant for someone else turns inward. Appears as harsh self-criticism right after an injury.',
    terms: [
      { t: 'ich bin so dumm', w: 2 }, { t: 'mein fehler', w: 2 }, { t: 'typisch ich', w: 2 },
      { t: 'ich mache immer', w: 2 }, { t: 'hasse mich', w: 2 }, { t: 'ärgere mich über mich', w: 2 },
      { t: 'ich bin zu', w: 1 }, { t: 'reiß dich zusammen', w: 2 }, { t: 'selbst schuld', w: 2 },
      { t: 'verdiene es nicht', w: 2 }, { t: 'mit mir stimmt was nicht', w: 2 },
      { t: 'i am so stupid', w: 2 }, { t: 'hate myself', w: 2 }, { t: 'typical me', w: 2 },
      { t: 'my own fault', w: 2 }, { t: 'pull yourself together', w: 2 },
      { t: 'something wrong with me', w: 2 }, { t: 'do not deserve', w: 2 }
    ]
  },
  {
    id: 'spaltung',
    de: 'Spaltung (Schwarz-Weiß)',
    en: 'Splitting (all-or-nothing)',
    level: 'unreif',
    noteDe: 'Menschen und Situationen kippen zwischen ganz gut und ganz schlecht. Absolutwörter häufen sich.',
    noteEn: 'People and situations flip between all good and all bad. Absolute words accumulate.',
    terms: [
      { t: 'immer', w: 1 }, { t: 'nie', w: 1 }, { t: 'niemals', w: 2 },
      { t: 'alle', w: 1 }, { t: 'keiner', w: 1 }, { t: 'niemand', w: 1 },
      { t: 'komplett', w: 1 }, { t: 'total', w: 1 }, { t: 'absolut', w: 1 },
      { t: 'überhaupt nicht', w: 2 }, { t: 'nur noch', w: 1 }, { t: 'entweder oder', w: 2 },
      { t: 'perfekt oder', w: 2 }, { t: 'grundsätzlich', w: 1 },
      { t: 'always', w: 1 }, { t: 'never', w: 1 }, { t: 'everyone', w: 1 },
      { t: 'no one', w: 1 }, { t: 'nobody', w: 1 }, { t: 'completely', w: 1 },
      { t: 'totally', w: 1 }, { t: 'absolutely', w: 1 }, { t: 'all or nothing', w: 2 }
    ]
  },
  {
    id: 'idealisierung',
    de: 'Idealisierung / Entwertung',
    en: 'Idealisation / Devaluation',
    level: 'unreif',
    noteDe: 'Jemand wird überhöht oder abgewertet — häufig dieselbe Person zu verschiedenen Zeitpunkten. Lohnt sich, im Verlauf zu verfolgen.',
    noteEn: 'Someone is elevated or written off — often the same person at different times. Worth tracking over time.',
    terms: [
      { t: 'perfekt', w: 1 }, { t: 'der beste', w: 2 }, { t: 'die beste', w: 2 },
      { t: 'wie ein gott', w: 2 }, { t: 'bewunder*', w: 2 }, { t: 'unglaublich gut', w: 2 },
      { t: 'wertlos', w: 1 }, { t: 'lächerlich', w: 2 }, { t: 'erbärmlich', w: 2 },
      { t: 'nichts wert', w: 2 }, { t: 'inkompetent', w: 2 }, { t: 'überschätzt', w: 2 },
      { t: 'enttäuscht von', w: 1 },
      { t: 'the best', w: 2 }, { t: 'admire', w: 2 }, { t: 'amazing', w: 1 },
      { t: 'pathetic', w: 2 }, { t: 'ridiculous', w: 2 }, { t: 'incompetent', w: 2 },
      { t: 'overrated', w: 2 }
    ]
  },
  {
    id: 'verschiebung',
    de: 'Verschiebung',
    en: 'Displacement',
    level: 'neurotisch',
    noteDe: 'Der Affekt entlädt sich an einem sicheren Ziel statt am eigentlichen. Klassisch: Streit zu Hause nach einem Konflikt bei der Arbeit.',
    noteEn: 'The affect discharges onto a safe target instead of the real one. Classic: a fight at home after a conflict at work.',
    terms: [
      { t: 'ausgelassen an', w: 2 }, { t: 'abreagiert', w: 2 }, { t: 'angeschnauzt', w: 2 },
      { t: 'eigentlich ging es gar nicht', w: 2 }, { t: 'kleinigkeit', w: 1 },
      { t: 'wegen nichts', w: 2 }, { t: 'überreagiert', w: 2 }, { t: 'falscher adressat', w: 2 },
      { t: 'took it out on', w: 2 }, { t: 'snapped at', w: 2 }, { t: 'over nothing', w: 2 },
      { t: 'overreacted', w: 2 }, { t: 'small thing', w: 1 }
    ]
  },
  {
    id: 'reaktionsbildung',
    de: 'Reaktionsbildung',
    en: 'Reaction formation',
    level: 'neurotisch',
    noteDe: 'Das Gegenteil des Impulses wird betont — betonte Freundlichkeit gegenüber jemandem, über den man sich ärgert.',
    noteEn: 'The opposite of the impulse is emphasised — pronounced friendliness toward someone one is angry at.',
    terms: [
      { t: 'besonders nett', w: 2 }, { t: 'extra freundlich', w: 2 }, { t: 'obwohl ich wütend', w: 2 },
      { t: 'trotzdem lieb', w: 2 }, { t: 'gönne es ihm', w: 2 }, { t: 'gönne es ihr', w: 2 },
      { t: 'freue mich für', w: 1 }, { t: 'muss ich ja', w: 1 },
      { t: 'extra nice', w: 2 }, { t: 'even though i was angry', w: 2 },
      { t: 'happy for them', w: 1 }, { t: 'i should be glad', w: 2 }
    ]
  },
  {
    id: 'vermeidung',
    de: 'Vermeidung / Aufschub',
    en: 'Avoidance / Procrastination',
    level: 'unreif',
    noteDe: 'Die Situation wird umgangen, das Gefühl damit auch. Kurzfristig entlastend, langfristig verstärkend.',
    noteEn: 'The situation is circumvented, and with it the feeling. Short-term relief, long-term reinforcement.',
    terms: [
      { t: 'aufgeschob*', w: 2 }, { t: 'verschob*', w: 1 }, { t: 'ausgewichen', w: 2 },
      { t: 'vermeid*', w: 2 }, { t: 'nicht angesprochen', w: 2 }, { t: 'abgesagt', w: 1 },
      { t: 'ignorier*', w: 1 }, { t: 'ablenk*', w: 1 }, { t: 'prokrastinier*', w: 2 },
      { t: 'lieber nicht', w: 1 }, { t: 'ausgeblendet', w: 2 }, { t: 'weggeschoben', w: 2 },
      { t: 'avoided', w: 2 }, { t: 'put off', w: 2 }, { t: 'procrastinat', w: 2 },
      { t: 'cancelled', w: 1 }, { t: 'did not bring it up', w: 2 }, { t: 'distracted myself', w: 2 },
      { t: 'ignored', w: 1 }
    ]
  },
  {
    id: 'somatisierung',
    de: 'Somatisierung',
    en: 'Somatisation',
    level: 'unreif',
    noteDe: 'Der Konflikt spricht durch den Körper. Kopfschmerz, Magen, Schlaf — lohnt sich, mit den Themen derselben Woche zu vergleichen.',
    noteEn: 'The conflict speaks through the body. Headache, stomach, sleep — worth comparing with the themes of the same week.',
    terms: [
      { t: 'kopfschmerz*', w: 2 }, { t: 'magen', w: 2 }, { t: 'übelkeit', w: 2 },
      { t: 'verspannt', w: 2 }, { t: 'nacken', w: 2 }, { t: 'rücken', w: 1 },
      { t: 'schlaflos', w: 2 }, { t: 'nicht schlafen', w: 2 }, { t: 'herzrasen', w: 2 },
      { t: 'enge in der brust', w: 2 }, { t: 'kloß im hals', w: 2 }, { t: 'zitter*', w: 2 },
      { t: 'schwindel', w: 2 }, { t: 'erschöpft', w: 1 }, { t: 'kein appetit', w: 2 },
      { t: 'headache', w: 2 }, { t: 'stomach', w: 2 }, { t: 'nausea', w: 2 },
      { t: 'tense shoulders', w: 2 }, { t: 'could not sleep', w: 2 }, { t: 'heart racing', w: 2 },
      { t: 'tight chest', w: 2 }, { t: 'lump in my throat', w: 2 }, { t: 'dizzy', w: 2 }
    ]
  },
  {
    id: 'sublimierung',
    de: 'Sublimierung',
    en: 'Sublimation',
    level: 'reif',
    noteDe: 'Der Impuls findet eine Form, die trägt: Sport, Musik, Schreiben, Arbeit an etwas Sinnvollem. Ein reifer Umgang — wert, bemerkt zu werden.',
    noteEn: 'The impulse finds a form that holds: sport, music, writing, work on something meaningful. A mature handling — worth noticing.',
    terms: [
      { t: 'geschrieben', w: 1 }, { t: 'komponiert', w: 2 }, { t: 'gemalt', w: 2 },
      { t: 'sport gemacht', w: 2 }, { t: 'laufen gegangen', w: 2 }, { t: 'musik gemacht', w: 2 },
      { t: 'rausgelassen durch', w: 2 }, { t: 'kanalisiert', w: 2 }, { t: 'in etwas gesteckt', w: 2 },
      { t: 'kreativ', w: 1 }, { t: 'projekt', w: 1 },
      { t: 'went running', w: 2 }, { t: 'worked out', w: 2 }, { t: 'wrote about', w: 2 },
      { t: 'channelled', w: 2 }, { t: 'channeled', w: 2 }, { t: 'poured it into', w: 2 }
    ]
  },
  {
    id: 'humor_mentalisierung',
    de: 'Humor & Mentalisierung',
    en: 'Humour & Mentalising',
    level: 'reif',
    noteDe: 'Über sich schmunzeln können, die Perspektive des anderen mitdenken, Gefühle als Zustände und nicht als Tatsachen behandeln. Ein Ressourcenmarker.',
    noteEn: 'Being able to smile at oneself, holding the other\'s perspective in mind, treating feelings as states rather than facts. A resource marker.',
    terms: [
      { t: 'aus seiner sicht', w: 2 }, { t: 'aus ihrer sicht', w: 2 }, { t: 'vielleicht fühlt', w: 2 },
      { t: 'kann ich verstehen', w: 2 }, { t: 'lachen musste', w: 2 }, { t: 'im nachhinein komisch', w: 2 },
      { t: 'mir fiel auf', w: 2 }, { t: 'ich merke, dass ich', w: 2 }, { t: 'ein teil von mir', w: 2 },
      { t: 'könnte auch sein', w: 2 }, { t: 'möglicherweise', w: 1 },
      { t: 'from his perspective', w: 2 }, { t: 'from her perspective', w: 2 },
      { t: 'part of me', w: 2 }, { t: 'i noticed that i', w: 2 }, { t: 'maybe they felt', w: 2 },
      { t: 'had to laugh', w: 2 }, { t: 'i can understand', w: 2 }
    ]
  }
];

/* ------------------------------------------------------------------ *
 * 3. LEBENSBEREICHE / LIFE DOMAINS
 * ------------------------------------------------------------------ */

export const DOMAINS = [
  {
    id: 'arbeit', de: 'Arbeit & Beruf', en: 'Work & Career',
    terms: [
      { t: 'arbeit', w: 1 }, { t: 'job', w: 1 }, { t: 'büro', w: 2 }, { t: 'chef', w: 2 },
      { t: 'chefin', w: 2 }, { t: 'kollege', w: 2 }, { t: 'kollegin', w: 2 }, { t: 'kollegen', w: 2 },
      { t: 'meeting', w: 2 }, { t: 'deadline', w: 2 }, { t: 'projekt', w: 1 }, { t: 'karriere', w: 2 },
      { t: 'beförderung', w: 2 }, { t: 'kündigung', w: 2 }, { t: 'überstunden', w: 2 },
      { t: 'boss', w: 2 }, { t: 'colleague', w: 2 }, { t: 'coworker', w: 2 }, { t: 'promotion', w: 2 },
      { t: 'workload', w: 2 }, { t: 'career', w: 2 }, { t: 'office', w: 2 }
    ]
  },
  {
    id: 'partnerschaft', de: 'Partnerschaft & Intimität', en: 'Partnership & Intimacy',
    terms: [
      { t: 'partner', w: 2 }, { t: 'partnerin', w: 2 }, { t: 'freundin', w: 1 }, { t: 'freund', w: 1 },
      { t: 'beziehung', w: 2 }, { t: 'ehe', w: 2 }, { t: 'mann', w: 1 }, { t: 'frau', w: 1 },
      { t: 'date', w: 2 }, { t: 'trennung', w: 2 }, { t: 'streit', w: 1 }, { t: 'sex', w: 2 },
      { t: 'intimität', w: 2 }, { t: 'zärtlichkeit', w: 2 }, { t: 'verliebt', w: 2 },
      { t: 'relationship', w: 2 }, { t: 'marriage', w: 2 }, { t: 'boyfriend', w: 2 },
      { t: 'girlfriend', w: 2 }, { t: 'husband', w: 2 }, { t: 'wife', w: 2 }, { t: 'breakup', w: 2 },
      { t: 'intimacy', w: 2 }
    ]
  },
  {
    id: 'herkunftsfamilie', de: 'Herkunftsfamilie', en: 'Family of Origin',
    terms: [
      { t: 'mutter', w: 2 }, { t: 'vater', w: 2 }, { t: 'mama', w: 2 }, { t: 'papa', w: 2 },
      { t: 'eltern', w: 2 }, { t: 'bruder', w: 2 }, { t: 'schwester', w: 2 }, { t: 'geschwister', w: 2 },
      { t: 'oma', w: 2 }, { t: 'opa', w: 2 }, { t: 'kindheit', w: 2 }, { t: 'als kind', w: 2 },
      { t: 'zuhause früher', w: 2 }, { t: 'familie', w: 1 }, { t: 'erziehung', w: 2 },
      { t: 'mother', w: 2 }, { t: 'father', w: 2 }, { t: 'mom', w: 2 }, { t: 'dad', w: 2 },
      { t: 'parents', w: 2 }, { t: 'brother', w: 2 }, { t: 'sister', w: 2 }, { t: 'sibling', w: 2 },
      { t: 'childhood', w: 2 }, { t: 'as a child', w: 2 }, { t: 'grew up', w: 2 }
    ]
  },
  {
    id: 'eigene_familie', de: 'Eigene Familie & Kinder', en: 'Own Family & Children',
    // Bewusst ohne das blanke „kind": „als Kind" meint die eigene Kindheit
    // und gehört zur Herkunftsfamilie, nicht hierher.
    terms: [
      { t: 'mein kind', w: 2 }, { t: 'kinder', w: 2 }, { t: 'sohn', w: 2 }, { t: 'tochter', w: 2 },
      { t: 'schwangerschaft', w: 2 }, { t: 'kita', w: 2 }, { t: 'schule', w: 1 }, { t: 'elternabend', w: 2 },
      { t: 'son', w: 2 }, { t: 'daughter', w: 2 }, { t: 'kids', w: 2 }, { t: 'parenting', w: 2 },
      { t: 'my child', w: 2 }
    ]
  },
  {
    id: 'freundschaft', de: 'Freundschaft & soziales Umfeld', en: 'Friendship & Social',
    terms: [
      { t: 'freunde', w: 2 }, { t: 'freundeskreis', w: 2 }, { t: 'bekannte', w: 1 },
      { t: 'eingeladen', w: 1 }, { t: 'absage', w: 1 }, { t: 'geburtstag', w: 1 },
      { t: 'gruppe', w: 1 }, { t: 'nachbarn', w: 2 },
      { t: 'friends', w: 2 }, { t: 'friendship', w: 2 }, { t: 'invited', w: 1 },
      { t: 'social', w: 1 }, { t: 'party', w: 1 }
    ]
  },
  {
    id: 'koerper', de: 'Körper & Gesundheit', en: 'Body & Health',
    terms: [
      { t: 'körper', w: 2 }, { t: 'gesundheit', w: 2 }, { t: 'krank', w: 2 }, { t: 'arzt', w: 2 },
      { t: 'schlaf', w: 2 }, { t: 'müde', w: 1 }, { t: 'schmerz*', w: 2 }, { t: 'diagnose', w: 2 },
      { t: 'sport', w: 1 }, { t: 'essen', w: 1 }, { t: 'gewicht', w: 2 }, { t: 'alkohol', w: 2 },
      { t: 'body', w: 2 }, { t: 'health', w: 2 }, { t: 'sick', w: 2 }, { t: 'doctor', w: 2 },
      { t: 'sleep', w: 2 }, { t: 'pain', w: 2 }, { t: 'tired', w: 1 }, { t: 'exercise', w: 1 }
    ]
  },
  {
    id: 'existenz', de: 'Geld & Existenz', en: 'Money & Livelihood',
    terms: [
      { t: 'geld', w: 2 }, { t: 'miete', w: 2 }, { t: 'rechnung', w: 2 }, { t: 'schulden', w: 2 },
      { t: 'existenz', w: 2 }, { t: 'spar*', w: 1 }, { t: 'teuer', w: 1 }, { t: 'gehalt', w: 2 },
      { t: 'wohnung', w: 1 }, { t: 'umzug', w: 2 },
      { t: 'money', w: 2 }, { t: 'rent', w: 2 }, { t: 'debt', w: 2 }, { t: 'salary', w: 2 },
      { t: 'bills', w: 2 }, { t: 'afford', w: 2 }
    ]
  },
  {
    id: 'sinn', de: 'Sinn & Orientierung', en: 'Meaning & Orientation',
    terms: [
      { t: 'sinn', w: 2 }, { t: 'sinnlos', w: 2 }, { t: 'werte', w: 2 }, { t: 'glaube', w: 2 },
      { t: 'spiritualität', w: 2 }, { t: 'tod', w: 2 }, { t: 'endlichkeit', w: 2 },
      { t: 'zukunft', w: 1 }, { t: 'lebensziel', w: 2 }, { t: 'berufung', w: 2 },
      { t: 'meaning', w: 2 }, { t: 'meaningless', w: 2 }, { t: 'purpose', w: 2 },
      { t: 'values', w: 2 }, { t: 'faith', w: 2 }, { t: 'death', w: 2 }, { t: 'mortality', w: 2 }
    ]
  },
  {
    id: 'einsamkeit', de: 'Einsamkeit & Rückzug', en: 'Loneliness & Withdrawal',
    terms: [
      { t: 'einsam', w: 2 }, { t: 'allein', w: 1 }, { t: 'niemand da', w: 2 },
      { t: 'zurückgezogen', w: 2 }, { t: 'isolier*', w: 2 }, { t: 'kein kontakt', w: 2 },
      { t: 'abgeschottet', w: 2 }, { t: 'melde mich nicht', w: 2 },
      { t: 'lonely', w: 2 }, { t: 'alone', w: 1 }, { t: 'isolated', w: 2 },
      { t: 'withdrew', w: 2 }, { t: 'no one to', w: 2 }
    ]
  },
  {
    id: 'grenzen', de: 'Grenzen & Nein-Sagen', en: 'Boundaries & Saying No',
    terms: [
      { t: 'grenze', w: 2 }, { t: 'grenzen', w: 2 }, { t: 'nein gesagt', w: 2 },
      { t: 'nicht nein', w: 2 }, { t: 'ausnutz*', w: 2 }, { t: 'übergriffig', w: 2 },
      { t: 'zu viel zugesagt', w: 2 }, { t: 'überfordert', w: 1 }, { t: 'abgrenzen', w: 2 },
      { t: 'boundaries', w: 2 }, { t: 'said no', w: 2 }, { t: 'could not say no', w: 2 },
      { t: 'taken advantage', w: 2 }, { t: 'overcommitted', w: 2 }
    ]
  },
  {
    id: 'perfektionismus', de: 'Perfektionismus & Leistung', en: 'Perfectionism & Performance',
    terms: [
      { t: 'perfektionismus', w: 2 }, { t: 'muss perfekt', w: 2 }, { t: 'hohe ansprüche', w: 2 },
      { t: 'nie zufrieden', w: 2 }, { t: 'leistungsdruck', w: 2 }, { t: 'fehler gemacht', w: 1 },
      { t: 'genügen', w: 2 }, { t: 'ansprüche', w: 1 },
      { t: 'perfectionism', w: 2 }, { t: 'has to be perfect', w: 2 }, { t: 'high standards', w: 2 },
      { t: 'never satisfied', w: 2 }, { t: 'pressure to perform', w: 2 }
    ]
  },
  {
    id: 'verlust', de: 'Verlust & Abschied', en: 'Loss & Parting',
    terms: [
      { t: 'verlust', w: 2 }, { t: 'gestorben', w: 2 }, { t: 'beerdigung', w: 2 },
      { t: 'abschied', w: 2 }, { t: 'trennung', w: 1 }, { t: 'verloren', w: 1 },
      { t: 'vermisse', w: 2 }, { t: 'nicht mehr da', w: 2 },
      { t: 'loss', w: 2 }, { t: 'died', w: 2 }, { t: 'funeral', w: 2 },
      { t: 'goodbye', w: 1 }, { t: 'miss', w: 1 }, { t: 'gone', w: 1 }
    ]
  }
];

/* ------------------------------------------------------------------ *
 * 4. SPRACHMARKER / LINGUISTIC MARKERS
 * ------------------------------------------------------------------ */

/**
 * Wiederholungsmarker. Wenn "immer", "schon wieder", "wie damals" im
 * Because-Teil auftauchen, deutet das auf ein erlebtes Muster hin —
 * im psychodynamischen Denken der Kern des Wiederholungszwangs.
 */
export const REPETITION_MARKERS = [
  { t: 'immer wieder', w: 2 }, { t: 'schon wieder', w: 2 }, { t: 'jedes mal', w: 2 },
  { t: 'wie immer', w: 2 }, { t: 'wie damals', w: 2 }, { t: 'schon als kind', w: 2 },
  { t: 'seit jeher', w: 2 }, { t: 'typisch für mich', w: 2 }, { t: 'immer dasselbe', w: 2 },
  { t: 'genau wie', w: 1 }, { t: 'erinnert mich an', w: 2 }, { t: 'kenne ich', w: 1 },
  { t: 'again and again', w: 2 }, { t: 'every time', w: 2 }, { t: 'as always', w: 2 },
  { t: 'like back then', w: 2 }, { t: 'since childhood', w: 2 }, { t: 'same as', w: 1 },
  { t: 'reminds me of', w: 2 }, { t: 'here we go again', w: 2 }, { t: 'typical for me', w: 2 }
];

/** Attribution: Worauf wird das Gefühl zurückgeführt? */
export const ATTRIBUTION = [
  {
    id: 'selbst', de: 'auf mich selbst', en: 'to myself',
    terms: [
      { t: 'ich habe', w: 1 }, { t: 'ich bin', w: 1 }, { t: 'mein fehler', w: 2 },
      { t: 'meine schuld', w: 2 }, { t: 'ich konnte nicht', w: 2 }, { t: 'ich wollte', w: 1 },
      { t: 'mir fällt schwer', w: 2 }, { t: 'ich schaffe', w: 1 }, { t: 'mich selbst', w: 2 },
      { t: 'i did', w: 1 }, { t: 'i am', w: 1 }, { t: 'my fault', w: 2 },
      { t: 'i could not', w: 2 }, { t: 'i failed', w: 2 }, { t: 'myself', w: 2 }
    ]
  },
  {
    id: 'andere', de: 'auf andere Menschen', en: 'to other people',
    terms: [
      { t: ' er ', w: 1 }, { t: ' sie ', w: 1 }, { t: 'mein partner', w: 2 },
      { t: 'meine partnerin', w: 2 }, { t: 'mein chef', w: 2 }, { t: 'meine mutter', w: 2 },
      { t: 'mein vater', w: 2 }, { t: 'die anderen', w: 2 }, { t: 'niemand hat', w: 2 },
      { t: 'man hat mir', w: 2 }, { t: 'wurde ich', w: 1 },
      { t: ' he ', w: 1 }, { t: ' she ', w: 1 }, { t: ' they ', w: 1 },
      { t: 'my boss', w: 2 }, { t: 'my mother', w: 2 }, { t: 'my father', w: 2 },
      { t: 'my partner', w: 2 }, { t: 'no one', w: 1 }
    ]
  },
  {
    id: 'umstaende', de: 'auf Umstände', en: 'to circumstances',
    terms: [
      { t: 'die situation', w: 2 }, { t: 'die umstände', w: 2 }, { t: 'das wetter', w: 2 },
      { t: 'zu wenig zeit', w: 2 }, { t: 'die arbeit', w: 1 }, { t: 'der termin', w: 1 },
      { t: 'es ist einfach', w: 1 }, { t: 'zufall', w: 2 }, { t: 'der tag', w: 1 },
      { t: 'the situation', w: 2 }, { t: 'circumstances', w: 2 }, { t: 'the weather', w: 2 },
      { t: 'no time', w: 2 }, { t: 'it just', w: 1 }
    ]
  },
  {
    id: 'koerperlich', de: 'auf den Körper', en: 'to the body',
    terms: [
      { t: 'schlecht geschlafen', w: 2 }, { t: 'müde', w: 1 }, { t: 'krank', w: 1 },
      { t: 'hormone', w: 2 }, { t: 'kopfschmerz*', w: 2 }, { t: 'erschöpft', w: 1 },
      { t: 'slept badly', w: 2 }, { t: 'tired', w: 1 }, { t: 'sick', w: 1 },
      { t: 'exhausted', w: 1 }, { t: 'headache', w: 2 }
    ]
  }
];

/* ------------------------------------------------------------------ *
 * 5. SICHERHEIT / SAFETY
 * Keine Analyse, sondern ein Hinweis auf echte Hilfe.
 * ------------------------------------------------------------------ */

export const CRISIS_MARKERS = [
  'nicht mehr leben', 'nicht mehr weiterleben', 'mich umbringen', 'selbstmord', 'suizid',
  'aus dem leben scheiden', 'alles beenden', 'keinen ausweg', 'nicht mehr aufwachen',
  'mir etwas antun', 'mich verletzen', 'ritzen', 'wäre besser ohne mich',
  'kill myself', 'end my life', 'suicide', 'suicidal', 'not want to live',
  'hurt myself', 'self-harm', 'better off without me', 'no way out', 'end it all'
];

export const CRISIS_RESOURCES = {
  de: {
    title: 'Wenn es gerade wirklich schwer ist',
    body: 'Dieses Journal ist ein Werkzeug zum Nachdenken — kein Notfallkontakt und keine Behandlung. Wenn Gedanken daran auftauchen, nicht mehr leben zu wollen, sprich bitte mit einem Menschen.',
    contacts: [
      'Telefonseelsorge (DE, kostenlos, 24/7): 0800 111 0 111 oder 0800 111 0 222',
      'Telefonseelsorge Chat & Mail: online-telefonseelsorge.de',
      'Österreich – Telefonseelsorge: 142',
      'Schweiz – Die Dargebotene Hand: 143',
      'In akuter Gefahr: Notruf 112'
    ]
  },
  en: {
    title: 'If things are genuinely hard right now',
    body: 'This journal is a tool for reflection — not an emergency contact and not treatment. If thoughts of not wanting to live come up, please talk to a person.',
    contacts: [
      'Germany – Telefonseelsorge (free, 24/7): 0800 111 0 111 or 0800 111 0 222',
      'UK & Ireland – Samaritans: 116 123',
      'US & Canada – 988 Suicide & Crisis Lifeline: call or text 988',
      'International directory: findahelpline.com',
      'In immediate danger: call your local emergency number'
    ]
  }
};

/* ------------------------------------------------------------------ *
 * 6. LITERATUR / LITERATURE
 * Wird im Dialog und in den Trendberichten zitiert.
 * ------------------------------------------------------------------ */

export const LITERATURE = {
  granularity: {
    ref: 'Barrett, L. F. (2017). How Emotions Are Made. / Kashdan, Barrett & McKnight (2015), Current Directions in Psychological Science.',
    de: 'Je genauer ein Gefühl benannt wird, desto besser lässt es sich regulieren — „emotionale Granularität".',
    en: 'The more precisely a feeling is named, the better it can be regulated — "emotional granularity".'
  },
  expressiveWriting: {
    ref: 'Pennebaker, J. W. & Smyth, J. M. (2016). Opening Up by Writing It Down.',
    de: 'Über belastende Erfahrungen zu schreiben wirkt vor allem dann, wenn Gefühl und Ursache verbunden werden — genau das leistet die „weil"-Struktur.',
    en: 'Writing about distressing experiences works above all when feeling and cause get linked — which is exactly what the "because" structure does.'
  },
  ccrt: {
    ref: 'Luborsky, L. & Crits-Christoph, P. (1998). Understanding Transference: The CCRT Method.',
    de: 'Beziehungserfahrungen folgen oft einem festen Dreischritt: Wunsch – Reaktion des anderen – Reaktion des Selbst. Dieses Muster wiederholt sich über Personen hinweg.',
    en: 'Relational experiences often follow a fixed three-step: wish – response of the other – response of the self. This pattern repeats across different people.'
  },
  defences: {
    ref: 'A. Freud (1936). Das Ich und die Abwehrmechanismen. / Vaillant, G. (1992). Ego Mechanisms of Defense.',
    de: 'Abwehr ist nicht schlecht — sie schützt. Interessant wird sie dort, wo sie starr wird und immer dieselbe Lösung anbietet.',
    en: 'Defence is not bad — it protects. It becomes interesting where it turns rigid and always offers the same solution.'
  },
  opd: {
    ref: 'Arbeitskreis OPD (2023). Operationalisierte Psychodynamische Diagnostik OPD-3. Hogrefe.',
    de: 'Wiederkehrende Grundkonflikte lassen sich als Spannungsfelder beschreiben — etwa Abhängigkeit gegen Autonomie.',
    en: 'Recurring core conflicts can be described as fields of tension — for instance dependence versus autonomy.'
  },
  structure: {
    ref: 'Rudolf, G. (2013). Strukturbezogene Psychotherapie. Schattauer.',
    de: 'Neben dem Konflikt zählt die Fähigkeit zur Selbstregulation: sich selbst wahrnehmen, steuern, an andere binden.',
    en: 'Beyond conflict, what counts is the capacity for self-regulation: perceiving oneself, steering, binding to others.'
  },
  mentalizing: {
    ref: 'Fonagy, P. & Bateman, A. (2016). Mentalization-Based Treatment for Personality Disorders.',
    de: 'Mentalisieren heißt: eigenes und fremdes Verhalten als Ausdruck innerer Zustände verstehen — auch unter Belastung.',
    en: 'Mentalising means understanding one\'s own and others\' behaviour as an expression of inner states — even under stress.'
  },
  eft: {
    ref: 'Greenberg, L. S. (2015). Emotion-Focused Therapy: Coaching Clients to Work Through Their Feelings.',
    de: 'Unter einem „sekundären" Gefühl (z. B. Wut) liegt oft ein „primäres" (z. B. Verletzung). Das primäre trägt die Information.',
    en: 'Beneath a "secondary" emotion (e.g. anger) often lies a "primary" one (e.g. hurt). The primary one carries the information.'
  },
  attachment: {
    ref: 'Bowlby, J. (1988). A Secure Base. / Mikulincer & Shaver (2016). Attachment in Adulthood.',
    de: 'Frühe Bindungserfahrungen formen Erwartungen daran, ob Nähe sicher ist und ob Bedürfnisse zulässig sind.',
    en: 'Early attachment experiences shape expectations about whether closeness is safe and whether needs are permissible.'
  },
  socratic: {
    ref: 'Overholser, J. C. (2011). Collaborative Empiricism, Guided Discovery, and the Socratic Method. Clinical Psychology: Science and Practice.',
    de: 'Sokratisches Fragen wirkt, wenn es nicht zu einer vorgefertigten Antwort führt, sondern echte Neugier abbildet.',
    en: 'Socratic questioning works when it does not steer toward a prepared answer but reflects genuine curiosity.'
  },
  selfCompassion: {
    ref: 'Neff, K. & Germer, C. (2018). The Mindful Self-Compassion Workbook.',
    de: 'Selbstkritik erhöht Scham und senkt Veränderungsbereitschaft; Selbstmitgefühl erhöht sie.',
    en: 'Self-criticism raises shame and lowers willingness to change; self-compassion raises it.'
  }
};

export const ALL_THEME_GROUPS = [
  { key: 'conflicts', de: 'Grundkonflikte', en: 'Core conflicts', items: CONFLICTS },
  { key: 'defences', de: 'Abwehr & Bewältigung', en: 'Defence & coping', items: DEFENCES },
  { key: 'domains', de: 'Lebensbereiche', en: 'Life domains', items: DOMAINS }
];

