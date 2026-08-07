"use client";

import { DashboardLayout } from "@/components/Layouts/dashboard-layout";
import { RoleGuard } from "@/components/RouterGuard";
import { useAuth } from "@/context/AuthContext";
import { getClientPortalProfile, PortalProfile } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

const PORTAL_ROLES = ["evaluation_client", "investment_client", "marketplace_client", "management_client"];

export function PortalSubPageScaffold({
  allowedRole,
  portalLabel,
  title,
  subtitle,
  children,
}: {
  allowedRole: string;
  portalLabel: string;
  title: string;
  subtitle: string;
  children: (profile: PortalProfile | null) => React.ReactNode;
}) {
  const { token } = useAuth();
  const [profile, setProfile] = useState<PortalProfile | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      setProfile(await getClientPortalProfile(token));
    } catch {
      // best-effort
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <RoleGuard allowedRoles={PORTAL_ROLES}>
      <DashboardLayout>
        <div className="mb-8 rounded-2xl bg-ink p-6 sm:p-8 text-ink-foreground shadow-lg">
          <div className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary mb-3">
            {portalLabel.toUpperCase()} PORTAL
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
          <p className="text-sm text-ink-foreground/70 mt-1">{subtitle}</p>
        </div>
        {children(profile)}
      </DashboardLayout>
    </RoleGuard>
  );
}
