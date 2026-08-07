"use client";

import { Target, TrendingUp } from "lucide-react";

export function FundingTracker({
  funding,
}: {
  funding: {
    goal: number;
    raised: number;
    currency: string;
    milestones: { label: string; amount: number; reached: boolean }[];
  };
}) {
  if (!funding) return null;

  const pct = Math.min(Math.round((funding.raised / funding.goal) * 100), 100);

  return (
    <div className="bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Target className="size-5 text-primary" />
        <h2 className="text-lg font-semibold text-ink">Funding Tracker</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Capital raised to date against your financing goal.</p>

      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-3xl font-bold text-ink">
            ${(funding.raised / 1_000_000).toFixed(1)}M
            <span className="text-sm font-medium text-muted-foreground"> {funding.currency}</span>
          </p>
          <p className="text-xs text-muted-foreground">raised of ${(funding.goal / 1_000_000).toFixed(0)}M goal</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30">
          <TrendingUp className="size-3.5" /> {pct}%
        </span>
      </div>

      <div className="mt-2 h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-green-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-5 space-y-3">
        {funding.milestones.map((m) => (
          <div key={m.label} className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <span className={`size-2.5 rounded-full ${m.reached ? "bg-green-500" : "bg-gray-300"}`} />
              <p className="text-sm font-medium text-ink">{m.label}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              ${(m.amount / 1_000_000).toFixed(0)}M {m.reached ? "· Reached" : "· Upcoming"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
