# NEON TASKS — Task Universe

## Auftrag und Freigabe
Die bestehende mobile-first To-do-Liste wird frei gestaltet zu einer progressiven 3D-App mit Three.js und eigenen Shadern. Der Nutzer hat Gestaltung und Umsetzung ausdrücklich freigegeben („du darfst frei loslegen“); die bestehende Freigabe für GitHub Pages und die Subagenten-Ausführung gelten weiter. Entwurf, Umsetzung, Prüfung und Veröffentlichung laufen ohne weitere Entwurfsfreigaben durch.

## Erlebnis
Ein dunkler räumlicher Aufgaben-Orbit mit elektrischem Violett, Cyan und Lime. Ein schwebender, verformbarer Shader-Kern und perspektivisches Raster schaffen Tiefe. Aufgaben werden als räumliche Objekte sichtbar und lassen sich im Raum auswählen. Bewegung mit Pointer oder Touch verändert die Perspektive; die Auswahl und das Erledigen erzeugen kurze Shader-Impulse und Partikel. Der Raum zeigt maximal zwölf Aufgaben gleichzeitig und kennzeichnet diesen Ausschnitt. Alle Aufgaben sind zusätzlich in der bedienbaren Liste vorhanden.

Die Komposition ist auf dem Smartphone zuerst nutzbar: lesbarer Titel, Eingabe, großer 3D-Raum und direkt erreichbare Aufgaben. Desktop erhält eine großzügige asymmetrische Aufteilung zwischen Aufgabensteuerung und Raum. Die echte leere Liste bleibt leer; dekorative 3D-Objekte dürfen keine erfundenen Aufgaben suggerieren.

## Verhalten und Zugänglichkeit
Hinzufügen, Abhaken, Wiederöffnen, Löschen und die Filter bleiben verfügbar. Speicherung verwendet unverändert `neon-tasks:v1`, damit vorhandene Aufgaben erhalten bleiben. Leere Eingaben werden ignoriert; lange Texte umbrechen. Alle Aktionen funktionieren mit Tastatur und mindestens 44 Pixel hohen Touch-Flächen. Die räumlichen Objekte ergänzen eine semantische Aufgabenliste und klare Auswahlmarkierung.

`prefers-reduced-motion` startet mit reduzierten Effekten. Ein sichtbarer Schalter erlaubt das Ein- und Ausschalten kontinuierlicher Bewegung; Aufgaben bleiben bei ausgeschalteter Bewegung auswählbar. Ohne WebGL, beim Verlust des Kontextes oder beim Fehler des 3D-Moduls bleibt die normale Aufgabenoberfläche vollständig nutzbar. Versteckte Tabs pausieren die Render-Schleife.

## Architektur
React besitzt Aufgaben, Filter, Auswahl und Effekteinstellung. Eine lazy geladene `TaskUniverse`-Komponente kapselt Three.js. Ein unabhängiger Szenen-Controller verwaltet Renderer, Geometrien, GLSL-Materialien, Resize, Auswahl, Animation und vollständiges Cleanup. React erhält projizierte Positionen für zugängliche Aufgabenlabels. Shader liegen in einer eigenen Datei; das deterministische Layout ist separat und mit dem Node-Test-Runner prüfbar. Abhängigkeit ist Three.js; keine externen 3D-Assets oder Dienste.

## Performance und Deployment
Maximal zwölf Aufgabenobjekte, begrenzte Partikel und Pixelratio maximal 1.5 begrenzen die Grafiklast. Positionsupdates für React erfolgen gedrosselt, nicht bei jedem Renderframe. Die 3D-Abhängigkeit wird separat geladen. Das Produktionsziel bleibt `https://webisdead.github.io/neon-tasks/`; sämtliche Pfade funktionieren unter `/neon-tasks/`.

## Prüfung
Speicherprüfungen, sinnvolle Layoutprüfungen und Produktionsbuild müssen bestehen. Browserprüfung mit WebGL: sichtbare Shader und Aufgabenobjekte, Auswahl im Raum, gesamter Aufgabenfluss, Speicherung nach Neuladen, 320/390 Pixel Breite, lange Texte, Tastatur und Effektschalter. Zusätzliche Prüfung ohne WebGL und mit reduzierter Bewegung. Unabhängige Codeprüfung vor Veröffentlichung; anschließend Live-Prüfung auf GitHub Pages.
