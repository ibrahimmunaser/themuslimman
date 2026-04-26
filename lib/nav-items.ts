import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  Library,
  BarChart3,
  FolderTree,
  ShieldCheck,
} from "lucide-react";
import { ROLES, type Role } from "./roles";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const STUDENT_NAV: NavItem[] = [
  { href: "/student/dashboard", label: "Dashboard",   icon: LayoutDashboard, exact: true },
  { href: "/student/classes",   label: "My Classes",  icon: BookOpen },
  { href: "/student/progress",  label: "Progress",    icon: BarChart3 },
  { href: "/student/settings",  label: "Settings",    icon: Settings },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin/dashboard",        label: "Dashboard",        icon: LayoutDashboard, exact: true },
  { href: "/admin/students",         label: "Students",         icon: Users },
  { href: "/admin/classes",          label: "Classes",          icon: BookOpen },
  { href: "/admin/content",          label: "Content Library",  icon: Library },
  { href: "/admin/course-templates", label: "Course Templates", icon: FolderTree },
  { href: "/admin/analytics",        label: "Analytics",        icon: BarChart3 },
  { href: "/admin/settings",         label: "Settings",         icon: ShieldCheck },
];

export function navForRole(role: Role): NavItem[] {
  switch (role) {
    case ROLES.STUDENT:        return STUDENT_NAV;
    case ROLES.PLATFORM_ADMIN: return ADMIN_NAV;
    default:                   return STUDENT_NAV;
  }
}
