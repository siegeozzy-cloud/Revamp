import { FIT } from "@/content/story";

/** The five systems. DTR carries `feature` and gets the wide cell. */
export function FitExtras() {
  return (
    <div className="mt-20 grid gap-px overflow-hidden rounded-xl bg-gunmetal-rim/35 sm:grid-cols-2 lg:grid-cols-3">
      {FIT.systems.map((system) => (
        <article
          key={system.name}
          className={`flex flex-col bg-void-lift p-7 sm:p-8 ${
            system.feature
              ? "sm:col-span-2 lg:col-span-1 lg:row-span-2 lg:justify-center"
              : ""
          }`}
        >
          <p className="font-display text-xs tracking-[0.28em] text-aim uppercase">
            {system.eyebrow}
          </p>
          <h3
            className={`display-tight mt-4 ${
              system.feature ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"
            }`}
          >
            {system.name}
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{system.copy}</p>
          {system.feature && (
            <p className="mt-6 inline-flex w-fit rounded-full border border-gunmetal-rim/70 px-3.5 py-1.5 text-xs tracking-wide text-muted">
              Payroll-ready exports
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
