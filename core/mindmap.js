/**
 * Bereiche als Karte statt als Liste.
 * Areas as a map instead of a list.
 *
 * Eine Liste sagt, was es gibt. Eine Karte zeigt, was woran hängt — und wie
 * viel an einer Stelle zusammenkommt. Für eine Ordnung, die man selbst baut,
 * ist das der nützlichere Blick.
 *
 * Gezeichnet wird als SVG mit fester viewBox, damit es auf jeder Breite
 * lesbar bleibt. Die Wurzeln liegen auf einem Kreis, ihre Kinder in einem
 * Fächer nach außen — bei den kleinen Mengen, um die es hier geht, bleibt
 * das übersichtlich, ohne dass Beschriftungen kollidieren.
 */

const W = 760;
const H = 560;
const CX = W / 2;
const CY = H / 2;

/** Zeilenumbruch für SVG: lange Titel in zwei Zeilen. */
function wrap(text, max = 17) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > max && line) { lines.push(line); line = word; }
    else line = (line + ' ' + word).trim();
    if (lines.length === 2) break;
  }
  if (line && lines.length < 2) lines.push(line);
  if (lines.length === 2 && words.join(' ').length > lines.join(' ').length) {
    lines[1] = lines[1].slice(0, max - 1) + '…';
  }
  return lines;
}

const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * @param roots   Baum aus buildTree()
 * @param opts    { lang, centre, onPick }
 * @returns SVGElement
 */
export function renderMindmap(roots, { lang = 'de', centre = null } = {}) {
  const de = lang !== 'en';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'mindmap');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', de ? 'Karte deiner Bereiche' : 'Map of your areas');

  if (!roots.length) return svg;

  const label = centre || (de ? 'Ich' : 'Me');
  const parts = [];

  // Wurzeln auf einem Kreis. Bei wenigen Knoten wirkt ein voller Kreis leer,
  // deshalb wächst der Radius mit der Anzahl.
  const n = roots.length;
  const radius = n <= 2 ? 140 : n <= 4 ? 165 : 185;
  const startAngle = -Math.PI / 2;

  roots.forEach((root, i) => {
    const angle = startAngle + (i / n) * Math.PI * 2;
    const x = CX + Math.cos(angle) * radius;
    const y = CY + Math.sin(angle) * radius;

    // Verbindung zur Mitte, leicht gebogen
    const mx = CX + Math.cos(angle) * radius * 0.5;
    const my = CY + Math.sin(angle) * radius * 0.5;
    const bend = 18;
    parts.push(`<path class="mm__link" d="M${CX},${CY} Q${mx + Math.cos(angle + Math.PI / 2) * bend},${my + Math.sin(angle + Math.PI / 2) * bend} ${x},${y}"/>`);

    const kids = root.children || [];
    const kidRadius = 108;
    // Fächer nach außen, verengt sich mit der Kinderzahl
    const spread = Math.min(Math.PI * 0.62, 0.34 * Math.max(1, kids.length));

    kids.forEach((kid, k) => {
      const offset = kids.length === 1 ? 0 : (k / (kids.length - 1) - 0.5) * spread;
      const kidAngle = angle + offset;
      const kx = x + Math.cos(kidAngle) * kidRadius;
      const ky = y + Math.sin(kidAngle) * kidRadius;

      parts.push(`<path class="mm__link mm__link--thin" d="M${x},${y} L${kx},${ky}"/>`);

      // Dritte Ebene: kleine Punkte am Kind, ohne Beschriftung —
      // der Platz reicht nicht, und die Liste zeigt sie ohnehin.
      const grand = kid.children || [];
      grand.forEach((_, g) => {
        const ga = kidAngle + (g - (grand.length - 1) / 2) * 0.3;
        const gx = kx + Math.cos(ga) * 34;
        const gy = ky + Math.sin(ga) * 34;
        parts.push(`<line class="mm__link mm__link--thin" x1="${kx}" y1="${ky}" x2="${gx}" y2="${gy}"/>`);
        parts.push(`<circle class="mm__seed" cx="${gx}" cy="${gy}" r="4"/>`);
      });

      const kidLines = wrap(kid.title, 15);
      parts.push(`<g class="mm__node mm__node--child">
        <rect x="${kx - 62}" y="${ky - (kidLines.length === 2 ? 20 : 14)}" width="124"
              height="${kidLines.length === 2 ? 40 : 28}" rx="9"/>
        ${kidLines.map((line, li) => `<text x="${kx}" y="${ky + (kidLines.length === 2 ? -3 + li * 15 : 4)}" text-anchor="middle">${esc(line)}</text>`).join('')}
      </g>`);
    });

    const rootLines = wrap(root.title, 17);
    parts.push(`<g class="mm__node mm__node--root">
      <rect x="${x - 72}" y="${y - (rootLines.length === 2 ? 23 : 16)}" width="144"
            height="${rootLines.length === 2 ? 46 : 32}" rx="11"/>
      ${rootLines.map((line, li) => `<text x="${x}" y="${y + (rootLines.length === 2 ? -3 + li * 16 : 5)}" text-anchor="middle">${esc(line)}</text>`).join('')}
    </g>`);
  });

  // Die Mitte zuletzt, damit sie über den Linien liegt
  parts.push(`<g class="mm__node mm__node--centre">
    <circle cx="${CX}" cy="${CY}" r="34"/>
    <text x="${CX}" y="${CY + 5}" text-anchor="middle">${esc(label)}</text>
  </g>`);

  svg.innerHTML = parts.join('');

  // Die viewBox an das anpassen, was tatsächlich gezeichnet wurde. Ein fester
  // Rahmen schneidet sonst je nach Anzahl und Winkel Beschriftungen ab —
  // und eine abgeschnittene Beschriftung ist schlimmer als eine kleine Karte.
  const boxes = [...svg.querySelectorAll('rect')].map(r => ({
    x1: +r.getAttribute('x'), y1: +r.getAttribute('y'),
    x2: +r.getAttribute('x') + +r.getAttribute('width'),
    y2: +r.getAttribute('y') + +r.getAttribute('height')
  }));
  const circles = [...svg.querySelectorAll('circle')].map(c => {
    const cx = +c.getAttribute('cx'), cy = +c.getAttribute('cy'), r = +c.getAttribute('r');
    return { x1: cx - r, y1: cy - r, x2: cx + r, y2: cy + r };
  });

  const all = [...boxes, ...circles];
  if (all.length) {
    const pad = 14;
    const minX = Math.min(0, ...all.map(b => b.x1)) - pad;
    const minY = Math.min(0, ...all.map(b => b.y1)) - pad;
    const maxX = Math.max(W, ...all.map(b => b.x2)) + pad;
    const maxY = Math.max(H, ...all.map(b => b.y2)) + pad;
    svg.setAttribute('viewBox', `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
  }

  return svg;
}
