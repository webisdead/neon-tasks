# Unerwarteter Pause-Dialog beim Laufen

## Ursache und Verhalten

React und Three.js öffneten bei Fokusverlust oder Hintergrundwechsel automatisch das Pause-Menü. Der Mausbindungs-Handler behandelte zudem einen ungebundenen Zustand als verlorene Bindung, auch wenn zuvor keine Bindung bestand. Beide Auslöser wurden vor der Änderung im Browser reproduziert.

Automatische Fokus- und Hintergrundereignisse stoppen jetzt nur die Eingaben und Render-Schleife. Sie öffnen kein Menü. Nach Rückkehr ist die Steuerung wieder verfügbar, aber Bewegung erfordert eine neue Eingabe. Escape, die Pause-Schaltfläche und der tatsächliche Verlust einer zuvor gehaltenen Mausbindung bleiben bewusste Pause-Auslöser. Absichtliches Freigeben der Maus beim Öffnen eines Aufgaben-Dialogs überschreibt den Dialog nicht.

Der Touch-Stick vergisst bei Unterbrechungen die alte Berührung und gibt Pointer Capture frei. Verwaiste Tastenwiederholungen starten keine Bewegung. Fokus- und Sichtbarkeitsrückkehr geben neutrale Stick-Eingaben wieder frei. Dadurch funktionieren auch neue Berührungen außerhalb der Stick-Mitte sofort.

## Entscheidung und Abwägung

Ein automatischer Fokuswechsel stoppt Eingaben still, weil der Nutzer keine unaufgeforderten Pause-Menüs beim Laufen möchte. Bei Rückkehr ist die Steuerung wieder verfügbar, statt auf eine Menübestätigung zu warten. Eine neue Eingabe bleibt erforderlich; gehaltene Tasten und Berührungen laufen nicht automatisch weiter.

## Prüfung

Die ursprüngliche Browserregression scheitert am unerwünschten Dialog. Der korrigierte Stand besteht Desktop- und Touch-Prüfungen im Entwicklungs- und Produktionsbuild. Die unabhängige Codeprüfung fand einen weiteren Fall: Ein neuer Stick-Kontakt außerhalb der Mitte blieb nach Fokuswechsel blockiert. Die erweiterte Regression reproduziert diesen Fehler ohne beiläufige Zielwechsel; Commit 27fcc4f behebt ihn mit gezielter Freigabe neutraler Eingaben.

Geprüft sind stiller Fokusverlust mit exakt gestoppter Kamera, Fokus-Rückkehr ohne automatisches Weiterlaufen, neue Tastatureingabe, ungebundene Mausereignisse während Bewegung, Hintergrundwechsel, echte Mausbindungs-Anforderung und Freigabe, verzögerte automatische Freigabe, Escape, Pause-Schaltfläche und Aufgaben-Dialoge. Native CDP-Touch-Eingaben decken gehaltenen Kontakt beim Fokusverlust sowie neue Kontakte außerhalb der Mitte nach Fokuswechsel, Hintergrundwechsel und Dialog-Schließen ab.

Die gezielte unabhängige Nachprüfung bestätigt den gefundenen Randfall als behoben, findet keine neue Beschädigung und gibt Commit 27fcc4f zur Veröffentlichung frei.

23 bestehende Tests, Produktionsbuild und Diff-Prüfung sind erfolgreich. Die unabhängige Produktionsvorschau bestätigt stillen Stopp ohne Dialog und ohne Wiederanlauf durch eine alte Tastenwiederholung.

Die Tests verwenden Chromium/SwiftShader. Fokus- und Sichtbarkeitsbedingungen sind kontrolliert ausgelöste Browserereignisse; Touch-Eingaben und Mausbindung werden über native Browserfunktionen geprüft. Ein physisches iOS-Gerät und Safari stehen hier nicht zur Verfügung.

Veröffentlichungsziel: https://webisdead.github.io/neon-tasks/
