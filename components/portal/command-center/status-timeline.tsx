"use client";

import { PortalStageItem } from "@/lib/api";
import { Check, CircleDashed, LoaderCircle } from "lucide-react";

export function StatusTimeline({ stages }: { stages: PortalStageItem[] }) {
  if (!stages?.length) return null;

  const currentIdx = stages.findIndex((s) => s.status === "in_progress");

  return (
    <div className="bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-ink">Command Center</h2>
        <p className="text-sm text-muted-foreground">Status across all MEMMIC engagement tracks.</p>
      </div>

      <div className="mt-6 space-y-4">
        {stages.map((s, i) => {
          const done = s.status === "completed";
          const active = s.status === "in_progress";
          const reached = i <= currentIdx || done;
          return (
            <div key={s.key} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 ${
                    done
                      ? "border-green-500 bg-green-500 text-white"
                      : active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-300 text-gray-400"
                  }`}
                >
                  {done ? (
                    <Check className="size-4" />
                  ) : active ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <CircleDashed className="size-4" />
                  )}
                </div>
                {i < stages.length - 1 && (
                  <div className={`my-1 w-0.5 flex-1 min-h-6 ${reached && !done ? "bg-primary/40" : "bg-gray-200"}`} />
                )}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <p className={`font-semibold ${active ? "text-primary" : done ? "text-ink" : "text-muted-foreground"}`}>
                    {s.label}
                  </p>
                </div>
                <p className="text-xs text-muted mt-0.5 capitalize">
                  {active ? "In progress" : done ? `Completed · ${s.date ?? ""}` : "Pending"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
