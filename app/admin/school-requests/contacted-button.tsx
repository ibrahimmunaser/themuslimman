"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneCall, Check } from "lucide-react";
import { markContacted } from "@/lib/school-requests-admin";

interface Props {
  requestId: string;
}

export function ContactedButton({ requestId }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError]   = useState("");

  async function handleClick() {
    if (status !== "idle") return;
    setStatus("loading");
    setError("");

    try {
      const res = await markContacted(requestId);
      if (res.success) {
        setStatus("done");
        // Refresh server component data so status badge + tab counts update
        router.refresh();
      } else {
        setError(res.error ?? "Failed to mark contacted.");
        setStatus("idle");
      }
    } catch {
      setError("Network error. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
        <Check className="w-3.5 h-3.5" />
        Contacted
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={status === "loading"}
        onClick={handleClick}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <PhoneCall className="w-3.5 h-3.5" />
            Mark contacted
          </>
        )}
      </button>
      {error && (
        <p className="text-[11px] text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}
