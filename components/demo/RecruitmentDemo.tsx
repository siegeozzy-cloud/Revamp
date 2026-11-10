"use client";

/**
 * Demo 3 — Recruitment Portal, as "Talentline".
 *
 * Identity: dark navy console, amber chrome, tight uppercase labels. The one
 * dark UI in the set, so the carousel never shows two demos that read alike.
 *
 * Try it: filter by role, open a candidate, advance or reject them. The stage
 * funnel on the left is the same state as the board, so it moves with you.
 */

import { useMemo, useState } from "react";
import { BLUE_RAMP, StageBars } from "./viz";

const INK = { grid: "#24304a", muted: "#93a1bd", strong: "#eef2f9", surface: "#161f33" };
const AMBER = "#f0b429";
const STAGES = ["Applied", "Screening", "Interview", "Offer"] as const;
type Stage = (typeof STAGES)[number] | "Hired" | "Rejected";

/** Ordinal ramp: light -> dark across the funnel, validated for a dark surface. */
const STAGE_COLOR = [BLUE_RAMP[2], BLUE_RAMP[4], BLUE_RAMP[6], BLUE_RAMP[7]];

interface Candidate {
  id: number;
  name: string;
  initials: string;
  role: string;
  stage: Stage;
  score: number;
  years: number;
  applied: string;
  skills: string[];
  note: string;
}

const ROLES = ["All roles", "Backend Engineer", "UI Designer", "QA Analyst", "Project Lead"];

const SEED: Candidate[] = [
  { id: 1, name: "Marinel Cruz", initials: "MC", role: "Backend Engineer", stage: "Applied", score: 86, years: 5, applied: "2d ago", skills: ["Node", "Postgres", "AWS"], note: "Built a payments service used by 40k merchants." },
  { id: 2, name: "Jomar De Leon", initials: "JD", role: "QA Analyst", stage: "Applied", score: 71, years: 3, applied: "3d ago", skills: ["Playwright", "SQL"], note: "Automated a regression suite from scratch." },
  { id: 3, name: "Alyssa Ramos", initials: "AR", role: "UI Designer", stage: "Screening", score: 92, years: 6, applied: "5d ago", skills: ["Figma", "Design systems"], note: "Ran the rebrand of a 300-screen product." },
  { id: 4, name: "Paolo Villar", initials: "PV", role: "Backend Engineer", stage: "Screening", score: 64, years: 2, applied: "6d ago", skills: ["Go", "Redis"], note: "Strong fundamentals, light on scale experience." },
  { id: 5, name: "Hannah Lim", initials: "HL", role: "Project Lead", stage: "Interview", score: 88, years: 8, applied: "1w ago", skills: ["Delivery", "Scrum", "Budgeting"], note: "Shipped two ERP rollouts in retail." },
  { id: 6, name: "Rafael Uy", initials: "RU", role: "UI Designer", stage: "Interview", score: 79, years: 4, applied: "1w ago", skills: ["Motion", "Prototyping"], note: "Portfolio leans heavily on marketing sites." },
  { id: 7, name: "Trisha Bautista", initials: "TB", role: "Backend Engineer", stage: "Offer", score: 94, years: 7, applied: "2w ago", skills: ["Python", "Kafka", "K8s"], note: "Reference check cleared. Offer sent Monday." },
  { id: 8, name: "Enzo Salcedo", initials: "ES", role: "QA Analyst", stage: "Applied", score: 68, years: 1, applied: "1d ago", skills: ["Cypress", "Jira"], note: "Career shifter from manufacturing QA. Sharp on process." },
  { id: 9, name: "Bea Fontanilla", initials: "BF", role: "Project Lead", stage: "Screening", score: 83, years: 9, applied: "4d ago", skills: ["PMP", "Vendor mgmt"], note: "Ran a 40-branch POS migration end to end." },
  { id: 10, name: "Nico Agustin", initials: "NA", role: "UI Designer", stage: "Interview", score: 75, years: 3, applied: "6d ago", skills: ["Figma", "Research"], note: "Strong research notes, portfolio still thin on enterprise work." },
  { id: 11, name: "Karla Ocampo", initials: "KO", role: "Backend Engineer", stage: "Applied", score: 81, years: 4, applied: "2d ago", skills: ["Java", "Oracle"], note: "Maintained a payroll engine for 6,000 employees." },
];

export function RecruitmentDemo() {
  const [people, setPeople] = useState<Candidate[]>(SEED);
  const [role, setRole] = useState(ROLES[0]);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [column, setColumn] = useState(0); // phone layout shows one stage at a time

  const filtered = useMemo(
    () =>
      people.filter(
        (p) =>
          (role === ROLES[0] || p.role === role) &&
          (!query.trim() || p.name.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [people, role, query],
  );

  const open = people.find((p) => p.id === openId) ?? null;
  const hired = people.filter((p) => p.stage === "Hired").length;
  const rejected = people.filter((p) => p.stage === "Rejected").length;

  const move = (id: number, dir: 1 | -1) =>
    setPeople((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const i = STAGES.indexOf(p.stage as (typeof STAGES)[number]);
        if (i === -1) return p;
        if (dir === 1 && i === STAGES.length - 1) return { ...p, stage: "Hired" };
        return { ...p, stage: STAGES[Math.max(0, Math.min(STAGES.length - 1, i + dir))] };
      }),
    );

  const reject = (id: number) => {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, stage: "Rejected" } : p)));
    setOpenId(null);
  };

  return (
    <div className="flex h-full flex-col bg-[#0e1627] text-[#eef2f9]">
      <header className="flex flex-wrap items-center gap-3 border-b border-[#1e2940] px-4 py-3 sm:px-5">
        <p className="flex items-center gap-2 text-sm font-semibold tracking-[0.2em] uppercase">
          <span className="grid h-7 w-7 place-items-center rounded-md text-[#0e1627]" style={{ background: AMBER }}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 20v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1" strokeLinecap="round" />
              <circle cx="12" cy="7" r="3.5" />
            </svg>
          </span>
          Talentline
        </p>

        <div className="ml-auto flex w-full items-center gap-2 sm:w-auto">
          <label className="relative flex-1 sm:w-48 sm:flex-none">
            <span className="sr-only">Search candidates</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name"
              className="w-full rounded-lg border border-[#24304a] bg-[#131c2e] px-3 py-1.5 text-xs outline-none placeholder:text-[#64739a] focus:border-[#f0b429]"
            />
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            aria-label="Filter by role"
            className="rounded-lg border border-[#24304a] bg-[#131c2e] px-2.5 py-1.5 text-xs outline-none focus:border-[#f0b429]"
          >
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-5">
        <div className="grid flex-1 gap-4 lg:grid-cols-[14rem_1fr]">
          {/* Same trick as the scheduler: the board is what a phone visitor wants
              first, so the readouts drop below it until there is room beside. */}
          <aside className="contents lg:flex lg:flex-col lg:gap-3">
            <section className="order-2 rounded-xl border border-[#1e2940] bg-[#131c2e] p-4 lg:order-none">
              <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[#93a1bd] uppercase">Pipeline</h3>
              <div className="mt-3">
                <StageBars
                  ink={INK}
                  rows={STAGES.map((s, i) => ({
                    name: s,
                    value: filtered.filter((p) => p.stage === s).length,
                    color: STAGE_COLOR[i],
                  }))}
                />
              </div>
            </section>

            <div className="order-3 grid grid-cols-2 gap-3 lg:order-none">
              <StatBox label="Hired" value={hired} accent={AMBER} />
              <StatBox label="Rejected" value={rejected} accent="#64739a" />
            </div>

            <section className="order-4 hidden rounded-xl border border-[#1e2940] bg-[#131c2e] p-4 lg:order-none lg:block">
              <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[#93a1bd] uppercase">
                Time to hire
              </h3>
              <p className="mt-2 text-3xl font-semibold tabular-nums">18<span className="text-base text-[#93a1bd]"> days</span></p>
              <p className="mt-1 text-xs text-[#93a1bd]">Median, last 12 roles filled.</p>
            </section>

            {/* Doubles as the role filter, so the sidebar is not just a readout. */}
            <section className="order-5 hidden flex-1 rounded-xl border border-[#1e2940] bg-[#131c2e] p-4 lg:order-none lg:block">
              <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[#93a1bd] uppercase">
                Open roles
              </h3>
              <ul className="mt-3 flex flex-col gap-1">
                {ROLES.slice(1).map((r) => {
                  const n = people.filter((p) => p.role === r && p.stage !== "Rejected" && p.stage !== "Hired").length;
                  const on = role === r;
                  return (
                    <li key={r}>
                      <button
                        type="button"
                        onClick={() => setRole(on ? ROLES[0] : r)}
                        aria-pressed={on}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors"
                        style={{ background: on ? "#1d2940" : "transparent", color: on ? AMBER : "#c5cee2" }}
                      >
                        <span className="truncate">{r}</span>
                        <span className="ml-auto text-[11px] text-[#93a1bd] tabular-nums">{n}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </aside>

          <section className="order-1 flex flex-col lg:order-none">
            <div className="mb-3 flex gap-1.5 sm:hidden">
              {STAGES.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setColumn(i)}
                  aria-pressed={i === column}
                  className="flex-1 rounded-lg border px-1 py-1.5 text-[10px] font-medium"
                  style={{
                    borderColor: i === column ? AMBER : "#24304a",
                    color: i === column ? AMBER : "#93a1bd",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {STAGES.map((stage, i) => {
                const list = filtered.filter((p) => p.stage === stage);
                return (
                  <div
                    key={stage}
                    className={`flex flex-col rounded-xl border border-[#1e2940] bg-[#131c2e] p-2.5 ${
                      i === column ? "" : "hidden sm:flex"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <span className="h-2 w-2 rounded-full" style={{ background: STAGE_COLOR[i] }} />
                      <h4 className="text-[11px] font-semibold tracking-[0.14em] uppercase">{stage}</h4>
                      <span className="ml-auto text-[11px] text-[#93a1bd] tabular-nums">{list.length}</span>
                    </div>

                    <ul className="flex flex-col gap-2">
                      {list.map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => setOpenId(p.id)}
                            className="w-full rounded-lg border border-[#243150] bg-[#182238] p-2.5 text-left transition-colors hover:border-[#f0b429]/60"
                          >
                            <span className="flex items-center gap-2">
                              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#24304a] text-[10px] font-semibold">
                                {p.initials}
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-semibold">{p.name}</span>
                                <span className="block truncate text-[10px] text-[#93a1bd]">{p.role}</span>
                              </span>
                              <span className="ml-auto text-xs font-semibold tabular-nums" style={{ color: AMBER }}>
                                {p.score}
                              </span>
                            </span>
                            <span className="mt-2 flex flex-wrap gap-1">
                              {p.skills.slice(0, 2).map((s) => (
                                <span
                                  key={s}
                                  className="rounded border border-[#2b3858] px-1.5 py-0.5 text-[9px] text-[#aab6d1]"
                                >
                                  {s}
                                </span>
                              ))}
                            </span>
                          </button>
                        </li>
                      ))}
                      {list.length === 0 && (
                        <li className="rounded-lg border border-dashed border-[#243150] px-2 py-6 text-center text-[11px] text-[#64739a]">
                          Empty
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {open && (
        <div className="absolute inset-0 z-20 flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpenId(null)}
            className="absolute inset-0 bg-[#060a13]/70"
          />
          <div className="relative m-3 w-full max-w-md rounded-2xl border border-[#243150] bg-[#131c2e] p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#24304a] text-sm font-semibold">
                {open.initials}
              </span>
              <div className="min-w-0">
                <h4 className="text-base font-semibold">{open.name}</h4>
                <p className="text-xs text-[#93a1bd]">
                  {open.role} · {open.years} yrs · applied {open.applied}
                </p>
              </div>
              <span
                className="ml-auto rounded-md px-2 py-1 text-xs font-semibold text-[#0e1627]"
                style={{ background: AMBER }}
              >
                {open.score}
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-[#c5cee2]">{open.note}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {open.skills.map((s) => (
                <span key={s} className="rounded border border-[#2b3858] px-2 py-0.5 text-[10px] text-[#aab6d1]">
                  {s}
                </span>
              ))}
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                ["Screening", Math.min(100, open.score + 4)],
                ["Technical", Math.max(40, open.score - 6)],
                ["Culture", Math.min(100, open.score + 1)],
              ].map(([label, v]) => (
                <div key={label as string} className="rounded-lg bg-[#182238] px-2 py-2">
                  <dt className="text-[10px] text-[#93a1bd]">{label}</dt>
                  <dd className="text-sm font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => move(open.id, 1)}
                disabled={open.stage === "Hired"}
                className="flex-1 rounded-lg py-2 text-sm font-semibold text-[#0e1627] disabled:opacity-40"
                style={{ background: AMBER }}
              >
                {open.stage === "Offer" ? "Mark as hired" : "Advance stage"}
              </button>
              <button
                type="button"
                onClick={() => move(open.id, -1)}
                className="rounded-lg border border-[#2b3858] px-3 py-2 text-sm text-[#c5cee2]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => reject(open.id)}
                className="rounded-lg border border-[#5a2a33] px-3 py-2 text-sm text-[#e6a0a8]"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl border border-[#1e2940] bg-[#131c2e] px-3 py-2.5">
      <p className="text-[10px] tracking-[0.16em] text-[#93a1bd] uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}
