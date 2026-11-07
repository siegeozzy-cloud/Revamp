import { STRUCTURE } from "@/content/story";

/**
 * The four-layer cross-section, as a static stack. In Phase 4 this is
 * what the clipping plane reveals at the cut edge of ring 2 — the order
 * here (bottom -> top) must stay matched to MECHANISM.structureLayers.
 */
export function StructureExtras() {
  const topDown = [...STRUCTURE.layers].reverse();

  return (
    <div className="mt-20 grid gap-12 lg:grid-cols-2 lg:gap-16">
      <div>
        <ul className="flex flex-col gap-px overflow-hidden rounded-xl bg-gunmetal-rim/35">
          {topDown.map((layer, i) => (
            <li
              key={layer.name}
              className="flex gap-5 bg-void-lift px-6 py-5 sm:px-7"
              style={{
                // Deeper layers sit visually heavier, like a real section cut.
                backgroundColor: `color-mix(in srgb, var(--color-gunmetal-deep) ${i * 16}%, var(--color-void-lift))`,
              }}
            >
              <span
                aria-hidden
                className="mt-1.5 h-px w-7 shrink-0 bg-aim"
                style={{ opacity: 1 - i * 0.18 }}
              />
              <div>
                <p className="font-display text-base font-semibold">{layer.name}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">
                  {layer.copy}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-faint">
          Interface on top, data at the base. Each layer replaceable on its own.
        </p>
      </div>

      <div>
        <h3 className="display-tight text-2xl sm:text-3xl">
          {STRUCTURE.processHeading}
        </h3>
        <ul className="mt-7 flex flex-col gap-4">
          {STRUCTURE.process.map((item) => (
            <li key={item} className="flex gap-4 text-[15px] leading-relaxed text-muted">
              <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aim" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
