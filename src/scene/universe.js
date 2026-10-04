import * as THREE from "three";
import { layoutTasks } from "./layout.js";
import {
  coreVertex,
  coreFragment,
  gridVertex,
  gridFragment,
} from "./shaders.js";

export function createUniverse(host, callbacks) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x030512, 1);
  host.appendChild(renderer.domElement);
  Object.assign(renderer.domElement.style, {
    width: "100%",
    height: "100%",
    display: "block",
    touchAction: "pan-y",
  });
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030512, 0.032);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  const world = new THREE.Group();
  scene.add(world);
  const uniforms = { time: { value: 0 }, impulse: { value: 0 } };
  const coreMaterial = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: coreVertex,
    fragmentShader: coreFragment,
  });
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.08, 4),
    coreMaterial,
  );
  core.rotation.set(0.35, 0.2, 0.2);
  world.add(core);
  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.11, 1),
    new THREE.MeshBasicMaterial({
      color: 0x82faff,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    }),
  );
  world.add(wire);
  const arcs = [];
  for (let i = 0; i < 4; i++) {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(1.55 + i * 0.28, 0.008, 6, 120, Math.PI * 1.65),
      new THREE.MeshBasicMaterial({
        color: [0x79fff1, 0xa685ff, 0xc8ff5e, 0x38bfff][i],
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      }),
    );
    arc.rotation.set(0.7 + i * 0.52, i * 0.72, i * 0.9);
    world.add(arc);
    arcs.push(arc);
  }
  const grid = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: gridVertex,
      fragmentShader: gridFragment,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = -2.5;
  scene.add(grid);
  const starPositions = new Float32Array(360 * 3);
  for (let i = 0; i < 360; i++) {
    const seed = i * 12.9898;
    starPositions[i * 3] = Math.sin(seed) * 23;
    starPositions[i * 3 + 1] = Math.cos(seed * 1.7) * 15;
    starPositions[i * 3 + 2] = -5 - Math.abs(Math.sin(seed * 0.8)) * 22;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(starPositions, 3),
  );
  scene.add(
    new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0x89b9fa,
        size: 0.035,
        transparent: true,
        opacity: 0.7,
      }),
    ),
  );
  const particles = new Float32Array(96 * 3);
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particles, 3),
  );
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xcfff81,
    size: 0.045,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  world.add(new THREE.Points(particleGeometry, particleMaterial));
  let nodes = [],
    tasks = [],
    selectedId = null,
    effects = true,
    frame = 0,
    disposed = false,
    lost = false,
    time = 0,
    previous = 0,
    lastProjection = -Infinity,
    impulseStarted = -Infinity,
    pulseSequence,
    width = 1,
    height = 1;
  let projectionTimer = 0;
  let yaw = 0,
    pitch = 0.12,
    drag = null;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const disposeObject = (object) => {
    object.traverse((o) => {
      o.geometry?.dispose();
      if (o.material) {
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          m.dispose();
      }
    });
  };
  function rebuild() {
    for (const n of nodes) {
      world.remove(n);
      disposeObject(n);
    }
    nodes = layoutTasks(tasks).map((entry, index) => {
      const task = tasks[index];
      const group = new THREE.Group();
      group.position.fromArray(entry.position);
      group.userData.id = entry.id;
      const material = new THREE.MeshBasicMaterial({
        color: task.completed ? 0x667791 : 0x89fff0,
        transparent: true,
        opacity: 0.9,
      });
      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.13, 0),
        material,
      );
      group.add(gem);
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.23, 0.009, 5, 40),
        new THREE.MeshBasicMaterial({
          color: entry.id === selectedId ? 0xcaff62 : 0x855cff,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
        }),
      );
      group.add(halo);
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.67, 0.22),
        new THREE.MeshBasicMaterial({
          color: entry.id === selectedId ? 0x83c744 : 0x123e57,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
        }),
      );
      panel.position.x = 0.47;
      group.add(panel);
      const points = [
        new THREE.Vector3(),
        group.position.clone().multiplyScalar(0.78),
      ];
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({
          color: 0x6865b5,
          transparent: true,
          opacity: 0.22,
        }),
      );
      group.add(line);
      line.position.copy(group.position).multiplyScalar(-1);
      world.add(group);
      return group;
    });
  }
  function project() {
    const p = new THREE.Vector3();
    callbacks.onPositions(
      nodes.map((n) => {
        n.getWorldPosition(p);
        p.project(camera);
        return {
          id: n.userData.id,
          x: (p.x * 0.5 + 0.5) * width,
          y: (-0.5 * p.y + 0.5) * height,
          visible: p.z < 1 && p.z > -1,
        };
      }),
    );
  }
  function render(now = performance.now()) {
    frame = 0;
    if (disposed || lost || document.hidden) return;
    if (effects) {
      time += Math.min((now - (previous || now)) / 1000, 0.05);
    }
    previous = now;
    uniforms.time.value = time;
    uniforms.impulse.value = effects
      ? Math.max(0, 1 - (now - impulseStarted) / 1100)
      : 0;
    world.rotation.set(pitch, yaw, 0);
    core.rotation.y = 0.2 + (effects ? time * 0.15 : 0);
    wire.rotation.y = -time * 0.09;
    arcs.forEach(
      (a, i) => (a.rotation.z = i * 0.9 + time * 0.035 * (i % 2 ? 1 : -1)),
    );
    nodes.forEach((n) => {
      n.children[0].rotation.y = time * 0.4;
      n.children[1].lookAt(camera.position);
      n.children[2].lookAt(camera.position);
    });
    particleMaterial.opacity = uniforms.impulse.value * 0.9;
    if (particleMaterial.opacity > 0) {
      for (let i = 0; i < 96; i++) {
        const a = i * 2.39996;
        const r = 1.1 + (1 - uniforms.impulse.value) * 3;
        particles[i * 3] = Math.sin(a) * r;
        particles[i * 3 + 1] = Math.cos(a) * r;
        particles[i * 3 + 2] = Math.sin(a * 1.3) * r;
      }
      particleGeometry.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, camera);
    if (now - lastProjection >= 80) {
      project();
      lastProjection = now;
    } else if (!effects && !projectionTimer) {
      projectionTimer = setTimeout(
        () => {
          projectionTimer = 0;
          if (!disposed && !lost && !document.hidden) {
            project();
            lastProjection = performance.now();
          }
        },
        80 - (now - lastProjection),
      );
    }
    if (effects) frame = requestAnimationFrame(render);
  }
  function request() {
    if (!frame && !disposed && !lost && !document.hidden)
      frame = requestAnimationFrame(render);
  }
  function resize() {
    width = Math.max(1, host.clientWidth);
    height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.set(0, 0.25, width / height < 0.8 ? 10.5 : 8.1);
    camera.updateProjectionMatrix();
    lastProjection = -Infinity;
    request();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const canvas = renderer.domElement;
  function down(e) {
    drag = { x: e.clientX, y: e.clientY, yaw, pitch, moved: false };
    canvas.setPointerCapture?.(e.pointerId);
  }
  function move(e) {
    if (!drag) return;
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.y;
    drag.moved ||= Math.abs(dx) + Math.abs(dy) > 6;
    yaw = drag.yaw + dx * 0.004;
    pitch = THREE.MathUtils.clamp(drag.pitch + dy * 0.003, -0.45, 0.45);
    request();
  }
  function up(e) {
    if (drag && !drag.moved) {
      const bounds = canvas.getBoundingClientRect();
      pointer.set(
        ((e.clientX - bounds.left) / bounds.width) * 2 - 1,
        (-(e.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(nodes, true);
      if (hits.length) {
        let n = hits[0].object;
        while (n && !n.userData.id) n = n.parent;
        if (n) callbacks.onSelect(n.userData.id);
      }
    }
    drag = null;
  }
  function cancelPointer() {
    drag = null;
  }
  function visibility() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    if (!document.hidden) request();
  }
  function contextLost(e) {
    e.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    callbacks.onReady(false);
  }
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", cancelPointer);
  canvas.addEventListener("webglcontextlost", contextLost);
  document.addEventListener("visibilitychange", visibility);
  function dispose() {
    disposed = true;
    clearTimeout(projectionTimer);
    cancelAnimationFrame(frame);
    observer.disconnect();
    canvas.removeEventListener("pointerdown", down);
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerup", up);
    canvas.removeEventListener("pointercancel", cancelPointer);
    canvas.removeEventListener("webglcontextlost", contextLost);
    document.removeEventListener("visibilitychange", visibility);
    disposeObject(scene);
    renderer.dispose();
    canvas.remove();
  }
  try {
    resize();
    renderer.compile(scene, camera);
    callbacks.onReady(true);
  } catch (error) {
    dispose();
    throw error;
  }
  return {
    update(props) {
      tasks = props.tasks;
      selectedId = props.selectedId;
      effects = props.effectsEnabled;
      rebuild();
      if (props.pulse?.sequence !== pulseSequence) {
        pulseSequence = props.pulse?.sequence;
        if (props.pulse) impulseStarted = performance.now();
      }
      cancelAnimationFrame(frame);
      frame = 0;
      lastProjection = -Infinity;
      request();
    },
    dispose,
  };
}
