/**
 * Rundgang: was hinter den drei Teilen der App steckt.
 *
 * Er kommt direkt nach der Sprachwahl. Die Einführungsseite davor sagt, WAS
 * die App kann; der Rundgang zeigt, WARUM das etwas bringt — und wo es in der
 * App liegt. Deshalb ist er kein eigener Bildschirm, sondern ein Blatt über
 * der echten App: Jeder Schritt schlägt die passende Seite auf, und was man
 * dort drücken kann, leuchtet gelb-orange.
 *
 * Die Forschung steht leise dabei: ein Satz, wozu es gut ist, und die Quellen
 * zum Aufklappen. Formuliert wird, was die Studien zeigen — Zusammenhänge und
 * Effekte im Mittel, keine Versprechen für den Einzelnen.
 */

const WALK_KEY = 'tiefenjournal.walk';

export const walkSeen = () => {
  try { return localStorage.getItem(WALK_KEY) === '1'; } catch { return false; }
};
const markWalkSeen = () => {
  try { localStorage.setItem(WALK_KEY, '1'); } catch { /* dann eben beim nächsten Mal wieder */ }
};

const REFS = {
  words: [
    'Kashdan, T. B., Barrett, L. F., & McKnight, P. E. (2015). Unpacking emotion differentiation. Current Directions in Psychological Science, 24(1), 10–16.',
    'Pond, R. S., et al. (2012). Emotion differentiation moderates aggressive tendencies in angry people: A daily diary analysis. Emotion, 12(2), 326–337.',
    'Pennebaker, J. W., Mayne, T. J., & Francis, M. E. (1997). Linguistic predictors of adaptive bereavement. Journal of Personality and Social Psychology, 72(4), 863–871.',
    'Slatcher, R. B., & Pennebaker, J. W. (2006). How do I love thee? Let me count the words: The social effects of expressive writing. Psychological Science, 17(8), 660–664.'
  ],
  both: [
    'Vaillant, G. E. (1992). Ego Mechanisms of Defense: A Guide for Clinicians and Researchers. American Psychiatric Press.',
    'Vaillant, G. E. (2000). Adaptive mental mechanisms: Their role in a positive psychology. American Psychologist, 55(1), 89–98.',
    'Larsen, J. T., McGraw, A. P., & Cacioppo, J. T. (2001). Can people feel happy and sad at the same time? Journal of Personality and Social Psychology, 81(4), 684–696.',
    'Adler, J. M., & Hershfield, H. E. (2012). Mixed emotional experience is associated with and precedes improvements in psychological well-being. PLoS ONE, 7(4), e35633.'
  ],
  talk: [
    'Braun, J. D., Strunk, D. R., Sasso, K. E., & Cooper, A. A. (2015). Therapist use of Socratic questioning predicts session-to-session symptom change in cognitive therapy for depression. Behaviour Research and Therapy, 70, 32–37.',
    'Kross, E., & Ayduk, O. (2011). Making meaning out of negative experiences by self-distancing. Current Directions in Psychological Science, 20(3), 187–191.'
  ]
};

const STEPS = [
  {
    page: 'heute', flare: [],
    de: {
      eyebrow: 'Rundgang',
      title: 'Was du hier bekommst',
      body: [
        'Tiefenjournal arbeitet in drei Schritten, die aufeinander aufbauen. Jeder stützt sich auf Forschung; die Quellen stehen jeweils klein darunter.'
      ],
      list: [
        ['Genauer benennen', 'Wörter für Gefühle und ihre Ursachen.'],
        ['Muster sehen', 'Beide Seiten eines Widerspruchs halten.'],
        ['Nachfragen', 'Im Gespräch verstehen, woher die Muster kommen.']
      ],
      hint: 'Was gelb-orange leuchtet, kannst du drücken.'
    },
    en: {
      eyebrow: 'Tour',
      title: 'What you get here',
      body: [
        'Tiefenjournal works in three steps that build on each other. Each one rests on research; the sources sit quietly underneath.'
      ],
      list: [
        ['Name it precisely', 'Words for feelings and what causes them.'],
        ['See the patterns', 'Hold both sides of a contradiction.'],
        ['Ask further', 'Understand in conversation where the patterns come from.']
      ],
      hint: 'Anything glowing yellow-orange can be pressed.'
    }
  },
  {
    page: 'heute', mode: 'three', flare: ['#mode-three-btn', '.tile[data-goto="heute"]'], refs: 'words',
    de: {
      eyebrow: 'Schritt 1 · Wortschatz',
      title: 'Genauer benennen, was in dir los ist',
      body: [
        '„Gestresst“ ist ein Sammelwort. Darunter kann Kränkung liegen, Angst vor dem Urteil anderer oder Ärger, den man nicht zeigen darf — und jedes davon braucht etwas anderes.',
        'Deshalb gibt es hier 136 Gefühlswörter, und zu jedem gehört ein „weil“: nicht nur, was du fühlst, sondern wodurch.'
      ],
      why: 'Wer Gefühle feiner unterscheidet, reagiert unter Ärger seltener aggressiv und kommt mit Belastung besser zurecht. Wer beim Schreiben zunehmend Ursache-Wörter benutzt (weil, deshalb, mir wird klar), profitiert am meisten davon. Und Paare, in denen einer über die Beziehung schrieb, benutzten danach mehr Gefühlswörter miteinander — und waren Monate später häufiger noch zusammen.',
      short: 'Kashdan et al. 2015 · Pond et al. 2012 · Pennebaker et al. 1997 · Slatcher & Pennebaker 2006',
      hint: 'Tippe auf „Drei Sätze“ und such dir ein Gefühl aus der Liste aus.'
    },
    en: {
      eyebrow: 'Step 1 · Vocabulary',
      title: 'Name precisely what is going on in you',
      body: [
        '"Stressed" is a catch-all. Underneath it might be hurt, fear of being judged, or anger you are not allowed to show — and each of those needs something different.',
        'That is why there are 136 feeling words here, and each comes with a "because": not just what you feel, but what caused it.'
      ],
      why: 'People who tell their feelings apart more finely act out less when angry and cope better with strain. People whose writing increasingly uses causal words (because, therefore, I realise) benefit most from it. And couples in which one partner wrote about the relationship used more emotion words with each other afterwards — and were more often still together months later.',
      short: 'Kashdan et al. 2015 · Pond et al. 2012 · Pennebaker et al. 1997 · Slatcher & Pennebaker 2006',
      hint: 'Tap "Three sentences" and pick a feeling from the list.'
    }
  },
  {
    page: 'projekte', pane: 'fields', show: '#fields .tf__venn', flare: ['#show-fields', '.tile[data-goto="projekte"]'], refs: 'both',
    de: {
      eyebrow: 'Schritt 2 · Muster',
      title: 'Beide Seiten halten, statt dich entscheiden zu müssen',
      body: [
        'Aus vielen Einträgen erkennt das Journal, was wiederkehrt — und vor allem, wo zwei Gefühle gegeneinander ziehen: jemanden vermissen und Abstand wollen, stolz sein und sich schämen.',
        'Unter „Widersprüche halten“ siehst du solche Paare als zwei Kreise. Die Mitte zeigt die Tage, an denen beides zugleich da war.'
      ],
      why: 'Wird ein innerer Konflikt in ein Entweder-oder gepresst, springt man zwischen den Seiten hin und her — das erzeugt Frust und Verwirrung. George Vaillant zählt das Ganz-gut-oder-ganz-schlecht-Sehen zu den unreifen Abwehrformen; reife Bewältigung lässt den Konflikt bestehen und gibt ihm eine Form. Menschen in Psychotherapie, die gemischte Gefühle zulassen konnten, ging es in den Wochen danach messbar besser.',
      short: 'Vaillant 1992, 2000 · Larsen et al. 2001 · Adler & Hershfield 2012',
      hint: 'Scroll durch die Kreise: In der Mitte stehen die Tage, an denen beides zugleich da war.'
    },
    en: {
      eyebrow: 'Step 2 · Patterns',
      title: 'Hold both sides instead of having to choose',
      body: [
        'Across many entries the journal recognises what keeps coming back — and above all where two feelings pull against each other: missing someone and wanting distance, being proud and ashamed.',
        'Under "Holding Contradictions" you see such pairs as two circles. The middle shows the days when both were there at once.'
      ],
      why: 'Squeeze an inner conflict into either-or and you swing between the sides — which breeds frustration and confusion. George Vaillant counts all-good-or-all-bad seeing among the immature defences; mature coping lets the conflict stand and gives it a form. People in psychotherapy who could allow mixed feelings measurably improved in the weeks that followed.',
      short: 'Vaillant 1992, 2000 · Larsen et al. 2001 · Adler & Hershfield 2012',
      hint: 'Scroll through the circles: the middle holds the days when both were there at once.'
    }
  },
  {
    page: 'dialog', flare: ['.tile[data-goto="dialog"]', '#start-dialogue'], refs: 'talk',
    de: {
      eyebrow: 'Schritt 3 · Dialog',
      title: 'Im Gespräch verstehen, woher es kommt',
      body: [
        'Der Dialog hat alles gelesen, was du geschrieben hast. Er gibt keine Ratschläge, sondern fragt nach — mit Bezug auf deine eigenen Einträge: Wann kam das zum ersten Mal vor? Was war davor? Was würde die andere Person sagen?',
        'So lernst du an deiner eigenen Erfahrung, wo deine Muster entstehen.'
      ],
      why: 'In der kognitiven Therapie sagt der Gebrauch sokratischer Fragen voraus, wie stark Beschwerden von Sitzung zu Sitzung zurückgehen. Und wer eine belastende Erfahrung mit etwas Abstand betrachtet, statt in ihr zu kreisen, grübelt weniger und versteht sie besser.',
      short: 'Braun et al. 2015 · Kross & Ayduk 2011',
      hint: 'Tippe auf „Offen beginnen“ – oder beginne bei einem deiner Muster.'
    },
    en: {
      eyebrow: 'Step 3 · Dialogue',
      title: 'Understand in conversation where it comes from',
      body: [
        'The dialogue has read everything you wrote. It gives no advice but asks — with reference to your own entries: When did this first happen? What came before? What would the other person say?',
        'That way you learn from your own experience where your patterns arise.'
      ],
      why: 'In cognitive therapy, the use of Socratic questions predicts how much symptoms ease from one session to the next. And looking at a painful experience from a little distance, instead of circling inside it, means less brooding and more understanding.',
      short: 'Braun et al. 2015 · Kross & Ayduk 2011',
      hint: 'Tap "Start open" – or begin from one of your patterns.'
    }
  },
  {
    page: 'heute', flare: ['#open-opts'],
    de: {
      eyebrow: 'Zum Schluss',
      title: 'Mach es zu deinem',
      body: [
        'Hinter den drei Punkten oben rechts findest du Farbpaletten und Formen — und diesen Rundgang, falls du ihn noch einmal sehen willst.',
        'Kein Ersatz für Therapie. Alles bleibt auf deinem Gerät.'
      ],
      hint: 'Tippe auf die drei Punkte oben rechts.'
    },
    en: {
      eyebrow: 'Finally',
      title: 'Make it yours',
      body: [
        'Behind the three dots at the top right you will find colour palettes and shapes — and this tour, in case you want to see it again.',
        'No replacement for therapy. Everything stays on your device.'
      ],
      hint: 'Tap the three dots at the top right.'
    }
  }
];

const UI = {
  de: {
    back: 'Zurück', next: 'Weiter', done: 'Los geht\'s', skip: 'Überspringen',
    why: 'Warum das hilft', sources: 'Quellen', step: (i, n) => `${i} von ${n}`,
    look: 'Selbst ansehen', text: 'Erklärung',
    lookLine: 'Schau dich in Ruhe um – tippe, scrolle, probier aus. Was leuchtet, kannst du drücken.'
  },
  en: {
    back: 'Back', next: 'Next', done: 'Let\'s go', skip: 'Skip',
    why: 'Why it helps', sources: 'Sources', step: (i, n) => `${i} of ${n}`,
    look: 'Look for yourself', text: 'Explanation',
    lookLine: 'Take your time – tap, scroll, try things out. Anything glowing can be pressed.'
  }
};

/**
 * Jeder Schritt mit etwas zum Ansehen hat zwei Phasen:
 *
 *   lesen    — das Blatt mit der Erklärung. Es deckt einen Teil der Seite zu.
 *   ansehen  — das Blatt schrumpft zu einer schmalen Leiste; die Seite liegt
 *              frei, man kann scrollen, tippen, ausprobieren. „Weiter" geht
 *              erst von hier zum nächsten Schritt.
 *
 * Der Zwischenschritt ist Absicht: Die Erklärungen sind lang, und wer gerade
 * etwas über Widersprüche gelesen hat, soll die Kreise in Ruhe ansehen können,
 * bevor der nächste Text kommt. Schritte ohne Ziel auf der Seite (der
 * Überblick am Anfang) haben nur die Lesephase.
 */
export function openWalkthrough({ el, lang, goTo, showPane, setMode }) {
  const host = document.getElementById('walk');
  const lit = new Set();
  let index = 0;
  let phase = 'read';

  const unflare = () => { for (const n of lit) n.classList.remove('flare'); lit.clear(); };

  const finish = () => {
    unflare();
    markWalkSeen();
    host.hidden = true;
    host.textContent = '';
    host.classList.remove('walk--look');
    document.removeEventListener('keydown', onKey);
    goTo('heute');
  };

  const canLook = i => STEPS[i].flare.length > 0;

  const onKey = ev => {
    if (ev.key === 'Escape') finish();
    else if (ev.key === 'ArrowRight') forward();
    else if (ev.key === 'ArrowLeft') backward();
  };

  // Vorwärts: vom Lesen ins Ansehen, vom Ansehen zum nächsten Schritt.
  const forward = () => {
    if (phase === 'read' && canLook(index)) { phase = 'look'; paint(); return; }
    go(index + 1);
  };
  const backward = () => {
    if (phase === 'look') { phase = 'read'; paint(); return; }
    go(index - 1);
  };

  const go = i => {
    if (i < 0) return;
    if (i >= STEPS.length) { finish(); return; }
    index = i;
    phase = 'read';
    stage();
    paint();
  };

  // Seite aufschlagen und Ziele zum Leuchten bringen — einmal je Schritt, nicht
  // bei jedem Phasenwechsel, damit die Seite beim Hin und Her nicht springt.
  const stage = () => {
    const step = STEPS[index];
    goTo(step.page);
    if (step.pane) showPane(step.pane);
    if (step.mode) setMode(step.mode);
    // Was der Schritt erklärt, soll zu sehen sein.
    if (step.show) document.querySelector(step.show)?.scrollIntoView({ block: 'start' });

    unflare();
    for (const sel of step.flare) {
      const n = document.querySelector(sel);
      if (n && !n.hidden) { n.classList.add('flare'); lit.add(n); }
    }
  };

  const dots = ui => el('div', { class: 'walk__dots', 'aria-label': ui.step(index + 1, STEPS.length) },
    STEPS.map((_, i) => el('i', { class: i === index ? 'on' : '' })));

  const paint = () => {
    const step = STEPS[index];
    const L = lang() === 'en' ? 'en' : 'de';
    const tx = step[L];
    const ui = UI[L];
    const last = index === STEPS.length - 1;
    const look = canLook(index);

    host.textContent = '';
    host.classList.toggle('walk--look', phase === 'look');

    if (phase === 'look') {
      const bar = el('div', { class: 'walk__bar', role: 'region', 'aria-label': tx.eyebrow },
        el('div', { class: 'walk__bar-text' },
          el('span', { class: 'walk__eyebrow' }, tx.eyebrow),
          tx.hint ? el('p', { class: 'walk__bar-hint' }, tx.hint) : null,
          el('p', { class: 'walk__bar-line' }, ui.lookLine)),
        el('div', { class: 'walk__foot' },
          dots(ui),
          el('div', { class: 'walk__btns' },
            el('button', { class: 'btn btn--tiny flare-soft', type: 'button', onclick: backward }, `↑ ${ui.text}`),
            el('button', { class: 'btn btn--primary btn--tiny flare', type: 'button', onclick: forward },
              last ? ui.done : `${ui.next} →`))));
      host.append(bar);
      bar.querySelector('.btn--primary')?.focus({ preventScroll: true });
      return;
    }

    const sheet = el('div', { class: 'walk__sheet', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'walk-title' },
      el('div', { class: 'walk__top' },
        el('span', { class: 'walk__eyebrow' }, tx.eyebrow),
        el('button', { class: 'walk__skip flare-soft', type: 'button', onclick: finish }, ui.skip)),
      el('h2', { class: 'walk__title', id: 'walk-title' }, tx.title),
      ...tx.body.map(p => el('p', { class: 'walk__p' }, p)),
      tx.list ? el('ol', { class: 'walk__list' },
        tx.list.map(([h, d], i) => el('li', {},
          el('span', { class: 'walk__n', 'aria-hidden': 'true' }, String(i + 1)),
          el('div', {}, el('b', {}, h), el('span', {}, d))))) : null,
      tx.why ? el('div', { class: 'walk__why' },
        el('p', { class: 'walk__why-h' }, ui.why),
        el('p', {}, tx.why),
        el('details', { class: 'walk__refs' },
          el('summary', {}, `${ui.sources}: ${tx.short}`),
          el('ul', {}, REFS[step.refs].map(r => el('li', {}, r))))) : null,
      // Der Hinweis, was man drücken kann, steht in der Ansehen-Leiste —
      // hier nur, wenn es keine gibt.
      tx.hint && !look ? el('p', { class: 'walk__hint' }, tx.hint) : null,
      el('div', { class: 'walk__foot' },
        dots(ui),
        el('div', { class: 'walk__btns' },
          index > 0 ? el('button', { class: 'btn btn--tiny flare-soft', type: 'button', onclick: backward }, ui.back) : null,
          el('button', { class: 'btn btn--primary btn--tiny flare', type: 'button', onclick: forward },
            look ? `${ui.look} →` : (last ? ui.done : ui.next)))));

    host.append(sheet);
    sheet.scrollTop = 0;
    sheet.querySelector('.walk__btns .btn--primary')?.focus({ preventScroll: true });
  };

  host.hidden = false;
  document.addEventListener('keydown', onKey);
  go(0);
}
