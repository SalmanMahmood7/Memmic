"use client";

import { PortalDashboardScaffold } from "@/components/portal/portal-dashboard-scaffold";
import { FundingTracker } from "@/components/portal/investment/funding-tracker";
import { InvestorMatches } from "@/components/portal/investment/investor-matches";
import { TermSheetHub } from "@/components/portal/investment/term-sheet-hub";

export default function InvestmentPortalPage() {
  return (
    <PortalDashboardScaffold
      allowedRole="investment_client"
      portalLabel="Investment"
      portalType="investment"
      tagline="Deploy capital to fuel growth and scale operations — equity injection, venture debt, and syndicated matchmaking."
    >
      {data => (
        <>
          <h2 className="text-xl font-semibold text-ink">Investment Portal</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <FundingTracker funding={data.investment.funding} />
            <InvestorMatches investors={data.investment.investor_matches} />
          </div>
          <TermSheetHub termSheets={data.investment.term_sheets} />
        </>
      )}
    </PortalDashboardScaffold>
  );
}
