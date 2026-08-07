"use client";

import { TrendingUp } from "lucide-react";

export function DealPipeline({
  pipeline,
}: {
  pipeline: { stage: string; value: number; amount: number; color: string }[];
}) {
  if (!pipeline?.length) return null;

  const max = Math.max(...pipeline.map((p) => p.value));
  const totalAmount = pipeline.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="size-5 text-primary" />
        <h2 className="text-lg font-semibold text-ink">Deal Pipeline</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Active secondary-market negotiations · ${(totalAmount / 1_000_000).toFixed(0)}M in play
      </p>

      <div className="space-y-3">
        {pipeline.map((stage) => (
          <div key={stage.stage} className="flex items-center gap-3">
            <div className="w-44 shrink-0">
              <p className="truncate text-sm font-medium text-ink">{stage.stage}</p>
              <p className="text-xs text-muted-foreground">
                ${(stage.amount / 1_000_000).toFixed(0)}M
              </p>
            </div>
            <div className="h-8 flex-1 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
              <div
                className="flex h-full items-center justify-end rounded-md px-2"
                style={{ width: `${(stage.value / max) * 100}%`, backgroundColor: stage.color }}
              >
                {stage.value / max > 0.3 && (
                  <span className="text-xs font-semibold text-white">{stage.value}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
