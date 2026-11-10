"use client";

/**
 * Chart primitives for the demo dashboards.
 *
 * House rule for these mockups: **chrome colour is per service, data colour is
 * not.** Each demo picks its own surfaces, type and accent, but every mark in
 * every chart comes from the one validated categorical/sequential palette
 * below, so a colour never means "this is the inventory app" — it only ever
 * means "this is the series". Legends are always present for two or more
 * series, values are direct-labelled selectively, and text keeps ink tokens
 * rather than wearing the series colour.
 */

import { useId, useRef, useState } from "react";

/** Categorical slots, in fixed order. Never cycled, never re-ordered. */
export const SERIES_LIGHT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"] as const;
export const SERIES_DARK = ["#3987e5", "#d95926", "#199e70", "#c98500"] as const;

/** Sequential blue, light -> dark. Ordinal use stops short of the ends. */
export const BLUE_RAMP = [
  "#cde2fb",
  "#b7d3f6",
  "#9ec5f4",
  "#86b6ef",
  "#6da7ec",
  "#5598e7",
  "#3987e5",
  "#2a78d6",
  "#256abf",
  "#1c5cab",
  "#184f95",
] as const;

export interface Series {
  name: string;
  color: string;
  values: number[];
}

interface Ink {
  /** Axis/grid colour — recessive, never competing with the marks. */
  grid: string;
  /** Tick and label ink. */
  muted: string;
  /** Value ink inside tooltips. */
  strong: string;
  /** Chart surface, used for the 2px spacer ring between overlapping marks. */
  surface: string;
}

/**
 * Round an axis top up to a readable number. Plain magnitude rounding turns
 * 10.2 into 20 and leaves the bars at half height, so step through a finer
 * set of multiples first.
 */
const niceCeil = (v: number) => {
  if (v <= 0) return 1;
  const mag = 10 ** Math.floor(Math.log10(v));
  const step = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((m) => v <= m * mag) ?? 10;
  return step * mag;
};

/* ------------------------------------------------------------------ *
 * Line chart — change over time, with a crosshair + tooltip
 * ------------------------------------------------------------------ */

export function LineChart({
  series,
  labels,
  ink,
  format = (v: number) => v.toLocaleString(),
  height = 196,
}: {
  series: Series[];
  labels: string[];
  ink: Ink;
  format?: (v: number) => string;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 640;
  const H = 240;
  const padL = 46;
  const padR = 14;
  const padT = 12;
  const padB = 30;

  const max = niceCeil(Math.max(...series.flatMap((s) => s.values)));
  const n = labels.length;
  const x = (i: number) => padL + (i * (W - padL - padR)) / Math.max(1, n - 1);
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB);

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));

  const path = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

  const onMove = (e: React.PointerEvent) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const vx = ((e.clientX - box.left) / box.width) * W;
    const i = Math.round(((vx - padL) / (W - padL - padR)) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-full w-full touch-none"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`Line chart: ${series.map((s) => s.name).join(" and ")}`}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke={ink.grid} strokeWidth="1" />
            <text x={padL - 10} y={y(t) + 4} textAnchor="end" fontSize="11" fill={ink.muted}>
              {format(t)}
            </text>
          </g>
        ))}

        {labels.map((l, i) => (
          <text key={l} x={x(i)} y={H - 9} textAnchor="middle" fontSize="11" fill={ink.muted}>
            {l}
          </text>
        ))}

        {hover !== null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={padT}
            y2={H - padB}
            stroke={ink.muted}
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}

        {series.map((s) => (
          <path
            key={s.name}
            d={path(s.values)}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {hover !== null &&
          series.map((s) => (
            <circle
              key={s.name}
              cx={x(hover)}
              cy={y(s.values[hover])}
              r="5"
              fill={s.color}
              stroke={ink.surface}
              strokeWidth="2"
            />
          ))}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-1 z-10 min-w-[8.5rem] -translate-x-1/2 rounded-lg px-3 py-2 text-[11px] shadow-lg"
          style={{
            left: `${((x(hover) / W) * 100).toFixed(2)}%`,
            background: ink.surface,
            color: ink.strong,
            border: `1px solid ${ink.grid}`,
          }}
        >
          <p className="font-semibold">{labels[hover]}</p>
          {series.map((s) => (
            <p key={s.name} className="mt-1 flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
              <span style={{ color: ink.muted }}>{s.name}</span>
              <span className="ml-auto font-semibold tabular-nums">{format(s.values[hover])}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Donut — parts of one whole, hover reads the centre
 * ------------------------------------------------------------------ */

export function Donut({
  slices,
  ink,
  total,
  centerLabel,
  size = 168,
}: {
  slices: { name: string; value: number; color: string }[];
  ink: Ink;
  total: number;
  centerLabel: string;
  size?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const id = useId();

  const R = 70;
  const C = 2 * Math.PI * R;
  const stroke = 22;
  const gap = 2.5; // the surface spacer between adjacent fills

  let offset = 0;
  const arcs = slices.map((s) => {
    const len = total > 0 ? (s.value / total) * C : 0;
    const arc = { ...s, len, offset };
    offset += len;
    return arc;
  });

  const shown = hover === null ? null : slices[hover];

  return (
    <div className="flex items-center gap-5">
      <svg
        viewBox="0 0 180 180"
        style={{ width: size, height: size }}
        className="shrink-0 -rotate-90"
        role="img"
        aria-label={`${centerLabel}: ${slices.map((s) => `${s.name} ${s.value}`).join(", ")}`}
      >
        {arcs.map((a, i) => (
          <circle
            key={a.name}
            cx="90"
            cy="90"
            r={R}
            fill="none"
            stroke={a.color}
            strokeWidth={hover === i ? stroke + 6 : stroke}
            strokeDasharray={`${Math.max(0, a.len - gap)} ${C - Math.max(0, a.len - gap)}`}
            strokeDashoffset={-a.offset}
            className="cursor-pointer transition-[stroke-width] duration-150"
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
          />
        ))}
        <g className="rotate-90" style={{ transformOrigin: "90px 90px" }}>
          <text
            x="90"
            y="88"
            textAnchor="middle"
            fontSize="26"
            fontWeight="600"
            fill={ink.strong}
            id={id}
          >
            {shown ? shown.value : total}
          </text>
          <text x="90" y="106" textAnchor="middle" fontSize="10" fill={ink.muted}>
            {shown ? shown.name : centerLabel}
          </text>
        </g>
      </svg>

      <ul className="flex min-w-0 flex-col gap-2 text-xs">
        {slices.map((s, i) => (
          <li
            key={s.name}
            className="flex items-center gap-2 whitespace-nowrap transition-opacity"
            style={{ opacity: hover === null || hover === i ? 1 : 0.45 }}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span style={{ color: ink.muted }}>{s.name}</span>
            <span className="ml-auto pl-3 font-semibold tabular-nums" style={{ color: ink.strong }}>
              {total > 0 ? Math.round((s.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Bars — grouped or single series, rounded data-ends on the baseline
 * ------------------------------------------------------------------ */

function barPath(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h);
  return `M ${x} ${y + h} L ${x} ${y + rr} Q ${x} ${y} ${x + rr} ${y} L ${x + w - rr} ${y} Q ${
    x + w
  } ${y} ${x + w} ${y + rr} L ${x + w} ${y + h} Z`;
}

export function Bars({
  series,
  labels,
  ink,
  format = (v: number) => v.toLocaleString(),
  height = 190,
  unit = "",
}: {
  series: Series[];
  labels: string[];
  ink: Ink;
  format?: (v: number) => string;
  height?: number;
  unit?: string;
}) {
  const [hover, setHover] = useState<{ g: number; s: number } | null>(null);

  const W = 640;
  const H = 230;
  const padL = 40;
  const padR = 10;
  const padT = 12;
  const padB = 28;

  const max = niceCeil(Math.max(...series.flatMap((s) => s.values)));
  const groups = labels.length;
  const band = (W - padL - padR) / groups;
  const inner = band * 0.68;
  const bw = inner / series.length - 2; // 2px surface spacer between fills
  const yv = (v: number) => padT + (1 - v / max) * (H - padT - padB);

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-full w-full"
        role="img"
        aria-label={`Bar chart: ${series.map((s) => s.name).join(", ")}`}
      >
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={padL}
            x2={W - padR}
            y1={yv(max * t)}
            y2={yv(max * t)}
            stroke={ink.grid}
            strokeWidth="1"
          />
        ))}
        {[0, 0.5, 1].map((t) => (
          <text
            key={t}
            x={padL - 8}
            y={yv(max * t) + 4}
            textAnchor="end"
            fontSize="11"
            fill={ink.muted}
          >
            {format(Math.round(max * t))}
          </text>
        ))}

        {labels.map((l, g) => (
          <text
            key={l}
            x={padL + band * g + band / 2}
            y={H - 8}
            textAnchor="middle"
            fontSize="11"
            fill={ink.muted}
          >
            {l}
          </text>
        ))}

        {series.map((s, si) =>
          s.values.map((v, g) => {
            const x = padL + band * g + (band - inner) / 2 + si * (bw + 2);
            const on = hover?.g === g && hover?.s === si;
            return (
              <path
                key={`${s.name}-${g}`}
                d={barPath(x, yv(v), bw, H - padB - yv(v), 4)}
                fill={s.color}
                opacity={hover && !on ? 0.5 : 1}
                className="cursor-pointer transition-opacity"
                onPointerEnter={() => setHover({ g, s: si })}
                onPointerLeave={() => setHover(null)}
              />
            );
          }),
        )}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-[11px] whitespace-nowrap shadow-lg"
          style={{
            left: `${(((padL + band * hover.g + band / 2) / W) * 100).toFixed(2)}%`,
            background: ink.surface,
            color: ink.strong,
            border: `1px solid ${ink.grid}`,
          }}
        >
          <span style={{ color: ink.muted }}>
            {labels[hover.g]} · {series[hover.s].name}{" "}
          </span>
          <span className="font-semibold tabular-nums">
            {format(series[hover.s].values[hover.g])}
            {unit}
          </span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Horizontal ordinal bars — pipeline stages, funnels
 * ------------------------------------------------------------------ */

export function StageBars({
  rows,
  ink,
}: {
  rows: { name: string; value: number; color: string }[];
  ink: Ink;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <li key={r.name} className="flex items-center gap-3 text-[11px]">
          <span className="w-16 shrink-0 truncate" style={{ color: ink.muted }}>
            {r.name}
          </span>
          <span className="relative h-3 flex-1 overflow-hidden rounded-full" style={{ background: ink.grid }}>
            <span
              className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
              style={{ width: `${(r.value / max) * 100}%`, background: r.color }}
            />
          </span>
          <span className="w-6 text-right font-semibold tabular-nums" style={{ color: ink.strong }}>
            {r.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ *
 * Meter ring — one share of a whole, as a headline
 * ------------------------------------------------------------------ */

export function MeterRing({
  value,
  total,
  color,
  track,
  ink,
  caption,
  size = 104,
}: {
  value: number;
  total: number;
  color: string;
  track: string;
  ink: Ink;
  caption: string;
  size?: number;
}) {
  const pct = total > 0 ? value / total : 0;
  const R = 46;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 110 110" style={{ width: size, height: size }} className="shrink-0 -rotate-90">
        <circle cx="55" cy="55" r={R} fill="none" stroke={track} strokeWidth="10" />
        <circle
          cx="55"
          cy="55"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(pct * C).toFixed(1)} ${C}`}
          className="transition-[stroke-dasharray] duration-500"
        />
        <g className="rotate-90" style={{ transformOrigin: "55px 55px" }}>
          <text x="55" y="61" textAnchor="middle" fontSize="22" fontWeight="600" fill={ink.strong}>
            {Math.round(pct * 100)}%
          </text>
        </g>
      </svg>
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: ink.strong }}>
          {value} of {total}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: ink.muted }}>
          {caption}
        </p>
      </div>
    </div>
  );
}
