import "server-only";
import { dbEnabled, sql } from "./db";

export type SubscriberRow = {
  id: number;
  email: string;
  source: string;
  created_at: string;
};

/**
 * Record a newsletter signup. Dedupes on email. No-op if DB off.
 * Returns `{ isNew }` — true only when this email was inserted for the first
 * time, so callers can send a welcome email exactly once.
 */
export async function upsertSubscriber(
  email: string,
  source = "free-chapter",
): Promise<{ isNew: boolean }> {
  if (!dbEnabled) return { isNew: false };
  const rows = await sql`
    INSERT INTO subscribers (email, source) VALUES (${email}, ${source})
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `;
  return { isNew: rows.length > 0 };
}

export async function getSubscribers(limit = 500): Promise<SubscriberRow[]> {
  if (!dbEnabled) return [];
  const rows = await sql`
    SELECT id, email, source, created_at
    FROM subscribers ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows as SubscriberRow[];
}

export async function getSubscriberCount(): Promise<number> {
  if (!dbEnabled) return 0;
  const rows = await sql`SELECT count(*)::int AS count FROM subscribers`;
  return (rows[0]?.count as number) ?? 0;
}
