import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { roleHome } from "@/lib/roles";

export const dynamic = "force-dynamic";

const SESSION_COOKIE = "seerah_session";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  const origin = new URL(request.url).origin;

  if (!user) {
    // Clear the stale cookie so the middleware doesn't redirect /login → /post-login again
    const response = NextResponse.redirect(new URL("/login", origin));
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  // Direct to user's home page based on role
  return NextResponse.redirect(new URL(roleHome(user.role), origin));
}
