/**
 * POST /api/subscribe
 *
 * Body: { email: string }
 *
 * Validates the email and hands it to a pluggable handler. By default it logs
 * and, if EMAIL_WEBHOOK_URL is set, forwards the address as JSON (Mailchimp /
 * ConvertKit / Beehiiv / your own endpoint). No provider lock-in.
 */

import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  console.log("[subscribe] new signup", email);

  // Persist to the database when the CRM is enabled (no-op otherwise), and on a
  // genuinely new signup send the welcome + admin emails via Resend (no-op when
  // the DB or Resend env is unset).
  try {
    const { upsertSubscriber } = await import("@/app/lib/subscribers");
    const { isNew } = await upsertSubscriber(email, "free-chapter");
    if (isNew) {
      const { sendNewsletterEmails } = await import("@/app/lib/email");
      await sendNewsletterEmails(email);
    }
  } catch (err) {
    console.error("[subscribe] DB persist / email failed", err);
  }

  const url = process.env.EMAIL_WEBHOOK_URL;
  if (url) {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.error("[subscribe] forward to EMAIL_WEBHOOK_URL failed", err);
      // Still return success to the user; retry out-of-band if needed.
    }
  }

  // TODO: call your email provider's API here if you prefer direct integration.
  return NextResponse.json({ ok: true });
}
