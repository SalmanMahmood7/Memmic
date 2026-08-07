"use client";

import { usePortalDashboard } from "@/components/portal/use-portal-dashboard";
import { ClientPortalShell, PortalMetaRow } from "@/components/client-portal/client-portal-shell";
import { AlertTicker } from "@/components/portal/command-center/alert-ticker";
import { HealthScore } from "@/components/portal/command-center/health-score";
import { StatusTimeline } from "@/components/portal/command-center/status-timeline";
import { RefreshCw, ServerOff } from "lucide-react";
import { useEffect, useState } from "react";

export function PortalDashboardScaffold({
  allowedRole,
  portalLabel,
  tagline,
  portalType,
  children,
}: {
  allowedRole: string;
  portalLabel: string;
  tagline: string;
  portalType?: string;
  children: (data: NonNullable<ReturnType<typeof usePortalDashboard>["data"]>) => React.ReactNode;
}) {
  const { data, loading, error, refresh } = usePortalDashboard(portalType);
  const [alerts, setAlerts] = useState<NonNullable<ReturnType<typeof usePortalDashboard>["data"]>["alerts"]>([]);

  useEffect(() => {
    if (data) {
      setAlerts(data.alerts);
    }
  }, [data]);

  return (
    <ClientPortalShell allowedRole={allowedRole} portalLabel={portalLabel} tagline={tagline}>
      {profile => (
        <div className="space-y-6">
          <PortalMetaRow profile={profile} />

          {loading && (
            <div className="flex items-center justify-center rounded-xl border border-border bg-white p-16">
              <div className="text-center">
                <RefreshCw className="mx-auto size-6 animate-spin text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">Loading your executive dashboard…</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-xl border border-border bg-white p-10 text-center">
              <ServerOff className="mx-auto size-8 text-red-500" />
              <p className="mt-3 text-sm text-muted-foreground">{error}</p>
              <button
                onClick={refresh}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                <RefreshCw className="size-4" /> Retry
              </button>
            </div>
          )}

          {data && !loading && (
            <>
              {/* Module 1: Command Center */}
              <div className="grid gap-6 lg:grid-cols-3">
                <StatusTimeline stages={data.timeline} />
                <HealthScore health={data.health} />
                <AlertTicker
                  alerts={alerts}
                  onMarkRead={(id) =>
                    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)))
                  }
                />
              </div>

              {children(data)}
            </>
          )}
        </div>
      )}
    </ClientPortalShell>
  );
}
