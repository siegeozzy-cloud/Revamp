import type { Metadata } from "next";
import Link from "next/link";
import {
  ABOUT_CTA,
  ABOUT_HERO,
  ABOUT_META,
  CREDENTIALS,
  WHAT_WE_ARE,
  WHAT_WE_OFFER,
} from "@/content/about";
import { Mark } from "@/components/Mark";
import { Footer } from "@/components/Footer";
import { DotBackdrop } from "@/components/DotBackdrop";

export const metadata: Metadata = {
  title: ABOUT_META.title,
  description: ABOUT_META.description,
  openGraph: { title: ABOUT_META.title, description: ABOUT_META.description },
};

export default function AboutPage() {
  return (
    <>
      <DotBackdrop intensity={0.45} />
      <main className="relative z-10">
      {/* Static page, no canvas — this one is read, not watched. */}
      <header className="px-4 pt-10 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Mark className="h-7 w-7 text-aim" title="Centaim home" />
          <span className="font-display text-lg tracking-tight">Centaim</span>
        </Link>
      </header>

      <section className="px-4 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto w-full max-w-5xl">
          <p className="font-display text-xs tracking-[0.42em] text-aim-mid uppercase">
            {ABOUT_HERO.eyebrow}
          </p>
          <h1 className="display-tight mt-7 max-w-3xl text-[length:var(--text-beat)]">
            {ABOUT_HERO.headline}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            {ABOUT_HERO.body}
          </p>
        </div>
      </section>

      <section className="rule-top px-4 py-20 sm:px-8 sm:py-28" aria-labelledby="what-we-are">
        <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[18rem_1fr] lg:gap-20">
          <h2 id="what-we-are" className="display-tight text-3xl sm:text-4xl">
            {WHAT_WE_ARE.heading}
          </h2>
          <div className="flex max-w-2xl flex-col gap-6">
            {WHAT_WE_ARE.paragraphs.map((text) => (
              <p key={text} className="text-lg leading-relaxed text-muted">
                {text}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="rule-top px-4 py-20 sm:px-8 sm:py-28" aria-labelledby="what-we-offer">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-20">
            <h2 id="what-we-offer" className="display-tight text-3xl sm:text-4xl">
              {WHAT_WE_OFFER.heading}
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-muted">
              {WHAT_WE_OFFER.intro}
            </p>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-xl bg-gunmetal-rim/35 md:grid-cols-3">
            {WHAT_WE_OFFER.groups.map((group) => (
              <div key={group.title} className="bg-void-lift p-7 sm:p-8">
                <h3 className="font-display text-lg font-semibold">{group.title}</h3>
                <ul className="mt-5 flex flex-col gap-3.5">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-[15px] leading-relaxed text-muted"
                    >
                      <span
                        aria-hidden
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-aim"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rule-top px-4 py-20 sm:px-8 sm:py-28" aria-labelledby="credentials">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-20">
            <h2 id="credentials" className="display-tight text-3xl sm:text-4xl">
              {CREDENTIALS.heading}
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-muted">
              {CREDENTIALS.intro}
            </p>
          </div>

          <dl className="mt-16 grid gap-px overflow-hidden rounded-xl bg-gunmetal-rim/35 md:grid-cols-3">
            {CREDENTIALS.items.map((item) => (
              <div key={item.code} className="bg-void-lift p-7 sm:p-8">
                <dt>
                  <span className="display-tight block text-3xl text-aim-live">
                    {item.code}
                  </span>
                  <span className="mt-2 block text-sm text-faint">{item.name}</span>
                </dt>
                <dd className="mt-5 text-[15px] leading-relaxed text-muted">
                  {item.copy}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-sm text-faint">{CREDENTIALS.footnote}</p>
        </div>
      </section>

      <section className="rule-top px-4 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="display-tight max-w-2xl text-[length:var(--text-beat)]">
            {ABOUT_CTA.headline}
          </h2>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-muted">
            {ABOUT_CTA.body}
          </p>
          <Link
            href={ABOUT_CTA.href}
            className="mt-12 inline-flex rounded-full bg-aim px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-aim-mid"
          >
            {ABOUT_CTA.label}
          </Link>
        </div>
      </section>

        <Footer />
      </main>
    </>
  );
}
