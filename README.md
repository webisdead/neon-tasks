# NEON / TASKS

Eine mobile-first To-do-Liste mit deutscher Oberfläche, Neon-Akzenten und einer lokalen isometrischen SVG-Pixelstadt. Aufgaben hinzufügen (Enter oder Plus), abhaken, wieder öffnen, löschen und mit Alle / Offen / Erledigt filtern.

## Start

```sh
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Die App ist unter http://localhost:5173 erreichbar. Aus der Arbeitsumgebung: http://<Host-IP>:5173.

```sh
npm test
npm run build
```

Aufgaben werden ausschließlich im Browser unter `neon-tasks:v1` gespeichert. Bei blockiertem Speicher bleibt die App im aktuellen Tab nutzbar und zeigt einen Hinweis. Ungültige gespeicherte Daten werden als leere Liste behandelt. Ohne vorgefertigte Aufgaben, Login oder Datenserver.

## GitHub Pages

Deployment-Adresse: https://webisdead.github.io/neon-tasks/

Unter **Settings → Pages → Build and deployment → Source** im Repository **GitHub Actions** auswählen. Der Workflow `.github/workflows/deploy-pages.yml` installiert mit `npm ci`, führt die Tests aus und veröffentlicht den Vite-Build bei jedem Push auf `main`. Er kann auch unter **Actions → Deploy to GitHub Pages → Run workflow** manuell gestartet werden.

Produktions-Builds verwenden den Projektpfad `/neon-tasks/`; der lokale Entwicklungsserver bleibt unter `/` erreichbar. Den Produktions-Build lokal prüfen:

```sh
npm run build
npm run preview -- --port 4173
```

Die Vorschau ist unter http://localhost:4173/neon-tasks/ erreichbar.
