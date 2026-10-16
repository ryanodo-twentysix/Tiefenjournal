# Tiefenjournal

Ein Journal, das Fragen stellt statt Antworten gibt.

**▶ App ausprobieren: https://ryanodo-twentysix.github.io/Tiefenjournal/**

Läuft im Browser, auf Telefon, Tablet und Rechner. Kein Konto, kein Server: Alle Einträge bleiben im Browser des Geräts. Beim ersten Öffnen legt die App einen kurzen Beispielverlauf an, damit sich die Auswertungen sofort ansehen lassen.

## Worum es geht

Drei Schritte, die aufeinander aufbauen:

1. **Genauer benennen.** 136 Gefühlswörter statt „gut“ und „schlecht“, jedes mit einem „weil“. Feinere Unterscheidung von Gefühlen hängt mit besserer Emotionsregulation zusammen (Kashdan, Barrett & McKnight 2015).
2. **Widersprüche halten.** Die App erkennt wiederkehrende Muster und zeigt Gefühle, die gegeneinander ziehen, als Venn-Diagramm: In der Mitte stehen die Tage, an denen beides zugleich da war. Grundlage ist u. a. Vaillants Ordnung der Abwehrmechanismen (Vaillant 1992).
3. **Nachfragen.** Ein sokratischer Dialog, der die eigenen Einträge gelesen hat und Fragen stellt statt Ratschläge zu geben.

Ein Rundgang nach der Sprachwahl erklärt die drei Schritte direkt in der App, mit den Studien dahinter.

## Technik

- Reines HTML, CSS und JavaScript (ES-Module), ohne Framework und ohne Build-Schritt
- Speicherung in IndexedDB, vollständig lokal; Export und Import als JSON
- Spracherkennung mit Whisper (transformers.js) in einem Web Worker, auf dem Gerät
- Musteranalyse, Spannungsfelder und Dialog regelbasiert in `core/`
- Deutsch und Englisch, fünf Farbpaletten (eine dunkle), fünf Formvarianten

Lokal starten:

```sh
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

## English

A journal that asks questions instead of giving answers. **Try it: https://ryanodo-twentysix.github.io/Tiefenjournal/** (German and English). It runs entirely in the browser: no account, no server, all entries stay on the device. Three steps: name feelings precisely, hold contradictions (shown as Venn diagrams), and explore patterns in a Socratic dialogue. Built with plain HTML, CSS and JavaScript modules, IndexedDB and on-device Whisper speech recognition.

## Hinweis

Kein Medizinprodukt und kein Ersatz für Therapie.

## Lizenz

Copyright (C) 2026 Ryan O´Donnell. Alle Rechte vorbehalten.
Der Code ist öffentlich einsehbar und die App darf benutzt und beurteilt werden. Kopieren, Verändern, Weitergeben oder eigenes Hosten nur mit schriftlicher Zustimmung. Details in [LICENSE](LICENSE).
