import { requireStudent } from "@/lib/auth";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function StudentSettingsPage() {
  const user = await requireStudent();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-text mb-1">Settings</h1>
      <p className="text-text-secondary text-sm mb-8">Your account and learning preferences.</p>

      <div className="space-y-6">
        {/* Profile */}
        <section className="p-6 rounded-2xl border border-border bg-surface">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">Profile</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">Full name</label>
              <div className="px-4 py-2.5 rounded-xl border border-border bg-surface-raised text-sm text-text">
                {user.fullName}
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Email</label>
              <div className="px-4 py-2.5 rounded-xl border border-border bg-surface-raised text-sm text-text">
                {user.email}
              </div>
            </div>
          </div>
        </section>

        <section className="p-6 rounded-2xl border border-border bg-surface">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
            Learning preferences
          </p>
          <p className="text-sm text-text-secondary">
            Notification settings, progress reminders, and display preferences coming soon.
          </p>
        </section>

        <p className="text-xs text-text-muted text-center">
          Full settings editing coming in the next update.
        </p>
      </div>
    </div>
  );
}
