import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession, crmEnabled } from "@/app/lib/auth";

/**
 * Admin gate (Next 16 "proxy" — the renamed middleware; Node runtime by default).
 * When the CRM is not configured (no DB / no admin env), the admin area does not
 * exist — every /admin and /api/admin path 404s, preserving the zero-DB template.
 * When configured, it verifies the signed session cookie.
 *
 * Defense in depth: admin pages/actions also call requireAdmin().
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!crmEnabled) {
    const url = request.nextUrl.clone();
    url.pathname = "/404";
    return NextResponse.rewrite(url);
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySession(token)) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)", "/api/admin/:path*"],
};
