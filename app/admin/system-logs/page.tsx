"use client"

import { DashboardLayout } from "@/components/Layouts/dashboard-layout";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ExportButton } from "@/components/ExportButton";
import Link from "next/link";

interface SystemLog {
  id: string;
  level: string;
  message: string;
  source: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  log_metadata: string | null;
  created_at: string;
}

interface SystemLogStats {
  total: number;
  by_level: {
    ERROR: number;
    WARNING: number;
    INFO: number;
  };
  by_source: Record<string, number>;
}

export default function SystemLogsPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [stats, setStats] = useState<SystemLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ level: "", source: "" });
  const [pagination, setPagination] = useState({ offset: 0, limit: 50 });
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = async () => {
    if (!token) return;
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });
      if (filters.level) params.append("level", filters.level);
      if (filters.source) params.append("source", filters.source);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/admin/system-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/admin/system-logs/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
      setTotalCount(data.total);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  useEffect(() => {
    // fetchLogs();
    const timeoutId = setTimeout(() => fetchLogs(), 0);
    // fetchStats();
    const timeoutId2 = setTimeout(() => fetchStats(), 0)
  }, [token, filters, pagination.offset]);

  const getLevelBadge = (level: string) => {
    const styles: Record<string, string> = {
      ERROR: "bg-red-100 text-red-700",
      WARNING: "bg-yellow-100 text-yellow-700",
      INFO: "bg-blue-100 text-blue-700",
      DEBUG: "bg-gray-100 text-gray-700"
    };
    return styles[level] || "bg-gray-100 text-gray-700";
  };

  const getSourceBadge = (source: string) => {
    return "bg-primary/10 text-primary";
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">System Logs</h1>
        <p className="text-muted-foreground mt-1">Monitor and analyze system activity and errors</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Total Logs</p>
            <h3 className="mt-2 text-3xl font-bold text-ink">{stats.total.toLocaleString()}</h3>
          </div>
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Errors</p>
            <h3 className="mt-2 text-3xl font-bold text-red-600">{stats.by_level.ERROR}</h3>
          </div>
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Warnings</p>
            <h3 className="mt-2 text-3xl font-bold text-yellow-600">{stats.by_level.WARNING}</h3>
          </div>
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Info</p>
            <h3 className="mt-2 text-3xl font-bold text-blue-600">{stats.by_level.INFO}</h3>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Level</label>
            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Levels</option>
              <option value="ERROR">Error</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
              <option value="DEBUG">Debug</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Source</label>
            <select
              value={filters.source}
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Sources</option>
              {stats && Object.keys(stats.by_source).map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFilters({ level: "", source: "" });
                setPagination(prev => ({ ...prev, offset: 0 }));
              }}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-ink transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No logs found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50 text-left text-muted-foreground">
                    <th className="px-6 py-3 font-semibold w-24">Level</th>
                    <th className="px-6 py-3 font-semibold">Message</th>
                    <th className="px-6 py-3 font-semibold w-32">Source</th>
                    <th className="px-6 py-3 font-semibold w-40">User</th>
                    <th className="px-6 py-3 font-semibold w-40">IP Address</th>
                    <th className="px-6 py-3 font-semibold w-48">Time</th>
                    <th className="px-6 py-3 font-semibold w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-gray-50">
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getLevelBadge(log.level)}`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-ink max-w-md truncate" title={log.message}>
                        {log.message}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                          {log.source}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-muted text-sm">
                        {log.user_id ? log.user_id.substring(0, 8) + "..." : "System"}
                      </td>
                      <td className="px-6 py-3.5 text-muted text-sm font-mono">
                        {log.ip_address || "N/A"}
                      </td>
                      <td className="px-6 py-3.5 text-muted text-sm">
                        {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                      </td>
                      <td className="px-6 py-3.5">
                        <button
                          onClick={() => {
                            try {
                              const metadata = log.log_metadata ? JSON.parse(log.log_metadata) : {};
                              alert(JSON.stringify(metadata, null, 2));
                            } catch {
                              alert("No metadata available");
                            }
                          }}
                          className="text-primary hover:underline text-sm"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, totalCount)} of {totalCount} logs
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                  disabled={pagination.offset === 0}
                  className="px-3 py-1.5 text-sm border border-border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                  disabled={pagination.offset + pagination.limit >= totalCount}
                  className="px-3 py-1.5 text-sm border border-border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}