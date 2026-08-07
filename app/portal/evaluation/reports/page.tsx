"use client";

import { PortalSubPageScaffold } from "@/components/portal/portal-subpage-scaffold";
import { ValuationChart } from "@/components/portal/evaluation/valuation-chart";
import { RiskMetrics } from "@/components/portal/evaluation/risk-metrics";
import { usePortalDashboard } from "@/components/portal/use-portal-dashboard";
import { LoadingCard, ErrorCard } from "@/components/portal/portal-feedback";

export default function EvaluationReportsPage() {
  const { data, loading, error, refresh } = usePortalDashboard();

  return (
    <PortalSubPageScaffold
      allowedRole="evaluation_client"
      portalLabel="Evaluation"
      title="Reports"
      subtitle="Valuation outcomes and risk analysis from the evaluation team."
    >
      {() => {
        if (loading) return <LoadingCard label="Loading your reports…" />;
        if (error) return <ErrorCard message={error} onRetry={refresh} />;
        if (!data) return null;

        return (
          <div className="grid gap-6 lg:grid-cols-2">
            <ValuationChart valuations={data.evaluation.valuations} />
            <RiskMetrics metrics={data.evaluation.risk_metrics} />
          </div>
        );
      }}
    </PortalSubPageScaffold>
  );
}
