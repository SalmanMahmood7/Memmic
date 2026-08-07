"use client";

import { PortalSubPageScaffold } from "@/components/portal/portal-subpage-scaffold";
import { PortalMessages } from "@/components/portal/portal-messages";

export default function ManagementMessagesPage() {
  return (
    <PortalSubPageScaffold
      allowedRole="management_client"
      portalLabel="Management"
      title="Messages"
      subtitle="Direct line of communication with your management consultants."
    >
      {() => <PortalMessages />}
    </PortalSubPageScaffold>
  );
}
