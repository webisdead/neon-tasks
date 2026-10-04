export function selectSlots(tasks, selectedId) {
  const slots = tasks.slice(0,12);
  const selected = tasks.find(task => task.id === selectedId);
  if (selected && !slots.some(task => task.id === selectedId)) slots[slots.length-1] = selected;
  return slots;
}
export function stepPosition(position, input, yaw, dt, obstacles = []) {
  const length = Math.max(1, Math.hypot(input.x, input.y));
  const distance = Math.max(0, Math.min(dt, .05)) * 4 / length;
  const next = {
    x: position.x + (input.x * Math.cos(yaw) - input.y * Math.sin(yaw)) * distance,
    z: position.z + (-input.x * Math.sin(yaw) - input.y * Math.cos(yaw)) * distance,
  };
  for (const obstacle of obstacles) {
    const dx = next.x-obstacle.x, dz = next.z-obstacle.z;
    const separation = Math.hypot(dx,dz), radius = obstacle.radius + .45;
    if (separation < radius) {
      const angle = separation ? Math.atan2(dz,dx) : Math.atan2(position.z-obstacle.z,position.x-obstacle.x);
      next.x = obstacle.x + Math.cos(angle)*radius;
      next.z = obstacle.z + Math.sin(angle)*radius;
    }
  }
  next.x = Math.max(-9.55,Math.min(9.55,next.x));
  next.z = Math.max(-31.55,Math.min(13.55,next.z));
  return next;
}
