import { useEffect, useState } from "react";
import { loadTasks, saveTasks } from "./storage";

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
function makeId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `task-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}
function Plus({ className = "" }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
export default function App() {
  const [initial] = useState(initialState);
  const [tasks, setTasks] = useState(initial.tasks);
  const [warning, setWarning] = useState(initial.warning);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    if (!saveTasks(initial.storage, tasks)) setWarning(warningText);
  }, [tasks, initial.storage]);
  const open = tasks.filter((task) => !task.completed).length;
  const visible = tasks.filter(
    (task) =>
      filter === "all" ||
      (filter === "active" ? !task.completed : task.completed),
  );
  function addTask(event) {
    event.preventDefault();
    if (!text.trim()) return;
    setTasks((current) => [
      { id: makeId(), text: text.trim(), completed: false },
      ...current,
    ]);
    setText("");
  }
  return (
    <div className="min-h-screen flex flex-col app-shell">
      <header className="site-header flex items-center justify-between gap-4">
        <a
          className="wordmark flex items-center gap-3"
          href="/"
          aria-label="Neon Tasks Startseite"
        >
          <span className="brand-symbol" aria-hidden="true">
            N
          </span>
          <span>
            NEON<span className="brand-slash"> / </span>TASKS
          </span>
        </a>
        <span className="local-badge">
          <i aria-hidden="true" /> LOKAL & PRIVAT
        </span>
      </header>
      <main className="workspace grid w-full mx-auto">
        <section className="task-space min-w-0" aria-labelledby="page-title">
          <div className="eyebrow flex items-center gap-3">
            <span className="small-line" /> DEIN TAG. DEIN SYSTEM.
          </div>
          <h1 id="page-title">
            Meine
            <br />
            <span>Aufgaben.</span>
          </h1>
          <p className="intro">
            Kopf frei. Fokus an.
            <br className="mobile-break" /> Mach Platz für das, was zählt.
          </p>
          <form onSubmit={addTask} className="task-form">
            <label htmlFor="new-task" className="input-label">
              WAS STEHT ALS NÄCHSTES AN?
            </label>
            <div className="input-row flex gap-2">
              <input
                id="new-task"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Eine neue Aufgabe …"
                autoComplete="off"
                className="min-w-0 flex-1"
              />
              <button
                type="submit"
                aria-label="Hinzufügen"
                className="add-button flex items-center justify-center gap-2"
              >
                <Plus />
                <span>Hinzufügen</span>
              </button>
            </div>
          </form>
          {warning && (
            <p role="status" className="storage-warning">
              {warning}
            </p>
          )}
          <section className="list-panel" aria-label="Aufgabenliste">
            <div className="list-toolbar flex items-center justify-between gap-3 flex-wrap">
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
                    type="button"
                    aria-pressed={filter === value}
                    onClick={() => setFilter(value)}
                    className={filter === value ? "filter selected" : "filter"}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="open-count" aria-live="polite">
                <b>{String(open).padStart(2, "0")}</b> offen
              </span>
            </div>
            {visible.length ? (
              <ul className="task-list">
                {visible.map((task) => (
                  <li
                    key={task.id}
                    className={`task-item flex items-start gap-3 ${task.completed ? "completed" : ""}`}
                  >
                    <label className="task-label flex items-start gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() =>
                          setTasks((current) =>
                            current.map((item) =>
                              item.id === task.id
                                ? { ...item, completed: !item.completed }
                                : item,
                            ),
                          )
                        }
                      />
                      <span className="task-text">{task.text}</span>
                    </label>
                    <button
                      type="button"
                      className="delete-button flex items-center justify-center"
                      aria-label={`Aufgabe löschen: ${task.text}`}
                      onClick={() =>
                        setTasks((current) =>
                          current.filter((item) => item.id !== task.id),
                        )
                      }
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 10v7M14 10v7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state flex flex-col items-center text-center">
                <div className="empty-icon" aria-hidden="true">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path
                      d="M7 5h18v23H7zM12 12h9M12 18h9M12 24h5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path d="m4 13 3 3 5-6" stroke="#c7ff6b" strokeWidth="2" />
                  </svg>
                </div>
                <h2>
                  {tasks.length === 0
                    ? "Alles beginnt mit einer Aufgabe."
                    : filter === "active"
                      ? "Alles erledigt. Gut gemacht."
                      : "Hier ist noch alles offen."}
                </h2>
                <p>
                  {tasks.length === 0
                    ? "Trag deinen nächsten Schritt ein. Den Rest machst du in deinem Tempo."
                    : filter === "active"
                      ? "Genieß den freien Kopf oder starte etwas Neues."
                      : "Deine erledigten Aufgaben erscheinen hier."}
                </p>
                <span className="empty-code" aria-hidden="true">
                  [ BEREIT FÜR DEINEN NÄCHSTEN SCHRITT ]
                </span>
              </div>
            )}
            <div className="list-footer flex items-center gap-2">
              <span aria-hidden="true">↳</span> Kleine Schritte. Großer
              Fortschritt.
            </div>
          </section>
        </section>
        <aside className="city-panel flex flex-col" aria-hidden="true">
          <div className="city-top flex justify-between">
            <span>FOCUS DISTRICT</span>
            <span>SEKTOR 01 ↗</span>
          </div>
          <div className="city-art">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <img src="/neon-city.svg" alt="" />
            <span className="art-coordinate">52° 31′ N / 13° 24′ E</span>
          </div>
          <div className="city-caption">
            <span className="eyebrow">WENIGER RAUSCHEN. MEHR RICHTUNG.</span>
            <h2>
              Find deinen
              <br />
              <em>Fokus.</em>
            </h2>
            <p>
              Eine Aufgabe nach der anderen.
              <br />
              Deine Stadt schläft nie. Du darfst es.
            </p>
          </div>
          <div className="city-bottom flex justify-between">
            <span>
              <i /> SYSTEM BEREIT
            </span>
            <span>+ + +</span>
          </div>
        </aside>
      </main>
      <footer className="site-footer flex justify-between gap-4">
        <span>DEIN FOKUS HAT EIN ZUHAUSE.</span>
        <span>
          NEON TASKS <span className="footer-version">/ V.01</span>
        </span>
      </footer>
    </div>
  );
}
