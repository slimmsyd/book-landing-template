/**
 * POST /api/create-payment-intent
 *
 * Body: { qty: number, contact?: { email?, name?, address? } }
 *
 * The SERVER is the only pricing authority: it ignores any amount the client
 * sends and computes subtotal/shipping/total from site.config (cents). A
 * MAX_TOTAL_CENTS ceiling guards against absurd quantities. Returns the
 * PaymentIntent clientSecret for Stripe Elements.
 */

import { NextResponse } from "next/server";
import { computeOrder, pricingFrom } from "@/app/lib/money";
import { getSiteContent } from "@/app/lib/content";
import { getStripe } from "@/app/lib/stripe";

export const dynamic = "force-dynamic";

// Hard ceiling (cents) — refuse anything larger as a safety net. $50,000.
const MAX_TOTAL_CENTS = 5_000_000;

type Contact = {
  email?: string;
  name?: string;
  address?: string;
};

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe is not configured. Set STRIPE_SECRET_KEY in .env." },
      { status: 500 }
    );
  }

  let body: { qty?: unknown; contact?: Contact };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Pricing comes from the live content (DB-backed when the CRM is on), but the
  // amount is still computed here, server-side — the client never sets it.
  const site = await getSiteContent();
  const order = computeOrder(Number(body.qty) || 1, pricingFrom(site.product));

  if (order.totalCents > MAX_TOTAL_CENTS) {
    return NextResponse.json(
      { error: "Order total exceeds the maximum allowed." },
      { status: 400 }
    );
  }

  const contact = body.contact ?? {};

  try {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: order.totalCents,
      currency: site.product.currency,
      automatic_payment_methods: { enabled: true },
      receipt_email: contact.email || undefined,
      metadata: {
        product: site.product.title,
        qty: String(order.qty),
        subtotal_cents: String(order.subtotalCents),
        shipping_cents: String(order.shippingCents),
        total_cents: String(order.totalCents),
        email: contact.email ?? "",
        name: contact.name ?? "",
        shipping: contact.address ?? "",
      },
    });

    return NextResponse.json({
      clientSecret: intent.client_secret,
      totals: order,
    });
  } catch (err) {
    console.error("[create-payment-intent] Stripe error", err);
    return NextResponse.json(
      { error: "Could not create payment. Please try again." },
      { status: 502 }
    );
  }
}
