/**
 * Tiefenjournal — Artefakt-Fassung.
 *
 * Ein Bungalow: eine Ebene, keine Türen. Die Kachelleiste springt innerhalb
 * derselben Seite; es gibt keine Modale und keine Unterseiten. Die Tiefe
 * entsteht durch das, was hineingeschrieben wird — und durch die Bereiche,
 * die man sich selbst baut.
 *
 * Keine Aufnahmefunktion: Ein eingebetteter Rahmen bekommt vom Browser keinen
 * Mikrofonzugriff, und das lässt sich von innen nicht ändern. Diktieren läuft
 * in der lokal gehosteten Fassung.
 */

import { makeT } from './core/i18n.js';
import { EMOTION_FAMILIES, EMOTION_INDEX } from './core/emotions.js';
import { CRISIS_RESOURCES } from './core/themes.js';
import { analyseEntry, aggregate, needsReanalysis } from './core/analyze.js';
import { renderOverviewMarkdown } from './core/reports.js';
import { respond, openingMessage, closingSummary } from './core/socratic.js';
import { renderSynthesis, renderMetrics } from './core/patterns.js';
import { deriveProjects, makeGoal, goalsFor, goalStarters } from './core/projects.js';
import { openingLine, afterSave, strengths, daysSince } from './core/encouragement.js';
import {
  makeNode, buildTree, depthOf, canHaveChildren, collectSubtree, pathOf,
  suggestArea, materialise, countUnder, entriesForNode, themeOptions, MAX_DEPTH
} from './core/structure.js';
import { buildTensionFields, TENSION_FRAMING } from './core/tension.js';
import { renderVenn } from './core/venn.js';
import { renderMindmap } from './core/mindmap.js';
import * as db from './db.js';
import { buildAppPackage, buildArchive } from './package.js';
import { openExpress } from './express.js';
import { openGuide } from './guide.js';
import { attachDictation, dictationState, dictationHint } from './dictate.js';
import { applyLook, initOptions } from './look.js';
import { openWalkthrough, walkSeen } from './walkthrough.js';

// Farbe und Form sofort, noch vor allem anderen — sonst blitzt beim Öffnen
// die Ausgangspalette auf.
applyLook();

/* ═══════════ Ergänzende Texte ═══════════ */

const EXTRA = {
  de: {
    'nav.projects': 'Mustererkennung',
    'nav.struct': 'Bereiche',

    'journal.title': 'Erzähl, was los ist',
    'journal.sub': 'Sprich oder tippe — beides geht.',
    'journal.placeholder': 'Was war heute? Erzähl einfach los — es muss nicht geordnet sein.',
    'mode.journal': 'Erzählen',
    'mode.three': 'Drei Sätze',
    'save.hintJournal': 'Ein paar Sätze reichen. Speichern kannst du jederzeit.',

    'struct.title': 'Deine Bereiche',
    'struct.lede': 'Die Themenerkennung sortiert nach einem festen Lexikon. Hier baust du deine eigene Ordnung: „Beziehungen" kann sich verzweigen in „Beziehung zu den Eltern", und weiter. Anlegen kannst du jederzeit — auch mitten im Gespräch.',
    'struct.empty': 'Noch keine Bereiche',
    'struct.emptyBody': 'Fang mit etwas Grobem an — „Beziehungen", „Arbeit", „Ich mit mir". Verzweigen kannst du später.',
    'struct.new': 'Bereich anlegen',
    'struct.newChild': 'Unterbereich',
    'struct.namePh': 'Name des Bereichs',
    'struct.notePh': 'Wofür ist dieser Bereich da? (optional)',
    'struct.create': 'Anlegen',
    'struct.cancel': 'Abbrechen',
    'struct.created': 'Bereich angelegt',
    'struct.deleted': 'Bereich entfernt',
    'struct.deleteConfirm': n => n > 0
      ? `Diesen Bereich und ${n} Unterbereich(e) entfernen?`
      : 'Diesen Bereich entfernen?',
    'struct.under': n => `${n} Unterbereich${n === 1 ? '' : 'e'}`,
    'struct.linked': n => `${n} Eintrag${n === 1 ? '' : 'e'} passt dazu`,
    'struct.linkThemes': 'Themen verknüpfen',
    'struct.linkHint': 'Welche erkannten Themen gehören in diesen Bereich? Danach zeigt er dir die passenden Einträge.',
    'struct.done': 'Fertig',
    'struct.maxDepth': 'Tiefer geht es bewusst nicht — drei Ebenen reichen, um zu ordnen.',
    'struct.talk': 'Darüber sprechen',

    'nudge.title': s => `„${s}" als Bereich anlegen?`,
    'nudge.body': 'Das Thema kam gerade im Gespräch vor. Ein Bereich macht daraus einen Ort, an dem du es wiederfindest.',
    'nudge.under': p => `Wird unter „${p}" eingehängt.`,
    'nudge.yes': 'Anlegen',
    'nudge.no': 'Jetzt nicht',
    'nudge.made': s => `„${s}" angelegt`,

    'proj.eyebrow': 'Synthese',
    'proj.title': 'Mustererkennung',
    'proj.purpose': 'Das hier ersetzt keine Therapie. Es führt zusammen, was du über Wochen aufgeschrieben hast, und hält es gegen einen psychotherapeutischen Rahmen — damit sichtbar wird, woran zu arbeiten sich lohnt. Was du damit machst, entscheidest du.',
    'proj.empty': 'Noch keine Projekte',
    'proj.emptyBody': 'Projekte entstehen aus Wiederholung. Ab etwa drei Einträgen, die dasselbe Spannungsfeld berühren, fängt dieser Abschnitt an, etwas vorzuschlagen.',
    'proj.strengths': 'Was für dich spricht',
    'proj.suggested': 'Vorgeschlagen aus deinem Verlauf',
    'proj.adopt': 'Daran arbeiten',
    'proj.drop': 'Nicht mehr verfolgen',
    'proj.talk': 'Im Dialog aufgreifen',
    'proj.entries': (n, m) => `${n} von ${m} Einträgen`,
    'proj.span': d => d > 0 ? `über ${d} Tage` : 'an einem Tag',
    'proj.repeats': n => `${n}× „schon wieder"`,
    'proj.frameTitle': 'Rahmen zum Vergleich',
    'proj.patternsTitle': 'Das Material darunter',
    'proj.adoptedToast': 'Als Projekt übernommen',
    'proj.droppedToast': 'Nicht mehr verfolgt',

    'goal.title': 'Ziele',
    'goal.empty': 'Noch kein Ziel. Ein Ziel formulierst du selbst — die App schlägt keins vor, weil ein fremdes Ziel eine Hausaufgabe wäre.',
    'goal.add': 'Ziel',
    'goal.added': 'Ziel angelegt',
    'goal.placeholder': 'Was willst du daran tun?',
    'goal.starters': 'Halbe Sätze zum Weiterschreiben — keine Vorgaben:',
    'goal.done': 'Als erledigt markieren',
    'goal.reopen': 'Wieder öffnen',
    'goal.doneToast': 'Erledigt. Erledigt darf auch wieder offen werden.',

    'metrics.title': 'Zahlen zum Erleben',
    'metrics.careTitle': 'Bevor du weiterliest',
    'metrics.careBody': 'Ab hier wird gezählt. Zahlen über das eigene Fühlen sind heikel: Sie wirken objektiver, als sie sind, und ein Wert, der in die falsche Richtung zeigt, kann genau das verstärken, was er misst. Lies sie als groben Umriss deiner Wortwahl — nicht als Messung deines Zustands.',
    'metrics.caveatsTitle': 'Wie diese Zahlen nicht zu lesen sind',
    'metrics.defencesIntro': 'Wie dein Text mit Belastung umgeht. Die Einteilung in reif, neurotisch und unreif stammt aus der Abwehrhierarchie von George Vaillant (1992) — sie gilt Mechanismen, nicht Menschen.',
    'metrics.explainLevels': 'Die vier Ebenen erklärt',
    'metrics.tapForDef': 'Auf einen Begriff tippen, um seine Definition und Einordnung zu sehen.',
    'metrics.notVaillant': 'Zusatz dieser App — kein Begriff aus Vaillants Ordnung.',
    'metrics.courseTitle': 'Verlauf',
    'metrics.courseNote': 'Als Satz statt als Kurve: Eine fallende Linie ist keine neutrale Rückmeldung, sondern kann drücken, was sie anzeigt.',
    'metrics.emotionsNote': 'Wie oft du welches Wort benutzt hast — eine Häufigkeit, kein Ranking deiner Gefühle.',
    'metrics.ambivalenceNote': 'Einträge mit Angenehmem und Unangenehmem zugleich',
    'metrics.words': 'Ø Wörter',
    'metrics.wordsNote': 'pro Eintrag',
    'metrics.mostNamed': 'Am häufigsten benannt',
    'metrics.mostNamedNote': 'sagt etwas über deine Sprache, nicht über dein Leben',

    'patterns.domainsNote': 'Wo sich dein Erleben abspielt — nach den Orten geordnet, die du beschreibst.',
    'patterns.couplingIntro': 'Welche Gefühle regelmäßig zusammen mit welchem Thema auftauchen.',

    'demo.badge': 'Beispiel',
    'demo.banner': 'Ein kurzer Beispielverlauf zeigt, wie Verlauf, Projekte und Dialog aussehen, sobald etwas dasteht. Er zählt nicht als deine Einträge und wird nicht mitexportiert.',
    'demo.remove': 'Beispiele entfernen',
    'demo.removed': 'Beispiele entfernt',

    'chat.openFree': 'Offen beginnen',
    'chat.aboutProject': p => `Über „${p}" sprechen`,
    'chat.aboutArea': p => `Über „${p}" sprechen`,
    'chat.finish': 'Gespräch abschließen',
    'chat.finished': 'Abgeschlossen',
    'chat.summaryTitle': 'Bilanz',
    'chat.transcriptNote': 'Das ganze Gespräch steht oben — von der ersten Frage an.',
    'chat.save': 'Als Text sichern',
    'chat.saved': 'Gespräch gesichert',
    'chat.reopen': 'Weiterschreiben',
    'chat.projectIntro': p => `Dieses Gespräch nimmt „${p}" als Ausgangspunkt und stützt sich auf alle Einträge dazu.`,
    'chat.conversations': 'Gespräche',
    'chat.newOne': 'Neues Gespräch',

    'yield.title': 'Was aus deinen Gesprächen kam',
    'yield.intro': 'Jede Bilanz hier ist am Ende eines Gesprächs entstanden, das du geführt hast. Die App fasst zusammen, was darin vorkam — gearbeitet hast du.',
    'yield.empty': 'Noch keine abgeschlossenen Gespräche',
    'yield.emptyBody': 'Was hier steht, entsteht im Dialog. Ein Gespräch, das du abschließt, hinterlässt hier seine Bilanz — und die Projekte darunter lesen sich danach anders.',
    'yield.start': 'Ein Gespräch beginnen',
    'yield.open': 'Öffnen',
    'yield.more': n => `und ${n} weitere`,

    'settings.storageLabel': 'Wo deine Einträge liegen',
    'settings.storageDesc': 'Ausschließlich in diesem Browser auf diesem Gerät — nicht auf einem Server, auch nicht bei Claude. Das heißt auch: Löschst du die Seitendaten des Browsers, sind die Einträge weg. Exportiere regelmäßig.',
    'settings.persisted': 'Dauerhaft gesichert — der Browser räumt die Daten nicht bei Speicherdruck weg.',
    'settings.notPersisted': 'Noch nicht dauerhaft gesichert.',
    'settings.persistAsk': 'Dauerhaft speichern',
    'settings.persistOk': 'Dauerhafte Speicherung aktiv',
    'settings.persistNo': 'Der Browser hat abgelehnt. Export bleibt dein Sicherheitsnetz.',
    'settings.usage': (u, q) => `${u} von ${q} belegt`,
    'proj.tabProjects': 'Themen',
    'proj.tabFields': 'Widersprüche halten',
    'mic.label': 'Diktieren',
    'mic.hold': 'Halten',
    'fields.open': 'Als Bild ansehen',
    'fields.openWith': n => n === 1
      ? 'Ansehen — bei einem Thema war schon beides zugleich da'
      : `Ansehen — bei ${n} Themen war schon beides zugleich da`,
    'struct.asList': 'Liste',
    'struct.asMap': 'Karte',
    'struct.mapNote': 'Die Karte zeigt, was woran hängt. Die dritte Ebene erscheint als Punkt — mit Beschriftung in der Liste.',

    'ask.cancel': 'Abbrechen',
    'ask.remove': 'Entfernen',
    'express.open': 'Ohne Worte',
    'tip.title': 'Gespeichert – auf diesem Gerät',
    'tip.keep': 'Du kannst den Browser jetzt einfach schließen. Beim nächsten Öffnen ist dein Eintrag wieder da.',
    'tip.private': 'Er liegt nur hier, in diesem Browser. Niemand sonst sieht ihn – jeder, der die App öffnet, hat sein eigenes Journal.',
    'tip.lose': 'Verloren geht er nur, wenn du die Browserdaten löschst oder im privaten Modus schreibst. Auf einem anderen Gerät oder in einem anderen Browser beginnt ein eigenes, leeres Journal.',
    'tip.ios': 'Tipp für iPhone und iPad: Über „Teilen“ → „Zum Home-Bildschirm“ wird Tiefenjournal zur App – dann räumt Safari deine Einträge auch nach längerer Pause nicht weg.',
    'tip.ok': 'Verstanden',
    'tip.backup': 'Sicherung anlegen',
    'backup.firstTitle': 'Eine Woche Tiefenjournal',
    'backup.againTitle': 'Zeit für eine neue Sicherung',
    'backup.body': 'Deine Einträge liegen nur in diesem Browser. Eine Sicherung als Datei schützt sie, falls die Seitendaten einmal gelöscht werden — Safari auf iPhone und iPad tut das zum Beispiel nach etwa sieben Tagen ohne Besuch.',
    'backup.since': (days, n) => `Deine letzte Sicherung ist ${days} Tage her; seitdem ${n === 1 ? 'ist ein Eintrag' : `sind ${n} Einträge`} dazugekommen.`,
    'backup.now': 'Jetzt sichern',
    'backup.later': 'Später',
    'backup.snoozed': 'In einer Woche erinnere ich dich wieder.',
    'express.sub': 'Zeichnen oder einfach Stimme — wenn Sätze gerade nicht passen',
    'express.keptDrawing': 'Zeichnung behalten',
    'express.keptVoice': 'Aufnahme behalten',
    'express.drawTag': 'Zeichnung',
    'express.voiceTag': 'Stimme',

    'take.label': 'App herunterladen',
    'take.desc': 'Die App und deine Daten als Datei — zum Mitnehmen auf Android oder iPhone. Zwei Wege, weil sie verschiedene Dinge können.',
    'take.app': 'App-Paket (.zip)',
    'take.appDesc': 'Die vollständige App plus deine Daten. Auf einen HTTPS-Ort gelegt, läuft sie voll: schreiben, auswerten, offline, zum Startbildschirm hinzufügbar. Eine Anleitung für Android und iPhone liegt bei.',
    'take.archive': 'Archiv (.html)',
    'take.archiveDesc': 'Eine einzige Datei, die dein Journal lesbar macht — überall zu öffnen, ohne alles andere. Sie kann nichts speichern.',
    'take.why': 'Warum nicht eine Datei, die alles kann: Öffnet man eine HTML-Datei direkt vom Telefonspeicher, verweigern Browser den dauerhaften Speicher. Lesen geht, Schreiben nicht — ein Journal, das nichts behält, wäre eine Attrappe.',
    'take.building': 'Wird gepackt …',
    'take.builtApp': 'App-Paket gespeichert. Die beiliegende Anleitung erklärt beide Wege.',
    'take.builtArchive': 'Archiv gespeichert',
    'take.failed': 'Packen fehlgeschlagen',
    'take.noSave': 'Dieses Fenster darf gerade keine Datei ablegen. Beim Antippen fragt der Browser danach — erlaubst du es, wird gespeichert.',
    'take.maybeSaved': 'Abgeschickt. Schau in die Downloads deines Browsers — in einem eingebetteten Fenster meldet er den Erfolg nicht zurück.',
    'take.noWay': 'Dieser Browser lässt hier keine Datei heraus. Auf einem Rechner klappt es; vom Telefon aus ist das ohnehin der bessere Weg.',
    'take.phone': 'Auf dem Telefon selbst hilft die ZIP-Datei wenig: Ein Telefon kann sie nicht auspacken und ausliefern. Der Weg, der funktioniert: die Datei am Rechner herunterladen, den Inhalt bei einem kostenlosen Statik-Hoster ablegen (Netlify Drop, Cloudflare Pages, GitHub Pages) und die entstandene Adresse weitergeben. Wer sie öffnet, kann sie zum Startbildschirm hinzufügen — dann bleiben die Einträge liegen, und das Diktat funktioniert.',
    'settings.introLabel': 'Wozu diese App gut ist',
    'settings.introDesc': 'Die Einführungsseite von ganz am Anfang — die fünf Teile und wie sie zusammenhängen.',
    'settings.introOpen': 'Noch einmal lesen',
    'settings.walkLabel': 'Rundgang',
    'settings.walkDesc': 'Die drei Schritte und die Forschung dahinter — direkt an den Stellen in der App, an denen sie liegen.',
    'settings.walkOpen': 'Rundgang starten',
    'opts.label': 'Optionen',

    'settings.exportLabel': 'Sichern & übertragen',
    'settings.exportDesc': 'Eine Datei mit allen echten Einträgen, Bereichen und Dialogen. Dieselbe Datei liest die PC-Fassung ein.',
    'settings.export': 'Exportieren',
    'settings.exportSaved': 'Datei gespeichert',
    'settings.exportDeclined': 'Speichern abgebrochen',
    'settings.importLabel': 'Import',
    'settings.importDesc': 'Führt eine Exportdatei ein. Vorhandene Einträge bleiben unangetastet, nur Neues kommt dazu.',
    'settings.importPick': 'Datei wählen',
    'settings.imported': (e, d) => `${e} Einträge, ${d} Dialoge übernommen`,
    'settings.importNothing': 'Nichts Neues — alles schon vorhanden.',
    'settings.importBad': 'Das sieht nicht nach einem Tiefenjournal-Export aus.',
    'settings.wipeLabel': 'Alles löschen',
    'settings.wipeDesc': 'Entfernt sämtliche Einträge, Bereiche und Dialoge von diesem Gerät. Nicht rückgängig zu machen.',
    'settings.wipe': 'Unwiderruflich löschen',
    'settings.wipeConfirm': 'Wirklich alles löschen? Exportiere vorher, wenn du unsicher bist.',
    'settings.wiped': 'Alles gelöscht',
    'settings.purposeLabel': 'Wofür diese App gedacht ist',
    'settings.voiceLabel': 'Spracheingabe',
    'settings.voiceDesc': 'In dieser eingebetteten Fassung gibt der Browser kein Mikrofon frei — das lässt sich von innen nicht ändern. Aufnehmen und lokale Spracherkennung laufen in der selbst gehosteten Fassung derselben App.',
    'patterns.report': 'Bericht sichern',
    'patterns.reportSaved': 'Bericht gespeichert',
    'storage.newerTitle': 'Woanders läuft eine neuere Fassung',
    'storage.newerBody': 'In einem anderen Tab oder Fenster läuft eine neuere Fassung dieser App, die das Journal bereits umgestellt hat. Lade diese Seite neu, dann passt beides wieder zusammen.',
    'storage.blockedTitle': 'Die App ist noch woanders offen',
    'storage.blockedBody': 'Ein anderer Tab oder ein anderes Fenster hält das Journal gerade fest, sodass es hier nicht geöffnet werden kann. Schließe die anderen Tabs mit dieser App und versuche es erneut. Bis dahin läuft alles, aber nichts wird behalten.',
    'storage.offTitle': 'Hier wird nichts gespeichert',
    'storage.offBody': 'Dieser Browser gibt keinen Speicher frei — etwa in einem privaten Fenster oder bei blockierten Seitendaten. Du kannst schreiben und alles ansehen, aber beim Schließen ist es weg. Sichere wichtige Einträge über Mehr → Sichern.',
    'storage.retry': 'Erneut versuchen',
    'storage.retrying': 'Versuche …',
    'storage.recovered': 'Speicher wieder da. Deine Einträge sind geladen.',
    'storage.stillBlocked': 'Noch immer blockiert. Sind alle anderen Tabs geschlossen?',
    'storage.blocked': 'Dieser Browser erlaubt keinen Speicher (privates Fenster oder blockierte Seitendaten). Einträge lassen sich schreiben, aber nicht behalten.'
  },

  en: {
    'nav.projects': 'Pattern Recognition',
    'nav.struct': 'Areas',

    'journal.title': 'Tell it what is going on',
    'journal.sub': 'Speak or type — either works.',
    'journal.placeholder': 'How was today? Just start talking — it does not have to be tidy.',
    'mode.journal': 'Just talk',
    'mode.three': 'Three sentences',
    'save.hintJournal': 'A few sentences are enough. You can save whenever you like.',

    'struct.title': 'Your areas',
    'struct.lede': 'Pattern detection sorts by a fixed lexicon. Here you build your own order: "Relationships" can branch into "Relationship with my parents", and further. You can create one any time — including mid-conversation.',
    'struct.empty': 'No areas yet',
    'struct.emptyBody': 'Start with something coarse — "Relationships", "Work", "Me with myself". You can branch later.',
    'struct.new': 'Create an area',
    'struct.newChild': 'Sub-area',
    'struct.namePh': 'Name of the area',
    'struct.notePh': 'What is this area for? (optional)',
    'struct.create': 'Create',
    'struct.cancel': 'Cancel',
    'struct.created': 'Area created',
    'struct.deleted': 'Area removed',
    'struct.deleteConfirm': n => n > 0
      ? `Remove this area and ${n} sub-area(s)?`
      : 'Remove this area?',
    'struct.under': n => `${n} sub-area${n === 1 ? '' : 's'}`,
    'struct.linked': n => `${n} entr${n === 1 ? 'y' : 'ies'} match`,
    'struct.linkThemes': 'Link patterns',
    'struct.linkHint': 'Which detected patterns belong in this area? It will then show you the matching entries.',
    'struct.done': 'Done',
    'struct.maxDepth': 'Deliberately no deeper — three levels are enough to order things.',
    'struct.talk': 'Talk about this',

    'nudge.title': s => `Make "${s}" an area?`,
    'nudge.body': 'That pattern just came up in conversation. An area turns it into a place where you can find it again.',
    'nudge.under': p => `Will be filed under "${p}".`,
    'nudge.yes': 'Create',
    'nudge.no': 'Not now',
    'nudge.made': s => `"${s}" created`,

    'proj.eyebrow': 'Synthesis',
    'proj.title': 'Pattern Recognition',
    'proj.purpose': 'This replaces no therapy. It brings together what you have written over weeks and holds it against a psychotherapeutic frame — so that what is worth working on becomes visible. What you do with it is yours to decide.',
    'proj.empty': 'No projects yet',
    'proj.emptyBody': 'Projects come from repetition. From about three entries touching the same field of tension, this section starts proposing something.',
    'proj.strengths': 'What speaks for you',
    'proj.suggested': 'Proposed from your history',
    'proj.adopt': 'Work on this',
    'proj.drop': 'Stop tracking',
    'proj.talk': 'Take into dialogue',
    'proj.entries': (n, m) => `${n} of ${m} entries`,
    'proj.span': d => d > 0 ? `across ${d} days` : 'on one day',
    'proj.repeats': n => `${n}× "here we go again"`,
    'proj.frameTitle': 'Frame for comparison',
    'proj.patternsTitle': 'The material underneath',
    'proj.adoptedToast': 'Adopted as a project',
    'proj.droppedToast': 'No longer tracked',

    'goal.title': 'Goals',
    'goal.empty': 'No goal yet. You write the goal — the app proposes none, because someone else’s goal is homework.',
    'goal.add': 'Goal',
    'goal.added': 'Goal created',
    'goal.placeholder': 'What do you want to do about it?',
    'goal.starters': 'Half-sentences to finish — not prescriptions:',
    'goal.done': 'Mark as done',
    'goal.reopen': 'Reopen',
    'goal.doneToast': 'Done. Done is allowed to become open again.',

    'metrics.title': 'Numbers about your experience',
    'metrics.careTitle': 'Before you read on',
    'metrics.careBody': 'From here on things are counted. Numbers about your own feelings are delicate: they look more objective than they are, and a value pointing the wrong way can reinforce the very thing it measures. Read them as a rough outline of your word choice — not as a measurement of your state.',
    'metrics.caveatsTitle': 'How not to read these numbers',
    'metrics.defencesIntro': 'How your text handles strain. The division into mature, neurotic and immature comes from George Vaillant’s hierarchy of defences (1992) — it applies to mechanisms, not to people.',
    'metrics.explainLevels': 'The four levels explained',
    'metrics.tapForDef': 'Tap a term to see its definition and classification.',
    'metrics.notVaillant': 'An addition by this app — not a term from Vaillant’s scheme.',
    'metrics.courseTitle': 'Course over time',
    'metrics.courseNote': 'As a sentence rather than a curve: a falling line is not neutral feedback but can press down what it displays.',
    'metrics.emotionsNote': 'How often you used which word — a frequency, not a ranking of your feelings.',
    'metrics.ambivalenceNote': 'Entries holding pleasant and unpleasant at once',
    'metrics.words': 'Avg. words',
    'metrics.wordsNote': 'per entry',
    'metrics.mostNamed': 'Most often named',
    'metrics.mostNamedNote': 'says something about your language, not your life',

    'patterns.domainsNote': 'Where your experience takes place — ordered by the settings you describe.',
    'patterns.couplingIntro': 'Which feelings regularly appear alongside which pattern.',

    'demo.badge': 'Example',
    'demo.banner': 'A short example history shows what Timeline, Projects and Dialogue look like once there is something there. It does not count as your entries and is never exported.',
    'demo.remove': 'Remove examples',
    'demo.removed': 'Examples removed',

    'chat.openFree': 'Start open',
    'chat.aboutProject': p => `Talk about "${p}"`,
    'chat.aboutArea': p => `Talk about "${p}"`,
    'chat.finish': 'Close the conversation',
    'chat.finished': 'Closed',
    'chat.summaryTitle': 'Balance',
    'chat.transcriptNote': 'The whole conversation stands above — from the first question on.',
    'chat.save': 'Save as text',
    'chat.saved': 'Conversation saved',
    'chat.reopen': 'Keep writing',
    'chat.projectIntro': p => `This conversation takes "${p}" as its starting point and draws on every entry about it.`,
    'chat.conversations': 'Conversations',
    'chat.newOne': 'New conversation',

    'yield.title': 'What came out of your conversations',
    'yield.intro': 'Every balance here was written at the end of a conversation you had. The app sums up what came up in it — the work was yours.',
    'yield.empty': 'No closed conversations yet',
    'yield.emptyBody': 'What stands here comes out of dialogue. A conversation you close leaves its balance here — and the projects below read differently afterwards.',
    'yield.start': 'Start a conversation',
    'yield.open': 'Open',
    'yield.more': n => `and ${n} more`,

    'settings.storageLabel': 'Where your entries live',
    'settings.storageDesc': 'Only in this browser on this device — not on a server, not with Claude. Which also means: clearing the browser’s site data clears the journal. Export regularly.',
    'settings.persisted': 'Persisted — the browser will not evict this data under memory pressure.',
    'settings.notPersisted': 'Not persisted yet.',
    'settings.persistAsk': 'Store persistently',
    'settings.persistOk': 'Persistent storage active',
    'settings.persistNo': 'The browser declined. Export stays your safety net.',
    'settings.usage': (u, q) => `${u} of ${q} used`,
    'proj.tabProjects': 'Patterns',
    'proj.tabFields': 'Holding Contradictions',
    'mic.label': 'Dictate',
    'mic.hold': 'Hold',
    'fields.open': 'See it as a picture',
    'fields.openWith': n => n === 1
      ? 'Have a look — on one pattern both were already there at once'
      : `Have a look — on ${n} patterns both were already there at once`,
    'struct.asList': 'List',
    'struct.asMap': 'Map',
    'struct.mapNote': 'The map shows what hangs on what. The third level appears as a dot — labelled in the list.',

    'ask.cancel': 'Cancel',
    'ask.remove': 'Remove',
    'express.open': 'Without words',
    'tip.title': 'Saved – on this device',
    'tip.keep': 'You can simply close the browser now. Next time you open the app, your entry will be there.',
    'tip.private': 'It lives only here, in this browser. Nobody else sees it – everyone who opens the app has their own journal.',
    'tip.lose': 'It is only lost if you clear your browser data or write in a private window. On another device or in another browser, a separate, empty journal begins.',
    'tip.ios': 'Tip for iPhone and iPad: “Share” → “Add to Home Screen” turns Tiefenjournal into an app – then Safari won’t clear your entries even after a longer break.',
    'tip.ok': 'Got it',
    'tip.backup': 'Make a backup',
    'backup.firstTitle': 'One week of Tiefenjournal',
    'backup.againTitle': 'Time for a fresh backup',
    'backup.body': 'Your entries live only in this browser. A backup file protects them in case the site data is ever cleared — Safari on iPhone and iPad, for example, does this after about seven days without a visit.',
    'backup.since': (days, n) => `Your last backup was ${days} days ago; ${n === 1 ? 'one entry has' : `${n} entries have`} been added since.`,
    'backup.now': 'Back up now',
    'backup.later': 'Later',
    'backup.snoozed': 'I will remind you again in a week.',
    'express.sub': 'Draw, or just use your voice — when sentences don’t fit right now',
    'express.keptDrawing': 'Drawing kept',
    'express.keptVoice': 'Recording kept',
    'express.drawTag': 'Drawing',
    'express.voiceTag': 'Voice',

    'take.label': 'Download the app',
    'take.desc': 'The app and your data as a file — to carry onto Android or iPhone. Two routes, because they can do different things.',
    'take.app': 'App package (.zip)',
    'take.appDesc': 'The complete app plus your data. Put on an HTTPS location it runs fully: writing, read-outs, offline, installable to the home screen. Instructions for Android and iPhone are included.',
    'take.archive': 'Archive (.html)',
    'take.archiveDesc': 'A single file that makes your journal readable — openable anywhere, without anything else. It cannot save.',
    'take.why': 'Why not one file that does everything: an HTML file opened straight from device storage is refused persistent storage by browsers. Reading works, writing does not — and a journal that keeps nothing would be a prop.',
    'take.building': 'Packing …',
    'take.builtApp': 'App package saved. The included guide explains both routes.',
    'take.builtArchive': 'Archive saved',
    'take.failed': 'Packing failed',
    'take.noSave': 'This window may not currently put a file down. Tapping asks the browser for it — allow it and the file is saved.',
    'take.maybeSaved': 'Sent. Check your browser’s downloads — an embedded window does not report back whether it worked.',
    'take.noWay': 'This browser lets no file out here. On a computer it works — and from a phone that is the better route anyway.',
    'take.phone': 'On the phone itself the ZIP helps little: a phone cannot unpack and serve it. The route that works: download the file on a computer, drop its contents on a free static host (Netlify Drop, Cloudflare Pages, GitHub Pages) and pass the resulting address on. Whoever opens it can add it to their home screen — then entries stay put and dictation works.',
    'settings.introLabel': 'What this app is for',
    'settings.introDesc': 'The opening page from the very beginning — the five parts and how they hang together.',
    'settings.introOpen': 'Read it again',
    'settings.walkLabel': 'Tour',
    'settings.walkDesc': 'The three steps and the research behind them — right where they live in the app.',
    'settings.walkOpen': 'Start the tour',
    'opts.label': 'Options',

    'settings.exportLabel': 'Back up & transfer',
    'settings.exportDesc': 'One file with all real entries, areas and dialogues. The PC build reads the same file.',
    'settings.export': 'Export',
    'settings.exportSaved': 'File saved',
    'settings.exportDeclined': 'Save cancelled',
    'settings.importLabel': 'Import',
    'settings.importDesc': 'Merges an export file in. Existing entries are left untouched; only new ones are added.',
    'settings.importPick': 'Choose file',
    'settings.imported': (e, d) => `${e} entries, ${d} dialogues merged`,
    'settings.importNothing': 'Nothing new — everything was already here.',
    'settings.importBad': 'That does not look like a Tiefenjournal export.',
    'settings.wipeLabel': 'Delete everything',
    'settings.wipeDesc': 'Removes all entries, areas and dialogues from this device. Cannot be undone.',
    'settings.wipe': 'Delete irreversibly',
    'settings.wipeConfirm': 'Really delete everything? Export first if you are unsure.',
    'settings.wiped': 'Everything deleted',
    'settings.purposeLabel': 'What this app is for',
    'settings.voiceLabel': 'Voice input',
    'settings.voiceDesc': 'In this embedded build the browser grants no microphone — that cannot be changed from inside. Recording and local speech recognition run in the self-hosted build of the same app.',
    'patterns.report': 'Save report',
    'patterns.reportSaved': 'Report saved',
    'storage.newerTitle': 'Woanders läuft eine neuere Fassung',
    'storage.newerBody': 'In einem anderen Tab oder Fenster läuft eine neuere Fassung dieser App, die das Journal bereits umgestellt hat. Lade diese Seite neu, dann passt beides wieder zusammen.',
    'storage.blockedTitle': 'Die App ist noch woanders offen',
    'storage.blockedBody': 'Ein anderer Tab oder ein anderes Fenster hält das Journal gerade fest, sodass es hier nicht geöffnet werden kann. Schließe die anderen Tabs mit dieser App und versuche es erneut. Bis dahin läuft alles, aber nichts wird behalten.',
    'storage.offTitle': 'Hier wird nichts gespeichert',
    'storage.offBody': 'Dieser Browser gibt keinen Speicher frei — etwa in einem privaten Fenster oder bei blockierten Seitendaten. Du kannst schreiben und alles ansehen, aber beim Schließen ist es weg. Sichere wichtige Einträge über Mehr → Sichern.',
    'storage.retry': 'Erneut versuchen',
    'storage.retrying': 'Versuche …',
    'storage.recovered': 'Speicher wieder da. Deine Einträge sind geladen.',
    'storage.stillBlocked': 'Noch immer blockiert. Sind alle anderen Tabs geschlossen?',
    'storage.newerTitle': 'A newer version is running elsewhere',
    'storage.newerBody': 'Another tab or window is running a newer version of this app that has already migrated the journal. Reload this page and the two will match again.',
    'storage.blockedTitle': 'The app is still open somewhere else',
    'storage.blockedBody': 'Another tab or window is holding the journal, so it cannot be opened here. Close the other tabs with this app and try again. Until then everything works, but nothing is kept.',
    'storage.offTitle': 'Nothing is being saved here',
    'storage.offBody': 'This browser grants no storage — a private window, or blocked site data. You can write and look at everything, but it is gone when you close. Save anything important via More → Back up.',
    'storage.retry': 'Try again',
    'storage.retrying': 'Trying \u2026',
    'storage.recovered': 'Storage is back. Your entries are loaded.',
    'storage.stillBlocked': 'Still blocked. Are all other tabs closed?',
    'storage.blocked': 'This browser allows no storage (private window or blocked site data). Entries can be written but not kept.'
  }
};

/* ═══════════ Zustand ═══════════ */

const state = {
  config: { lang: 'de', feelingSlots: 3, adopted: [], dismissedAreas: [] },
  slots: [], target: 0,
  entries: [], analysis: null, projects: [], nodes: [], goals: [],
  dialogues: [], chat: null, nudge: null,
  openEntry: null, newNodeParent: undefined, linkingNode: null,
  newGoalFor: null, openDefence: null,
  fields: [],
  structView: 'list', projectPane: 'projects', entryMode: 'journal',
  here: 'heute', storageOk: true, busy: false,
  openProjects: new Set()
};

let base = makeT('de');
let t = key => base(key);
let downloads = null;

/* ═══════════ Sprachwahl festhalten ═══════════
 *
 * Die Sprache liegt bewusst NICHT nur in der IndexedDB. Sie ist die eine
 * Einstellung, ohne die die App unbenutzbar aussieht, und sie wird gebraucht,
 * bevor irgendeine Datenbank geantwortet hat. Zwei Gründe für localStorage:
 *
 *   1. Erreichbar, bevor etwas asynchron lädt — sonst blitzt beim Öffnen die
 *      Ausgangssprache auf, bevor umgestellt wird.
 *   2. Sie überlebt Umstände, unter denen die IndexedDB nicht antwortet
 *      (eingebetteter Rahmen, aufgeräumter Speicher). Ohne das würde die
 *      Frage nach der Sprache bei jedem Start erneut kommen.
 *
 * Geschrieben wird an beiden Orten, gelesen wird der schnellere zuerst.
 */
const LANG_KEY = 'tiefenjournal.lang';

function readStoredLang() {
  try {
    const value = localStorage.getItem(LANG_KEY);
    return value === 'de' || value === 'en' ? value : null;
  } catch {
    return null;
  }
}

function writeStoredLang(lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* auch ohne geht es weiter */ }
}

/** Sprache überall festhalten — Speicher, Zustand, Oberfläche. */
async function commitLang(lang) {
  writeStoredLang(lang);
  state.config = state.storageOk
    ? await db.saveConfig({ lang, langChosen: true })
    : { ...state.config, lang, langChosen: true };
  setLang(lang);
  applyLang();
  return state.config;
}

function setLang(lang) {
  base = makeT(lang);
  const extra = EXTRA[lang] || EXTRA.de;
  t = (key, ...args) => {
    const v = extra[key];
    if (v !== undefined) return typeof v === 'function' ? v(...args) : v;
    return base(key, ...args);
  };
}

/* ═══════════ Werkzeug ═══════════ */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k === 'style') n.setAttribute('style', v);
    else if (k.startsWith('on')) n.addEventListener(k.slice(2).toLowerCase(), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) {
    if (c === null || c === undefined || c === false) continue;
    n.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return n;
}

const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * Rückfrage an Ort und Stelle, statt über den Browserdialog.
 *
 * `confirm()` ist in einem eingebetteten Rahmen ohne `allow-modals` wirkungslos:
 * Der Browser übergeht den Aufruf und liefert stillschweigend `false`. Die
 * Aktion passiert dann nie — ohne dass irgendetwas zu sehen wäre. Genau daran
 * ist das Löschen gescheitert.
 *
 * Hier wird der auslösende Knopf durch die Frage ersetzt. Das funktioniert
 * überall und passt besser: die App kennt sonst keine Modale.
 */
function askInline(trigger, question, confirmLabel, onYes) {
  const restore = () => row.replaceWith(trigger);

  const row = el('div', { class: 'ask' },
    el('p', { class: 'ask__q' }, question),
    el('div', { class: 'ask__row' },
      el('button', {
        class: 'btn btn--tiny btn--danger', type: 'button',
        onclick: async ev => {
          ev.currentTarget.disabled = true;
          try { await onYes(); }
          catch (err) { restore(); toast(err?.message || String(err)); }
        }
      }, confirmLabel),
      el('button', {
        class: 'btn btn--tiny', type: 'button', onclick: restore
      }, t('ask.cancel'))));

  trigger.replaceWith(row);
  row.querySelector('button')?.focus();
}

let toastTimer;
function toast(msg) {
  const n = $('#toast');
  n.textContent = msg;
  n.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => n.classList.remove('on'), 4200);
}

const locale = () => (state.config.lang === 'en' ? 'en-GB' : 'de-DE');
const lbl = id => {
  const e = EMOTION_INDEX.get(id);
  return e ? (state.config.lang === 'en' ? e.en : e.de) : id;
};
const fmtBytes = b => b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

function applyLang() {
  document.documentElement.lang = state.config.lang;
  for (const n of $$('[data-i18n]')) {
    const v = t(n.dataset.i18n);
    if (typeof v === 'string') n.textContent = v;
  }
  for (const n of $$('[data-i18n-ph]')) {
    const v = t(n.dataset.i18nPh);
    if (typeof v === 'string') n.placeholder = v;
  }
  $('#today-date').textContent = new Date().toLocaleDateString(locale(),
    { weekday: 'long', day: 'numeric', month: 'long' });
  $('#feelings-foot').textContent = t('feelings.foot');
  $('#dict-hint').textContent = dictationHint(state.config.lang);
  $('#chat-empty-body').textContent = t('dialogue.emptyBody');
  $('#show-projects').textContent = t('proj.tabProjects');
  $('#show-fields').textContent = t('proj.tabFields');
  $('#mode-journal-btn').textContent = t('mode.journal');
  $('#mode-three-btn').textContent = t('mode.three');
  renderExpressButton();
  // Nach der Schleife, weil data-i18n-ph den Platzhalter sonst überschreibt.
  $('#free-text').placeholder = state.entryMode === 'journal'
    ? t('journal.placeholder') : t('free.placeholder');
  $('#struct-lede').textContent = t('struct.lede');
  $('#proj-title').textContent = t('proj.title');
  $('#share-report').textContent = t('patterns.report');
  $('#start-dialogue').textContent = t('chat.openFree');
  $('#dialogue-menu').textContent = t('chat.newOne');
  $('#open-opts').setAttribute('aria-label', t('opts.label'));
}

/* ═══════════ Seiten ═══════════ */

/**
 * Immer nur eine Seite sichtbar. Jede bringt ihren eigenen Scrollstand mit,
 * beginnt aber oben — wer eine Seite aufschlägt, will ihren Anfang sehen,
 * nicht die Stelle, an der er sie verlassen hat.
 */
function goTo(name) {
  const target = document.getElementById(`page-${name}`);
  if (!target) return;

  state.here = name;

  for (const page of $$('.page')) {
    page.classList.toggle('is-active', page.dataset.page === name);
  }
  for (const tile of $$('.tile')) {
    const here = tile.dataset.goto === name;
    tile.classList.toggle('is-here', here);
    if (here) tile.setAttribute('aria-current', 'page');
    else tile.removeAttribute('aria-current');
  }

  const body = target.querySelector('.page__body');
  if (body) body.scrollTop = 0;
}

for (const tile of $$('.tile')) {
  tile.addEventListener('click', () => goTo(tile.dataset.goto));
}

// „Mehr" sitzt in der Kopfleiste statt in der Kachelreihe: es gehört zur
// Verwaltung, nicht zum täglichen Weg durch die App.
$('#open-more').addEventListener('click', () => goTo('mehr'));

/* Themen und die eigene Ordnung darüber sind dasselbe Anliegen und stehen
   deshalb untereinander auf einer Seite. Getrennt waren es zwei Orte, zwischen
   denen man hin- und herschaltete, um dieselbe Frage zu beantworten. */
function showProjectPane(which) {
  state.projectPane = which;
  const themes = which !== 'fields';
  $('#projects').hidden = !themes;
  $('#areas-pane').hidden = !themes;
  $('#fields-pane').hidden = themes;
  $('#show-projects').classList.toggle('on', themes);
  $('#show-fields').classList.toggle('on', !themes);
  const body = document.querySelector('#page-projekte .page__body');
  if (body) body.scrollTop = 0;
  if (themes) { renderProjects(); renderStructure(); }
  else renderFields();
}

$('#show-projects').addEventListener('click', () => showProjectPane('projects'));
$('#show-fields').addEventListener('click', () => showProjectPane('fields'));

/* ═══════════ Rundgang und Optionen ═══════════ */

function startWalkthrough() {
  openWalkthrough({
    el, lang: () => state.config.lang, goTo,
    showPane: showProjectPane, setMode: setEntryMode
  });
}

initOptions({
  button: $('#open-opts'), panel: $('#opts'), el,
  lang: () => state.config.lang, onWalk: startWalkthrough
});

/* ═══════════ Erfassen ═══════════ */

/**
 * Erzählen oder drei Sätze — nie beides gleichzeitig auf der Seite.
 *
 * Das freie Feld wandert zwischen den Modi hin und her, statt zweimal zu
 * existieren: Wer etwas geschrieben hat und umschaltet, soll es wiederfinden.
 */
function setEntryMode(mode) {
  state.entryMode = mode;
  const journal = mode === 'journal';

  $('#mode-journal').hidden = !journal;
  $('#mode-three').hidden = journal;
  $('#mode-journal-btn').classList.toggle('on', journal);
  $('#mode-three-btn').classList.toggle('on', !journal);

  $('#journal-head').hidden = !journal;
  const block = $('#free-block');
  (journal ? $('#journal-host') : $('#three-free-host')).append(block);

  // Der Platzhalter muss zum Modus passen: „Alles, was in die drei Sätze
  // nicht hineinpasst" ergibt keinen Sinn, wenn es gar keine drei Sätze gibt.
  const field = $('#free-text');
  field.rows = journal ? 7 : 4;
  field.placeholder = journal ? t('journal.placeholder') : t('free.placeholder');

  try { localStorage.setItem(MODE_KEY, mode); } catch { /* auch ohne geht es */ }
  updateSave();
}

const MODE_KEY = 'tiefenjournal.mode';
const readStoredMode = () => {
  try {
    const v = localStorage.getItem(MODE_KEY);
    return v === 'three' || v === 'journal' ? v : null;
  } catch { return null; }
};

$('#mode-journal-btn').addEventListener('click', () => setEntryMode('journal'));
$('#mode-three-btn').addEventListener('click', () => setEntryMode('three'));

function initSlots() {
  state.slots = Array.from({ length: state.config.feelingSlots || 3 },
    () => ({ emotionId: null, intensity: 3, because: '' }));
  state.target = 0;
}

function renderSlots() {
  const wrap = $('#slots');
  wrap.textContent = '';

  state.slots.forEach((slot, i) => {
    const meta = slot.emotionId ? EMOTION_INDEX.get(slot.emotionId) : null;
    const set = Boolean(slot.emotionId);

    const dots = el('div', { class: 'dots', style: meta ? `--h:${meta.hue}` : null });
    for (let n = 1; n <= 5; n++) {
      dots.append(el('button', {
        type: 'button',
        'aria-pressed': n <= slot.intensity ? 'true' : 'false',
        'aria-label': `${n}/5`,
        onclick: () => { slot.intensity = n; renderSlots(); }
      }));
    }

    const area = el('textarea', {
      class: 'field field--serif', rows: 2, id: `because-${i}`,
      placeholder: t('slot.becausePh'),
      oninput: e => { slot.because = e.target.value; updateSave(); }
    });
    area.value = slot.because;

    const say = micFor(area, `mic-because-${i}`);

    wrap.append(el('div', {
      class: `slot${set ? ' is-set' : ''}${state.target === i ? ' is-target' : ''}`,
      style: meta ? `--h:${meta.hue}` : null
    },
      el('div', { class: 'slot__line' },
        el('span', { class: 'slot__n' }, String(i + 1)),
        el('span', { class: 'slot__lead' }, t('slot.lead')),
        el('button', {
          class: `slot__pick${set ? ' is-set' : ''}`, type: 'button',
          style: meta ? `--h:${meta.hue}` : null,
          onclick: () => {
            state.target = i;
            renderSlots(); renderPalette();
            $('#palette-search')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, set ? lbl(slot.emotionId) : t('slot.pick')),
        set ? dots : null,
        set ? el('button', {
          class: 'slot__x', type: 'button', 'aria-label': t('slot.clear'),
          onclick: () => {
            state.slots[i] = { emotionId: null, intensity: 3, because: '' };
            state.target = i;
            renderSlots(); renderPalette(); updateSave();
          }
        }, '✕') : null
      ),
      el('div', { class: 'slot__because' }, area, say)
    ));
  });

  updateSave();
}

/**
 * Der Diktierknopf zu einem Feld.
 *
 * Groß genug für einen Daumen (56 px) und direkt am Feld, damit klar ist,
 * wohin der Text geht. Die Rückmeldezeile darunter gehört zum Knopf, nicht
 * zur Seite — beim Sprechen will man an einer Stelle hinsehen.
 */
function micFor(field, id) {
  const status = el('span', { class: 'mic__status', 'aria-live': 'polite' });

  // Als Zeichenkette, weil createElement für SVG das falsche Element baut.
  const button = el('button', {
    class: 'mic', type: 'button', id,
    'aria-label': t('mic.label'), title: t('mic.hold'),
    html: '<span class="mic__ring" aria-hidden="true"></span>'
      + '<svg viewBox="0 0 24 24" aria-hidden="true">'
      + '<path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z"/>'
      + '<path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>'
      + `<span class="mic__cap">${esc(t('mic.hold'))}</span>`
  });

  attachDictation(button, {
    field,
    lang: () => state.config.lang,
    model: () => state.config.whisperModel,
    onStatus: (text, kind) => {
      status.textContent = text || '';
      status.className = `mic__status${kind ? ` mic__status--${kind}` : ''}`;
    },
    onDone: () => updateSave(),
    onNeedApp: () => { goTo('mehr'); $('#take-app')?.scrollIntoView({ block: 'center' }); }
  });

  return el('div', { class: 'mic-wrap' }, button, status);
}

function renderPalette() {
  const list = $('#palette');
  const q = ($('#palette-search').value || '').toLowerCase().trim();
  const used = new Set(state.slots.map(s => s.emotionId).filter(Boolean));
  const en = state.config.lang === 'en';

  const free = state.slots.findIndex(s => !s.emotionId);
  $('#palette-target').innerHTML = free > -1
    ? t('palette.target', free + 1)
    : esc(t('palette.targetNone'));

  list.textContent = '';
  let shown = 0;

  for (const fam of EMOTION_FAMILIES) {
    const hits = fam.emotions.filter(e => !q
      || e.de.toLowerCase().includes(q) || e.en.toLowerCase().includes(q)
      || fam.de.toLowerCase().includes(q) || fam.en.toLowerCase().includes(q));
    if (!hits.length) continue;
    shown += hits.length;

    list.append(el('div', { class: 'fam' },
      el('button', {
        class: 'fam__head', type: 'button',
        onclick: e => e.currentTarget.parentElement.classList.toggle('is-shut')
      },
        el('span', { class: 'fam__dot', style: `--h:${fam.hue}` }),
        en ? fam.en : fam.de,
        el('span', { class: 'fam__n' }, String(hits.length))
      ),
      el('div', { class: 'fam__body' },
        hits.map(e => el('button', {
          class: `emo${used.has(e.id) ? ' is-used' : ''}`,
          type: 'button', style: `--h:${fam.hue}`,
          title: en ? e.de : e.en,
          onclick: () => pickEmotion(e.id)
        }, en ? e.en : e.de)))
    ));
  }

  if (!shown) list.append(el('p', { class: 'muted', style: 'padding:14px 4px' }, t('palette.none')));
  $('#palette-count').textContent = t('palette.count', EMOTION_INDEX.size, EMOTION_FAMILIES.length);
}

function pickEmotion(id) {
  let i = state.target;
  if (state.slots[i]?.emotionId) {
    const free = state.slots.findIndex(s => !s.emotionId);
    i = free > -1 ? free : state.slots.length - 1;
  }
  if (state.slots.some((s, n) => s.emotionId === id && n !== i)) return;

  state.slots[i].emotionId = id;
  const next = state.slots.findIndex(s => !s.emotionId);
  state.target = next > -1 ? next : i;

  renderSlots();
  renderPalette();
  requestAnimationFrame(() => {
    const area = $(`#because-${i}`);
    area?.focus();
    area?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/**
 * Ein Eintrag ist speicherbar, sobald etwas darin steht — ein Gefühl ODER
 * geschriebener Text. Vorher hing das Speichern allein an der Gefühlsliste;
 * im Erzählmodus wäre der Knopf damit dauerhaft grau geblieben.
 */
function updateSave() {
  const ready = state.slots.filter(s => s.emotionId && s.because.trim().length > 1).length;
  const hasFeeling = state.slots.some(s => s.emotionId);
  const hasText = ($('#free-text')?.value || '').trim().length > 1;

  $('#save-btn').disabled = !hasFeeling && !hasText;
  $('#save-meta').textContent = state.entryMode === 'journal' && !hasFeeling
    ? t('save.hintJournal')
    : (ready ? t('save.hintReady', ready) : t('save.hint1'));
}

$('#save-btn').addEventListener('click', async () => {
  if (state.busy) return;
  state.busy = true;
  $('#save-btn').disabled = true;

  try {
    const known = new Set(state.entries.flatMap(e => (e.feelings || []).map(f => f.emotionId)));
    const now = new Date();
    const entry = {
      id: db.newId(now),
      createdAt: now.toISOString(), updatedAt: now.toISOString(),
      date: now.toISOString().slice(0, 10),
      lang: state.config.lang,
      feelings: state.slots.filter(s => s.emotionId).map(s => ({
        emotionId: s.emotionId, intensity: s.intensity, because: s.because.trim()
      })),
      freeText: $('#free-text').value.trim(),
      transcript: '', tags: [], audio: null
    };
    entry.analysis = analyseEntry(entry);
    await db.putEntry(entry);

    const isNewEmotion = entry.feelings.some(f => !known.has(f.emotionId));
    const realCount = state.entries.filter(e => !e.demo).length + 1;

    initSlots();
    $('#free-text').value = '';
    $('#free-card').open = false;
    renderSlots();
    renderPalette();
    await refresh();

    if (showStorageTip()) return;
    toast(afterSave(entry, {
      entryCount: realCount,
      streak: state.analysis?.stats?.streak || 0,
      distinctEmotions: state.analysis?.stats?.distinctEmotions || 0,
      isNewEmotion
    }, state.config.lang));
  } catch (err) {
    toast(`${t('save.error')}: ${err.message}`);
  } finally {
    state.busy = false;
    updateSave();
  }
});

/* ═══════════ Laden ═══════════ */

async function refresh() {
  const entries = await db.listEntries();
  const stale = entries.filter(needsReanalysis);
  for (const e of stale) { e.analysis = analyseEntry(e); await db.putEntry(e); }

  state.entries = entries;
  state.nodes = await db.listStructures();
  state.goals = await db.listGoals();
  state.dialogues = await db.listDialogues();
  state.analysis = aggregate(entries, { lang: state.config.lang });
  state.projects = deriveProjects(entries, state.analysis, {
    lang: state.config.lang, adopted: state.config.adopted || [], includeDemo: true
  });
  state.fields = buildTensionFields(entries, state.projects, {
    lang: state.config.lang, recognised: state.config.recognisedBeliefs || []
  });

  const streak = state.analysis.stats.streak || 0;
  const chip = $('#streak-chip');
  chip.hidden = streak < 2;
  if (streak >= 2) chip.textContent = `${streak} ${state.config.lang === 'en' ? 'days' : 'Tage'}`;

  const real = entries.filter(e => !e.demo);
  $('#affirm').textContent = openingLine({
    entryCount: real.length, streak,
    daysSinceLast: real.length ? daysSince(real[real.length - 1].date) : null
  }, state.config.lang);

  renderTimeline();
  renderStructure();
  renderProjects();
  renderFields();
  renderChat();
  renderBackupNudge();
  await renderSettings();
}

/* ═══════════ Verlauf ═══════════ */

let searchTimer;
$('#timeline-search').addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(renderTimeline, 200);
});

function demoBanner() {
  if (!state.entries.some(e => e.demo)) return null;
  return el('div', { class: 'warn warn--info' },
    el('p', {}, t('demo.banner')),
    el('div', { style: 'margin-top:10px' },
      el('button', {
        class: 'btn btn--tiny', type: 'button',
        onclick: async () => {
          await db.deleteDemoEntries();
          await refresh();
          toast(t('demo.removed'));
        }
      }, t('demo.remove'))));
}

/**
 * „Ohne Worte" steht auf „Heute", gleich neben Erzählen und Drei Sätzen:
 * Es ist eine Art, den Tag festzuhalten, keine Funktion des Rückblicks.
 */
function renderExpressButton() {
  const host = $('#express-host');
  host.textContent = '';
  // Das Symbol als Markup: document.createElement('svg') ergäbe ein
  // HTML-Element ohne SVG-Namensraum, und das zeichnet der Browser nicht.
  host.append(el('button', {
    class: 'expressbtn', type: 'button', onclick: startExpress,
    html: '<span class="expressbtn__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19l7-7 2 2-7 7-2-2z"/>'
      + '<path d="M18 13l-1.5-1.5"/><path d="M3 21l3-1 9-9-2-2-9 9-1 3z"/></svg></span>'
  },
    el('span', { class: 'expressbtn__text' },
      el('b', {}, t('express.open')),
      el('span', {}, t('express.sub'))),
    el('span', { class: 'expressbtn__go', 'aria-hidden': 'true' }, '→')));
}

function renderTimeline() {
  const wrap = $('#timeline');
  const q = ($('#timeline-search').value || '').toLowerCase().trim();
  wrap.textContent = '';

  const banner = demoBanner();
  if (banner) wrap.append(banner);

  const list = [...state.entries].reverse().filter(e => !q
    || e.date.includes(q)
    || (e.freeText || '').toLowerCase().includes(q)
    || (e.feelings || []).some(f =>
      lbl(f.emotionId).toLowerCase().includes(q) || (f.because || '').toLowerCase().includes(q)));

  if (!list.length) {
    wrap.append(el('div', { class: 'blank' },
      el('h3', {}, t('timeline.empty')),
      el('p', {}, t('timeline.emptyBody'))));
    return;
  }

  let lastDate = null;
  for (const e of list) {
    if (e.date !== lastDate) {
      lastDate = e.date;
      const heading = new Date(e.date + 'T12:00:00').toLocaleDateString(locale(),
        { weekday: 'long', day: 'numeric', month: 'long' });
      wrap.append(el('div', { class: 'day__h' }, heading));
    }
    wrap.append(entryCard(e));
  }
}

/**
 * „Ohne Worte" öffnen und das Ergebnis als eigenen Eintrag ablegen.
 * Ein solcher Eintrag hat keine Gefühlsauswahl — er soll nichts benennen müssen.
 */
async function startExpress() {
  const result = await openExpress({ lang: state.config.lang });
  if (!result) return;

  const now = new Date();
  const entry = {
    id: db.newId(now),
    createdAt: now.toISOString(), updatedAt: now.toISOString(),
    date: now.toISOString().slice(0, 10),
    lang: state.config.lang,
    kind: 'express',
    feelings: [], freeText: '', transcript: '', tags: [], audio: null
  };
  entry.media = await db.putMedia(entry.id, result.blob, {
    kind: result.kind, durationMs: result.durationMs
  });
  entry.analysis = analyseEntry(entry);
  await db.putEntry(entry);

  await refresh();
  if (showStorageTip()) return;
  toast(result.kind === 'voice' ? t('express.keptVoice') : t('express.keptDrawing'));
}

function entryCard(e) {
  const open = state.openEntry === e.id;

  // Zeichnung oder Stimme: kein „Ich fühle mich …", nur das Ding selbst.
  if (e.kind === 'express') {
    const time = new Date(e.createdAt).toLocaleTimeString(locale(),
      { hour: '2-digit', minute: '2-digit' });
    const card = el('div', { class: 'entry entry--express' },
      el('div', { class: 'entry__top' },
        time,
        el('span', { class: 'tag' },
          e.media?.kind === 'voice' ? t('express.voiceTag') : t('express.drawTag'))),
      el('div', { class: 'express__slot', id: `media-${e.id}` }),
      el('div', { style: 'margin-top:10px' },
        el('button', {
          class: 'btn btn--tiny btn--danger', type: 'button',
          onclick: ev => askInline(ev.currentTarget, t('timeline.confirmDelete'), t('timeline.delete'),
            async () => {
              await db.deleteEntry(e.id);
              await refresh();
              toast(t('timeline.deleted'));
            })
        }, t('timeline.delete'))));

    // Das Medium nachladen, damit die Liste nicht darauf wartet.
    db.mediaUrl(e.id).then(url => {
      if (!url) return;
      const slot = document.getElementById(`media-${e.id}`);
      if (!slot) { URL.revokeObjectURL(url); return; }
      slot.append(e.media?.kind === 'voice'
        ? el('audio', { controls: true, src: url, style: 'width:100%' })
        : el('img', { src: url, alt: t('express.drawTag'), class: 'express__img' }));
    });

    return card;
  }
  const time = new Date(e.createdAt).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
  const v = e.analysis?.affect?.valence ?? 0;
  const en = state.config.lang === 'en';

  const tags = [
    ...(e.analysis?.conflicts || []).slice(0, 2).map(c => ({ text: en ? c.en : c.de })),
    ...(e.analysis?.domains || []).slice(0, 1).map(d => ({ text: en ? d.en : d.de }))
  ];
  if (e.demo) tags.unshift({ text: t('demo.badge'), demo: true });

  const card = el('div', {
    class: `entry${open ? ' is-open' : ''}`, role: 'button', tabindex: '0',
    onclick: ev => {
      if (ev.target.closest('button')) return;
      state.openEntry = open ? null : e.id;
      renderTimeline();
    },
    onkeydown: ev => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        state.openEntry = open ? null : e.id;
        renderTimeline();
      }
    }
  },
    el('div', { class: 'entry__top' },
      time,
      el('span', { class: 'tone', 'aria-hidden': 'true' },
        el('i', { style: `left:${((v + 1) / 2 * 100).toFixed(1)}%` }))),
    (e.feelings || []).map(f => el('p', { class: 'feel' },
      el('em', {}, `${t('slot.lead')} `),
      el('b', {}, lbl(f.emotionId)),
      el('em', {}, `, ${t('slot.because')} `),
      open || (f.because || '').length <= 120 ? f.because : f.because.slice(0, 119) + '…')),
    tags.length ? el('div', { class: 'tags' },
      tags.map(x => el('span', { class: `tag${x.demo ? ' tag--demo' : ''}` }, x.text))) : null
  );

  // Aufklappen im selben Raum statt Modal.
  if (open) {
    const more = el('div', { class: 'entry__more' });
    if (e.freeText) {
      more.append(el('h4', {}, t('free.title')), el('div', { class: 'entry__prose' }, e.freeText));
    }
    const a = e.analysis;
    if (a) {
      const parts = [];
      const add = (label, items) => {
        if (items?.length) parts.push(el('p', { class: 'muted', style: 'font-size:.85rem;margin-bottom:4px' },
          el('b', {}, `${label}: `), items.map(x => en ? x.en : x.de).join(', ')));
      };
      add(t('patterns.conflicts'), (a.conflicts || []).slice(0, 3));
      add(t('patterns.defences'), (a.defences || []).slice(0, 3));
      add(t('patterns.domains'), (a.domains || []).slice(0, 3));
      if (parts.length) {
        more.append(el('h4', {}, en ? 'Automatic markers' : 'Automatische Marker'), ...parts);
      }
    }
    more.append(el('div', { style: 'margin-top:12px' },
      el('button', {
        class: 'btn btn--tiny btn--danger', type: 'button',
        onclick: ev => askInline(ev.currentTarget, t('timeline.confirmDelete'), t('timeline.delete'),
          async () => {
            await db.deleteEntry(e.id);
            state.openEntry = null;
            await refresh();
            toast(t('timeline.deleted'));
          })
      }, t('timeline.delete'))));
    card.append(more);
  }

  return card;
}

/* ═══════════ Bereiche ═══════════ */

function renderStructure() {
  const wrap = $('#structure');
  wrap.textContent = '';

  // Liste sagt, was es gibt; Karte zeigt, was woran hängt.
  if (state.nodes.length) {
    wrap.append(el('div', { class: 'viewtoggle' },
      el('button', {
        class: `viewtoggle__b${state.structView === 'list' ? ' on' : ''}`, type: 'button',
        onclick: () => { state.structView = 'list'; renderStructure(); }
      }, t('struct.asList')),
      el('button', {
        class: `viewtoggle__b${state.structView === 'map' ? ' on' : ''}`, type: 'button',
        onclick: () => { state.structView = 'map'; renderStructure(); }
      }, t('struct.asMap'))));
  }

  if (state.structView === 'map' && state.nodes.length) {
    const map = renderMindmap(buildTree(state.nodes), { lang: state.config.lang });
    wrap.append(el('div', { class: 'mapwrap' }, map));
    wrap.append(el('p', { class: 'muted', style: 'font-size:.78rem;margin:8px 0 14px' },
      t('struct.mapNote')));
    wrap.append(el('button', {
      class: 'btn btn--green', type: 'button',
      onclick: () => { state.structView = 'list'; state.newNodeParent = null; renderStructure(); }
    }, `+ ${t('struct.new')}`));
    return;
  }

  if (!state.nodes.length && state.newNodeParent === undefined) {
    wrap.append(el('div', { class: 'blank' },
      el('h3', {}, t('struct.empty')),
      el('p', {}, t('struct.emptyBody')),
      el('button', {
        class: 'btn btn--green', type: 'button',
        onclick: () => { state.newNodeParent = null; renderStructure(); }
      }, `+ ${t('struct.new')}`)));
    return;
  }

  const tree = buildTree(state.nodes);
  const list = el('div', { class: 'tree' });
  for (const root of tree) renderNode(root, list, 0);
  wrap.append(list);

  if (state.newNodeParent === undefined) {
    wrap.append(el('div', { style: 'margin-top:12px' },
      el('button', {
        class: 'btn btn--green', type: 'button',
        onclick: () => { state.newNodeParent = null; renderStructure(); }
      }, `+ ${t('struct.new')}`)));
  } else if (state.newNodeParent === null) {
    wrap.append(newNodeForm(null));
  }
}

function renderNode(node, container, depth) {
  const cls = depth === 0 ? 'node' : depth === 1 ? 'node node--child' : 'node node--grandchild';
  const kids = countUnder(node.id, state.nodes);
  const matching = entriesForNode(node, state.entries);
  const deeper = canHaveChildren(node, state.nodes);

  const box = el('article', { class: cls },
    el('div', { class: 'node__top' },
      el('h3', { class: 'node__title' }, node.title),
      kids ? el('span', { class: 'node__count' }, t('struct.under', kids)) : null,
      el('div', { class: 'node__menu' },
        el('button', {
          class: 'slot__x', type: 'button', 'aria-label': t('timeline.delete'),
          onclick: ev => {
            const ids = collectSubtree(node.id, state.nodes);
            askInline(ev.currentTarget, t('struct.deleteConfirm', ids.length - 1), t('ask.remove'),
              async () => {
                await db.deleteStructures(ids);
                state.nodes = await db.listStructures();
                renderStructure();
                toast(t('struct.deleted'));
              });
          }
        }, '✕'))),
    node.note ? el('p', { class: 'node__note' }, node.note) : null
  );

  if (node.themeIds?.length) {
    const opts = themeOptions(state.config.lang);
    box.append(el('div', { class: 'node__themes' },
      node.themeIds.map(id => el('span', { class: 'tag' },
        opts.find(o => o.id === id)?.label || id))));
    if (matching.length) {
      box.append(el('p', { class: 'node__count', style: 'margin-top:8px' },
        t('struct.linked', matching.length)));
    }
  }

  const actions = el('div', { class: 'node__actions' });
  if (deeper) {
    actions.append(el('button', {
      class: 'btn btn--tiny btn--ghost', type: 'button',
      onclick: () => { state.newNodeParent = node.id; renderStructure(); }
    }, `+ ${t('struct.newChild')}`));
  }
  actions.append(el('button', {
    class: 'btn btn--tiny', type: 'button',
    onclick: () => { state.linkingNode = state.linkingNode === node.id ? null : node.id; renderStructure(); }
  }, t('struct.linkThemes')));
  actions.append(el('button', {
    class: 'btn btn--tiny', type: 'button',
    onclick: () => startAreaDialogue(node)
  }, t('struct.talk')));
  box.append(actions);

  if (!deeper && depth >= MAX_DEPTH - 1) {
    box.append(el('p', { class: 'muted', style: 'font-size:.75rem;margin-top:8px' }, t('struct.maxDepth')));
  }

  if (state.linkingNode === node.id) box.append(themePicker(node));
  container.append(box);

  if (state.newNodeParent === node.id) container.append(newNodeForm(node.id, depth + 1));

  for (const child of node.children || []) renderNode(child, container, depth + 1);
}

function newNodeForm(parentId, depth = 0) {
  const name = el('input', { class: 'field', type: 'text', placeholder: t('struct.namePh'), id: 'new-node-name' });
  const note = el('input', { class: 'field', type: 'text', placeholder: t('struct.notePh'), id: 'new-node-note' });

  const submit = async () => {
    const title = name.value.trim();
    if (!title) { name.focus(); return; }
    const node = makeNode({ title, parentId, note: note.value.trim() });
    await db.putStructure(node);
    state.nodes = await db.listStructures();
    state.newNodeParent = undefined;
    renderStructure();
    toast(t('struct.created'));
  };

  name.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  note.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });

  const form = el('div', {
    class: 'newnode',
    style: depth ? `margin-left:${Math.min(depth, 2) * 16}px` : null
  },
    name, note,
    el('div', { class: 'newnode__row' },
      el('button', { class: 'btn btn--tiny btn--green', type: 'button', onclick: submit }, t('struct.create')),
      el('button', {
        class: 'btn btn--tiny', type: 'button',
        onclick: () => { state.newNodeParent = undefined; renderStructure(); }
      }, t('struct.cancel'))));

  requestAnimationFrame(() => name.focus());
  return form;
}

function themePicker(node) {
  const opts = themeOptions(state.config.lang);
  const selected = new Set(node.themeIds || []);

  const box = el('div', { style: 'margin-top:11px;padding-top:11px;border-top:1px solid var(--line)' },
    el('p', { class: 'muted', style: 'font-size:.8rem;margin-bottom:9px' }, t('struct.linkHint')),
    el('div', { class: 'node__themes' },
      opts.map(o => el('button', {
        class: `emo${selected.has(o.id) ? ' is-used' : ''}`,
        type: 'button', style: '--h:150',
        onclick: async ev => {
          if (selected.has(o.id)) selected.delete(o.id); else selected.add(o.id);
          node.themeIds = [...selected];
          await db.putStructure(node);
          state.nodes = await db.listStructures();
          renderStructure();
          ev.stopPropagation();
        }
      }, o.label))),
    el('div', { style: 'margin-top:10px' },
      el('button', {
        class: 'btn btn--tiny', type: 'button',
        onclick: () => { state.linkingNode = null; renderStructure(); }
      }, t('struct.done'))));

  return box;
}

/* ═══════════ Projekte ═══════════ */

function serialise(agg) {
  const fix = arr => arr.map(r => {
    const { terms, ...rest } = r;
    return { ...rest, topTerms: terms ? [...terms.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8) : [] };
  });
  return {
    ...agg, conflicts: fix(agg.conflicts), defences: fix(agg.defences),
    domains: fix(agg.domains), attribution: fix(agg.attribution)
  };
}

function renderProjects() {
  const root = $('#projects');
  root.textContent = '';
  root.append(el('div', { class: 'purpose' }, el('p', { html: purposeHtml() })));

  // Zuerst das, was aus Gesprächen kam. Die Zusammenfassung ist nicht die
  // Leistung der App, sondern der Rückstand eines Gesprächs — deshalb steht
  // sie hier mit dem Weg zurück ins Gespräch, nicht für sich allein.
  root.append(dialogueYield());

  const good = strengths(state.analysis, state.projects, state.config.lang);
  if (good.length) {
    root.append(el('div', { class: 'block' },
      el('div', { class: 'block__head' }, el('h2', {}, t('proj.strengths'))),
      good.slice(0, 3).map(text => el('div', { class: 'note note--resource' },
        el('div', {}, el('p', {}, text))))));
  }

  if (!state.projects.length) {
    root.append(el('div', { class: 'blank' },
      el('h3', {}, t('proj.empty')), el('p', {}, t('proj.emptyBody'))));
  } else {
    root.append(el('p', { class: 'day__h' }, t('proj.suggested')));
    for (const p of state.projects) root.append(projectCard(p));
  }

  // Die Gegensätze wohnen jetzt unter „Spannungen", wo sie als Bild stehen
  // und nicht bloß als zwei Listen. Hier bleibt der Weg dorthin — abgeschaltet
  // wie zuvor: sichtbar wird das erst, wenn jemand hingeht.
  if (state.entries.length >= 4) root.append(fieldsPointer());

  // Lebensbereiche und Zuschreibung gehören hierher: sie tragen Bedeutung.
  // Die Zählwerte stehen unter „Mehr".
  if (state.analysis?.entryCount) {
    const host = el('div', { style: 'margin-top:18px' });
    root.append(host);
    renderSynthesis(host, serialise(state.analysis), { t, lang: state.config.lang, el, esc });
  }
}

/**
 * Die Bilanzen abgeschlossener Gespräche — hier als Ertrag des Dialogs, nicht
 * als eigene Funktion. Jede führt in ihr Gespräch zurück; ohne Gespräch steht
 * hier nichts, und das ist der Punkt.
 */
function dialogueYield() {
  const done = state.dialogues.filter(d => d.finished && d.summary);
  const box = el('div', { class: 'yield' });

  box.append(el('div', { class: 'block__head' },
    el('h2', {}, t('yield.title')),
    el('p', { class: 'block__sub' }, done.length ? t('yield.intro') : t('yield.emptyBody'))));

  if (!done.length) {
    box.append(el('button', {
      class: 'btn btn--primary', type: 'button', style: 'width:100%',
      onclick: () => newDialogue()
    }, t('yield.start')));
    return box;
  }

  for (const d of done.slice(0, 4)) {
    // Die Überschrift der Bilanz ist eine Zählung („4 Züge, 34 Wörter"). Als
    // Erstes gelesen wäre sie genau die falsche Auskunft — sie steht deshalb
    // klein oben bei Datum und Thema, und der Inhalt kommt nach vorn.
    const body = d.summary.body || [];
    box.append(el('article', { class: 'yield__i' },
      el('div', { class: 'yield__meta' },
        el('span', {}, new Date(d.createdAt).toLocaleDateString(locale())),
        d.projectTitle ? el('b', {}, d.projectTitle) : null,
        el('span', {}, d.summary.headline)),
      body.length ? el('p', { class: 'yield__head' }, body[0]) : null,
      body.slice(1, 3).map(line => el('p', { class: 'yield__line' }, line)),
      el('button', {
        class: 'btn btn--tiny', type: 'button',
        onclick: () => { state.chat = d; state.nudge = null; renderChat(); goTo('dialog'); }
      }, t('yield.open'))));
  }

  if (done.length > 4) {
    box.append(el('p', { class: 'muted', style: 'font-size:.8rem' }, t('yield.more', done.length - 4)));
  }

  return box;
}

/* ═══════════ Spannungsfelder ═══════════
 *
 * Dieselben Themen wie unter „Projekte", als Bild statt als Arbeitsliste.
 *
 * Der Rahmentext steht IMMER über den Kreisen. Wer zuerst die Zahlen sieht,
 * liest sie als Befund über sich — und bei einem Bild, das Gegensätzliches
 * zeigt, wäre das der Befund „ich bin widersprüchlich".
 */

/** Der Hinweis unter „Projekte" — der Weg hin, nicht die Sache selbst. */
function fieldsPointer() {
  const F = TENSION_FRAMING[state.config.lang] || TENSION_FRAMING.de;
  const withMiddle = state.fields.filter(f => (f.axis?.regions.both || 0) > 0).length;

  return el('div', { class: 'block' },
    el('div', { class: 'block__head' },
      el('h2', {}, F.title),
      el('p', { class: 'block__sub' }, F.lede)),
    el('button', {
      class: 'btn btn--tiny', type: 'button',
      onclick: () => showProjectPane('fields')
    }, withMiddle ? t('fields.openWith', withMiddle) : t('fields.open')));
}

function renderFields() {
  const root = $('#fields');
  const F = TENSION_FRAMING[state.config.lang] || TENSION_FRAMING.de;
  root.textContent = '';

  // Einordnung zuerst, Material danach.
  root.append(el('div', { class: 'purpose' },
    el('p', { html: `<b>${esc(F.lede)}</b>` }),
    el('p', { style: 'margin-top:9px' }, F.why),
    el('p', { class: 'muted', style: 'font-size:.8rem;margin-top:9px' },
      F.howToReadPoints[0])));

  if (!state.fields.length) {
    root.append(el('div', { class: 'blank' },
      el('h3', {}, F.empty), el('p', {}, F.emptyBody)));
    return;
  }

  for (const field of state.fields) root.append(fieldCard(field, F));

  root.append(el('div', { class: 'warn' },
    el('h3', {}, F.howToRead),
    el('ul', {}, F.howToReadPoints.map(p => el('li', {}, p)))));
}

/**
 * Ein Thema als Karte: Blurb, Bild, die Belege aus der Mitte, und die Sätze,
 * die beides auseinanderhalten.
 */
function fieldCard(field, F) {
  const box = el('article', { class: 'tf' });

  box.append(el('div', { class: 'tf__head' },
    el('h2', { class: 'tf__title' }, field.title),
    el('p', { class: 'tf__frame' }, field.frameworkLabel)));

  box.append(el('p', { class: 'tf__blurb' }, field.blurb));

  // Ohne zweite Richtung gibt es kein Bild — und das wird gesagt, statt die
  // Karte wegzulassen. Ein fehlendes Feld ist selbst eine Auskunft.
  if (!field.axis) {
    box.append(el('p', { class: 'tf__none' }, F.noAxis));
    return box;
  }

  box.append(vennBlock(field, F));
  box.append(middleBlock(field, F));
  box.append(beliefBlock(field, F));
  box.append(el('p', { class: 'tf__lit' },
    el('span', {}, field.literature.note),
    el('i', {}, field.literature.ref)));

  return box;
}

/** Das Bild plus die Legende, die es beschriftet. */
function vennBlock(field, F) {
  const a = field.axis;
  const r = a.regions;

  const key = (which, label, count) => el('div', { class: `tf__key tf__key--${which}` },
    el('span', { class: 'tf__swatch', 'aria-hidden': 'true' }),
    el('b', {}, label),
    el('i', {}, F.entriesOn(count)));

  return el('div', { class: 'tf__venn' },
    renderVenn(r, {
      lang: state.config.lang,
      labelA: a.a.label, labelB: a.b.label,
      // Der Name des Themas steht in der Mitte: Er ist das, was die beiden
      // Seiten überhaupt zusammenhält.
      subject: a.subject
    }),
    el('div', { class: 'tf__keys' },
      key('a', a.a.label, r.onlyA),
      key('both', F.both, r.both),
      key('b', a.b.label, r.onlyB)));
}

/**
 * Die Mitte, ausgeschrieben. Das ist der Teil, für den das Bild überhaupt da
 * ist: Stellen, an denen beides schon nebeneinander stand.
 */
function middleBlock(field, F) {
  const quotes = field.axis.regions.quotes || [];
  const box = el('div', { class: 'tf__mid' });

  box.append(el('h3', {}, F.bothTitle));

  if (!quotes.length) {
    box.append(el('p', { class: 'muted', style: 'font-size:.85rem' }, F.bothEmpty));
    return box;
  }

  for (const q of quotes) {
    box.append(el('div', { class: `tf__pair${q.sameLine ? ' tf__pair--one' : ''}` },
      el('span', { class: 'tf__when' },
        new Date(`${q.date}T12:00:00`).toLocaleDateString(locale()),
        ' · ', q.sameLine ? F.sameLine : F.acrossEntry),
      el('blockquote', {}, q.a),
      q.b ? el('blockquote', { class: 'tf__b' }, q.b) : null));
  }

  return box;
}

/**
 * Die Sätze dazwischen.
 *
 * Hier gilt die strengste Regel der App: Das Programm behauptet nichts über
 * den Menschen. Es legt zwei Sätze hin, die in solchen Feldern häufig stehen,
 * und die Zuordnung macht ausschließlich der Mensch. „Keiner davon" ist
 * deshalb eine eigene, gleichwertige Antwort und kein Abbruch.
 */
function beliefBlock(field, F) {
  const box = el('div', { class: 'tf__belief', id: `beliefs-${field.axisId}` });
  paintBeliefs(box, field, F);
  return box;
}

function paintBeliefs(box, field, F) {
  box.textContent = '';
  box.append(el('h3', {}, F.beliefTitle));
  box.append(el('p', { class: 'tf__disclaim' }, F.beliefIntro));

  for (const c of field.conditionals) {
    box.append(el('button', {
      class: `tf__sentence${c.recognised ? ' is-marked' : ''}`,
      type: 'button',
      'aria-pressed': c.recognised ? 'true' : 'false',
      onclick: () => toggleBelief(c.key)
    },
      el('span', { class: 'tf__quote' }, c.text),
      el('span', { class: 'tf__mark' },
        c.recognised ? F.beliefMarked : F.beliefMark)));
  }

  if (field.conditionals.some(c => c.recognised)) {
    box.append(el('button', {
      class: 'btn btn--tiny', type: 'button', style: 'margin-top:4px',
      onclick: () => clearBeliefs(field.axisId)
    }, F.beliefNone));
  }
}

async function toggleBelief(key) {
  const marks = new Set(state.config.recognisedBeliefs || []);
  if (marks.has(key)) marks.delete(key); else marks.add(key);
  await commitBeliefs([...marks]);
}

async function clearBeliefs(axisId) {
  const marks = (state.config.recognisedBeliefs || []).filter(k => !k.startsWith(`${axisId}:`));
  await commitBeliefs(marks);
}

/**
 * Nur den betroffenen Abschnitt neu zeichnen. Ein Neuaufbau der ganzen Seite
 * würde beim Markieren eines Satzes den Scrollstand verlieren — mitten in
 * einem Text, den man gerade abwägt, ist das besonders unangenehm.
 */
async function commitBeliefs(marks) {
  state.config = state.storageOk
    ? await db.saveConfig({ recognisedBeliefs: marks })
    : { ...state.config, recognisedBeliefs: marks };

  state.fields = buildTensionFields(state.entries, state.projects, {
    lang: state.config.lang, recognised: marks
  });

  const F = TENSION_FRAMING[state.config.lang] || TENSION_FRAMING.de;
  for (const field of state.fields) {
    const box = document.getElementById(`beliefs-${field.axisId}`);
    if (box) paintBeliefs(box, field, F);
  }
}

function purposeHtml() {
  const text = t('proj.purpose');
  const cut = text.indexOf('. ');
  if (cut < 0) return esc(text);
  return `<b>${esc(text.slice(0, cut + 1))}</b> ${esc(text.slice(cut + 2))}`;
}

function projectCard(p) {
  const ev = p.evidence;
  const segments = 5;
  const filled = Math.max(1, Math.min(segments, Math.round((ev.share / 100) * segments) || 1));
  const total = state.analysis?.entryCount || ev.entryCount;

  // Zuerst nur die Überschrift: Eine Liste voller Zahlen und Rahmentexte
  // erschlägt, bevor man weiß, worum es geht. Wer ein Muster wiedererkennt,
  // klappt es auf und taucht in die Zahlen ein.
  const open = state.openProjects.has(p.conflictId) || state.newGoalFor === p.conflictId;
  const bodyId = `proj-body-${p.conflictId}`;
  const toggle = () => {
    if (state.openProjects.has(p.conflictId)) state.openProjects.delete(p.conflictId);
    else state.openProjects.add(p.conflictId);
    renderProjects();
  };

  return el('article', { class: `proj${p.adopted ? ' is-adopted' : ''}${open ? ' is-open' : ''}` },
    el('button', {
      class: 'proj__top', type: 'button',
      'aria-expanded': open ? 'true' : 'false', 'aria-controls': bodyId, onclick: toggle
    },
      el('span', { class: 'proj__head' },
        el('span', { class: 'proj__title' }, p.title),
        el('span', { class: 'proj__frame' }, p.frameworkLabel),
        open ? null : el('span', { class: 'proj__peek' }, t('proj.entries', ev.entryCount, total))),
      p.adopted ? el('span', { class: 'chip' }, '✓') : null,
      el('span', { class: 'proj__chev', 'aria-hidden': 'true' })),
    open ? el('div', { class: 'proj__body', id: bodyId },
    el('div', { class: 'proj__meter', 'aria-hidden': 'true' },
      Array.from({ length: segments }, (_, i) => el('i', { class: i < filled ? 'on' : '' }))),
    el('div', { class: 'proj__facts' },
      el('span', { class: 'fact' }, t('proj.entries', ev.entryCount, total)),
      el('span', { class: 'fact' }, t('proj.span', ev.spanDays)),
      ev.repeats ? el('span', { class: 'fact' }, t('proj.repeats', ev.repeats)) : null,
      ev.emotions.slice(0, 3).map(e => el('span', {
        class: 'fact', style: `background:hsl(${e.hue} 26% 60% / .16)`
      }, el('span', {}, e.label), el('b', {}, `${e.n}×`)))),
    el('p', { class: `proj__move move-${p.movement.direction}` }, p.movement.note),
    el('div', { class: 'proj__frameblock' },
      el('h4', {}, t('proj.frameTitle')),
      el('p', {}, p.frameworkNote),
      el('p', { style: 'margin-top:7px' }, p.framework.note),
      el('p', { class: 'proj__ref' }, p.framework.ref)),
    goalLayer(p),
    el('div', { class: 'proj__actions' },
      el('button', {
        class: `btn btn--tiny${p.adopted ? '' : ' btn--green'}`, type: 'button',
        onclick: () => toggleAdopt(p)
      }, p.adopted ? t('proj.drop') : t('proj.adopt')),
      el('button', {
        class: 'btn btn--tiny', type: 'button', onclick: () => startProjectDialogue(p)
      }, t('proj.talk')))) : null
  );
}

/**
 * Ziele: die Ebene unter dem Projekt. Formuliert werden sie vom Nutzer —
 * die App bietet höchstens Halbsätze an. Ohne Frist, ohne Fortschrittsbalken:
 * beides macht aus einem Vorhaben eine Schuld, sobald es nicht klappt.
 */
function goalLayer(p) {
  const mine = goalsFor(p.conflictId, state.goals);
  const adding = state.newGoalFor === p.conflictId;
  const box = el('div', { class: 'goals' });

  box.append(el('h4', { class: 'goals__h' }, t('goal.title')));

  if (!mine.length && !adding) {
    box.append(el('p', { class: 'goals__empty' }, t('goal.empty')));
  }

  for (const g of mine) {
    const done = Boolean(g.doneAt);
    box.append(el('div', { class: `goal${done ? ' is-done' : ''}` },
      el('button', {
        class: 'goal__tick', type: 'button',
        'aria-pressed': done ? 'true' : 'false',
        'aria-label': done ? t('goal.reopen') : t('goal.done'),
        onclick: async () => {
          g.doneAt = done ? null : new Date().toISOString();
          await db.putGoal(g);
          state.goals = await db.listGoals();
          renderProjects();
          if (!done) toast(t('goal.doneToast'));
        }
      }, done ? '✓' : ''),
      el('div', { class: 'goal__body' },
        el('p', { class: 'goal__text' }, g.title),
        g.note ? el('p', { class: 'goal__note' }, g.note) : null),
      el('button', {
        class: 'slot__x', type: 'button', 'aria-label': t('timeline.delete'),
        onclick: async () => {
          await db.deleteGoal(g.id);
          state.goals = await db.listGoals();
          renderProjects();
        }
      }, '✕')));
  }

  if (adding) {
    const input = el('input', {
      class: 'field', type: 'text', id: 'new-goal', placeholder: t('goal.placeholder')
    });
    const submit = async () => {
      const title = input.value.trim();
      if (!title) { input.focus(); return; }
      await db.putGoal(makeGoal({ projectId: p.conflictId, title }));
      state.goals = await db.listGoals();
      state.newGoalFor = null;
      renderProjects();
      toast(t('goal.added'));
    };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });

    const starters = goalStarters(p.conflictId, state.config.lang);
    box.append(el('div', { class: 'newnode' },
      input,
      starters.length ? el('div', {},
        el('p', { class: 'goals__hint' }, t('goal.starters')),
        el('div', { class: 'goals__chips' },
          starters.map(s => el('button', {
            class: 'btn btn--tiny btn--ghost', type: 'button',
            onclick: () => { input.value = s; input.focus(); }
          }, s)))) : null,
      el('div', { class: 'newnode__row' },
        el('button', { class: 'btn btn--tiny btn--green', type: 'button', onclick: submit }, t('goal.add')),
        el('button', {
          class: 'btn btn--tiny', type: 'button',
          onclick: () => { state.newGoalFor = null; renderProjects(); }
        }, t('struct.cancel')))));
    requestAnimationFrame(() => input.focus());
  } else {
    box.append(el('button', {
      class: 'btn btn--tiny btn--ghost', type: 'button',
      onclick: () => { state.newGoalFor = p.conflictId; renderProjects(); }
    }, `+ ${t('goal.add')}`));
  }

  return box;
}

async function toggleAdopt(p) {
  const current = new Set(state.config.adopted || []);
  if (current.has(p.conflictId)) current.delete(p.conflictId); else current.add(p.conflictId);
  state.config = await db.saveConfig({ adopted: [...current] });
  await refresh();
  toast(current.has(p.conflictId) ? t('proj.adoptedToast') : t('proj.droppedToast'));
}

$('#share-report').addEventListener('click', async () => {
  if (!state.analysis?.entryCount) return;
  const md = renderOverviewMarkdown(state.analysis, state.config.lang);
  await offerFile(`tiefenjournal-themen-${new Date().toISOString().slice(0, 10)}.md`,
    new Blob([md], { type: 'text/markdown' }), t('patterns.reportSaved'));
});

/** Läuft die App eingebettet im Artefakt oder eigenständig? */
const embedded = () => typeof window.claude?.use === 'function';

/**
 * Datei anbieten.
 *
 * Zwei Wege, und beide werden PROBIERT statt vorher ausgeschlossen: erst die
 * downloads-Fähigkeit des Artefakts, dann der gewöhnliche Link. Vorher gab die
 * App auf, sobald sie sich eingebettet sah — auf dem Telefon kam dadurch nur
 * eine Meldung statt einer Datei, obwohl der Link dort je nach Browser
 * durchaus trägt. Erst wenn beides nichts wird, sagt die App, was zu tun ist.
 */
async function offerFile(filename, blob, okMessage) {
  if (downloads) {
    try {
      await downloads.save({ filename, data: blob });
      toast(okMessage);
      return true;
    } catch (err) {
      // „declined" heißt: Der Mensch hat nein gesagt. Alles andere heißt:
      // Der Weg war versperrt — dann lohnt sich der zweite Versuch.
      if (err?.code === 'declined') { toast(t('settings.exportDeclined')); return false; }
    }
  }

  try {
    const url = URL.createObjectURL(blob);
    const link = el('a', { href: url, download: filename, rel: 'noopener' });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast(embedded() ? t('take.maybeSaved') : okMessage);
    return true;
  } catch { /* auch das ging nicht */ }

  toast(t('take.noWay'));
  return false;
}

/**
 * Die App mitnehmen.
 *
 * Steht bewusst IMMER da, auch wenn die Downloadfähigkeit gerade nicht
 * aufgelöst ist. Vorher war der ganze Block dahinter versteckt — wer die App
 * aufs Telefon bringen wollte, fand dann gar nichts, statt wenigstens zu
 * erfahren, woran es liegt. Ein Hinweis, der erklärt, ist besser als eine
 * Fläche, die fehlt.
 */
function takeBlock() {
  const status = el('p', { class: 'take__status', hidden: true });

  return el('div', { class: 'set set--take' },
    el('div', { class: 'set__d' }, t('take.desc')),
    el('div', { class: 'take' },
      el('div', { class: 'take__opt take__opt--main' },
        el('b', {}, t('take.app')),
        el('span', {}, t('take.appDesc')),
        el('button', {
          class: 'btn btn--green', type: 'button', id: 'take-app',
          style: 'width:100%',
          onclick: ev => takeAppPackage(ev.currentTarget, status)
        }, t('take.app'))),
      el('div', { class: 'take__opt' },
        el('b', {}, t('take.archive')),
        el('span', {}, t('take.archiveDesc')),
        el('button', {
          class: 'btn btn--tiny', type: 'button', id: 'take-archive',
          onclick: ev => takeArchive(ev.currentTarget, status)
        }, t('take.archive')))),
    status,
    // Der wichtigste Satz für den, der die App an Testleute weitergeben will.
    el('p', { class: 'take__why take__why--warn' }, t('take.phone')),
    el('p', { class: 'take__why' }, t('take.why')));
}

/* ═══════════ Dialog ═══════════ */

const STAGE_IDS = ['opening', 'clarify', 'assumption', 'evidence', 'perspective', 'origin', 'consequence', 'synthesis'];

async function newDialogue({ project = null, area = null } = {}) {
  const opening = openingMessage(state.entries, state.config.lang, project);
  const session = {
    id: db.newId(),
    createdAt: new Date().toISOString(),
    lang: state.config.lang,
    title: project ? project.title : (area ? area.title : null),
    projectId: project?.conflictId || null,
    projectTitle: project?.title || area?.title || null,
    areaId: area?.id || null,
    focusConflict: opening.focusConflict || null,
    stage: 'opening', finished: false,
    usedQuestions: [], usedEchoes: [],
    messages: [{ role: 'assistant', text: opening.text, at: new Date().toISOString(), stage: 'opening' }]
  };
  await db.putDialogue(session);
  state.chat = session;
  state.nudge = null;
  state.dialogues = await db.listDialogues();
  renderChat();
  goTo('dialog');
  setTimeout(() => $('#chat-input')?.focus(), 400);
}

function startProjectDialogue(p) { newDialogue({ project: p }); }
function startAreaDialogue(node) { newDialogue({ area: node }); }

$('#start-dialogue').addEventListener('click', () => newDialogue());
$('#dialogue-menu').addEventListener('click', () => newDialogue());

function renderChatList() {
  const wrap = $('#chat-list');
  wrap.textContent = '';
  if (!state.dialogues.length) return;

  const row = el('div', { class: 'chatlist' });
  for (const d of state.dialogues.slice(0, 8)) {
    const turns = (d.messages || []).filter(m => m.role === 'user').length;
    row.append(el('span', { class: `chatlist__b${state.chat?.id === d.id ? ' on' : ''}` },
      el('button', {
        type: 'button',
        style: 'border:0;background:none;font:inherit;color:inherit;cursor:pointer;padding:0',
        onclick: () => { state.chat = d; state.nudge = null; renderChat(); }
      }, `${d.title ? d.title.slice(0, 22) : new Date(d.createdAt).toLocaleDateString(locale())} · ${turns}`),
      el('button', {
        class: 'chatlist__x', type: 'button', 'aria-label': t('timeline.delete'),
        onclick: async () => {
          await db.deleteDialogue(d.id);
          if (state.chat?.id === d.id) state.chat = null;
          state.dialogues = await db.listDialogues();
          renderChat();
          renderProjects();
        }
      }, '✕')));
  }
  wrap.append(row);
}

function renderChat() {
  const box = $('#msgs');
  const after = $('#chat-after');
  const nudgeBox = $('#chat-nudge');
  const d = state.chat;

  after.textContent = '';
  nudgeBox.textContent = '';
  renderChatList();
  $('#dialogue-menu').hidden = !state.dialogues.length;

  if (!d) {
    box.textContent = '';
    box.hidden = true;
    $('#chat-empty').hidden = false;
    $('#chatbar').hidden = true;
    $('#stage-track').hidden = true;
    $('#chat-title').textContent = t('dialogue.title');
    renderChatStarters();
    return;
  }

  $('#chat-empty').hidden = true;
  box.hidden = false;
  $('#chat-title').textContent = d.title || t('dialogue.title');

  const stages = t('dialogue.stages');
  const idx = Math.max(0, STAGE_IDS.indexOf(d.stage));
  const track = $('#stage-track');
  track.hidden = false;
  track.textContent = '';
  stages.forEach((_, i) => track.append(el('i', { class: i <= idx ? 'on' : '' })));
  track.append(el('span', {}, d.finished ? t('chat.finished') : stages[idx]));

  box.textContent = '';
  if (d.projectTitle) {
    box.append(el('p', { class: 'muted', style: 'font-size:.82rem;text-align:center;padding-bottom:4px' },
      t('chat.projectIntro', d.projectTitle)));
  }
  for (const m of d.messages) {
    box.append(el('div', { class: `msg msg--${m.role}${m.crisis ? ' msg--crisis' : ''}` },
      el('div', { class: 'msg__w' }, m.role === 'user' ? t('dialogue.me') : t('dialogue.them')),
      el('div', { class: 'msg__b' }, m.text),
      m.literature ? el('div', { class: 'msg__lit' }, `${m.literature.note} — ${m.literature.ref}`) : null));
  }

  if (state.nudge) nudgeBox.append(renderNudge(state.nudge));

  const turns = d.messages.filter(m => m.role === 'user').length;
  if (d.finished) {
    $('#chatbar').hidden = true;
    after.append(renderSummary(d));
  } else {
    $('#chatbar').hidden = false;
    if (turns >= 4) {
      after.append(el('div', { class: 'finishbar' },
        el('button', { class: 'btn btn--tiny', type: 'button', onclick: finishChat }, t('chat.finish'))));
    }
  }
}

/**
 * Ans Ende des Gesprächs scrollen. Der Scrollcontainer ist jetzt der
 * Seitenkörper, nicht mehr die durchgehende Bahn.
 */
function scrollChatToEnd() {
  const body = document.querySelector('#page-dialog .page__body');
  if (body) body.scrollTop = body.scrollHeight;
}

function renderChatStarters() {
  const wrap = $('#chat-projects');
  wrap.textContent = '';
  for (const p of state.projects.slice(0, 2)) {
    wrap.append(el('button', {
      class: 'btn', type: 'button', style: 'width:100%',
      onclick: () => startProjectDialogue(p)
    }, t('chat.aboutProject', p.title)));
  }
  for (const n of state.nodes.slice(0, 2)) {
    wrap.append(el('button', {
      class: 'btn', type: 'button', style: 'width:100%',
      onclick: () => startAreaDialogue(n)
    }, t('chat.aboutArea', pathOf(n, state.nodes))));
  }
}

/**
 * Der Anstoß zur eigenen Ordnung: Wenn im Gespräch ein Thema auftaucht, für
 * das es noch keinen Bereich gibt, wird einer vorgeschlagen — einmal, klein,
 * und mit einem ehrlichen „Jetzt nicht".
 */
function renderNudge(s) {
  return el('div', { class: 'nudge' },
    el('p', { html: `<b>${esc(t('nudge.title', s.title))}</b>` }),
    el('p', {}, t('nudge.body')),
    s.parentTitle ? el('p', { class: 'muted', style: 'font-size:.82rem' }, t('nudge.under', s.parentTitle)) : null,
    el('div', { class: 'nudge__row' },
      el('button', {
        class: 'btn btn--tiny btn--green', type: 'button',
        onclick: async () => {
          const created = materialise(s, state.config.lang);
          // Das erkannte Thema gleich andocken, damit der Bereich Einträge findet.
          created[created.length - 1].themeIds = [s.domainId];
          await db.putStructures(created);
          state.nodes = await db.listStructures();
          state.nudge = null;
          renderStructure();
          renderChat();
          toast(t('nudge.made', s.title));
        }
      }, t('nudge.yes')),
      el('button', {
        class: 'btn btn--tiny', type: 'button',
        onclick: async () => {
          const dismissed = [...new Set([...(state.config.dismissedAreas || []), s.key])];
          state.config = await db.saveConfig({ dismissedAreas: dismissed });
          state.nudge = null;
          renderChat();
        }
      }, t('nudge.no'))));
}

function renderSummary(d) {
  const sum = d.summary || closingSummary(d, state.entries, state.config.lang);
  return el('div', { class: 'summary' },
    el('h3', {}, t('chat.summaryTitle')),
    el('p', { class: 'summary__head' }, sum.headline),
    sum.body.map(line => el('p', {}, line)),
    el('p', { class: 'muted', style: 'font-size:.8rem;margin-top:8px' }, t('chat.transcriptNote')),
    el('div', { class: 'summary__actions' },
      el('button', { class: 'btn btn--tiny', type: 'button', onclick: () => saveTranscript(d) }, t('chat.save')),
      el('button', {
        class: 'btn btn--tiny', type: 'button',
        onclick: async () => {
          state.chat.finished = false;
          await db.putDialogue(state.chat);
          state.dialogues = await db.listDialogues();
          renderChat();
          renderProjects();
        }
      }, t('chat.reopen'))));
}

async function finishChat() {
  if (!state.chat) return;
  state.chat.finished = true;
  state.chat.summary = closingSummary(state.chat, state.entries, state.config.lang);
  await db.putDialogue(state.chat);
  state.dialogues = await db.listDialogues();
  renderChat();
  // Der Ertrag steht sofort unter „Projekte" — sonst wirkt die Zusammenfassung
  // wie etwas, das die App nebenher tut.
  renderProjects();
}

async function saveTranscript(d) {
  const de = state.config.lang !== 'en';
  const lines = [`# ${d.title || (de ? 'Dialog' : 'Dialogue')}`, '',
    `*${new Date(d.createdAt).toLocaleString(locale())}*`, ''];
  for (const m of d.messages) {
    lines.push(`**${m.role === 'user' ? t('dialogue.me') : t('dialogue.them')}**`, '');
    lines.push(m.text.split('\n').map(l => l ? `> ${l}` : '>').join('\n'), '');
    if (m.literature) lines.push(`<sub>${m.literature.note} — ${m.literature.ref}</sub>`, '');
  }
  const sum = d.summary || closingSummary(d, state.entries, state.config.lang);
  if (sum) lines.push('---', '', `## ${t('chat.summaryTitle')}`, '', sum.headline, '', ...sum.body.map(b => `- ${b}`));
  await offerFile(`tiefenjournal-dialog-${d.createdAt.slice(0, 10)}.md`,
    new Blob([lines.join('\n')], { type: 'text/markdown' }), t('chat.saved'));
}

async function sendChat() {
  const input = $('#chat-input');
  const text = input.value.trim();
  if (!text || !state.chat || state.chat.finished) return;

  input.value = '';
  input.style.height = 'auto';

  state.chat.messages.push({ role: 'user', text, at: new Date().toISOString() });
  if (!state.chat.title) state.chat.title = text.slice(0, 60);
  state.nudge = null;
  renderChat();

  $('#msgs').append(el('div', { class: 'msg' },
    el('div', { class: 'msg__w' }, t('dialogue.them')),
    el('div', { class: 'typing' }, el('i'), el('i'), el('i'))));
  scrollChatToEnd();

  await new Promise(r => setTimeout(r, 560));

  const reply = respond(state.chat, text, state.entries);
  state.chat.stage = reply.stage;
  state.chat.focusConflict = reply.focusConflict || state.chat.focusConflict;
  state.chat.usedQuestions = [...new Set([...(state.chat.usedQuestions || []), reply.text])].slice(-40);
  if (reply.usedEcho) {
    state.chat.usedEchoes = [...new Set([...(state.chat.usedEchoes || []), reply.usedEcho])];
  }
  state.chat.messages.push({
    role: 'assistant', text: reply.text, at: new Date().toISOString(),
    stage: reply.stage, literature: reply.literature || null, crisis: reply.crisis || false
  });

  await db.putDialogue(state.chat);
  state.dialogues = await db.listDialogues();

  // Ordnen anbieten — aber nicht bei einer Krisenantwort und nicht im ersten Zug.
  if (!reply.crisis) {
    const detected = analyseEntry({ date: '', feelings: [], freeText: text, transcript: '' });
    state.nudge = suggestArea(detected, state.nodes, state.config.lang, state.config.dismissedAreas || []);
  }

  renderChat();
  scrollChatToEnd();
}

$('#chat-send').addEventListener('click', sendChat);
$('#chat-input').addEventListener('input', e => {
  e.target.style.height = 'auto';
  e.target.style.height = Math.min(e.target.scrollHeight, window.innerHeight * 0.34) + 'px';
});
$('#chat-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendChat(); }
});

/* ═══════════ Mehr ═══════════ */

/**
 * Nur den Metrikbaum neu zeichnen. Ein voller Neuaufbau der Einstellungen
 * würde beim Aufklappen einer Definition die Seitenhöhe zusammenfallen lassen
 * und den Leser irgendwohin scrollen — auf einer einzigen Ebene fällt das
 * doppelt auf.
 */
function paintMetrics() {
  const host = state.metricsHost;
  if (!host || !state.analysis) return;
  host.textContent = '';
  renderMetrics(host, serialise(state.analysis), {
    t, lang: state.config.lang, el, esc,
    openDefence: state.openDefence,
    onDefence: id => { state.openDefence = id; paintMetrics(); },
    onGuide: () => openGuide({ lang: state.config.lang })
  });
}

async function renderSettings() {
  const wrap = $('#settings');
  wrap.textContent = '';

  const seg = (opts, current, onPick) => {
    const box = el('div', { class: 'seg' });
    for (const [value, label] of opts) {
      box.append(el('button', {
        type: 'button', class: String(value) === String(current) ? 'on' : '',
        onclick: () => onPick(value)
      }, label));
    }
    return box;
  };
  const setting = (label, desc, control) => el('div', { class: 'set' },
    el('div', { class: 'set__l' }, label),
    el('div', { class: 'set__d' }, desc),
    control ? el('div', { class: 'set__c' }, control) : null);

  if (!state.storageOk) {
    wrap.append(el('div', { class: 'warn warn--alert' }, el('p', {}, t('storage.blocked'))));
  }

  // Allererst die Sprache, zweisprachig beschriftet: Wer die eingestellte
  // Sprache nicht lesen kann, muss den Schalter trotzdem finden. Weiter unten
  // zwischen den Einstellungen war er praktisch unauffindbar.
  wrap.append(el('div', { class: 'set set--lang' },
    el('div', { class: 'set__l' }, 'Sprache · Language'),
    el('div', { class: 'set__c' },
      seg([['de', 'Deutsch'], ['en', 'English']], state.config.lang, async v => {
        if (v === state.config.lang) return;
        await commitLang(v);
        initSlots(); renderSlots(); renderPalette();
        await refresh(); renderSettings();
        toast(v === 'en' ? 'Language: English' : 'Sprache: Deutsch');
      }))));

  // Ganz oben: die App mitnehmen. Ein Browserfenster vergisst alles, sobald
  // jemand die Seitendaten löscht — und bis ein Journal genug Einträge für
  // die Auswertungen hat, vergehen Tage. Wer das hier testen soll, braucht
  // zuerst diesen Weg, nicht die Zahlen.
  wrap.append(el('p', { class: 'day__h' }, t('take.label')));
  wrap.append(takeBlock());

  // Die Zählwerte stehen darunter, nicht bei der Synthese: eine Zahl über
  // das eigene Fühlen sollte nichts sein, worauf man zuerst stößt.
  const metrics = el('div');
  state.metricsHost = metrics;
  wrap.append(el('p', { class: 'day__h', style: 'margin-top:20px' }, t('metrics.title')), metrics);
  paintMetrics();

  wrap.append(el('p', { class: 'day__h', style: 'margin-top:20px' }, t('settings.eyebrow')));
  wrap.append(setting(t('settings.introLabel'), t('settings.introDesc'),
    el('button', {
      class: 'btn btn--tiny', type: 'button',
      onclick: () => showIntro(state.config.lang, { fixedLang: false })
    }, t('settings.introOpen'))));
  wrap.append(setting(t('settings.walkLabel'), t('settings.walkDesc'),
    el('button', {
      class: 'btn btn--tiny', type: 'button', onclick: startWalkthrough
    }, t('settings.walkOpen'))));
  wrap.append(setting(t('settings.purposeLabel'), t('proj.purpose'), null));
  wrap.append(setting(t('settings.voiceLabel'), t('settings.voiceDesc'), null));


  wrap.append(setting(t('settings.slotsLabel'), t('settings.slotsDesc'),
    seg([['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']], String(state.config.feelingSlots), async v => {
      state.config = await db.saveConfig({ feelingSlots: Number(v) });
      initSlots(); renderSlots(); renderPalette(); renderSettings();
    })));

  const persisted = await navigator.storage?.persisted?.().catch(() => false);
  const estimate = await db.storageEstimate();
  wrap.append(setting(t('settings.storageLabel'), t('settings.storageDesc'),
    el('div', { style: 'display:grid;gap:8px;width:100%' },
      el('p', { class: 'muted', style: 'font-size:.83rem' },
        persisted ? t('settings.persisted') : t('settings.notPersisted')),
      estimate ? el('p', { class: 'muted', style: 'font-size:.8rem' },
        t('settings.usage', fmtBytes(estimate.usage || 0), fmtBytes(estimate.quota || 0))) : null,
      persisted ? null : el('div', {}, el('button', {
        class: 'btn btn--tiny', type: 'button',
        onclick: async () => {
          const r = await db.requestPersistence();
          toast(r.persisted ? t('settings.persistOk') : t('settings.persistNo'));
          renderSettings();
        }
      }, t('settings.persistAsk'))))));

  wrap.append(setting(t('settings.exportLabel'), t('settings.exportDesc'),
    el('button', { class: 'btn btn--tiny', type: 'button', onclick: doExport }, t('settings.export'))));

  const fileInput = el('input', {
    type: 'file', accept: 'application/json,.json', id: 'import-file', style: 'display:none',
    onchange: async ev => {
      const file = ev.target.files?.[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (data.app !== 'tiefenjournal' || !Array.isArray(data.entries)) { toast(t('settings.importBad')); return; }
        const r = await db.importAll(data);
        await refresh();
        toast(r.addedEntries || r.addedDialogues
          ? t('settings.imported', r.addedEntries, r.addedDialogues)
          : t('settings.importNothing'));
        renderSettings();
      } catch { toast(t('settings.importBad')); }
      finally { ev.target.value = ''; }
    }
  });
  wrap.append(setting(t('settings.importLabel'), t('settings.importDesc'),
    el('div', {}, fileInput,
      el('button', { class: 'btn btn--tiny', type: 'button', onclick: () => fileInput.click() }, t('settings.importPick')))));

  wrap.append(el('div', { class: 'warn' },
    el('h3', {}, t('disclaimer.title')),
    el('p', {}, t('disclaimer.body')),
    el('ul', {}, t('disclaimer.points').map(p => el('li', {}, p)))));

  const crisis = CRISIS_RESOURCES[state.config.lang] || CRISIS_RESOURCES.de;
  wrap.append(el('div', { class: 'warn warn--alert' },
    el('h3', {}, crisis.title),
    el('p', {}, crisis.body),
    el('ul', {}, crisis.contacts.map(c => el('li', {}, c)))));

  wrap.append(setting(t('settings.wipeLabel'), t('settings.wipeDesc'),
    el('button', {
      class: 'btn btn--tiny btn--danger', type: 'button',
      onclick: ev => askInline(ev.currentTarget, t('settings.wipeConfirm'), t('settings.wipe'),
        async () => {
          const lang = state.config.lang;
          await db.wipeAll();
          // Sprache und „schon gefragt" bleiben: mitten in der Sitzung wieder
          // nach der Sprache zu fragen wäre absurd, und der Beispielverlauf
          // soll nach einem bewussten Löschen nicht zurückkommen.
          state.config = await db.saveConfig({ lang, langChosen: true, seeded: true });
          writeStoredLang(lang);
          setLang(state.config.lang);
          state.chat = null; state.nudge = null; state.openEntry = null;
          initSlots(); renderSlots(); renderPalette();
          await refresh();
          toast(t('settings.wiped'));
          renderSettings();
        })
    }, t('settings.wipe'))));

  wrap.append(el('p', { class: 'muted', style: 'text-align:center;font-size:.76rem;padding:10px 0 4px' },
    'Tiefenjournal 2.0'));
}

/**
 * Schnürt die App samt Daten zu einem Paket. Das Zusammensuchen der eigenen
 * Quelldateien dauert einen Moment — deshalb sagt der Knopf, was er tut.
 */
async function takeAppPackage(button, status) {
  button.disabled = true;
  status.hidden = false;
  status.textContent = t('take.building');

  try {
    const data = await db.exportAll({ withAudio: false });
    const zip = await buildAppPackage({
      lang: state.config.lang,
      data,
      onProgress: ({ done, total, name }) => {
        status.textContent = `${t('take.building')} ${done}/${total} · ${name}`;
      }
    });
    status.textContent = `${Math.round(zip.size / 1024)} KB`;
    await offerFile(`tiefenjournal-app-${new Date().toISOString().slice(0, 10)}.zip`,
      zip, t('take.builtApp'));
  } catch (err) {
    status.textContent = `${t('take.failed')}: ${err.message}`;
    toast(`${t('take.failed')}: ${err.message}`);
  } finally {
    button.disabled = false;
  }
}

async function takeArchive(button, status) {
  button.disabled = true;
  status.hidden = false;
  status.textContent = t('take.building');

  try {
    const data = await db.exportAll({ withAudio: false });
    const html = buildArchive({ lang: state.config.lang, data, emotionLabel: lbl });
    status.textContent = `${Math.round(new Blob([html]).size / 1024)} KB`;
    await offerFile(`tiefenjournal-archiv-${new Date().toISOString().slice(0, 10)}.html`,
      new Blob([html], { type: 'text/html' }), t('take.builtArchive'));
  } catch (err) {
    status.textContent = `${t('take.failed')}: ${err.message}`;
    toast(`${t('take.failed')}: ${err.message}`);
  } finally {
    button.disabled = false;
  }
}

async function doExport() {
  const data = await db.exportAll({ withAudio: false });
  const saved = await offerFile(`tiefenjournal-${new Date().toISOString().slice(0, 10)}.json`,
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), t('settings.exportSaved'));
  if (saved && state.storageOk) {
    state.config = await db.saveConfig({ lastExportAt: new Date().toISOString() });
    renderBackupNudge();
  }
}

/* ═══════════ Sicherungserinnerung ═══════════
 *
 * Die Einträge liegen nur in diesem Browser, und Safari räumt die Daten einer
 * Seite nach etwa sieben Tagen ohne Besuch ab. Deshalb nach einer Woche ein
 * leiser Hinweis — kein Dialog, keine Wiederholung bei jedem Öffnen: Wer
 * „Später" sagt, hört eine Woche lang nichts, und nach einer Sicherung kommt
 * er nur wieder, wenn seitdem etwas Neues dazugekommen ist.
 */
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Einmal, gleich nach dem ersten eigenen Eintrag: wo er jetzt liegt. Ohne
 * Konto und Server ist das nicht selbstverständlich — viele nehmen an, eine
 * Webseite vergesse alles beim Schließen, oder umgekehrt, alles liege in einer
 * Cloud. Beides stimmt hier nicht, und das soll man in drei Sätzen wissen.
 *
 * Kommt nicht, wenn gar nicht gespeichert werden kann: Dafür steht oben auf
 * der Seite schon der Warnhinweis.
 *
 * @returns true, wenn die Blase gezeigt wird (dann ohne zusätzlichen Toast)
 */
function showStorageTip() {
  if (!state.storageOk || state.config.storageExplained) return false;
  if (!state.entries.some(e => !e.demo)) return false;

  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone;

  const host = $('#savedtip');
  const close = async () => {
    host.hidden = true;
    host.textContent = '';
    state.config = await db.saveConfig({ storageExplained: true });
  };

  host.textContent = '';
  host.append(
    el('div', { class: 'savedtip__shade', onclick: close }),
    el('div', { class: 'savedtip__bubble', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'savedtip-title' },
      el('div', { class: 'savedtip__icon', 'aria-hidden': 'true' }, '✓'),
      el('h2', { class: 'savedtip__title', id: 'savedtip-title' }, t('tip.title')),
      el('ul', { class: 'savedtip__list' },
        el('li', {}, t('tip.keep')),
        el('li', {}, t('tip.private')),
        el('li', {}, t('tip.lose'))),
      ios && !standalone ? el('p', { class: 'savedtip__ios' }, t('tip.ios')) : null,
      el('div', { class: 'savedtip__row' },
        el('button', { class: 'btn btn--primary', type: 'button', onclick: close }, t('tip.ok')),
        el('button', {
          class: 'btn', type: 'button',
          onclick: async () => { await close(); await doExport(); }
        }, t('tip.backup')))));
  host.hidden = false;
  host.querySelector('.btn--primary')?.focus();
  return true;
}

function backupDue() {
  if (!state.storageOk) return null;
  const real = state.entries.filter(e => !e.demo);
  if (!real.length) return null;

  const now = Date.now();
  const snoozed = Date.parse(state.config.backupSnoozedUntil || '') || 0;
  if (snoozed > now) return null;

  const last = Date.parse(state.config.lastExportAt || '') || 0;
  const firstAt = Math.min(...real.map(e => Date.parse(e.createdAt) || now));
  if (now - (last || firstAt) < WEEK_MS) return null;

  const added = last ? real.filter(e => (Date.parse(e.createdAt) || 0) > last).length : real.length;
  if (last && !added) return null;
  return { first: !last, days: Math.floor((now - last) / 86400000), added };
}

function renderBackupNudge() {
  const host = $('#backup-nudge');
  if (!host) return;
  host.textContent = '';
  const due = backupDue();
  host.hidden = !due;
  if (!due) return;

  host.append(el('div', { class: 'backup' },
    el('h3', { class: 'backup__t' }, due.first ? t('backup.firstTitle') : t('backup.againTitle')),
    el('p', { class: 'backup__p' }, due.first ? t('backup.body') : t('backup.since', due.days, due.added)),
    el('div', { class: 'backup__row' },
      el('button', { class: 'btn btn--tiny btn--green', type: 'button', onclick: doExport }, t('backup.now')),
      el('button', {
        class: 'btn btn--tiny', type: 'button',
        onclick: async () => {
          state.config = await db.saveConfig({
            backupSnoozedUntil: new Date(Date.now() + WEEK_MS).toISOString()
          });
          renderBackupNudge();
          toast(t('backup.snoozed'));
        }
      }, t('backup.later')))));
}

/* ═══════════ Beispielverlauf ═══════════ */

/**
 * Zweisprachig, weil der Beispielverlauf sonst hinter einer englischen
 * Oberfläche auf Deutsch stünde. Beide Fassungen sind so geschrieben, dass sie
 * dieselben zwei Spannungsfelder tragen — mit einer Ausnahme am Ende, an der
 * sichtbar wird, dass es auch anders gehen kann.
 */
const DEMO = [
  [-26,
    [['unsicher', 3,
      'meine Mutter hat wieder bestimmt, wie es läuft, und gefragt, wann ich endlich erwachsen werde',
      'my mother was in charge again and asked when I will finally grow up'],
     ['klein', 4,
      'ich habe mich sofort wieder wie ein Kind behandelt gefühlt und nichts sagen können',
      'I felt treated like a child again and said nothing']],
    'Immer wieder dasselbe mit ihr. Schon als Kind ging das so.',
    'Again and again the same with her. It was like that as a child too.'],

  [-21,
    [['gekraenkt', 4,
      'mein Chef hat meinen Vorschlag vor allen übergangen',
      'my boss passed over my proposal in front of everyone'],
     ['wuetend', 4,
      'ich habe wieder nachgegeben statt mich durchzusetzen',
      'I gave in again instead of saying what I thought'],
     ['erschoepft', 3,
      'danach hatte ich Kopfschmerzen und konnte nicht schlafen',
      'afterwards I had a headache and could not sleep']],
    'Ich bin so dumm. Eigentlich ist es halb so wild.',
    'I am so stupid. Actually it is not that bad.'],

  // Beides an einem Tag, teils im selben Satz. Dieser Eintrag ist der Grund,
  // warum der Beispielverlauf unter „Spannungen" ein Bild mit einer Mitte
  // ergibt — ohne ihn stünden die zwei Richtungen nur nebeneinander.
  [-19,
    [['angespannt', 3,
      'ich habe erst nachgegeben und dann doch gesagt, was ich will',
      'I gave in first and then said what I want after all'],
     ['erleichtert', 3,
      'hinterher war es leichter, als ich gedacht hatte',
      'afterwards it was easier than I had thought']],
    'Beides an einem Tag. Erst klein beigegeben, später widersprochen.',
    'Both in one day. Backed down first, spoke up later.'],

  [-17,
    [['traurig', 4,
      'mein Partner wollte wieder Abstand und ich wusste nicht, warum',
      'my partner needed space again and I did not know why'],
     ['aengstlich', 4,
      'ich habe sofort Angst, verlassen zu werden',
      'I am immediately afraid of being abandoned']],
    'Zu viel Nähe, dann zu wenig. Das kenne ich schon als Kind.',
    'Too close, then too far. I know this from childhood.'],

  [-13,
    [['ueberfordert', 4,
      'ich habe zu viel zugesagt und wieder nicht nein gesagt',
      'I overcommitted again and could not say no'],
     ['angespannt', 3,
      'der Nacken ist komplett verspannt, ich konnte nicht schlafen',
      'my shoulders are tense and I could not sleep']],
    'Aus seiner Sicht ist das vielleicht gar nicht so gemeint.',
    'From his perspective it may not be meant that way at all.'],

  [-9,
    [['dankbar', 4,
      'ein Freund hat von sich aus angerufen, ohne dass ich fragen musste',
      'a friend called on his own, without me having to ask'],
     ['geruehrt', 3,
      'das hat mich mehr berührt, als ich erwartet hätte',
      'that moved me more than I expected']],
    'Bin danach laufen gegangen.',
    'Went running afterwards.'],

  [-8,
    [['abgegrenzt', 3,
      'ich habe gesagt, was ich will, und bin dabei geblieben',
      'I said what I want and stood my ground'],
     ['unsicher', 3,
      'danach war ich mir trotzdem nicht sicher, ob das in Ordnung war',
      'afterwards I still was not sure whether that was all right']],
    'Ging leichter als erwartet. Der Zweifel kam erst hinterher.',
    'Easier than expected. The doubt only came afterwards.'],

  [-6,
    [['einsam', 4,
      'ich habe mich nicht gemeldet, obwohl ich es gebraucht hätte',
      'I did not reach out, although I needed to'],
     ['bedürftig', 3,
      'ich wollte niemanden damit belasten und habe es für mich behalten',
      'I did not want to burden anyone and kept it to myself']],
    'Ich brauche niemanden. Sagt jedenfalls der Teil, der das Telefon weglegt.',
    'I need no one. At least that is what the part of me putting the phone down says.'],

  [-3,
    [['klein', 4,
      'meine Mutter hat wieder über meinen Kopf hinweg entschieden',
      'my mother overruled me again'],
     ['gereizt', 4,
      'ich habe klein beigegeben, obwohl ich innerlich getobt habe',
      'I backed down although I was raging inside']],
    'Schon wieder. Typisch ich.',
    'Here we go again. Typical me.'],

  [-1,
    [['stolz', 5,
      'ich habe im Meeting tatsächlich widersprochen und mich nicht übergehen lassen',
      'I actually spoke up in the meeting and stood my ground'],
     ['lebendig', 4,
      'danach war ich richtig wach',
      'afterwards I was properly awake'],
     ['abgegrenzt', 4,
      'ich habe zum ersten Mal seit Langem nein gesagt, ohne mich zu erklären',
      'for the first time in ages I said no without explaining myself']],
    'Das war neu. Ich musste hinterher selbst lachen. Aus seiner Sicht war das sicher überraschend.',
    'That was new. I had to laugh afterwards. From his perspective it must have been surprising.']
];

async function seedDemo(lang = 'de') {
  const en = lang === 'en';
  for (const [offset, feels, freeDe, freeEn] of DEMO) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    d.setHours(19, 30, 0, 0);
    const date = d.toISOString().slice(0, 10);
    const entry = {
      id: `demo-${date}`, createdAt: d.toISOString(), updatedAt: d.toISOString(),
      date, lang, demo: true,
      feelings: feels.map(([emotionId, intensity, becauseDe, becauseEn]) =>
        ({ emotionId, intensity, because: en ? becauseEn : becauseDe })),
      freeText: en ? freeEn : freeDe,
      transcript: '', tags: [], audio: null
    };
    entry.analysis = analyseEntry(entry);
    await db.putEntry(entry);
  }
}

/* ═══════════ Start ═══════════ */

const INTRO_KEY = 'tiefenjournal.intro';

const introSeen = () => {
  try { return localStorage.getItem(INTRO_KEY) === '1'; } catch { return false; }
};
const markIntroSeen = () => {
  try { localStorage.setItem(INTRO_KEY, '1'); } catch { /* auch ohne geht es weiter */ }
};

/**
 * Die Erklärseite: wozu das hier gut ist.
 *
 * Sie kommt direkt nach der Sprachwahl, damit sie gleich in der richtigen
 * Sprache dasteht — eine Erklärung vor der Wahl müsste man womöglich in einer
 * Sprache lesen, die man nicht versteht.
 *
 * Beim ersten Start ist ihr Umschalter ausgeblendet (die Sprache steht ja
 * schon fest). Unter „Mehr" wieder aufgeschlagen, dient er als reine
 * Lesesprache dieser Seite und ändert die App nicht.
 */
let introLang = null;
let introDone = null;

function showIntro(start, { fixedLang = false } = {}) {
  const screen = $('#intro');
  // Beim ersten Start ist die Sprache schon gewählt — dann braucht die Seite
  // keinen eigenen Umschalter. Unter „Mehr" wieder aufgeschlagen behält sie ihn.
  $('#intro-de').parentElement.hidden = fixedLang;
  introLang = start
    || ((navigator.language || 'de').toLowerCase().startsWith('de') ? 'de' : 'en');

  const paint = () => {
    for (const node of screen.querySelectorAll('[data-de]')) {
      node.textContent = introLang === 'en' ? node.dataset.en : node.dataset.de;
    }
    screen.setAttribute('lang', introLang);
    $('#intro-de').classList.toggle('on', introLang === 'de');
    $('#intro-en').classList.toggle('on', introLang === 'en');
  };

  // Einmal binden, nicht bei jedem Öffnen — die Seite lässt sich später unter
  // „Mehr" noch einmal aufschlagen.
  if (introDone === null) {
    $('#intro-de').addEventListener('click', () => { introLang = 'de'; paint(); });
    $('#intro-en').addEventListener('click', () => { introLang = 'en'; paint(); });
    $('#intro-go').addEventListener('click', () => {
      markIntroSeen();
      screen.hidden = true;
      document.body.classList.remove('is-choosing');
      const done = introDone;
      introDone = () => {};
      done?.(introLang);
    });
  }

  paint();
  document.body.classList.add('is-choosing');
  screen.hidden = false;
  screen.scrollTop = 0;

  return new Promise(resolve => { introDone = resolve; });
}

/**
 * Die Sprachwahl: Sie bestimmt nicht nur die Oberfläche, sondern auch, in
 * welcher Sprache der Beispielverlauf angelegt wird. Deshalb wird vorher
 * nichts geschrieben.
 *
 * @param suggested  die Sprache des Browsers, als Vorschlag
 */
function askLanguage(suggested = 'de') {
  return new Promise(resolve => {
    document.body.classList.add('is-choosing');
    const screen = $('#welcome');
    screen.hidden = false;

    const choose = lang => {
      screen.hidden = true;
      document.body.classList.remove('is-choosing');
      resolve(lang);
    };

    $('#pick-de').addEventListener('click', () => choose('de'), { once: true });
    $('#pick-en').addEventListener('click', () => choose('en'), { once: true });

    // Die Sprache des Browsers steht vorn, ist aber nicht gesetzt —
    // entscheiden soll trotzdem der Mensch.
    const first = suggested === 'en' ? '#pick-en' : '#pick-de';
    $(first)?.classList.add('is-suggested');
    setTimeout(() => $(first)?.focus(), 60);
  });
}

async function boot() {
  // Zuerst die gemerkte Sprache, noch vor jeder Datenbank: so steht die
  // Oberfläche sofort richtig da, statt kurz in der Ausgangssprache zu blitzen.
  const remembered = readStoredLang();
  if (remembered) {
    setLang(remembered);
    applyLang();
  }

  const storage = await db.initStorage();
  state.storageOk = storage.ok;
  state.storageReason = storage.reason;
  state.config = await db.loadConfig();

  if (remembered) {
    // Die gemerkte Sprache hat Vorrang und repariert nebenbei die
    // Einstellungen, falls die Datenbank sie verloren hat.
    if (state.config.lang !== remembered || !state.config.langChosen) {
      state.config = state.storageOk
        ? await db.saveConfig({ lang: remembered, langChosen: true })
        : { ...state.config, lang: remembered, langChosen: true };
    }
  } else if (!state.config.langChosen) {
    // Erster Start: zuerst die Sprache, dann in dieser Sprache erklären,
    // wozu das hier gut ist — beides, bevor irgendetwas angelegt wird. Eine
    // Erklärseite vor der Sprachwahl müsste man womöglich in einer Sprache
    // lesen, die man nicht versteht.
    const browserLang = (navigator.language || 'de').toLowerCase().startsWith('de') ? 'de' : 'en';
    const lang = await askLanguage(browserLang);
    await commitLang(lang);
    if (!introSeen()) await showIntro(lang, { fixedLang: true });
  } else {
    // Aus der Datenbank gelesen, aber noch nicht gemerkt — nachtragen.
    writeStoredLang(state.config.lang);
  }

  setLang(state.config.lang);
  applyLang();

  initSlots();
  renderSlots();
  renderPalette();
  $('#palette-search').addEventListener('input', renderPalette);
  $('#free-text').addEventListener('input', updateSave);

  // Auch der freie Text lässt sich sprechen — dort lohnt es sich am meisten.
  $('#free-mic').append(micFor($('#free-text'), 'mic-free'));

  // Erzählen ist der Ausgangspunkt: Das hier ist zuerst ein Tagebuch.
  setEntryMode(readStoredMode() || 'journal');

  if (state.storageOk && !state.config.seeded) {
    const existing = await db.listEntries();
    if (!existing.length) await seedDemo(state.config.lang);
    state.config = await db.saveConfig({ seeded: true });
  }

  await refresh();
  await renderSettings();
  renderStorageBanner();

  window.claude?.use?.('downloads')
    ?.then(ns => { downloads = ns; renderSettings(); })
    .catch(() => {});

  db.requestPersistence().catch(() => {});

  // Nach der Sprachwahl, einmal: was hinter den drei Teilen steckt. Auch wer
  // die App schon kennt, bekommt ihn einmal — die Begründungen sind neu.
  if (!walkSeen()) startWalkthrough();
}

/**
 * Wenn nichts gespeichert werden kann, muss das ganz oben stehen und nicht in
 * den Einstellungen vergraben sein — sonst schreibt jemand einen Abend lang
 * Einträge, die beim Schließen verschwinden.
 */
function renderStorageBanner() {
  const host = $('#storage-banner');
  if (!host) return;
  host.textContent = '';
  if (state.storageOk) { host.hidden = true; return; }

  host.hidden = false;
  const reason = state.storageReason;
  const title = reason === 'blocked' ? 'storage.blockedTitle'
    : reason === 'newer' ? 'storage.newerTitle' : 'storage.offTitle';
  const body = reason === 'blocked' ? 'storage.blockedBody'
    : reason === 'newer' ? 'storage.newerBody' : 'storage.offBody';

  host.append(el('div', { class: 'warn warn--alert', style: 'margin:0' },
    el('h3', {}, t(title)),
    el('p', {}, t(body)),
    el('div', { style: 'margin-top:10px' },
      el('button', {
        class: 'btn btn--tiny', type: 'button',
        onclick: async ev => {
          const button = ev.currentTarget;
          button.disabled = true;
          button.textContent = t('storage.retrying');
          const again = await db.retryStorage();
          if (again.ok) {
            state.storageOk = true;
            state.storageReason = null;
            state.config = await db.loadConfig();
            if (!state.config.langChosen) {
              await db.saveConfig({ lang: state.config.lang, langChosen: true });
            }
            setLang(state.config.lang);
            applyLang();
            await refresh();
            await renderSettings();
            renderStorageBanner();
            toast(t('storage.recovered'));
          } else {
            state.storageReason = again.reason;
            renderStorageBanner();
            toast(t('storage.stillBlocked'));
          }
        }
      }, t('storage.retry')))));
}

boot().catch(err => {
  console.error('boot', err);
  document.body.innerHTML =
    `<div style="padding:32px;font-family:system-ui;color:#23282c;background:#f7f3e8;height:100vh">
       <h1 style="font-size:1.2rem;margin:0 0 8px">Start fehlgeschlagen</h1>
       <p style="color:#565f66;margin:0">${esc(err.message)}</p>
     </div>`;
});
