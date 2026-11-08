"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BEAT_RANGE,
  MECHANISM,
  TOTAL_VH,
  copyOpacityAt,
  windowAt,
  type BeatId as TimelineBeatId,
} from "@/storyboard/timeline";
import {
  BULLSEYE,
  FIT,
  HERO,
  LASTS,
  SECURITY,
  SIGNAL,
  STRUCTURE,
  STYLES,
  THROW,
  type BeatId,
} from "@/content/story";
import { strikeSide } from "@/storyboard/world";
import { BeatNav } from "@/components/BeatNav";
import { ContactCta } from "@/components/ContactCta";
import { Mark } from "@/components/Mark";
import { Scene } from "@/three/Scene";
import { createStageState } from "@/three/state";

/**
 * The scroll story.
 *
 * Renders `fallback` — the full static page from Phase 3 — until it knows
 * the client can actually run the scene. That keeps the server HTML, the
 * no-JS output and the reduced-motion output identical and complete, and
 * means a WebGL failure degrades to a real page rather than a blank one.
 */
export function StoryStage({ fallback }: { fallback: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const state = useRef(createStageState()).current;
  const panels = useRef<Map<string, HTMLElement>>(new Map());
  const narrow = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // Probe rather than assume: integrated GPUs and locked-down browsers
    // both fail here, and both deserve the static page instead of a void.
    let ok = false;
    try {
      const c = document.createElement("canvas");
      ok = !!(c.getContext("webgl2") ?? c.getContext("webgl"));
    } catch {
      ok = false;
    }
    if (!ok) return;

    // Low-core devices get the static page too — a pinned 10-screen scroll
    // that stutters is worse than no scroll story at all.
    if ((navigator.hardwareConcurrency ?? 8) < 4) return;

    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;

    const read = () => {
      raf = 0;
      const el = wrap.current;
      if (!el) return;
      narrow.current = window.matchMedia("(max-width: 767px)").matches;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
      progress.current = p;

      // Copy opacity is written straight to the DOM. Through React state
      // this would re-render ten panels on every scroll event.
      let lead: { side: string; o: number } = { side: "left", o: 0 };
      const occupied = new Set<string>();
      for (const [key, node] of panels.current) {
        if (key === "scrim" || key === "rail") continue;
        const o = opacityFor(p, key, narrow.current);
        node.style.opacity = String(o);
        // Copy slides in from its own side, so the motion points inward.
        const side = node.dataset.side ?? "left";
        const dx = side === "right" ? 1 : side === "left" ? -1 : 0;
        node.style.transform = `translate(${(1 - o) * 26 * dx}px, ${(1 - o) * 10}px)`;
        node.style.visibility = o < 0.01 ? "hidden" : "visible";
        if (o > 0.5) occupied.add(side);
        if (o > lead.o) lead = { side, o };
      }
      // Both halves in use at once — the fit beat — needs both edges held.
      if (occupied.has("left") && occupied.has("right")) lead = { side: "both", o: 1 };

      // The scrim darkens whichever edge the copy currently occupies.
      const scrim = panels.current.get("scrim");
      if (scrim) {
        const dir = lead.side === "right" ? "left" : "right";
        scrim.style.background = narrow.current
          ? // Portrait puts the board directly behind the copy with
            // nowhere to push it, so the whole frame is held down.
            lead.side === "lockup"
            ? "none"
            : "linear-gradient(to bottom, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.78) 55%, rgba(0,0,0,0.92) 100%)"
          :
          lead.side === "center"
            ? "radial-gradient(ellipse at center, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.3) 48%, transparent 76%)"
            : lead.side === "lockup"
              ? "none"
              : lead.side === "both"
                ? "linear-gradient(to right, #000 4%, rgba(0,0,0,0.45) 26%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.45) 74%, #000 96%)"
                : lead.side === "bottom"
                  ? "linear-gradient(to top, #000 2%, rgba(0,0,0,0.6) 24%, transparent 48%)"
              : `linear-gradient(to ${dir}, #000 8%, rgba(0,0,0,0.72) 42%, transparent 72%)`;
      }

      // Progress rail.
      const rail = panels.current.get("rail");
      if (rail) {
        rail.style.setProperty("--rail", String(p));
        const idx = ringIndexAt(p);
        rail.querySelectorAll<HTMLElement>("[data-tick]").forEach((tick, i) => {
          const on = i <= idx;
          tick.style.opacity = on ? "1" : "0.28";
          tick.style.transform = `scaleX(${on ? 1 : 0.45})`;
        });
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled]);

  if (!enabled) return <>{fallback}</>;

  const reg = (key: string) => (el: HTMLElement | null) => {
    if (el) panels.current.set(key, el);
    else panels.current.delete(key);
  };

  return (
    <div ref={wrap} style={{ height: `calc(${TOTAL_VH}vh * var(--story-scale))` }} className="relative">
      <BeatNav stage={wrap} />
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Scene state={state} progress={progress} />
        </div>

        {/* Readability scrim. The board passes behind the copy at every
            beat, and white text on a lit cyan ring is unreadable without
            it. Left-weighted so the right half of the board stays clean. */}
        <div
          aria-hidden
          ref={reg("scrim")}
          style={{ opacity: 1 }}
          className="pointer-events-none absolute inset-0"
        />

        {/* Ring rail. Sits on the edge opposite nothing — it is always
            present, so the frame is never empty on one side, and it tells
            the reader how far through the six rings they are. */}
        <div
          ref={reg("rail")}
          className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 flex-col items-end gap-4 sm:flex"
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              data-tick={i}
              style={{ opacity: 0.28, transformOrigin: "right" }}
              className="block h-px w-6 bg-aim-live"
            />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0">
          <Panel reg={reg} id="hero">
            <p className="font-display text-xs tracking-[0.42em] text-aim-mid">
              {HERO.brand}
            </p>
            <h1 className="display-tight mt-6 text-[length:var(--text-hero)]">
              {HERO.headline}
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted">{HERO.body}</p>
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
              {/* The panel layer is pointer-events-none so the scroll story
                  stays scrubbable; the one interactive element opts back in. */}
              <ContactCta className="pointer-events-auto" />
              <span className="flex items-center gap-2.5 text-sm text-faint">
                {HERO.scrollCue}
                <span aria-hidden className="text-aim-live">↓</span>
              </span>
            </div>
          </Panel>

          <Panel reg={reg} id="throw" side="right">
            <h2 className="display-tight text-[length:var(--text-beat)]">
              {THROW.headline}
            </h2>
            <p className="stack mt-6 max-w-md text-lg text-muted">{THROW.body}</p>
            <ul className="rowlist mt-8 flex flex-wrap gap-x-8 gap-y-3">
              {THROW.chips.map((c) => (
                <li key={c.label} className="text-sm">
                  <span className="font-display font-semibold text-aim-live">
                    {c.label}
                  </span>
                  <span className="ml-2 text-faint">{c.copy}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <BeatPanel reg={reg} beat={STYLES} />

          <BeatPanel reg={reg} beat={STRUCTURE}>
            <ul className="mt-8 flex flex-col gap-4">
              {[...STRUCTURE.layers].reverse().map((l) => (
                <li key={l.name} className="stack max-w-md">
                  <p className="font-display text-[15px] font-semibold text-paper">
                    {l.name}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-faint">
                    {l.copy}
                  </p>
                </li>
              ))}
            </ul>
          </BeatPanel>

          {/* Beat 2's process list gets its own window inside the long pin. */}
          <Panel reg={reg} id="structure-process" side="right">
            <h3 className="display-tight text-3xl sm:text-4xl">
              {STRUCTURE.processHeading}
            </h3>
            <ul className="mt-7 flex flex-col gap-3">
              {STRUCTURE.process.map((item) => (
                <li key={item} className="stack flex max-w-md gap-3.5 text-[15px] text-muted">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-aim" />
                  {item}
                </li>
              ))}
            </ul>
          </Panel>

          <BeatPanel reg={reg} beat={FIT} />

          {/* Five systems is more than one column can hold beside a
              headline, so the list takes the opposite side of the frame. */}
          <Panel reg={reg} id="fit-systems" side="left">
            <ul className="flex flex-col gap-4">
              {FIT.systems.map((sys) => (
                <li key={sys.name}>
                  <p className="font-display text-[15px] font-semibold text-paper">
                    {sys.name}
                  </p>
                  <p className="mt-0.5 max-w-xs text-[13px] leading-relaxed text-faint">
                    {sys.copy}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>

          <BeatPanel reg={reg} beat={SIGNAL}>
            <ul className="rowlist mt-7 flex flex-wrap gap-x-8 gap-y-2">
              {SIGNAL.micro.map((m) => (
                <li key={m} className="text-aim-live">
                  {m}
                </li>
              ))}
            </ul>
          </BeatPanel>

          <BeatPanel reg={reg} beat={SECURITY} />
          <BeatPanel reg={reg} beat={LASTS} />

          <Panel reg={reg} id="bullseye" side="center">
            <h2 className="display-tight text-[length:var(--text-beat)]">
              {BULLSEYE.headline}
            </h2>
            <p className="mx-auto mt-5 max-w-sm text-lg text-muted">
              {BULLSEYE.body}
            </p>
            <dl className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {BULLSEYE.stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="display-tight block text-4xl text-aim-live sm:text-5xl">
                      {s.value}
                    </span>
                    <span className="mt-1.5 block text-xs tracking-wide text-faint">
                      {s.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel reg={reg} id="resolve" side="lockup">
            <Mark className="h-[22vmin] w-[22vmin] shrink-0 text-aim-live sm:h-[26vh] sm:w-[26vh]" />
            <p className="display-tight text-[13vmin] leading-none tracking-tight text-paper sm:text-[13vh]">
              {BULLSEYE.resolve.join(" ")}
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/** Which ring the reader has reached, for the rail. */
function ringIndexAt(p: number): number {
  const order: TimelineBeatId[] = [
    "styles",
    "structure",
    "fit",
    "signal",
    "security",
    "lasts",
  ];
  let idx = -1;
  order.forEach((b, i) => {
    if (p >= BEAT_RANGE[b].from) idx = i;
  });
  return idx;
}

/** Extra copy windows that are not whole beats. */
function opacityFor(p: number, key: string, narrow = false): number {
  if (key === "structure-process") {
    const w = MECHANISM.structurePanel;
    const t = windowAt(p, w.from, w.to);
    const out = windowAt(p, BEAT_RANGE.structure.to - 0.012, BEAT_RANGE.structure.to);
    return t * (1 - out);
  }
  if (key === "resolve") {
    return windowAt(p, MECHANISM.logoMorph.from, MECHANISM.logoMorph.from + 0.02);
  }
  if (key === "bullseye") {
    const inAt = windowAt(p, 0.932, 0.948);
    const out = windowAt(p, MECHANISM.logoMorph.from - 0.01, MECHANISM.logoMorph.from);
    return inAt * (1 - out);
  }
  // Beat 2's main panel clears early to make room for the process list.
  if (key === "fit" || key === "fit-systems") {
    const base = copyOpacityAt(p, "fit");
    if (!narrow) return base;
    /*
      Two columns do not fit side by side on a phone, and overlapping them
      is what made the mobile view unreadable. On narrow screens the beat
      runs in two halves: the claim, then the five systems.
    */
    const b = BEAT_RANGE.fit;
    const impact = 0.505;
    const mid = impact + (b.to - impact) * 0.46;
    const swap = windowAt(p, mid, mid + 0.016);
    return key === "fit" ? base * (1 - swap) : base * swap;
  }
  if (key === "structure") {
    const base = copyOpacityAt(p, "structure");
    const out = windowAt(p, MECHANISM.structurePanel.from - 0.02, MECHANISM.structurePanel.from);
    return base * (1 - out);
  }
  return copyOpacityAt(p, key as TimelineBeatId);
}

function Panel({
  reg,
  id,
  side = "left",
  children,
}: {
  reg: (key: string) => (el: HTMLElement | null) => void;
  id: string;
  /** Beats alternate sides so the board is never the same shape twice. */
  side?: "left" | "right" | "center" | "bottom" | "lockup";
  children: ReactNode;
}) {
  const place =
    side === "center"
      ? "items-center justify-center text-center"
      : side === "lockup"
        ? // Mark and wordmark as one centred group.
          "items-center justify-center text-left"
        : side === "bottom"
          ? // Clears the mark, which owns the middle of the frame.
            "items-center justify-end pb-[11vh] text-center"
          : side === "right"
            ? "items-end justify-center text-right [&_.stack]:ml-auto [&_.rowlist]:justify-end" +
              " max-md:items-start max-md:text-left max-md:[&_.stack]:ml-0 max-md:[&_.rowlist]:justify-start"
            : "items-start justify-center";
  return (
    <div
      ref={reg(id)}
      data-panel={id}
      data-side={side}
      style={{ opacity: 0, visibility: "hidden" }}
      className={`absolute inset-0 flex flex-col px-6 sm:px-12 lg:px-24 ${place}`}
    >
      <div
        className={
          side === "center" || side === "bottom"
            ? "w-full max-w-3xl"
            : side === "lockup"
              ? "flex flex-col items-center gap-[2.5vh] sm:flex-row sm:gap-[4vh]"
              : "w-full max-w-xl"
        }
      >
        {children}
      </div>
    </div>
  );
}

function BeatPanel({
  reg,
  beat,
  children,
}: {
  reg: (key: string) => (el: HTMLElement | null) => void;
  beat: { id: BeatId; ring: number; eyebrow: string; headline: string; body: string };
  children?: ReactNode;
}) {
  // Opposite the dart's strike for this ring, always — see strikeSide().
  const side = strikeSide(beat.ring) === "right" ? "left" : "right";
  return (
    <Panel reg={reg} id={beat.id} side={side}>
      <p className="font-display text-xs tracking-[0.36em] text-faint uppercase">
        {beat.eyebrow}
        <span className="ml-3 text-gunmetal-rim" aria-hidden>
          {beat.ring + 1}/6
        </span>
      </p>
      <h2 className="display-tight mt-5 text-[length:var(--text-beat)]">
        {beat.headline}
      </h2>
      <p className="stack mt-6 max-w-md text-lg text-muted">{beat.body}</p>
      {children}
    </Panel>
  );
}
