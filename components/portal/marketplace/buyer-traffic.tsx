"use client";

import type { ApexOptions } from "apexcharts";
import { PortalChart } from "@/components/portal/portal-chart";

export function BuyerTrafficChart({
  traffic,
}: {
  traffic: { date: string; views: number; inquiries: number; engagement: number }[];
}) {
  if (!traffic?.length) return null;

  const options: ApexOptions = {
    chart: { type: "line", toolbar: { show: false }, zoom: { enabled: false } },
    colors: ["#5750F1", "#0ABEF9"],
    stroke: { curve: "smooth", width: 2.5 },
    dataLabels: { enabled: false },
    xaxis: { categories: traffic.map((t) => t.date.slice(5)), labels: { rotate: -45 } },
    yaxis: { labels: { formatter: (v) => `${v.toLocaleString()}` } },
    legend: { position: "top", horizontalAlign: "left", fontSize: "13px" },
    grid: { strokeDashArray: 5 },
    tooltip: {
      y: { formatter: (v) => v.toLocaleString() },
    },
  };

  return (
    <div className="bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-ink">Buyer Traffic</h2>
      <p className="text-sm text-muted-foreground mb-2">Profile views and inquiries from institutional buyers.</p>
      <PortalChart
        type="line"
        height={280}
        options={options}
        series={[
          { name: "Views", data: traffic.map((t) => t.views) },
          { name: "Inquiries", data: traffic.map((t) => t.inquiries) },
        ]}
      />
    </div>
  );
}
