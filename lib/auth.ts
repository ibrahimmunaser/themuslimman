"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { prisma } from "./db";
import type { SessionUser } from "./session";
import { ROLES, type Role, isRole } from "./roles";

const COOKIE_NAME = "seerah_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const BCRYPT_ROUNDS = 12;

// ─────────────────────────────────────────────────────────────
// Session helpers
// ─────────────────────────────────────────────────────────────

async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

async function createSession(userId: string): Promise<string> {
  const token = nanoid(48);
  const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE * 1000);
  await prisma.session.create({ data: { userId, token, expiresAt } });
  await setSessionCookie(token, expiresAt);
  return token;
}

// ─────────────────────────────────────────────────────────────
// getCurrentUser — reads session cookie, validates against DB
// ─────────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          student: { select: { id: true } },
        },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  const { user } = session;
  if (!isRole(user.role)) return null;
  if (!user.isActive) return null;

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    role: user.role as Role,
    isActive: user.isActive,
    profileImage: user.profileImage,
    timezone: user.timezone,
    studentProfileId: user.student?.id ?? null,
    emailVerified: user.emailVerified,
  };
}

// ─────────────────────────────────────────────────────────────
// Route guards
// ─────────────────────────────────────────────────────────────

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    // Redirect to role-specific home
    const home = user.role === ROLES.PLATFORM_ADMIN ? "/admin/dashboard" : "/student/dashboard";
    redirect(home);
  }
  return user;
}

export async function requirePlatformAdmin(): Promise<SessionUser> {
  return requireRole(ROLES.PLATFORM_ADMIN);
}

// Keep backward-compat alias
export { requirePlatformAdmin as requireAdmin };

export async function requireStudent(): Promise<SessionUser> {
  return requireRole(ROLES.STUDENT);
}

// ─────────────────────────────────────────────────────────────
// Login — username only (no email login)
// ─────────────────────────────────────────────────────────────

export async function login(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string; role?: Role }> {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: { student: true },
  });

  if (!user) {
    return { success: false, error: "Invalid username or password" };
  }

  if (!user.isActive) {
    return { success: false, error: "Account is deactivated" };
  }

  if (!user.passwordHash) {
    return { success: false, error: "Please set up your password first" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Invalid username or password" };
  }

  if (!user.emailVerified) {
    return { success: false, error: "Please verify your email before signing in" };
  }

  await createSession(user.id);
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return { success: true, role: user.role as Role };
}

// ─────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────

export async function logout(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
  }

  await clearSessionCookie();
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// Email verification
// ─────────────────────────────────────────────────────────────

export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) {
    return { success: false, error: "Invalid or expired verification link" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
    },
  });

  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// Password reset
// ─────────────────────────────────────────────────────────────

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    // Don't reveal if email exists
    return { success: true };
  }

  const resetToken = nanoid(32);
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpiry: resetExpiry,
    },
  });

  // TODO: Send password reset email

  return { success: true };
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return { success: false, error: "Invalid or expired reset link" };
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiry: null,
    },
  });

  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// Change password (for logged-in users)
// ─────────────────────────────────────────────────────────────

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser || !dbUser.passwordHash) {
    return { success: false, error: "User not found" };
  }

  const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!valid) {
    return { success: false, error: "Current password is incorrect" };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters" };
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: true };
}
