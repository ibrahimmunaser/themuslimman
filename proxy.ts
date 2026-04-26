import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware performs the cheap first-pass: if there's no session cookie at all,
// redirect to /login. Full role checking happens server-side via requireRole()
// because middleware does not have DB access on the edge runtime.

const PROTECTED_PREFIXES = [
  "/admin",
  "/org-admin",
  "/teacher",
  "/student",
  "/change-password",
  // Legacy member routes kept for backwards compatibility
  "/dashboard",
  "/parts",
  "/conclusion",
];

const AUTH_ROUTES = ["/login", "/signup"];
const SESSION_COOKIE = "seerah_session";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
  const isAuth = AUTH_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuth && token) {
    // Signed-in users hitting /login or /signup go to the neutral redirect
    // resolver which picks the correct home based on role (handled server-side).
    return NextResponse.redirect(new URL("/post-login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/org-admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/change-password",
    "/dashboard/:path*",
    "/parts/:path*",
    "/conclusion/:path*",
    "/login",
    "/signup",
  ],
};
