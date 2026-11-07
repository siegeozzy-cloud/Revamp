import type { ReactNode } from "react";
import type { RingBeat } from "@/content/story";
import { RingDiagram } from "@/components/RingDiagram";

/**
 * One ring = one beat. In Phase 4 the diagram is replaced by the shared
 * canvas and this markup becomes the pinned copy layer; the DOM order
 * below is already the reading order a screen reader will follow.
 */
export function RingSection({
  beat,
  children,
}: {
  beat: RingBeat;
  children?: ReactNode;
}) {
  return (
    <section
      id={beat.id}
      data-beat={beat.id}
      data-ring={beat.ring}
      data-pinned={beat.pinned}
      className="rule-top relative px-4 py-28 sm:px-8 sm:py-36"
      aria-labelledby={`${beat.id}-h`}
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-20">
          <div className="max-w-2xl">
            <p className="font-display text-xs tracking-[0.36em] text-faint uppercase">
              {beat.eyebrow}
              <span className="ml-3 text-gunmetal-rim" aria-hidden>
                {beat.ring + 1}/6
              </span>
            </p>

            <h2
              id={`${beat.id}-h`}
              className="display-tight mt-6 text-[length:var(--text-beat)]"
            >
              {beat.headline}
            </h2>

            <p className="mt-7 text-lg leading-relaxed text-muted">{beat.body}</p>
          </div>

          <RingDiagram
            active={beat.ring}
            size={300}
            className="hidden shrink-0 lg:block"
          />
        </div>

        {children}
      </div>
    </section>
  );
}
