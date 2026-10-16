/**
 * Die vier Ebenen erklärt — ausführlich, an einem einzigen Beispiel.
 * The four levels explained — at length, through a single scenario.
 *
 * Warum eine eigene Ebene dafür: Die Einstufung „reif / neurotisch / unreif"
 * ist der Teil der App, der am ehesten missverstanden wird. In der Auswertung
 * steht nur so viel, wie neben eine Zahl passt. Wer wissen will, was der
 * Begriff eigentlich meint, soll das an einem durchgehenden Fall lesen können,
 * statt an sieben verstreuten Definitionen.
 *
 * Ein Szenario für alle vier Ebenen ist Absicht: Erst wenn dasselbe Ereignis
 * viermal verschieden verarbeitet wird, sieht man, dass es um die VERARBEITUNG
 * geht und nicht um das Ereignis — und nicht um den Menschen.
 *
 * Quelle der Ordnung: Vaillant, G. E. (1992). Ego Mechanisms of Defense.
 * Die Zuordnung einzelner Mechanismen folgt seiner Darstellung; die Beispiele
 * sind zur Veranschaulichung geschrieben und stammen nicht aus seinem Werk.
 */

export const GUIDE = {
  de: {
    title: 'Die vier Ebenen',
    subtitle: 'Woher die Einstufung kommt und was sie meint',

    intro: [
      'Abwehr ist nicht das Gegenteil von Gesundheit. Sie ist das, was der Mensch tut, wenn etwas zu viel wird — jeder tut es, ununterbrochen, meist ohne es zu merken. Die Frage ist nie, ob jemand Abwehr benutzt, sondern welche, und was sie kostet.',
      'George Vaillant hat diese Mechanismen über Jahrzehnte an denselben Menschen beobachtet und in vier Ebenen geordnet. Die Reihenfolge beschreibt, wie viel von der Wirklichkeit und wie viel vom eigenen Gefühl dabei erhalten bleibt — und wie hoch der Preis auf Dauer ausfällt.'
    ],

    scenarioTitle: 'Ein Beispiel, viermal',
    scenarioLede: 'Stell dir vor, du hast für eine Prüfung gelernt und gerade erfahren, dass du durchgefallen bist. Dasselbe Ereignis, vier Arten damit umzugehen.',

    levels: [
      {
        roman: 'I',
        name: 'Psychotisch',
        reality: 'Die Wirklichkeit wird umgeschrieben.',
        defences: 'Wahnhafte Projektion, psychotische Verleugnung, Verzerrung',
        example: '„Ich bin gar nicht durchgefallen." Oder: „Die Universität hat sich gegen mich verschworen."',
        note: 'Diese Ebene kommt in der Auswertung nicht eigens vor. Eine Wortzählung kann sie nicht von der nächsten unterscheiden, und sie gehört ohnehin nicht in ein Journal, sondern in ein Gespräch mit einem Menschen.'
      },
      {
        roman: 'II',
        name: 'Unreif',
        reality: 'Die Wirklichkeit wird halb zugelassen, der Schmerz aber nach außen geschoben — auf andere, in Handlung, oder in Fantasie.',
        defences: 'Projektion, passive Aggression, Ausagieren, Hypochondrie, schizoide Fantasie',
        example: '„Dieser Professor hat etwas gegen Leute wie mich." Aus Trotz nicht mehr zur Vorlesung gehen. Den Abend durchtrinken. Sich in Tagträume zurückziehen.',
        note: 'Unter starker Belastung greift jeder hierauf zurück. Auffällig wird es, wenn es die einzige verfügbare Antwort bleibt.'
      },
      {
        roman: 'III',
        name: 'Neurotisch',
        reality: 'Die Wirklichkeit wird anerkannt, aber das Gefühl wird abgeschnitten, versteckt oder umgeleitet. Die Kosten trägt man weitgehend allein.',
        defences: 'Intellektualisierung, Verdrängung, Verschiebung, Reaktionsbildung, Dissoziation',
        example: 'Kühl die Notenverteilung analysieren und dabei nichts spüren. Die Mitbewohnerin wegen des Abwaschs anfahren. Lautstark betonen, dass einem Noten noch nie wichtig waren.',
        note: 'Das ist der Alltag der meisten Menschen und fällt von außen kaum auf. Es kostet Lebendigkeit, nicht Realitätskontakt.'
      },
      {
        roman: 'IV',
        name: 'Reif',
        reality: 'Wirklichkeit und Gefühl bleiben beide im Blick, und die Energie findet einen Weg, der trägt.',
        defences: 'Unterdrückung (bewusstes Aufschieben), Antizipation, Sublimierung, Altruismus, Humor',
        example: '„Heute Abend darf mich das mitnehmen, morgen bei der Arbeit nicht." Die Wiederholung planen und sich vorstellen, wie die nächste Prüfung sich anfühlen wird. Den Frust in eine harte Trainingseinheit stecken. Einer Kommilitonin helfen, die auch durchgefallen ist. Ehrlich darüber Witze machen, ohne so zu tun, als wäre es egal.',
        note: 'Vaillant fand in seinen Längsschnittdaten einen Zusammenhang zwischen diesen Formen und besserer Anpassung über Jahrzehnte. Das ist ein Mittelwert über Gruppen, kein Maßstab für einen einzelnen Abend.'
      }
    ],

    readTitle: 'Wie du die Einstufung lesen solltest',
    reading: [
      'Sie gilt Mechanismen, nicht Menschen. „Unreif" beschreibt eine Bewältigungsform, nicht deine Person und nicht deinen Entwicklungsstand.',
      'Jeder benutzt alle Ebenen. Welche gerade greift, hängt mehr von der Belastung ab als vom Charakter.',
      'Abwehr schützt. Ein hoher Wert zeigt nicht, dass etwas mit dir nicht stimmt, sondern womit dein Text gerade fertig werden musste.',
      'Bewegung sagt mehr als ein Stand. Ob sich über Wochen etwas verschiebt, ist aufschlussreicher als das Verhältnis an einem Tag.',
      'Und: Diese App zählt Wörter. Sie erkennt weder Ironie noch Verneinung noch Zusammenhang. Was hier steht, ist ein Hinweis auf deine Sprache — keine Aussage über deinen Zustand.'
    ],

    close: 'Zurück',
    sourceTitle: 'Quelle',
    source: 'Vaillant, G. E. (1992). Ego Mechanisms of Defense: A Guide for Clinicians and Researchers. American Psychiatric Press. — Ergänzend: Vaillant, G. E. (2000). Adaptive mental mechanisms. American Psychologist, 55(1), 89–98.',
    sourceNote: 'Die Ordnung der Ebenen und die Zuordnung der Mechanismen folgen Vaillant. Die Beispiele oben sind zur Veranschaulichung geschrieben und stehen so nicht bei ihm.'
  },

  en: {
    title: 'The four levels',
    subtitle: 'Where the classification comes from and what it means',

    intro: [
      'Defence is not the opposite of health. It is what a person does when something becomes too much — everyone does it, constantly, mostly without noticing. The question is never whether someone uses defences, but which ones, and what they cost.',
      'George Vaillant observed these mechanisms in the same people across decades and ordered them into four levels. The order describes how much of reality and how much of one’s own feeling survives the process — and how high the long-run price turns out to be.'
    ],

    scenarioTitle: 'One scenario, four times',
    scenarioLede: 'Imagine you studied hard for an exam and just found out you failed it. The same event, four ways of handling it.',

    levels: [
      {
        roman: 'I',
        name: 'Psychotic',
        reality: 'Reality is rewritten.',
        defences: 'Delusional projection, psychotic denial, distortion',
        example: '"I didn’t actually fail." Or: "The university is conspiring against me."',
        note: 'This level does not appear separately in the read-out. A word count cannot tell it from the next one, and it belongs in a conversation with a person rather than in a journal.'
      },
      {
        roman: 'II',
        name: 'Immature',
        reality: 'Reality is half-admitted, but the pain is pushed onto others, into action, or into fantasy.',
        defences: 'Projection, passive aggression, acting out, hypochondriasis, schizoid fantasy',
        example: '"That professor has it in for people like me." Skipping lectures out of spite. Drinking the night away. Retreating into daydreams.',
        note: 'Under heavy strain everyone falls back on these. What is notable is when they remain the only available answer.'
      },
      {
        roman: 'III',
        name: 'Neurotic',
        reality: 'Reality is accepted, but the feeling is cut off, hidden, or redirected; the cost is mostly private.',
        defences: 'Intellectualization, repression, displacement, reaction formation, dissociation',
        example: 'Coolly analysing the grade distribution while feeling nothing. Snapping at a roommate over dishes. Loudly insisting you never cared about grades.',
        note: 'This is most people’s ordinary day and barely shows from outside. The cost is aliveness, not contact with reality.'
      },
      {
        roman: 'IV',
        name: 'Mature',
        reality: 'Both reality and feeling stay in view, and the energy gets channelled somewhere that holds.',
        defences: 'Suppression (deliberate postponing), anticipation, sublimation, altruism, humour',
        example: '"I’ll let myself be upset tonight, but not during tomorrow’s work." Planning the retake and imagining how the next exam will feel. Turning frustration into a hard training session. Helping a classmate who also failed. Joking about it honestly without pretending it doesn’t matter.',
        note: 'In Vaillant’s longitudinal data these forms were associated with better adaptation across decades. That is an average across groups, not a yardstick for one evening.'
      }
    ],

    readTitle: 'How to read the classification',
    reading: [
      'It applies to mechanisms, not people. "Immature" describes a form of coping, not your person and not your stage of development.',
      'Everyone uses all four levels. Which one operates depends more on the strain than on character.',
      'Defence protects. A high value does not show that something is wrong with you, but what your text had to cope with.',
      'Movement says more than a standing. Whether something shifts across weeks is more telling than the ratio on one day.',
      'And: this app counts words. It recognises neither irony nor negation nor context. What stands here is an indication about your language — not a statement about your state.'
    ],

    close: 'Back',
    sourceTitle: 'Source',
    source: 'Vaillant, G. E. (1992). Ego Mechanisms of Defense: A Guide for Clinicians and Researchers. American Psychiatric Press. — Also: Vaillant, G. E. (2000). Adaptive mental mechanisms. American Psychologist, 55(1), 89–98.',
    sourceNote: 'The ordering of levels and the assignment of mechanisms follow Vaillant. The examples above are written for illustration and do not appear in his work in this form.'
  }
};

/** Welche Ebene der App entspricht welcher Vaillant-Stufe? */
export const APP_LEVEL_MAP = {
  reif: 'IV',
  neurotisch: 'III',
  unreif: 'I–II'
};
