"use client";

/**
 * Demo 1 — Inventory Management, as "Concorde".
 *
 * Identity: clinical white, a teal icon rail, square cards. Everything the
 * visitor touches is local state: advancing a shipment re-counts the stat
 * cards and redraws the donut, so the dashboard visibly reacts.
 */

import { useMemo, useState } from "react";
import { Bars, Donut, LineChart, SERIES_LIGHT } from "./viz";

const INK = { grid: "#e3e9ec", muted: "#5d727c", strong: "#0d2228", surface: "#ffffff" };

const TEAL = "#0e7c8c";
const TEAL_DEEP = "#0a5c69";

const STATUSES = ["Packed", "Shipped", "Delivered", "Invoiced"] as const;
type Status = (typeof STATUSES)[number];

interface Row {
  id: string;
  item: string;
  from: string;
  to: string;
  qty: number;
  status: Status;
  eta: string;
}

const SEED: Row[] = [
  { id: "CG-921", item: "Frozen tilapia", from: "Manila", to: "Cebu", qty: 420, status: "Shipped", eta: "12:00" },
  { id: "CG-462", item: "Chicken, whole", from: "Davao", to: "Manila", qty: 180, status: "Packed", eta: "14:00" },
  { id: "CG-318", item: "Pork belly", from: "Cebu", to: "Iloilo", qty: 240, status: "Delivered", eta: "18:00" },
  { id: "CG-311", item: "Beef shank", from: "Manila", to: "Baguio", qty: 96, status: "Invoiced", eta: "11:00" },
  { id: "CG-287", item: "Mixed vegetables", from: "Baguio", to: "Manila", qty: 610, status: "Shipped", eta: "09:30" },
  { id: "CG-244", item: "Processed meats", from: "Manila", to: "Davao", qty: 150, status: "Packed", eta: "16:45" },
  { id: "CG-209", item: "Seasonal fruits", from: "Iloilo", to: "Cebu", qty: 330, status: "Delivered", eta: "07:15" },
];

const STATUS_STYLE: Record<Status, { bg: string; fg: string }> = {
  Packed: { bg: "#eef2f4", fg: "#41535b" },
  Shipped: { bg: "#e4f0fb", fg: "#1c5cab" },
  Delivered: { bg: "#e3f4ec", fg: "#116b4c" },
  Invoiced: { bg: "#fdf0e8", fg: "#9a3f14" },
};

export function InventoryDemo() {
  const [rows, setRows] = useState<Row[]>(SEED);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Status | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ item: "", to: "Cebu", qty: "100" });

  const counts = useMemo(
    () =>
      STATUSES.map((s) => ({
        status: s,
        n: rows.filter((r) => r.status === s).length,
        units: rows.filter((r) => r.status === s).reduce((a, r) => a + r.qty, 0),
      })),
    [rows],
  );

  const visible = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    const hit = !q || `${r.id} ${r.item} ${r.from} ${r.to}`.toLowerCase().includes(q);
    return hit && (!filter || r.status === filter);
  });

  const advance = (id: string) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: STATUSES[Math.min(STATUSES.length - 1, STATUSES.indexOf(r.status) + 1)] }
          : r,
      ),
    );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = draft.item.trim();
    if (!item) return;
    const next = 930 + rows.length;
    setRows((prev) => [
      { id: `CG-${next}`, item, from: "Manila", to: draft.to, qty: Number(draft.qty) || 1, status: "Packed", eta: "08:00" },
      ...prev,
    ]);
    setDraft({ item: "", to: "Cebu", qty: "100" });
    setAdding(false);
  };

  return (
    <div className="flex h-full bg-[#f4f7f8] text-[#0d2228]">
      {/* Icon rail — the one saturated surface in this design. */}
      <nav
        className="hidden w-14 shrink-0 flex-col items-center gap-6 py-5 sm:flex"
        style={{ background: TEAL }}
        aria-label="Concorde sections"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-sm font-bold text-white">
          C
        </span>
        {["Overview", "Stock", "Shipments"].map((label, i) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            className="grid h-9 w-9 place-items-center rounded-xl text-white transition-colors"
            style={{ background: i === 0 ? "#ffffff" : "transparent", color: i === 0 ? TEAL : "#ffffff" }}
          >
            <RailIcon i={i} />
          </button>
        ))}
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-[#e3e9ec] bg-white px-4 py-3 sm:px-5">
          <p className="text-lg font-bold tracking-tight" style={{ color: TEAL_DEEP }}>
            Concorde
          </p>
          <label className="relative ml-auto w-full max-w-xs">
            <span className="sr-only">Search shipments</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cargo, item, route…"
              className="w-full rounded-full border border-[#e3e9ec] bg-[#f7fafb] py-2 pr-3 pl-9 text-sm outline-none placeholder:text-[#8da0a8] focus:border-[#0e7c8c]"
            />
            <svg viewBox="0 0 24 24" className="absolute top-2.5 left-3 h-4 w-4" fill="none" stroke="#8da0a8" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </label>
          <span className="hidden h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eef3f5] text-xs font-semibold text-[#41535b] sm:grid">
            RM
          </span>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold tracking-tight">Inventory</h3>
            <p className="text-xs text-[#5d727c]">
              {filter ? `Filtered to ${filter.toLowerCase()}` : "All shipments"} · {visible.length} of {rows.length}
            </p>
            <button
              type="button"
              onClick={() => setAdding((v) => !v)}
              className="ml-auto rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: TEAL }}
            >
              {adding ? "Cancel" : "+ New shipment"}
            </button>
          </div>

          {adding && (
            <form
              onSubmit={submit}
              className="mt-3 grid gap-2 rounded-xl border border-[#d8e4e7] bg-white p-3 sm:grid-cols-[1fr_auto_auto_auto]"
            >
              <input
                autoFocus
                value={draft.item}
                onChange={(e) => setDraft({ ...draft, item: e.target.value })}
                placeholder="Item description"
                className="rounded-lg border border-[#e3e9ec] px-3 py-2 text-sm outline-none focus:border-[#0e7c8c]"
              />
              <select
                value={draft.to}
                onChange={(e) => setDraft({ ...draft, to: e.target.value })}
                className="rounded-lg border border-[#e3e9ec] px-3 py-2 text-sm outline-none focus:border-[#0e7c8c]"
                aria-label="Destination"
              >
                {["Cebu", "Davao", "Iloilo", "Baguio"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input
                value={draft.qty}
                onChange={(e) => setDraft({ ...draft, qty: e.target.value.replace(/\D/g, "") })}
                inputMode="numeric"
                aria-label="Quantity"
                className="w-24 rounded-lg border border-[#e3e9ec] px-3 py-2 text-sm outline-none focus:border-[#0e7c8c]"
              />
              <button
                type="submit"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ background: TEAL_DEEP }}
              >
                Add
              </button>
            </form>
          )}

          {/* Stat cards double as the status filter. */}
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {counts.map((c, i) => {
              const on = filter === c.status;
              return (
                <button
                  key={c.status}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(on ? null : c.status)}
                  className="flex items-center gap-3 rounded-xl border bg-white p-3 text-left transition-shadow hover:shadow-sm"
                  style={{ borderColor: on ? TEAL : "#e3e9ec", boxShadow: on ? `inset 3px 0 0 ${TEAL}` : undefined }}
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white"
                    style={{ background: on ? TEAL : "#9fb6bc" }}
                  >
                    <StatIcon i={i} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-[#41535b]">{c.status}</span>
                    <span className="block text-xl leading-tight font-semibold tabular-nums">{c.n}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.55fr_1fr]">
            <section className="rounded-xl border border-[#e3e9ec] bg-white p-4">
              <h4 className="text-sm font-semibold">
                Total sales <span className="ml-1 font-normal text-[#5d727c]">· ₱ over the week</span>
              </h4>
              <div className="mt-1 flex gap-5 text-[11px] text-[#5d727c]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: SERIES_LIGHT[0] }} /> This week ₱366k
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: SERIES_LIGHT[1] }} /> Last week ₱245k
                </span>
              </div>
              <LineChart
                ink={INK}
                labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
                format={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
                series={[
                  { name: "This week", color: SERIES_LIGHT[0], values: [30000, 26000, 16000, 91000, 13000, 100000, 96000] },
                  { name: "Last week", color: SERIES_LIGHT[1], values: [10000, 12000, 55000, 27000, 30000, 70000, 50000] },
                ]}
              />
            </section>

            <section className="rounded-xl border border-[#e3e9ec] bg-white p-4">
              <h4 className="text-sm font-semibold">Shipment status</h4>
              <p className="mt-0.5 text-xs text-[#5d727c]">Updates as you advance a row.</p>
              <div className="mt-3">
                <Donut
                  ink={INK}
                  total={rows.length}
                  centerLabel="shipments"
                  slices={counts.map((c, i) => ({ name: c.status, value: c.n, color: SERIES_LIGHT[i] }))}
                />
              </div>
            </section>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.55fr]">
            <section className="rounded-xl border border-[#e3e9ec] bg-white p-4">
              <h4 className="text-sm font-semibold">Units moved by category</h4>
              <div className="mt-1 flex flex-wrap gap-4 text-[11px] text-[#5d727c]">
                {["Week 1", "Week 2", "Week 3"].map((w, i) => (
                  <span key={w} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: SERIES_LIGHT[i] }} />
                    {w}
                  </span>
                ))}
              </div>
              <Bars
                ink={INK}
                labels={["Chicken", "Fish", "Pork", "Beef", "Produce"]}
                unit=" kg"
                series={[
                  { name: "Week 1", color: SERIES_LIGHT[0], values: [620, 940, 870, 950, 230] },
                  { name: "Week 2", color: SERIES_LIGHT[1], values: [410, 420, 530, 860, 870] },
                  { name: "Week 3", color: SERIES_LIGHT[2], values: [830, 800, 680, 820, 410] },
                ]}
              />
            </section>

            <section className="rounded-xl border border-[#e3e9ec] bg-white">
              <div className="flex items-center justify-between border-b border-[#eef3f5] px-4 py-3">
                <h4 className="text-sm font-semibold">Deliveries</h4>
                <p className="text-[11px] text-[#5d727c]">Tap a row&rsquo;s arrow to move it along</p>
              </div>

              <div className="hidden grid-cols-[6.5rem_1fr_7rem_4rem_6.5rem_2rem] gap-2 px-4 py-2 text-[11px] font-medium tracking-wide text-[#8da0a8] uppercase md:grid">
                <span>Cargo</span>
                <span>Item</span>
                <span>Route</span>
                <span className="text-right">Qty</span>
                <span>Status</span>
                <span />
              </div>

              <ul className="divide-y divide-[#f0f4f5]">
                {visible.map((r) => (
                  <li
                    key={r.id}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-1 px-4 py-2.5 text-sm md:grid-cols-[6.5rem_1fr_7rem_4rem_6.5rem_2rem]"
                  >
                    <span className="font-semibold tabular-nums">{r.id}</span>
                    <span className="order-3 col-span-2 truncate text-[#41535b] md:order-none md:col-span-1">
                      {r.item}
                    </span>
                    <span className="order-4 text-xs text-[#5d727c] md:order-none">
                      {r.from} → {r.to}
                    </span>
                    <span className="order-5 text-xs tabular-nums md:order-none md:text-right">{r.qty} kg</span>
                    <span
                      className="order-2 justify-self-end rounded-full px-2 py-0.5 text-[11px] font-medium md:order-none md:justify-self-start"
                      style={{ background: STATUS_STYLE[r.status].bg, color: STATUS_STYLE[r.status].fg }}
                    >
                      {r.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => advance(r.id)}
                      disabled={r.status === "Invoiced"}
                      aria-label={`Advance ${r.id}`}
                      className="order-6 grid h-7 w-7 place-items-center justify-self-end rounded-full border border-[#e3e9ec] text-[#41535b] transition-colors enabled:hover:border-[#0e7c8c] enabled:hover:text-[#0e7c8c] disabled:opacity-30 md:order-none"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h13m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </li>
                ))}
                {visible.length === 0 && (
                  <li className="px-4 py-8 text-center text-sm text-[#5d727c]">No shipments match that search.</li>
                )}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function RailIcon({ i }: { i: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const };
  if (i === 0)
    return (
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" {...common}>
        <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1Z" strokeLinejoin="round" />
      </svg>
    );
  if (i === 1)
    return (
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" {...common}>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" {...common}>
      <rect x="3" y="7" width="12" height="10" rx="1.5" />
      <path d="M15 10h3l3 3v4h-6" strokeLinejoin="round" />
    </svg>
  );
}

function StatIcon({ i }: { i: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinejoin: "round" as const };
  if (i === 0)
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...common}>
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z" />
        <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      </svg>
    );
  if (i === 1)
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...common}>
        <rect x="2.5" y="7" width="11" height="9" rx="1.5" />
        <path d="M13.5 10H17l3.5 3.5V16h-7" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="17" cy="18" r="1.6" />
      </svg>
    );
  if (i === 2)
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...common}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="m8 12 3 3 5-6" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" {...common}>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M9 9h6M9 13h6M9 17h3" strokeLinecap="round" />
    </svg>
  );
}
