export function layoutTasks(tasks) {
  return tasks.slice(0, 12).map((task, index) => {
    const angle = index * 2.399963229728653;
    const radius = 2.35 + (index % 3) * 0.42;
    return {
      id: task.id,
      position: [
        Math.cos(angle) * radius,
        Math.sin(angle) * 1.65,
        Math.sin(angle * 1.7) * 1.1,
      ],
    };
  });
}
