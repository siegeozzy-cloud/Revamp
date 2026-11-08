import { HERO } from "@/content/story";
import { ContactCta } from "@/components/ContactCta";
import { RingDiagram } from "@/components/RingDiagram";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-center px-4 py-24 sm:px-8"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.22]">
        <RingDiagram active={null} showDart={false} size={760} className="max-w-[140vw]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl">
        <p className="font-display text-xs tracking-[0.42em] text-aim-mid">
          {HERO.brand}
        </p>

        <h1 className="display-tight mt-7 text-[length:var(--text-hero)]">
          {HERO.headline}
        </h1>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
          {HERO.body}
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-5">
          <ContactCta />
          <span className="flex items-center gap-2.5 text-sm text-faint">
            {HERO.scrollCue}
            <span aria-hidden className="text-aim-live">
              ↓
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
