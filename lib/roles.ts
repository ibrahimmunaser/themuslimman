export const ROLES = {
  PLATFORM_ADMIN: "platform_admin",
  STUDENT:        "student",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = [
  ROLES.PLATFORM_ADMIN,
  ROLES.STUDENT,
];

export function isRole(value: string | null | undefined): value is Role {
  return value === ROLES.PLATFORM_ADMIN || value === ROLES.STUDENT;
}

export function roleHome(role: Role): string {
  switch (role) {
    case ROLES.PLATFORM_ADMIN:
      return "/admin/dashboard";
    case ROLES.STUDENT:
      return "/student/dashboard";
    default:
      return "/";
  }
}

export function roleLabel(role: Role): string {
  switch (role) {
    case ROLES.PLATFORM_ADMIN: return "Platform Admin";
    case ROLES.STUDENT:        return "Student";
  }
}
