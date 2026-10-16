# Tiefenjournal

**[English](#english) · [Deutsch](#deutsch)**

**▶ Try the app · App ausprobieren: https://ryanodo-twentysix.github.io/Tiefenjournal/**

---

## English

A journal that asks questions instead of giving answers.

Tiefenjournal runs in the browser on phone, tablet and computer. No account, no server: every entry stays in the browser on your device. On first launch the app creates a short sample history, so the pattern views can be explored right away.

### What it does

Three steps that build on each other:

1. **Name it precisely.** 136 feeling words instead of "good" and "bad", each with a "because". Telling feelings apart more finely is linked with better emotion regulation (Kashdan, Barrett & McKnight 2015).
2. **Hold contradictions.** The app recognises recurring patterns and shows feelings that pull against each other as a Venn diagram: the middle holds the days when both were present at once. It draws on Vaillant's hierarchy of defence mechanisms, among other sources (Vaillant 1992).
3. **Ask further.** A Socratic dialogue that has read your own entries and asks questions instead of giving advice.

A guided tour after the language choice explains the three steps inside the app, along with the research behind them. Entries can also be recorded without words, as a drawing or a voice recording.

### How it is built

- Plain HTML, CSS and JavaScript (ES modules); no framework, no build step
- Storage in IndexedDB, entirely local; export and import as JSON
- Speech recognition with Whisper (transformers.js) in a Web Worker, on the device
- Pattern analysis, tension fields and dialogue are rule-based (`core/`)
- German and English, five colour palettes (one dark), five shape styles

Run locally:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

### Note

Not a medical device and no replacement for therapy.

### Copyright and licence

Copyright © 2026 Ryan O´Donnell. All rights reserved.

The source code is publicly viewable, and the app may be used and assessed, for example as part of a hiring process. Copying, modifying, redistributing or hosting the code requires prior written permission. Full terms: [LICENSE](LICENSE).

---

## Deutsch

Ein Journal, das Fragen stellt statt Antworten gibt.

Tiefenjournal läuft im Browser auf Telefon, Tablet und Rechner. Kein Konto, kein Server: Alle Einträge bleiben im Browser deines Geräts. Beim ersten Öffnen legt die App einen kurzen Beispielverlauf an, damit sich die Mustererkennung sofort ansehen lässt.

### Was die App macht

Drei Schritte, die aufeinander aufbauen:

1. **Genauer benennen.** 136 Gefühlswörter statt „gut“ und „schlecht“, jedes mit einem „weil“. Feinere Unterscheidung von Gefühlen hängt mit besserer Emotionsregulation zusammen (Kashdan, Barrett & McKnight 2015).
2. **Widersprüche halten.** Die App erkennt wiederkehrende Muster und zeigt Gefühle, die gegeneinander ziehen, als Venn-Diagramm: In der Mitte stehen die Tage, an denen beides zugleich da war. Grundlage ist u. a. Vaillants Ordnung der Abwehrmechanismen (Vaillant 1992).
3. **Nachfragen.** Ein sokratischer Dialog, der die eigenen Einträge gelesen hat und Fragen stellt statt Ratschläge zu geben.

Ein Rundgang nach der Sprachwahl erklärt die drei Schritte direkt in der App, mit der Forschung dahinter. Einträge lassen sich auch ohne Worte festhalten, als Zeichnung oder Sprachaufnahme.

### Wie sie gebaut ist

- Reines HTML, CSS und JavaScript (ES-Module), ohne Framework und ohne Build-Schritt
- Speicherung in IndexedDB, vollständig lokal; Export und Import als JSON
- Spracherkennung mit Whisper (transformers.js) in einem Web Worker, auf dem Gerät
- Musteranalyse, Spannungsfelder und Dialog regelbasiert (`core/`)
- Deutsch und Englisch, fünf Farbpaletten (eine dunkle), fünf Formvarianten

Lokal starten:

```sh
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

### Hinweis

Kein Medizinprodukt und kein Ersatz für Therapie.

### Urheberrecht und Lizenz

Copyright © 2026 Ryan O´Donnell. Alle Rechte vorbehalten.

Der Quellcode ist öffentlich einsehbar, und die App darf benutzt und beurteilt werden, etwa in einem Bewerbungsverfahren. Kopieren, Verändern, Weitergeben oder eigenes Hosten des Codes nur mit vorheriger schriftlicher Zustimmung. Vollständige Bedingungen: [LICENSE](LICENSE).
