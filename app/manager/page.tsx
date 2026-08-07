"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/Layouts/dashboard-layout";
import { ManagerApprovalsTable } from "@/components/ManagerApprovalsTable";
import { ExportButton } from "@/components/ExportButton";
import { RoleGuard } from "@/components/RouterGuard";

function ManagerDashboardContent() {
  const pendingApprovals = [
    { id: "APP-101", applicant: "Urban Housing Corp", type: "Credit Assessment", amount: "$1,200,000", submitted: "2026-07-28" },
    { id: "APP-102", applicant: "Lahore Tech Park", type: "Shariah Screening", amount: "$850,000", submitted: "2026-07-27" },
    { id: "APP-103", applicant: "Sindh Agro Logistics", type: "Escrow Allocation", amount: "$450,000", submitted: "2026-07-26" },
  ];

  const teamTasks = [
    { task: "Review Islamabad Region Q3 Credit Report", assignee: "Hassan Raza", status: "In Progress", due: "Today" },
    { task: "Verify Collateral Valuation for Karachi Project", assignee: "Ayesha Noor", status: "Pending", due: "Tomorrow" },
    { task: "Approve Monthly Yield Distribution", assignee: "Tariq Mahmood", status: "Completed", due: "Completed" },
  ];

  return (
    <DashboardLayout>
      {/* Header Banner */}
      <div className="mb-8 rounded-2xl bg-ink p-6 sm:p-8 text-ink-foreground shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary mb-3">
            OPERATIONS MANAGEMENT
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-sm text-ink-foreground/70 mt-1">
            Oversee credit evaluations, manage team workflows, and handle verification requests.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ExportButton />
          <Link
            href="/investor"
            className="rounded bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            Investor View
          </Link>
          <Link
            href="/admin"
            className="rounded bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            Admin View
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
          <h3 className="mt-2 text-3xl font-bold text-ink">7</h3>
          <span className="mt-2 inline-flex items-center text-xs font-semibold text-primary">
            Action Required
          </span>
        </div>
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Active Operations</p>
          <h3 className="mt-2 text-3xl font-bold text-ink">34</h3>
          <span className="mt-2 inline-flex items-center text-xs font-semibold text-primary">
            On Track
          </span>
        </div>
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Team Efficiency</p>
          <h3 className="mt-2 text-3xl font-bold text-ink">94.2%</h3>
          <span className="mt-2 inline-flex items-center text-xs font-semibold text-primary">
            +4% vs last week
          </span>
        </div>
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Monthly Target</p>
          <h3 className="mt-2 text-3xl font-bold text-ink">88%</h3>
          <span className="mt-2 inline-flex items-center text-xs font-semibold text-primary">
            Almost Met
          </span>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ManagerApprovalsTable approvals={pendingApprovals} />

        {/* Team Tasks Section */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-ink">Team Tasks & Workflows</h2>
            <button className="text-xs font-semibold text-primary hover:underline">
              Manage Team
            </button>
          </div>
          <div className="space-y-4">
            {teamTasks.map((t, idx) => (
              <div key={idx} className="flex items-start justify-between border-b border-border/60 pb-3">
                <div>
                  <p className="text-sm font-medium text-ink">{t.task}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Assignee: {t.assignee} • Due: {t.due}
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs font-semibold ${
                    t.status === "Completed"
                      ? "bg-primary/10 text-primary"
                      : t.status === "In Progress"
                      ? "bg-blue/10 text-blue"
                      : "bg-surface text-muted-foreground"
                  }`}
                >
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ManagerDashboard() {
  return (
    <RoleGuard allowedRoles={["Manager"]}>
      <ManagerDashboardContent />
    </RoleGuard>
  );
}
