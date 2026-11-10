"use client";

/**
 * The demo stage: five live service mockups on a circular, draggable track.
 *
 * Gesture model
 * -------------
 * One pointer handler covers mouse, pen and touch. A press does nothing until
 * it has travelled 8px, at which point the axis is locked: horizontal becomes
 * a carousel drag (pointer captured, text selection suppressed), vertical is
 * released back to the page so the demos' own scroll areas still work. Below
 * that threshold the press is a plain click, which is what keeps every button
 * inside the active demo usable. Presses that start on a form control never
 * drag at all — selecting text in an input must not throw the carousel.
 *
 * `touch-action: pan-y` on the track is the other half of that: the browser
 * keeps vertical scrolling, and hands us horizontal gestures as pointer events
 * instead of panning the page.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { InventoryDemo } from "./InventoryDemo";
import { SchedulerDemo } from "./SchedulerDemo";
import { RecruitmentDemo } from "./RecruitmentDemo";
import { TasksDemo } from "./TasksDemo";
import { TimeRecordDemo } from "./TimeRecordDemo";

const SERVICES = [
  {
    id: "inventory",
    title: "Inventory Management",
    short: "Inventory",
    blurb: "Stock, shipments and invoices on one board — shortages surfaced before they bite.",
    accent: "#17b4cf",
    Component: InventoryDemo,
  },
  {
    id: "scheduler",
    title: "Appointment Scheduler",
    short: "Scheduling",
    blurb: "Bookings, reminders and chair time, with nobody double-booked.",
    accent: "#e2703a",
    Component: SchedulerDemo,
  },
  {
    id: "recruitment",
    title: "Recruitment Portal",
    short: "Recruitment",
    blurb: "Applications, scorecards and offers moving through one pipeline.",
    accent: "#f0b429",
    Component: RecruitmentDemo,
  },
  {
    id: "tasks",
    title: "Task Management",
    short: "Tasks",
    blurb: "Plan, assign and watch the work land — board or list, same data.",
    accent: "#8b7cf0",
    Component: TasksDemo,
  },
  {
    id: "dtr",
    title: "Daily Time Record",
    short: "Time record",
    blurb: "Clock-in to payroll-ready export, with overtime computed as it happens.",
    accent: "#3ad48b",
    Component: TimeRecordDemo,
  },
] as const;

const N = SERVICES.length;
/** Shortest signed distance from slide i to the current position, wrapped. */
const wrap = (d: number) => {
  let v = d;
  while (v > N / 2) v -= N;
  while (v < -N / 2) v += N;
  return v;
};

export function DemoCarousel() {
  const [index, setIndex] = useState(0); // unbounded: rotates in either direction
  const [drag, setDrag] = useState(0); // live pixel offset while a drag is open
  const [dragging, setDragging] = useState(false);
  const [calm, setCalm] = useState(false); // honours prefers-reduced-motion
  const trackRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: number; x: number; y: number; axis: null | "x" | "y"; t: number } | null>(null);

  const active = ((index % N) + N) % N;
  const service = SERVICES[active];

  const go = useCallback((delta: number) => setIndex((i) => i + delta), []);

  const width = () => trackRef.current?.getBoundingClientRect().width ?? 1;

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const el = e.target as HTMLElement;
    // Form controls and anything opted out keep their own pointer behaviour.
    if (el.closest("input, textarea, select, [data-nodrag]")) return;
    gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, axis: null, t: performance.now() };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;

    if (g.axis === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      g.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (g.axis === "y") {
        gesture.current = null; // vertical belongs to the page / the demo's scroller
        return;
      }
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(true);
    }

    if (g.axis === "x") {
      // Resist past the ends is unnecessary here — the track is circular.
      setDrag(dx);
    }
  };

  const endDrag = (e: React.PointerEvent) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g || g.axis !== "x") return;

    const dx = e.clientX - g.x;
    const speed = Math.abs(dx) / Math.max(1, performance.now() - g.t); // px per ms
    const far = Math.abs(dx) > width() * 0.16;
    const flick = speed > 0.45 && Math.abs(dx) > 24;

    if (far || flick) go(dx < 0 ? 1 : -1);
    setDrag(0);
    setDragging(false);
  };

  // Arrow keys move the stage when focus is anywhere inside it but not in a field.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const el = e.target as HTMLElement;
    if (el.closest("input, textarea, select")) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  // The stage still works without the slide animation; someone who asked for
  // less motion gets the jump cut instead.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setCalm(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Cursor feedback belongs on the body while a drag is open, or the cursor
  // flickers back to `default` every time it crosses a child element.
  useEffect(() => {
    if (!dragging) return;
    const prev = document.body.style.cursor;
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = prev;
      document.body.style.userSelect = "";
    };
  }, [dragging]);

  const pos = index - drag / width();

  return (
    <section className="relative" aria-roledescription="carousel" aria-label="Service demos">
      {/* Heading — reads out the service currently on stage. */}
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 sm:gap-6 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h1
            key={service.id}
            className="display-tight demo-title text-[clamp(2.25rem,6vw,4.25rem)]"
          >
            {service.title}
          </h1>
          <p className="mt-2 flex items-center gap-2.5 text-sm text-muted sm:mt-3 sm:text-base">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-aim-live" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 7 4 11l4 4M16 7l4 4-4 4M4 11h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Swipe or drag to try another service
          </p>
        </div>

        <div className="lg:text-right">
          <p className="text-sm sm:text-lg">
            Custom system or product?{" "}
            <a href="/#contact" className="font-medium text-cta-lift underline-offset-4 hover:underline">
              Contact us
            </a>
          </p>
          {/* The same note runs below the stage, so a phone drops it here and
              keeps the demo itself above the fold. */}
          <p className="mt-2 hidden max-w-sm text-sm leading-relaxed text-faint sm:block lg:ml-auto">
            These are working front-end demos. The system you get is built to your process, your
            fields and your branding.
          </p>
        </div>
      </div>

      {/* Stage */}
      <div className="relative mt-6 overflow-hidden px-4 py-2 sm:mt-12">
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
          className="relative mx-auto h-[clamp(28rem,70svh,41rem)] w-full max-w-[72rem] touch-pan-y select-none"
          style={{ cursor: dragging ? "grabbing" : "grab" }}
        >
          {SERVICES.map((s, i) => {
            const d = wrap(i - pos);
            const far = Math.min(Math.abs(d), 2);
            const isActive = i === active;
            const Demo = s.Component;
            return (
              <article
                key={s.id}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${N}: ${s.title}`}
                aria-hidden={!isActive}
                className="absolute inset-0 will-change-transform"
                style={{
                  transform: `translate3d(${d * 64}%, 0, 0) scale(${1 - far * 0.11})`,
                  opacity: 1 - far * 0.45,
                  zIndex: 10 - Math.round(far * 5),
                  transition:
                    dragging || calm
                      ? "none"
                      : "transform .62s cubic-bezier(.22,.9,.2,1), opacity .5s ease",
                  pointerEvents: Math.abs(d) < 1.5 ? "auto" : "none",
                }}
              >
                <div
                  className="relative h-full overflow-hidden rounded-2xl bg-white shadow-[0_30px_90px_-20px_rgba(0,0,0,.85)] ring-1 ring-white/12"
                  style={{ boxShadow: isActive ? `0 0 0 1px ${s.accent}40, 0 34px 90px -20px rgba(0,0,0,.9)` : undefined }}
                >
                  {/* inert keeps the off-stage apps out of the tab order and
                      away from screen readers without unmounting their state. */}
                  <div className="h-full" inert={!isActive}>
                    <Demo />
                  </div>

                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => go(Math.round(d))}
                      className="absolute inset-0 bg-void/65 backdrop-blur-[2px] transition-colors hover:bg-void/50"
                      tabIndex={-1}
                    >
                      <span className="sr-only">Show {s.title}</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Arrows sit outside the card on wide screens, over it on phones. */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous service"
          className="absolute top-1/2 left-2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-gunmetal-rim/60 bg-void-lift/85 text-paper backdrop-blur transition-colors hover:border-aim hover:text-aim-live sm:left-5"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next service"
          className="absolute top-1/2 right-2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-gunmetal-rim/60 bg-void-lift/85 text-paper backdrop-blur transition-colors hover:border-aim hover:text-aim-live sm:right-5"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Service switcher */}
      <div className="mx-auto mt-8 w-full max-w-6xl px-4 sm:px-8">
        <ul className="flex flex-wrap items-center justify-center gap-2">
          {SERVICES.map((s, i) => {
            const on = i === active;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => go(wrap(i - index))}
                  aria-current={on}
                  className="rounded-full border px-4 py-2 text-xs font-medium transition-colors sm:text-sm"
                  style={{
                    borderColor: on ? s.accent : "rgba(70,82,90,.55)",
                    color: on ? s.accent : "#9fb0b7",
                    background: on ? `${s.accent}14` : "transparent",
                  }}
                >
                  {s.short}
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-relaxed text-faint">
          {service.blurb}
        </p>
      </div>
    </section>
  );
}
