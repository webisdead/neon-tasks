# Unbeabsichtigte Pause beim Laufen

Fokus- und Hintergrundereignisse stoppen Eingaben still. Escape, Pause-Schaltfläche und Verlust einer zuvor tatsächlich gehaltenen Mausbindung können weiterhin das Pause-Menü öffnen. Ein Mausbindungs-Ereignis ohne vorherige Bindung darf keine Pause auslösen.

1. Automatische Pausenauslöser im Browser reproduzieren.
2. Eingabe-Stopp und Pause-Menü trennen; Mausbindungs-Übergänge und Touch-Fokuswechsel absichern.
3. Regression, Tests, Build und unabhängige Prüfung.
4. Autorisiert auf Pages veröffentlichen und Live-Stand prüfen.

Entscheidung: Nach Rückkehr des Fokus ist die Steuerung wieder verfügbar; Bewegung erfordert eine neue Eingabe. Dadurch entfällt das automatische Pause-Menü, ohne gehaltene Eingaben weiterlaufen zu lassen.
