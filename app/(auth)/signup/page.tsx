"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Mail, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { previewUsername } from "@/lib/username-generator";

export default function NewStudentSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"signup" | "verification">("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [generatedUsername, setGeneratedUsername] = useState("");
  const [sentToEmail, setSentToEmail] = useState("");

  // Preview username as user types their name
  const usernamePreview = form.fullName.trim().length >= 2 
    ? previewUsername(form.fullName) 
    : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validation
    if (form.fullName.trim().length < 2) {
      setError("Please enter your full name");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      // Success - show verification step
      setGeneratedUsername(data.username);
      setSentToEmail(form.email);
      setStep("verification");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "verification") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-text mb-2">Check your email</h1>
            <p className="text-text-secondary text-sm">
              We sent a verification link to:
            </p>
            <p className="text-gold font-medium mt-1">{sentToEmail}</p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <div className="p-4 rounded-lg bg-gold/5 border border-gold/20">
              <p className="text-sm text-text mb-2">
                <strong className="text-gold">Your username:</strong>
              </p>
              <p className="text-lg font-mono text-gold font-bold">
                {generatedUsername}
              </p>
              <p className="text-xs text-text-muted mt-2">
                Save this! You'll need it to sign in.
              </p>
            </div>

            <div className="space-y-3 text-sm text-text-secondary">
              <p className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" />
                <span>Click the link in the email to verify your account</span>
              </p>
              <p className="flex items-start gap-2">
                <User className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" />
                <span>Use your username to sign in (not your email)</span>
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-text-muted text-center">
                Didn't receive the email? Check your spam folder or{" "}
                <button className="text-gold hover:text-gold-light underline">
                  resend verification
                </button>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-gold hover:text-gold-light">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text mb-2">
            Start learning the Seerah
          </h1>
          <p className="text-text-secondary text-sm">
            Create your account and get instant access
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <Input
                label="Full name"
                type="text"
                placeholder="Ibrahim Munaser"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
                autoComplete="name"
              />
              {usernamePreview && (
                <p className="text-xs text-text-muted mt-1.5 flex items-center gap-1.5">
                  <User className="w-3 h-3" />
                  Your username will be: <span className="text-gold font-mono">{usernamePreview}</span>
                </p>
              )}
            </div>

            {/* Email */}
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />

            {/* Password */}
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="new-password"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-text-muted hover:text-text-secondary transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm Password */}
            <Input
              label="Confirm password"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              autoComplete="new-password"
              minLength={8}
            />

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full justify-center mt-2"
            >
              Create account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-border text-center">
            <p className="text-sm text-text-secondary">
              Already have an account?{" "}
              <Link href="/login" className="text-gold hover:text-gold-light font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-4">
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
