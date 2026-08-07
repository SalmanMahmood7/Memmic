"use client";

import { DashboardLayout } from "@/components/Layouts/dashboard-layout";
import { RoleGuard } from "@/components/RouterGuard";
import { useAuth } from "@/context/AuthContext";
import {
  blockClientAccount,
  ClientAccount,
  ClientAccountsStats,
  createClientAccount,
  deleteClientAccount,
  getClientAccountsStats,
  listClientAccounts,
  PortalType,
  unblockClientAccount,
} from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/FormElements/checkbox";
import {
  addClientService,
  listClientMessages,
  listClientServices,
  PortalServiceItem,
  removeClientService,
} from "@/lib/api";

const PORTAL_OPTIONS: { value: PortalType; label: string; color: string }[] = [
  { value: "evaluation", label: "Evaluation", color: "bg-blue-100 text-blue-700" },
  { value: "investment", label: "Investment", color: "bg-purple-100 text-purple-700" },
  { value: "marketplace", label: "Market Place", color: "bg-teal-100 text-teal-700" },
  { value: "management", label: "Management", color: "bg-orange-100 text-orange-700" },
];

const PORTAL_LABELS: Record<string, string> = {
  evaluation: "Evaluation",
  investment: "Investment",
  marketplace: "Market Place",
  management: "Management",
};

function getPortalType(role: string): string {
  return role.replace("_client", "");
}

export default function ClientAccountsPage() {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<ClientAccount[]>([]);
  const [stats, setStats] = useState<ClientAccountsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ portal_type: "", is_active: "", search: "" });

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    full_name: "",
    email: "",
    password: "",
    portal_type: "evaluation" as PortalType,
    send_welcome_email: true,
  });

  // ---- Service management modal ----
  const [servicesClient, setServicesClient] = useState<ClientAccount | null>(null);
  const [clientServices, setClientServices] = useState<PortalServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkMessageId, setLinkMessageId] = useState("");
  const [approvedEnquiries, setApprovedEnquiries] = useState<{ id: string; label: string }[]>([]);

  const openServices = async (acc: ClientAccount) => {
    setServicesClient(acc);
    setLinkMessageId("");
    setServicesLoading(true);
    setApprovedEnquiries([]);
    try {
      setClientServices(await listClientServices(token!, acc.id));
      const enquiries = await listClientMessages(token!, { status: "approved", limit: 200 });
      setApprovedEnquiries(
        enquiries.map(e => ({
          id: e.id,
          label: `${e.full_name} — ${e.email}`,
        }))
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load services");
      setClientServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleRemoveService = async (svc: PortalServiceItem) => {
    if (!servicesClient) return;
    if (!confirm(`Remove "${svc.category_name}" (${PORTAL_LABELS[svc.portal_type] ?? svc.portal_type}) from this client?`)) return;
    try {
      await removeClientService(token!, servicesClient.id, svc.id);
      setClientServices(prev => prev.filter(s => s.id !== svc.id));
      toast.success("Service removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove service");
    }
  };

  const handleLinkService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicesClient || !linkMessageId) return;
    setLinking(true);
    try {
      await addClientService(token!, servicesClient.id, linkMessageId);
      toast.success("Service linked to client");
      setClientServices(await listClientServices(token!, servicesClient.id));
      setLinkMessageId("");
      fetchStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to link service");
    } finally {
      setLinking(false);
    }
  };

  const fetchAccounts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await listClientAccounts(token, {
        portal_type: filters.portal_type || undefined,
        is_active: filters.is_active === "" ? undefined : filters.is_active === "true",
        search: filters.search || undefined,
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
      });
      setAccounts(data);
      setPagination(prev => ({ ...prev, total: data.length + (pagination.page - 1) * pagination.limit }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load client accounts");
    } finally {
      setLoading(false);
    }
  }, [token, filters.portal_type, filters.is_active, filters.search, pagination.page, pagination.limit]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      setStats(await getClientAccountsStats(token));
    } catch {
      // stats are optional
    }
  }, [token]);

  useEffect(() => {
    const t = setTimeout(() => fetchAccounts(), 0);
    return () => clearTimeout(t);
  }, [fetchAccounts]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handlePageChange = (page: number) => setPagination(prev => ({ ...prev, page }));

  const handleToggleActive = async (acc: ClientAccount) => {
    if (!token) return;
    setActionId(acc.id);
    try {
      const updated = acc.is_active ? await blockClientAccount(token, acc.id) : await unblockClientAccount(token, acc.id);
      setAccounts(prev => prev.map(a => (a.id === acc.id ? updated : a)));
      toast.success(updated.is_active ? "Client account unblocked" : "Client account blocked");
      fetchStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update account");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (acc: ClientAccount) => {
    if (!token) return;
    if (!confirm(`Delete the portal account for "${acc.full_name}" (${acc.email})? This cannot be undone.`)) return;
    setActionId(acc.id);
    try {
      await deleteClientAccount(token, acc.id);
      setAccounts(prev => prev.filter(a => a.id !== acc.id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      toast.success("Client account deleted");
      fetchStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setActionId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    try {
      await createClientAccount(token, createForm);
      toast.success("Client portal account created");
      setShowCreate(false);
      setCreateForm({ full_name: "", email: "", password: "", portal_type: "evaluation", send_welcome_email: true });
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchAccounts();
      fetchStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setCreating(false);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  const StatCard = ({ label, value, color }: { label: string; value: number | undefined; color: string }) => (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{stats ? value ?? 0 : "…"}</p>
    </div>
  );

  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <DashboardLayout>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">Client Portal Accounts</h1>
            <p className="text-muted-foreground mt-1">Create and manage portal accounts for evaluation, investment, market place, and management clients</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-3.5 font-medium text-white transition-colors hover:bg-primary/90 sm:w-auto"
          >
            Create Portal Account
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Clients" value={stats?.total} color="text-ink" />
          <StatCard label="Active" value={stats?.active} color="text-green-600" />
          <StatCard label="Blocked" value={stats?.blocked} color="text-red-600" />
          <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground mb-2">By Portal</p>
            <div className="space-y-1">
              {PORTAL_OPTIONS.map(p => (
                <div key={p.value} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{p.label}</span>
                  <span className="font-semibold text-ink">{stats?.by_portal[p.value]?.total ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
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
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Portal</label>
              <select
                value={filters.portal_type}
                onChange={e => {
                  setFilters(prev => ({ ...prev, portal_type: e.target.value }));
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Portals</option>
                {PORTAL_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
              <select
                value={filters.is_active}
                onChange={e => {
                  setFilters(prev => ({ ...prev, is_active: e.target.value }));
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Blocked</option>
              </select>
            </div>
            <button
              onClick={() => {
                setFilters({ portal_type: "", is_active: "", search: "" });
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
            <p className="p-6 text-muted text-sm">Loading client accounts…</p>
          ) : accounts.length === 0 ? (
            <p className="p-6 text-muted text-sm">No client accounts found.</p>
          ) : (
            <>
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="text-center text-base font-medium text-dark dark:text-white">
                    <TableHead className="px-6 py-3 font-semibold">Client</TableHead>
                    <TableHead className="px-6 py-3 font-semibold">Email</TableHead>
                    <TableHead className="px-6 py-3 font-semibold">Portal</TableHead>
                    <TableHead className="px-6 py-3 font-semibold">Status</TableHead>
                    <TableHead className="px-6 py-3 font-semibold">Created</TableHead>
                    <TableHead className="px-6 py-3 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map(acc => (
                    <TableRow key={acc.id} className={`border-b border-line last:border-0 ${!acc.is_active ? "bg-red-50/40 dark:bg-red-900/10" : ""}`}>
                      <TableCell className="px-6 py-3.5 text-ink font-semibold">{acc.full_name}</TableCell>
                      <TableCell className="px-6 py-3.5 text-muted">{acc.email}</TableCell>
                      <TableCell className="px-6 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PORTAL_OPTIONS.find(p => p.value === getPortalType(acc.role))?.color || "bg-gray-100 text-gray-700"}`}>
                          {PORTAL_LABELS[getPortalType(acc.role)] || acc.role}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${acc.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {acc.is_active ? "Active" : "Blocked"}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-3.5 text-muted">
                        {format(new Date(acc.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openServices(acc)}
                            disabled={actionId === acc.id}
                            className="px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
                          >
                            Services
                          </button>
                          <button
                            onClick={() => handleToggleActive(acc)}
                            disabled={actionId === acc.id}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors disabled:opacity-50 ${
                              acc.is_active
                                ? "text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                                : "text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20"
                            }`}
                          >
                            {acc.is_active ? "Block" : "Unblock"}
                          </button>
                          <button
                            onClick={() => handleDelete(acc)}
                            disabled={actionId === acc.id}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} accounts
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

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">Create Portal Account</h2>
                <button onClick={() => setShowCreate(false)} className="p-1 text-muted-foreground hover:text-ink transition-colors">✕</button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Full name</label>
                  <input
                    type="text"
                    required
                    value={createForm.full_name}
                    onChange={e => setCreateForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Email (login)</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={e => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={createForm.password}
                    onChange={e => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Portal</label>
                  <select
                    value={createForm.portal_type}
                    onChange={e => setCreateForm(prev => ({ ...prev, portal_type: e.target.value as PortalType }))}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {PORTAL_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <Checkbox
                    label="Send welcome email with login credentials"
                    checked={createForm.send_welcome_email}
                    onChange={val => setCreateForm(prev => ({ ...prev, send_welcome_email: val }))}
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-gray-100 dark:hover:bg-dark-3 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded transition-colors disabled:opacity-50"
                  >
                    {creating ? "Creating…" : "Create Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manage Services Modal */}
        {servicesClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Manage Services</h2>
                  <p className="text-sm text-muted-foreground">{servicesClient.full_name} • {servicesClient.email}</p>
                </div>
                <button onClick={() => setServicesClient(null)} className="p-1 text-muted-foreground hover:text-ink transition-colors">✕</button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-ink">Linked Services</h3>
                  {servicesLoading ? (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                  ) : clientServices.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No services linked to this client yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {clientServices.map(svc => (
                        <div key={svc.id} className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${PORTAL_OPTIONS.find(p => p.value === svc.portal_type)?.color || "bg-gray-100 text-gray-700"}`}>
                                {PORTAL_LABELS[svc.portal_type] || svc.portal_type}
                              </span>
                              {svc.is_primary && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Primary</span>
                              )}
                            </div>
                            <p className="mt-1 text-sm font-medium text-ink">{svc.category_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Health {svc.health_score ?? "—"} • {svc.status}
                            </p>
                          </div>
                          {!svc.is_primary && (
                            <button
                              onClick={() => handleRemoveService(svc)}
                              className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 rounded transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-5">
                  <h3 className="mb-3 text-sm font-semibold text-ink">Link an approved enquiry</h3>
                  <form onSubmit={handleLinkService} className="flex gap-3">
                    <select
                      value={linkMessageId}
                      onChange={e => setLinkMessageId(e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select an approved enquiry…</option>
                      {approvedEnquiries.map(e => (
                        <option key={e.id} value={e.id}>{e.label}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={linking || !linkMessageId}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded transition-colors disabled:opacity-50"
                    >
                      {linking ? "Linking…" : "Link Service"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}