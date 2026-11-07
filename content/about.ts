/**
 * About page copy.
 *
 * NOTE: deliberately contains no registration numbers, founding date,
 * headcount or client names — none of that was supplied, and inventing
 * any of it on a page whose whole point is credentials would be worse
 * than leaving it out. Add the real figures where the TODOs are.
 */

export const ABOUT_META = {
  title: "About Centaim - who we are and what we build",
  description:
    "Centaim builds websites and custom business systems in the Philippines - scheduling, recruitment, inventory, task management, daily time records and AI analytics. Registered with BIR and DTI, and PhilGEPS-registered for government procurement.",
};

export const ABOUT_HERO = {
  eyebrow: "About",
  headline: "We build the system, not the workaround.",
  body: "Centaim is a Philippine software team building websites and custom business systems. We work with companies who have outgrown spreadsheets and group chats, and who would rather fix the process than keep staffing around it.",
};

export const WHAT_WE_ARE = {
  heading: "What we are",
  paragraphs: [
    "A small team of experienced developers, working directly with the people who will use what we build. No account layer between you and the person writing the code.",
    "We build to a named target. Before anything is written we agree on what the system has to do and how we will know it worked — then we build until it does. That is where the name comes from: center, aim.",
    "AI is part of how we work, not what we sell. It reviews every change alongside a developer, catches what fatigue misses, and removes the slow parts of delivery without removing the careful ones.",
  ],
};

export const WHAT_WE_OFFER = {
  heading: "What we offer",
  intro:
    "Two things, and they are usually the same project: the site people judge you by, and the system your staff actually works in.",
  groups: [
    {
      title: "Websites",
      items: [
        "Design and build, responsive down to the smallest screen",
        "Content structure your team can update without us",
        "Performance, accessibility and search fundamentals",
      ],
    },
    {
      title: "Business systems",
      items: [
        "Appointment Scheduler - bookings, reminders, no double-booked staff",
        "Recruitment Portal - applications, profiles and evaluations in one pipeline",
        "Inventory Management - real-time stock, shortages surfaced early",
        "Task Management - planning, assignment and progress in one view",
        "Daily Time Record - clock-in to payroll-ready export, overtime and undertime computed as they happen",
      ],
    },
    {
      title: "On top of both",
      items: [
        "AI analytics — your own data read back as plain-language trends",
        "Security — encryption in transit and at rest, role-based access, backups, audit trail",
        "Integrations with the tools you already pay for",
        "Documentation, handover, monitoring and maintenance after launch",
      ],
    },
  ],
};

export const CREDENTIALS = {
  heading: "Registered and accredited",
  intro:
    "We are a registered Philippine business and eligible to bid for government work.",
  items: [
    {
      code: "BIR",
      name: "Bureau of Internal Revenue",
      copy: "Registered taxpayer. We issue official receipts for every engagement, so your finance team can book the expense properly.",
    },
    {
      code: "DTI",
      name: "Department of Trade and Industry",
      copy: "Registered business name - you are contracting with a real, traceable Philippine entity.",
    },
    {
      code: "PhilGEPS",
      name: "Philippine Government Electronic Procurement System",
      copy: "Registered supplier, so we can take part in government bidding and serve public-sector clients through the proper procurement channel.",
    },
  ],
  // TODO: add the actual TIN, DTI certificate number and PhilGEPS
  // registration number once supplied — credentials carry more weight
  // when they are verifiable.
  footnote: "Certificate details available on request.",
};

export const ABOUT_CTA = {
  headline: "Tell us what needs hitting.",
  body: "Scope, timeline and cost - no obligation, no sales sequence.",
  label: "Start a conversation",
  href: "/#contact",
};
