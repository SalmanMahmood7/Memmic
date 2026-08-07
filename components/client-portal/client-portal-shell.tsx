"use client";

import { DashboardLayout } from "@/components/Layouts/dashboard-layout";
import { RoleGuard } from "@/components/RouterGuard";
import { useAuth } from "@/context/AuthContext";
import { getClientPortalProfile, PortalProfile } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";

const PORTAL_ROLES = ["evaluation_client", "investment_client", "marketplace_client", "management_client"];

export function ClientPortalShell({
  allowedRole,
  portalLabel,
  tagline,
  children,
}: {
  allowedRole: string;
  portalLabel: string;
  tagline: string;
  children: (profile: PortalProfile | null) => React.ReactNode;
}) {
  const { token } = useAuth();
  const [profile, setProfile] = useState<PortalProfile | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      setProfile(await getClientPortalProfile(token));
    } catch {
      // profile fetch is best-effort
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <RoleGuard allowedRoles={PORTAL_ROLES}>
      <DashboardLayout>
        <div className="mb-8 rounded-2xl bg-ink p-6 sm:p-8 text-ink-foreground shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary mb-3">
              {portalLabel.toUpperCase()} PORTAL
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{portalLabel} Dashboard</h1>
            <p className="text-sm text-ink-foreground/70 mt-1">{tagline}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {profile?.enquiry && (
              <div className="rounded-lg bg-white/10 px-4 py-2 text-sm">
                <span className="text-ink-foreground/60 mr-2">Enquiry status:</span>
                <span className={`font-semibold capitalize ${profile.enquiry.status === "approved" ? "text-green-400" : profile.enquiry.status === "rejected" ? "text-red-400" : "text-yellow-400"}`}>
                  {profile.enquiry.status}
                </span>
              </div>
            )}
          </div>
        </div>
        {children(profile)}
      </DashboardLayout>
    </RoleGuard>
  );
}

export function PortalMetaRow({ profile }: { profile: PortalProfile | null }) {
  if (!profile?.enquiry) {
    return (
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">
          No enquiry linked to this account yet. Contact MEMMIC support if you expected to see enquiry details.
        </p>
      </div>
    );
  }

  const e = profile.enquiry;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Applicant</p>
        <p className="mt-2 text-lg font-bold text-ink">{e.full_name}</p>
        <p className="text-sm text-muted">{e.email}</p>
      </div>
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Category</p>
        <p className="mt-2 text-lg font-bold text-ink">{e.category_name}</p>
        <p className="text-sm text-muted capitalize">{e.form_type}</p>
      </div>
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Submitted</p>
        <p className="mt-2 text-lg font-bold text-ink">{format(new Date(e.created_at), "MMM d, yyyy")}</p>
        <p className="text-sm text-muted">{format(new Date(e.created_at), "h:mm a")}</p>
      </div>
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Approval Status</p>
        <p className={`mt-2 text-lg font-bold capitalize ${e.status === "approved" ? "text-green-600" : e.status === "rejected" ? "text-red-600" : "text-yellow-600"}`}>
          {e.status}
        </p>
        {e.generated_email && <p className="text-sm text-muted truncate">{e.generated_email}</p>}
      </div>
    </div>
  );
}