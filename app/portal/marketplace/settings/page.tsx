"use client";

import { PortalSubPageScaffold } from "@/components/portal/portal-subpage-scaffold";
import { PortalSettings } from "@/components/portal/portal-settings";

export default function MarketplaceSettingsPage() {
  return (
    <PortalSubPageScaffold
      allowedRole="marketplace_client"
      portalLabel="Market Place"
      title="Settings"
      subtitle="Manage your portal profile and security settings."
    >
      {() => <PortalSettings />}
    </PortalSubPageScaffold>
  );
}
