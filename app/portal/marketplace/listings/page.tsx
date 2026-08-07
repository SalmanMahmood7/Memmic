"use client";

import { PortalSubPageScaffold } from "@/components/portal/portal-subpage-scaffold";
import { AssetListings } from "@/components/portal/marketplace/asset-listings";
import { usePortalDashboard } from "@/components/portal/use-portal-dashboard";
import { LoadingCard, ErrorCard } from "@/components/portal/portal-feedback";

export default function MarketplaceListingsPage() {
  const { data, loading, error, refresh } = usePortalDashboard();

  return (
    <PortalSubPageScaffold
      allowedRole="marketplace_client"
      portalLabel="Market Place"
      title="Listings"
      subtitle="Your financial products and portfolios live on the marketplace."
    >
      {() => {
        if (loading) return <LoadingCard label="Loading your listings…" />;
        if (error) return <ErrorCard message={error} onRetry={refresh} />;
        if (!data) return null;

        return <AssetListings listings={data.marketplace.listings} />;
      }}
    </PortalSubPageScaffold>
  );
}
