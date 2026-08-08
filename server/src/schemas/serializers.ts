import {
  ContactUs,
  GeneralContactUs,
  ClientMessage,
  EnquiryCategory,
  User,
  Role,
  SystemLog,
  PortalAlert,
  PortalAction,
  PortalMessage,
  PortalDashboard,
  UserService,
} from "@prisma/client";

// ---- Contact / general messages (legacy ContactUs + GeneralContactUs tables) ----

export function serializeContactMessage(m: ContactUs) {
  return {
    id: m.id,
    full_name: m.fullName,
    email: m.email,
    whatyouneed: m.whatyouneed,
    brief: m.brief,
    is_read: m.isRead,
    created_at: m.createdAt,
  };
}

export function serializeGeneralMessage(m: GeneralContactUs) {
  return {
    id: m.id,
    full_name: m.fullName,
    email: m.email,
    brief: m.brief,
    is_read: m.isRead,
    created_at: m.createdAt,
  };
}

// ---- Enquiry (ClientMessage) ----

export function serializeEnquiry(m: ClientMessage & { clientAccountEmail?: string | null }) {
  return {
    id: m.id,
    full_name: m.fullName,
    email: m.email,
    category_id: m.categoryId,
    brief: m.brief,
    applicant_type: m.applicantType,
    related_category: m.relatedCategory,
    company_name: m.companyName,
    status: m.status,
    is_read: m.isRead,
    approved_at: m.approvedAt,
    approved_by: m.approvedBy,
    rejection_reason: m.rejectionReason,
    generated_email: m.generatedEmail,
    generated_password: m.generatedPassword,
    credentials_sent_at: m.credentialsSentAt,
    client_account_email: m.clientAccountEmail ?? null,
    created_at: m.createdAt,
  };
}

export function serializeEnquiryCategory(c: EnquiryCategory) {
  return {
    id: c.id,
    form_type: c.formType,
    name: c.name,
    description: c.description,
    is_active: c.isActive,
    created_at: c.createdAt,
  };
}

// ---- Client accounts (Users with a portal role) ----

export function serializeClientAccount(u: User & { role: Role }) {
  return {
    id: u.id,
    full_name: u.fullName,
    email: u.email,
    role: u.role.name,
    is_active: u.isActive,
    client_message_id: u.clientMessageId,
    created_at: u.createdAt,
  };
}

export function serializeUserMe(u: User & { role: Role }) {
  return {
    full_name: u.fullName,
    email: u.email,
    role: u.role.name,
  };
}

// ---- System logs ----

export function serializeSystemLog(l: SystemLog) {
  return {
    id: l.id,
    level: l.level,
    message: l.message,
    source: l.source,
    user_id: l.userId,
    ip_address: l.ipAddress,
    user_agent: l.userAgent,
    metadata: l.logMetadata,
    created_at: l.createdAt,
  };
}

// ---- Notifications ----

export interface NotificationItem {
  id: string;
  type: "general" | "message" | "enquiry";
  full_name: string;
  email: string;
  brief: string;
  is_unread: boolean;
  status?: string | null;
  category?: string | null;
  created_at: Date;
}

// ---- Portal ----

export function serializePortalAlert(a: PortalAlert) {
  return {
    id: a.id,
    severity: a.severity,
    title: a.title,
    message: a.message,
    is_read: a.isRead,
    created_at: a.createdAt,
  };
}

export function serializePortalAction(a: PortalAction) {
  return {
    id: a.id,
    title: a.title,
    assignee: a.assignee,
    column: a.column,
    priority: a.priority,
    due_date: a.dueDate,
    sort_order: a.sortOrder,
  };
}

export function serializePortalMessage(m: PortalMessage) {
  return {
    id: m.id,
    sender: m.sender,
    subject: m.subject,
    body: m.body,
    is_read: m.isRead,
    created_at: m.createdAt,
  };
}

export function serializePortalDashboardOut(
  dashboard: PortalDashboard,
  alerts: PortalAlert[],
  actions: PortalAction[]
) {
  return {
    health: { score: dashboard.healthScore, components: dashboard.healthComponents ?? {} },
    timeline: dashboard.timeline ?? [],
    alerts: alerts.map(serializePortalAlert),
    actions: actions.map(serializePortalAction),
    evaluation: dashboard.evaluationData ?? {},
    management: dashboard.managementData ?? {},
    marketplace: dashboard.marketplaceData ?? {},
    investment: dashboard.investmentData ?? {},
  };
}

export function serializePortalEnquiry(enquiry: ClientMessage, category: EnquiryCategory | null, portalType: string) {
  return {
    id: enquiry.id,
    full_name: enquiry.fullName,
    email: enquiry.email,
    category_name: category ? category.name : "",
    form_type: category ? category.formType : portalType,
    brief: enquiry.brief,
    status: enquiry.status,
    rejection_reason: enquiry.rejectionReason,
    generated_email: enquiry.generatedEmail,
    credentials_sent_at: enquiry.credentialsSentAt,
    created_at: enquiry.createdAt,
  };
}

export function serializePortalProfile(
  user: User & { role: Role },
  portalType: string,
  enquiry: ReturnType<typeof serializePortalEnquiry> | null
) {
  return {
    id: user.id,
    full_name: user.fullName,
    email: user.email,
    role: user.role.name,
    portal_type: portalType,
    is_active: user.isActive,
    created_at: user.createdAt,
    enquiry,
  };
}

export function serviceEntry(
  enquiry: ClientMessage,
  category: EnquiryCategory,
  dashboard: PortalDashboard | undefined,
  isPrimary: boolean,
  extra: Record<string, unknown> = {}
) {
  return {
    id: enquiry.id,
    portal_type: category.formType,
    category_name: category.name,
    brief: enquiry.brief,
    status: enquiry.status,
    is_primary: isPrimary,
    health_score: dashboard ? dashboard.healthScore : null,
    created_at: enquiry.createdAt,
    ...extra,
  };
}

export type { UserService };
