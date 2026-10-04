import { useEffect, useRef, useState } from "react";
import { createUniverse } from "./universe.js";

export function TaskUniverse({
  tasks = [],
  selectedId,
  onSelect,
  effectsEnabled = true,
  pulse,
  onReady,
}) {
  const host = useRef(null);
  const controller = useRef(null);
  const latest = useRef({ onSelect, onReady });
  latest.current = { onSelect, onReady };
  const [positions, setPositions] = useState([]);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    try {
      controller.current = createUniverse(host.current, {
        onSelect: (id) => latest.current.onSelect?.(id),
        onPositions: setPositions,
        onReady: (value) => {
          setReady(value);
          latest.current.onReady?.(value);
        },
      });
    } catch {
      setReady(false);
      latest.current.onReady?.(false);
      host.current?.replaceChildren();
    }
    return () => {
      controller.current?.dispose();
      controller.current = null;
    };
  }, []);
  useEffect(() => {
    controller.current?.update({
      tasks,
      selectedId,
      effectsEnabled: effectsEnabled && !reduced,
      pulse,
    });
  }, [tasks, selectedId, effectsEnabled, reduced, pulse]);
  const visibleTasks = tasks.slice(0, 12);
  return (
    <div
      className="task-universe"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 320,
      }}
    >
      <div
        ref={host}
        className="task-universe-canvas"
        aria-hidden="true"
        style={{ position: "absolute", inset: 0 }}
      />
      {ready ? (
        <div
          className="universe-labels"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          {visibleTasks.map((task, index) => {
            const position = positions.find((p) => p.id === task.id);
            return (
              <button
                key={task.id}
                type="button"
                className={`universe-label${selectedId === task.id ? " is-selected" : ""}${task.completed ? " is-completed" : ""}`}
                aria-label={`Aufgabe auswählen: ${task.text}`}
                aria-pressed={selectedId === task.id}
                onClick={() => onSelect?.(task.id)}
                style={{
                  position: "absolute",
                  left: position?.x ?? "50%",
                  top: position?.y ?? "50%",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "auto",
                  minHeight: 44,
                  maxWidth: 150,
                  opacity: position?.visible === false ? 0 : 1,
                  visibility:
                    position?.visible === false ? "hidden" : "visible",
                }}
              >
                <span className="universe-label-number">
                  {String(index + 1).padStart(2, "0")}
                </span>{" "}
                <span>
                  {task.text.length > 28
                    ? `${task.text.slice(0, 27)}…`
                    : task.text}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div
          className="universe-fallback"
          role="status"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeContent: "center",
            textAlign: "center",
            padding: 24,
          }}
        >
          Dein Aufgabenraum ist im Listenmodus verfügbar.
        </div>
      )}
    </div>
  );
}
export default TaskUniverse;
