import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Route Groups ─────────────────────────────────────────────

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
  "/auth/callback",
];

const PROTECTED_ROUTES = ["/dashboard", "/chat", "/settings", "/wallet"];

// ─── Production-only flags ────────────────────────────────────

const IS_PROD =
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL_ENV === "production";

// ─── Security Headers ─────────────────────────────────────────

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  if (IS_PROD) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return response;
}

// ─── Helpers ──────────────────────────────────────────────────

function isPublic(pathname: string): boolean {
  return (
    PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) ||
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    /\.(svg|png|jpg|jpeg|gif|ico|woff2?|json|txt|xml|webmanifest)$/.test(
      pathname,
    )
  );
}

// Reads the auth flag cookie set by the client-side AuthContext.
// This cookie never contains the actual JWT — it's just a presence flag
// for routing decisions. Real auth happens via Authorization header.
function isAuthenticated(request: NextRequest): boolean {
  return request.cookies.get("auth")?.value === "1";
}

// ─── Proxy ────────────────────────────────────────────────────

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Public routes & static assets — allow
  if (isPublic(pathname)) {
    return withSecurityHeaders(NextResponse.next());
  }

  // 2. Authentication check — must have auth cookie
  if (!isAuthenticated(request)) {
    return withSecurityHeaders(
      NextResponse.redirect(new URL("/login", request.url)),
    );
  }

  // 3. Read mode cookie
  const modeCookie = request.cookies.get("catatin-mode")?.value;
  const hasMode = modeCookie === "pos" || modeCookie === "personal";

  // 4. /workspace — only if mode NOT set
  if (pathname.startsWith("/workspace")) {
    if (hasMode) {
      const target = modeCookie === "pos" ? "/dashboard/pos" : "/dashboard";
      return withSecurityHeaders(
        NextResponse.redirect(new URL(target, request.url)),
      );
    }
    return withSecurityHeaders(NextResponse.next());
  }

  // 5. Protected routes — must have mode
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!hasMode) {
      return withSecurityHeaders(
        NextResponse.redirect(new URL("/workspace", request.url)),
      );
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

// ─── Matcher ──────────────────────────────────────────────────

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
