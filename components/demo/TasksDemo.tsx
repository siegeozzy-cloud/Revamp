"use client";

/**
 * Demo 4 — Task Management, as "Fleetboard".
 *
 * Identity: soft lavender paper, violet accent, rounded everything. Cards move
 * with arrow buttons rather than drag-and-drop on purpose — the carousel owns
 * the horizontal drag gesture, and two drag systems on one screen fight.
 *
 * Try it: add a task, move it between columns, tick it off, filter by person,
 * or switch the whole board to a list.
 */

import { useMemo, useState } from "react";
import { MeterRing } from "./viz";

const INK = { grid: "#e7e4f4", muted: "#6e6a86", strong: "#1d1a2e", surface: "#ffffff" };
const VIOLET = "#6250d6";

const COLUMNS = ["To do", "In progress", "Done"] as const;
type Column = (typeof COLUMNS)[number];

const PEOPLE = [
  { id: "ks", name: "Kim S.", color: "#2a78d6" },
  { id: "ja", name: "Jay A.", color: "#eb6834" },
  { id: "mv", name: "Mara V.", color: "#1baf7a" },
];

const PRIORITY = {
  High: { bg: "#fdeceb", fg: "#a6322f" },
  Medium: { bg: "#fdf3e4", fg: "#8a5a0b" },
  Low: { bg: "#eef1f6", fg: "#4c5668" },
} as const;

interface Task {
  id: number;
  title: string;
  column: Column;
  owner: string;
  priority: keyof typeof PRIORITY;
  due: string;
  tag: string;
}

const SEED: Task[] = [
  { id: 1, title: "Draft the Q1 rollout plan", column: "To do", owner: "ks", priority: "High", due: "Nov 14", tag: "Planning" },
  { id: 2, title: "Collect branch stock counts", column: "To do", owner: "mv", priority: "Medium", due: "Nov 15", tag: "Ops" },
  { id: 3, title: "Rewrite onboarding emails", column: "To do", owner: "ja", priority: "Low", due: "Nov 20", tag: "Content" },
  { id: 4, title: "Migrate payroll exports", column: "In progress", owner: "ks", priority: "High", due: "Nov 12", tag: "Finance" },
  { id: 5, title: "Supplier portal walkthrough", column: "In progress", owner: "mv", priority: "Medium", due: "Nov 13", tag: "Training" },
  { id: 6, title: "Approve warehouse layout", column: "Done", owner: "ja", priority: "Medium", due: "Nov 7", tag: "Ops" },
  { id: 7, title: "Close October books", column: "Done", owner: "ks", priority: "High", due: "Nov 5", tag: "Finance" },
];

export function TasksDemo() {
  const [tasks, setTasks] = useState<Task[]>(SEED);
  const [owner, setOwner] = useState<string | null>(null);
  const [view, setView] = useState<"board" | "list">("board");
  const [draft, setDraft] = useState("");

  const visible = useMemo(
    () => tasks.filter((t) => !owner || t.owner === owner),
    [tasks, owner],
  );
  const done = visible.filter((t) => t.column === "Done").length;

  const move = (id: number, dir: 1 | -1) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, column: COLUMNS[Math.max(0, Math.min(2, COLUMNS.indexOf(t.column) + dir))] }
          : t,
      ),
    );

  const setColumn = (id: number, column: Column) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, column } : t)));

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setTasks((prev) => [
      {
        id: Math.max(0, ...prev.map((t) => t.id)) + 1,
        title,
        column: "To do",
        owner: owner ?? PEOPLE[0].id,
        priority: "Medium",
        due: "Nov 21",
        tag: "New",
      },
      ...prev,
    ]);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col bg-[#f6f5fc] text-[#1d1a2e]">
      <header className="flex flex-wrap items-center gap-3 border-b border-[#e7e4f4] bg-white px-4 py-3 sm:px-5">
        <span className="flex items-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center rounded-xl text-white"
            style={{ background: VIOLET }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12.5 9.5 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>
            <span className="block text-sm leading-tight font-semibold">Fleetboard</span>
            <span className="block text-[11px] text-[#6e6a86]">Warehouse migration</span>
          </span>
        </span>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-full bg-[#f1eefb] p-0.5">
            {(["board", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className="rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors"
                style={{
                  background: view === v ? "#ffffff" : "transparent",
                  color: view === v ? VIOLET : "#6e6a86",
                  boxShadow: view === v ? "0 1px 2px rgba(29,26,46,.12)" : undefined,
                }}
              >
                {v}
              </button>
            ))}
          </div>
          <span className="hidden items-center -space-x-1.5 sm:flex">
            {PEOPLE.map((p) => (
              <span
                key={p.id}
                title={p.name}
                className="grid h-7 w-7 place-items-center rounded-full border-2 border-white text-[10px] font-semibold text-white"
                style={{ background: p.color }}
              >
                {p.name.slice(0, 1)}
                {p.name.split(" ")[1]?.slice(0, 1)}
              </span>
            ))}
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={add} className="flex min-w-0 flex-1 items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a task and press enter…"
              className="min-w-0 flex-1 rounded-xl border border-[#e2def2] bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-[#9b96b4] focus:border-[#6250d6]"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
              style={{ background: VIOLET }}
            >
              Add
            </button>
          </form>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#6e6a86]">Assignee</span>
          <button
            type="button"
            onClick={() => setOwner(null)}
            aria-pressed={owner === null}
            className="rounded-full border px-3 py-1 text-xs"
            style={{
              borderColor: owner === null ? VIOLET : "#e2def2",
              color: owner === null ? VIOLET : "#6e6a86",
              background: owner === null ? "#f1eefb" : "#ffffff",
            }}
          >
            Everyone
          </button>
          {PEOPLE.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setOwner(owner === p.id ? null : p.id)}
              aria-pressed={owner === p.id}
              className="flex items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-xs"
              style={{
                borderColor: owner === p.id ? VIOLET : "#e2def2",
                color: owner === p.id ? VIOLET : "#6e6a86",
                background: owner === p.id ? "#f1eefb" : "#ffffff",
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
              {p.name}
            </button>
          ))}

          <div className="ml-auto hidden rounded-2xl border border-[#e7e4f4] bg-white px-3 py-1.5 sm:block">
            <MeterRing
              value={done}
              total={visible.length}
              color={VIOLET}
              track="#eceaf8"
              ink={INK}
              caption="tasks complete"
              size={64}
            />
          </div>
        </div>

        {view === "board" ? (
          <div className="mt-4 grid flex-1 gap-3 lg:grid-cols-3">
            {COLUMNS.map((col) => {
              const list = visible.filter((t) => t.column === col);
              return (
                <section key={col} className="flex flex-col rounded-2xl bg-[#eeecf8] p-2.5">
                  <div className="flex items-center gap-2 px-1.5 py-1">
                    <h4 className="text-xs font-semibold">{col}</h4>
                    <span className="rounded-full bg-white px-1.5 text-[11px] text-[#6e6a86] tabular-nums">
                      {list.length}
                    </span>
                  </div>
                  <ul className="mt-1.5 flex flex-col gap-2">
                    {list.map((t) => {
                      const person = PEOPLE.find((p) => p.id === t.owner)!;
                      const isDone = t.column === "Done";
                      return (
                        <li
                          key={t.id}
                          className="rounded-xl bg-white p-3 shadow-[0_1px_2px_rgba(29,26,46,.06)]"
                        >
                          <div className="flex items-start gap-2.5">
                            <button
                              type="button"
                              onClick={() => setColumn(t.id, isDone ? "To do" : "Done")}
                              aria-label={isDone ? `Reopen ${t.title}` : `Complete ${t.title}`}
                              className="mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-md border transition-colors"
                              style={{
                                borderColor: isDone ? VIOLET : "#cfc9e8",
                                background: isDone ? VIOLET : "#fff",
                              }}
                            >
                              {isDone && (
                                <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3.5">
                                  <path d="m5 12.5 5 5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                            <p
                              className="min-w-0 flex-1 text-sm leading-snug font-medium"
                              style={{ textDecoration: isDone ? "line-through" : undefined, opacity: isDone ? 0.55 : 1 }}
                            >
                              {t.title}
                            </p>
                          </div>

                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-7">
                            <span
                              className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                              style={{ background: PRIORITY[t.priority].bg, color: PRIORITY[t.priority].fg }}
                            >
                              {t.priority}
                            </span>
                            <span className="rounded-md bg-[#f3f2fa] px-1.5 py-0.5 text-[10px] text-[#6e6a86]">
                              {t.tag}
                            </span>
                            <span className="text-[10px] text-[#9b96b4]">{t.due}</span>
                            <span
                              className="ml-auto grid h-6 w-6 place-items-center rounded-full text-[9px] font-semibold text-white"
                              title={person.name}
                              style={{ background: person.color }}
                            >
                              {person.name.slice(0, 1)}
                              {person.name.split(" ")[1]?.slice(0, 1)}
                            </span>
                          </div>

                          <div className="mt-2 flex gap-1 pl-7">
                            <MoveButton
                              dir={-1}
                              disabled={t.column === COLUMNS[0]}
                              onClick={() => move(t.id, -1)}
                              label={`Move ${t.title} left`}
                            />
                            <MoveButton
                              dir={1}
                              disabled={t.column === COLUMNS[2]}
                              onClick={() => move(t.id, 1)}
                              label={`Move ${t.title} right`}
                            />
                          </div>
                        </li>
                      );
                    })}
                    {list.length === 0 && (
                      <li className="rounded-xl border border-dashed border-[#d9d4ee] px-3 py-6 text-center text-[11px] text-[#9b96b4]">
                        Nothing here
                      </li>
                    )}
                  </ul>
                </section>
              );
            })}
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-[#eeecf8] overflow-hidden rounded-2xl border border-[#e7e4f4] bg-white">
            {visible.map((t) => {
              const person = PEOPLE.find((p) => p.id === t.owner)!;
              const isDone = t.column === "Done";
              return (
                <li key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3.5 py-2.5">
                  <button
                    type="button"
                    onClick={() => setColumn(t.id, isDone ? "To do" : "Done")}
                    aria-label={isDone ? `Reopen ${t.title}` : `Complete ${t.title}`}
                    className="grid h-4.5 w-4.5 shrink-0 place-items-center rounded-md border"
                    style={{ borderColor: isDone ? VIOLET : "#cfc9e8", background: isDone ? VIOLET : "#fff" }}
                  >
                    {isDone && (
                      <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3.5">
                        <path d="m5 12.5 5 5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span
                    className="min-w-0 flex-1 truncate text-sm font-medium"
                    style={{ textDecoration: isDone ? "line-through" : undefined, opacity: isDone ? 0.55 : 1 }}
                  >
                    {t.title}
                  </span>
                  <span
                    className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                    style={{ background: PRIORITY[t.priority].bg, color: PRIORITY[t.priority].fg }}
                  >
                    {t.priority}
                  </span>
                  <span className="text-[11px] text-[#9b96b4]">{t.due}</span>
                  <span
                    className="grid h-6 w-6 place-items-center rounded-full text-[9px] font-semibold text-white"
                    style={{ background: person.color }}
                    title={person.name}
                  >
                    {person.name.slice(0, 1)}
                    {person.name.split(" ")[1]?.slice(0, 1)}
                  </span>
                  <select
                    value={t.column}
                    onChange={(e) => setColumn(t.id, e.target.value as Column)}
                    aria-label={`Status for ${t.title}`}
                    className="rounded-lg border border-[#e2def2] bg-white px-2 py-1 text-xs outline-none focus:border-[#6250d6]"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function MoveButton({
  dir,
  disabled,
  onClick,
  label,
}: {
  dir: 1 | -1;
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-6 w-7 place-items-center rounded-md border border-[#e2def2] text-[#6e6a86] transition-colors enabled:hover:border-[#6250d6] enabled:hover:text-[#6250d6] disabled:opacity-30"
    >
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.6">
        <path
          d={dir === 1 ? "M6 12h12m0 0-4-4m4 4-4 4" : "M18 12H6m0 0 4-4m-4 4 4 4"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
