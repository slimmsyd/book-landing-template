/**
 * fulfillment.ts — pluggable order fulfillment hook.
 *
 * The Stripe webhook calls `fulfillOrder()` once a payment succeeds. The
 * default implementation logs the order and, if `ORDER_WEBHOOK_URL` is set,
 * forwards it as JSON (e.g. to a Zapier/Make/n8n hook or your own backend).
 *
 * This template intentionally ships WITHOUT a database so it stays pull-and-go.
 * To persist orders, replace the body of `fulfillOrder` with your DB write
 * (Prisma/Drizzle/Supabase/etc.) — this is the single seam you need to touch.
 */

export type FulfillableOrder = {
  paymentIntentId: string;
  amountCents: number;
  currency: string;
  qty: number;
  email: string | null;
  name: string | null;
  shipping: string | null;
};

export async function fulfillOrder(order: FulfillableOrder): Promise<void> {
  console.log("[fulfillOrder] payment succeeded", order);

  const url = process.env.ORDER_WEBHOOK_URL;
  if (url) {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(order),
      });
    } catch (err) {
      // Don't throw: the payment already succeeded. Log so the failure is
      // visible and can be retried out-of-band.
      console.error("[fulfillOrder] forward to ORDER_WEBHOOK_URL failed", err);
    }
  }

  // TODO: persist `order` to your database here if you need order history.
}
