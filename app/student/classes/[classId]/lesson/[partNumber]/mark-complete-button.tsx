"use client";

import { useTransition } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { markItemComplete } from "@/lib/actions/student";

export function MarkCompleteButton({
  classId,
  classCourseItemId,
  isCompleted,
}: {
  classId: string;
  classCourseItemId: string;
  isCompleted: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (isCompleted) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success/10 border border-success/30 text-success text-sm font-medium">
        <CheckCircle2 className="w-4 h-4" />
        Lesson completed
      </div>
    );
  }

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await markItemComplete(classId, classCourseItemId);
        })
      }
      disabled={isPending}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold/10 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/20 transition-colors disabled:opacity-50"
    >
      <Circle className="w-4 h-4" />
      {isPending ? "Saving…" : "Mark as complete"}
    </button>
  );
}
