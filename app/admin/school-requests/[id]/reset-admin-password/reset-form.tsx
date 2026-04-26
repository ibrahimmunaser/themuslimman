"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound, Copy, Check, Eye, EyeOff, ShieldCheck,
  ArrowLeft, Building2, X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
  requestId: string;
  orgName:   string;
  username:  string | null;
}

interface ResetResult {
  orgName:      string;
  username:     string | null;
  tempPassword: string;
  loginUrl:     string;
}

export function ResetForm({ requestId, orgName, username }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState<ResetResult | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied]   = useState<string | null>(null);

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleReset() {
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `/api/admin/school-requests/${requestId}/reset-admin-password`,
        { method: "POST" }
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Reset failed. Please try again.");
        toast.error(data.error ?? "Reset failed.");
        return;
      }

      setResult(data as ResetResult);
      // Fire Sonner toast (best-effort; may not render in all layout contexts)
      toast.success("Password reset — new credentials ready to share.", { duration: 6000 });
    } catch {
      const msg = "Network error. Check your connection and try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  // ── Credential card (shown after a successful reset) ────────────────────────
  if (result) {
    const loginUrl = `${typeof window !== "undefined" ? window.location.origin : ""}${result.loginUrl}`;

    return (
      <div className="max-w-xl mx-auto">
        {/* In-page success notification banner */}
        <SuccessBanner message="Password reset — new credentials ready to share." />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">Password reset!</h2>
          <p className="text-text-secondary text-sm">
            A new temporary password has been generated. Share these credentials securely.
          </p>
        </div>

        {/* Credential card */}
        <div className="rounded-2xl border border-gold/30 bg-surface p-6 space-y-4 mb-6">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Building2 className="w-4 h-4 text-gold" />
            <span className="text-sm font-semibold text-gold">New Temporary Credentials</span>
          </div>

          {([
            { label: "Organization",      value: result.orgName,           key: "org",  secret: false },
            { label: "Login URL",         value: loginUrl,                  key: "url",  secret: false },
            { label: "Username",          value: result.username ?? "—",   key: "user", secret: false },
            { label: "New temp password", value: result.tempPassword,      key: "pass", secret: true  },
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
                    onClick={() => setShowPass((p) => !p)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary transition-colors"
                    title={showPass ? "Hide password" : "Reveal password"}
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
                  {copied === key
                    ? <Check className="w-3.5 h-3.5 text-green-400" />
                    : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Warning */}
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 mb-6">
          <p className="text-xs text-amber-300 leading-relaxed">
            <span className="font-semibold block mb-1">⚠ Important:</span>
            Send these credentials directly and securely to the org admin.
            The temporary password is shown <strong>only once</strong> and is not stored in plaintext.
            The admin will be forced to change their password on next login.
          </p>
        </div>

        {/* Next steps */}
        <div className="p-4 rounded-xl border border-border bg-surface-raised mb-6">
          <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-2">Next steps for the org admin</p>
          <ol className="space-y-1 text-xs text-text-secondary">
            <li>1. Go to <span className="font-mono text-gold">/login?mode=organization</span></li>
            <li>2. Enter username and new temporary password</li>
            <li>3. Change password when prompted</li>
            <li>4. Access the org dashboard at <span className="font-mono text-gold">/org-admin/dashboard</span></li>
          </ol>
        </div>

        <Button
          variant="secondary"
          size="md"
          className="w-full justify-center gap-2"
          onClick={() => router.push("/admin/school-requests")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all requests
        </Button>
      </div>
    );
  }

  // ── Confirmation screen (before reset is clicked) ───────────────────────────
  return (
    <div className="max-w-xl mx-auto">
      {/* Context card */}
      <div className="rounded-xl border border-border bg-surface-raised p-5 mb-8 text-sm">
        <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Resetting password for</p>
        <div className="space-y-2 text-text-secondary">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-text-muted flex-shrink-0" />
            <span className="text-text font-semibold">{orgName}</span>
          </div>
          {username && (
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-text-muted flex-shrink-0" />
              <span className="font-mono">{username}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 mb-6">
        <p className="text-xs text-amber-300 leading-relaxed">
          This will invalidate the current password and require the org admin to change it on next login.
          The new temporary password will be shown <strong>once only</strong>.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          disabled={loading}
          onClick={() => router.back()}
          className="flex-1 justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={loading}
          onClick={handleReset}
          className="flex-1 justify-center gap-2"
        >
          <KeyRound className="w-4 h-4" />
          {loading ? "Generating…" : "Generate new password"}
        </Button>
      </div>
    </div>
  );
}

// ── In-page success banner ────────────────────────────────────────────────────

function SuccessBanner({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 mb-6 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 text-sm">
      <div className="flex items-center gap-2">
        <Check className="w-4 h-4 flex-shrink-0" />
        <span>{message}</span>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="text-green-400/60 hover:text-green-400 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
