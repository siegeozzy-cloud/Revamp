import { BULLSEYE } from "@/content/story";
import { RingDiagram } from "@/components/RingDiagram";
import { Mark } from "@/components/Mark";

export function Bullseye() {
  return (
    <section
      id="bullseye"
      className="rule-top relative px-4 py-28 sm:px-8 sm:py-40"
      aria-labelledby="bullseye-h"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25">
        <RingDiagram active="bull" showDart size={620} className="max-w-[130vw]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl text-center">
        <h2 id="bullseye-h" className="display-tight text-[length:var(--text-beat)]">
          {BULLSEYE.headline}
        </h2>
        <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-muted">
          {BULLSEYE.body}
        </p>

        <dl className="mt-16 grid grid-cols-2 gap-10 sm:gap-6 lg:grid-cols-4">
          {BULLSEYE.stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="display-tight block text-5xl text-aim-live sm:text-6xl">
                  {stat.value}
                </span>
                <span className="mt-2 block text-sm tracking-wide text-faint">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-24 flex items-center justify-center gap-5">
          <Mark className="h-14 w-14 shrink-0 text-aim-live sm:h-20 sm:w-20" />
          <p className="display-tight text-5xl tracking-tight sm:text-7xl">
            {BULLSEYE.resolve.join(" ")}
          </p>
        </div>
      </div>
    </section>
  );
}
