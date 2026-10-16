/**
 * Berichte: Markdown-Ausgabe für den Themenordner.
 * Reports: Markdown output for the themes folder.
 *
 * Reines Rendering — nimmt das Ergebnis von aggregate() entgegen und macht
 * daraus lesbare Dateien. Läuft in Node wie im Browser.
 * Pure rendering — takes the result of aggregate() and turns it into readable
 * files. Runs in Node and in the browser alike.
 */

import { CONFLICTS, DEFENCES, LITERATURE } from './themes.js';
import { EMOTION_INDEX } from './emotions.js';

/* ------------------------------------------------------------------ *
 * BERICHTE / REPORTS  (Markdown für den themes-Ordner)
 * ------------------------------------------------------------------ */

export function renderOverviewMarkdown(agg, lang = 'de') {
  const de = lang !== 'en';
  const L = de ? deLabels : enLabels;
  const lines = [];

  lines.push(`# ${L.overviewTitle}`);
  lines.push('');
  lines.push(`*${L.generated}: ${new Date(agg.generatedAt).toLocaleString(de ? 'de-DE' : 'en-GB')}*`);
  lines.push('');
  lines.push(`> ${L.disclaimer}`);
  lines.push('');

  lines.push(`## ${L.atAGlance}`);
  lines.push('');
  lines.push(`| ${L.metric} | ${L.value} |`);
  lines.push('| --- | --- |');
  lines.push(`| ${L.entries} | ${agg.entryCount} |`);
  lines.push(`| ${L.period} | ${agg.firstDate || '–'} → ${agg.lastDate || '–'} |`);
  lines.push(`| ${L.recordings} | ${agg.audioCount} |`);
  lines.push(`| ${L.avgValence} | ${fmt(agg.stats.avgValence)} (−1 … +1) |`);
  lines.push(`| ${L.avgArousal} | ${fmtPlain(agg.stats.avgArousal)} (0 … 1) |`);
  lines.push(`| ${L.distinctEmotions} | ${agg.stats.distinctEmotions} |`);
  lines.push(`| ${L.ambivalence} | ${Math.round(agg.stats.ambivalentShare * 100)} % |`);
  lines.push(`| ${L.streak} | ${agg.stats.streak} |`);
  lines.push('');

  if (agg.insights.length) {
    lines.push(`## ${L.observations}`);
    lines.push('');
    for (const i of agg.insights) {
      lines.push(`- ${i.text}`);
      if (i.literature) lines.push(`  <br><sub>${L.basis}: ${i.literature}</sub>`);
    }
    lines.push('');
  }

  lines.push(`## ${L.conflictsTitle}`);
  lines.push('');
  lines.push(L.conflictsIntro);
  lines.push('');
  lines.push(`| ${L.theme} | ${L.entriesShort} | ${L.weight} | ${L.markers} |`);
  lines.push('| --- | ---: | ---: | --- |');
  for (const c of agg.conflicts.slice(0, 10)) {
    lines.push(`| ${de ? c.de : c.en} | ${c.entryCount} | ${c.score} | ${topTerms(c)} |`);
  }
  lines.push('');

  lines.push(`## ${L.defencesTitle}`);
  lines.push('');
  lines.push(L.defencesIntro);
  lines.push('');
  lines.push(`| ${L.pattern} | ${L.level} | ${L.entriesShort} | ${L.weight} |`);
  lines.push('| --- | --- | ---: | ---: |');
  for (const d of agg.defences.slice(0, 12)) {
    lines.push(`| ${de ? d.de : d.en} | ${L.levels[d.level] || d.level} | ${d.entryCount} | ${d.score} |`);
  }
  lines.push('');

  lines.push(`## ${L.domainsTitle}`);
  lines.push('');
  lines.push(`| ${L.domain} | ${L.entriesShort} | ${L.weight} |`);
  lines.push('| --- | ---: | ---: |');
  for (const d of agg.domains.slice(0, 12)) {
    lines.push(`| ${de ? d.de : d.en} | ${d.entryCount} | ${d.score} |`);
  }
  lines.push('');

  lines.push(`## ${L.emotionsTitle}`);
  lines.push('');
  lines.push(`| ${L.emotion} | ${L.count} | ${L.avgIntensity} |`);
  lines.push('| --- | ---: | ---: |');
  for (const e of agg.emotions.slice(0, 20)) {
    lines.push(`| ${de ? e.de : e.en} | ${e.count} | ${e.avgIntensity.toFixed(1)} |`);
  }
  lines.push('');

  if (agg.cooccurrence.length) {
    lines.push(`## ${L.couplingTitle}`);
    lines.push('');
    lines.push(L.couplingIntro);
    lines.push('');
    for (const c of agg.cooccurrence) {
      lines.push(`- **${c.emotionLabel}** ↔ ${c.conflictLabel} — ${c.count}×`);
    }
    lines.push('');
  }

  if (agg.monthly.length) {
    lines.push(`## ${L.monthlyTitle}`);
    lines.push('');
    lines.push(`| ${L.month} | ${L.entriesShort} | ${L.tone} | ${L.leadingThemes} |`);
    lines.push('| --- | ---: | ---: | --- |');
    for (const m of agg.monthly) {
      lines.push(`| ${m.month} | ${m.count} | ${fmt(m.valence)} | ${m.topConflicts.map(t => t.label).join(', ') || '–'} |`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push(`### ${L.methodTitle}`);
  lines.push('');
  lines.push(L.method);
  lines.push('');
  lines.push(`### ${L.litTitle}`);
  lines.push('');
  for (const key of Object.keys(LITERATURE)) {
    lines.push(`- ${LITERATURE[key].ref}`);
  }
  lines.push('');

  return lines.join('\n');
}

export function renderMonthMarkdown(month, entries, agg, lang = 'de') {
  const de = lang !== 'en';
  const L = de ? deLabels : enLabels;
  const m = agg.monthly.find(x => x.month === month);
  const lines = [];

  lines.push(`# ${month} — ${L.monthReport}`);
  lines.push('');
  lines.push(`*${L.generated}: ${new Date().toLocaleString(de ? 'de-DE' : 'en-GB')}*`);
  lines.push('');
  lines.push(`**${L.entries}:** ${m?.count ?? 0} · **${L.tone}:** ${fmt(m?.valence ?? 0)}`);
  lines.push('');

  if (m?.topConflicts?.length) {
    lines.push(`## ${L.leadingThemes}`);
    lines.push('');
    for (const t of m.topConflicts) {
      const item = CONFLICTS.find(c => c.id === t.id);
      lines.push(`### ${t.label}`);
      lines.push('');
      lines.push(de ? (item?.noteDe || '') : (item?.noteEn || ''));
      lines.push('');
      const relevant = entries
        .filter(e => (e.analysis?.conflicts || []).some(c => c.id === t.id))
        .slice(-4);
      if (relevant.length) {
        lines.push(`**${L.excerpts}:**`);
        lines.push('');
        for (const e of relevant) {
          const first = (e.feelings || [])[0];
          if (first?.because) {
            lines.push(`- *${e.date}* — „${truncate(first.because, 180)}"`);
          }
        }
        lines.push('');
      }
    }
  }

  if (m?.topDefences?.length) {
    lines.push(`## ${L.defencesTitle}`);
    lines.push('');
    for (const d of m.topDefences) {
      const item = DEFENCES.find(x => x.id === d.id);
      lines.push(`- **${d.label}** — ${de ? (item?.noteDe || '') : (item?.noteEn || '')}`);
    }
    lines.push('');
  }

  lines.push(`## ${L.entriesThisMonth}`);
  lines.push('');
  for (const e of entries) {
    const feels = (e.feelings || []).map(f => {
      const meta = EMOTION_INDEX.get(f.emotionId);
      return meta ? (de ? meta.de : meta.en) : f.emotionId;
    }).join(', ');
    lines.push(`- **${e.date}** — ${feels}${e.audio ? ' 🎙' : ''}`);
  }
  lines.push('');

  return lines.join('\n');
}

export function renderEntryMarkdown(entry, lang = 'de') {
  const de = lang !== 'en';
  const lines = [];
  const time = new Date(entry.createdAt).toLocaleTimeString(de ? 'de-DE' : 'en-GB',
    { hour: '2-digit', minute: '2-digit' });

  lines.push(`---`);
  lines.push(`id: ${entry.id}`);
  lines.push(`date: ${entry.date}`);
  lines.push(`created: ${entry.createdAt}`);
  lines.push(`lang: ${entry.lang || lang}`);
  if (entry.audio) lines.push(`audio: ${entry.audio.file}`);
  if (entry.tags?.length) lines.push(`tags: [${entry.tags.join(', ')}]`);
  lines.push(`---`);
  lines.push('');
  lines.push(`# ${entry.date} · ${time}`);
  lines.push('');

  for (const f of entry.feelings || []) {
    const meta = EMOTION_INDEX.get(f.emotionId);
    const label = meta ? (de ? meta.de : meta.en) : f.emotionId;
    const dots = '●'.repeat(f.intensity || 3) + '○'.repeat(5 - (f.intensity || 3));
    lines.push(`**${de ? 'Ich fühle mich' : 'I feel'} ${label}** ${dots}`);
    lines.push('');
    lines.push(`${de ? 'weil' : 'because'} ${f.because || '—'}`);
    lines.push('');
  }

  if (entry.freeText) {
    lines.push(`## ${de ? 'Frei geschrieben' : 'Free writing'}`);
    lines.push('');
    lines.push(entry.freeText);
    lines.push('');
  }

  if (entry.transcript && entry.transcript !== entry.freeText) {
    lines.push(`## ${de ? 'Diktat (Rohtranskript)' : 'Dictation (raw transcript)'}`);
    lines.push('');
    lines.push(entry.transcript);
    lines.push('');
  }

  const a = entry.analysis;
  if (a) {
    lines.push(`## ${de ? 'Automatische Marker' : 'Automatic markers'}`);
    lines.push('');
    if (a.conflicts?.length) {
      lines.push(`- ${de ? 'Konflikt' : 'Conflict'}: ${a.conflicts.slice(0, 3).map(c => `${de ? c.de : c.en} (${c.score})`).join(', ')}`);
    }
    if (a.defences?.length) {
      lines.push(`- ${de ? 'Bewältigung' : 'Coping'}: ${a.defences.slice(0, 3).map(c => `${de ? c.de : c.en} (${c.score})`).join(', ')}`);
    }
    if (a.domains?.length) {
      lines.push(`- ${de ? 'Bereich' : 'Domain'}: ${a.domains.slice(0, 3).map(c => `${de ? c.de : c.en}`).join(', ')}`);
    }
    lines.push(`- ${de ? 'Tönung' : 'Tone'}: ${fmt(a.affect.valence)} · ${de ? 'Aktivierung' : 'Arousal'}: ${fmtPlain(a.affect.arousal)}`);
    lines.push('');
  }

  return lines.join('\n');
}

function topTerms(rec) {
  if (!rec.terms || !rec.terms.size) return '–';
  return [...rec.terms.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([t, n]) => `\`${t}\`×${n}`)
    .join(' ');
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

/**
 * Vorzeichenbehaftet, mit echtem Minuszeichen (U+2212) — sonst steht das
 * ASCII-Minus neben der „−1 … +1"-Skala und sieht nach Tippfehler aus.
 */
function fmt(n) {
  const s = Math.abs(n).toFixed(2);
  return n < 0 ? `−${s}` : `+${s}`;
}

/** Ohne Vorzeichen — für Skalen, die bei 0 anfangen (Aktivierung). */
function fmtPlain(n) {
  return n.toFixed(2);
}

const deLabels = {
  overviewTitle: 'Themenübersicht — Gesamtverlauf',
  monthReport: 'Monatsbericht',
  generated: 'Erzeugt',
  disclaimer: '**Kein diagnostisches Dokument.** Diese Auswertung zählt Sprachmarker in deinen eigenen Texten. Sie beschreibt, welche Wörter du benutzt — nicht, wie es dir geht. Alles hier ist als Hypothese zu lesen, nicht als Befund.',
  atAGlance: 'Auf einen Blick',
  metric: 'Kennzahl', value: 'Wert',
  entries: 'Einträge', period: 'Zeitraum', recordings: 'Aufnahmen',
  avgValence: 'Ø Gefühlstönung', avgArousal: 'Ø Aktivierung',
  distinctEmotions: 'Verschiedene Gefühlsbegriffe', ambivalence: 'Anteil ambivalenter Einträge',
  streak: 'Aktuelle Serie (Tage)',
  observations: 'Beobachtungen',
  basis: 'Grundlage',
  conflictsTitle: 'Grundkonflikte',
  conflictsIntro: 'Spannungsfelder, an denen sich das Erleben immer wieder entzündet. Angelehnt an die Konfliktachse der OPD-3.',
  defencesTitle: 'Bewältigung & Abwehr',
  defencesIntro: 'Wie der Text mit Belastung umgeht. Abwehr ist zunächst Schutz — auffällig wird sie durch Starrheit, nicht durch Vorkommen.',
  domainsTitle: 'Lebensbereiche',
  emotionsTitle: 'Gefühle nach Häufigkeit',
  couplingTitle: 'Kopplungen: Gefühl ↔ Konflikt',
  couplingIntro: 'Welche Gefühle regelmäßig zusammen mit welchem Thema auftauchen.',
  monthlyTitle: 'Monatsverlauf',
  theme: 'Thema', pattern: 'Muster', domain: 'Bereich', emotion: 'Gefühl',
  entriesShort: 'Einträge', weight: 'Gewicht', markers: 'Häufigste Marker',
  level: 'Ebene', count: 'Anzahl', avgIntensity: 'Ø Intensität',
  month: 'Monat', tone: 'Tönung', leadingThemes: 'Leitthemen',
  excerpts: 'Auszüge', entriesThisMonth: 'Einträge in diesem Monat',
  levels: { reif: 'reif', neurotisch: 'neurotisch', unreif: 'unreif' },
  methodTitle: 'Wie das gerechnet wird',
  method: 'Jeder Eintrag wird gegen ein zweisprachiges Wörterbuch geprüft. Jeder Begriff trägt ein Gewicht (1 = allgemein, 2 = spezifisch). Das „Gewicht" einer Zeile ist die Summe aller Treffer × Gewicht über alle Einträge; „Einträge" ist die Zahl der Einträge mit mindestens einem Treffer. Gefühlstönung und Aktivierung stammen aus den von dir gewählten Emotionen, gewichtet mit der Intensität. Es kommt kein Sprachmodell zum Einsatz — die Auswertung ist deterministisch, offline und nachvollziehbar. Der Preis dafür: Ironie, Verneinung und Kontext werden nicht verstanden.',
  litTitle: 'Verwendete Literatur'
};

const enLabels = {
  overviewTitle: 'Theme Overview — Full History',
  monthReport: 'Monthly Report',
  generated: 'Generated',
  disclaimer: '**Not a diagnostic document.** This read-out counts linguistic markers in your own texts. It describes which words you use — not how you are. Read everything here as hypothesis, not finding.',
  atAGlance: 'At a glance',
  metric: 'Metric', value: 'Value',
  entries: 'Entries', period: 'Period', recordings: 'Recordings',
  avgValence: 'Avg. affective tone', avgArousal: 'Avg. arousal',
  distinctEmotions: 'Distinct feeling words', ambivalence: 'Share of ambivalent entries',
  streak: 'Current streak (days)',
  observations: 'Observations',
  basis: 'Basis',
  conflictsTitle: 'Core conflicts',
  conflictsIntro: 'Fields of tension where experience repeatedly ignites. Modelled on the conflict axis of OPD-3.',
  defencesTitle: 'Coping & defence',
  defencesIntro: 'How the text handles strain. Defence is protection first — it becomes notable through rigidity, not through presence.',
  domainsTitle: 'Life domains',
  emotionsTitle: 'Feelings by frequency',
  couplingTitle: 'Couplings: feeling ↔ conflict',
  couplingIntro: 'Which feelings regularly show up alongside which theme.',
  monthlyTitle: 'Monthly trend',
  theme: 'Theme', pattern: 'Pattern', domain: 'Domain', emotion: 'Feeling',
  entriesShort: 'Entries', weight: 'Weight', markers: 'Most frequent markers',
  level: 'Level', count: 'Count', avgIntensity: 'Avg. intensity',
  month: 'Month', tone: 'Tone', leadingThemes: 'Leading themes',
  excerpts: 'Excerpts', entriesThisMonth: 'Entries this month',
  levels: { reif: 'mature', neurotisch: 'neurotic', unreif: 'immature' },
  methodTitle: 'How this is calculated',
  method: 'Each entry is checked against a bilingual dictionary. Every term carries a weight (1 = general, 2 = specific). A row\'s "weight" is the sum of all hits × weight across entries; "entries" is the number of entries with at least one hit. Affective tone and arousal come from the emotions you selected, weighted by intensity. No language model is involved — the analysis is deterministic, offline and inspectable. The price: irony, negation and context are not understood.',
  litTitle: 'Literature used'
};

