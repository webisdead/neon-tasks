import { Component, lazy, Suspense, useEffect, useState } from "react";
import { loadTasks, saveTasks } from "./storage";

const TaskUniverse = lazy(() => import("./scene/TaskUniverse"));
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
function Arrow({ down = false }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={down ? { transform: "rotate(180deg)" } : undefined}
    >
      <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function makeId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `task-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p className="scene-loading">
        Der Raum pausiert. Deine Aufgaben bleiben erreichbar.
      </p>
    ) : (
      this.props.children
    );
  }
}
function TaskComposer({ id, className, text, setText, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className={`task-form ${className}`}>
      <label htmlFor={id} className="input-label">
        WAS HAST DU VOR?
      </label>
      <div className="input-row flex">
        <input
          id={id}
          className="min-w-0 flex-1"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Eine neue Aufgabe …"
          autoComplete="off"
        />
        <button type="submit" className="add-button" aria-label="Hinzufügen">
          <Arrow />
        </button>
      </div>
    </form>
  );
}
export default function App() {
  const [initial] = useState(initialState);
  const [tasks, setTasks] = useState(initial.tasks);
  const [warning, setWarning] = useState(initial.warning);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [effectsEnabled, setEffectsEnabled] = useState(
    () => !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  const [ready, setReady] = useState(false);
  const [pulse, setPulse] = useState({ sequence: 0 });
  useEffect(() => {
    if (!saveTasks(initial.storage, tasks)) setWarning(warningText);
  }, [tasks, initial.storage]);
  const open = tasks.filter((task) => !task.completed).length;
  const completed = tasks.length - open;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;
  const visible = tasks.filter(
    (task) =>
      filter === "all" ||
      (filter === "active" ? !task.completed : task.completed),
  );
  const selected = visible.find((task) => task.id === selectedId) ?? visible[0];
  function select(id) {
    setSelectedId(id);
    setPulse((p) => ({ id, kind: "select", sequence: p.sequence + 1 }));
  }
  function toggle(task) {
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id ? { ...item, completed: !item.completed } : item,
      ),
    );
    setPulse((p) => ({
      id: task.id,
      kind: "complete",
      sequence: p.sequence + 1,
    }));
  }
  function addTask(event) {
    event.preventDefault();
    if (!text.trim()) return;
    const task = { id: makeId(), text: text.trim(), completed: false };
    setTasks((current) => [task, ...current]);
    setSelectedId(task.id);
    setFilter("all");
    setText("");
  }
  return (
    <div className="app-shell min-h-screen">
      <header className="site-header flex items-center justify-between gap-4">
        <a
          className="wordmark"
          href={import.meta.env.BASE_URL}
          aria-label="Neon Tasks Startseite"
        >
          <span className="brand-symbol" aria-hidden="true">
            ✳
          </span>{" "}
          NEON <span className="brand-slash">/</span> TASKS
        </a>
        <span className="local-badge">
          <i /> NUR AUF DIESEM GERÄT
        </span>
      </header>
      <main className="workspace">
        <section
          className="universe-section min-w-0"
          aria-labelledby="page-title"
        >
          <div className="hero-top flex justify-between gap-4">
            <span className="eyebrow">DEIN PERSÖNLICHER AUFGABENRAUM</span>
            <span className="edition">VOL. 02 / ORBIT</span>
          </div>
          <h1 id="page-title">
            Weniger Chaos.
            <br />
            <span>
              Mehr <em>Fokus.</em>
            </span>
          </h1>
          <TaskComposer
            id="new-task-mobile"
            className="mobile-composer"
            text={text}
            setText={setText}
            onSubmit={addTask}
          />
          <div className="stage-shell">
            <div className="stage-top flex justify-between items-center">
              <span className="eyebrow">
                <i className="status-dot" /> TASK UNIVERSE
              </span>
              <button
                className="motion-switch"
                aria-pressed={effectsEnabled}
                onClick={() => setEffectsEnabled((value) => !value)}
              >
                <span
                  className={
                    effectsEnabled ? "switch-light on" : "switch-light"
                  }
                />
                Bewegung {effectsEnabled ? "an" : "aus"}
              </button>
            </div>
            <div className="universe-stage" data-ready={ready}>
              <SceneBoundary>
                <Suspense
                  fallback={
                    <p className="scene-loading">Dein Raum entsteht …</p>
                  }
                >
                  <TaskUniverse
                    tasks={visible.slice(0, 12)}
                    selectedId={selected?.id}
                    onSelect={select}
                    effectsEnabled={effectsEnabled}
                    pulse={pulse}
                    onReady={setReady}
                  />
                </Suspense>
              </SceneBoundary>
            </div>
            <div className="stage-bottom flex justify-between gap-4">
              <span>
                {visible.length > 12
                  ? "12 im Raum · alle in der Liste"
                  : `${String(visible.length).padStart(2, "0")} Aufgaben im Raum`}
              </span>
              <span>BEWEGEN ↔ AUSWÄHLEN ↗</span>
            </div>
          </div>
          <div className="focus-card flex items-start gap-4">
            <span className="focus-cross" aria-hidden="true">
              ⌖
            </span>
            <div className="focus-content min-w-0 flex-1">
              <span className="eyebrow">
                {selected ? "IM FOKUS" : "RAUM FÜR DEINEN NÄCHSTEN SCHRITT"}
              </span>
              <p>
                {selected?.text ?? "Ein Gedanke. Eine Aufgabe. Los geht’s."}
              </p>
              {selected && (
                <span className="focus-status">
                  {selected.completed
                    ? "Erledigt. Platz für Neues."
                    : "Offen · Eine Sache nach der anderen."}
                </span>
              )}
            </div>
            {selected && (
              <button
                className={`focus-action ${selected.completed ? "done" : ""}`}
                onClick={() => toggle(selected)}
                aria-label={
                  selected.completed
                    ? "Fokusaufgabe wieder öffnen"
                    : "Fokusaufgabe erledigen"
                }
              >
                {selected.completed ? "↶" : "✓"}
                <span>
                  {selected.completed ? "Wieder öffnen" : "Erledigen"}
                </span>
              </button>
            )}
          </div>
        </section>
        <section className="task-space min-w-0" aria-labelledby="tasks-title">
          <div className="control-heading flex justify-between items-start">
            <div>
              <span className="eyebrow">VON GEDANKEN ZU TATEN</span>
              <h2 id="tasks-title">
                Deine Aufgaben<span>.</span>
              </h2>
            </div>
            <span className="corner-arrow" aria-hidden="true">
              <Arrow down />
            </span>
          </div>
          <div className="stats flex items-end justify-between">
            <div>
              <strong>{String(open).padStart(2, "0")}</strong>
              <span>offen</span>
            </div>
            <p>
              {completed} von {tasks.length} erledigt
              <br />
              <b>{progress}% geschafft</b>
            </p>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Erledigte Aufgaben"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <TaskComposer
            id="new-task"
            className="desktop-composer"
            text={text}
            setText={setText}
            onSubmit={addTask}
          />
          {warning && (
            <p role="status" className="storage-warning">
              {warning}
            </p>
          )}
          <div className="list-toolbar flex items-center justify-between">
            <div
              className="filters flex"
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
                  className={filter === value ? "filter selected" : "filter"}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="list-count">
              {String(visible.length).padStart(2, "0")}
            </span>
          </div>
          {visible.length ? (
            <ul className="task-list">
              {visible.map((task, index) => (
                <li
                  key={task.id}
                  className={`task-item flex items-start ${task.completed ? "completed" : ""} ${selected?.id === task.id ? "is-selected" : ""}`}
                >
                  <label className="check-target">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggle(task)}
                      aria-label={`Aufgabe ${task.completed ? "wieder öffnen" : "erledigen"}: ${task.text}`}
                    />
                    <span aria-hidden="true" />
                  </label>
                  <button
                    className="task-select min-w-0 flex-1"
                    onClick={() => select(task.id)}
                    aria-pressed={selected?.id === task.id}
                  >
                    <span className="task-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="task-text">{task.text}</span>
                  </button>
                  <button
                    className="delete-button"
                    aria-label={`Aufgabe löschen: ${task.text}`}
                    onClick={() =>
                      setTasks((current) =>
                        current.filter((item) => item.id !== task.id),
                      )
                    }
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <span className="empty-orbit" aria-hidden="true">
                ＋
              </span>
              <h3>
                {!tasks.length
                  ? "Noch alles möglich."
                  : filter === "active"
                    ? "Alles erledigt."
                    : "Hier ist noch alles offen."}
              </h3>
              <p>
                {!tasks.length
                  ? "Mach den ersten Schritt. Deine erste Aufgabe bringt den Raum in Bewegung."
                  : filter === "active"
                    ? "Genieß den freien Kopf. Du hast es geschafft."
                    : "Deine erledigten Aufgaben erscheinen hier."}
              </p>
            </div>
          )}
          <div className="list-footer">
            <span aria-hidden="true">↳</span> Kleine Schritte. Neue
            Umlaufbahnen.
          </div>
        </section>
      </main>
      <footer className="site-footer flex justify-between gap-4">
        <span>DEIN FOKUS HAT EIN UNIVERSUM.</span>
        <span>
          NEON / TASKS <b>© 2026</b>
        </span>
      </footer>
    </div>
  );
}
