# Task Universe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. User authorized autonomous design, implementation and established Pages publication.

**Goal:** Die bestehende To-do-Liste in einen bedienbaren 3D-Aufgabenraum mit Three.js und GLSL verwandeln.

**Architecture:** React besitzt Nutzerdaten; eine lazy geladene Komponente kapselt den Three.js-Controller. Shader und deterministisches Layout sind eigenständige Module.

**Tech Stack:** Vite, React, Tailwind, Three.js, GLSL, Node-Test-Runner, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-04-task-universe-design.md`

## Global Constraints
- Deutsche mobile-first Oberfläche ab 320 Pixel; Aufgabenaktionen mindestens 44 Pixel hoch.
- Speicherung unverändert unter `neon-tasks:v1`, inklusive Fehlerbehandlung.
- Maximal zwölf Aufgabenobjekte im Raum; alle Aufgaben in der Liste erreichbar.
- Eigene GLSL-Shader, echte räumliche Aufgabenobjekte, Auswahl per Raum und zugängliche Labels.
- Effektschalter, reduced-motion, pausierter versteckter Tab und vollständig nutzbarer WebGL-Fallback.
- Pixelratio maximal 1.5 und gedrosselte React-Positionsupdates.
- Produktionspfad `/neon-tasks/`; keine externen 3D-Assets oder Bilddienste.

## Review Focus
- Gespeicherte Alt-Aufgaben und sehr lange Texte müssen erhalten und bedienbar bleiben.
- Große Aufgabenlisten dürfen keine unbegrenzten GPU-Objekte erzeugen.
- StrictMode, Resize und Context-Verlust dürfen keine doppelten Render-Schleifen hinterlassen.
- Ausgeschaltete Bewegung darf Auswahl und Aufgabenaktionen nicht blockieren.
- Leere Liste und gefilterte Listen dürfen keine erfundenen Aufgabendaten anzeigen.

### Task 1: Three.js-Aufgabenraum

**Files:** `package.json`, `package-lock.json`, `src/scene/TaskUniverse.jsx`, `src/scene/universe.js`, `src/scene/shaders.js`, `src/scene/layout.js`, `src/scene/layout.test.js`.

**Interfaces:** `TaskUniverse({tasks, selectedId, onSelect, effectsEnabled, pulse, onReady})`; tasks haben unverändert `{id,text,completed}`. `pulse` ist optional `{id,kind,sequence}`. `onSelect(id)` wählt eine echte Aufgabe. `onReady(boolean)` meldet den Grafikzustand. Wrapper besitzt projizierte, zugängliche Label-Schaltflächen.

- [x] Layoutprüfungen zuerst schreiben und Fehlschlag beobachten: leere Eingabe ergibt keine Aufgabenobjekte; mehr als zwölf Aufgaben bleiben auf zwölf begrenzt; Positionen sind endlich und deterministisch; IDs bleiben den richtigen Aufgaben zugeordnet.
- [x] Three.js installieren und das Scene-Modul samt eigenen Kern-/Raster-Shadern implementieren; sichtbare räumliche Aufgabenobjekte, Pointer/Touch-Auswahl und Event-Impulse.
- [x] Wrapper implementieren, Lifecycle und Fallback behandeln; ResizeObserver, Listener, GPU-Ressourcen und Frame-Schleife vollständig aufräumen.
- [x] `npm test` und `npm run build` prüfen. Testskript erweitert auf Speicher- und Layoutprüfungen. Commit und Bericht mit Schnittstelle anfertigen.

### Task 2: Progressive Aufgabenoberfläche und Integration

**Files:** `src/App.jsx`, `src/index.css`, optionale fokussierte UI-Komponenten, `README.md`, `index.html`.

**Interfaces:** Verwendet `TaskUniverse` aus Task 1; React besitzt Aufgaben, Filter, Auswahl, Effekte und Ereignis-Sequenz. Lazy/Suspense und Error Boundary halten die Liste bei Grafikfehlern nutzbar.

- [x] Die mobile und Desktop-Komposition neu gestalten: experimentelle Typografie, Neon-Materialien, räumliche Bühne, klare Liste und Eingabe; Tailwind-Utilities und lesbare CSS-Dateien verwenden.
- [x] Bestehenden Aufgabenfluss erhalten, Raum-Auswahl mit Liste synchronisieren, Erledigen mit Impuls verbinden und Effektschalter inklusive reduced-motion initialisieren.
- [x] Alle Prüfungen und Build ausführen; Produktionspreview unter `/neon-tasks/` im Browser prüfen: echte WebGL-Szene, Raum-Auswahl, Aufgabenfluss, Neuladen, 320/390 Pixel, große Liste, lange Texte, Tastatur, Fallback und Effekte aus.
- [x] Screenshots und aussagekräftige Prüfergebnisse speichern, README aktualisieren, Commit und Bericht erstellen.

### Abschluss
- [x] Unabhängige Gesamtprüfung und nötige Korrekturen durchführen.
- [ ] Geprüften Stand auf `main` integrieren, über den verfügbaren GitHub-Zugang übertragen und erfolgreichen Pages-Workflow abwarten.
- [ ] Live-App im Browser überprüfen und URL melden.
