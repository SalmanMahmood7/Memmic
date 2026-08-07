"use client";

import { PortalHealth } from "@/lib/api";

const COMPONENT_LABELS: Record<string, string> = {
  evaluation: "Evaluation",
  management: "Management",
  marketplace: "Marketplace",
  investment: "Investment",
};

function scoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 65) return "text-yellow-600";
  return "text-red-600";
}

function ringColor(score: number) {
  if (score >= 80) return "#22C55E";
  if (score >= 65) return "#F59E0B";
  return "#EF4444";
}

export function HealthScore({ health }: { health: PortalHealth }) {
  const displayScore = health?.score ?? 0;
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(Math.max(displayScore, 0), 100) / 100) * c;

  return (
    <div className="bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm flex flex-col items-center">
      <div className="w-full flex items-center justify-between self-start">
        <div>
          <h2 className="text-lg font-semibold text-ink">Health Score</h2>
          <p className="text-sm text-muted-foreground">Combined operational rating.</p>
        </div>
      </div>

      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
          <circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-100 dark:text-gray-800" />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={ringColor(displayScore)}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${scoreColor(displayScore)}`}>{displayScore}</span>
          <span className="text-xs text-muted">/ 100</span>
        </div>
      </div>

      <div className="mt-5 w-full space-y-2">
        {Object.entries(health?.components ?? {}).map(([key]) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{COMPONENT_LABELS[key] ?? key}</span>
            <span className={`font-semibold ${scoreColor(health?.components?.[key] ?? 0)}`}>
              {health?.components?.[key] ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
