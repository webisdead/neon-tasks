import test from "node:test";
import assert from "node:assert/strict";
import { stepPosition, selectSlots } from "./navigation.js";
const move = (
  yaw,
  x = 0,
  y = 1,
  dt = 0.05,
  position = { x: 0, z: 0 },
  obstacles = [],
) => stepPosition(position, { x, y }, yaw, dt, obstacles);
test("forward follows yaw and diagonal speed is bounded", () => {
  assert.ok(move(0).z < 0);
  assert.ok(move(Math.PI / 2).x < 0);
  assert.ok(
    Math.abs(Math.hypot(move(0, 1, 1).x, move(0, 1, 1).z) - 0.2) < 1e-9,
  );
});
test("elapsed time capped and floor bounded", () => {
  assert.deepEqual(move(0, 0, 1, 100), move(0));
  assert.ok(move(0, 1, 0, 0.05, { x: 9.8, z: 0 }).x <= 9.55);
  assert.ok(move(0, 0, 1, 0.05, { x: 0, z: -31.8 }).z >= -31.55);
});
test("circle obstacle prevents walking through its solid center", () => {
  const p = move(0, 0, 1, 0.05, { x: 0, z: 1 }, [{ x: 0, z: 0, radius: 0.7 }]);
  assert.ok(Math.hypot(p.x, p.z) >= 1.15 - 1e-9);
});
test("slots always capped, actual IDs retained and older selection included", () => {
  assert.deepEqual(selectSlots([], null), []);
  const tasks = Array.from({ length: 18 }, (_, id) => ({ id: String(id) }));
  assert.equal(selectSlots(tasks, null).length, 12);
  assert.equal(selectSlots(tasks, null)[0].id, "0");
  assert.ok(selectSlots(tasks, "17").some((t) => t.id === "17"));
  assert.equal(new Set(selectSlots(tasks, "17").map((t) => t.id)).size, 12);
});

test("portal rectangle blocks both faces and edges while leaving a route around it", () => {
  const portal = { x: 0, z: -29, halfWidth: 4.1, halfDepth: 0.35 };
  for (const x of [0, -4.09, 4.09]) {
    assert.ok(move(0, 0, 1, 0.05, { x, z: -28.1 }, [portal]).z >= -28.2 - 1e-9);
    assert.ok(
      move(0, 0, -1, 0.05, { x, z: -29.9 }, [portal]).z <= -29.8 + 1e-9,
    );
  }
  assert.ok(
    move(0, -1, 0, 0.05, { x: 4.7, z: -29 }, [portal]).x >= 4.55 - 1e-9,
  );
  assert.ok(
    move(0, 1, 0, 0.05, { x: -4.7, z: -29 }, [portal]).x <= -4.55 + 1e-9,
  );
  assert.ok(move(0, 0, 1, 0.05, { x: 4.7, z: -28.2 }, [portal]).z < -28.2);
});
