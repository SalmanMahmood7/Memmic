"use client";

import type { ApexOptions } from "apexcharts";
import { PortalChart } from "@/components/portal/portal-chart";

const STATUS_META: Record<string, { label: string; classes: string }> = {
  healthy: { label: "On Target", classes: "bg-green-100 text-green-700 dark:bg-green-900/30" },
  attention: { label: "Needs Attention", classes: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30" },
  high: { label: "High Risk", classes: "bg-red-100 text-red-700 dark:bg-red-900/30" },
};

export function RiskMetrics({
  metrics,
}: {
  metrics: { key: string; label: string; value: number; target: number; unit: string; status: string }[];
}) {
  if (!metrics?.length) return null;

  const options: ApexOptions = {
    chart: { type: "radialBar", toolbar: { show: false } },
    plotOptions: {
      radialBar: {
        hollow: { size: "42%" },
        track: { background: "#f3f4f6" },
        dataLabels: {
          name: { show: true, fontSize: "11px", color: "#64748b" },
          value: { show: true, fontSize: "18px", fontWeight: 700, color: "#0F172A" },
        },
      },
    },
    labels: metrics.map((m) => m.label),
    colors: ["#5750F1", "#F59E0B", "#22C55E"],
    stroke: { lineCap: "round" },
  };

  return (
    <div className="bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-ink">Risk Metrics</h2>
      <p className="text-sm text-muted-foreground mb-2">NPL ratio, AML coverage, underwriting quality, and compliance risk.</p>
      <PortalChart
        type="radialBar"
        height={260}
        options={options}
        series={metrics.map((m) => Math.min((m.value / m.target) * 100, 100))}
      />
      <div className="mt-2 space-y-2">
        {metrics.map((m) => {
          const meta = STATUS_META[m.status] ?? STATUS_META.attention;
          return (
            <div key={m.key} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium text-ink">{m.label}</p>
                <p className="text-xs text-muted-foreground">
                  {m.value}
                  {m.unit} vs target {m.target}
                  {m.unit}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.classes}`}>{meta.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
