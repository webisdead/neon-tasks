// Run against the dedicated Chromium session launched by agent-browser.
// node src/world/final-fix-browser-check.cjs http://127.0.0.1:PORT /tmp/walkable-axe.js
const fs = require("node:fs");
const assert = require("node:assert/strict");
(async () => {
  const [endpoint, axePath] = process.argv.slice(2);
  const pages = await (await fetch(endpoint + "/json/list")).json();
  const page = pages.find((page) => page.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve) => (ws.onopen = resolve));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (pending.has(data.id)) {
      pending.get(data.id)(data);
      pending.delete(data.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      pending.set(++id, (data) =>
        data.error ? reject(data.error) : resolve(data.result),
      );
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails)
      throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const wait = () => new Promise((resolve) => setTimeout(resolve, 300));
  const navigate = async (path) => {
    await send("Page.navigate", { url: "http://localhost:5174/" + path });
    await wait();
  };
  const output = {};
  try {
    await navigate("src/world/final-fix-smoke.html");
    output.lifecycle = await evaluate("runLifecycleChecks()");
    output.lifecycle.forEach((result) =>
      assert.ok(result.pass, JSON.stringify(result)),
    );
    output.portal = await evaluate("runPortalApproaches()");
    output.portal.forEach((result) =>
      assert.ok(result.pass, JSON.stringify(result)),
    );
    await navigate("");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 844,
      height: 390,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await send("Emulation.setTouchEmulationEnabled", {
      enabled: true,
      maxTouchPoints: 5,
    });
    await evaluate(
      `Object.entries({'--safe-top':'17px','--safe-right':'31px','--safe-bottom':'29px','--safe-left':'59px'}).forEach(([key,value])=>document.documentElement.style.setProperty(key,value));Array.from(document.querySelectorAll('button')).find(button=>button.textContent.includes('Raum betreten')).click()`,
    );
    await wait();
    output.coarse = await evaluate(
      `({coarse:matchMedia('(pointer: coarse)').matches,touch:navigator.maxTouchPoints,width:innerWidth,height:innerHeight})`,
    );
    assert.ok(output.coarse.coarse);
    output.controls = await evaluate(
      `Array.from(document.querySelectorAll('.hud-top,.hud-bottom,.stick')).map(element=>({class:element.className,rect:element.getBoundingClientRect().toJSON()}))`,
    );
    output.controls.forEach(({ rect }) => {
      assert.ok(
        rect.left >= 59 &&
          rect.right <= 813 &&
          rect.top >= 17 &&
          rect.bottom <= 361,
      );
      assert.ok(rect.height >= 44);
    });
    const stick = output.controls.find((item) => item.class === "stick").rect;
    const before = await evaluate(
      `document.querySelector('[data-world]').dataset.cameraPosition`,
    );
    await send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: stick.x + 56, y: stick.y + 56 }],
    });
    await send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: stick.x + 56, y: stick.y + 22 }],
    });
    await wait();
    await send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    const after = await evaluate(
      `document.querySelector('[data-world]').dataset.cameraPosition`,
    );
    output.touch = { before, after };
    assert.notEqual(before, after);
    await evaluate(fs.readFileSync(axePath, "utf8"));
    output.axe = await evaluate(
      `axe.run(document.querySelector('[role="region"][aria-label="Begehbarer Neon-Hof"]')).then(result=>({violations:result.violations.map(item=>item.id),incomplete:result.incomplete.map(item=>item.id)}))`,
    );
    assert.deepEqual(output.axe.violations, []);
    const screenshot = async (name) => {
      const { data } = await send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(
        ".superpowers/sdd/walkable-world/" + name,
        Buffer.from(data, "base64"),
      );
    };
    await screenshot("final-fix-landscape-world.png");
    await evaluate(
      `Array.from(document.querySelectorAll('button')).find(button=>button.textContent.includes('Neue Aufgabe')).click()`,
    );
    await wait();
    output.dialog = await evaluate(
      `({rect:document.querySelector('dialog[open]').getBoundingClientRect().toJSON(),close:document.querySelector('[aria-label="Dialog schließen"]').getBoundingClientRect().toJSON()})`,
    );
    const rect = output.dialog.rect;
    assert.ok(
      rect.left >= 59 &&
        rect.right <= 813 &&
        rect.top >= 17 &&
        rect.bottom <= 361,
    );
    assert.ok(Math.abs((rect.left + rect.right) / 2 - 436) < 1);
    assert.ok(Math.abs((rect.top + rect.bottom) / 2 - 189) < 1);
    assert.ok(
      output.dialog.close.top >= 17 && output.dialog.close.bottom <= 361,
    );
    output.action = await evaluate(
      `const button=document.querySelector('dialog[open] button[type="submit"]');button.scrollIntoView({block:'nearest'});button.getBoundingClientRect().toJSON()`,
    );
    assert.ok(
      output.action.top >= 17 &&
        output.action.bottom <= 361 &&
        output.action.left >= 59 &&
        output.action.right <= 813,
    );
    await screenshot("final-fix-landscape-dialog.png");
    fs.writeFileSync(
      ".superpowers/sdd/walkable-world/final-fix-browser-results.json",
      JSON.stringify(output, null, 2) + "\n",
    );
    console.log(JSON.stringify(output, null, 2));
  } finally {
    ws.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
