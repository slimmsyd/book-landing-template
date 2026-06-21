import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Optional database. The template runs fine with NO database (pull-and-go):
// when DATABASE_URL is unset, `dbEnabled` is false and every caller skips the DB.
// Importing this module never throws — that keeps the zero-DB build working.
const url = process.env.DATABASE_URL;

export const dbEnabled = Boolean(url);

// Neon HTTP client, or a guard that throws only if actually called while the DB
// is disabled (callers check `dbEnabled` first, so the guard is never hit).
export const sql: NeonQueryFunction<false, false> = url
  ? neon(url)
  : (((() => {
      throw new Error("Database is disabled (DATABASE_URL is not set).");
    }) as unknown) as NeonQueryFunction<false, false>);
