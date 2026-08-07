"use client";

import type { ApexOptions } from "apexcharts";
import { PortalChart } from "@/components/portal/portal-chart";

const COLORS = ["#5750F1", "#22C55E", "#F59E0B"];

export function KpiTrackers({
  kpis,
}: {
  kpis: { key: string; label: string; unit: string; current: number; target: number; series: { x: string; y: number }[] }[];
}) {
  if (!kpis?.length) return null;

  return (
    <div className="bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-ink">KPI Trackers</h2>
      <p className="text-sm text-muted-foreground mb-4">CAC reduction, default rates, and underwriting turnaround.</p>
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi, i) => {
          const pct = Math.round((kpi.current / kpi.target) * 100);
          const options: ApexOptions = {
            chart: { type: "area", toolbar: { show: false }, sparkline: { enabled: true } },
            colors: [COLORS[i % COLORS.length]],
            stroke: { curve: "smooth", width: 2 },
            fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.02 } },
            dataLabels: { enabled: false },
            xaxis: { labels: { show: false } },
            yaxis: { labels: { show: false } },
            tooltip: { enabled: false },
          };
          return (
            <div key={kpi.key} className="rounded-lg border border-border bg-gray-50 dark:bg-dark-4 p-4">
              <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
              <p className="mt-1 text-2xl font-bold text-ink">
                {kpi.current.toLocaleString()}
                <span className="text-sm font-medium text-muted-foreground"> {kpi.unit}</span>
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: COLORS[i % COLORS.length] }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {pct}% of target ({kpi.target.toLocaleString()}
                {kpi.unit})
              </p>
              <PortalChart type="area" height={70} options={options} series={[{ name: kpi.label, data: kpi.series }]} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
