/**
 * POST /api/webhooks/stripe
 *
 * Verifies the Stripe signature against STRIPE_WEBHOOK_SECRET, then on
 * `payment_intent.succeeded` calls the pluggable fulfillOrder() hook.
 *
 * Local dev:
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * then copy the printed `whsec_...` into STRIPE_WEBHOOK_SECRET.
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/app/lib/stripe";
import { fulfillOrder } from "@/app/lib/fulfillment";

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not set." },
      { status: 500 }
    );
  }

  // Raw body is required for signature verification.
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[webhooks/stripe] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const m = pi.metadata ?? {};
    await fulfillOrder({
      paymentIntentId: pi.id,
      amountCents: pi.amount,
      currency: pi.currency,
      qty: Number(m.qty) || 0,
      email: m.email || pi.receipt_email || null,
      name: m.name || null,
      shipping: m.shipping || null,
    });
  }

  return NextResponse.json({ received: true });
}
