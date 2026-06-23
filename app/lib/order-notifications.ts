import "server-only";
import { sendOrderEmails } from "./email";
import { claimOrderForNotification, releaseNotificationClaim } from "./orders";
import { isEmailConfigured } from "./resend";

/**
 * Send purchase emails once per order. Safe to call on every
 * `payment_intent.succeeded` delivery — the DB claim guarantees exactly one
 * send. No-op when the DB is off (no order row to read) or Resend is unset.
 */
export async function notifyOrderIfNeeded(
  paymentIntentId: string,
): Promise<void> {
  if (!isEmailConfigured()) return;

  const order = await claimOrderForNotification(paymentIntentId);
  if (!order) return; // already sent, or DB disabled

  const result = await sendOrderEmails(order);
  if (!result.ok) {
    // Clear the claim so a later webhook retry can try again.
    await releaseNotificationClaim(paymentIntentId);
    console.error(
      "[order-notifications] failed for",
      paymentIntentId,
      result.error,
    );
  }
}
