"use client";

import { PortalActionItem, movePortalAction } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
] as const;

const PRIORITY_META: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30",
  low: "bg-gray-100 text-gray-600 dark:bg-gray-700",
};

export function ActionBoard({
  actions,
  onMove,
}: {
  actions: PortalActionItem[];
  onMove: (id: string, column: string) => void;
}) {
  const { token } = useAuth();
  const [moving, setMoving] = useState<string | null>(null);

  async function handleMove(id: string, column: string) {
    if (!token || moving) return;
    setMoving(id);
    try {
      await movePortalAction(token, id, column);
      onMove(id, column);
    } catch {
      // best effort
    } finally {
      setMoving(null);
    }
  }

  return (
    <div className="bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-ink">Action Plan</h2>
      <p className="text-sm text-muted-foreground mb-5">Operational restructuring tasks between your firm and MEMMIC.</p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = actions
            .filter((a) => a.column === col.key)
            .sort((a, b) => a.sort_order - b.sort_order);
          return (
            <div key={col.key} className="rounded-xl border border-border bg-gray-50 dark:bg-dark-4 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-sm font-semibold text-ink">{col.label}</p>
                <span className="rounded-full bg-white dark:bg-dark-3 border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2 min-h-24">
                {items.map((a) => {
                  const idx = COLUMNS.findIndex((c) => c.key === col.key);
                  return (
                    <div key={a.id} className="rounded-lg border border-border bg-white dark:bg-dark-3 p-3 shadow-sm">
                      <p className="text-sm font-medium text-ink">{a.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Assignee: {a.assignee}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${PRIORITY_META[a.priority] ?? ""}`}>
                          {a.priority}
                        </span>
                        {a.due_date && (
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Calendar className="size-3" /> {format(new Date(a.due_date), "MMM d")}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        {idx > 0 && (
                          <button
                            onClick={() => handleMove(a.id, COLUMNS[idx - 1].key)}
                            disabled={moving === a.id}
                            className="inline-flex items-center gap-0.5 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-primary disabled:opacity-50"
                          >
                            <ChevronLeft className="size-3" /> Back
                          </button>
                        )}
                        {idx < COLUMNS.length - 1 && (
                          <button
                            onClick={() => handleMove(a.id, COLUMNS[idx + 1].key)}
                            disabled={moving === a.id}
                            className="inline-flex items-center gap-0.5 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-primary disabled:opacity-50"
                          >
                            Forward <ChevronRight className="size-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
