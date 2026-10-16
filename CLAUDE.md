# Arbeitsweise in diesem Projekt

## Zwei Stufen: Arbeitsstand und öffentliche Fassung

- **`main` ist die öffentliche Fassung.** GitHub Pages veröffentlicht nur `main` unter
  https://ryanodo-twentysix.github.io/Tiefenjournal/ — das ist die Adresse, die
  Arbeitgeber bekommen.
- **Entwickelt wird auf einem eigenen Branch** (in Claude-Sitzungen der zugewiesene
  `claude/…`-Branch). Jede Änderung wird dort committet und gepusht; das ist die
  Sicherung, nicht die Veröffentlichung.
- **Nach `main` kommt eine Änderung nur, wenn Ryan es ausdrücklich sagt** — mit „push“,
  „veröffentlichen“ oder indem er in der Rückfrage „Veröffentlichen“ wählt. Dann:
  `main` holen, den Arbeitsbranch per Fast-Forward (sonst Merge-Commit) einbringen,
  `main` pushen, kurz prüfen, dass der Pages-Lauf erfolgreich war.
- Nach jeder abgeschlossenen Änderung fragen, ob sie veröffentlicht werden soll
  (als Auswahl mit Knöpfen, nicht nur als Text). Ohne Antwort bleibt sie unveröffentlicht.

## Artefakt

Die Vorschau auf claude.ai (https://claude.ai/artifact/L7of7ipjQ6MysuYF9nEtgf) wird bei
jeder Änderung mit aktualisiert. Sie ist privat und dient zum Ausprobieren auf dem Tablet.
Das Artefakt bekommt `index.html` nur als Körper (ohne `<html>/<head>`-Gerüst), weil der
Dienst selbst ein Gerüst darumlegt; Titel, Beschreibung und Stylesheet-Links bleiben drin.

## Vor jedem Push

- `node --check` für geänderte JS-Dateien
- Im Browser durchklicken (Playwright, Chromium ist installiert), Tablet- und Telefonbreite
- `core/analyze.js` hat CRLF-Zeilenenden — beim Bearbeiten erhalten
