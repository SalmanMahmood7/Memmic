"use client";

import { PortalSubPageScaffold } from "@/components/portal/portal-subpage-scaffold";
import { StatusTimeline } from "@/components/portal/command-center/status-timeline";
import { DataRoom } from "@/components/portal/evaluation/data-room";
import { RiskMetrics } from "@/components/portal/evaluation/risk-metrics";
import { usePortalDashboard } from "@/components/portal/use-portal-dashboard";
import { LoadingCard, ErrorCard } from "@/components/portal/portal-feedback";

export default function EvaluationStatusPage() {
  const { data, loading, error, refresh } = usePortalDashboard();

  return (
    <PortalSubPageScaffold
      allowedRole="evaluation_client"
      portalLabel="Evaluation"
      title="My Evaluation"
      subtitle="Your evaluation status, risk metrics, and data room progress."
    >
      {() => {
        if (loading) return <LoadingCard label="Loading your evaluation…" />;
        if (error) return <ErrorCard message={error} onRetry={refresh} />;
        if (!data) return null;

        return (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <StatusTimeline stages={data.timeline} />
              <RiskMetrics metrics={data.evaluation.risk_metrics} />
            </div>
            <DataRoom dataRoom={data.evaluation.data_room} />
          </div>
        );
      }}
    </PortalSubPageScaffold>
  );
}
