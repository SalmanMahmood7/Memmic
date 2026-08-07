"use client";

import { DashboardLayout } from "@/components/Layouts/dashboard-layout";
import { RoleGuard } from "@/components/RouterGuard";
import { useAuth } from "@/context/AuthContext";
import {
  approveClientMessage,
  ClientMessageRecord,
  ClientMessagesStats,
  getClientMessagesStats,
  listClientMessages,
  markEnquiryAsRead,
  rejectClientMessage,
} from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-700"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function ClientEnquiriesPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ClientMessageRecord[]>([]);
  const [stats, setStats] = useState<ClientMessagesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selected, setSelected] = useState<ClientMessageRecord | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ status: "" });

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await listClientMessages(token, {
        status: filters.status || undefined,
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
      });
      setMessages(data);
      setPagination(prev => ({ ...prev, total: data.length + (pagination.page - 1) * pagination.limit }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load client enquiries");
    } finally {
      setLoading(false);
    }
  }, [token, filters.status, pagination.page, pagination.limit]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setStatsLoading(true);
    try {
      setStats(await getClientMessagesStats(token));
    } catch {
      // stats are optional enrichment
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const t = setTimeout(() => fetchMessages(), 0);
    return () => clearTimeout(t);
  }, [fetchMessages]);

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      fetchStats();
    })
  }, [fetchStats]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ status: e.target.value });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleView = (m: ClientMessageRecord) => {
    setSelected(m);
    setRejectReason("");
    setShowDetail(true);
    if (!m.is_read && token) {
      markEnquiryAsRead(token, m.id).then(() => {
        setMessages(prev => prev.map(x => (x.id === m.id ? { ...x, is_read: true } : x)));
      }).catch(() => {});
    }
  };

  const handleMarkAsRead = async (m: ClientMessageRecord) => {
    if (!token || m.is_read) return;
    try {
      await markEnquiryAsRead(token, m.id);
      setMessages(prev => prev.map(x => (x.id === m.id ? { ...x, is_read: true } : x)));
      toast.success("Enquiry marked as read.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark enquiry as read");
    }
  };

  const handleApprove = async (sendCredentials: boolean) => {
    if (!token || !selected) return;
    setActionLoading(true);
    try {
      const updated = await approveClientMessage(token, selected.id, sendCredentials);
      setSelected(updated);
      setMessages(prev => prev.map(m => (m.id === updated.id ? updated : m)));
      toast.success(updated.generated_email ? "Enquiry approved. Credentials generated." : "Enquiry approved.");
      fetchStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve enquiry");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!token || !selected) return;
    if (rejectReason.trim().length < 5) {
      toast.error("Please provide a rejection reason (at least 5 characters).");
      return;
    }
    setActionLoading(true);
    try {
      const updated = await rejectClientMessage(token, selected.id, rejectReason.trim());
      setSelected(updated);
      setMessages(prev => prev.map(m => (m.id === updated.id ? updated : m)));
      toast.success("Enquiry rejected.");
      fetchStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject enquiry");
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  const StatCard = ({ label, value, color }: { label: string; value: number | undefined; color: string }) => (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{statsLoading ? "…" : value ?? 0}</p>
    </div>
  );

  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">Client Enquiries</h1>
          <p className="text-muted-foreground mt-1">Review, approve, and issue credentials for client enquiries</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Enquiries" value={stats?.total} color="text-ink" />
          <StatCard label="Pending Review" value={stats?.pending} color="text-yellow-600" />
          <StatCard label="Approved" value={stats?.approved} color="text-green-600" />
          <StatCard label="Rejected" value={stats?.rejected} color="text-red-600" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-border p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="w-56">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
              <select
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button
              onClick={() => {
                setFilters({ status: "" });
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-ink transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          {loading ? (
            <p className="p-6 text-muted text-sm">Loading enquiries…</p>
          ) : messages.length === 0 ? (
            <p className="p-6 text-muted text-sm">No client enquiries found.</p>
          ) : (
            <>
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="text-center text-base font-medium text-dark dark:text-white">
                    <TableHead className="px-6 py-3 font-semibold">Name</TableHead>
                    <TableHead className="px-6 py-3 font-semibold">Email</TableHead>
                    <TableHead className="px-6 py-3 font-semibold">Brief</TableHead>
                    <TableHead className="px-6 py-3 font-semibold">Status</TableHead>
                    <TableHead className="px-6 py-3 font-semibold">Date</TableHead>
                    <TableHead className="px-6 py-3 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map(m => (
                    <TableRow key={m.id} className={`border-b border-line last:border-0 ${(m.status === "pending" || !m.is_read) ? "bg-blue-50/50 dark:bg-blue-900/20" : ""}`}>
                      <TableCell className="px-6 py-3.5 text-ink font-semibold">{m.full_name}</TableCell>
                      <TableCell className="px-6 py-3.5 text-muted">{m.email}</TableCell>
                      <TableCell className="px-6 py-3.5 text-muted max-w-xs truncate">{m.brief}</TableCell>
                      <TableCell className="px-6 py-3.5"><StatusBadge status={m.status} /></TableCell>
                      <TableCell className="px-6 py-3.5 text-muted">
                        {format(new Date(m.created_at), "MMM d, yyyy h:mm a")}
                      </TableCell>
                      <TableCell className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(m)}
                            className="px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded transition-colors"
                          >
                            Review
                          </button>
                          {!m.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(m)}
                              className="px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} enquiries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1.5 text-sm border border-border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 text-sm text-muted-foreground">
                    Page {pagination.page} of {Math.max(totalPages, 1)}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= totalPages}
                    className="px-3 py-1.5 text-sm border border-border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detail / Review Modal */}
        {showDetail && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">Review Enquiry</h2>
                <button onClick={() => setShowDetail(false)} className="p-1 text-muted-foreground hover:text-ink transition-colors">✕</button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="grid gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Applicant</label>
                    <p className="text-ink mt-1">{selected.full_name} · {selected.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <div className="mt-1"><StatusBadge status={selected.status} /></div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Submitted</label>
                    <p className="text-ink mt-1">{format(new Date(selected.created_at), "MMM d, yyyy h:mm a")}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Brief</label>
                    <div className="mt-1 p-4 bg-gray-50 dark:bg-dark-3 rounded-lg border border-border dark:border-dark-3">
                      <p className="text-ink whitespace-pre-wrap">{selected.brief}</p>
                    </div>
                  </div>

                  {selected.generated_email && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900">
                      <label className="text-xs font-medium text-green-700 dark:text-green-400">Generated Credentials</label>
                      <p className="text-ink mt-1 text-sm">Email: <span className="font-mono">{selected.generated_email}</span></p>
                      <p className="text-ink mt-1 text-sm">Password: <span className="font-mono">{selected.generated_password}</span></p>
                      {selected.client_account_email && (
                        <p className="text-ink mt-1 text-sm">
                          Portal account: <span className="font-mono">{selected.client_account_email}</span>{" "}
                          <span className="text-xs text-green-600 dark:text-green-400">(active)</span>
                        </p>
                      )}
                      {selected.credentials_sent_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Credentials issued {format(new Date(selected.credentials_sent_at), "MMM d, yyyy h:mm a")}
                        </p>
                      )}
                    </div>
                  )}

                  {selected.rejection_reason && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900">
                      <label className="text-xs font-medium text-red-700 dark:text-red-400">Rejection Reason</label>
                      <p className="text-ink mt-1">{selected.rejection_reason}</p>
                    </div>
                  )}

                  {selected.status === "pending" && (
                    <div className="mt-2">
                      <label className="text-sm font-medium text-ink">Reject reason (only if rejecting)</label>
                      <textarea
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        rows={3}
                        placeholder="Enter a reason for rejection…"
                        className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 flex-wrap">
                <button
                  onClick={() => setShowDetail(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-gray-100 dark:hover:bg-dark-3 rounded transition-colors"
                >
                  Close
                </button>
                {selected.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleReject()}
                      disabled={actionLoading}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? "Rejecting…" : "Reject"}
                    </button>
                    <button
                      onClick={() => handleApprove(false)}
                      disabled={actionLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
                    >
                      Approve (no credentials)
                    </button>
                    <button
                      onClick={() => handleApprove(true)}
                      disabled={actionLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? "Approving…" : "Approve & Generate Credentials"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}