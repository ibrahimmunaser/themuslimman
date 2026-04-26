"use client";

import { useState, useTransition } from "react";
import { updateRequestStatus, type RequestStatus } from "@/lib/organization-requests";

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "new",       label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "approved",  label: "Approved" },
  { value: "rejected",  label: "Rejected" },
];

const STATUS_STYLE: Record<RequestStatus, string> = {
  new:       "bg-blue-500/10 text-blue-400 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved:  "bg-green-500/10 text-green-400 border-green-500/20",
  rejected:  "bg-red-500/10 text-red-400 border-red-500/20",
};

interface Props {
  requestId: string;
  currentStatus: RequestStatus;
}

export function StatusControl({ requestId, currentStatus }: Props) {
  const [status, setStatus]   = useState<RequestStatus>(currentStatus);
  const [error,  setError]    = useState("");
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as RequestStatus;
    setError("");
    startTransition(async () => {
      const result = await updateRequestStatus(requestId, next);
      if (result.success) {
        setStatus(next);
      } else {
        setError(result.error ?? "Update failed.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-50 ${STATUS_STYLE[status]}`}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface text-text">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-400 text-[10px]">{error}</p>}
    </div>
  );
}
