"use client";

import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePasswordAndRedirect } from "./actions";

interface Props {
  userName: string;
}

export function ChangePasswordForm({ userName }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [showNew, setShowNew]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]           = useState("");
  const [newPassword, setNewPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      // changePasswordAndRedirect updates the DB and calls redirect() on
      // the server — the browser navigates automatically.
      // This function only returns if there's an error.
      const res = await changePasswordAndRedirect(newPassword);
      if (res?.error) {
        setError(res.error);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-12 h-12 mx-auto rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center mb-4">
          <ShieldCheck className="w-5 h-5 text-gold" />
        </div>
        <h1 className="text-2xl font-bold text-text mb-2">Set your password</h1>
        <p className="text-text-secondary text-sm">
          Welcome, {userName}. You must set a new password before continuing.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              label="New password"
              type={showNew ? "text" : "password"}
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowNew((p) => !p)}
              className="absolute right-3 top-9 text-text-muted hover:text-text-secondary transition-colors"
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm new password"
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-3 top-9 text-text-muted hover:text-text-secondary transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            disabled={submitting}
            className="w-full justify-center mt-1"
          >
            {submitting ? "Saving…" : "Set password and continue"}
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-text-muted mt-4">
        Your temporary credentials have been replaced. You will use this password for all future logins.
      </p>
    </div>
  );
}
