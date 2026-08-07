"use client";

import { PortalAlertItem, markPortalAlertRead } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, BellRing, CheckCircle2, Info } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

const SEVERITY_META: Record<string, { icon: typeof Info; classes: string; label: string }> = {
  critical: { icon: AlertTriangle, classes: "bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-900", label: "Critical" },
  warning: { icon: AlertTriangle, classes: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 border-yellow-200 dark:border-yellow-900", label: "Warning" },
  info: { icon: Info, classes: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200 dark:border-blue-900", label: "Info" },
};

export function AlertTicker({
  alerts,
  onMarkRead,
}: {
  alerts: PortalAlertItem[];
  onMarkRead: (id: string) => void;
}) {
  const { token } = useAuth();
  const [marking, setMarking] = useState<string | null>(null);
  const unread = alerts.filter((a) => !a.is_read);

  async function handleMark(id: string) {
    if (!token || marking) return;
    setMarking(id);
    try {
      await markPortalAlertRead(token, id);
      onMarkRead(id);
    } catch {
      // best effort
    } finally {
      setMarking(null);
    }
  }

  return (
    <div className="bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BellRing className="size-5 text-primary" />
          <h2 className="text-lg font-semibold text-ink">Alert Feed</h2>
        </div>
        {unread.length > 0 && (
          <span className="rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-semibold">
            {unread.length} unread
          </span>
        )}
      </div>

      <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
        {alerts.map((a) => {
          const meta = SEVERITY_META[a.severity] ?? SEVERITY_META.info;
          const Icon = meta.icon;
          return (
            <div
              key={a.id}
              className={`flex items-start gap-3 rounded-lg border p-3 ${meta.classes} ${a.is_read ? "opacity-60" : ""}`}
            >
              <Icon className="mt-0.5 size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{a.title}</p>
                  <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wide opacity-70">{meta.label}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{a.message}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[10px] text-muted">{format(new Date(a.created_at), "MMM d, h:mm a")}</span>
                  {!a.is_read && (
                    <button
                      onClick={() => handleMark(a.id)}
                      disabled={marking === a.id}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline disabled:opacity-50"
                    >
                      <CheckCircle2 className="size-3" /> Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BellRing className="size-8 text-gray-300 mb-2" />
            <p className="text-sm text-muted-foreground">No alerts right now</p>
          </div>
        )}
      </div>
    </div>
  );
}
