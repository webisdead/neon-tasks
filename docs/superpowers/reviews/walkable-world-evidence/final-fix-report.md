# Final correction wave

Base 46a9b7c; branch feat/walkable-world. Addresses all four findings in final-review.md. App functional behavior and root's uncommitted plan are unchanged.

1. TaskWorld's named host is role=region. Targeted actual Chromium/axe 4.10.3 world-region audit: zero violations and zero incomplete checks. Root independently reports full entered-world audit on production preview4173: zero violations; gradient contrast remains incomplete, not a contrast pass.
2. CSS safe-area custom properties default to all four env() insets. Mobile HUD horizontal/top/bottom offsets preserve safe areas; stick/control stack includes the bottom inset. Dialog width/height subtract all four insets and its auto margins center it inside the asymmetric safe rectangle. The final shared dialog inset rule also retains that safe rectangle.
3. Cleanup ownership exists before renderer allocation. Geometry/material/texture acquisitions register immediately, including partial station construction. Listeners register removal before addition, observer is owned before observe, and both initialization failure and repeated normal dispose use the same idempotent cleanup. Cleanup continues if an individual release throws. Consumer readiness notification has its own boundary after the allocation transaction; a throwing callback disposes the undelivered controller. World controller reformatted for review.
4. Portal backing adds an 8.2×0.7 rectangle footprint; pure navigation expands it by existing .45 player clearance. Both faces and edges block while space beside the slab stays traversable. No production test API added.

## Commands and checks

- `node --test src/world/navigation.test.js`: new rectangle regression first failed on the front-face assertion with the old implementation (4 pass/1 fail); after implementation all5 pass. Cases include both faces, near outer edges, side-face approaches, and route around slab.
- `npm test`: final23/23 pass (storage18 + navigation5).
- `npm run build`: pass; existing >500kB world chunk warning remains.
- `git diff --check`: pass.
- `npm run dev -- --port 5174`: dedicated source fixture/app server.
- `agent-browser --session final-fixes --executable-path /usr/bin/chromium --args '--enable-unsafe-swiftshader,--use-angle=swiftshader' open http://localhost:5174/src/world/final-fix-smoke.html`
- `agent-browser --session final-fixes eval 'runLifecycleChecks()'`: actual WebGL failure cases after renderer append, partial station material/card, window listener acquisition, observer observe, scheduled rAF/resize, throwing readiness callback, and repeated normal disposal. All leave zero canvases/listeners/connected observers/rAF and release their materials/textures/geometries plus one actual WebGL context loss. Final fixture additionally verifies unique disposal events (11 owners for partial-station/listener/observer failures;13 for later failures/normal disposal), and normal renderer memory before cleanup is3 geometries/3 textures. All7 final cases pass.
- `agent-browser --session final-fixes eval 'runPortalApproaches()'`: actual camera approaches both faces and near slab edges stop at z=-28.2/-29.8; x4.7 passes around the slab. Camera spawn uses a fixture-only temporary Vector3.set patch; assertions use existing getState. Final fixture waits16 actual frames rather than fixed wall time to avoid slow software-rendering timing sensitivity.
- `curl -sSf https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.3/axe.min.js -o /tmp/walkable-axe.js`
- `node src/world/final-fix-browser-check.cjs http://127.0.0.1:37973 /tmp/walkable-axe.js`: combined lifecycle/portal/axe/landscape runner (CDP endpoint from `agent-browser --session final-fixes get cdp-url`; use current port on rerun). Keeps one CDP session open because this CLI resets touch emulation on later commands. Browser fixtures are source-only, excluded from production entry/build.

Landscape844×390, CDP touch/coarse=true,5touch points, simulated CSS safe insets top17/right31/bottom29/left59. HUD x59..813; stick x59..171/y163..275; bottom HUD y312..361. Final real touch moved camera from z10 to z9.463. Dialog x71..801/y29..349, center436/189 exactly equals asymmetric safe rectangle center; close44×46 and submit688×50 remain inside safe area (submit after scrolling). Screenshot world and dialog were captured and both visually inspected. Physical notch hardware performance is unmeasured.

Evidence: final-fix-browser-results.json, final-fix-landscape-world.png, final-fix-landscape-dialog.png in this directory. Root owns refreshed preview4173 and publication/live verification.
