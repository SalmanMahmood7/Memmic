"use client";

import { DashboardLayout } from "@/components/Layouts/dashboard-layout";
import { RoleGuard } from "@/components/RouterGuard";
import { useAuth } from "@/context/AuthContext";
import { AdminPortalDashboardItem, listAdminPortalDashboards } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PORTAL_LABELS: Record<string, string> = {
  evaluation: "Evaluation",
  investment: "Investment",
  marketplace: "Market Place",
  management: "Management",
};

const PORTAL_COLORS: Record<string, string> = {
  evaluation: "bg-blue-100 text-blue-700",
  investment: "bg-purple-100 text-purple-700",
  marketplace: "bg-teal-100 text-teal-700",
  management: "bg-orange-100 text-orange-700",
};

function healthColor(score: number) {
  if (score >= 75) return "text-green-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

export default function AdminPortalDashboardsPage() {
  const { token } = useAuth();
  const [dashboards, setDashboards] = useState<AdminPortalDashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ portal_type: "", search: "" });

  const fetchDashboards = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await listAdminPortalDashboards(token, {
        portal_type: filters.portal_type || undefined,
        search: filters.search || undefined,
      });
      setDashboards(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load portal dashboards");
    } finally {
      setLoading(false);
    }
  }, [token, filters.portal_type, filters.search]);

  useEffect(() => {
    const t = setTimeout(() => fetchDashboards(), 0);
    return () => clearTimeout(t);
  }, [fetchDashboards]);

  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">Client Portal Dashboards</h1>
          <p className="text-muted-foreground mt-1">
            View and manage each client&apos;s portal dashboard — health score, timeline, alerts, actions, and messaging — synchronized with the client portal.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-border p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name or email…"
                value={filters.search}
                onChange={e => {
                  setFilters(prev => ({ ...prev, search: e.target.value }));
                }}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Portal</label>
              <select
                value={filters.portal_type}
                onChange={e => setFilters(prev => ({ ...prev, portal_type: e.target.value }))}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Portals</option>
                {Object.entries(PORTAL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setFilters({ portal_type: "", search: "" })}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-ink transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          {loading ? (
            <p className="p-6 text-muted text-sm">Loading dashboards…</p>
          ) : dashboards.length === 0 ? (
            <p className="p-6 text-muted text-sm">No client dashboards found.</p>
          ) : (
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow className="text-center text-base font-medium text-dark dark:text-white">
                  <TableHead className="px-6 py-3 font-semibold">Client</TableHead>
                  <TableHead className="px-6 py-3 font-semibold">Email</TableHead>
                  <TableHead className="px-6 py-3 font-semibold">Portal</TableHead>
                  <TableHead className="px-6 py-3 font-semibold">Health</TableHead>
                  <TableHead className="px-6 py-3 font-semibold">Last Updated</TableHead>
                  <TableHead className="px-6 py-3 font-semibold">Status</TableHead>
                  <TableHead className="px-6 py-3 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboards.map(d => (
                  <TableRow key={d.client_id} className="border-b border-line last:border-0">
                    <TableCell className="px-6 py-3.5 text-ink font-semibold">{d.full_name}</TableCell>
                    <TableCell className="px-6 py-3.5 text-muted">{d.email}</TableCell>
                    <TableCell className="px-6 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PORTAL_COLORS[d.portal_type] || "bg-gray-100 text-gray-700"}`}>
                        {PORTAL_LABELS[d.portal_type] || d.portal_type}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-3.5">
                      <span className={`text-lg font-bold ${healthColor(d.health_score)}`}>{d.health_score}</span>
                      <span className="text-xs text-muted-foreground"> / 100</span>
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-muted">
                      {d.updated_at ? format(new Date(d.updated_at), "MMM d, yyyy h:mm a") : "—"}
                    </TableCell>
                    <TableCell className="px-6 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${d.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {d.is_active ? "Active" : "Blocked"}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-3.5">
                      <Link
                        href={`/admin/portal-dashboards/${d.client_id}`}
                        className="inline-block px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded transition-colors"
                      >
                        Manage
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
