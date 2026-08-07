"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function PortalChart({
  type,
  series,
  options,
  height = 300,
}: {
  type: "bar" | "line" | "area" | "donut" | "radialBar";
  series: ApexOptions["series"];
  options: ApexOptions;
  height?: number;
}) {
  return (
    <div className="-ml-3.5 mt-2">
      <Chart options={options} series={series} type={type} height={height} />
    </div>
  );
}
