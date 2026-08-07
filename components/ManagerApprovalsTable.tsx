"use client";

import { useState } from "react";
import { toast } from "sonner";

type Approval = {
  id: string;
  applicant: string;
  type: string;
  amount: string;
  submitted: string;
};

export function ManagerApprovalsTable({ approvals }: { approvals: Approval[] }) {
  const [list, setList] = useState(approvals);
  const [search, setSearch] = useState("");

  const filtered = list.filter(
    (a) =>
      a.applicant.toLowerCase().includes(search.toLowerCase()) ||
      a.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleReview = (id: string, applicant: string) => {
    toast.success(`Approval request for ${applicant} reviewed & approved.`);
    setList(list.filter((a) => a.id !== id));
  };

  const handleNewRequest = () => {
    const applicant = prompt("Enter applicant name:");
    if (!applicant) return;
    const type = prompt("Enter request type (Credit Assessment / Shariah Screening / Escrow):") || "Credit Assessment";
    const amount = prompt("Enter amount (e.g. $500,000):") || "$250,000";
    const newApp: Approval = {
      id: `APP-10${list.length + 1}`,
      applicant,
      type,
      amount,
      submitted: new Date().toISOString().split("T")[0],
    };
    setList([newApp, ...list]);
    toast.success(`New request for ${applicant} submitted.`);
  };

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-bold text-ink">Pending Approvals</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search approvals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded border border-border px-3 py-1.5 text-sm outline-none focus:border-primary w-full sm:w-48"
          />
          <button
            onClick={handleNewRequest}
            className="rounded bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:brightness-105 shrink-0"
          >
            New Request
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted-foreground">
            <tr>
              <th className="pb-3">Applicant</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-muted-foreground">
                  No pending approvals.
                </td>
              </tr>
            ) : (
              filtered.map((app) => (
                <tr key={app.id} className="hover:bg-surface/50">
                  <td className="py-3 font-medium text-ink">{app.applicant}</td>
                  <td className="py-3 text-muted-foreground">{app.type}</td>
                  <td className="py-3 font-semibold text-ink">{app.amount}</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleReview(app.id, app.applicant)}
                      className="rounded bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
