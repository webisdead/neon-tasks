import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import { loadTasks, saveTasks } from "./storage";
const TaskWorld = lazy(() => import("./world/TaskWorld"));
const warningText =
  "Der Browser-Speicher ist nicht verfügbar. Deine Aufgaben bleiben nur in diesem Tab erhalten.";
function initialState() {
  try {
    const storage = window.localStorage;
    return { ...loadTasks(storage), storage };
  } catch {
    return { tasks: [], warning: warningText, storage: null };
  }
}
class WorldBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
function Arrow() {
  return (
    <svg
      className="arrow-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function Modal({ title, close, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    return () => {
      previous?.focus?.();
    };
  }, []);
  useEffect(() => {
    (
      ref.current.querySelector("textarea") ??
      ref.current.querySelector("button")
    )?.focus();
  }, [title]);
  return (
    <dialog
      ref={ref}
      className="terminal"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      aria-labelledby="dialog-title"
    >
      <header className="dialog-heading">
        <div>
          <span className="eyebrow">NEON / TERMINAL</span>
          <h2 id="dialog-title">{title}</h2>
        </div>
        <button
          className="icon-button"
          onClick={close}
          aria-label="Dialog schließen"
        >
          ×
        </button>
      </header>
      {children}
    </dialog>
  );
}
function Stick({ movement, onChange }) {
  const pointer = useRef(null),
    element = useRef(null);
  useEffect(() => {
    function stop() {
      const id = pointer.current;
      pointer.current = null;
      if (id !== null && element.current?.hasPointerCapture(id))
        element.current.releasePointerCapture(id);
      onChange({ x: 0, y: 0 });
    }
    function hidden() {
      if (document.hidden) stop();
    }
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [onChange]);
  function move(event) {
    if (pointer.current !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    let x = (event.clientX - rect.left - rect.width / 2) / 38,
      y = -(event.clientY - rect.top - rect.height / 2) / 38;
    const length = Math.max(1, Math.hypot(x, y));
    onChange({ x: x / length, y: y / length });
  }
  function reset(event) {
    event.stopPropagation();
    if (pointer.current !== event.pointerId) return;
    pointer.current = null;
    onChange({ x: 0, y: 0 });
  }
  return (
    <div
      ref={element}
      className="stick"
      role="group"
      aria-label="Bewegungsstick"
      onPointerDown={(event) => {
        event.stopPropagation();
        pointer.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        move(event);
      }}
      onPointerMove={(event) => {
        event.stopPropagation();
        move(event);
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
      onLostPointerCapture={reset}
    >
      <span
        style={{
          transform: `translate(${movement.x * 30}px,${-movement.y * 30}px)`,
        }}
      >
        ↑
      </span>
    </div>
  );
}
export default function App() {
  const [initial] = useState(initialState),
    [tasks, setTasks] = useState(initial.tasks),
    [warning, setWarning] = useState(initial.warning);
  const [entered, setEntered] = useState(false),
    [dialog, setDialog] = useState(null),
    [selectedId, setSelectedId] = useState(null),
    [filter, setFilter] = useState("all"),
    [text, setText] = useState("");
  const [effectsEnabled, setEffectsEnabled] = useState(
      () => !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    ),
    [graphics, setGraphics] = useState("loading");
  const [target, setTarget] = useState(null),
    [movement, setMovement] = useState({ x: 0, y: 0 }),
    [travelRequest, setTravel] = useState(null),
    [pulse, setPulse] = useState(null);
  const world = useRef(null),
    sequence = useRef(0);
  const paused = !!dialog || graphics !== "ready";
  const selected = tasks.find((task) => task.id === selectedId),
    open = tasks.filter((task) => !task.completed).length;
  useEffect(() => {
    if (!saveTasks(initial.storage, tasks)) setWarning(warningText);
  }, [tasks, initial.storage]);
  function show(type, id) {
    setMovement({ x: 0, y: 0 });
    world.current?.releasePointer();
    if (id) setSelectedId(id);
    setDialog(type);
  }
  function pause() {
    setMovement({ x: 0, y: 0 });
    setDialog((current) => current ?? "pause");
  }
  useEffect(() => {
    function stop() {
      setMovement({ x: 0, y: 0 });
    }
    function hidden() {
      if (document.hidden) stop();
    }
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, []);
  useEffect(() => {
    function escape(event) {
      if (event.code === "Escape" && entered && !dialog) event.preventDefault();
    }
    window.addEventListener("keydown", escape, true);
    return () => window.removeEventListener("keydown", escape, true);
  }, [entered, dialog]);
  useEffect(() => {
    if (paused) setMovement({ x: 0, y: 0 });
  }, [paused]);
  function add(event) {
    event.preventDefault();
    if (!text.trim()) return;
    const id =
      globalThis.crypto?.randomUUID?.() ??
      `task-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setTasks((current) => [
      { id, text: text.trim(), completed: false },
      ...current,
    ]);
    setSelectedId(id);
    setText("");
    setDialog("task");
    setPulse({ id, sequence: ++sequence.current });
  }
  function toggle(task) {
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id ? { ...item, completed: !item.completed } : item,
      ),
    );
    setPulse({ id: task.id, sequence: ++sequence.current });
  }
  function travel(id) {
    setSelectedId(id);
    setEntered(true);
    setDialog(null);
    setTravel({ id, sequence: ++sequence.current });
  }
  const visible = tasks.filter(
    (task) =>
      filter === "all" ||
      (filter === "active" ? !task.completed : task.completed),
  );
  return (
    <main className="world-shell" data-graphics={graphics} data-paused={paused}>
      <WorldBoundary onFailure={() => setGraphics("failed")}>
        <Suspense fallback={null}>
          <TaskWorld
            ref={world}
            tasks={tasks}
            selectedId={selectedId}
            entered={entered}
            paused={paused}
            effectsEnabled={effectsEnabled}
            movement={movement}
            travelRequest={travelRequest}
            pulse={pulse}
            onTarget={setTarget}
            onCreate={() => show("create")}
            onInteract={(id) => show("task", id)}
            onPause={pause}
            onReady={(value) => setGraphics(value ? "ready" : "failed")}
          />
        </Suspense>
      </WorldBoundary>
      <div className="vignette" />
      <header className="hud-top">
        <span className="wordmark">
          <b>✳</b> NEON <i>/</i> TASKS
        </span>
        <button className="terminal-button" onClick={() => show("all")}>
          Aufgaben <span>{String(open).padStart(2, "0")}</span>
        </button>
      </header>
      {!entered ? (
        <section className="entry">
          <span className="eyebrow">
            <i className="live-dot" /> DEIN PERSÖNLICHER FOKUSRAUM
          </span>
          <h1>
            Ein Schritt.
            <br />
            <em>Ein klarer Kopf.</em>
          </h1>
          <p>
            Deine Aufgaben haben einen Ort.
            <br />
            Geh hinein. Nimm dir eine vor.
          </p>
          <button
            className="primary enter"
            onClick={() => {
              setEntered(true);
              if (graphics === "failed") show("all");
            }}
          >
            {graphics === "failed" ? "Aufgaben öffnen" : "Raum betreten"}{" "}
            <Arrow />
          </button>
          <span className="entry-hint">
            WASD zum Gehen · Ziehen zum Umsehen
            <br />
            Auf dem Smartphone: Stick & Wischen
          </span>
        </section>
      ) : (
        <>
          {!paused && (
            <>
              <div className="crosshair" aria-hidden="true" />
              <div className="target-action">
                {target ? (
                  <button
                    onClick={() =>
                      target.kind === "create"
                        ? show("create")
                        : show("task", target.id)
                    }
                  >
                    <kbd>E</kbd>{" "}
                    {target.kind === "create"
                      ? "Neue Aufgabe"
                      : "Aufgabe öffnen"}{" "}
                    <Arrow />
                  </button>
                ) : (
                  <span className="explore-hint">Geh auf eine Station zu</span>
                )}
              </div>
              <div className="mobile-controls">
                <Stick movement={movement} onChange={setMovement} />
                <span>WISCHEN ZUM UMSEHEN ↔</span>
              </div>
            </>
          )}
          <nav className="hud-bottom" aria-label="Raumsteuerung">
            <button onClick={() => show("create")}>
              <span>＋</span> Neue Aufgabe
            </button>
            <button
              className="pointer-button"
              disabled={paused}
              onClick={() => world.current?.capturePointer()}
            >
              Maus umsehen ⌖
            </button>
            <button
              className="help-button"
              onClick={() => show("pause")}
              aria-label="Hilfe und Pause"
            >
              II <span>Pause / Hilfe</span>
            </button>
          </nav>
        </>
      )}
      {!entered && (
        <footer className="entry-footer">
          <span>01 / DER NEON-HOF</span>
          <span>LOKAL. PRIVAT. DEIN RAUM.</span>
        </footer>
      )}
      {graphics === "loading" && (
        <p className="graphics-status" role="status">
          Der Raum entsteht …
        </p>
      )}
      {graphics === "failed" && (
        <aside className="graphics-status failure" role="status">
          Die 3D-Grafik ist nicht verfügbar. Alle Aufgaben bleiben im Terminal
          erreichbar.{" "}
          <button onClick={() => show("all")}>
            Terminal öffnen <Arrow />
          </button>
        </aside>
      )}
      {warning && (
        <p role="status" className="storage-warning">
          {warning}
        </p>
      )}
      {dialog && (
        <Modal
          title={
            dialog === "all"
              ? "Deine Aufgaben."
              : dialog === "create"
                ? "Was hast du vor?"
                : dialog === "task"
                  ? "Eine Sache im Fokus."
                  : "Eine kurze Pause."
          }
          close={() => setDialog(null)}
        >
          {dialog === "create" && (
            <form onSubmit={add}>
              <label htmlFor="new-task">Dein nächster Schritt</label>
              <textarea
                id="new-task"
                autoFocus
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Eine neue Aufgabe …"
                rows={4}
              />
              <button className="primary" type="submit" disabled={!text.trim()}>
                Aufgabe hinzufügen <span>＋</span>
              </button>
            </form>
          )}
          {dialog === "task" && selected && (
            <>
              <span className="eyebrow task-status">
                {selected.completed ? "ERLEDIGT" : "OFFEN"} / IN DEINEM RAUM
              </span>
              <p className="full-task">{selected.text}</p>
              <div className="dialog-actions">
                <button className="primary" onClick={() => toggle(selected)}>
                  {selected.completed ? "Wieder öffnen ↶" : "Erledigen ✓"}
                </button>
                <button
                  disabled={graphics !== "ready"}
                  onClick={() => travel(selected.id)}
                >
                  Im Raum finden ⌖
                </button>
                <button
                  className="danger"
                  onClick={() => {
                    setTasks((current) =>
                      current.filter((task) => task.id !== selected.id),
                    );
                    setSelectedId(null);
                    setDialog("all");
                  }}
                >
                  Aufgabe löschen
                </button>
              </div>
            </>
          )}
          {dialog === "all" && (
            <>
              <div className="terminal-summary">
                <p>
                  <strong>{String(open).padStart(2, "0")}</strong> offen{" "}
                  <span> / {tasks.length} insgesamt</span>
                </p>
                <button
                  onClick={() => setDialog("create")}
                  aria-label="Neue Aufgabe erstellen"
                >
                  ＋
                </button>
              </div>
              <div
                className="filters"
                role="group"
                aria-label="Aufgaben filtern"
              >
                {[
                  ["all", "Alle"],
                  ["active", "Offen"],
                  ["completed", "Erledigt"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    aria-pressed={filter === value}
                    onClick={() => setFilter(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {visible.length ? (
                <ul className="task-list">
                  {visible.map((task, index) => (
                    <li key={task.id}>
                      <button
                        className="check-button"
                        aria-label={`${task.completed ? "Wieder öffnen" : "Erledigen"}: ${task.text}`}
                        aria-pressed={task.completed}
                        onClick={() => toggle(task)}
                      >
                        {task.completed ? "✓" : "○"}
                      </button>
                      <button
                        className="task-name"
                        onClick={() => show("task", task.id)}
                      >
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <p className={task.completed ? "completed" : ""}>
                          {task.text}
                        </p>
                        <Arrow />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <span>＋</span>
                  <h3>
                    {tasks.length
                      ? "Hier ist gerade alles frei."
                      : "Noch alles möglich."}
                  </h3>
                  <p>Ein Gedanke. Eine Aufgabe. Der erste Schritt.</p>
                  <button onClick={() => setDialog("create")}>
                    Neue Aufgabe
                  </button>
                </div>
              )}
              <p className="local-note">
                Nur auf diesem Gerät gespeichert · Bis zu 12 Stationen im Raum
              </p>
            </>
          )}
          {dialog === "pause" && (
            <>
              <p className="pause-copy">Der Raum wartet auf dich.</p>
              <dl className="instructions">
                <div>
                  <dt>Gehen</dt>
                  <dd>WASD / Pfeiltasten · Touch-Stick</dd>
                </div>
                <div>
                  <dt>Umsehen</dt>
                  <dd>Maus ziehen · Bildschirm wischen</dd>
                </div>
                <div>
                  <dt>Öffnen</dt>
                  <dd>E an einer Station · Zielaktion</dd>
                </div>
                <div>
                  <dt>Pause</dt>
                  <dd>Escape · Pause-Taste</dd>
                </div>
              </dl>
              <button
                className="setting"
                aria-pressed={effectsEnabled}
                onClick={() => setEffectsEnabled((value) => !value)}
              >
                Ambient-Effekte <span>{effectsEnabled ? "AN ●" : "AUS ○"}</span>
              </button>
              <div className="dialog-actions">
                <button className="primary" onClick={() => setDialog(null)}>
                  Weitergehen <Arrow />
                </button>
                <button
                  disabled={graphics !== "ready"}
                  onClick={() => {
                    world.current?.resetView();
                    setDialog(null);
                  }}
                >
                  Zurück zum Eingang
                </button>
              </div>
              <p className="local-note">
                Die Maussteuerung ist optional. Escape gibt die Maus wieder
                frei.
              </p>
            </>
          )}
        </Modal>
      )}
    </main>
  );
}
