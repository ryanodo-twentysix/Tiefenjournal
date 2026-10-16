/**
 * Emotionsvokabular / Emotion vocabulary
 *
 * Aufbau nach Familien (Basisemotion -> Differenzierung). Die Differenzierung ist
 * Absicht: "emotional granularity" (Barrett, 2017; Kashdan, Barrett & McKnight, 2015)
 * ist einer der wenigen gut belegten Wirkfaktoren von Emotionsarbeit — wer genauer
 * benennt, reguliert besser.
 *
 * Structured by families (base emotion -> differentiation). The granularity is
 * deliberate: emotional granularity (Barrett, 2017) is one of the better-evidenced
 * active ingredients of affect work — more precise labelling predicts better
 * regulation.
 *
 * v = Valenz / valence  (-1 unangenehm ... +1 angenehm)
 * a = Aktivierung / arousal (0 ruhig ... 1 hoch aktiviert)
 */

export const EMOTION_FAMILIES = [
  {
    id: 'freude',
    de: 'Freude & Lebendigkeit',
    en: 'Joy & Aliveness',
    hue: 44,
    emotions: [
      { id: 'gluecklich', de: 'glücklich', en: 'happy', v: 0.85, a: 0.55 },
      { id: 'froh', de: 'froh', en: 'glad', v: 0.7, a: 0.4 },
      { id: 'begeistert', de: 'begeistert', en: 'enthusiastic', v: 0.85, a: 0.85 },
      { id: 'ausgelassen', de: 'ausgelassen', en: 'exuberant', v: 0.85, a: 0.9 },
      { id: 'beschwingt', de: 'beschwingt', en: 'buoyant', v: 0.7, a: 0.6 },
      { id: 'lebendig', de: 'lebendig', en: 'alive', v: 0.8, a: 0.7 },
      { id: 'erleichtert', de: 'erleichtert', en: 'relieved', v: 0.6, a: 0.25 },
      { id: 'dankbar', de: 'dankbar', en: 'grateful', v: 0.8, a: 0.35 },
      { id: 'stolz', de: 'stolz', en: 'proud', v: 0.75, a: 0.6 },
      { id: 'zufrieden', de: 'zufrieden', en: 'content', v: 0.7, a: 0.2 },
      { id: 'heiter', de: 'heiter', en: 'cheerful', v: 0.7, a: 0.45 },
      { id: 'euphorisch', de: 'euphorisch', en: 'euphoric', v: 0.9, a: 0.95 },
      { id: 'gerührt', de: 'gerührt', en: 'moved', v: 0.55, a: 0.45 },
      { id: 'hoffnungsvoll', de: 'hoffnungsvoll', en: 'hopeful', v: 0.65, a: 0.45 }
    ]
  },
  {
    id: 'liebe',
    de: 'Liebe & Verbundenheit',
    en: 'Love & Connection',
    hue: 340,
    emotions: [
      { id: 'geliebt', de: 'geliebt', en: 'loved', v: 0.9, a: 0.4 },
      { id: 'liebevoll', de: 'liebevoll', en: 'loving', v: 0.85, a: 0.4 },
      { id: 'verbunden', de: 'verbunden', en: 'connected', v: 0.8, a: 0.35 },
      { id: 'zugehoerig', de: 'zugehörig', en: 'like I belong', v: 0.8, a: 0.3 },
      { id: 'gesehen', de: 'gesehen', en: 'seen', v: 0.8, a: 0.35 },
      { id: 'verstanden', de: 'verstanden', en: 'understood', v: 0.8, a: 0.3 },
      { id: 'geborgen', de: 'geborgen', en: 'held / safe with someone', v: 0.85, a: 0.15 },
      { id: 'zaertlich', de: 'zärtlich', en: 'tender', v: 0.8, a: 0.3 },
      { id: 'mitfuehlend', de: 'mitfühlend', en: 'compassionate', v: 0.6, a: 0.35 },
      { id: 'vertrauensvoll', de: 'vertrauensvoll', en: 'trusting', v: 0.75, a: 0.25 },
      { id: 'angenommen', de: 'angenommen', en: 'accepted', v: 0.8, a: 0.25 },
      { id: 'begehrt', de: 'begehrt', en: 'desired', v: 0.75, a: 0.7 },
      { id: 'verliebt', de: 'verliebt', en: 'in love', v: 0.85, a: 0.75 },
      { id: 'wohlwollend', de: 'wohlwollend', en: 'warm toward', v: 0.65, a: 0.25 }
    ]
  },
  {
    id: 'ruhe',
    de: 'Ruhe & Sicherheit',
    en: 'Calm & Safety',
    hue: 190,
    emotions: [
      { id: 'ruhig', de: 'ruhig', en: 'calm', v: 0.6, a: 0.1 },
      { id: 'entspannt', de: 'entspannt', en: 'relaxed', v: 0.7, a: 0.1 },
      { id: 'gelassen', de: 'gelassen', en: 'serene', v: 0.7, a: 0.15 },
      { id: 'sicher', de: 'sicher', en: 'safe', v: 0.75, a: 0.15 },
      { id: 'geerdet', de: 'geerdet', en: 'grounded', v: 0.7, a: 0.2 },
      { id: 'klar', de: 'klar', en: 'clear', v: 0.65, a: 0.35 },
      { id: 'gesammelt', de: 'gesammelt', en: 'collected', v: 0.6, a: 0.3 },
      { id: 'geduldig', de: 'geduldig', en: 'patient', v: 0.55, a: 0.2 },
      { id: 'ausgeglichen', de: 'ausgeglichen', en: 'balanced', v: 0.65, a: 0.2 },
      { id: 'erholt', de: 'erholt', en: 'rested', v: 0.7, a: 0.25 },
      { id: 'friedlich', de: 'friedlich', en: 'at peace', v: 0.75, a: 0.1 },
      { id: 'akzeptierend', de: 'akzeptierend', en: 'accepting', v: 0.55, a: 0.2 }
    ]
  },
  {
    id: 'interesse',
    de: 'Interesse & Antrieb',
    en: 'Interest & Drive',
    hue: 150,
    emotions: [
      { id: 'neugierig', de: 'neugierig', en: 'curious', v: 0.6, a: 0.6 },
      { id: 'fasziniert', de: 'fasziniert', en: 'fascinated', v: 0.7, a: 0.7 },
      { id: 'konzentriert', de: 'konzentriert', en: 'focused', v: 0.5, a: 0.6 },
      { id: 'motiviert', de: 'motiviert', en: 'motivated', v: 0.7, a: 0.7 },
      { id: 'entschlossen', de: 'entschlossen', en: 'determined', v: 0.6, a: 0.75 },
      { id: 'inspiriert', de: 'inspiriert', en: 'inspired', v: 0.8, a: 0.7 },
      { id: 'wach', de: 'wach', en: 'alert', v: 0.5, a: 0.65 },
      { id: 'kreativ', de: 'kreativ', en: 'creative', v: 0.75, a: 0.65 },
      { id: 'mutig', de: 'mutig', en: 'courageous', v: 0.7, a: 0.7 },
      { id: 'selbstwirksam', de: 'selbstwirksam', en: 'capable / effective', v: 0.75, a: 0.55 },
      { id: 'tatkraeftig', de: 'tatkräftig', en: 'energised to act', v: 0.7, a: 0.8 },
      { id: 'erwartungsvoll', de: 'erwartungsvoll', en: 'anticipating', v: 0.5, a: 0.6 }
    ]
  },
  {
    id: 'trauer',
    de: 'Trauer & Schmerz',
    en: 'Sadness & Grief',
    hue: 215,
    emotions: [
      { id: 'traurig', de: 'traurig', en: 'sad', v: -0.7, a: 0.25 },
      { id: 'niedergeschlagen', de: 'niedergeschlagen', en: 'downcast', v: -0.7, a: 0.2 },
      { id: 'schwermuetig', de: 'schwermütig', en: 'melancholic', v: -0.6, a: 0.15 },
      { id: 'verzweifelt', de: 'verzweifelt', en: 'despairing', v: -0.9, a: 0.6 },
      { id: 'hoffnungslos', de: 'hoffnungslos', en: 'hopeless', v: -0.9, a: 0.2 },
      { id: 'enttaeuscht', de: 'enttäuscht', en: 'disappointed', v: -0.65, a: 0.35 },
      { id: 'gekraenkt', de: 'gekränkt', en: 'hurt / slighted', v: -0.7, a: 0.5 },
      { id: 'verletzt', de: 'verletzt', en: 'wounded', v: -0.75, a: 0.45 },
      { id: 'einsam', de: 'einsam', en: 'lonely', v: -0.8, a: 0.3 },
      { id: 'verlassen', de: 'verlassen', en: 'abandoned', v: -0.85, a: 0.5 },
      { id: 'trauernd', de: 'trauernd', en: 'grieving', v: -0.7, a: 0.35 },
      { id: 'wehmuetig', de: 'wehmütig', en: 'wistful', v: -0.35, a: 0.2 },
      { id: 'resigniert', de: 'resigniert', en: 'resigned', v: -0.65, a: 0.15 },
      { id: 'entmutigt', de: 'entmutigt', en: 'discouraged', v: -0.65, a: 0.25 },
      { id: 'mitgenommen', de: 'mitgenommen', en: 'worn down', v: -0.6, a: 0.25 },
      { id: 'zerbrechlich', de: 'zerbrechlich', en: 'fragile', v: -0.55, a: 0.35 }
    ]
  },
  {
    id: 'angst',
    de: 'Angst & Anspannung',
    en: 'Fear & Tension',
    hue: 270,
    emotions: [
      { id: 'aengstlich', de: 'ängstlich', en: 'afraid', v: -0.75, a: 0.7 },
      { id: 'besorgt', de: 'besorgt', en: 'worried', v: -0.55, a: 0.55 },
      { id: 'nervoes', de: 'nervös', en: 'nervous', v: -0.5, a: 0.75 },
      { id: 'unruhig', de: 'unruhig', en: 'restless', v: -0.5, a: 0.7 },
      { id: 'angespannt', de: 'angespannt', en: 'tense', v: -0.6, a: 0.75 },
      { id: 'panisch', de: 'panisch', en: 'panicky', v: -0.9, a: 0.98 },
      { id: 'ueberfordert', de: 'überfordert', en: 'overwhelmed', v: -0.75, a: 0.75 },
      { id: 'unsicher', de: 'unsicher', en: 'insecure', v: -0.55, a: 0.5 },
      { id: 'zweifelnd', de: 'zweifelnd', en: 'doubting', v: -0.45, a: 0.45 },
      { id: 'misstrauisch', de: 'misstrauisch', en: 'distrustful', v: -0.6, a: 0.6 },
      { id: 'alarmiert', de: 'alarmiert', en: 'on alert', v: -0.6, a: 0.85 },
      { id: 'schreckhaft', de: 'schreckhaft', en: 'jumpy', v: -0.6, a: 0.8 },
      { id: 'beklommen', de: 'beklommen', en: 'apprehensive', v: -0.6, a: 0.5 },
      { id: 'verzagt', de: 'verzagt', en: 'faint-hearted', v: -0.6, a: 0.35 },
      { id: 'getrieben', de: 'getrieben', en: 'driven / pressured', v: -0.5, a: 0.85 },
      { id: 'hilflos', de: 'hilflos', en: 'helpless', v: -0.85, a: 0.45 }
    ]
  },
  {
    id: 'wut',
    de: 'Wut & Abgrenzung',
    en: 'Anger & Boundary',
    hue: 8,
    emotions: [
      { id: 'wuetend', de: 'wütend', en: 'angry', v: -0.7, a: 0.85 },
      { id: 'veraergert', de: 'verärgert', en: 'annoyed', v: -0.5, a: 0.55 },
      { id: 'gereizt', de: 'gereizt', en: 'irritable', v: -0.55, a: 0.65 },
      { id: 'frustriert', de: 'frustriert', en: 'frustrated', v: -0.65, a: 0.65 },
      { id: 'empoert', de: 'empört', en: 'indignant', v: -0.6, a: 0.8 },
      { id: 'zornig', de: 'zornig', en: 'enraged', v: -0.8, a: 0.95 },
      { id: 'grollend', de: 'grollend', en: 'resentful', v: -0.65, a: 0.4 },
      { id: 'bitter', de: 'bitter', en: 'bitter', v: -0.7, a: 0.35 },
      { id: 'genervt', de: 'genervt', en: 'fed up', v: -0.5, a: 0.55 },
      { id: 'trotzig', de: 'trotzig', en: 'defiant', v: -0.4, a: 0.7 },
      { id: 'ungeduldig', de: 'ungeduldig', en: 'impatient', v: -0.4, a: 0.65 },
      { id: 'verachtend', de: 'verachtend', en: 'contemptuous', v: -0.6, a: 0.55 },
      { id: 'rachsuechtig', de: 'rachsüchtig', en: 'vengeful', v: -0.7, a: 0.75 },
      { id: 'abgegrenzt', de: 'abgegrenzt', en: 'boundaried', v: 0.35, a: 0.5 }
    ]
  },
  {
    id: 'scham',
    de: 'Scham & Schuld',
    en: 'Shame & Guilt',
    hue: 20,
    emotions: [
      { id: 'beschaemt', de: 'beschämt', en: 'ashamed', v: -0.8, a: 0.55 },
      { id: 'peinlich_beruehrt', de: 'peinlich berührt', en: 'embarrassed', v: -0.55, a: 0.6 },
      { id: 'schuldig', de: 'schuldig', en: 'guilty', v: -0.75, a: 0.5 },
      { id: 'reuevoll', de: 'reuevoll', en: 'remorseful', v: -0.6, a: 0.4 },
      { id: 'blossgestellt', de: 'bloßgestellt', en: 'exposed', v: -0.8, a: 0.7 },
      { id: 'minderwertig', de: 'minderwertig', en: 'inferior', v: -0.85, a: 0.35 },
      { id: 'wertlos', de: 'wertlos', en: 'worthless', v: -0.95, a: 0.3 },
      { id: 'unzulaenglich', de: 'unzulänglich', en: 'inadequate', v: -0.75, a: 0.4 },
      { id: 'verlegen', de: 'verlegen', en: 'self-conscious', v: -0.45, a: 0.5 },
      { id: 'klein', de: 'klein gemacht', en: 'made small', v: -0.8, a: 0.4 },
      { id: 'demuetigt', de: 'gedemütigt', en: 'humiliated', v: -0.9, a: 0.7 },
      { id: 'selbstkritisch', de: 'selbstkritisch', en: 'self-critical', v: -0.6, a: 0.45 },
      { id: 'versagend', de: 'versagend', en: 'like a failure', v: -0.85, a: 0.4 },
      { id: 'entbloesst', de: 'ertappt', en: 'caught out', v: -0.7, a: 0.7 }
    ]
  },
  {
    id: 'leere',
    de: 'Leere & Taubheit',
    en: 'Emptiness & Numbness',
    hue: 240,
    emotions: [
      { id: 'leer', de: 'leer', en: 'empty', v: -0.7, a: 0.1 },
      { id: 'taub', de: 'taub', en: 'numb', v: -0.6, a: 0.05 },
      { id: 'abgestumpft', de: 'abgestumpft', en: 'blunted', v: -0.6, a: 0.1 },
      { id: 'erschoepft', de: 'erschöpft', en: 'exhausted', v: -0.7, a: 0.05 },
      { id: 'antriebslos', de: 'antriebslos', en: 'without drive', v: -0.7, a: 0.05 },
      { id: 'entfremdet', de: 'entfremdet', en: 'estranged from myself', v: -0.7, a: 0.2 },
      { id: 'unwirklich', de: 'unwirklich', en: 'unreal / detached', v: -0.6, a: 0.3 },
      { id: 'gleichgueltig', de: 'gleichgültig', en: 'indifferent', v: -0.4, a: 0.1 },
      { id: 'gelangweilt', de: 'gelangweilt', en: 'bored', v: -0.4, a: 0.15 },
      { id: 'verloren', de: 'verloren', en: 'lost', v: -0.75, a: 0.3 },
      { id: 'orientierungslos', de: 'orientierungslos', en: 'disoriented', v: -0.65, a: 0.4 },
      { id: 'schwer', de: 'schwer', en: 'heavy', v: -0.65, a: 0.1 }
    ]
  },
  {
    id: 'sehnsucht',
    de: 'Sehnsucht & Ambivalenz',
    en: 'Longing & Ambivalence',
    hue: 300,
    emotions: [
      { id: 'sehnsuechtig', de: 'sehnsüchtig', en: 'longing', v: -0.25, a: 0.45 },
      { id: 'vermissend', de: 'vermissend', en: 'missing someone', v: -0.5, a: 0.35 },
      { id: 'zerrissen', de: 'zerrissen', en: 'torn', v: -0.6, a: 0.6 },
      { id: 'ambivalent', de: 'ambivalent', en: 'ambivalent', v: -0.3, a: 0.45 },
      { id: 'unentschlossen', de: 'unentschlossen', en: 'undecided', v: -0.35, a: 0.45 },
      { id: 'neidisch', de: 'neidisch', en: 'envious', v: -0.6, a: 0.55 },
      { id: 'eifersuechtig', de: 'eifersüchtig', en: 'jealous', v: -0.7, a: 0.75 },
      { id: 'nostalgisch', de: 'nostalgisch', en: 'nostalgic', v: -0.1, a: 0.3 },
      { id: 'bedürftig', de: 'bedürftig', en: 'needy', v: -0.5, a: 0.5 },
      { id: 'abhaengig', de: 'abhängig', en: 'dependent', v: -0.5, a: 0.45 },
      { id: 'ueberrascht', de: 'überrascht', en: 'surprised', v: 0.05, a: 0.7 },
      { id: 'verwirrt', de: 'verwirrt', en: 'confused', v: -0.45, a: 0.5 }
    ]
  }
];

/** Flache Map: emotionId -> { ...emotion, familyId, familyDe, familyEn, hue } */
export const EMOTION_INDEX = (() => {
  const index = new Map();
  for (const family of EMOTION_FAMILIES) {
    for (const emotion of family.emotions) {
      index.set(emotion.id, {
        ...emotion,
        familyId: family.id,
        familyDe: family.de,
        familyEn: family.en,
        hue: family.hue
      });
    }
  }
  return index;
})();

export function getEmotion(id) {
  return EMOTION_INDEX.get(id) || null;
}

export function emotionLabel(id, lang = 'de') {
  const e = EMOTION_INDEX.get(id);
  if (!e) return id;
  return lang === 'en' ? e.en : e.de;
}

/** Alle Emotionswörter als Suchbegriffe (für Textanalyse freier Passagen). */
export const EMOTION_TERMS = (() => {
  const terms = [];
  for (const [id, e] of EMOTION_INDEX) {
    terms.push({ id, term: e.de.toLowerCase(), lang: 'de' });
    terms.push({ id, term: e.en.toLowerCase(), lang: 'en' });
  }
  return terms;
})();
