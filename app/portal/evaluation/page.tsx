"use client";

import { PortalDashboardScaffold } from "@/components/portal/portal-dashboard-scaffold";
import { ValuationChart } from "@/components/portal/evaluation/valuation-chart";
import { RiskMetrics } from "@/components/portal/evaluation/risk-metrics";
import { DataRoom } from "@/components/portal/evaluation/data-room";

export default function EvaluationPortalPage() {
  return (
    <PortalDashboardScaffold
      allowedRole="evaluation_client"
      portalLabel="Evaluation"
      portalType="evaluation"
      tagline="Establish your financial worth, operational health, and risk profile through valuation, compliance audit, and due diligence."
    >
      {data => (
        <>
          <h2 className="text-xl font-semibold text-ink">Evaluation Analytics</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <ValuationChart valuations={data.evaluation.valuations} />
            <RiskMetrics metrics={data.evaluation.risk_metrics} />
          </div>
          <DataRoom dataRoom={data.evaluation.data_room} />
        </>
      )}
    </PortalDashboardScaffold>
  );
}
