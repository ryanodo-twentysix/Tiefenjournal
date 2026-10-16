/**
 * Bestärkung.
 * Encouragement.
 *
 * Regel für jede Zeile hier: sie benennt, was du tatsächlich getan hast, und
 * lobt nicht, wer du bist. Autonomiestützende Rückmeldung wirkt; allgemeines
 * Lob nutzt sich ab und wird schnell als unehrlich gehört
 * (Deci & Ryan, Self-Determination Theory; Neff & Germer zur Selbstfürsorge).
 *
 * Rule for every line here: it names what you actually did rather than praising
 * who you are. Autonomy-supportive feedback works; generic praise wears out fast
 * and starts to read as dishonest.
 *
 * Deshalb nichts von „gut gemacht". Sondern: du hast dir Zeit genommen, du hast
 * etwas benannt, das schwer zu benennen war, du bist nach einer Pause
 * zurückgekommen.
 */

/** Ein ruhiger Satz für den leeren Erfassungsbildschirm. */
export function openingLine(ctx, lang = 'de') {
  const de = lang !== 'en';
  const { entryCount = 0, streak = 0, daysSinceLast = null } = ctx;

  if (entryCount === 0) {
    return de
      ? 'Der erste Eintrag ist der schwerste. Danach wird es eine Gewohnheit.'
      : 'The first entry is the hardest. After that it becomes a habit.';
  }

  if (daysSinceLast !== null && daysSinceLast >= 7) {
    return de
      ? 'Du bist zurück. Eine Lücke im Journal ist kein Rückschritt — sie ist nur eine Lücke.'
      : 'You are back. A gap in the journal is not a setback — it is just a gap.';
  }

  if (streak >= 7) {
    return de
      ? `Seit ${streak} Tagen nimmst du dir diese Minuten. Das ist die Arbeit, nicht die Vorbereitung darauf.`
      : `For ${streak} days you have taken these minutes. That is the work, not the preparation for it.`;
  }

  if (streak >= 3) {
    return de
      ? 'Du kommst regelmäßig wieder. Genau davon lebt das hier.'
      : 'You keep coming back. That is exactly what this runs on.';
  }

  return de
    ? 'Du nimmst dir gerade Zeit, zu sortieren, wie es dir geht. Das ist mehr, als es sich anfühlt.'
    : 'You are taking time to sort out how you are. That is more than it feels like.';
}

/**
 * Rückmeldung direkt nach dem Speichern — richtet sich nach dem, was in
 * diesem Eintrag tatsächlich passiert ist.
 */
export function afterSave(entry, ctx, lang = 'de') {
  const de = lang !== 'en';
  const a = entry.analysis || {};
  const feelings = entry.feelings || [];
  const withReason = feelings.filter(f => (f.because || '').trim().length > 2).length;
  const { entryCount = 1, streak = 0, distinctEmotions = 0, isNewEmotion = false } = ctx;

  const lines = [];

  if (entryCount === 1) {
    lines.push(de
      ? 'Der erste Eintrag steht. Von hier an kann die App anfangen, Muster zu sehen.'
      : 'Your first entry is in. From here the app can start seeing patterns.');
  }

  // Ambivalenz auszuhalten ist schwerer als eindeutig zu fühlen.
  if (a.affect?.ambivalent) {
    lines.push(de
      ? 'Du hast Angenehmes und Unangenehmes nebeneinander stehen lassen, statt dich für eins zu entscheiden. Genau das ist schwer.'
      : 'You let pleasant and unpleasant stand side by side instead of picking one. That is the hard part.');
  }

  if (withReason >= 3) {
    lines.push(de
      ? 'Drei Gefühle, drei Gründe. Das Verbinden von Gefühl und Ursache ist der Teil, der nachweislich etwas verändert.'
      : 'Three feelings, three reasons. Linking feeling to cause is the part that demonstrably changes something.');
  } else if (withReason >= 1) {
    lines.push(de
      ? 'Du hast nicht nur benannt, was du fühlst, sondern auch woran es hängt. Das ist der wirksame Teil.'
      : 'You named not just what you feel but what it hangs on. That is the part that works.');
  }

  if (isNewEmotion) {
    lines.push(de
      ? 'Ein Wort, das du vorher noch nicht benutzt hast. Dein Vokabular für das eigene Erleben wächst.'
      : 'A word you had not used before. Your vocabulary for your own experience is growing.');
  }

  // Wer bei niedriger Stimmung trotzdem schreibt, tut das Schwerere.
  if ((a.affect?.valence ?? 0) <= -0.55) {
    lines.push(de
      ? 'An einem schweren Tag zu schreiben kostet mehr als an einem leichten. Du hast es trotzdem getan.'
      : 'Writing on a heavy day costs more than on an easy one. You did it anyway.');
  }

  if (streak >= 5 && lines.length < 2) {
    lines.push(de
      ? `${streak} Tage in Folge. Das baut den Verlauf auf, aus dem später die Projekte entstehen.`
      : `${streak} days in a row. That builds the history the projects later come from.`);
  }

  if (!lines.length) {
    lines.push(de
      ? 'Gespeichert. Du hast dir gerade Zeit genommen, das zu benennen.'
      : 'Saved. You just took the time to name it.');
  }

  return lines[0];
}

/**
 * Ressourcenblick für die Projektansicht: was im Journal für den Schreibenden
 * spricht. Bewusst am Ende der Auswertung, damit die Zahlen nicht das letzte
 * Wort haben.
 */
export function strengths(agg, projects, lang = 'de') {
  const de = lang !== 'en';
  const out = [];
  if (!agg?.entryCount) return out;

  const s = agg.stats || {};

  if (agg.entryCount >= 3) {
    out.push(de
      ? `Du hast ${agg.entryCount} Mal aufgeschrieben, wie es dir geht — und jedes Mal auch, warum. Das ist das Material, aus dem hier alles andere entsteht.`
      : `You have written down how you are ${agg.entryCount} times — and each time also why. That is the material everything else here is built from.`);
  }

  if ((s.distinctEmotions || 0) >= 10) {
    out.push(de
      ? `${s.distinctEmotions} verschiedene Gefühlsbegriffe. Wer genauer benennt, reguliert nachweislich besser — das ist kein Nebeneffekt, das ist Übung.`
      : `${s.distinctEmotions} distinct feeling words. Naming more precisely predicts better regulation — that is not a side effect, that is practice.`);
  }

  const mature = s.defenceBalance?.mature || 0;
  if (mature >= 0.25) {
    out.push(de
      ? `In deinen Texten stecken erkennbar reife Bewältigungsformen — Perspektivwechsel, Humor über dich selbst, etwas in eine Form bringen. Das sind Ressourcen, keine Selbstverständlichkeit.`
      : `Your texts visibly contain mature forms of coping — shifting perspective, humour about yourself, putting something into form. Those are resources, not a given.`);
  }

  if ((s.ambivalentShare || 0) >= 0.2) {
    out.push(de
      ? `In einem guten Teil deiner Einträge lässt du Widersprüchliches nebeneinander stehen. Das auszuhalten ist anspruchsvoller, als sich zu entscheiden.`
      : `In a good share of your entries you let contradictory things stand side by side. Holding that is more demanding than picking a side.`);
  }

  const moving = (projects || []).filter(p => p.movement?.direction === 'leichter');
  if (moving.length) {
    out.push(de
      ? `Bei „${moving[0].title}" hat sich die Tönung über die Zeit aufgehellt. Etwas bewegt sich dort.`
      : `On "${moving[0].title}" the tone has brightened over time. Something is moving there.`);
  }

  if ((s.streak || 0) >= 3) {
    out.push(de
      ? `${s.streak} Tage in Folge. Regelmäßigkeit schlägt Intensität.`
      : `${s.streak} days in a row. Regularity beats intensity.`);
  }

  return out;
}

/** Wie lange ist der letzte Eintrag her? */
export function daysSince(dateStr) {
  if (!dateStr) return null;
  const then = new Date(dateStr + 'T12:00:00');
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.round((now - then) / 86400000);
}
