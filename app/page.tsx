import {
  FIT,
  LASTS,
  SECURITY,
  SIGNAL,
  STRUCTURE,
  STYLES,
} from "@/content/story";
import { Hero } from "@/components/sections/Hero";
import { Throw } from "@/components/sections/Throw";
import { RingSection } from "@/components/sections/RingSection";
import { StructureExtras } from "@/components/sections/StructureExtras";
import { FitExtras } from "@/components/sections/FitExtras";
import { Bullseye } from "@/components/sections/Bullseye";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/Footer";
import { StoryStage } from "@/components/StoryStage";
import { StageBoundary } from "@/components/StageBoundary";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <main>
      {/*
        The static sections are the server render, the no-JS render and the
        reduced-motion render. StoryStage replaces them with the scroll
        story only once it has confirmed the client can run it.
      */}
      <StageBoundary fallback={<StaticStory />}>
        <StoryStage fallback={<StaticStory />} />
      </StageBoundary>
      <Contact sent={sent === "1" ? "ok" : sent === "0" ? "error" : undefined} />
      <Footer />
    </main>
  );
}

function StaticStory() {
  return (
    <>
      <Hero />
      <Throw />

      <RingSection beat={STYLES} />

      <RingSection beat={STRUCTURE}>
        <StructureExtras />
      </RingSection>

      <RingSection beat={FIT}>
        <FitExtras />
      </RingSection>

      <RingSection beat={SIGNAL}>
        <ul className="mt-16 flex flex-wrap gap-x-10 gap-y-4">
          {SIGNAL.micro.map((line) => (
            <li key={line} className="text-lg text-aim-live">
              {line}
            </li>
          ))}
        </ul>
      </RingSection>

      <RingSection beat={SECURITY} />
      <RingSection beat={LASTS} />

      <Bullseye />
    </>
  );
}
