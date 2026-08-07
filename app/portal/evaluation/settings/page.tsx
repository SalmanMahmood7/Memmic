"use client";

import { PortalSubPageScaffold } from "@/components/portal/portal-subpage-scaffold";
import { PortalSettings } from "@/components/portal/portal-settings";

export default function EvaluationSettingsPage() {
  return (
    <PortalSubPageScaffold
      allowedRole="evaluation_client"
      portalLabel="Evaluation"
      title="Settings"
      subtitle="Manage your portal profile and security settings."
    >
      {() => <PortalSettings />}
    </PortalSubPageScaffold>
  );
}
