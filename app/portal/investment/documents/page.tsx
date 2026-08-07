"use client";

import { PortalSubPageScaffold } from "@/components/portal/portal-subpage-scaffold";
import { DataRoom } from "@/components/portal/evaluation/data-room";
import { TermSheetHub } from "@/components/portal/investment/term-sheet-hub";
import { usePortalDashboard } from "@/components/portal/use-portal-dashboard";
import { LoadingCard, ErrorCard } from "@/components/portal/portal-feedback";

export default function InvestmentDocumentsPage() {
  const { data, loading, error, refresh } = usePortalDashboard();

  return (
    <PortalSubPageScaffold
      allowedRole="investment_client"
      portalLabel="Investment"
      title="Documents"
      subtitle="Your data room and term sheet documentation in one place."
    >
      {() => {
        if (loading) return <LoadingCard label="Loading your documents…" />;
        if (error) return <ErrorCard message={error} onRetry={refresh} />;
        if (!data) return null;

        return (
          <div className="space-y-6">
            <TermSheetHub termSheets={data.investment.term_sheets} />
            <DataRoom dataRoom={data.evaluation.data_room} />
          </div>
        );
      }}
    </PortalSubPageScaffold>
  );
}
