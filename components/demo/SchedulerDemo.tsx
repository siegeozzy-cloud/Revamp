"use client";

/**
 * Demo 2 — Appointment Scheduler, as "Arbor Clinic".
 *
 * Identity: warm paper, serif headings, terracotta. Deliberately the opposite
 * of Concorde's clinical white — a booking desk, not a control room.
 *
 * Try it: pick a day, tap a free slot to book, tap a booked one to cancel.
 * The day summary and the chair-utilisation ring recount on every change.
 */

import { useMemo, useState } from "react";
import { MeterRing } from "./viz";

const INK = { grid: "#ece2d6", muted: "#7a6e63", strong: "#2a211a", surface: "#ffffff" };
const CLAY = "#b4471f";
const PLUM = "#6b2d4f";
const SERIF = "Georgia, 'Iowan Old Style', 'Times New Roman', serif";

const DAYS = [
  { key: "mon", label: "Mon", date: "10" },
  { key: "tue", label: "Tue", date: "11" },
  { key: "wed", label: "Wed", date: "12" },
  { key: "thu", label: "Thu", date: "13" },
  { key: "fri", label: "Fri", date: "14" },
];

const TIMES = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

const STAFF = [
  { id: "reyes", name: "Dr. Reyes", role: "Dentistry", initials: "RR" },
  { id: "lim", name: "Dr. Lim", role: "Orthodontics", initials: "ML" },
  { id: "cruz", name: "Ms. Cruz", role: "Hygiene", initials: "AC" },
];

const SERVICES = ["Cleaning", "Consultation", "Extraction", "Braces check", "Whitening"];

interface Appt {
  id: number;
  day: string;
  staff: string;
  time: string;
  patient: string;
  service: string;
}

const SEED: Appt[] = [
  { id: 1, day: "mon", staff: "reyes", time: "09:00", patient: "J. Ramirez", service: "Cleaning" },
  { id: 2, day: "mon", staff: "reyes", time: "11:00", patient: "P. Tan", service: "Extraction" },
  { id: 3, day: "mon", staff: "lim", time: "10:00", patient: "K. Alvarez", service: "Braces check" },
  { id: 4, day: "mon", staff: "cruz", time: "13:00", patient: "L. Mendoza", service: "Cleaning" },
  { id: 5, day: "mon", staff: "cruz", time: "14:00", patient: "D. Garcia", service: "Whitening" },
  { id: 6, day: "tue", staff: "lim", time: "09:00", patient: "R. Santos", service: "Consultation" },
  { id: 7, day: "tue", staff: "reyes", time: "15:00", patient: "F. Dizon", service: "Cleaning" },
  { id: 8, day: "wed", staff: "cruz", time: "10:00", patient: "B. Ocampo", service: "Cleaning" },
];

export function SchedulerDemo() {
  const [appts, setAppts] = useState<Appt[]>(SEED);
  const [day, setDay] = useState("mon");
  const [column, setColumn] = useState(0); // which practitioner the phone layout shows
  const [booking, setBooking] = useState<{ staff: string; time: string } | null>(null);
  const [selected, setSelected] = useState<Appt | null>(null);
  const [draft, setDraft] = useState({ patient: "", service: SERVICES[0] });

  const today = useMemo(() => appts.filter((a) => a.day === day), [appts, day]);
  const capacity = STAFF.length * TIMES.length;

  const at = (staff: string, time: string) => today.find((a) => a.staff === staff && a.time === time);

  const confirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !draft.patient.trim()) return;
    setAppts((prev) => [
      ...prev,
      {
        id: Math.max(0, ...prev.map((a) => a.id)) + 1,
        day,
        staff: booking.staff,
        time: booking.time,
        patient: draft.patient.trim(),
        service: draft.service,
      },
    ]);
    setBooking(null);
    setDraft({ patient: "", service: SERVICES[0] });
  };

  return (
    <div className="relative flex h-full flex-col bg-[#fbf6ef] text-[#2a211a]">
      <header className="flex flex-wrap items-center gap-3 border-b border-[#ece2d6] bg-[#fffdfa] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-8 w-8 place-items-center rounded-full text-sm font-semibold text-white"
            style={{ background: CLAY }}
          >
            A
          </span>
          <span>
            <span className="block text-base leading-tight" style={{ fontFamily: SERIF }}>
              Arbor Clinic
            </span>
            <span className="block text-[11px] text-[#7a6e63]">Front desk · November 2026</span>
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs">
          <span className="rounded-full border border-[#e4d7c6] px-3 py-1.5 text-[#7a6e63]">Week 46</span>
          <button
            type="button"
            onClick={() => setBooking({ staff: STAFF[column].id, time: TIMES[0] })}
            className="rounded-full px-3.5 py-1.5 font-medium text-white"
            style={{ background: PLUM }}
          >
            New booking
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="grid flex-1 gap-4 p-4 sm:p-6 lg:grid-cols-[15rem_1fr]">
          {/* `contents` on phones lets these panels take their own order around the
              schedule; at lg they regroup into a real sidebar column. */}
          <aside className="contents lg:flex lg:flex-col lg:gap-4">
            <section className="order-1 rounded-2xl border border-[#ece2d6] bg-white p-4 lg:order-none">
              <h3 className="text-sm" style={{ fontFamily: SERIF }}>
                This week
              </h3>
              <ul className="mt-3 flex gap-1.5 lg:flex-col lg:gap-1">
                {DAYS.map((d) => {
                  const n = appts.filter((a) => a.day === d.key).length;
                  const on = d.key === day;
                  return (
                    <li key={d.key} className="flex-1">
                      <button
                        type="button"
                        onClick={() => setDay(d.key)}
                        aria-pressed={on}
                        className="flex w-full flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-center transition-colors lg:flex-row lg:justify-between lg:text-left"
                        style={{ background: on ? CLAY : "transparent", color: on ? "#fff" : "#2a211a" }}
                      >
                        <span className="text-xs font-medium">
                          {d.label} <span className="hidden lg:inline">{d.date}</span>
                        </span>
                        <span className="text-[11px]" style={{ color: on ? "rgba(255,255,255,.75)" : "#7a6e63" }}>
                          {n}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="order-3 rounded-2xl border border-[#ece2d6] bg-white p-4 lg:order-none">
              <h3 className="text-sm" style={{ fontFamily: SERIF }}>
                Chair utilisation
              </h3>
              <div className="mt-3">
                <MeterRing
                  value={today.length}
                  total={capacity}
                  color={CLAY}
                  track="#f2e7da"
                  ink={INK}
                  caption="slots filled today"
                  size={88}
                />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-xl bg-[#faf3ea] px-2 py-2">
                  <dt className="text-[#7a6e63]">Booked</dt>
                  <dd className="text-base font-semibold tabular-nums">{today.length}</dd>
                </div>
                <div className="rounded-xl bg-[#faf3ea] px-2 py-2">
                  <dt className="text-[#7a6e63]">Free</dt>
                  <dd className="text-base font-semibold tabular-nums">{capacity - today.length}</dd>
                </div>
              </dl>
            </section>

            <section className="order-4 hidden rounded-2xl border border-[#ece2d6] bg-white p-4 lg:order-none lg:block">
              <h3 className="text-sm" style={{ fontFamily: SERIF }}>
                Reminders
              </h3>
              <ul className="mt-2.5 flex flex-col gap-2 text-xs text-[#5c5147]">
                {["SMS sent 24h before", "Follow-up after extraction", "No-show flagged after 15 min"].map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: PLUM }} />
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          </aside>

          <section className="order-2 flex flex-col rounded-2xl border border-[#ece2d6] bg-white lg:order-none">
            <div className="flex flex-wrap items-center gap-2 border-b border-[#f0e7db] px-4 py-3">
              <h3 className="text-base" style={{ fontFamily: SERIF }}>
                {DAYS.find((d) => d.key === day)?.label}, Nov {DAYS.find((d) => d.key === day)?.date}
              </h3>
              <p className="text-[11px] text-[#7a6e63]">Tap a free slot to book</p>
              <div className="ml-auto flex gap-1.5 sm:hidden">
                {STAFF.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setColumn(i)}
                    aria-pressed={i === column}
                    className="rounded-full border px-2.5 py-1 text-[11px]"
                    style={{
                      borderColor: i === column ? CLAY : "#e4d7c6",
                      color: i === column ? CLAY : "#7a6e63",
                    }}
                  >
                    {s.initials}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="grid flex-1 grid-cols-[3.25rem_1fr] gap-px bg-[#f3ece2] p-px sm:grid-cols-[3.75rem_repeat(3,1fr)]"
              style={{ gridTemplateRows: `auto repeat(${TIMES.length}, minmax(2.6rem, 1fr))` }}
            >
              <div className="bg-white" />
              {STAFF.map((s, i) => (
                <div
                  key={s.id}
                  className={`bg-white px-2 py-2.5 text-center ${i === column ? "" : "hidden sm:block"}`}
                >
                  <p className="text-xs font-semibold">{s.name}</p>
                  <p className="text-[10px] text-[#7a6e63]">{s.role}</p>
                </div>
              ))}

              {TIMES.map((t) => (
                <div key={t} className="contents">
                  <div className="bg-white px-2 py-3 text-right text-[11px] text-[#7a6e63] tabular-nums">{t}</div>
                  {STAFF.map((s, i) => {
                    const appt = at(s.id, t);
                    const hiddenOnPhone = i === column ? "" : "hidden sm:block";
                    return appt ? (
                      <button
                        key={s.id + t}
                        type="button"
                        onClick={() => setSelected(appt)}
                        className={`bg-white p-1 text-left ${hiddenOnPhone}`}
                      >
                        <span
                          className="block h-full rounded-lg border-l-[3px] px-2 py-1.5"
                          style={{ borderColor: PLUM, background: "#f7eff3" }}
                        >
                          <span className="block truncate text-[11px] font-semibold">{appt.patient}</span>
                          <span className="block truncate text-[10px] text-[#7a6e63]">{appt.service}</span>
                        </span>
                      </button>
                    ) : (
                      <button
                        key={s.id + t}
                        type="button"
                        onClick={() => setBooking({ staff: s.id, time: t })}
                        className={`group bg-white p-1 ${hiddenOnPhone}`}
                      >
                        <span className="flex h-full min-h-[2.75rem] items-center justify-center rounded-lg border border-dashed border-[#e8dccd] text-[11px] text-transparent transition-colors group-hover:border-[#b4471f] group-hover:text-[#b4471f]">
                          + Book
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Booking sheet */}
      {booking && (
        <Sheet onClose={() => setBooking(null)} title="New appointment">
          <form onSubmit={confirm} className="flex flex-col gap-3">
            <p className="text-xs text-[#7a6e63]">
              {STAFF.find((s) => s.id === booking.staff)?.name} · {DAYS.find((d) => d.key === day)?.label}{" "}
              {booking.time}
            </p>
            <label className="text-xs font-medium">
              Patient
              <input
                autoFocus
                value={draft.patient}
                onChange={(e) => setDraft({ ...draft, patient: e.target.value })}
                placeholder="Full name"
                className="mt-1 w-full rounded-lg border border-[#e4d7c6] bg-[#fffdfa] px-3 py-2 text-sm font-normal outline-none focus:border-[#b4471f]"
              />
            </label>
            <label className="text-xs font-medium">
              Service
              <select
                value={draft.service}
                onChange={(e) => setDraft({ ...draft, service: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#e4d7c6] bg-[#fffdfa] px-3 py-2 text-sm font-normal outline-none focus:border-[#b4471f]"
              >
                {SERVICES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium">
              Time
              <select
                value={booking.time}
                onChange={(e) => setBooking({ ...booking, time: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#e4d7c6] bg-[#fffdfa] px-3 py-2 text-sm font-normal outline-none focus:border-[#b4471f]"
              >
                {TIMES.filter((t) => !at(booking.staff, t) || t === booking.time).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <div className="mt-1 flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-lg py-2 text-sm font-semibold text-white"
                style={{ background: CLAY }}
              >
                Confirm booking
              </button>
              <button
                type="button"
                onClick={() => setBooking(null)}
                className="rounded-lg border border-[#e4d7c6] px-4 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </Sheet>
      )}

      {/* Appointment detail */}
      {selected && (
        <Sheet onClose={() => setSelected(null)} title={selected.patient}>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Service" value={selected.service} />
            <Row label="With" value={STAFF.find((s) => s.id === selected.staff)?.name ?? ""} />
            <Row
              label="When"
              value={`${DAYS.find((d) => d.key === selected.day)?.label} ${selected.time}`}
            />
            <Row label="Status" value="Confirmed · reminder queued" />
          </dl>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAppts((prev) => prev.filter((a) => a.id !== selected.id));
                setSelected(null);
              }}
              className="flex-1 rounded-lg border border-[#e3b9a8] py-2 text-sm font-semibold"
              style={{ color: CLAY }}
            >
              Cancel appointment
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ background: PLUM }}
            >
              Close
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#f0e7db] pb-2">
      <dt className="text-[#7a6e63]">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[#2a211a]/30 backdrop-blur-[1px]"
      />
      <div className="relative m-3 w-full max-w-sm rounded-2xl border border-[#ece2d6] bg-white p-4 shadow-xl">
        <h4 className="mb-3 text-base" style={{ fontFamily: SERIF }}>
          {title}
        </h4>
        {children}
      </div>
    </div>
  );
}
