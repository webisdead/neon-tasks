# Persönliche To-do-Liste

## Ziel und Umfang
Eine direkt nutzbare, deutschsprachige To-do-Liste für den persönlichen Alltag. Die App wird mit Vite, React und Tailwind CSS gebaut. Sie benötigt keinen Login und keinen Server für die Datenhaltung.

## Oberfläche
Eine mobile-first gestaltete Seite mit dem Titel „Meine Aufgaben“, einem Eingabefeld und einer Schaltfläche zum Hinzufügen. Darunter stehen die Aufgaben, die Anzahl offener Aufgaben und die Filter „Alle“, „Offen“ und „Erledigt“. Das Design hat eine Cyberpunk-Anmutung: dunkler Hintergrund, Neon-Akzente in Cyan und Pink, gut lesbare Typografie und kantige Panels. Eine eigens erstellte isometrische 8-Bit-Stadtszene ergänzt die Oberfläche. Die Pixelgrafik wird lokal als SVG eingebunden, ohne externe Bilddienste. Auf kleinen Bildschirmen ab 320 Pixel Breite bleibt die App ohne horizontales Scrollen nutzbar; die wichtigsten Bedienelemente sind mindestens 44 Pixel hoch. Dekorative Grafiken sind für Screenreader verborgen.

## Verhalten
- Aufgaben lassen sich per Enter oder Schaltfläche hinzufügen. Leere oder ausschließlich aus Leerzeichen bestehende Eingaben werden ignoriert.
- Jede Aufgabe kann abgehakt, wieder geöffnet und einzeln gelöscht werden.
- Die Filter ändern nur die sichtbaren Aufgaben, nicht die gespeicherten Daten.
- Neue Aufgaben werden oben eingefügt. Erledigte Aufgaben bleiben bis zur Löschung erhalten.
- Die App zeigt passende Hinweise bei einer leeren Liste oder einem leeren Filter.

## Technische Umsetzung
Vite startet und baut die React-App. Tailwind CSS wird über das Vite-Plugin eingebunden. React verwaltet Aufgaben und den aktiven Filter. Jede Aufgabe besitzt eine eindeutige ID, einen Text und einen Erledigt-Status. Eine kleine Speicherfunktion liest und schreibt die Aufgaben in localStorage. Ungültige gespeicherte Daten führen zu einer leeren Liste; bei nicht verfügbarem Speicher bleibt die App im aktuellen Tab nutzbar und zeigt einen kurzen Hinweis.

## Bedienbarkeit
Semantische Formulare, beschriftete Eingaben und Checkboxen, verständliche Namen für Löschschaltflächen sowie sichtbare Tastatur-Fokuszustände. Die Liste startet leer, ohne vorgefertigte persönliche Aufgaben.

## Prüfung und Ergebnis
Der Produktionsbuild muss erfolgreich sein. Im Browser werden Hinzufügen, Abhaken, Wiederöffnen, Löschen, Filtern und Wiederherstellung nach dem Neuladen geprüft. Zusätzlich werden eine schmale Bildschirmbreite und die Tastaturbedienung überprüft. Abschließend läuft der Vite-Entwicklungsserver mit Zugriff aus der Arbeitsumgebung; Startbefehl und erreichbare Adresse werden angegeben.
