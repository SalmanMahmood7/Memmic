/**
 * Generate realistic demo data for a client's executive portal dashboard.
 * Direct port of Backend/app/services/portal_seed.py.
 */
import { PrismaClient, Prisma } from "@prisma/client";

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function daysAgo(n: number): string {
  const d = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function isoDaysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

function dateDaysFromNow(n: number): Date {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

function dateDaysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface TimelineStage {
  key: string;
  label: string;
  status: string;
  date: string | null;
}

function timeline(portalType: string): TimelineStage[] {
  const base: TimelineStage[] = [
    { key: "evaluation", label: "Evaluation", status: "completed", date: daysAgo(90) },
    { key: "management", label: "Management Onboarding", status: "pending", date: null },
    { key: "marketplace", label: "Marketplace Listing", status: "pending", date: null },
    { key: "investment", label: "Investment Vetting", status: "pending", date: null },
  ];
  if (portalType === "evaluation") {
    base[0].status = "in_progress";
  } else if (portalType === "management") {
    base[0].status = "completed";
    base[1].status = "in_progress";
    base[1].date = daysAgo(30);
  } else if (portalType === "marketplace") {
    base[0].status = "completed";
    base[1].status = "completed";
    base[1].date = daysAgo(30);
    base[2].status = "in_progress";
    base[2].date = daysAgo(7);
  } else if (portalType === "investment") {
    for (let i = 0; i < 3; i++) {
      base[i].status = "completed";
      base[i].date = daysAgo(90 - i * 25);
    }
    base[3].status = "in_progress";
    base[3].date = daysAgo(3);
  }
  return base;
}

function health(portalType: string) {
  const components: Record<string, number> = {
    evaluation: randInt(72, 88),
    management: randInt(70, 86),
    marketplace: randInt(65, 82),
    investment: randInt(60, 78),
  };
  if (portalType === "evaluation") components.evaluation = randInt(82, 94);
  else if (portalType === "management") components.management = randInt(80, 92);
  else if (portalType === "marketplace") components.marketplace = randInt(78, 90);
  else if (portalType === "investment") components.investment = randInt(76, 88);

  const values = Object.values(components);
  const score = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  return { score, components };
}

function evaluationData() {
  return {
    valuations: [
      { method: "Residual Income", label: "Residual Income", low: 21.5, high: 28.4, mid: 25.0 },
      { method: "Price-to-Book (P/B)", label: "Price-to-Book", low: 19.8, high: 26.9, mid: 23.4 },
      { method: "Market Multiples", label: "Market Multiples", low: 18.9, high: 27.6, mid: 23.2 },
    ],
    risk_metrics: [
      { key: "NPL", label: "Non-Performing Loan Ratio", value: 8.4, target: 5.0, unit: "%", status: "attention" },
      { key: "AML", label: "AML Protocol Coverage", value: 92, target: 100, unit: "%", status: "healthy" },
      { key: "underwriting", label: "Underwriting Algorithm Score", value: 87, target: 80, unit: "%", status: "healthy" },
      { key: "compliance", label: "Compliance Risk Score", value: 12, target: 20, unit: "Low Risk", status: "healthy" },
    ],
    data_room: {
      total: 15,
      reviewed: 9,
      missing: 3,
      approved: 3,
      documents: [
        { name: "Tax Records — FY2022 to FY2024", category: "Tax", status: "approved" },
        { name: "Performing Loan Book Schedule", category: "Loan Book", status: "approved" },
        { name: "Auditor Report — External", category: "Audit", status: "approved" },
        { name: "Loan Book Aging Analysis", category: "Loan Book", status: "reviewed" },
        { name: "NPL Provisioning Details", category: "Loan Book", status: "reviewed" },
        { name: "AML Compliance Policy", category: "Compliance", status: "reviewed" },
        { name: "Credit Underwriting Model Docs", category: "Underwriting", status: "reviewed" },
        { name: "Capital Adequacy Return", category: "Regulatory", status: "reviewed" },
        { name: "Prudential Returns (SBP)", category: "Regulatory", status: "reviewed" },
        { name: "Board Resolutions — Lending", category: "Legal", status: "reviewed" },
        { name: "Share Register / Cap Table", category: "Legal", status: "reviewed" },
        { name: "Corporate Tax Certificates", category: "Tax", status: "missing" },
        { name: "Management Resumes", category: "Personnel", status: "missing" },
        { name: "Insider / Related Party Report", category: "Legal", status: "missing" },
      ],
    },
  };
}

function kpiSeries(label: string, start: number, end: number, unit: string, current: number, target: number) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const step = (end - start) / (months.length - 1);
  const series = months.map((m, i) => ({ x: m, y: Math.round((start + step * i) * 10) / 10 }));
  return {
    key: label.toLowerCase().replace(/ /g, "_"),
    label,
    unit,
    current,
    target,
    series,
  };
}

function managementData() {
  return {
    kpis: [
      kpiSeries("Customer Acquisition Cost", 4200, 2940, "USD", 2940, 2000),
      kpiSeries("Loan Default Rate", 6.8, 4.1, "%", 4.1, 3.0),
      kpiSeries("Underwriting Turnaround", 9, 2, "days", 2, 1),
    ],
    advisory_notes: [
      {
        id: "n1",
        title: "AI-driven underwriting engine rollout",
        content:
          "Replace the manual loan approval workflow with an automated AI underwriting engine. Expected to cut approval time from days to minutes and lower default rates by ~40%.",
        author: "MEMMIC Management",
        created_at: isoDaysAgo(3),
      },
      {
        id: "n2",
        title: "Cost optimization: marketing channels",
        content:
          "Unit economics review found that restructuring ad spend toward higher-intent channels reduces Customer Acquisition Cost (CAC) by ~30%.",
        author: "MEMMIC Advisory",
        created_at: isoDaysAgo(10),
      },
      {
        id: "n3",
        title: "Interim Chief Risk Officer placement",
        content:
          "A 6-month interim CRO placement is in progress to rebuild the regulatory compliance framework and close AML/underwriting audit gaps.",
        author: "Executive Advisory",
        created_at: isoDaysAgo(21),
      },
    ],
  };
}

function marketplaceData() {
  return {
    listings: [
      { title: "Performing Consumer Loan Portfolio — $5M", category: "Securitization", status: "active", views: 1240, inquiries: 42, engagement_rate: 3.4, listed_at: daysAgo(45) },
      { title: "Secondary Equity — Early Investor Shares", category: "Equity Trading", status: "active", views: 890, inquiries: 28, engagement_rate: 3.1, listed_at: daysAgo(60) },
      { title: "B2B Service Match — Legal & Audit RFP", category: "Service Matching", status: "active", views: 560, inquiries: 14, engagement_rate: 2.5, listed_at: daysAgo(15) },
      { title: "Institutional Credit Line Offer — $10M", category: "Debt Facility", status: "active", views: 1430, inquiries: 51, engagement_rate: 3.6, listed_at: daysAgo(75) },
    ],
    traffic: [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n, i) => {
      const rows = [
        { views: 210, inquiries: 6, engagement: 2.9 },
        { views: 245, inquiries: 7, engagement: 2.9 },
        { views: 230, inquiries: 8, engagement: 3.5 },
        { views: 300, inquiries: 9, engagement: 3.0 },
        { views: 280, inquiries: 10, engagement: 3.6 },
        { views: 320, inquiries: 11, engagement: 3.4 },
        { views: 290, inquiries: 9, engagement: 3.1 },
        { views: 360, inquiries: 13, engagement: 3.6 },
        { views: 340, inquiries: 12, engagement: 3.5 },
        { views: 410, inquiries: 15, engagement: 3.7 },
        { views: 380, inquiries: 14, engagement: 3.7 },
        { views: 430, inquiries: 16, engagement: 3.7 },
        { views: 460, inquiries: 17, engagement: 3.7 },
      ];
      return { date: daysAgo(n), ...rows[i] };
    }),
    pipeline: [
      { stage: "Expression of Interest", value: 12, amount: 20_000_000, color: "#5750F1" },
      { stage: "NDA & Info Exchange", value: 8, amount: 14_000_000, color: "#0ABEF9" },
      { stage: "Institutional DD", value: 5, amount: 9_000_000, color: "#F59E0B" },
      { stage: "Term Sheet", value: 3, amount: 6_000_000, color: "#22C55E" },
      { stage: "Closed", value: 1, amount: 2_000_000, color: "#10B981" },
    ],
  };
}

function investmentData() {
  return {
    funding: {
      goal: 20_000_000,
      raised: 8_000_000,
      currency: "USD",
      milestones: [
        { label: "Direct Equity Injection — Series A (10%)", amount: 2_000_000, reached: true },
        { label: "Venture Debt / Credit Line", amount: 10_000_000, reached: false },
        { label: "Syndicated Matchmaking Target", amount: 8_000_000, reached: false },
      ],
    },
    investor_matches: [
      { name: "VC Fund Alpha", type: "Venture Capital", industry: "Fintech Lending", tier: "Tier 1", interest: "High", views: 6, last_viewed: daysAgo(2) },
      { name: "Institutional Fund B", type: "Private Equity", industry: "Financial Services", tier: "Tier 1", interest: "High", views: 4, last_viewed: daysAgo(5) },
      { name: "Debt Fund C", type: "Venture Debt", industry: "Fintech", tier: "Tier 1", interest: "High", views: 3, last_viewed: daysAgo(8) },
      { name: "Family Office D", type: "Family Office", industry: "Diversified", tier: "Tier 2", interest: "Medium", views: 2, last_viewed: daysAgo(14) },
      { name: "Regional VC E", type: "Venture Capital", industry: "Consumer Finance", tier: "Tier 2", interest: "Medium", views: 1, last_viewed: daysAgo(20) },
    ],
    term_sheets: [
      {
        title: "Direct Equity — VC Fund Alpha",
        structure: "Series A Equity",
        offer_type: "Equity",
        amount: 2_000_000,
        status: "negotiating",
        due_diligence: [
          { item: "Financials", status: "passed" },
          { item: "AML & Compliance", status: "passed" },
          { item: "Technical Underwriting", status: "pending" },
        ],
      },
      {
        title: "Venture Debt — Debt Fund C",
        structure: "Institutional Credit Line",
        offer_type: "Debt",
        amount: 10_000_000,
        status: "draft",
        due_diligence: [
          { item: "Financials", status: "passed" },
          { item: "Loan Book Quality", status: "pending" },
        ],
      },
    ],
  };
}

interface AlertSeed {
  severity: string;
  title: string;
  message: string;
  is_read: boolean;
}

function alerts(portalType: string): AlertSeed[] {
  const list: AlertSeed[] = [
    { severity: "critical", title: "Regulatory deadline approaching", message: "SBP prudential return due in 5 days — ensure data room files are current.", is_read: false },
    { severity: "warning", title: "Pending data uploads", message: "3 due diligence documents are still missing from the data room.", is_read: false },
    { severity: "info", title: "New institutional inquiry", message: "Institutional Fund B viewed your investment profile and requested a term sheet.", is_read: false },
    { severity: "info", title: "Marketplace traction", message: "Buyer views on your loan portfolio listing up 34% over the last 7 days.", is_read: true },
  ];
  if (portalType === "evaluation") {
    list.splice(2, 0, { severity: "warning", title: "Valuation model update", message: "Revised Residual Income and P/B multiples received — review in Evaluation Analytics.", is_read: false });
  } else if (portalType === "management") {
    list.splice(2, 0, { severity: "warning", title: "Underwriting rollout tracking", message: "AI underwriting engine migration is behind schedule by 2 days.", is_read: false });
  } else if (portalType === "marketplace") {
    list.splice(2, 0, { severity: "info", title: "Listing update", message: "Performing consumer loan portfolio reached 1,200 buyer views.", is_read: false });
  } else if (portalType === "investment") {
    list.splice(2, 0, { severity: "warning", title: "Due diligence pending", message: "Technical underwriting DD item awaiting completion for VC Fund Alpha term sheet.", is_read: false });
  }
  return list;
}

interface ActionSeed {
  title: string;
  assignee: string;
  column: string;
  priority: string;
  due_days: number;
}

function actions(portalType: string): ActionSeed[] {
  const list: ActionSeed[] = [
    { title: "Finalise loan book provisioning schedules", assignee: "Finance Team", column: "todo", priority: "high", due_days: 7 },
    { title: "Update cap table for equity injection", assignee: "Legal Counsel", column: "in_progress", priority: "medium", due_days: 3 },
    { title: "Approve residual income valuation inputs", assignee: "MEMMIC Advisory", column: "review", priority: "high", due_days: 1 },
    { title: "Run AML compliance audit findings", assignee: "Compliance Officer", column: "in_progress", priority: "medium", due_days: 5 },
    { title: "Draft term sheet for venture debt line", assignee: "Legal Counsel", column: "todo", priority: "low", due_days: 14 },
    { title: "Close data room document gaps", assignee: "Finance Team", column: "done", priority: "high", due_days: 0 },
  ];
  if (portalType === "management") {
    list.unshift({ title: "Migrate loan approvals to AI underwriting engine", assignee: "Engineering Lead", column: "todo", priority: "high", due_days: 2 });
  }
  return list;
}

interface MessageSeed {
  sender: string;
  subject: string;
  body: string;
  is_read: boolean;
  days_ago: number;
}

function messages(): MessageSeed[] {
  return [
    {
      sender: "firm",
      subject: "Welcome to your MEMMIC portal",
      body: "Your credentials are now active. Please review the due diligence checklist in the Evaluation section and let us know if any documents are missing.",
      is_read: false,
      days_ago: 12,
    },
    {
      sender: "firm",
      subject: "Valuation update",
      body: "The advisory team has completed a preliminary review. Residual Income and Price-to-Book valuation ranges, along with risk metrics, are now visible in your dashboard.",
      is_read: false,
      days_ago: 6,
    },
  ];
}

export function buildDashboardData(portalType: string) {
  const h = health(portalType);
  const dashboardFields = {
    health_score: h.score,
    health_components: h.components,
    timeline: timeline(portalType),
    evaluation_data: evaluationData(),
    management_data: managementData(),
    marketplace_data: marketplaceData(),
    investment_data: investmentData(),
  };
  return { dashboardFields, alerts: alerts(portalType), actions: actions(portalType) };
}

/** Create or replace the demo dashboard + alerts + actions + messages for a client enquiry. */
export async function seedPortalDashboard(prisma: PrismaClient, clientMessageId: string, portalType: string) {
  const { dashboardFields, alerts: alertSeeds, actions: actionSeeds } = buildDashboardData(portalType);

  const dashboard = await prisma.portalDashboard.upsert({
    where: { clientMessageId },
    update: {
      healthScore: dashboardFields.health_score,
      healthComponents: toJson(dashboardFields.health_components),
      timeline: toJson(dashboardFields.timeline),
      evaluationData: toJson(dashboardFields.evaluation_data),
      managementData: toJson(dashboardFields.management_data),
      marketplaceData: toJson(dashboardFields.marketplace_data),
      investmentData: toJson(dashboardFields.investment_data),
    },
    create: {
      clientMessageId,
      healthScore: dashboardFields.health_score,
      healthComponents: toJson(dashboardFields.health_components),
      timeline: toJson(dashboardFields.timeline),
      evaluationData: toJson(dashboardFields.evaluation_data),
      managementData: toJson(dashboardFields.management_data),
      marketplaceData: toJson(dashboardFields.marketplace_data),
      investmentData: toJson(dashboardFields.investment_data),
    },
  });

  await prisma.portalAlert.deleteMany({ where: { dashboardId: dashboard.id } });
  await prisma.portalAction.deleteMany({ where: { dashboardId: dashboard.id } });
  await prisma.portalMessage.deleteMany({ where: { dashboardId: dashboard.id } });

  const messageSeeds = messages();
  await prisma.portalMessage.createMany({
    data: messageSeeds.map((m) => ({
      dashboardId: dashboard.id,
      sender: m.sender,
      subject: m.subject,
      body: m.body,
      isRead: m.is_read,
      createdAt: dateDaysAgo(m.days_ago),
    })),
  });

  await prisma.portalAlert.createMany({
    data: alertSeeds.map((a, i) => ({
      dashboardId: dashboard.id,
      severity: a.severity,
      title: a.title,
      message: a.message,
      isRead: a.is_read,
      createdAt: dateDaysAgo(alertSeeds.length - i),
    })),
  });

  await prisma.portalAction.createMany({
    data: actionSeeds.map((a, i) => ({
      dashboardId: dashboard.id,
      title: a.title,
      assignee: a.assignee,
      column: a.column,
      priority: a.priority,
      dueDate: dateDaysFromNow(a.due_days),
      sortOrder: i,
    })),
  });

  return dashboard;
}
