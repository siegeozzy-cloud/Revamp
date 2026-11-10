import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/Mark";
import { Footer } from "@/components/Footer";
import { DotBackdrop } from "@/components/DotBackdrop";
import { DemoCarousel } from "@/components/demo/DemoCarousel";

export const metadata: Metadata = {
  title: "Try the systems - Centaim demos",
  description:
    "Working front-end demos of the five Centaim business systems: inventory management, appointment scheduling, a recruitment portal, task management and daily time records. Swipe or drag between them.",
  openGraph: {
    title: "Try the systems - Centaim demos",
    description:
      "Five working front-end demos: inventory, scheduling, recruitment, tasks and daily time records.",
  },
};

export default function DemoPage() {
  return (
    <>
      <DotBackdrop intensity={0.35} />
      <main className="relative z-10">
        <header className="flex items-center gap-4 px-4 pt-6 sm:px-8 sm:pt-8">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <Mark className="h-7 w-7 text-aim" title="Centaim home" />
            <span className="font-display text-lg tracking-tight">Centaim</span>
          </Link>

          <Link
            href="/#contact"
            className="ml-auto rounded-full bg-cta px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cta-lift sm:px-7 sm:py-3"
          >
            Contact Us
          </Link>
        </header>

        <div className="pt-7 sm:pt-14">
          <DemoCarousel />
        </div>

        {/* Same rhythm as the /about sections: one rule, even padding above and
            below, so the footer rule underneath does not read as a stray line. */}
        <section className="rule-top mt-16 px-4 py-20 sm:mt-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[18rem_1fr] lg:gap-20">
            <h2 className="display-tight text-3xl sm:text-4xl">What you are looking at</h2>
            <div className="flex max-w-2xl flex-col gap-5 text-lg leading-relaxed text-muted">
              <p>
                Each demo is the front end only — real data, real rules and your own branding land
                in the build. Nothing here is saved, so click anything: advance a shipment, book a
                slot, hire a candidate, clock in.
              </p>
              <p>
                Screens, fields and workflow are drawn from how you already work. If none of the
                five is the system you need, that is usually the interesting conversation.
              </p>
              <Link
                href="/#contact"
                className="mt-2 inline-flex w-fit rounded-full bg-aim px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-aim-mid"
              >
                Tell us what you need
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
