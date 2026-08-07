"use client";

import { PortalSubPageScaffold } from "@/components/portal/portal-subpage-scaffold";
import { PortalMessages } from "@/components/portal/portal-messages";

export default function EvaluationMessagesPage() {
  return (
    <PortalSubPageScaffold
      allowedRole="evaluation_client"
      portalLabel="Evaluation"
      title="Messages"
      subtitle="Direct line of communication with your evaluation team."
    >
      {() => <PortalMessages />}
    </PortalSubPageScaffold>
  );
}
