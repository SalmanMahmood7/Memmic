"use client";

import { PortalSubPageScaffold } from "@/components/portal/portal-subpage-scaffold";
import { FundingTracker } from "@/components/portal/investment/funding-tracker";
import { InvestorMatches } from "@/components/portal/investment/investor-matches";
import { usePortalDashboard } from "@/components/portal/use-portal-dashboard";
import { LoadingCard, ErrorCard } from "@/components/portal/portal-feedback";

export default function InvestmentStatusPage() {
  const { data, loading, error, refresh } = usePortalDashboard();

  return (
    <PortalSubPageScaffold
      allowedRole="investment_client"
      portalLabel="Investment"
      title="My Investment"
      subtitle="Capital milestones and institutional interest in your venture."
    >
      {() => {
        if (loading) return <LoadingCard label="Loading your investment…" />;
        if (error) return <ErrorCard message={error} onRetry={refresh} />;
        if (!data) return null;

        return (
          <div className="grid gap-6 lg:grid-cols-2">
            <FundingTracker funding={data.investment.funding} />
            <InvestorMatches investors={data.investment.investor_matches} />
          </div>
        );
      }}
    </PortalSubPageScaffold>
  );
}
