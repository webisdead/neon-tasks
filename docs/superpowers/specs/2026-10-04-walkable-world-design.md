# NEON TASKS — Begehbarer Fokusraum

## Ziel und Freigabe
Die App wird zu einer betretbaren 3D-Welt. Die freie Gestaltungs- und Umsetzungsfreigabe sowie Subagenten-Ausführung und GitHub-Pages-Veröffentlichung bestehen weiter. Die bisherige Seitenkomposition wird durch eine bildschirmfüllende räumliche Erfahrung ersetzt.

## Raum und Interaktion
Ein räumlich lesbarer Neon-Hof mit Boden, Kolonnaden, beleuchteten Aufgabenstationen, einem Shader-Portal und einer echten Position der Kamera. Eine kleine Eintrittsansicht liegt über der Welt; „Raum betreten“ wechselt zur Navigation aus Augenhöhe. Danach gibt es keine große Überschrift, feste Aufgaben-Seitenleiste oder Seitenscrollfläche. Nur ein sparsames HUD, Blickziel und situationsbezogene Aktionen bleiben sichtbar.

Desktop: WASD/Pfeiltasten bewegen relativ zur Blickrichtung; Maus oder Ziehen dreht den Blick. Pointer Lock ist eine optionale Verbesserung nach bewusstem Klick, keine Voraussetzung. E oder eine sichtbare Interaktionsschaltfläche öffnet ein nahes Ziel. Escape gibt die Steuerung frei. Smartphone: Bewegungsstick und Wischen zum Umsehen; Bedienelemente mindestens44 Pixel. Begrenzung und Hindernisse verhindern das Verlassen des Bodens oder Durchlaufen solider Stationen. Bewegung stoppt bei Pause, Dialog, Fokusverlust und verstecktem Tab.

Aufgaben stehen als physische holografische Objekte im Raum. Es erscheinen maximal zwölf gleichzeitig. Über ein abrufbares Aufgaben-Terminal sind alle Aufgaben erreichbar; „Im Raum finden“ macht auch eine ältere ausgewählte Aufgabe räumlich zugänglich. Ein funktionales Erstell-Terminal ist immer vorhanden, auch bei leerer Liste. Texturen für Karten werden lokal aus tatsächlichen Aufgaben erstellt. Es gibt keine Demo-Aufgaben.

## Aufgabensteuerung
Interaktion öffnet einen fokussierten Dialog für die gewählte Aufgabe. Hinzufügen, Erledigen, Wiederöffnen, Löschen und Listenfilter bleiben erhalten. Ein Dialog pausiert die Navigation, besitzt korrektes Fokusverhalten und bleibt mit Tastatur bedienbar. Listenfilter betreffen das Aufgaben-Terminal; die Welt zeigt tatsächliche Aufgaben unabhängig davon. Existing IDs/Text/Erledigt-Status und `neon-tasks:v1` bleiben unverändert. Lange Texte sind im Dialog vollständig lesbar.

## Grafik und Robustheit
Eigene GLSL-Effekte für Portal/Boden/Hologramme und lokalisierte Impulse bei Aufgabenaktionen. Kein externes Asset erforderlich. Pixelratio höchstens1.5, begrenzte Partikel, maximal zwölf Aufgabenobjekte. Ressourcen werden nach IDs wiederverwendet; Eingabe und HUD-Änderungen erzeugen keine neue Geometrie. Reduzierte Bewegung startet mit Ambient-Effekten aus; bewusste Navigation bleibt funktional. Ohne Bewegung und Ambient-Effekte gibt es keine dauerhafte Render-Schleife. Versteckte Tabs pausieren; Context-Verlust, Modulfehler oder fehlendes WebGL lassen Aufgaben über Dialoge zugänglich.

## Prüfung und Lieferung
Navigation wird mit sinnvollen Tests für Blickrichtung, Geschwindigkeit, diagonale Eingabe, Grenzen, Kollision und Aufgaben-Auswahl getestet. Browserprüfung belegt echte Änderung der Kameraposition, Dialog-Pause, Tastatureingabe ohne Bewegung, Escape, Touch-Steuerung, Task-Flows, Persistenz, Fallback und320/390 Pixel. Screenshots zeigen eine bildschirmfüllende Welt. Unabhängige Codeprüfung, Produktionsbuild, Pages-Workflow und Live-Prüfung schließen die Arbeit ab.
