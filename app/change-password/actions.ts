"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { roleHome } from "@/lib/roles";
import type { Role } from "@/lib/roles";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * Sets a new password for first-time setup (doesn't require current password).
 * Validates, updates the password, and redirects server-side on success.
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

  const user = await getCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    // Update the user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
  } catch (error) {
    console.error("Password update error:", error);
    return { error: "Failed to change password. Please try again." };
  }

  // Password is now updated; redirect to their home page
  const updatedUser = await getCurrentUser();
  redirect(updatedUser ? roleHome(updatedUser.role as Role) : "/login");
}
