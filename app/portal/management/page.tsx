"use client";

import { PortalDashboardScaffold } from "@/components/portal/portal-dashboard-scaffold";
import { KpiTrackers } from "@/components/portal/management/kpi-trackers";
import { ActionBoard } from "@/components/portal/management/action-board";
import { AdvisoryNotes } from "@/components/portal/management/advisory-notes";

export default function ManagementPortalPage() {
  return (
    <PortalDashboardScaffold
      allowedRole="management_client"
      portalLabel="Management"
      portalType="management"
      tagline="Fix operational gaps discovered in evaluation — software overhaul, cost optimization, and executive advisory."
    >
      {data => (
        <>
          <h2 className="text-xl font-semibold text-ink">Management Workspace</h2>
          <KpiTrackers kpis={data.management.kpis} />
          <AdvisoryNotes notes={data.management.advisory_notes} />
          <ActionBoard actions={data.actions} onMove={() => {}} />
        </>
      )}
    </PortalDashboardScaffold>
  );
}
