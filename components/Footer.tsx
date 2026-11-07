import { CONTACT, RING_BEATS } from "@/content/story";
import Link from "next/link";
import { Mark } from "@/components/Mark";

export function Footer() {
  return (
    <footer className="rule-top px-4 py-16 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/" className="flex w-fit items-center gap-3 transition-opacity hover:opacity-80">
            <Mark className="h-7 w-7 text-aim" title="Centaim home" />
            <span className="font-display text-lg tracking-tight text-paper">Centaim</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-faint">
            Websites and custom business systems, built to hit a named target.
          </p>
        </div>

        <nav aria-label="Sections">
          <ul className="flex flex-wrap gap-x-7 gap-y-2.5 text-sm text-faint">
            <li>
              <Link href="/about" className="transition-colors hover:text-paper">
                About
              </Link>
            </li>
            {RING_BEATS.map((beat) => (
              <li key={beat.id}>
                {/* On the home page BeatNav turns this into a scroll to that
                    beat; from any other page it has to navigate home first. */}
                <Link
                  href={`/#${beat.id}`}
                  className="transition-colors hover:text-paper"
                >
                  {beat.headline.replace(/^We aim for /, "").replace(/\.$/, "")}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#contact" className="transition-colors hover:text-paper">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mx-auto mt-14 flex w-full max-w-6xl flex-col gap-2 text-sm text-faint sm:flex-row sm:justify-between">
        <p>
          <a href={CONTACT.phone.href} className="hover:text-paper">
            {CONTACT.phone.display}
          </a>
          <span className="mx-3 text-gunmetal-rim" aria-hidden>
            ·
          </span>
          <a href={CONTACT.email.href} className="hover:text-paper">
            {CONTACT.email.display}
          </a>
        </p>
        <p>© {new Date().getFullYear()} Centaim</p>
      </div>
    </footer>
  );
}
