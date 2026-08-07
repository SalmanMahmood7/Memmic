"use client";

import { PortalSubPageScaffold } from "@/components/portal/portal-subpage-scaffold";
import { PortalMessages } from "@/components/portal/portal-messages";

export default function MarketplaceMessagesPage() {
  return (
    <PortalSubPageScaffold
      allowedRole="marketplace_client"
      portalLabel="Market Place"
      title="Messages"
      subtitle="Direct line of communication with your marketplace team."
    >
      {() => <PortalMessages />}
    </PortalSubPageScaffold>
  );
}
