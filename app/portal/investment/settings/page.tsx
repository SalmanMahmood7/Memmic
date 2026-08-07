"use client";

import { PortalSubPageScaffold } from "@/components/portal/portal-subpage-scaffold";
import { PortalSettings } from "@/components/portal/portal-settings";

export default function InvestmentSettingsPage() {
  return (
    <PortalSubPageScaffold
      allowedRole="investment_client"
      portalLabel="Investment"
      title="Settings"
      subtitle="Manage your portal profile and security settings."
    >
      {() => <PortalSettings />}
    </PortalSubPageScaffold>
  );
}
