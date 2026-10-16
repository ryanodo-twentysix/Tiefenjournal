/**
 * Struktur — vom Nutzer selbst gebaute Bereiche.
 * Structure — areas the user builds themselves.
 *
 * Die Themenerkennung im Rest der App ist fest verdrahtet: ein Lexikon, das
 * OPD-Konflikte und Abwehrfiguren zählt. Das ist nützlich, aber es ist nicht
 * *deine* Ordnung. Hier baust du die selbst.
 *
 * Ein Bereich ist ein Gefäß, kein Etikett: „Beziehungen" kann sich verzweigen
 * in „Beziehung zu den Eltern", und darunter weiter. Angelegt wird ad hoc,
 * mitten im Gespräch, wenn ein Thema auftaucht, das einen Platz verdient.
 *
 * Warum überhaupt? Weil Ordnen ein eigener Schritt ist. Zu merken, dass zwei
 * Situationen zusammengehören, ist bereits die Arbeit — nicht die Vorbereitung
 * darauf. Die App schlägt deshalb Bereiche vor, legt aber keine an.
 *
 * Structure nodes are vessels, not labels. Created ad hoc, mid-conversation,
 * when a theme comes up that deserves a place. The app proposes; it never
 * creates on its own.
 */

import { CONFLICTS, DOMAINS } from './themes.js';

export const MAX_DEPTH = 3;

/** Frisch angelegter Bereich. */
export function makeNode({ title, parentId = null, note = '', source = 'manual' }) {
  return {
    id: `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title: String(title || '').trim().slice(0, 80),
    parentId,
    note: String(note || '').trim().slice(0, 400),
    source,
    createdAt: new Date().toISOString(),
    dialogueIds: [],
    themeIds: []
  };
}

/** Baum aus flacher Liste — Kinder hängen unter ihrem Elternteil. */
export function buildTree(nodes) {
  const byId = new Map(nodes.map(n => [n.id, { ...n, children: [] }]));
  const roots = [];
  for (const node of byId.values()) {
    const parent = node.parentId ? byId.get(node.parentId) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  const sortRec = list => {
    list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    for (const n of list) sortRec(n.children);
  };
  sortRec(roots);
  return roots;
}

/** Wie tief liegt ein Bereich? Begrenzt, damit die Struktur lesbar bleibt. */
export function depthOf(node, nodes) {
  let depth = 0;
  let current = node;
  const byId = new Map(nodes.map(n => [n.id, n]));
  while (current?.parentId && depth < 10) {
    current = byId.get(current.parentId);
    depth++;
  }
  return depth;
}

export function canHaveChildren(node, nodes) {
  return depthOf(node, nodes) < MAX_DEPTH - 1;
}

/** Löscht einen Bereich samt allem, was darunter hängt. */
export function collectSubtree(id, nodes) {
  const out = [id];
  const queue = [id];
  while (queue.length) {
    const current = queue.shift();
    for (const n of nodes) {
      if (n.parentId === current) { out.push(n.id); queue.push(n.id); }
    }
  }
  return out;
}

/** Pfad als Text: „Beziehungen › Eltern". */
export function pathOf(node, nodes) {
  const byId = new Map(nodes.map(n => [n.id, n]));
  const parts = [node.title];
  let current = node;
  let guard = 0;
  while (current?.parentId && guard++ < 10) {
    current = byId.get(current.parentId);
    if (current) parts.unshift(current.title);
  }
  return parts.join(' › ');
}

/* ══════════════════════════════════════════════════════════
 * Vorschläge
 * ══════════════════════════════════════════════════════════ */

/**
 * Aus welchen erkannten Themen lässt sich ein Bereich bauen?
 * Lebensbereiche taugen besser als Konflikte: „Herkunftsfamilie" ist ein Ort,
 * „Unterwerfung vs. Kontrolle" ist eine Deutung. Bereiche sollen Orte sein.
 */
const AREA_NAMES = {
  herkunftsfamilie: { de: 'Beziehung zu den Eltern', en: 'Relationship with my parents', parentDe: 'Beziehungen', parentEn: 'Relationships' },
  partnerschaft:    { de: 'Partnerschaft', en: 'Partnership', parentDe: 'Beziehungen', parentEn: 'Relationships' },
  freundschaft:     { de: 'Freundschaften', en: 'Friendships', parentDe: 'Beziehungen', parentEn: 'Relationships' },
  eigene_familie:   { de: 'Meine Kinder', en: 'My children', parentDe: 'Beziehungen', parentEn: 'Relationships' },
  arbeit:           { de: 'Arbeit', en: 'Work', parentDe: null, parentEn: null },
  koerper:          { de: 'Körper & Gesundheit', en: 'Body & health', parentDe: null, parentEn: null },
  existenz:         { de: 'Geld & Existenz', en: 'Money & livelihood', parentDe: null, parentEn: null },
  sinn:             { de: 'Sinn & Richtung', en: 'Meaning & direction', parentDe: null, parentEn: null },
  einsamkeit:       { de: 'Alleinsein', en: 'Being alone', parentDe: null, parentEn: null },
  grenzen:          { de: 'Grenzen setzen', en: 'Setting boundaries', parentDe: null, parentEn: null },
  perfektionismus:  { de: 'Ansprüche an mich', en: 'Demands on myself', parentDe: null, parentEn: null },
  verlust:          { de: 'Verlust & Abschied', en: 'Loss & parting', parentDe: null, parentEn: null }
};

const norm = s => String(s || '').toLowerCase().trim();

/**
 * Schlägt höchstens einen Bereich vor — mehr wäre eine Aufforderung zum
 * Aufräumen statt ein Angebot.
 *
 * @param {object} detected  { domains: [{id}], conflicts: [{id}] }
 * @param {Array}  nodes     bestehende Bereiche
 * @param {Array}  dismissed Vorschläge, die schon weggeklickt wurden
 */
export function suggestArea(detected, nodes, lang = 'de', dismissed = []) {
  const de = lang !== 'en';
  const skip = new Set(dismissed);
  const existing = new Set(nodes.map(n => norm(n.title)));

  for (const domain of (detected.domains || [])) {
    const spec = AREA_NAMES[domain.id];
    if (!spec) continue;
    if (skip.has(domain.id)) continue;

    const title = de ? spec.de : spec.en;
    if (existing.has(norm(title))) continue;

    const parentTitle = de ? spec.parentDe : spec.parentEn;
    const parent = parentTitle
      ? nodes.find(n => norm(n.title) === norm(parentTitle)) || null
      : null;

    return {
      key: domain.id,
      title,
      parentId: parent?.id || null,
      parentTitle: parent ? parent.title : (parentTitle || null),
      createParent: Boolean(parentTitle) && !parent,
      domainId: domain.id,
      label: de ? (DOMAINS.find(d => d.id === domain.id)?.de || title)
                : (DOMAINS.find(d => d.id === domain.id)?.en || title)
    };
  }

  return null;
}

/**
 * Legt einen vorgeschlagenen Bereich an — samt Elternbereich, falls der
 * noch fehlt. Gibt die neuen Knoten zurück, schreibt nichts selbst.
 */
export function materialise(suggestion, lang = 'de') {
  const created = [];
  let parentId = suggestion.parentId;

  if (suggestion.createParent && suggestion.parentTitle) {
    const parent = makeNode({ title: suggestion.parentTitle, source: 'suggested' });
    created.push(parent);
    parentId = parent.id;
  }

  created.push(makeNode({
    title: suggestion.title,
    parentId,
    source: 'suggested'
  }));

  return created;
}

/** Zählt, was unter einem Bereich hängt — für die Anzeige. */
export function countUnder(id, nodes) {
  return collectSubtree(id, nodes).length - 1;
}

/**
 * Ordnet Journaleinträge einem Bereich zu — über die Lebensbereiche, die
 * beim Anlegen zugrunde lagen. Rein lesend, keine feste Verknüpfung:
 * ändert sich das Lexikon, ändert sich die Zuordnung mit.
 */
export function entriesForNode(node, entries) {
  if (!node?.themeIds?.length) return [];
  const wanted = new Set(node.themeIds);
  return entries.filter(e =>
    (e.analysis?.domains || []).some(d => wanted.has(d.id))
    || (e.analysis?.conflicts || []).some(c => wanted.has(c.id)));
}

/** Alle wählbaren Themen, damit ein Bereich an das Lexikon andocken kann. */
export function themeOptions(lang = 'de') {
  const de = lang !== 'en';
  return [
    ...DOMAINS.map(d => ({ id: d.id, label: de ? d.de : d.en, kind: 'domain' })),
    ...CONFLICTS.map(c => ({ id: c.id, label: de ? c.de : c.en, kind: 'conflict' }))
  ];
}
