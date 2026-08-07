"use client";

import { MessageSquareQuote, Download } from "lucide-react";
import { format } from "date-fns";

export function AdvisoryNotes({
  notes,
}: {
  notes: { id: string; title: string; content: string; author: string; created_at: string }[];
}) {
  if (!notes?.length) return null;

  return (
    <div className="bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquareQuote className="size-5 text-primary" />
        <h2 className="text-lg font-semibold text-ink">Advisory Notes</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Strategic recommendations from your consulting team.</p>

      <div className="space-y-4">
        {notes.map((n) => (
          <div key={n.id} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{n.title}</p>
                <p className="text-xs text-muted-foreground">
                  {n.author} · {format(new Date(n.created_at), "MMM d, yyyy")}
                </p>
              </div>
              <button className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:text-primary">
                <Download className="size-3" /> Report
              </button>
            </div>
            <p className="mt-2 text-sm text-ink/80 leading-relaxed">{n.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
