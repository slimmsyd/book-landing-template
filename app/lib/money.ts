/**
 * money.ts — shared pricing math + formatting.
 *
 * All amounts are integer CENTS until the moment they are displayed. The same
 * `computeOrder` runs on the client (order summary) and the server (the Stripe
 * charge), so the two can never disagree. Pricing is passed in (sourced from the
 * live content) rather than read at module scope, so the CRM can change it.
 */

import type { SiteConfig } from "@/site.config";

export type Pricing = {
  priceCents: number;
  shipFlatCents: number;
  freeShipThresholdCents: number;
  maxQty: number;
  currency: string;
};

export type OrderTotals = {
  qty: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
};

/** Pull the pricing fields out of a product content object. */
export function pricingFrom(product: SiteConfig["product"]): Pricing {
  return {
    priceCents: product.priceCents,
    shipFlatCents: product.shipFlatCents,
    freeShipThresholdCents: product.freeShipThresholdCents,
    maxQty: product.maxQty,
    currency: product.currency,
  };
}

/** Clamp a requested quantity to [1, maxQty]. */
export function clampQty(n: number, maxQty: number): number {
  const q = Math.floor(Number(n)) || 0;
  return Math.max(1, Math.min(Math.max(1, maxQty), q));
}

/** Compute subtotal / shipping / total (all cents) from pricing + quantity. */
export function computeOrder(rawQty: number, p: Pricing): OrderTotals {
  const qty = clampQty(rawQty, p.maxQty);
  const subtotalCents = qty * p.priceCents;
  const freeShipping =
    p.shipFlatCents === 0 || subtotalCents >= p.freeShipThresholdCents;
  const shippingCents = freeShipping ? 0 : p.shipFlatCents;
  return {
    qty,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
  };
}

/** Format an integer cents amount as a localized currency string. */
export function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
