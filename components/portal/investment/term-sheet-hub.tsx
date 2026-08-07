"use client";

import { FileLock2, ShieldCheck, ShieldX } from "lucide-react";

const STATUS_META: Record<string, { label: string; classes: string }> = {
  negotiating: { label: "Negotiating", classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30" },
  draft: { label: "Draft", classes: "bg-gray-100 text-gray-600 dark:bg-gray-700" },
  signed: { label: "Signed", classes: "bg-green-100 text-green-700 dark:bg-green-900/30" },
  closed: { label: "Closed", classes: "bg-green-100 text-green-700 dark:bg-green-900/30" },
};

const DD_META: Record<string, { label: string; icon: typeof ShieldCheck; classes: string }> = {
  passed: { label: "Passed", icon: ShieldCheck, classes: "text-green-600" },
  pending: { label: "Pending", icon: ShieldX, classes: "text-yellow-600" },
  failed: { label: "Failed", icon: ShieldX, classes: "text-red-600" },
};

export function TermSheetHub({
  termSheets,
}: {
  termSheets: {
    title: string;
    structure: string;
    offer_type: string;
    amount: number;
    status: string;
    due_diligence: { item: string; status: string }[];
  }[];
}) {
  if (!termSheets?.length) return null;

  return (
    <div className="bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <FileLock2 className="size-5 text-primary" />
        <h2 className="text-lg font-semibold text-ink">Term Sheet Hub</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Encrypted ledger for equity offers, debt structures, and due diligence.</p>

      <div className="space-y-4">
        {termSheets.map((ts) => {
          const meta = STATUS_META[ts.status] ?? STATUS_META.draft;
          return (
            <div key={ts.title} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{ts.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {ts.structure} · {ts.offer_type} · ${(ts.amount / 1_000_000).toFixed(0)}M
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${meta.classes}`}>{meta.label}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {ts.due_diligence.map((dd) => {
                  const ddMeta = DD_META[dd.status] ?? DD_META.pending;
                  const Icon = ddMeta.icon;
                  return (
                    <span key={dd.item} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                      <Icon className={`size-3.5 ${ddMeta.classes}`} />
                      {dd.item}: <span className={`font-medium ${ddMeta.classes}`}>{ddMeta.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
