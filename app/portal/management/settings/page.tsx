"use client";

import { PortalSubPageScaffold } from "@/components/portal/portal-subpage-scaffold";
import { PortalSettings } from "@/components/portal/portal-settings";

export default function ManagementSettingsPage() {
  return (
    <PortalSubPageScaffold
      allowedRole="management_client"
      portalLabel="Management"
      title="Settings"
      subtitle="Manage your portal profile and security settings."
    >
      {() => <PortalSettings />}
    </PortalSubPageScaffold>
  );
}
