"use client";

import { DashboardLayout } from "@/components/Layouts/dashboard-layout";
import { RoleGuard } from "@/components/RouterGuard";
import { useAuth } from "@/context/AuthContext";
import {
  AdminPortalDashboardDetail,
  createAdminAction,
  createAdminAlert,
  deleteAdminAction,
  deleteAdminAlert,
  getAdminPortalDashboard,
  listClientServices,
  PortalActionItem,
  PortalAlertItem,
  PortalServiceItem,
  PortalStageItem,
  sendAdminPortalMessage,
  updateAdminAction,
  updateAdminAlert,
  updateAdminDashboardHealth,
  updateAdminTimeline,
  seedAdminPortalDashboard,
} from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  MessageSquarePlus,
  RefreshCw,
  Send,
  Building2,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const COLUMN_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const COLUMN_ORDER = ["todo", "in_progress", "review", "done"];

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-blue-100 text-blue-700",
};

const STAGE_STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  pending: "Pending",
};

const inputCls =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function AdminPortalDashboardDetailPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [detail, setDetail] = useState<AdminPortalDashboardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingHealth, setSavingHealth] = useState(false);
  const [healthScore, setHealthScore] = useState(0);
  const [healthComponents, setHealthComponents] = useState<Record<string, number>>({});
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [services, setServices] = useState<PortalServiceItem[]>([]);

  // Timeline editor
  type StageForm = { key: string; label: string; status: string; date: string };
  type AlertForm = { severity: string; title: string; message: string };
  type ActionForm = { title: string; assignee: string; column: string; priority: string; due_date: string };
  const [timelineEditing, setTimelineEditing] = useState<StageForm | null>(null);
  const [timelineAdding, setTimelineAdding] = useState<StageForm | null>(null);

  // Alert editor
  const [alertEditing, setAlertEditing] = useState<AlertForm & { id: string } | null>(null);
  const [alertAdding, setAlertAdding] = useState<AlertForm | null>(null);

  // Action editor
  const [actionEditing, setActionEditing] = useState<ActionForm & { id: string } | null>(null);
  const [actionAdding, setActionAdding] = useState<ActionForm | null>(null);

  const patchTimelineAdding = (patch: Partial<StageForm>) =>
    setTimelineAdding(p => (p ? { ...p, ...patch } : p));
  const patchTimelineEditing = (patch: Partial<StageForm>) =>
    setTimelineEditing(p => (p ? { ...p, ...patch } : p));
  const patchAlertAdding = (patch: Partial<AlertForm>) =>
    setAlertAdding(p => (p ? { ...p, ...patch } : p));
  const patchAlertEditing = (patch: Partial<AlertForm>) =>
    setAlertEditing(p => (p ? { ...p, ...patch } : p));
  const patchActionAdding = (patch: Partial<ActionForm>) =>
    setActionAdding(p => (p ? { ...p, ...patch } : p));
  const patchActionEditing = (patch: Partial<ActionForm>) =>
    setActionEditing(p => (p ? { ...p, ...patch } : p));

  // Reply composer
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!token || !clientId) return;
    setLoading(true);
    try {
      const data = await getAdminPortalDashboard(token, clientId);
      setDetail(data);
      setHealthScore(data.health.score);
      setHealthComponents(data.health.components);
      try {
        setServices(await listClientServices(token, clientId));
      } catch {
        setServices([]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [token, clientId]);

  useEffect(() => {
    const t = setTimeout(() => load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  async function handleSaveHealth() {
    if (!token) return;
    setSavingHealth(true);
    try {
      const res = await updateAdminDashboardHealth(token, clientId, healthScore, healthComponents);
      setHealthScore(res.health_score);
      setHealthComponents(res.health_components);
      setDetail(prev => (prev ? { ...prev, health: { score: res.health_score, components: res.health_components } } : prev));
      toast.success("Health score updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update health score");
    } finally {
      setSavingHealth(false);
    }
  }

  // ---- Timeline management ----

  async function handleTimelineAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !timelineAdding) return;
    const key = timelineAdding.key.trim() || `stage-${Date.now()}`;
    try {
      const stages: { key: string; label: string; status: string; date: string | null }[] = [
        ...(detail?.timeline ?? []).map(s => ({ key: s.key, label: s.label, status: s.status, date: s.date })),
        { key, label: timelineAdding.label, status: timelineAdding.status, date: timelineAdding.date || null },
      ];
      const res = await updateAdminTimeline(token, clientId, stages);
      setDetail(prev => (prev ? { ...prev, timeline: res.timeline } : prev));
      setTimelineAdding(null);
      toast.success("Timeline stage added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add timeline stage");
    }
  }

  async function handleTimelineSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !timelineEditing) return;
    try {
      const stages = (detail?.timeline ?? []).map(s =>
        s.key === timelineEditing.key
          ? { ...s, label: timelineEditing.label, status: timelineEditing.status, date: timelineEditing.date || null }
          : s
      );
      const res = await updateAdminTimeline(token, clientId, stages);
      setDetail(prev => (prev ? { ...prev, timeline: res.timeline } : prev));
      setTimelineEditing(null);
      toast.success("Timeline stage updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update timeline stage");
    }
  }

  async function handleTimelineDelete(key: string) {
    if (!token) return;
    try {
      const stages = (detail?.timeline ?? []).filter(s => s.key !== key);
      const res = await updateAdminTimeline(token, clientId, stages);
      setDetail(prev => (prev ? { ...prev, timeline: res.timeline } : prev));
      toast.success("Timeline stage removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove timeline stage");
    }
  }

  // ---- Alerts management ----

  async function handleAlertAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !alertAdding) return;
    try {
      const created = await createAdminAlert(token, clientId, alertAdding);
      setDetail(prev => (prev ? { ...prev, alerts: [created, ...prev.alerts] } : prev));
      setAlertAdding(null);
      toast.success("Alert created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create alert");
    }
  }

  async function handleAlertSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !alertEditing) return;
    try {
      const updated = await updateAdminAlert(token, clientId, alertEditing.id, {
        severity: alertEditing.severity,
        title: alertEditing.title,
        message: alertEditing.message,
      });
      setDetail(prev =>
        prev ? { ...prev, alerts: prev.alerts.map(a => (a.id === updated.id ? updated : a)) } : prev
      );
      setAlertEditing(null);
      toast.success("Alert updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update alert");
    }
  }

  async function handleAlertDelete(alertId: string) {
    if (!token) return;
    try {
      await deleteAdminAlert(token, clientId, alertId);
      setDetail(prev => (prev ? { ...prev, alerts: prev.alerts.filter(a => a.id !== alertId) } : prev));
      toast.success("Alert removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove alert");
    }
  }

  // ---- Actions management ----

  async function handleActionAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !actionAdding) return;
    try {
      const created = await createAdminAction(token, clientId, {
        title: actionAdding.title,
        assignee: actionAdding.assignee,
        column: actionAdding.column,
        priority: actionAdding.priority,
        due_date: actionAdding.due_date || null,
      });
      setDetail(prev => (prev ? { ...prev, actions: [...prev.actions, created] } : prev));
      setActionAdding(null);
      toast.success("Action created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create action");
    }
  }

  async function handleActionSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !actionEditing) return;
    try {
      const updated = await updateAdminAction(token, clientId, actionEditing.id, {
        title: actionEditing.title,
        assignee: actionEditing.assignee,
        column: actionEditing.column,
        priority: actionEditing.priority,
        due_date: actionEditing.due_date || null,
      });
      setDetail(prev =>
        prev ? { ...prev, actions: prev.actions.map(a => (a.id === updated.id ? updated : a)) } : prev
      );
      setActionEditing(null);
      toast.success("Action updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update action");
    }
  }

  async function handleActionDelete(actionId: string) {
    if (!token) return;
    try {
      await deleteAdminAction(token, clientId, actionId);
      setDetail(prev => (prev ? { ...prev, actions: prev.actions.filter(a => a.id !== actionId) } : prev));
      toast.success("Action removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove action");
    }
  }

  async function handleActionMove(action: PortalActionItem, direction: -1 | 1) {
    if (!token) return;
    const idx = COLUMN_ORDER.indexOf(action.column);
    const next = COLUMN_ORDER[idx + direction];
    if (!next) return;
    try {
      const updated = await updateAdminAction(token, clientId, action.id, { column: next });
      setDetail(prev => (prev ? { ...prev, actions: prev.actions.map(a => (a.id === updated.id ? updated : a)) } : prev));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to move action");
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      await sendAdminPortalMessage(token, clientId, subject.trim(), body.trim());
      setSubject("");
      setBody("");
      toast.success("Message sent to client portal inbox");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  async function handleSeed() {
    if (!token) return;
    try {
      await seedAdminPortalDashboard(token, clientId);
      toast.success("Demo dashboard data reseeded");
      setShowSeedConfirm(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reseed dashboard");
    }
  }

  const client = detail?.client;

  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <DashboardLayout>
        <button
          onClick={() => router.push("/admin/portal-dashboards")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to dashboards
        </button>

        {loading && <p className="text-muted text-sm">Loading dashboard…</p>}

        {!loading && !detail && (
          <div className="flex flex-col items-center py-16 text-center">
            <Building2 className="size-10 text-gray-300 mb-3" />
            <p className="text-sm text-muted-foreground">Dashboard not available.</p>
          </div>
        )}

        {!loading && detail && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-ink">{client?.full_name}</h1>
                  <p className="text-muted-foreground mt-1">{client?.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    {client?.portal_type} portal
                  </span>
                  <button
                    onClick={() => setShowSeedConfirm(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    <RefreshCw className="size-4" /> Reseed demo data
                  </button>
                </div>
              </div>

              {/* Health editor */}
              <div className="mt-6 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Health Score & Components</p>
                  <button
                    onClick={handleSaveHealth}
                    disabled={savingHealth}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                  >
                    <Check className="size-3.5" /> {savingHealth ? "Saving…" : "Save health"}
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Overall</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={healthScore}
                      onChange={e => setHealthScore(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                      className={inputCls}
                    />
                  </div>
                  {Object.entries(detail.health.components).map(([key]) => (
                    <div key={key}>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground capitalize">
                        {key.replace("_", " ")}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={healthComponents[key] ?? 0}
                        onChange={e =>
                          setHealthComponents(prev => ({ ...prev, [key]: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }))
                        }
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* All linked services */}
              <div className="mt-6 rounded-xl border border-border bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Linked services</p>
                  <a href="/admin/clients" className="text-xs font-semibold text-primary hover:underline">
                    Manage in Clients
                  </a>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {services.length === 0 && <p className="text-sm text-muted-foreground">No services.</p>}
                  {services.map(svc => (
                    <span
                      key={svc.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold"
                    >
                      <span className="capitalize">{svc.portal_type}</span>
                      <span className="text-muted-foreground font-normal">•</span>
                      <span className="text-ink">{svc.category_name}</span>
                      {svc.is_primary && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Primary</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Timeline (editable) */}
              <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-ink">Engagement Timeline</h2>
                  <button
                    onClick={() => setTimelineAdding({ key: "", label: "", status: "pending", date: "" })}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                  >
                    <Plus className="size-3.5" /> Add stage
                  </button>
                </div>

                {timelineAdding && (
                  <form onSubmit={handleTimelineAdd} className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        required
                        placeholder="Label (e.g. Regulatory Filing)"
                        value={timelineAdding.label}
                        onChange={e => patchTimelineAdding({ label: e.target.value })}
                        className={inputCls}
                      />
                      <input
                        placeholder="Key (e.g. filing)"
                        value={timelineAdding.key}
                        onChange={e => patchTimelineAdding({ key: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={timelineAdding.status}
                        onChange={e => patchTimelineAdding({ status: e.target.value })}
                        className={inputCls}
                      >
                        {Object.entries(STAGE_STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={timelineAdding.date}
                        onChange={e => patchTimelineAdding({ date: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setTimelineAdding(null)}
                        className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-ink"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-white">
                        Add stage
                      </button>
                    </div>
                  </form>
                )}

                {detail.timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No timeline entries.</p>
                ) : (
                  <ol className="space-y-3">
                    {detail.timeline.map((s) => {
                      const editing = timelineEditing?.key === s.key;
                      return (
                        <li key={s.key} className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 size-2.5 rounded-full shrink-0 ${
                              s.status === "completed" ? "bg-green-500" : s.status === "in_progress" ? "bg-amber-500" : "bg-gray-300"
                            }`}
                          />
                          {editing ? (
                            <form onSubmit={handleTimelineSave} className="flex-1 space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  required
                                  value={timelineEditing.label}
                                  onChange={e => patchTimelineEditing({ label: e.target.value })}
                                  className={inputCls}
                                />
                                <input
                                  value={timelineEditing.date}
                                  type="date"
                                  onChange={e => patchTimelineEditing({ date: e.target.value })}
                                  className={inputCls}
                                />
                              </div>
                              <select
                                value={timelineEditing.status}
                                onChange={e => patchTimelineEditing({ status: e.target.value })}
                                className={inputCls}
                              >
                                {Object.entries(STAGE_STATUS_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                              <div className="flex gap-2">
                                <button type="submit" className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-xs font-medium text-white">
                                  <Check className="size-3" /> Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTimelineEditing(null)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:text-ink"
                                >
                                  <X className="size-3" /> Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-ink">{s.label}</p>
                                {s.date && <p className="text-xs text-muted-foreground">{s.date}</p>}
                                <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                                  {STAGE_STATUS_LABELS[s.status] ?? s.status}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setTimelineEditing({ key: s.key, label: s.label, status: s.status, date: s.date ?? "" })}
                                  className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-primary"
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                                <button
                                  onClick={() => handleTimelineDelete(s.key)}
                                  className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-red-600"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>

              {/* Alerts (editable) */}
              <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-ink">Alerts</h2>
                  <button
                    onClick={() => setAlertAdding({ severity: "info", title: "", message: "" })}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                  >
                    <Plus className="size-3.5" /> Add alert
                  </button>
                </div>

                {alertAdding && (
                  <form onSubmit={handleAlertAdd} className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2">
                    <select
                      value={alertAdding.severity}
                      onChange={e => patchAlertAdding({ severity: e.target.value })}
                      className={inputCls}
                    >
                      <option value="critical">Critical</option>
                      <option value="warning">Warning</option>
                      <option value="info">Info</option>
                    </select>
                    <input
                      required
                      placeholder="Alert title"
                      value={alertAdding.title}
                      onChange={e => patchAlertAdding({ title: e.target.value })}
                      className={inputCls}
                    />
                    <textarea
                      rows={2}
                      placeholder="Alert message (optional)"
                      value={alertAdding.message}
                      onChange={e => patchAlertAdding({ message: e.target.value })}
                      className={inputCls}
                    />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setAlertAdding(null)} className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-ink">
                        Cancel
                      </button>
                      <button type="submit" className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-white">
                        Add alert
                      </button>
                    </div>
                  </form>
                )}

                {detail.alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No alerts.</p>
                ) : (
                  <ul className="space-y-3">
                    {detail.alerts.map(a => {
                      const editing = alertEditing?.id === a.id;
                      return (
                        <li key={a.id} className="rounded-lg border border-border p-3">
                          {editing ? (
                            <form onSubmit={handleAlertSave} className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={alertEditing.severity}
                                  onChange={e => patchAlertEditing({ severity: e.target.value })}
                                  className={inputCls}
                                >
                                  <option value="critical">Critical</option>
                                  <option value="warning">Warning</option>
                                  <option value="info">Info</option>
                                </select>
                                <input
                                  required
                                  value={alertEditing.title}
                                  onChange={e => patchAlertEditing({ title: e.target.value })}
                                  className={inputCls}
                                />
                              </div>
                              <textarea
                                rows={2}
                                value={alertEditing.message}
                                onChange={e => patchAlertEditing({ message: e.target.value })}
                                className={inputCls}
                              />
                              <div className="flex gap-2">
                                <button type="submit" className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-xs font-medium text-white">
                                  <Check className="size-3" /> Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAlertEditing(null)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:text-ink"
                                >
                                  <X className="size-3" /> Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="flex items-center justify-between gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${SEVERITY_COLORS[a.severity] || "bg-gray-100 text-gray-700"}`}>
                                  {a.severity}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  {format(new Date(a.created_at), "MMM d, h:mm a")}
                                </span>
                              </div>
                              <p className="mt-2 text-sm font-semibold text-ink">{a.title}</p>
                              {a.message && <p className="mt-1 text-xs text-muted-foreground">{a.message}</p>}
                              <div className="mt-2 flex items-center gap-1.5">
                                <button
                                  onClick={() => setAlertEditing({ id: a.id, severity: a.severity, title: a.title, message: a.message })}
                                  className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-primary"
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                                <button
                                  onClick={() => handleAlertDelete(a.id)}
                                  className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-red-600"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Actions (editable kanban) */}
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-ink">Action Plan</h2>
                <button
                  onClick={() => setActionAdding({ title: "", assignee: "", column: "todo", priority: "medium", due_date: "" })}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                >
                  <Plus className="size-3.5" /> Add action
                </button>
              </div>

              {actionAdding && (
                <form onSubmit={handleActionAdd} className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2">
                  <input
                    required
                    placeholder="Action title"
                    value={actionAdding.title}
                    onChange={e => patchActionAdding({ title: e.target.value })}
                    className={inputCls}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Assignee"
                      value={actionAdding.assignee}
                      onChange={e => patchActionAdding({ assignee: e.target.value })}
                      className={inputCls}
                    />
                    <input
                      type="date"
                      value={actionAdding.due_date}
                      onChange={e => patchActionAdding({ due_date: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={actionAdding.column} onChange={e => patchActionAdding({ column: e.target.value })} className={inputCls}>
                      {COLUMN_ORDER.map(c => <option key={c} value={c}>{COLUMN_LABELS[c]}</option>)}
                    </select>
                    <select value={actionAdding.priority} onChange={e => patchActionAdding({ priority: e.target.value })} className={inputCls}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setActionAdding(null)} className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-ink">
                      Cancel
                    </button>
                    <button type="submit" className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-white">
                      Add action
                    </button>
                  </div>
                </form>
              )}

              {detail.actions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No actions.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {detail.actions.map(a => {
                    const editing = actionEditing?.id === a.id;
                    const colIdx = COLUMN_ORDER.indexOf(a.column);
                    return (
                      <div key={a.id} className="rounded-lg border border-border p-3">
                        {editing ? (
                          <form onSubmit={handleActionSave} className="space-y-2">
                            <input
                              required
                              value={actionEditing.title}
                              onChange={e => patchActionEditing({ title: e.target.value })}
                              className={inputCls}
                            />
                            <input
                              value={actionEditing.assignee}
                              onChange={e => patchActionEditing({ assignee: e.target.value })}
                              className={inputCls}
                            />
                            <select value={actionEditing.column} onChange={e => patchActionEditing({ column: e.target.value })} className={inputCls}>
                              {COLUMN_ORDER.map(c => <option key={c} value={c}>{COLUMN_LABELS[c]}</option>)}
                            </select>
                            <select value={actionEditing.priority} onChange={e => patchActionEditing({ priority: e.target.value })} className={inputCls}>
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                            <input
                              type="date"
                              value={actionEditing.due_date}
                              onChange={e => patchActionEditing({ due_date: e.target.value })}
                              className={inputCls}
                            />
                            <div className="flex gap-2">
                              <button type="submit" className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-xs font-medium text-white">
                                <Check className="size-3" /> Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setActionEditing(null)}
                                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:text-ink"
                              >
                                <X className="size-3" /> Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                                {COLUMN_LABELS[a.column] || a.column}
                              </span>
                              <span className={`text-[11px] font-semibold ${a.priority === "high" ? "text-red-600" : a.priority === "medium" ? "text-amber-600" : "text-gray-500"}`}>
                                {a.priority}
                              </span>
                            </div>
                            <p className="mt-1.5 text-sm font-medium text-ink">{a.title}</p>
                            {a.assignee && <p className="text-xs text-muted-foreground">{a.assignee}</p>}
                            {a.due_date && (
                              <p className="text-[11px] text-muted-foreground">Due {format(new Date(a.due_date), "MMM d, yyyy")}</p>
                            )}
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleActionMove(a, -1)}
                                  disabled={colIdx <= 0}
                                  className="rounded-md border border-border p-1 text-muted-foreground hover:text-primary disabled:opacity-30"
                                >
                                  <ChevronLeft className="size-3.5" />
                                </button>
                                <button
                                  onClick={() => handleActionMove(a, 1)}
                                  disabled={colIdx >= COLUMN_ORDER.length - 1}
                                  className="rounded-md border border-border p-1 text-muted-foreground hover:text-primary disabled:opacity-30"
                                >
                                  <ChevronRight className="size-3.5" />
                                </button>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setActionEditing({ id: a.id, title: a.title, assignee: a.assignee, column: a.column, priority: a.priority, due_date: a.due_date ? a.due_date.slice(0, 10) : "" })}
                                  className="rounded-md border border-border p-1 text-muted-foreground hover:text-primary"
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                                <button
                                  onClick={() => handleActionDelete(a.id)}
                                  className="rounded-md border border-border p-1 text-muted-foreground hover:text-red-600"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Messaging */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquarePlus className="size-5 text-primary" />
                  <h2 className="text-lg font-semibold text-ink">Message Client</h2>
                </div>
                <form onSubmit={handleSend} className="space-y-4">
                  <input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Subject"
                    required
                    className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-primary"
                  />
                  <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Write a message to the client's portal inbox…"
                    rows={4}
                    required
                    className="w-full resize-none rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-primary"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                    >
                      <Send className="size-4" /> {sending ? "Sending…" : "Send to Client"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-ink">Conversation</h2>
                  <button
                    onClick={load}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
                  >
                    <RefreshCw className="size-3.5" /> Refresh
                  </button>
                </div>
                {detail.messages.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No messages yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {detail.messages.map(m => {
                      const fromFirm = m.sender === "firm";
                      return (
                        <div
                          key={m.id}
                          className={`rounded-xl border p-3.5 ${fromFirm ? "border-primary/30 bg-primary/5" : "border-border bg-gray-50"}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${fromFirm ? "bg-primary/15 text-primary" : "bg-gray-200 text-gray-600"}`}>
                              {fromFirm ? "MEMMIC Team" : "Client"}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {format(new Date(m.created_at), "MMM d, yyyy h:mm a")} {!fromFirm && !m.is_read && "· unread"}
                            </span>
                          </div>
                          <p className="mt-2 font-semibold text-ink">{m.subject}</p>
                          <p className="mt-1 text-sm text-ink/80 whitespace-pre-wrap">{m.body}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reseed confirm */}
        {showSeedConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-lg font-semibold text-ink">Reseed demo data?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This regenerates the client&apos;s dashboard data (health, timeline, alerts, actions, and demo messages) from the demo dataset.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowSeedConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-gray-100 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSeed}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:opacity-90 rounded transition-colors"
                >
                  Reseed
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
