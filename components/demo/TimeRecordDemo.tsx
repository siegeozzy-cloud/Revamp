"use client";

/**
 * Demo 5 — Daily Time Record, as "Chronode".
 *
 * Identity: near-black terminal, monospace numerals, a single green status
 * light. A time clock is read at a glance from two metres away, so the live
 * figure is the hero and everything else is small.
 *
 * Try it: clock in, take a break, clock out. The running total, today's row in
 * the timesheet and Friday's bar are the same number, so they move together.
 */

import { useEffect, useRef, useState } from "react";
import { Bars, SERIES_DARK } from "./viz";

const INK = { grid: "#222a36", muted: "#8a97a8", strong: "#eaf0f6", surface: "#141a23" };
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const GREEN = "#2fbf71";
const AMBER = "#d9a53b";

type Status = "out" | "in" | "break";

const STATUS_META: Record<Status, { label: string; color: string }> = {
  out: { label: "Clocked out", color: "#6b7a8d" },
  in: { label: "On the clock", color: GREEN },
  break: { label: "On break", color: AMBER },
};

const WEEK = [
  { day: "Mon", date: "Nov 10", in: "08:02", out: "17:30", hours: 8.9 },
  { day: "Tue", date: "Nov 11", in: "07:58", out: "17:04", hours: 8.6 },
  { day: "Wed", date: "Nov 12", in: "08:15", out: "16:20", hours: 7.4 },
  { day: "Thu", date: "Nov 13", in: "08:00", out: "18:45", hours: 10.2 },
];

const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");
const hms = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)}`;
};
const clockOf = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function TimeRecordDemo() {
  const [now, setNow] = useState<Date | null>(null); // null until mounted — the server has no clock
  const [status, setStatus] = useState<Status>("out");
  const [workedMs, setWorkedMs] = useState(0);
  const [breakMs, setBreakMs] = useState(0);
  const [log, setLog] = useState<{ at: string; what: string }[]>([]);
  const [firstIn, setFirstIn] = useState<string | null>(null);
  const [lastOut, setLastOut] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const since = useRef<number>(0);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Accrue into whichever bucket the current status owns, then restart the span.
  const settle = () => {
    const spent = Date.now() - since.current;
    if (status === "in") setWorkedMs((v) => v + spent);
    if (status === "break") setBreakMs((v) => v + spent);
    since.current = Date.now();
  };

  const liveWorked = workedMs + (status === "in" && now ? Date.now() - since.current : 0);
  const liveBreak = breakMs + (status === "break" && now ? Date.now() - since.current : 0);
  const todayHours = liveWorked / 3_600_000;

  const act = (next: Status, what: string) => {
    settle();
    const stamp = clockOf(new Date());
    if (next === "in" && !firstIn) setFirstIn(stamp);
    if (next === "out") setLastOut(stamp);
    setStatus(next);
    setLog((prev) => [{ at: stamp, what }, ...prev].slice(0, 6));
  };

  const regular = Math.min(8, todayHours);
  const overtime = Math.max(0, todayHours - 8);
  const undertime = Math.max(0, 8 - todayHours);
  const weekTotal = WEEK.reduce((a, d) => a + d.hours, 0) + todayHours;

  return (
    <div className="flex h-full flex-col bg-[#0c1016] text-[#eaf0f6]" style={{ fontFamily: MONO }}>
      <header className="flex items-center gap-3 border-b border-[#1c2430] px-4 py-3 sm:px-5">
        <span className="flex items-center gap-2 text-sm font-semibold tracking-[0.18em] uppercase">
          <span className="grid h-7 w-7 place-items-center rounded-md border border-[#2a3444] text-[#8a97a8]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5V12l3 2" strokeLinecap="round" />
            </svg>
          </span>
          Chronode
        </span>
        <span className="ml-auto flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: STATUS_META[status].color, boxShadow: `0 0 10px ${STATUS_META[status].color}` }}
          />
          <span style={{ color: STATUS_META[status].color }}>{STATUS_META[status].label}</span>
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-5">
        <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_1.15fr]">
          {/* The clock column */}
          <section className="rounded-2xl border border-[#1c2430] bg-[#111721] p-5">
            <p className="text-[11px] tracking-[0.2em] text-[#8a97a8] uppercase">Employee</p>
            <p className="mt-1 text-sm">R. Mendoza · ID 2041 · Warehouse</p>

            <p className="mt-5 text-[11px] tracking-[0.2em] text-[#8a97a8] uppercase">Time now</p>
            <p className="text-3xl tabular-nums">
              {now ? `${clockOf(now)}:${pad(now.getSeconds())}` : "--:--:--"}
            </p>

            <p className="mt-5 text-[11px] tracking-[0.2em] text-[#8a97a8] uppercase">Worked today</p>
            <p className="text-5xl leading-none font-semibold tabular-nums" style={{ color: STATUS_META[status].color }}>
              {hms(liveWorked)}
            </p>
            <p className="mt-2 text-xs text-[#8a97a8]">
              Break {hms(liveBreak)} · In {firstIn ?? "--:--"} · Out {lastOut ?? "--:--"}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {status === "out" ? (
                <button
                  type="button"
                  onClick={() => act("in", "Clocked in")}
                  className="col-span-2 rounded-xl py-3 text-sm font-semibold tracking-wide text-[#06130c] uppercase"
                  style={{ background: GREEN }}
                >
                  Clock in
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      status === "break" ? act("in", "Back from break") : act("break", "Break started")
                    }
                    className="rounded-xl border py-3 text-sm font-semibold tracking-wide uppercase"
                    style={{ borderColor: AMBER, color: AMBER }}
                  >
                    {status === "break" ? "Resume" : "Break"}
                  </button>
                  <button
                    type="button"
                    onClick={() => act("out", "Clocked out")}
                    className="rounded-xl border border-[#4a2630] py-3 text-sm font-semibold tracking-wide text-[#e8949c] uppercase"
                  >
                    Clock out
                  </button>
                </>
              )}
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[
                ["Regular", regular],
                ["Overtime", overtime],
                ["Undertime", undertime],
              ].map(([label, v]) => (
                <div key={label as string} className="rounded-xl border border-[#1c2430] bg-[#0e141d] px-2 py-2.5">
                  <dt className="text-[10px] tracking-[0.14em] text-[#8a97a8] uppercase">{label}</dt>
                  <dd className="mt-1 text-lg tabular-nums">{(v as number).toFixed(2)}h</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5">
              <p className="text-[11px] tracking-[0.2em] text-[#8a97a8] uppercase">Punch log</p>
              <ul className="mt-2 flex flex-col gap-1 text-xs">
                {log.length === 0 && <li className="text-[#64748b]">No punches yet — clock in above.</li>}
                {log.map((l, i) => (
                  <li key={`${l.at}-${i}`} className="flex gap-3">
                    <span className="text-[#8a97a8] tabular-nums">{l.at}</span>
                    <span>{l.what}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* The record column */}
          <section className="flex flex-col gap-4">
            <div className="rounded-2xl border border-[#1c2430] bg-[#111721] p-4">
              <div className="flex items-center gap-3">
                <h4 className="text-[11px] tracking-[0.2em] text-[#8a97a8] uppercase">Hours this week</h4>
                <p className="ml-auto text-sm tabular-nums">
                  {weekTotal.toFixed(2)}h <span className="text-[#8a97a8]">/ 40.00h</span>
                </p>
              </div>
              <Bars
                ink={INK}
                height={168}
                unit="h"
                format={(v) => `${v}`}
                labels={[...WEEK.map((d) => d.day), "Fri"]}
                series={[
                  {
                    name: "Hours worked",
                    color: SERIES_DARK[0],
                    values: [...WEEK.map((d) => d.hours), Number(todayHours.toFixed(2))],
                  },
                ]}
              />
            </div>

            <div className="flex flex-1 flex-col rounded-2xl border border-[#1c2430] bg-[#111721]">
              <div className="flex items-center gap-3 border-b border-[#1c2430] px-4 py-3">
                <h4 className="text-[11px] tracking-[0.2em] text-[#8a97a8] uppercase">Timesheet</h4>
                <button
                  type="button"
                  onClick={() => setToast("Demo only — the real build exports payroll-ready CSV.")}
                  className="ml-auto rounded-lg border border-[#2a3444] px-2.5 py-1 text-[11px] text-[#c3cedb] transition-colors hover:border-[#2fbf71] hover:text-[#2fbf71]"
                >
                  Export CSV
                </button>
              </div>

              <div className="grid grid-cols-[4.5rem_1fr_1fr_3.2rem_3.2rem] gap-x-2 px-4 py-2 text-[10px] tracking-[0.1em] text-[#64748b] uppercase">
                <span>Date</span>
                <span>In</span>
                <span>Out</span>
                <span className="text-right">Hrs</span>
                <span className="text-right">OT</span>
              </div>

              <ul className="divide-y divide-[#171f29]">
                {WEEK.map((d) => (
                  <li
                    key={d.day}
                    className="grid grid-cols-[4.5rem_1fr_1fr_3.2rem_3.2rem] gap-x-2 px-4 py-2 text-xs tabular-nums"
                  >
                    <span className="text-[#8a97a8]">{d.day}</span>
                    <span>{d.in}</span>
                    <span>{d.out}</span>
                    <span className="text-right">{d.hours.toFixed(1)}</span>
                    <span className="text-right" style={{ color: d.hours > 8 ? GREEN : "#64748b" }}>
                      {Math.max(0, d.hours - 8).toFixed(1)}
                    </span>
                  </li>
                ))}
                <li className="grid grid-cols-[4.5rem_1fr_1fr_3.2rem_3.2rem] gap-x-2 bg-[#0e1620] px-4 py-2 text-xs tabular-nums">
                  <span style={{ color: GREEN }}>Fri</span>
                  <span>{firstIn ?? "--:--"}</span>
                  <span>{lastOut ?? (status === "out" ? "--:--" : "running")}</span>
                  <span className="text-right">{todayHours.toFixed(1)}</span>
                  <span className="text-right" style={{ color: overtime > 0 ? GREEN : "#64748b" }}>
                    {overtime.toFixed(1)}
                  </span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      {toast && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center p-4">
          <p className="flex items-center gap-3 rounded-xl border border-[#2a3444] bg-[#141a23] px-4 py-2.5 text-xs shadow-xl">
            {toast}
            <button type="button" onClick={() => setToast(null)} className="text-[#8a97a8] hover:text-white">
              ✕
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
