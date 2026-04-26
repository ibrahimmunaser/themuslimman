"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinClassByCode } from "@/lib/actions/student";

export default function JoinClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await joinClassByCode(code);
      if (result.success && result.classId) {
        router.push(`/student/classes/${result.classId}`);
        router.refresh();
      } else {
        setError(result.error || "Could not join.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-md mx-auto">
      <Link
        href="/student/dashboard"
        className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center mb-4">
          <KeyRound className="w-5 h-5 text-gold" />
        </div>
        <h1 className="text-2xl font-bold text-text">Join a class</h1>
        <p className="text-text-secondary text-sm mt-1">
          Enter the code your teacher shared with you.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-border rounded-2xl p-6 space-y-4"
      >
        <Input
          label="Class code"
          placeholder="e.g. SEERAH-FALL26"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          autoFocus
          className="uppercase font-mono tracking-wider"
        />
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full justify-center">
          Join class
        </Button>
      </form>

      <p className="text-center text-xs text-text-muted mt-4">
        Demo class code: <span className="font-mono text-gold">SEERAH-FALL26</span>
      </p>
    </div>
  );
}
