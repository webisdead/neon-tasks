# Walkable World Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Existing free-design and Pages authorization apply.

**Goal:** Eine echte begehbare Welt statt einer Website mit eingebettetem 3D-Fenster.

**Architecture:** React besitzt Aufgaben und Eintritt/Dialogs/Effekte. Lazy `TaskWorld` kapselt einen Three.js-Controller mit eigener Kamera-Navigation. Shader und reine Navigations-/Slot-Funktionen sind separat.

**Tech Stack:** Vite, React, Tailwind, Three.js, GLSL, CanvasTexture, Node-Test-Runner, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-04-walkable-world-design.md`

## Global Constraints
- Bildschirmfüllend100dvh, ohne klassische Seitenleiste und Seitenscrollen;320 Pixel und44 Pixel Bedienelemente.
- Tatsächliche Kamerabewegung: Desktop-Tasten/Maus und mobile Bewegung/Wischen.
- Navigation stoppt bei Dialog/Pause/Blur/hidden; Eingabe in Formularen bewegt die Kamera nicht.
- Zwölf reale Aufgabenstationen maximal; alle Aufgaben im abrufbaren Terminal und ältere Auswahl im Raum auffindbar.
- Eigene Shader, begrenzte Partikel, DPR höchstens1.5, keine externen Assets.
- Wiederverwendung von Geometrie und Texturen; vollständiges Cleanup inklusive Pointer Lock und Listener.
- Ambient-Schalter und reduced-motion beeinflussen keine bewusst gesteuerte Navigation.
- Speicherkey `neon-tasks:v1`, Schema und Produktionspfad `/neon-tasks/` unverändert.

## Review Focus
- Festgehaltene Tasten/Stick beim Öffnen eines Dialogs oder Tabwechsel dürfen kein Weiterlaufen verursachen.
- Pointer-Lock-Verweigerung muss Ziehen und Tastatur erlauben; absichtliches Freigeben darf den Dialog nicht überschreiben.
- Input-Text mit WASD darf keine Navigation auslösen.
- Ältere ausgewählte Aufgaben müssen trotz Zwölf-Grenze im Raum auffindbar sein.
- Keine Bewegung ohne Render-Schleife bei Ambient aus; gleichzeitig keine Idle-Endlosschleife.

### Task 1: Welt und Navigation

**Files:** `src/world/TaskWorld.jsx`, `src/world/world.js`, `src/world/navigation.js`, `src/world/navigation.test.js`, `src/world/shaders.js`, `package.json` Testskript.

**Interface:** Default `TaskWorld` mit React-ref und Props `{tasks, selectedId, entered, paused, effectsEnabled, movement, travelRequest, pulse, onInteract, onCreate, onTarget, onPause, onReady}`. `movement={x,y}`: x seitlich rechts, y vorwärts; `travelRequest={id,sequence}`. `onInteract(id)`, `onCreate()`, `onTarget({kind:'task',id}|{kind:'create'}|null)`, `onPause()`, `onReady(boolean)`. Ref: `{capturePointer(), releasePointer(), resetView()}`. Task-Schema bleibt `{id,text,completed}`.

- [ ] Reine Navigation und Slot-Auswahl mit echten Verhaltensprüfungen zuerst testen: yaw0 vorwärts nach-z, yawPI/2 nach-x, diagonale Geschwindigkeit begrenzt, Boden-/Kreis-Kollision, dt begrenzt, leere/zwölf/ältere ausgewählte Aufgabe korrekt.
- [ ] Räumlichen Hof, Shader-Portal, funktionales Erstell-Terminal und physische Aufgabenstationen bauen; lokale CanvasTexture-Titel und richtige IDs.
- [ ] Kamera/Input/Pointer/Touch/Interaktion und Näherungsziel implementieren. Update von Aufgaben und Status wiederverwendet GPU-Objekte; Reise zur ausgewählten Station möglich.
- [ ] Wrapper, Cleanup, Context-Verlust, Animation/Navigation bei Ambient aus, hidden/blur und Dialog-Pause prüfen. Controller stellt `getState()` für kontrollierte Smoke-Prüfung bereit; Kameraposition darf als Canvas-data-Attribut zur Browserprüfung verfügbar sein.
- [ ] Testskript um Navigation erweitern, Tests/Build und tatsächlichen World-Smoke prüfen; Commit und Schnittstellenbericht. Alte Szene bleibt bis Task2-Integration erhalten.

### Task 2: Betreten, HUD und Aufgaben-Terminal

**Files:** `src/App.jsx`, `src/index.css`, optionale fokussierte UI-Komponenten, `README.md`, `index.html`, `package.json` Testskript; obsolete `src/scene/*` nach Integration entfernen.

**Interface:** Verwendet `TaskWorld` und Ref aus Task1. React hält Dialogzustand und stoppt dafür Navigation; Auswahl und Reisen referenzieren echte Aufgaben-IDs.

- [ ] Vollbild-Welt mit kleiner Eintrittsansicht gestalten; nach Eintritt nur HUD, Zielaktion, Hilfe und mobile Navigation. Keine alte Hero-/Sidebar-/Listenkomposition im Normalzustand.
- [ ] Touch-Stick, Blicksteuerung und zugängliche Dialoge für Erstellen, ausgewählte Aufgabe, alle Aufgaben, Hilfe/Pause integrieren. Pointer Lock nur bewusst anfordern, ohne Voraussetzung für Navigation.
- [ ] Bestehende Speicher-/Aufgabenflows, Filter und ältere Aufgaben-Auswahl erhalten; WebGL-/Boundary-Fallback mit weiterhin zugänglichen Aufgaben.
- [ ] Alte Orbit-Szene entfernen, Testskript auf Speicher plus neue Navigation umstellen, Build und Browser prüfen: tatsächlicher Walk, Look, Interaktion, Pause beim Dialog/WASD-Text, Blur/Escape, mobile320/390, volle Texte, Persistenz, reduced-motion und kein WebGL.
- [ ] Final Screenshots, Bericht und Commit anfertigen; Preview für Root verfügbar lassen.

### Abschluss
- [ ] Separate Task- und Gesamtprüfung, nötige Korrekturen und Abschlussprüfungen.
- [ ] Geprüften Stand auf main veröffentlichen, Pages-Erfolg und Live-Welt prüfen.
