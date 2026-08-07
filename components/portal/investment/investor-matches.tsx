"use client";

import { Building2, ChevronLeft, ChevronRight, Eye, Flame } from "lucide-react";
import { useState } from "react";

const INTEREST_META: Record<string, string> = {
  High: "bg-green-100 text-green-700 dark:bg-green-900/30",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30",
  Low: "bg-gray-100 text-gray-600 dark:bg-gray-700",
};

export function InvestorMatches({
  investors,
}: {
  investors: {
    name: string;
    type: string;
    industry: string;
    tier: string;
    interest: string;
    views: number;
    last_viewed: string;
  }[];
}) {
  const [idx, setIdx] = useState(0);
  if (!investors?.length) return null;

  const n = investors.length;

  return (
    <div className="bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Flame className="size-5 text-primary" />
        <h2 className="text-lg font-semibold text-ink">Investor Matches</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Anonymous institutional interest in your profile.</p>

      <div className="relative">
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((offset) => {
            const inv = investors[(idx + offset) % n];
            return (
              <div key={inv.name + offset} className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Building2 className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{inv.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.type} · {inv.industry}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{inv.tier}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${INTEREST_META[inv.interest] ?? ""}`}>
                    {inv.interest} interest
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="size-3.5" /> {inv.views} profile views
                  </span>
                  <span>Last active {inv.last_viewed}</span>
                </div>
              </div>
            );
          })}
        </div>

        {n > 2 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setIdx((i) => (i - 1 + n) % n)}
              className="rounded-full border border-border p-1.5 text-muted-foreground hover:text-primary"
              aria-label="Previous investors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-xs text-muted-foreground">
              {idx + 1}–{Math.min(idx + 2, n)} of {n}
            </span>
            <button
              onClick={() => setIdx((i) => (i + 1) % n)}
              className="rounded-full border border-border p-1.5 text-muted-foreground hover:text-primary"
              aria-label="Next investors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
