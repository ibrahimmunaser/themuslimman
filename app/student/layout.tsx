import { requireStudent } from "@/lib/auth";
import { AppShell } from "@/components/app/app-shell";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStudent();
  return <AppShell user={user}>{children}</AppShell>;
}
