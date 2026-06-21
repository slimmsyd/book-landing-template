import "server-only";
import { cache } from "react";
import site, { type SiteConfig } from "@/site.config";
import { dbEnabled, sql } from "./db";

// The editable site content IS the full SiteConfig. The `site` export from
// site.config.ts is the default/seed; the DB (when enabled) holds the edited
// version. With no DB, the site behaves exactly as the static template.
export type SiteContent = SiteConfig;

type Json = Record<string, unknown>;

/**
 * Deep-merge a stored override doc over the defaults.
 * - objects: recurse key-by-key (missing keys fall back to defaults)
 * - arrays: replace wholesale (lists are user-owned; never element-merge)
 * - scalars/null: the stored value wins when present
 */
function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base) || Array.isArray(override)) return override as T;
  if (typeof base === "object" && typeof override === "object") {
    const out: Json = { ...(base as Json) };
    for (const [k, v] of Object.entries(override as Json)) {
      out[k] = k in (base as Json) ? deepMerge((base as Json)[k], v) : v;
    }
    return out as T;
  }
  return override as T;
}

/**
 * The live site content. Reads the DB (merged over defaults) when enabled,
 * else returns the static config. Wrapped in React cache() so multiple reads in
 * one request hit the DB once. Never throws — falls back to defaults on error.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  if (!dbEnabled) return site;
  try {
    const rows = await sql`SELECT data FROM site_content WHERE id = 1`;
    const stored = rows[0]?.data as Partial<SiteConfig> | undefined;
    return stored ? deepMerge(site, stored) : site;
  } catch {
    return site;
  }
});

/** Persist the full edited config (admin only). */
export async function updateSiteContent(next: SiteContent): Promise<void> {
  const json = JSON.stringify(next);
  await sql`
    INSERT INTO site_content (id, data, updated_at)
    VALUES (1, ${json}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET data = ${json}::jsonb, updated_at = now()
  `;
}

/** Last time content was edited (for the dashboard); null if never / DB off. */
export async function getContentUpdatedAt(): Promise<Date | null> {
  if (!dbEnabled) return null;
  try {
    const rows = await sql`SELECT updated_at FROM site_content WHERE id = 1`;
    return rows[0]?.updated_at ? new Date(rows[0].updated_at as string) : null;
  } catch {
    return null;
  }
}

// Re-export the default config for callers that want the raw seed (e.g. the
// save-action shape validator).
export { site as defaultContent };
