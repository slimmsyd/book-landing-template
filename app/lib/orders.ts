import "server-only";
import { dbEnabled, sql } from "./db";
import type { FulfillableOrder } from "./fulfillment";

export type OrderRow = {
  id: number;
  stripe_payment_intent_id: string;
  email: string | null;
  name: string | null;
  shipping: string | null;
  qty: number;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
};

/** Persist a paid order. Idempotent on the payment-intent id. No-op if DB off. */
export async function upsertOrder(order: FulfillableOrder): Promise<void> {
  if (!dbEnabled) return;
  await sql`
    INSERT INTO orders (
      stripe_payment_intent_id, email, name, shipping, qty, amount_cents, currency, status
    ) VALUES (
      ${order.paymentIntentId}, ${order.email}, ${order.name}, ${order.shipping},
      ${order.qty}, ${order.amountCents}, ${order.currency}, 'paid'
    )
    ON CONFLICT (stripe_payment_intent_id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, shipping = EXCLUDED.shipping,
      qty = EXCLUDED.qty, amount_cents = EXCLUDED.amount_cents,
      currency = EXCLUDED.currency, status = EXCLUDED.status
  `;
}

/** Orders for the admin CRM, newest first. */
export async function getOrders(limit = 200): Promise<OrderRow[]> {
  if (!dbEnabled) return [];
  const rows = await sql`
    SELECT id, stripe_payment_intent_id, email, name, shipping, qty,
           amount_cents, currency, status, created_at
    FROM orders ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows as OrderRow[];
}

export async function getOrderCount(): Promise<number> {
  if (!dbEnabled) return 0;
  const rows = await sql`SELECT count(*)::int AS count FROM orders`;
  return (rows[0]?.count as number) ?? 0;
}
