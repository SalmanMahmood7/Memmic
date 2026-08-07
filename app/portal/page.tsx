"use client";

import { ClientPortalShell } from "@/components/client-portal/client-portal-shell";
import { useAuth } from "@/context/AuthContext";
import {
  ApiError,
  applyPortalService,
  EnquiryCategory,
  fetchAllEnquiryCategories,
  getClientPortalServices,
  PortalServiceItem,
} from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, RefreshCw, ServerOff, Clock, XCircle, Bell } from "lucide-react";
import Link from "next/link";

const PORTAL_META: Record<string, { label: string; href: string; color: string }> = {
  evaluation: { label: "Evaluation", href: "/portal/evaluation", color: "bg-blue-100 text-blue-700" },
  investment: { label: "Investment", href: "/portal/investment", color: "bg-purple-100 text-purple-700" },
  marketplace: { label: "Market Place", href: "/portal/marketplace", color: "bg-teal-100 text-teal-700" },
  management: { label: "Management", href: "/portal/management", color: "bg-orange-100 text-orange-700" },
};

export default function PortalHomePage() {
  const { token } = useAuth();
  const [services, setServices] = useState<PortalServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<EnquiryCategory[]>([]);
  const [showApply, setShowApply] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applyForm, setApplyForm] = useState({ category_id: "", brief: "" });
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([getClientPortalServices(token), fetchAllEnquiryCategories()])
      .then(([svcs, cats]) => {
        setServices(svcs);
        setCategories(cats.filter((c) => c.is_active === 1));
        setError(null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Could not load your services"))
      .finally(() => setLoading(false));
  }, [token, refreshKey]);

  const handleApply = async (e: React.FormEvent, applicantName: string, applicantEmail: string) => {
    e.preventDefault();
    if (!token || !applyForm.category_id) return;
    setSubmitting(true);
    try {
      await applyPortalService(token, {
        full_name: applicantName,
        email: applicantEmail,
        category_id: applyForm.category_id,
        brief: applyForm.brief,
      });
      toast.success("Application submitted. The MEMMIC team will review it.");
      setApplyForm({ category_id: "", brief: "" });
      setShowApply(false);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const activeServices = services.filter((s) => s.status === "approved");
  const pendingServices = services.filter((s) => s.status !== "approved");

  return (
    <ClientPortalShell
      allowedRole="evaluation_client"
      portalLabel="Client Portal"
      tagline="Manage all of your services with MEMMIC — evaluation, management, market place, and investment — in one place."
    >
      {profile => (
        <div className="space-y-6">
          {loading && (
            <div className="flex items-center justify-center rounded-xl border border-border bg-white p-16">
              <div className="text-center">
                <RefreshCw className="mx-auto size-6 animate-spin text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">Loading your services…</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-xl border border-border bg-white p-10 text-center">
              <ServerOff className="mx-auto size-8 text-red-500" />
              <p className="mt-3 text-sm text-muted-foreground">{error}</p>
              <button
                onClick={refresh}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                <RefreshCw className="size-4" /> Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Approve / reject notifications */}
              {pendingServices.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-center gap-2">
                    <Bell className="size-5 text-amber-600" />
                    <h3 className="text-sm font-bold text-amber-800">Application notifications</h3>
                  </div>
                  <div className="mt-3 space-y-2">
                    {pendingServices.map((svc) => {
                      const meta = PORTAL_META[svc.portal_type] ?? { label: svc.portal_type, color: "bg-gray-100 text-gray-700" };
                      const rejected = svc.status === "rejected";
                      return (
                        <div
                          key={svc.id}
                          className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 ${
                            rejected ? "border-red-200 bg-white" : "border-amber-200 bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.color}`}>
                              {meta.label}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-ink">{svc.category_name}</p>
                              {rejected ? (
                                <p className="mt-1 text-sm text-red-700">
                                  Your application was not approved.
                                  {svc.rejection_reason && (
                                    <span className="mt-0.5 block text-xs text-muted-foreground">
                                      Reason: {svc.rejection_reason}
                                    </span>
                                  )}
                                </p>
                              ) : (
                                <p className="mt-1 text-sm text-muted-foreground">
                                  Your application is awaiting review by the MEMMIC team.
                                </p>
                              )}
                            </div>
                          </div>
                          {rejected ? (
                            <XCircle className="size-5 shrink-0 text-red-500" />
                          ) : (
                            <Clock className="size-5 shrink-0 text-yellow-600" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active services */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink">Your Services</h2>
                <button
                  onClick={() => setShowApply((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  <Plus className="size-4" /> Apply for another service
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeServices.map((svc) => {
                  const meta = PORTAL_META[svc.portal_type] ?? {
                    label: svc.portal_type,
                    href: `/portal/${svc.portal_type}`,
                    color: "bg-gray-100 text-gray-700",
                  };
                  return (
                    <Link
                      key={svc.id}
                      href={meta.href}
                      className="group rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:border-primary hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.color}`}>
                          {meta.label}
                        </span>
                        {svc.is_primary && (
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                            Primary
                          </span>
                        )}
                      </div>
                      <h3 className="mt-4 text-lg font-bold text-ink">{svc.category_name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{svc.brief}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-semibold text-ink">
                          {svc.health_score != null ? `Health ${svc.health_score}` : "Pending setup"}
                        </span>
                        <span className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          Open →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Apply for a new service */}
              {showApply && (
                <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-ink">Apply for a new service</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose a service to apply for. Once approved, it will appear in your services above.
                  </p>
                  <form onSubmit={(e) => handleApply(e, profile?.full_name ?? "Client", profile?.email ?? "client@memmic.app")} className="mt-5 space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-muted-foreground">Service</label>
                      <select
                        required
                        value={applyForm.category_id}
                        onChange={(e) => setApplyForm((p) => ({ ...p, category_id: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Select a service</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} — {cat.form_type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-muted-foreground">Why are you applying?</label>
                      <textarea
                        required
                        rows={4}
                        value={applyForm.brief}
                        onChange={(e) => setApplyForm((p) => ({ ...p, brief: e.target.value }))}
                        placeholder="Briefly describe what you need…"
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowApply(false)}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-ink transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                      >
                        {submitting ? "Submitting…" : "Submit application"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </ClientPortalShell>
  );
}
