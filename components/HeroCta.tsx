import Link from "next/link";
import { HERO } from "@/content/story";

/**
 * Hero → the demo stage.
 *
 * This used to jump to the contact form, and had to take that jump manually:
 * `html { scroll-behavior: smooth }` crawled the reader through ten screens of
 * pinned story first. It is a route now, so a plain Link is correct again —
 * and the contact form is still one click away in the footer and the nav.
 */
export function HeroCta({ className = "" }: { className?: string }) {
  return (
    <Link
      href={HERO.cta.href}
      className={
        "rounded-full bg-cta px-7 py-3.5 text-sm font-medium text-white " +
        "transition-colors hover:bg-cta-lift " +
        className
      }
    >
      {HERO.cta.label}
    </Link>
  );
}
