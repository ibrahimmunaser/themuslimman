"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Building2, User, ShieldCheck, Copy, Check, ArrowRight,
  Eye, EyeOff, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  request: {
    id:               string;
    organizationName: string;
    contactName:      string;
    contactEmail:     string;
    organizationType: string | null;
    estimatedStudents: string | null;
  };
  suggestedSlug:     string;
  suggestedUsername: string;
}

interface ApprovalSuccess {
  orgName:      string;
  username:     string;
  tempPassword: string;
  loginUrl:     string;
}

type FormState = "form" | "success";

export function ApproveForm({ request, suggestedSlug, suggestedUsername }: Props) {
  const router  = useRouter();
  const params  = useParams<{ id: string }>();
  const [state, setState]     = useState<FormState>("form");
  const [result, setResult]   = useState<ApprovalSuccess | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied]   = useState<string | null>(null);

  const [form, setForm] = useState({
    orgName:       request.organizationName,
    orgSlug:       suggestedSlug,
    timezone:      "UTC",
    planType:      "pilot",
    studentLimit:  "50",
    teacherLimit:  "3",
    adminFullName: request.contactName,
    adminUsername: suggestedUsername,
    adminEmail:    request.contactEmail,
  });

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  function autoSlug() {
    setForm((p) => ({
      ...p,
      orgSlug: p.orgName.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"),
    }));
  }

  function autoUsername() {
    setForm((p) => ({
      ...p,
      adminUsername: p.adminFullName.toLowerCase().trim().replace(/[^a-z0-9\s._-]/g, "").replace(/\s+/g, "."),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      // Use fetch() to the API route instead of a server action.
      // Server actions automatically invalidate the Next.js router cache, which
      // causes the server component to re-render and show "Already approved"
      // before this client component can display the credential screen.
      const res = await fetch(`/api/admin/school-requests/${params.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName:      form.orgName,
          orgSlug:      form.orgSlug,
          timezone:     form.timezone,
          planType:     form.planType,
          studentLimit: Number(form.studentLimit) || 50,
          teacherLimit: Number(form.teacherLimit) || 3,
          adminFullName: form.adminFullName,
          adminUsername: form.adminUsername,
          adminEmail:    form.adminEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Approval failed. Please try again.");
        return;
      }

      setResult(data as ApprovalSuccess);
      setState("success");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (state === "success" && result) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">Organization approved!</h2>
          <p className="text-text-secondary text-sm">
            The org admin account has been created. Share these credentials securely.
          </p>
        </div>

        {/* Credential card */}
        <div className="rounded-2xl border border-gold/30 bg-surface p-6 space-y-4 mb-6">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Building2 className="w-4 h-4 text-gold" />
            <span className="text-sm font-semibold text-gold">Organization Credentials</span>
          </div>

          {([
            { label: "Organization",       value: result.orgName,      key: "org",  secret: false },
            { label: "Login URL",          value: `${typeof window !== "undefined" ? window.location.origin : ""}${result.loginUrl}`, key: "url",  secret: false },
            { label: "Username",           value: result.username,     key: "user", secret: false },
            { label: "Temporary password", value: result.tempPassword, key: "pass", secret: true  },
          ] as const).map(({ label, value, key, secret }) => (
            <div key={key} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">{label}</p>
                <p className={`font-mono text-sm text-text break-all ${secret && !showPass ? "blur-sm select-none" : ""}`}>
                  {value}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {secret && (
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => copyText(value, key)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-gold transition-colors"
                  title="Copy"
                >
                  {copied === key ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Warning: one-time display */}
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 mb-6">
          <p className="text-xs text-amber-300 leading-relaxed">
            <span className="font-semibold block mb-1">⚠ Important:</span>
            Send these credentials to the organization admin directly and securely.
            The temporary password is shown <strong>only once</strong> and is not stored in plaintext.
            The admin will be forced to change their password on first login.
          </p>
        </div>

        {/* Next steps */}
        <div className="p-4 rounded-xl border border-border bg-surface-raised mb-6">
          <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-2">Next steps for the org admin</p>
          <ol className="space-y-1 text-xs text-text-secondary">
            <li>1. Go to <span className="font-mono text-gold">/login?mode=organization</span></li>
            <li>2. Enter their username and temporary password</li>
            <li>3. Change their password when prompted</li>
            <li>4. Log in to the org dashboard at <span className="font-mono text-gold">/org-admin/dashboard</span></li>
            <li>5. Add teachers and students from the dashboard</li>
          </ol>
        </div>

        <Button
          variant="secondary"
          size="md"
          className="w-full justify-center"
          onClick={() => router.push("/admin/school-requests")}
        >
          Back to all requests
        </Button>
      </div>
    );
  }

  // ── Approval form ───────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Section: Organization */}
      <section>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <Building2 className="w-4 h-4 text-gold" />
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider">Organization</h2>
        </div>

        <div className="space-y-4">
          <Input label="Organization name *" type="text" value={form.orgName} onChange={update("orgName")} required />

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Slug * <span className="text-text-muted text-xs font-normal">(used in URLs — lowercase letters, numbers, hyphens)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.orgSlug}
                onChange={update("orgSlug")}
                required
                pattern="[a-z0-9-]+"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-colors"
              />
              <button
                type="button"
                onClick={autoSlug}
                className="px-3 py-2 rounded-xl border border-border bg-surface-raised text-text-muted hover:text-gold hover:border-gold/30 transition-colors"
                title="Auto-generate from name"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Timezone</label>
              <select
                value={form.timezone}
                onChange={update("timezone")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-colors"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (ET)</option>
                <option value="America/Chicago">America/Chicago (CT)</option>
                <option value="America/Denver">America/Denver (MT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
                <option value="Asia/Karachi">Asia/Karachi</option>
                <option value="Asia/Dhaka">Asia/Dhaka</option>
                <option value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur</option>
                <option value="Australia/Sydney">Australia/Sydney</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Plan */}
      <section>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <ShieldCheck className="w-4 h-4 text-gold" />
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider">Plan & Limits</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Plan type</label>
            <select
              value={form.planType}
              onChange={update("planType")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-colors"
            >
              <option value="pilot">Pilot (free)</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <Input label="Student limit" type="number" min="1" max="10000" value={form.studentLimit} onChange={update("studentLimit")} />
          <Input label="Teacher limit" type="number" min="1" max="100"  value={form.teacherLimit} onChange={update("teacherLimit")} />
        </div>
      </section>

      {/* Section: Org Admin */}
      <section>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <User className="w-4 h-4 text-gold" />
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider">Org Admin Account</h2>
        </div>

        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full name *" type="text" value={form.adminFullName} onChange={update("adminFullName")} required />
            <Input label="Email (optional)" type="email" value={form.adminEmail} onChange={update("adminEmail")} />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Username * <span className="text-text-muted text-xs font-normal">(used to log in)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.adminUsername}
                onChange={update("adminUsername")}
                required
                pattern="[a-z0-9._-]+"
                minLength={3}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-colors"
              />
              <button
                type="button"
                onClick={autoUsername}
                className="px-3 py-2 rounded-xl border border-border bg-surface-raised text-text-muted hover:text-gold hover:border-gold/30 transition-colors"
                title="Auto-generate from name"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-text-muted mt-1.5">
              A temporary password will be auto-generated and shown after approval.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          disabled={loading}
          onClick={() => window.history.back()}
          className="flex-1 justify-center"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={loading}
          className="flex-1 justify-center"
        >
          {loading ? "Creating…" : "Approve & Create Organization"}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </form>
  );
}

