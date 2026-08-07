"use client";

import { PortalSubPageScaffold } from "@/components/portal/portal-subpage-scaffold";
import { BuyerTrafficChart } from "@/components/portal/marketplace/buyer-traffic";
import { DealPipeline } from "@/components/portal/marketplace/deal-pipeline";
import { usePortalDashboard } from "@/components/portal/use-portal-dashboard";
import { LoadingCard, ErrorCard } from "@/components/portal/portal-feedback";

export default function MarketplaceMarketPage() {
  const { data, loading, error, refresh } = usePortalDashboard();

  return (
    <PortalSubPageScaffold
      allowedRole="marketplace_client"
      portalLabel="Market Place"
      title="Marketplace"
      subtitle="Buyer activity and deal flow across the MEMMIC ecosystem."
    >
      {() => {
        if (loading) return <LoadingCard label="Loading the marketplace…" />;
        if (error) return <ErrorCard message={error} onRetry={refresh} />;
        if (!data) return null;

        return (
          <div className="grid gap-6 lg:grid-cols-2">
            <BuyerTrafficChart traffic={data.marketplace.traffic} />
            <DealPipeline pipeline={data.marketplace.pipeline} />
          </div>
        );
      }}
    </PortalSubPageScaffold>
  );
}
