"use client";

import type { ApexOptions } from "apexcharts";
import { PortalChart } from "@/components/portal/portal-chart";

export function ValuationChart({
  valuations,
}: {
  valuations: { method: string; label: string; low: number; high: number; mid: number }[];
}) {
  if (!valuations?.length) return null;

  const categories = valuations.map((v) => v.label);
  const colors = ["#5750F1", "#0ABEF9", "#22C55E"];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      stacked: false,
    },
    colors,
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 4,
        rangeBarOverlap: true,
      },
    },
    dataLabels: { enabled: false },
    stroke: { colors: ["transparent"] },
    xaxis: { categories },
    yaxis: { labels: { formatter: (v) => `$${v.toFixed(1)}M` } },
    tooltip: {
      y: { formatter: (v) => `$${v.toFixed(1)}M` },
    },
    legend: { position: "top", horizontalAlign: "left", fontSize: "13px" },
    fill: { opacity: 1 },
    grid: { strokeDashArray: 5 },
  };

  return (
    <div className="bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-ink">Valuation Ranges</h2>
      <p className="text-sm text-muted-foreground mb-2">Residual Income Model and Price-to-Book multiples, discounted for NPL ratio.</p>
      <PortalChart
        type="bar"
        height={300}
        options={options}
        series={[
          { name: "Low", data: valuations.map((v) => v.low) },
          { name: "Mid", data: valuations.map((v) => v.mid) },
          { name: "High", data: valuations.map((v) => v.high) },
        ]}
      />
    </div>
  );
}
