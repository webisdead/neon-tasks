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
