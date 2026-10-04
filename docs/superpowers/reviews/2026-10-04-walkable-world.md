# Begehbarer Neon-Hof: Prüfung und Entscheidungen

Die Hauptansicht ist eine bildschirmfüllende Welt aus der Ego-Perspektive. WASD/Pfeiltasten und Mausziehen bewegen die Kamera; auf dem Smartphone übernehmen Stick und Wischen. Reale Aufgaben erscheinen an holografischen Stationen. Ein abrufbares Terminal bietet Erstellen, Erledigen, Wiederöffnen, Löschen, Filter und vollständige Texte. Dialoge, Pause, Fokusverlust und versteckte Tabs stoppen die Navigation. Persistenz und Speicherformat bleiben unverändert.

## Entscheidungen in ihrer Reihenfolge

1. Die bestehende freie Gestaltungsfreigabe umfasst den dokumentierten Wechsel zur Ego-Perspektive sowie Subagenten und Veröffentlichung. Bei einer falschen gestalterischen Wahl entsteht Aufwand für eine visuelle Revision.
2. Die Welt ist ein begrenzter Neon-Hof mit höchstens zwölf Aufgabenstationen und einem Terminal für alle Aufgaben. Das hält Grafikaufwand und Navigation überschaubar. Die Abwägung ist ein begrenzter räumlicher Umfang; ältere ausgewählte Aufgaben bleiben durch „Im Raum finden“ erreichbar.

## Prüfung

- Unabhängige Aufgaben-Reviews bestätigen Spezifikation und Qualität. Die Abschlussprüfung fand vier konkrete Punkte, die in einem gemeinsamen Korrektur-Commit 29f4dc0 behoben wurden: gültige zugängliche Weltbezeichnung, Safe Areas auf Mobilgeräten, Cleanup bei teilweise gescheiterter Initialisierung und Kollision am Portal.
- Finale unabhängige Ausführung: `npm test` mit 23/23 erfolgreichen Tests, `npm run build` erfolgreich, `git diff --check` ohne Befund.
- Tatsächliche WebGL-Kamera bewegt sich nach Eintritt; die Seitenüberschrift entfällt. Ein geöffneter Erstell-Dialog hält die Position exakt an und fokussiert das Textfeld. Erstellen, Speichern, Erledigen und Reisen zur Station wurden unabhängig bedient.
- Browserprüfungen decken Desktop und native Touch-Eingaben bei 320/390 Pixeln, ältere Aufgaben, lange Texte, Filter, Persistenz, reduzierte Bewegung, fehlendes WebGL, blockierten Speicher, Ladefehler, Escape und Fokusverlust ab.
- Korrekturprüfung: sieben tatsächliche WebGL-Cleanup-Szenarien, fünf Portal-Annäherungen sowie Querformat 844×390 mit asymmetrischen simulierten Safe Areas. HUD, Stick und Dialog liegen innerhalb des sicheren Rechtecks; Touch verändert die Kamera.
- Nach der Korrektur meldet die unabhängige axe-Prüfung der Weltansicht null Verstöße. Kontraste über Verläufen bleiben automatisch teilweise unbestimmt.

## Grenzen

Die Browserprüfungen verwenden Chromium mit Software-WebGL und emulierten Touch-Eingaben. Leistung auf physischen Smartphones und unterschiedliche Pointer-Lock-Implementierungen wurden nicht vermessen. Die Three.js-Datei wird lazy geladen und ist komprimiert etwa 135 kB groß; Vite meldet weiterhin seine Warnung für einen unkomprimierten Chunk über 500 kB. Dies ist keine universelle Barrierefreiheits- oder Kontrastzertifizierung.

## Veröffentlichung

Die gezielte unabhängige Nachprüfung des Korrektur-Commits bestätigt alle vier Befunde als behoben und gibt den Stand frei. Der Stand wurde auf main übernommen und veröffentlicht.

[Pages-Workflow 37214923008](https://github.com/webisdead/neon-tasks/actions/runs/37214923008) war erfolgreich (Build und Deployment). Die Live-Prüfung unter https://webisdead.github.io/neon-tasks/ bestätigte die aktuellen Produktions-Assets, WebGL bereit, Eintritt aus der Übersicht in die Ego-Perspektive, echte WASD-Kamerabewegung von z=10 nach z=9.4 und keinen Seitenscroll. Ein geöffneter Aufgaben-Dialog hält die Kamera exakt bei z=9.4 und fokussiert das Textfeld. Keine Browser-Laufzeitfehler.

Die gezielten Korrekturbelege liegen unter [walkable-world-evidence](walkable-world-evidence/final-fix-report.md); temporäre Koordinationsdaten wurden nach Abschluss archiviert.
