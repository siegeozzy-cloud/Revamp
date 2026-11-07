import { THROW } from "@/content/story";

export function Throw() {
  return (
    <section
      id="throw"
      className="rule-top relative px-4 py-28 sm:px-8 sm:py-36"
      aria-labelledby="throw-h"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div>
          <h2 id="throw-h" className="display-tight text-[length:var(--text-beat)]">
            {THROW.headline}
          </h2>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted">
            {THROW.body}
          </p>
        </div>

        <ul className="flex flex-col gap-px overflow-hidden rounded-xl bg-gunmetal-rim/35 lg:self-center">
          {THROW.chips.map((chip) => (
            <li key={chip.label} className="bg-void-lift px-6 py-6 sm:px-8">
              <p className="font-display text-sm font-semibold tracking-wide text-aim-live">
                {chip.label}
              </p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
                {chip.copy}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
