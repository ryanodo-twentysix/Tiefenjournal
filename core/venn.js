/**
 * Zwei Kreise, die sich überschneiden, und in der Mitte das Thema.
 * Two overlapping circles, with the subject in the middle.
 *
 * WAS DAS BILD SAGEN SOLL
 *
 * Nicht „so viele Einträge liegen in dieser Schnittmenge" — das steht als
 * Zahl in der Legende darunter und muss nicht zweimal dastehen. Das Bild sagt
 * etwas Einfacheres: Diese beiden Richtungen gehören zu EINEM Thema, und das
 * Thema steht dort, wo sie sich berühren. Die Überschneidung ist der Rahmen
 * für den Namen, keine eigene Messgröße.
 *
 * Deshalb ist die Überlappung fest und nicht aus den Zahlen gerechnet. Was
 * die Zahlen weiterhin bestimmen, ist die Größe der Kreise: Über welche Seite
 * ist öfter geschrieben worden.
 *
 * ZUM TON
 *
 * Weich gehalten: durchscheinende Flächen statt kräftiger Farben, dünne
 * Ränder, kleine und zurückgenommene Ziffern. Wer hier hinsieht, sieht etwas
 * über sich; ein Diagramm, das wie eine Auswertung aussieht, macht daraus
 * ein Urteil.
 *
 * Die viewBox wird aus den tatsächlich gezeichneten Grenzen berechnet, nicht
 * fest gesetzt — sonst schneidet sie bei ungleichen Kreisen ab.
 */

const PAD = 10;
const R_MIN = 34;
const R_MAX = 62;

/** Wie tief die Kreise ineinanderstehen — als Anteil des kleineren Radius. */
const OVERLAP = 0.62;

/**
 * @param regions  { onlyA, onlyB, both } — Einträge je Feld
 * @param opts     { lang, labelA, labelB, subject }
 * @returns SVGElement
 */
export function renderVenn(regions, { lang = 'de', labelA = '', labelB = '', subject = '' } = {}) {
  const de = lang !== 'en';
  const onlyA = Math.max(0, regions?.onlyA || 0);
  const onlyB = Math.max(0, regions?.onlyB || 0);
  const both = Math.max(0, regions?.both || 0);

  const totalA = onlyA + both;
  const totalB = onlyB + both;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'venn');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', describe(onlyA, onlyB, both, labelA, labelB, subject, de));

  if (!totalA && !totalB) return svg;

  // Fläche proportional zur Anzahl: r ∝ √n.
  const peak = Math.max(totalA, totalB, 1);
  const radius = n => (n ? R_MIN + (R_MAX - R_MIN) * Math.sqrt(n / peak) : R_MIN);
  const rA = radius(totalA);
  const rB = radius(totalB);

  // Feste, sanfte Überschneidung. Kein Kreis darf dabei im anderen
  // verschwinden — sonst hätte eine Seite keine eigene Fläche mehr.
  const d = Math.max((rA + rB) - OVERLAP * Math.min(rA, rB), Math.abs(rA - rB) + 18);

  const cy = 0;
  const cxA = -d / 2;
  const cxB = d / 2;

  const minX = Math.min(cxA - rA, cxB - rB) - PAD;
  const maxX = Math.max(cxA + rA, cxB + rB) + PAD;
  const minY = Math.min(-rA, -rB) - PAD;
  const maxY = Math.max(rA, rB) + PAD;
  svg.setAttribute('viewBox', `${r2(minX)} ${r2(minY)} ${r2(maxX - minX)} ${r2(maxY - minY)}`);

  const parts = [];

  // Durchscheinende Flächen: Wo sie sich decken, wird es von selbst dunkler.
  // Keine eigens gezeichnete Linse — die Mitte ist hier kein Messfeld.
  parts.push(`<circle class="venn__c venn__c--a" cx="${r2(cxA)}" cy="${cy}" r="${r2(rA)}"/>`);
  parts.push(`<circle class="venn__c venn__c--b" cx="${r2(cxB)}" cy="${cy}" r="${r2(rB)}"/>`);

  // Die Ziffern sitzen in den freien Teilen links und rechts, nicht in der
  // Kreismitte — dort steht jetzt der Name.
  const lobeA = (cxA - rA + (cxB - rB)) / 2;
  const lobeB = ((cxA + rA) + (cxB + rB)) / 2;
  parts.push(number(lobeA, cy, onlyA, 'a'));
  parts.push(number(lobeB, cy, onlyB, 'b'));

  // Das Thema in der Mitte: weich getönt, denn es benennt, worum es geht —
  // es misst nichts.
  if (subject) {
    const lines = wrap(subject, 13);
    const step = 14;
    const top = cy - ((lines.length - 1) * step) / 2;
    const rows = lines.map((line, i) =>
      `<tspan x="0" y="${r2(top + i * step)}">${esc(line)}</tspan>`).join('');
    parts.push(`<text class="venn__subject" text-anchor="middle">${rows}</text>`);
  }

  svg.innerHTML = parts.join('');
  return svg;
}

/** Höchstens zwei Zeilen; was nicht passt, wird gekürzt. */
function wrap(text, max) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  for (const word of words) {
    const next = (line + ' ' + word).trim();
    if (next.length > max && line) {
      lines.push(line);
      line = word;
      if (lines.length === 2) break;
    } else {
      line = next;
    }
  }
  if (line && lines.length < 2) lines.push(line);
  if (!lines.length) return [];

  const last = lines.length - 1;
  if (lines[last].length > max) lines[last] = lines[last].slice(0, max - 1) + '…';
  return lines;
}

function number(x, y, value, which) {
  return `<text class="venn__n venn__n--${which}" x="${r2(x)}" y="${r2(y)}"`
    + ` text-anchor="middle" dominant-baseline="central">${value}</text>`;
}

function describe(onlyA, onlyB, both, labelA, labelB, subject, de) {
  const head = subject ? `${subject}: ` : '';
  if (de) {
    return `${head}${onlyA} Einträge nur „${labelA}", ${onlyB} nur „${labelB}", ${both} mit beidem.`;
  }
  return `${head}${onlyA} entries only "${labelA}", ${onlyB} only "${labelB}", ${both} with both.`;
}

const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const r2 = n => Math.round(n * 100) / 100;
