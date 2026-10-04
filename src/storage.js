export const TASKS_STORAGE_KEY = 'neon-tasks:v1';

const STORAGE_WARNING = 'Der Browser-Speicher ist nicht verfügbar. Deine Aufgaben bleiben nur in diesem Tab erhalten.';

function validTasks(tasks) {
  if (!Array.isArray(tasks)) return false;
  const ids = new Set();
  return tasks.every((task) => {
    if (
      task === null || typeof task !== 'object' ||
      typeof task.id !== 'string' || !task.id.trim() ||
      typeof task.text !== 'string' || !task.text.trim() ||
      typeof task.completed !== 'boolean' || ids.has(task.id)
    ) return false;
    ids.add(task.id);
    return true;
  });
}

export function loadTasks(storage) {
  let raw;
  try {
    raw = storage.getItem(TASKS_STORAGE_KEY);
  } catch {
    return { tasks: [], warning: STORAGE_WARNING };
  }

  if (raw === null) return { tasks: [], warning: null };
  try {
    const tasks = JSON.parse(raw);
    return { tasks: validTasks(tasks) ? tasks : [], warning: null };
  } catch {
    return { tasks: [], warning: null };
  }
}

export function saveTasks(storage, tasks) {
  try {
    storage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}
