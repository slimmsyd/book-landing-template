/**
 * money.ts — shared pricing math + formatting.
 *
 * All amounts are integer CENTS until the moment they are displayed. The same
 * `computeOrder` runs on the client (for the order summary) and on the server
 * (for the Stripe charge), so the two can never disagree.
 */

import site from "@/site.config";

export type OrderTotals = {
  qty: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
};

/** Clamp a requested quantity to [1, maxQty]. */
export function clampQty(n: number): number {
  const max = site.product.maxQty;
  const q = Math.floor(Number(n)) || 0;
  return Math.max(1, Math.min(max, q));
}

/** Compute subtotal / shipping / total (all cents) from config + quantity. */
export function computeOrder(rawQty: number): OrderTotals {
  const qty = clampQty(rawQty);
  const subtotalCents = qty * site.product.priceCents;
  const freeShipping =
    site.product.shipFlatCents === 0 ||
    subtotalCents >= site.product.freeShipThresholdCents;
  const shippingCents = freeShipping ? 0 : site.product.shipFlatCents;
  return {
    qty,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
  };
}

/** Format an integer cents amount as a localized currency string. */
export function formatMoney(
  cents: number,
  currency: string = site.product.currency
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
