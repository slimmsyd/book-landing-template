/**
 * stripe.ts — server-only Stripe client (lazy singleton).
 *
 * The client is created on first use, not at import, so `next build` can
 * collect page data without STRIPE_SECRET_KEY present. Never import this from a
 * client component. The SDK pins its own API version; let it default so the
 * template isn't coupled to a specific dated version.
 */

import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (client) return client;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set — add it to .env.local before using payment routes."
    );
  }
  client = new Stripe(secretKey, { typescript: true });
  return client;
}
