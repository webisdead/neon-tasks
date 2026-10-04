// Start Vite on 5174 and Chromium with --remote-debugging-port=34222.
// Exercises real WebGL; output defaults to ignored local evidence directory.
import assert from "node:assert/strict";
import fs from "node:fs";
const tabs = await (
  await fetch(`${process.env.CDP_URL || "http://localhost:34222"}/json/list`)
).json();
const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id) {
    pending.get(m.id)(m.result);
    pending.delete(m.id);
  }
};
const send = (method, params = {}) =>
  new Promise((r) => {
    pending.set(++id, r);
    ws.send(JSON.stringify({ id, method, params }));
  });
const ev = async (expression) => {
  let r = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
};
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 900,
  height: 600,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", {
  url: `${process.env.FIXTURE_URL || "http://localhost:5174/tests/fixtures/floor-flicker.html"}`,
});
await new Promise((r) => setTimeout(r, 1500));
const out = {};
const browser = await send("Browser.getVersion");
fs.mkdirSync(process.env.EVIDENCE_DIR || ".superpowers/sdd/ios-floor-flicker", {
  recursive: true,
});
fs.writeFileSync(
  `${process.env.EVIDENCE_DIR || ".superpowers/sdd/ios-floor-flicker"}/browser.json`,
  JSON.stringify(browser, null, 2),
);
const dir = process.env.EVIDENCE_DIR || ".superpowers/sdd/ios-floor-flicker";
fs.mkdirSync(dir, { recursive: true });
for (const [name, options] of Object.entries({
  beforeClose: {},
  beforeFar: { far: true },
  floorOnly: { far: true, only: "floor" },
  slabOnly: { far: true, only: "slab" },
  separated: { far: true, separated: true },
  filtered: { far: true, only: "floor", aa: true },
  afterClose: { separated: true, aa: true },
})) {
  const r = await ev(`fixture.render(${JSON.stringify(options)})`);
  const pixels = r.pixels;
  delete r.pixels;
  out[name] = r;
  const capture = await send("Page.captureScreenshot");
  fs.writeFileSync(`${dir}/${name}.png`, Buffer.from(capture.data, "base64"));
  if (["floorOnly", "filtered"].includes(name)) {
    let change = 0,
      energy = 0;
    for (let n = 1; n <= 8; n++) {
      const next = await ev(
        `fixture.render(${JSON.stringify({ ...options, offset: n * 0.003 })})`,
      );
      for (let y = 260; y < 300; y++)
        for (let x = 30; x < 870; x++)
          for (let c = 0; c < 3; c++) {
            const i = (y * 900 + x) * 3 + c;
            change += Math.abs(next.pixels[i] - pixels[i]);
          }
    }
    for (let y = 260; y < 300; y++)
      for (let x = 1; x < 899; x++) {
        let i = (y * 900 + x) * 3;
        energy += Math.abs(pixels[i] - pixels[i - 3]);
      }
    out[name].temporalMean = change / (8 * 40 * 840 * 3);
    out[name].spatialEnergy = energy;
  }
}
fs.writeFileSync(`${dir}/webgl-results.json`, JSON.stringify(out, null, 2));
ws.close();
assert.equal(
  out.beforeFar.depth.floor,
  out.beforeFar.depth.slab,
  "baseline projected depths coincide",
);
assert.ok(
  out.separated.depth.slab > out.separated.depth.floor,
  "slab projected depth is behind floor",
);
assert.ok(
  out.beforeClose.hits.every((h) => Math.abs(h.y) < 1e-7),
  "baseline surfaces share depth",
);
assert.ok(
  out.separated.hits
    .filter((h) => h.surface === "slab")
    .every((h) => h.y < -0.029),
  "slab is below floor",
);
assert.ok(
  out.separated.hits
    .filter((h) => h.surface === "floor")
    .every((h) => Math.abs(h.y) < 1e-7),
  "floor remains at zero",
);
assert.ok(
  Object.values(out).every((r) => r.programs.every((p) => p.runnable)),
  "all shaders compile",
);
assert.ok(
  out.filtered.temporalMean < out.floorOnly.temporalMean,
  "AA reduces grazing-camera pixel variation",
);
console.log(JSON.stringify(out, null, 2));
