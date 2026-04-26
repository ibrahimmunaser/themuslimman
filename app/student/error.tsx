"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-error" />
        </div>
        <h2 className="text-lg font-bold text-text mb-2">Something went wrong</h2>
        <p className="text-text-secondary text-sm mb-6">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-gold/10 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
