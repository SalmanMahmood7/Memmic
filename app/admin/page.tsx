"use client"
import Link from "next/link";
import { DashboardLayout } from "@/components/Layouts/dashboard-layout";
import { ExportButton } from "@/components/ExportButton";
import { PortalChart } from "@/components/portal/portal-chart";
import { useAuth } from "@/context/AuthContext";
import { ApiError, getUserProfile, getAdminDashboardOverview, AdminDashboardOverview, UserMe } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { RoleGuard } from "@/components/RouterGuard";
import { Users, FileText, Clock, ShieldCheck, RefreshCw, AlertTriangle } from "lucide-react";

const PORTAL_LABELS: Record<string, string> = {
  evaluation: "Evaluation",
  investment: "Investment",
  marketplace: "Market Place",
  management: "Management",
};

const PORTAL_COLORS = ["#0ea5e9", "#8b5cf6", "#14b8a6", "#f97316"];

export default function AdminDashboard() {
  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <AdminContent />
    </RoleGuard>
  );
}

function AdminContent() {
  const { token, isLoading } = useAuth()
  const [profile, setProfile] = useState<UserMe | null>(null);
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      setOverview(await getAdminDashboardOverview(token));
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load dashboard analytics.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isLoading || !token) return;

    getUserProfile(token)
      .then(setProfile)
      .catch((err) => {
        console.error('Profile fetch failed:', err);
        setError(err instanceof ApiError ? err.message : 'Could not load your profile.');
      });


    const timeOutId = setTimeout(() => {
      fetchOverview();
    })
  }, [token, isLoading, fetchOverview]);

  const enquiryStatusData = overview ? {
    pending: overview.enquiries.pending,
    approved: overview.enquiries.approved,
    rejected: overview.enquiries.rejected,
  } : { pending: 0, approved: 0, rejected: 0 };

  const enquirySeries = [
    enquiryStatusData.pending,
    enquiryStatusData.approved,
    enquiryStatusData.rejected,
  ];

  const portalHealthData = overview
    ? ["evaluation", "investment", "marketplace", "management"].map((p) => overview.by_portal[p]?.avg_health ?? 0)
    : [0, 0, 0, 0];

  const portalClientsData = overview
    ? ["evaluation", "investment", "marketplace", "management"].map((p) => overview.by_portal[p]?.services ?? 0)
    : [0, 0, 0, 0];

  const StatCard = ({ label, value, hint, icon: Icon }: { label: string; value: number | string; hint?: string; icon: any }) => (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className="size-5 text-primary" />
      </div>
      <h3 className="mt-2 text-3xl font-bold text-ink">{value}</h3>
      {hint && <span className="mt-2 inline-flex items-center text-xs font-semibold text-muted-foreground">{hint}</span>}
    </div>
  );

  return (
    <DashboardLayout>
      {/* Header Banner */}
      <div className="mb-8 rounded-2xl bg-ink p-6 sm:p-8 text-ink-foreground shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary mb-3">
            ADMINISTRATION CONTROL
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{profile?.full_name}</h1>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-ink-foreground/70 mt-1">
            Live portal analytics — client accounts, enquiries, service health, and recent activity.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchOverview}
            className="rounded bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 flex items-center gap-1.5"
          >
            <RefreshCw className="size-3.5" /> Refresh
          </button>
          <ExportButton />
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <span className="inline-flex items-center gap-2"><AlertTriangle className="size-4" /> {error}</span>
          <button onClick={fetchOverview} className="font-semibold underline">Retry</button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Clients" value={loading ? "…" : overview?.clients.total ?? 0} hint={`${overview?.clients.active ?? 0} active • ${overview?.clients.blocked ?? 0} blocked`} icon={Users} />
        <StatCard label="Total Enquiries" value={loading ? "…" : overview?.enquiries.total ?? 0} hint={`${overview?.enquiries.pending ?? 0} pending review`} icon={FileText} />
        <StatCard label="Pending Approvals" value={loading ? "…" : overview?.enquiries.pending ?? 0} hint="Requires action" icon={Clock} />
        <StatCard label="Services Linked" value={loading ? "…" : Object.values(overview?.by_portal ?? {}).reduce((acc, p) => acc + p.services, 0)} hint="Across all portals" icon={ShieldCheck} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Enquiries by Status</h2>
          <p className="text-xs text-muted-foreground mb-2">Live distribution of client enquiry approvals</p>
          <PortalChart
            type="donut"
            series={enquirySeries}
            height={280}
            options={{
              labels: ["Pending", "Approved", "Rejected"],
              colors: ["#f59e0b", "#10b981", "#ef4444"],
              legend: { position: "bottom" },
              dataLabels: { enabled: false },
              plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, label: "Total", fontSize: "14px" } } } } },
            }}
          />
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Services per Portal</h2>
          <p className="text-xs text-muted-foreground mb-2">Linked client services by portal</p>
          <PortalChart
            type="bar"
            series={[{ name: "Services", data: portalClientsData }]}
            height={280}
            options={{
              chart: { toolbar: { show: false } },
              colors: PORTAL_COLORS,
              plotOptions: { bar: { distributed: true, borderRadius: 4 } },
              xaxis: { categories: ["Evaluation", "Investment", "Marketplace", "Management"] },
              dataLabels: { enabled: false },
            }}
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Portal health + clients */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Portal Health Snapshot</h2>
          <p className="text-xs text-muted-foreground mb-4">Average health score per portal</p>
          <div className="space-y-4">
            {["evaluation", "investment", "marketplace", "management"].map((p, idx) => (
              <div key={p}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-ink">{PORTAL_LABELS[p]}</span>
                  <span className="text-muted-foreground">
                    {overview?.by_portal[p]?.clients ?? 0} clients • {overview?.by_portal[p]?.services ?? 0} services
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-2.5 rounded-full"
                    style={{ width: `${Math.min((overview?.by_portal[p]?.avg_health ?? 0), 100)}%`, backgroundColor: PORTAL_COLORS[idx] }}
                  />
                </div>
                <p className="mt-1 text-xs font-semibold text-ink">Health {overview?.by_portal[p]?.avg_health ?? 0}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-ink">Recent Activity</h2>
            <Link href="/admin/client-messages" className="text-xs font-semibold text-primary hover:underline">
              View Enquiries
            </Link>
          </div>
          <div className="space-y-4">
            {(overview?.activity ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            )}
            {(overview?.activity ?? []).slice(0, 6).map((act, i) => (
              <div key={i} className="flex items-start justify-between border-b border-border/60 pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium text-ink">{act.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{act.detail}</p>
                  {act.created_at && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{new Date(act.created_at).toLocaleString()}</p>
                  )}
                </div>
                <span className={`rounded px-2 py-1 text-xs font-semibold capitalize ${
                  act.type === "enquiry" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
                  : act.type === "portal_message" ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800"
                }`}>
                  {act.type === "enquiry" ? act.status : act.type === "portal_message" ? "message" : act.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
