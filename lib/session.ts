// Simplified session type for platform admins and students only

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: "platform_admin" | "student";
  isActive: boolean;
  profileImage: string | null;
  timezone: string;
  studentProfileId: string | null;
  emailVerified: boolean;
}
