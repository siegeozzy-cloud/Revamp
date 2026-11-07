"use server";

import { redirect } from "next/navigation";

/**
 * Enquiry handler.
 *
 * A Server Action, so the form submits as a plain POST and works with
 * JavaScript disabled — which is the whole point of the Phase 3 build.
 *
 * TODO(phase-5): this currently validates and discards. Wire the sink
 * (Resend / Formspree / a CRM endpoint) before launch, and add a spam
 * guard. The honeypot field below is already in the form.
 */
export async function submitEnquiry(formData: FormData) {
  const honeypot = String(formData.get("company") ?? "");
  if (honeypot.trim() !== "") redirect("/?sent=1#contact");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const invalid =
    name.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || message.length < 10;

  if (invalid) redirect("/?sent=0#contact");

  // eslint-disable-next-line no-console
  console.info("[centaim] enquiry", { name, email, phone, length: message.length });

  redirect("/?sent=1#contact");
}
