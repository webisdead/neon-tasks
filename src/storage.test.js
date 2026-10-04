import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTasks, saveTasks } from './storage.js';

const tasks = [{ id: 'task-1', text: 'Milch kaufen', completed: false }, { id: 'task-2', text: 'Lesen', completed: true }];
const storageWith = (value) => ({ getItem: () => value });

test('missing data starts with an empty list', () => {
  assert.deepEqual(loadTasks(storageWith(null)), { tasks: [], warning: null });
});

test('invalid JSON starts with an empty list', () => {
  assert.deepEqual(loadTasks(storageWith('{')), { tasks: [], warning: null });
});

for (const [name, value] of [
  ['non-array', {}], ['null', null], ['null task', [null]],
  ['missing fields', [{ id: 'a' }]],
  ['non-string ID', [{ id: 1, text: 'A', completed: false }]],
  ['empty ID', [{ id: ' ', text: 'A', completed: false }]],
  ['empty text', [{ id: 'a', text: ' ', completed: false }]],
  ['non-string text', [{ id: 'a', text: 1, completed: false }]],
  ['non-boolean completion', [{ id: 'a', text: 'A', completed: 'false' }]],
  ['duplicate IDs', [tasks[0], { ...tasks[1], id: tasks[0].id }]],
]) {
  test(`invalid stored records: ${name}`, () => {
    assert.deepEqual(loadTasks(storageWith(JSON.stringify(value))), { tasks: [], warning: null });
  });
}

test('blocked reads return an empty list and a German warning', () => {
  const result = loadTasks({ getItem() { throw new Error('blocked'); } });
  assert.deepEqual(result.tasks, []);
  assert.match(result.warning, /Speicher/);
});

test('unavailable storage returns a warning', () => {
  assert.ok(loadTasks(undefined).warning);
});

test('valid tasks are restored with order and completion intact', () => {
  assert.deepEqual(loadTasks(storageWith(JSON.stringify(tasks))), { tasks, warning: null });
});

test('tasks can be saved and restored through the same key', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.equal(saveTasks(storage, tasks), true);
  assert.deepEqual(loadTasks(storage).tasks, tasks);
  assert.equal(saveTasks(storage, []), true);
  assert.deepEqual(loadTasks(storage).tasks, []);
});

test('blocked writes return false without throwing', () => {
  assert.equal(saveTasks({ setItem() { throw new Error('quota'); } }, tasks), false);
});

test('unavailable storage cannot save', () => {
  assert.equal(saveTasks(undefined, tasks), false);
});
