# iOS-Bodenflackern: Untersuchung und Fix

Der Shader-Boden liegt bei y=0. Die Oberseite seines Unterbaus lag ebenfalls bei y=0 und konkurrierte dadurch um dieselben Tiefenwerte. Der Unterbau liegt jetzt drei Zentimeter tiefer; begehbare Bodenhöhe und Navigation bleiben unverändert.

Das perspektivische Raster war ungefiltert. Der Boden-Shader filtert seine dünnen Linien jetzt mit `fwidth` über die Pixelgröße und blendet nicht mehr auflösbare Zellen aus. Rastermaß, Farben und Mittelpfad bleiben erhalten.

Die isolierte tatsächliche WebGL-Prüfung trennt Boden, Unterbau und Raster-Filterung. Raycasts und projizierte Tiefenwerte bestätigen den korrigierten Abstand. Acht kleine Kameraänderungen über einem entfernten Bodenbereich reduzieren die gemessene mittlere Pixelvariation von 0.86516 auf 0.59720 (rund 31 Prozent). Der alte Shader scheitert an dieser Regressionsprüfung; der neue besteht sie. GPU-Programme kompilieren erfolgreich.

23 vorhandene Tests und der Produktionsbuild bestehen. Die unabhängige Codeprüfung gibt den Fix frei. Eine unabhängige Produktionsvorschau bestätigt WebGL bereit, weiterhin echte WASD-Bewegung und keine Browserfehler. Optional bleibt eine engere Kopplung des Geometrie-Fixtures an die Produktionsszene für spätere Prüfungen.

Geprüft wurde Chromium/SwiftShader auf Linux. Das spezifische Geräteflackern wurde dort nicht reproduziert; die überlappende Geometrie und Raster-Aliasing sind nachgewiesene Defekte. Ein physisches iOS-Gerät und Safari stehen hier nicht zur Verfügung. Die generische GL-Bezeichnung „WebKit WebGL“ ist kein Safari-Prüfnachweis.

Veröffentlichungsziel: https://webisdead.github.io/neon-tasks/
