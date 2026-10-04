// Run: node tests/unexpected-pause-browser.mjs http://localhost:9222 http://localhost:5173
// Chromium with SwiftShader; touch input uses native CDP dispatchTouchEvent.
import assert from "node:assert/strict";
const [endpoint = "http://localhost:9222", url = "http://localhost:5173"] =
  process.argv.slice(2);
const pages = await (await fetch(endpoint + "/json/list")).json();
const ws = new WebSocket(
  pages.find((p) => p.type === "page").webSocketDebuggerUrl,
);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = ({ data }) => {
  const m = JSON.parse(data);
  if (pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    pending.set(++id, (m) => (m.error ? reject(m.error) : resolve(m.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });
const ev = async (expression) => {
  const r = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
    userGesture: true,
  });
  if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
};
const wait = () => new Promise((r) => setTimeout(r, 350));
const key = (code) =>
  ev(
    `window.dispatchEvent(new KeyboardEvent('keydown',{code:${JSON.stringify(code)}}))`,
  );
const pos = () =>
  ev(`document.querySelector('[data-world]').dataset.cameraPosition`);
const quiet = async () =>
  assert.equal(await ev(`!!document.querySelector('dialog[open]')`), false);
const click = (text) =>
  ev(
    `Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes(${JSON.stringify(text)})).click()`,
  );
const outputs = {};
try {
  await send("Emulation.clearDeviceMetricsOverride");
  await send("Emulation.setTouchEmulationEnabled", { enabled: false });
  await send("Page.navigate", { url });
  await wait();
  await wait();
  await click("Raum betreten");
  await wait();
  await key("KeyW");
  await wait();
  const walking = await pos();
  await ev(`window.dispatchEvent(new Event('blur'))`);
  await wait();
  await quiet();
  const stopped = await pos();
  await wait();
  assert.equal(await pos(), stopped);
  await ev(
    `window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW',repeat:true}))`,
  );
  await wait();
  assert.equal(await pos(), stopped);
  await ev(
    `window.dispatchEvent(new Event('focus'));window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW',repeat:true}))`,
  );
  await wait();
  assert.equal(await pos(), stopped);
  await key("KeyW");
  await wait();
  assert.notEqual(await pos(), stopped);
  outputs.blur = { walking, stopped, fresh: await pos() };
  await ev(`document.dispatchEvent(new Event('pointerlockchange'))`);
  const unrelated = await pos();
  await wait();
  await quiet();
  assert.notEqual(await pos(), unrelated);
  outputs.unowned = "ignored while walking";
  await ev(
    `Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))`,
  );
  await wait();
  await quiet();
  const hidden = await pos();
  await wait();
  assert.equal(await pos(), hidden);
  await ev(
    `delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'))`,
  );
  await wait();
  assert.equal(await pos(), hidden);
  await key("KeyA");
  await wait();
  assert.notEqual(await pos(), hidden);
  outputs.hidden = "quiet stop, neutral return, fresh key moves";
  await key("Escape");
  await wait();
  assert.match(
    await ev(`document.querySelector('dialog[open]').textContent`),
    /Eine kurze Pause/,
  );
  await click("Weitergehen");
  await wait();
  await click("Maus umsehen");
  await wait();
  assert.equal(
    await ev(
      `document.pointerLockElement===document.querySelector('[data-world]')`,
    ),
    true,
  );
  await ev("document.exitPointerLock()");
  await wait();
  assert.match(
    await ev(`document.querySelector('dialog[open]').textContent`),
    /Eine kurze Pause/,
  );
  await click("Weitergehen");
  await wait();
  await click("Maus umsehen");
  await wait();
  await ev(
    `window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('focus'))`,
  );
  await wait();
  await quiet();
  outputs.automaticUnlock =
    "owned lock auto-release stays quiet after immediate focus";
  await click("Maus umsehen");
  await wait();
  await click("Neue Aufgabe");
  await wait();
  assert.match(
    await ev(`document.querySelector('dialog[open]').textContent`),
    /Was hast du vor/,
  );
  outputs.lock = "real acquisition/loss pauses; intentional create preserved";
  await ev(`document.querySelector('[aria-label="Dialog schließen"]').click()`);
  await wait();
  await click("Hilfe");
  await wait();
  assert.match(
    await ev(`document.querySelector('dialog[open]').textContent`),
    /Eine kurze Pause/,
  );
  await click("Weitergehen");
  await wait();
  outputs.explicit = "Escape and pause button preserved";
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 5,
  });
  await wait();
  await ev(
    `document.querySelector('.stick').addEventListener('pointerdown',event=>window.stickPointer=event.pointerId)`,
  );
  // Stay outside station targeting range: incidental target prop updates can
  // otherwise deliver neutral input after focus and mask the recovery bug.
  await key("KeyA");
  for (
    let attempts = 0;
    attempts < 20 && Number((await pos()).split(",")[0]) > -4.5;
    attempts++
  )
    await wait();
  assert.ok(Number((await pos()).split(",")[0]) <= -4.5);
  await ev(`window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyA'}))`);
  await wait();
  const rect = await ev(
    `document.querySelector('.stick').getBoundingClientRect().toJSON()`,
  );
  const touch = async (type, y) =>
    send("Input.dispatchTouchEvent", {
      type,
      touchPoints:
        type === "touchEnd"
          ? []
          : [{ x: rect.x + rect.width / 2, y: rect.y + y }],
    });
  await touch("touchStart", rect.height / 2);
  await touch("touchMove", 15);
  await wait();
  const moving = await pos();
  await ev(`window.dispatchEvent(new Event('blur'))`);
  await wait();
  await quiet();
  const touchStop = await pos();
  assert.equal(
    await ev(
      `document.querySelector('.stick').hasPointerCapture(window.stickPointer)`,
    ),
    false,
  );
  assert.match(
    await ev(`document.querySelector('.stick span').style.transform`),
    /translate\(0px/,
  );
  await ev(`window.dispatchEvent(new Event('focus'))`);
  await touch("touchMove", 12);
  await wait();
  assert.equal(await pos(), touchStop);
  await touch("touchEnd");
  // Fresh recovery must work without an initial neutral center sample.
  await touch("touchStart", 15);
  await wait();
  assert.notEqual(await pos(), touchStop);
  await touch("touchEnd");
  outputs.touch = {
    moving,
    touchStop,
    fresh: await pos(),
    coarse: await ev(`matchMedia('(pointer: coarse)').matches`),
  };
  await touch("touchStart", rect.height - 15);
  await wait();
  await ev(
    `Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))`,
  );
  await wait();
  await quiet();
  const hiddenTouchStop = await pos();
  await ev(
    `delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'))`,
  );
  await touch("touchMove", rect.height - 12);
  await wait();
  assert.equal(await pos(), hiddenTouchStop);
  await touch("touchEnd");
  await touch("touchStart", rect.height - 15);
  await wait();
  assert.notEqual(await pos(), hiddenTouchStop);
  await touch("touchEnd");
  outputs.hiddenTouch = { stopped: hiddenTouchStop, fresh: await pos() };
  await click("Hilfe");
  await wait();
  await click("Weitergehen");
  await wait();
  const dialogStop = await pos();
  await touch("touchStart", rect.height - 15);
  await wait();
  assert.notEqual(await pos(), dialogStop);
  await touch("touchEnd");
  outputs.dialogTouch = "fresh off-center gesture moves";
  console.log(JSON.stringify(outputs, null, 2));
} finally {
  ws.close();
}
