"use client";

import { PortalSubPageScaffold } from "@/components/portal/portal-subpage-scaffold";
import { PortalMessages } from "@/components/portal/portal-messages";

export default function InvestmentMessagesPage() {
  return (
    <PortalSubPageScaffold
      allowedRole="investment_client"
      portalLabel="Investment"
      title="Messages"
      subtitle="Direct line of communication with your investment team."
    >
      {() => <PortalMessages />}
    </PortalSubPageScaffold>
  );
}
