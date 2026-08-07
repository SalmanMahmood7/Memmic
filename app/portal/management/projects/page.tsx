"use client";

import { PortalSubPageScaffold } from "@/components/portal/portal-subpage-scaffold";
import { AdvisoryNotes } from "@/components/portal/management/advisory-notes";
import { ActionBoard } from "@/components/portal/management/action-board";
import { usePortalDashboard } from "@/components/portal/use-portal-dashboard";
import { LoadingCard, ErrorCard } from "@/components/portal/portal-feedback";

export default function ManagementProjectsPage() {
  const { data, loading, error, refresh } = usePortalDashboard();

  return (
    <PortalSubPageScaffold
      allowedRole="management_client"
      portalLabel="Management"
      title="Projects"
      subtitle="Advisory recommendations and project-level task delegation."
    >
      {() => {
        if (loading) return <LoadingCard label="Loading projects…" />;
        if (error) return <ErrorCard message={error} onRetry={refresh} />;
        if (!data) return null;

        return (
          <div className="space-y-6">
            <AdvisoryNotes notes={data.management.advisory_notes} />
            <ActionBoard actions={data.actions} onMove={() => {}} />
          </div>
        );
      }}
    </PortalSubPageScaffold>
  );
}
