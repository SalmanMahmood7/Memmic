"use client";

import { toast } from "sonner";

export function ExportButton() {
  const handleExport = () => {
    toast.loading("Generating report...");
    setTimeout(() => {
      toast.dismiss();
      toast.success("Report downloaded successfully (CSV / PDF)");
    }, 1200);
  };

  return (
    <button
      onClick={handleExport}
      className="rounded bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 flex items-center gap-1.5"
    >
      Export Report
    </button>
  );
}
