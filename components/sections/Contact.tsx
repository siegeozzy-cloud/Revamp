import { CONTACT } from "@/content/story";
import { submitEnquiry } from "@/app/actions";

const fieldClass =
  "w-full rounded-lg border border-gunmetal-rim/60 bg-void-lift px-4 py-3.5 text-[15px] text-paper " +
  "placeholder:text-faint/70 transition-colors hover:border-gunmetal-rim " +
  "focus:border-aim focus:outline-none focus-visible:outline-none";

export function Contact({ sent }: { sent?: "ok" | "error" }) {
  return (
    <section
      id="contact"
      className="rule-top px-4 py-28 sm:px-8 sm:py-36"
      aria-labelledby="contact-h"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-24">
        <div>
          <h2 id="contact-h" className="display-tight text-[length:var(--text-beat)]">
            {CONTACT.headline}
          </h2>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-muted">
            {CONTACT.body}
          </p>

          <div className="mt-14">
            <p className="font-display text-xs tracking-[0.3em] text-faint uppercase">
              {CONTACT.directHeading}
            </p>
            <p className="mt-5 flex flex-col gap-3">
              <a
                href={CONTACT.phone.href}
                className="w-fit text-xl text-paper transition-colors hover:text-aim-live"
              >
                {CONTACT.phone.display}
              </a>
              <a
                href={CONTACT.email.href}
                className="w-fit text-xl text-paper transition-colors hover:text-aim-live"
              >
                {CONTACT.email.display}
              </a>
            </p>
          </div>
        </div>

        <div>
          {sent === "ok" && (
            <p
              role="status"
              className="mb-8 rounded-lg border border-aim/50 bg-aim/10 px-5 py-4 text-[15px] text-aim-live"
            >
              Landed. We&apos;ll come back to you within one business day.
            </p>
          )}
          {sent === "error" && (
            <p
              role="alert"
              className="mb-8 rounded-lg border border-gunmetal-rim bg-void-lift px-5 py-4 text-[15px] text-muted"
            >
              That didn&apos;t go through — check the name, email and message fields.
            </p>
          )}

          <form action={submitEnquiry} className="flex flex-col gap-6" noValidate={false}>
            {/* Honeypot: hidden from people, irresistible to bots. */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="company">Company</label>
              <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {CONTACT.fields.map((field) => (
                <div
                  key={field.name}
                  className={field.name === "name" ? "sm:col-span-2" : undefined}
                >
                  <label
                    htmlFor={field.name}
                    className="mb-2 block text-sm font-medium text-muted"
                  >
                    {field.label}
                    {!field.required && (
                      <span className="ml-1.5 text-faint">(optional)</span>
                    )}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    required={field.required}
                    className={fieldClass}
                  />
                </div>
              ))}
            </div>

            <div>
              <label
                htmlFor={CONTACT.messageField.name}
                className="mb-2 block text-sm font-medium text-muted"
              >
                {CONTACT.messageField.label}
              </label>
              <textarea
                id={CONTACT.messageField.name}
                name={CONTACT.messageField.name}
                rows={5}
                required={CONTACT.messageField.required}
                className={`${fieldClass} resize-y`}
              />
            </div>

            <button
              type="submit"
              className="w-fit rounded-full bg-aim px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-aim-mid"
            >
              {CONTACT.submit}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
