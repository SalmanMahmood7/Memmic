"use client";

import { PortalDashboardScaffold } from "@/components/portal/portal-dashboard-scaffold";
import { AssetListings } from "@/components/portal/marketplace/asset-listings";
import { BuyerTrafficChart } from "@/components/portal/marketplace/buyer-traffic";
import { DealPipeline } from "@/components/portal/marketplace/deal-pipeline";

export default function MarketplacePortalPage() {
  return (
    <PortalDashboardScaffold
      allowedRole="marketplace_client"
      portalLabel="Market Place"
      portalType="marketplace"
      tagline="A transactional ecosystem to buy, sell, or trade financial assets and services — securitization, B2B matching, and equity trading."
    >
      {data => (
        <>
          <h2 className="text-xl font-semibold text-ink">Marketplace Performance</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <BuyerTrafficChart traffic={data.marketplace.traffic} />
            <DealPipeline pipeline={data.marketplace.pipeline} />
          </div>
          <AssetListings listings={data.marketplace.listings} />
        </>
      )}
    </PortalDashboardScaffold>
  );
}
