// Create the CRM tables in Neon (orders, subscribers, site_content).
// Optional — only needed if you want the admin CRM. The template runs without it.
// Run:  node --env-file=.env.local scripts/db-init.mjs
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL not set. Run: node --env-file=.env.local scripts/db-init.mjs");
  process.exit(1);
}

const sql = neon(url);

const SITE_CONTENT_DDL = `
  CREATE TABLE IF NOT EXISTS site_content (
    id          SMALLINT PRIMARY KEY DEFAULT 1,
    data        JSONB NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT site_content_singleton CHECK (id = 1)
  );
`;

const ORDERS_DDL = `
  CREATE TABLE IF NOT EXISTS orders (
    id                        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    stripe_payment_intent_id  TEXT NOT NULL UNIQUE,
    email                     TEXT,
    name                      TEXT,
    shipping                  TEXT,
    qty                       INTEGER NOT NULL DEFAULT 1,
    amount_cents              INTEGER NOT NULL,
    currency                  TEXT NOT NULL DEFAULT 'usd',
    status                    TEXT NOT NULL DEFAULT 'paid',
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    notification_sent_at      TIMESTAMPTZ
  );
`;

const SUBSCRIBERS_DDL = `
  CREATE TABLE IF NOT EXISTS subscribers (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email       TEXT NOT NULL UNIQUE,
    source      TEXT NOT NULL DEFAULT 'free-chapter',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`;

try {
  await sql.query(SITE_CONTENT_DDL);
  await sql.query(ORDERS_DDL);
  await sql.query(SUBSCRIBERS_DDL);
  // Idempotent migration for databases created before email notifications.
  await sql.query(
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ`,
  );
  // No seed: getSiteContent() falls back to site.config when the row is absent,
  // and the first admin save materializes the full document.
  console.log("✓ CRM tables ready: site_content, orders, subscribers");
} catch (err) {
  console.error("✗ Failed to initialize database:", err.message);
  process.exit(1);
}
