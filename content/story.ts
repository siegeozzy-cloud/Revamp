/**
 * CENTAIM — "One Throw"
 * Phase 1 copy, as data.
 *
 * Single source of truth. The static sections render it, and the Phase 4
 * canvas keys off the same `id` values. Copy changes here and nowhere else.
 */

export type BeatId =
  | "hero"
  | "throw"
  | "styles"
  | "structure"
  | "fit"
  | "signal"
  | "security"
  | "lasts"
  | "bullseye"
  | "contact";

export interface RingBeat {
  id: BeatId;
  /** 0-indexed ring this beat targets, outside -> in. */
  ring: number;
  eyebrow: string;
  headline: string;
  body: string;
  /** Beats 4 and 6 fly past without pinning. */
  pinned: boolean;
}

export const HERO = {
  id: "hero" as const,
  brand: "CENTAIM",
  headline: "Every build needs a target.",
  body: "Most systems get built by guessing and corrected later. We start by naming exactly what has to be hit, then build until it's hit. Nothing shipped on hope.",
  scrollCue: "Follow the throw",
  cta: { label: "Contact Us", href: "#contact" },
};

export const THROW = {
  id: "throw" as const,
  headline: "A dart doesn't throw itself.",
  body: "Experienced developers set the line. AI tightens it, reviewing every change, catching what fatigue misses, holding the standard. Secure, built to convention, delivered fast.",
  chips: [
    { label: "Secure", copy: "Reviewed twice before it reaches your users." },
    { label: "Standard", copy: "Built to conventions any developer can pick up." },
    { label: "Fast", copy: "AI removes the slow parts, not the careful ones." },
  ],
};

export const STYLES: RingBeat = {
  id: "styles",
  ring: 0,
  eyebrow: "First ring",
  headline: "We aim for the styles.",
  body: "The first thing anyone judges, and the easiest to get wrong. Interfaces that look deliberate at every screen size, clear hierarchy, real motion, and nothing decorative that hasn't earned its place.",
  pinned: true,
};

export const STRUCTURE: RingBeat & {
  layers: { name: string; copy: string }[];
  processHeading: string;
  process: string[];
} = {
  id: "structure",
  ring: 1,
  eyebrow: "Second ring",
  headline: "We aim for the structure.",
  body: "Underneath every screen, four layers. Change the top one and nothing below it breaks. That's the difference between a system you grow into and one you outgrow in two years.",
  pinned: true,
  // Rendered bottom -> top, matching the cross-section reveal.
  layers: [
    { name: "Data", copy: "One source of truth. No record duplicated across modules." },
    { name: "API", copy: "Every function documented and reusable, so features connect instead of repeat." },
    { name: "Logic", copy: "Business rules and permissions in one place, not scattered across screens." },
    { name: "Interface", copy: "The part your staff touches. Replaceable without disturbing anything beneath it." },
  ],
  processHeading: "And how we keep it that way.",
  process: [
    "Version-controlled from the first commit.",
    "Every change reviewed by a developer and by AI.",
    "Staging that mirrors production, so you see it before your users do.",
    "Automated deploys, rollback in minutes.",
    "Documentation and handover — never hostage to one developer.",
    "Monitoring and scheduled maintenance after launch.",
  ],
};

export const FIT: RingBeat & {
  systems: { name: string; eyebrow: string; copy: string; feature?: boolean }[];
} = {
  id: "fit",
  ring: 2,
  eyebrow: "Third ring",
  headline: "We aim for the fit.",
  body: "Off-the-shelf software makes you work its way. We build around how your business already runs  then delete the steps you only ever did because the software demanded them.",
  pinned: true,
  systems: [
    {
      name: "Appointment Scheduler",
      eyebrow: "Center your focus",
      copy: "Client bookings in one calendar. Reschedule in seconds, automatic reminders, no double-booked staff.",
    },
    {
      name: "Recruitment Portal",
      eyebrow: "Spot the tailored people",
      copy: "Applications, candidate profiles and evaluations in one pipeline instead of an inbox.",
    },
    {
      name: "Inventory Management",
      eyebrow: "Aim the right deliverables",
      copy: "Stock counted in real time, so shortages surface before they stop work.",
    },
    {
      name: "Task Management",
      eyebrow: "Centralize the list",
      copy: "Planning, assignment and progress in one view. Everyone sees the same status.",
    },
    {
      name: "Daily Time Record",
      eyebrow: "Count every hour",
      copy: "Clock-in to payroll without the spreadsheet. Hours, overtime, late and undertime computed as they happen, exported in the format your payroll already accepts.",
      feature: true,
    },
  ],
};

export const SIGNAL: RingBeat & { micro: string[] } = {
  id: "signal",
  ring: 3,
  eyebrow: "Fourth ring",
  headline: "We aim for the signal.",
  body: "Your systems already record everything. AI analytics reads it back, attendance patterns before they become turnover, stock movement before it becomes a shortage, workload before it becomes burnout.",
  pinned: false,
  micro: [
    "Reports you didn't ask for.",
    "Trends before they're problems.",
    "Plain language, not dashboards.",
  ],
};

export const SECURITY: RingBeat = {
  id: "security",
  ring: 4,
  eyebrow: "Fifth ring",
  headline: "We aim for what holds.",
  body: "The work nobody notices until it fails. Encrypted in transit and at rest, access granted by role, automatic backups, and an audit trail of who changed what and when.",
  pinned: true,
};

export const LASTS: RingBeat = {
  id: "lasts",
  ring: 5,
  eyebrow: "Sixth ring",
  headline: "We aim for what lasts.",
  body: "Launch is the middle, not the end. Integrations with what you already use, automation for what you repeat, and the same team still reachable a year later.",
  pinned: false,
};

export const RING_BEATS = [STYLES, STRUCTURE, FIT, SIGNAL, SECURITY, LASTS];

export const BULLSEYE = {
  id: "bullseye" as const,
  headline: "Dead Center.",
  body: "Not a claim - an average, measured one week after launch.",
  stats: [
    { value: "+18%", label: "Efficiency" },
    { value: "+26%", label: "Engagement" },
    { value: "+65%", label: "Productivity" },
    { value: "−40%", label: "Time delays" },
  ],
  resolve: ["Centaim"],
};

export const CONTACT = {
  id: "contact" as const,
  headline: "Your turn to throw.",
  body: "Tell us what needs hitting. We'll come back with scope, timeline and cost - no obligation, no sales sequence.",
  fields: [
    { name: "name", label: "Name", type: "text", autoComplete: "name", required: true },
    { name: "email", label: "Email", type: "email", autoComplete: "email", required: true },
    { name: "phone", label: "Phone", type: "tel", autoComplete: "tel", required: false },
  ],
  messageField: { name: "message", label: "What do you need built?", required: true },
  submit: "Send it",
  directHeading: "Or skip the form.",
  phone: { display: "+63 919 493 7885", href: "tel:+639194937885" },
  email: { display: "contact@centaim.com", href: "mailto:contact@centaim.com" },
};

export const META = {
  title: "Centaim — Every build needs a target",
  description:
    "Centaim builds websites and custom business systems — scheduling, recruitment, inventory, task management and daily time records — with experienced developers and AI-assisted review.",
};
