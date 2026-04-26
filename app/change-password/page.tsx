import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { roleHome } from "@/lib/roles";
import { ChangePasswordForm } from "./change-password-form";

export const metadata = { title: "Set Your Password" };
export const dynamic  = "force-dynamic";

export default async function ChangePasswordPage() {
  const user = await requireAuth();

  // If the user doesn't need to change their password, send them home.
  // Note: This check assumes there's a mustChangePassword field in the future
  // For now, we just show the form to all authenticated users
  
  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center p-4">
      <ChangePasswordForm userName={user.fullName} />
    </div>
  );
}
