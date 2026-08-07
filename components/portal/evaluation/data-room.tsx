"use client";

import { FileCheck2, FileClock, FileQuestion, FolderOpen } from "lucide-react";

const STATUS_META: Record<string, { label: string; icon: typeof FileCheck2; classes: string }> = {
  approved: { label: "Approved", icon: FileCheck2, classes: "bg-green-100 text-green-700 dark:bg-green-900/30" },
  reviewed: { label: "Reviewed", icon: FileClock, classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30" },
  missing: { label: "Missing", icon: FileQuestion, classes: "bg-red-100 text-red-700 dark:bg-red-900/30" },
};

export function DataRoom({
  dataRoom,
}: {
  dataRoom: {
    total: number;
    reviewed: number;
    missing: number;
    approved: number;
    documents: { name: string; category: string; status: "reviewed" | "missing" | "approved" }[];
  };
}) {
  if (!dataRoom) return null;

  const stats = [
    { label: "Approved", value: dataRoom.approved, classes: "text-green-600" },
    { label: "Reviewed", value: dataRoom.reviewed, classes: "text-blue-600" },
    { label: "Missing", value: dataRoom.missing, classes: "text-red-600" },
    { label: "Total", value: dataRoom.total, classes: "text-ink" },
  ];

  return (
    <div className="bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <FolderOpen className="size-5 text-primary" />
        <h2 className="text-lg font-semibold text-ink">Data Room</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Bank-grade vault of tax records, loan books, and auditor reports for external audits.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-gray-50 dark:bg-dark-4 p-3 text-center">
            <p className={`text-2xl font-bold ${s.classes}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {dataRoom.documents.map((doc) => {
          const meta = STATUS_META[doc.status] ?? STATUS_META.missing;
          const Icon = meta.icon;
          return (
            <div key={doc.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.category}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.classes}`}>{meta.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
