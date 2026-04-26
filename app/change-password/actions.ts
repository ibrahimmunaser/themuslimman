"use server";

import { redirect } from "next/navigation";
import { changePassword, getCurrentUser } from "@/lib/auth";
import { roleHome } from "@/lib/roles";
import type { Role } from "@/lib/roles";

/**
 * Validates, changes the password, and redirects server-side on success.
 * Using redirect() inside the server action avoids the client-side router
 * race (router.push + router.refresh) that caused the page to spin indefinitely
 * in Next.js 16 due to automatic post-action router cache invalidation.
 *
 * Returns only on failure — on success the browser is redirected by Next.js
 * before this function returns.
 */
export async function changePasswordAndRedirect(
  newPassword: string
): Promise<{ error: string }> {
  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const result = await changePassword(newPassword);

  if (!result.success) {
    return { error: result.error ?? "Failed to change password. Please try again." };
  }

  // Password is now updated; re-read user to get their role for the redirect.
  const user = await getCurrentUser();
  redirect(user ? roleHome(user.role as Role) : "/login");
}
