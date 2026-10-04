# NEON / TASKS

Ein begehbarer Neon-Hof für deine Aufgaben. Die bildschirmfüllende Three.js-Welt hat echte Kamerabewegung, physische Aufgabenstationen und eigene GLSL-Effekte. Eine kleine Eintrittsansicht führt hinein; im Raum bleiben nur HUD, Zielaktion und mobile Steuerung sichtbar. Keine externen Grafik-Assets und keine Demo-Aufgaben.

WASD oder Pfeiltasten bewegen dich, Ziehen mit der Maus dreht den Blick. Optional aktiviert „Maus umsehen“ Pointer Lock. E oder die Zielaktion öffnet eine nahe Station. Auf Smartphones bewegst du dich mit dem Stick und siehst dich durch Wischen um. Escape, Dialoge, Fokusverlust und versteckte Tabs pausieren die Navigation. Das Hilfe-Menü erklärt die Steuerung und führt zum Eingang zurück.

„Aufgaben“ öffnet das Terminal mit allen Aufgaben und den Filtern Alle / Offen / Erledigt. Aufgaben lassen sich erstellen, erledigen, wieder öffnen und löschen; der Detaildialog zeigt vollständige Texte. „Im Raum finden“ führt auch zu älteren Aufgaben. Höchstens zwölf tatsächliche Aufgabenstationen erscheinen gleichzeitig. Der Erstellpunkt bleibt auch im leeren Raum verfügbar.

Ambient-Effekte starten entsprechend `prefers-reduced-motion` und lassen sich im Pause-Menü umschalten. Bewusste Navigation bleibt immer möglich. Ohne Ambient-Effekte und aktive Bewegung stoppt die Render-Schleife. Die Pixeldichte ist auf 1.5 begrenzt. Ohne WebGL, bei Kontextverlust oder einem Fehler des Grafikmoduls bleiben alle Aufgaben im Terminal erreichbar.

## Lokal starten

```sh
npm install
npm run dev -- --port 5173
npm test
npm run build
npm run preview -- --port 4173
```

Entwicklung: http://localhost:5173/. Produktionsvorschau: http://localhost:4173/neon-tasks/.

Aufgaben werden ausschließlich im Browser unter `neon-tasks:v1` gespeichert. IDs, Text und Erledigt-Status bleiben erhalten. Bei blockiertem Speicher bleibt die App im aktuellen Tab nutzbar und zeigt einen Hinweis. Ungültige gespeicherte Daten werden als leere Liste behandelt. Ohne Login oder Datenserver.

## GitHub Pages

Deployment: https://webisdead.github.io/neon-tasks/

Unter **Settings → Pages → Build and deployment → Source** im Repository **GitHub Actions** auswählen. `.github/workflows/deploy-pages.yml` installiert mit `npm ci`, führt Tests und Build aus und veröffentlicht bei jedem Push auf `main`. Der Workflow lässt sich auch manuell starten. Der Produktionspfad ist `/neon-tasks/`.
