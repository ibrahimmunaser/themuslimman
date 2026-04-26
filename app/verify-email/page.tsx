"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, X, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    async function verify() {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage("Email verified successfully!");
          // Redirect to login after 2 seconds
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    }

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        {status === "verifying" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-4">
              <Loader className="w-8 h-8 text-gold animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-text mb-2">Verifying your email</h1>
            <p className="text-text-secondary text-sm">
              Please wait while we verify your account...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-text mb-2">Email verified!</h1>
            <p className="text-text-secondary text-sm mb-6">
              Your account is now active. Redirecting you to sign in...
            </p>
            <Link href="/login">
              <Button variant="primary" size="lg">
                Go to Sign In
              </Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-text mb-2">Verification failed</h1>
            <p className="text-red-400 text-sm mb-6">{message}</p>
            <div className="space-y-3">
              <Link href="/signup">
                <Button variant="primary" size="lg" className="w-full">
                  Create New Account
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="lg" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
