// Admin auth primitives — single-password login with a signed session cookie.
//
// NO `import "server-only"` and NO top-level throw: this module is imported by
// proxy.ts (runs before render) and by Server Actions / route handlers, and the
// template must build/run even when the CRM is disabled. Uses Web Crypto
// (crypto.subtle), available in every runtime.
//
// Credentials live ONLY in env (reproducible template, no secrets in code):
//   SESSION_SECRET        — HMAC key for the session cookie
//   ADMIN_PASSWORD_HASH   — sha256 hex of the password (preferred)
//   ADMIN_PASSWORD        — plaintext fallback

import { dbEnabled } from "./db";

export const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

/** Whether the admin CRM is fully configured (DB + a session secret + a password). */
export const crmEnabled =
  dbEnabled &&
  Boolean(process.env.SESSION_SECRET) &&
  Boolean(process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD);

const enc = new TextEncoder();

function bytesToB64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set.");
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** Signed session token: base64url(payload).base64url(hmac). */
export async function signSession(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({ iat: now, exp: now + SESSION_TTL_SECONDS });
  const payloadB64 = bytesToB64url(enc.encode(payload));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(payloadB64));
  return `${payloadB64}.${bytesToB64url(new Uint8Array(sig))}`;
}

/** Verify a session token's signature + expiry. Never throws. */
export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token || !token.includes(".") || !process.env.SESSION_SECRET) return false;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return false;
  try {
    const expected = new Uint8Array(
      await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(payloadB64)),
    );
    if (!timingSafeEqual(expected, b64urlToBytes(sigB64))) return false;
    const { exp } = JSON.parse(new TextDecoder().decode(b64urlToBytes(payloadB64)));
    return typeof exp === "number" && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Check a submitted password against ADMIN_PASSWORD_HASH (preferred) or ADMIN_PASSWORD. */
export async function verifyPassword(input: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    return timingSafeEqual(enc.encode(await sha256Hex(input)), enc.encode(hash));
  }
  const plain = process.env.ADMIN_PASSWORD;
  if (!plain) return false;
  return timingSafeEqual(enc.encode(await sha256Hex(input)), enc.encode(await sha256Hex(plain)));
}
