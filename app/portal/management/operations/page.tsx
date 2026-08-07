"use client";

import { PortalSubPageScaffold } from "@/components/portal/portal-subpage-scaffold";
import { KpiTrackers } from "@/components/portal/management/kpi-trackers";
import { ActionBoard } from "@/components/portal/management/action-board";
import { usePortalDashboard } from "@/components/portal/use-portal-dashboard";
import { LoadingCard, ErrorCard } from "@/components/portal/portal-feedback";

export default function ManagementOperationsPage() {
  const { data, loading, error, refresh } = usePortalDashboard();

  return (
    <PortalSubPageScaffold
      allowedRole="management_client"
      portalLabel="Management"
      title="Operations"
      subtitle="Key performance indicators and the operational restructuring plan."
    >
      {() => {
        if (loading) return <LoadingCard label="Loading operations…" />;
        if (error) return <ErrorCard message={error} onRetry={refresh} />;
        if (!data) return null;

        return (
          <div className="space-y-6">
            <KpiTrackers kpis={data.management.kpis} />
            <ActionBoard actions={data.actions} onMove={() => {}} />
          </div>
        );
      }}
    </PortalSubPageScaffold>
  );
}
