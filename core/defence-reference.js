/**
 * Nachschlagewerk zu den Abwehrfiguren.
 * Reference for the defence figures.
 *
 * Warum diese Datei getrennt steht: Die Einstufung „reif / neurotisch / unreif"
 * ist die einzige Stelle in der App, die wie ein Urteil aussieht. Deshalb muss
 * offenliegen, woher sie kommt, was sie bedeutet und wo sie nicht hinreicht.
 *
 * GRUNDLAGE
 * George E. Vaillant hat Abwehrmechanismen hierarchisch geordnet und über
 * Jahrzehnte längsschnittlich untersucht (Grant Study). Seine Ebenen:
 *
 *   Level I    pathologisch   (z. B. wahnhafte Projektion, Verleugnung, Verzerrung)
 *   Level II   unreif         (z. B. Projektion, Spaltung, Somatisierung, Idealisierung)
 *   Level III  neurotisch     (z. B. Verdrängung, Intellektualisierung, Verschiebung,
 *                              Reaktionsbildung, Rationalisierung)
 *   Level IV   reif           (Sublimierung, Humor, Antizipation, Altruismus, Unterdrückung)
 *
 * Diese App fasst Level I und II zu „unreif" zusammen — nicht weil das
 * fachlich dasselbe wäre, sondern weil eine Wortzählung diese Grenze ohnehin
 * nicht ziehen kann. Wo das für einen Begriff eine Rolle spielt, steht es dabei.
 *
 * WICHTIG
 * Die Einstufung gilt Mechanismen, nicht Menschen. „Unreif" ist keine
 * Beschreibung deiner Person und kein Entwicklungsurteil — es ist Vaillants
 * Begriff für Abwehr, die kurzfristig entlastet und langfristig Kosten
 * verursacht. Jeder Mensch benutzt alle Ebenen, je nach Belastung.
 *
 * Vaillant, G. E. (1992). Ego Mechanisms of Defense: A Guide for Clinicians
 * and Researchers. American Psychiatric Press.
 * Vaillant, G. E. (2000). Adaptive mental mechanisms: Their role in a positive
 * psychology. American Psychologist, 55(1), 89–98.
 */

export const VAILLANT_REF = 'Vaillant, G. E. (1992). Ego Mechanisms of Defense. American Psychiatric Press.';

export const LEVELS = {
  reif: {
    de: { label: 'reif', roman: 'Level IV',
      text: 'Abwehr, die den Konflikt nicht wegschiebt, sondern ihm eine Form gibt, mit der man leben und die man anderen zeigen kann. Vaillant fand diese Formen in seinen Längsschnittdaten mit besserer Anpassung und Gesundheit verbunden.' },
    en: { label: 'mature', roman: 'Level IV',
      text: 'Defences that do not push the conflict away but give it a form one can live with and show to others. In Vaillant’s longitudinal data these were associated with better adaptation and health.' }
  },
  neurotisch: {
    de: { label: 'neurotisch', roman: 'Level III',
      text: 'Abwehr, die das Gefühl vom Ereignis trennt — man weiß, was passiert ist, spürt es aber nicht dazu. Alltäglich und oft unauffällig; sie kostet Lebendigkeit, nicht Realitätskontakt.' },
    en: { label: 'neurotic', roman: 'Level III',
      text: 'Defences that separate the feeling from the event — you know what happened but do not feel it alongside. Everyday and often inconspicuous; the cost is aliveness, not contact with reality.' }
  },
  unreif: {
    de: { label: 'unreif', roman: 'Level I–II',
      text: 'Abwehr, die den Konflikt nach außen verlagert oder in den Körper — sie entlastet sofort und schafft dafür an anderer Stelle neue Schwierigkeiten, oft in Beziehungen. Unter starker Belastung greift jeder darauf zurück.' },
    en: { label: 'immature', roman: 'Level I–II',
      text: 'Defences that relocate the conflict outward or into the body — immediate relief, at the price of new difficulty elsewhere, often in relationships. Under heavy strain everyone falls back on these.' }
  }
};

/**
 * Definitionen. `source` sagt, worauf sich der Begriff stützt:
 *   'vaillant'  — steht so in Vaillants Ordnung
 *   'freud'     — klassischer Begriff (A. Freud 1936), von Vaillant eingeordnet
 *   'adapted'   — Zusatz dieser App, NICHT aus Vaillant; als solcher gekennzeichnet
 */
export const DEFENCE_DEFS = {
  rationalisierung: {
    source: 'vaillant', level: 'neurotisch',
    de: 'Ein Verhalten oder Gefühl wird nachträglich mit plausiblen Gründen erklärt, die nicht die eigentlichen sind. Die Erklärung stimmt oft sogar — sie ist nur nicht der Grund.',
    en: 'A behaviour or feeling is explained after the fact with plausible reasons that are not the actual ones. The explanation is often even true — it just is not the reason.'
  },
  intellektualisierung: {
    source: 'vaillant', level: 'neurotisch',
    de: 'Der belastende Inhalt wird in abstrakte, allgemeine oder fachliche Sprache überführt. Man denkt über das Gefühl, statt es zu haben. Bei Vaillant eng verwandt mit der Isolierung des Affekts.',
    en: 'The distressing content is translated into abstract, general or technical language. One thinks about the feeling instead of having it. In Vaillant closely related to isolation of affect.'
  },
  projektion: {
    source: 'vaillant', level: 'unreif',
    de: 'Ein eigener, nicht zugelassener Impuls oder Gefühlszustand wird einer anderen Person zugeschrieben und dort bekämpft oder gefürchtet.',
    en: 'One’s own disallowed impulse or feeling state is attributed to another person and then fought or feared there.'
  },
  verleugnung: {
    source: 'vaillant', level: 'unreif',
    note: 'Vaillant ordnet Verleugnung streng genommen Level I zu (pathologisch). Diese App fasst I und II zusammen; hier gemeint ist die alltägliche Verharmlosung, nicht die psychotische Realitätsverleugnung.',
    noteEn: 'Vaillant strictly places denial at Level I (pathological). This app merges I and II; what is meant here is everyday minimisation, not psychotic denial of reality.',
    de: 'Eine schmerzhafte äußere Tatsache wird nicht zur Kenntnis genommen oder in ihrer Bedeutung kleingeredet, obwohl sie erkennbar ist.',
    en: 'A painful external fact is not taken in, or is talked down in significance, although it is plainly there.'
  },
  wendung_gegen_selbst: {
    source: 'freud', level: 'unreif',
    note: 'Klassischer Begriff bei Anna Freud (1936). Vaillant führt das verwandte Muster als passive Aggression im unreifen Bereich.',
    noteEn: 'A classical term in Anna Freud (1936). Vaillant lists the related pattern as passive aggression among the immature defences.',
    de: 'Aggression, die einer anderen Person gilt, wird gegen die eigene Person gerichtet — als Selbstvorwurf, Selbstabwertung oder Selbstschädigung.',
    en: 'Aggression meant for another person is turned against oneself — as self-reproach, self-devaluation or self-harm.'
  },
  spaltung: {
    source: 'vaillant', level: 'unreif',
    de: 'Menschen oder Situationen werden abwechselnd ganz gut oder ganz schlecht erlebt, weil sich widersprüchliche Seiten nicht gleichzeitig aushalten lassen.',
    en: 'People or situations are experienced as alternately all good or all bad, because contradictory sides cannot be held at the same time.'
  },
  idealisierung: {
    source: 'vaillant', level: 'unreif',
    de: 'Einer Person werden übergroße Qualitäten zugeschrieben (Idealisierung) oder abgesprochen (Entwertung), um eigene Unsicherheit oder Enttäuschung zu regulieren. Beide gehören zusammen und wechseln oft.',
    en: 'A person is credited with outsized qualities (idealisation) or stripped of them (devaluation) in order to regulate one’s own insecurity or disappointment. The two belong together and often alternate.'
  },
  verschiebung: {
    source: 'vaillant', level: 'neurotisch',
    de: 'Ein Gefühl wird von seinem eigentlichen Ziel auf ein ungefährlicheres übertragen — der Ärger auf den Chef entlädt sich zu Hause.',
    en: 'A feeling is transferred from its actual target onto a safer one — anger at a boss discharges at home.'
  },
  reaktionsbildung: {
    source: 'vaillant', level: 'neurotisch',
    de: 'Ein unzulässiger Impuls wird ins Gegenteil verkehrt und in dieser Form betont — betonte Freundlichkeit gegenüber jemandem, dem der Ärger gilt.',
    en: 'An inadmissible impulse is turned into its opposite and emphasised in that form — pronounced friendliness toward someone the anger is meant for.'
  },
  vermeidung: {
    source: 'adapted', level: 'unreif',
    note: 'Kein eigener Begriff bei Vaillant, sondern eine Ergänzung dieser App. Verhaltensvermeidung wird in der Verhaltenstherapie beschrieben, nicht in der Abwehrlehre.',
    noteEn: 'Not a Vaillant category but an addition by this app. Behavioural avoidance is described in behaviour therapy, not in defence theory.',
    de: 'Die Situation wird umgangen, und mit ihr das Gefühl. Kurzfristig entlastend, langfristig verstärkt es meist genau das, was vermieden wird.',
    en: 'The situation is circumvented, and with it the feeling. Relieving short-term; long-term it usually reinforces exactly what is avoided.'
  },
  somatisierung: {
    source: 'vaillant', level: 'unreif',
    de: 'Psychischer Konflikt wird als körperliche Beschwerde erlebt und ausgedrückt — Kopfschmerz, Magen, Verspannung, Schlaflosigkeit. Die Beschwerden sind echt; strittig ist nicht ihr Vorhandensein, sondern ihr Anlass.',
    en: 'Psychic conflict is experienced and expressed as bodily complaint — headache, stomach, tension, sleeplessness. The complaints are real; what is at issue is not their existence but their occasion.'
  },
  sublimierung: {
    source: 'vaillant', level: 'reif',
    de: 'Ein Impuls wird nicht unterdrückt, sondern in eine Form gebracht, die sozial tragfähig und für die Person selbst befriedigend ist — Sport, Musik, Schreiben, Arbeit an einer Sache.',
    en: 'An impulse is not suppressed but given a form that is socially viable and satisfying to the person — sport, music, writing, work on something.'
  },
  humor_mentalisierung: {
    source: 'vaillant', level: 'reif',
    note: 'Humor gehört bei Vaillant zu den reifen Formen. Der hier mitgezählte Perspektivwechsel („Mentalisieren") stammt aus einer anderen Tradition (Fonagy & Bateman) und ist streng genommen keine Abwehr, sondern eine Fähigkeit.',
    noteEn: 'Humour is one of Vaillant’s mature forms. The perspective-taking counted alongside it ("mentalising") comes from another tradition (Fonagy & Bateman) and is strictly a capacity, not a defence.',
    de: 'Das Unangenehme wird ausgedrückt, ohne dass es jemandem — auch nicht einem selbst — schadet: über sich schmunzeln können, die Sicht des anderen mitdenken, ein Gefühl als Zustand behandeln statt als Tatsache.',
    en: 'The unpleasant is expressed without harming anyone, oneself included: being able to smile at yourself, holding the other’s view in mind, treating a feeling as a state rather than a fact.'
  }
};

/** Die Warnhinweise, die neben jeder Einstufung stehen müssen. */
export const METRIC_CAVEATS = {
  de: [
    'Gezählt werden Wörter, nicht Zustände. Die App erkennt Sprachfiguren in deinen Texten — sie versteht weder Ironie noch Verneinung noch Zusammenhang. „Ich bin überhaupt nicht wütend" zählt als Wut.',
    'Die Einstufung gilt Mechanismen, nicht Menschen. „Unreif" beschreibt eine Abwehrform, nicht dich und nicht deinen Entwicklungsstand.',
    'Abwehr ist Schutz. Ein hoher Wert ist kein Defizit, sondern ein Hinweis darauf, womit dieser Text gerade fertig werden musste.',
    'Vaillant untersuchte Gruppen über Jahrzehnte, nicht Einzelne über Wochen. Was in seinen Daten im Mittel mit besserer Anpassung einherging, sagt über deinen Dienstagabend nichts aus.',
    'Verhältnisse sind aussagekräftiger als absolute Zahlen — und beide brauchen viele Einträge, bevor sie überhaupt etwas bedeuten.',
    'Nichts davon ist Diagnostik. Wenn eine Zahl hier dich beunruhigt, ist das ein Grund, mit einem Menschen zu sprechen, nicht mit dieser App.'
  ],
  en: [
    'Words are counted, not states. The app detects figures of speech in your texts — it understands neither irony nor negation nor context. "I am not angry at all" counts as anger.',
    'The classification applies to mechanisms, not people. "Immature" describes a form of defence, not you and not your stage of development.',
    'Defence is protection. A high value is not a deficit but an indication of what this text had to cope with.',
    'Vaillant studied groups across decades, not individuals across weeks. What went along with better adaptation on average in his data says nothing about your Tuesday evening.',
    'Ratios carry more meaning than absolute numbers — and both need many entries before they mean anything at all.',
    'None of this is diagnostics. If a number here worries you, that is a reason to talk to a person, not to this app.'
  ]
};

export function defenceDef(id, lang = 'de') {
  const d = DEFENCE_DEFS[id];
  if (!d) return null;
  const de = lang !== 'en';
  return {
    text: de ? d.de : d.en,
    note: de ? (d.note || null) : (d.noteEn || null),
    source: d.source,
    level: d.level,
    levelInfo: LEVELS[d.level] ? (de ? LEVELS[d.level].de : LEVELS[d.level].en) : null,
    ref: d.source === 'adapted' ? null : VAILLANT_REF
  };
}
