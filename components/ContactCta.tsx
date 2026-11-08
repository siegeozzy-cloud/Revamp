"use client";

import { HERO } from "@/content/story";

/**
 * Hero → contact form.
 *
 * A plain anchor works, but `html { scroll-behavior: smooth }` then crawls
 * the reader through the whole pinned scroll story — ten screens of travel
 * that reads as "the button did nothing". So the jump is taken directly,
 * instantly, and the hash is still written so the URL and back button match.
 */
export function ContactCta({ className = "" }: { className?: string }) {
  return (
    <a
      href={HERO.cta.href}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        const target = document.getElementById("contact");
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "auto", block: "start" });
        history.pushState(null, "", HERO.cta.href);
        // Keyboard focus follows the jump, as a real anchor navigation would.
        target.querySelector<HTMLElement>("input, textarea, select")?.focus({
          preventScroll: true,
        });
      }}
      className={
        "rounded-full bg-cta px-7 py-3.5 text-sm font-medium text-white " +
        "transition-colors hover:bg-cta-lift " +
        className
      }
    >
      {HERO.cta.label}
    </a>
  );
}
