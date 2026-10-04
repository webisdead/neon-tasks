import test from "node:test";
import assert from "node:assert/strict";
import { layoutTasks } from "./layout.js";
test("empty task data creates no objects", () =>
  assert.deepEqual(layoutTasks([]), []));
test("large lists create at most twelve correctly associated objects", () => {
  const tasks = Array.from({ length: 40 }, (_, i) => ({
    id: `task-${i}`,
    text: `Task ${i}`,
    completed: false,
  }));
  const result = layoutTasks(tasks);
  assert.equal(result.length, 12);
  assert.deepEqual(
    result.map((n) => n.id),
    tasks.slice(0, 12).map((t) => t.id),
  );
});
test("layout is deterministic and has finite separated spatial positions", () => {
  const tasks = Array.from({ length: 12 }, (_, i) => ({ id: String(i) }));
  const a = layoutTasks(tasks);
  assert.deepEqual(a, layoutTasks(tasks));
  assert.ok(
    a.every(
      (n) => n.position.length === 3 && n.position.every(Number.isFinite),
    ),
  );
  assert.equal(new Set(a.map((n) => n.position.join(","))).size, 12);
});
