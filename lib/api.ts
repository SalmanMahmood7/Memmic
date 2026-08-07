const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const ACCESS_TOKEN_KEY = 'memmic_access_token';
const REFRESH_TOKEN_KEY = 'memmic_refresh_token';

function getStorage(rememberMe: boolean): Storage {
  if (typeof window === 'undefined') return localStorage;
  return rememberMe ? localStorage : sessionStorage;
}

function getStoredRefreshToken(rememberMe: boolean): string | null {
  if (typeof window === 'undefined') return null;
  return getStorage(rememberMe).getItem(REFRESH_TOKEN_KEY);
}

export function storeTokens(accessToken: string, refreshToken: string, rememberMe = true) {
  const storage = getStorage(rememberMe);
  storage.setItem(ACCESS_TOKEN_KEY, accessToken);
  storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  window.dispatchEvent(new CustomEvent('auth:tokens-updated', { detail: { accessToken } }));
}

export function clearStoredTokens(rememberMe = true) {
  const storage = getStorage(rememberMe);
  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
  window.dispatchEvent(new Event('auth:logout'));
}

// De-dupe concurrent refresh attempts if several requests 401 at the same time.
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  // Try to find refresh token in either storage
  const refreshToken = getStoredRefreshToken(true) || getStoredRefreshToken(false);
  if (!refreshToken) return null;

  // Determine which storage has the token
  const rememberMe = !!getStoredRefreshToken(true);

  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        storeTokens(data.access_token, data.refresh_token, rememberMe);
        return data.access_token as string;
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown) {
    // FastAPI validation errors return detail as an array of {msg, loc} objects
    const message = Array.isArray(detail)
      ? detail.map((d: { msg?: string }) => d.msg).join(', ')
      : typeof detail === 'string'
        ? detail
        : 'Something went wrong';
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
  _isRetry = false
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  // Access token expired mid-session: try a silent refresh and replay the request once.
  if (res.status === 401 && token && !_isRetry && !path.startsWith('/auth/')) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(path, options, newToken, true);
    }
    clearStoredTokens(true);
    clearStoredTokens(false);
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = 'Request failed';
    }
    throw new ApiError(res.status, (body as { detail?: unknown })?.detail ?? body);
  }

  // Some endpoints (e.g. health) may return no content
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

// ---- Auth ----

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role_id: number;
}

export interface UserMe{
  full_name: string;
  email: string;
  role: string;
}


export function registerUser(payload: RegisterPayload) {
  return request<{ message: string; user_id: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

interface ClientMessagePayload{
  full_name: string,
  email: string,
  whatyouneed: string,
  brief: string,
}

export interface ClientMessages{
  id: string,
  full_name: string,
  email: string,
  whatyouneed: string,
  brief: string,
  is_read: boolean,
  created_at: string,
}

export function sendClientMessage(payload: ClientMessagePayload){

  return request<{message: string}>('/client/contact-us', {

    method: 'POST',
    body: JSON.stringify(payload)
  })

}

export interface GeneralClientMessagePayload{
  full_name: string,
  email: string,
  brief: string,
}

export interface GeneralClientMessage{

  id: string,
  full_name: string,
  email: string,
  brief: string,
  is_read: boolean,
  created_at: string,

}
export function sendGeneralClientMessage(payload: GeneralClientMessagePayload){
  return request<{message: string}>('/client/general-contact-us', {

    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function listAllGeneralClientMessages(token: string,  params?: URLSearchParams){

  return request<GeneralClientMessage[]>(`/admin/client/general-messages?${params}`, {method: 'GET'}, token);
}

export function listClientContactMessages(
  token: string,
  params: { limit?: number; offset?: number; is_read?: boolean; search?: string } = {}
) {
  const qs = new URLSearchParams();
  if (params.limit) qs.append("limit", params.limit.toString());
  if (params.offset) qs.append("offset", params.offset.toString());
  if (params.is_read !== undefined) qs.append("is_read", params.is_read.toString());
  if (params.search) qs.append("search", params.search);
  const query = qs.toString() ? `?${qs}` : "";
  return request<ClientMessages[]>(`/admin/client/messages${query}`, { method: "GET" }, token);
}

export function getClientMessage(token: string, messageId: string){
  return request<ClientMessages>(`/admin/client/messages/${messageId}`, {method: 'GET'}, token);
}

export function markMessageAsRead(token: string, messageId: string){
  return request<ClientMessages>(`/admin/client/messages/${messageId}/read`, {method: 'PATCH'}, token);
}

export function deleteClientMessage(token: string, messageId: string){
  return request<{message: string}>(`/admin/client/messages/${messageId}`, {method: 'DELETE'}, token);
}

export function getUnreadMessagesCount(token: string){
  return request<{unread_count: number}>('/admin/client/messages/unread-count', {method: 'GET'}, token);
}


export function getGeneralClientMessage(){
  return request<GeneralClientMessage[]>('/admin/client/general-messages')
}


export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export function loginUser(email: string, password: string) {
  return request<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getUserProfile(token: string){
  return request<UserMe>('/admin/me', { method: 'GET' }, token);
}


export interface EnquiryCategory {
  id: string;
  form_type: string;
  name: string;
  description: string | null;
  is_active: number;
  created_at: string;
}
export function fetchAllEnquiryCategories(){
  return request<EnquiryCategory[]>('/admin/enquiry-categories/user', {method: 'GET'})
}

export interface EnquirySubmission {
  full_name: string;
  email: string;
  category_id: string;
  brief: string;
}

export function submitEnquiry(payload: EnquirySubmission){
  return request('/client/enquiry', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchAdminEnquiryCategories(token: string, params: URLSearchParams){
  return request<EnquiryCategory[]>(`/admin/enquiry-categories?${params}`, {method: 'GET'}, token)
}

export function fetchAdminEnquiryCategory(token: string, enquiry_category_id: string ){
  return request<EnquiryCategory>(`/admin/enquiry-categories/${enquiry_category_id}`, {method: 'GET'}, token)
}

export function updateAdminEnquiryCategory(
  token: string,
  enquiry_category_id: string,
  data: { name: string; description: string; is_active: number }
){
  return request<EnquiryCategory>(`/admin/enquiry-categories/${enquiry_category_id}`, {
    method: 'PATCH',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }, token)
}

export function deleteEnquiryCategory(token: string, enquiry_category_id: string){
  return request(`/admin/enquiry-categories/${enquiry_category_id}`, {method: 'DELETE'}, token);
}

interface EnquiryCategoryPayload{
  form_type: string;
  name: string;
  description: string;
  is_active: number;
}

export function createEnquiryCategory(token: string, payload: EnquiryCategoryPayload){
  return request('/admin/enquiry-categories', {method: 'POST', body: JSON.stringify(payload)}, token);
}

// ---- Client Enquiry Messages (approval workflow) ----

export interface ClientMessageRecord {
  id: string;
  full_name: string;
  email: string;
  category_id: string;
  brief: string;
  status: "pending" | "approved" | "rejected";
  is_read?: boolean;
  approved_at: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  generated_email: string | null;
  generated_password: string | null;
  credentials_sent_at: string | null;
  client_account_email: string | null;
  created_at: string;
}

export interface ClientMessagesStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  by_category: Record<string, { pending: number; approved: number; rejected: number }>;
}

export function listClientMessages(
  token: string,
  params: { status?: string; category_id?: string; limit?: number; offset?: number } = {}
) {
  const qs = new URLSearchParams();
  if (params.status) qs.append("status", params.status);
  if (params.category_id) qs.append("category_id", params.category_id);
  if (params.limit) qs.append("limit", params.limit.toString());
  if (params.offset) qs.append("offset", params.offset.toString());
  const query = qs.toString() ? `?${qs}` : "";
  return request<ClientMessageRecord[]>(`/admin/client-messages${query}`, { method: "GET" }, token);
}

export function getSingleClientMessage(token: string, messageId: string) {
  return request<ClientMessageRecord>(`/admin/client-messages/${messageId}`, { method: "GET" }, token);
}

export function approveClientMessage(token: string, messageId: string, sendCredentials = true) {
  return request<ClientMessageRecord>(
    `/admin/client-messages/${messageId}/approve`,
    { method: "POST", body: JSON.stringify({ send_credentials: sendCredentials }) },
    token
  );
}

export function rejectClientMessage(token: string, messageId: string, rejectionReason: string) {
  return request<ClientMessageRecord>(
    `/admin/client-messages/${messageId}/reject`,
    { method: "POST", body: JSON.stringify({ rejection_reason: rejectionReason }) },
    token
  );
}

export function getClientMessagesStats(token: string) {
  return request<ClientMessagesStats>("/admin/client-messages/stats/summary", { method: "GET" }, token);
}

export function markEnquiryAsRead(token: string, messageId: string) {
  return request<ClientMessageRecord>(`/admin/client-messages/${messageId}/read`, { method: "PATCH" }, token);
}

export function markGeneralMessageAsRead(token: string, messageId: string) {
  return request<GeneralClientMessage>(`/admin/client/general-messages/${messageId}/read`, { method: "PATCH" }, token);
}

export function markNotificationRead(token: string, notificationId: string) {
  return request<NotificationItem>(`/admin/notifications/${notificationId}/read`, { method: "PATCH" }, token);
}

// ---- Client Portal Accounts ----

export type PortalType = "evaluation" | "investment" | "marketplace" | "management";

export interface ClientAccount {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  client_message_id: string | null;
  created_at: string;
}

export interface ClientAccountsStats {
  total: number;
  active: number;
  blocked: number;
  by_portal: Record<string, { total: number; active: number; blocked: number }>;
}

export interface CreateClientAccountPayload {
  full_name: string;
  email: string;
  password: string;
  portal_type: PortalType;
  client_message_id?: string;
  send_welcome_email?: boolean;
}

export function listClientAccounts(
  token: string,
  params: { portal_type?: string; is_active?: boolean; search?: string; limit?: number; offset?: number } = {}
) {
  const qs = new URLSearchParams();
  if (params.portal_type) qs.append("portal_type", params.portal_type);
  if (params.is_active !== undefined) qs.append("is_active", params.is_active.toString());
  if (params.search) qs.append("search", params.search);
  if (params.limit) qs.append("limit", params.limit.toString());
  if (params.offset) qs.append("offset", params.offset.toString());
  const query = qs.toString() ? `?${qs}` : "";
  return request<ClientAccount[]>(`/admin/clients${query}`, { method: "GET" }, token);
}

export function getClientAccountsStats(token: string) {
  return request<ClientAccountsStats>("/admin/clients/stats/summary", { method: "GET" }, token);
}

export function createClientAccount(token: string, payload: CreateClientAccountPayload) {
  return request<ClientAccount>("/admin/clients", { method: "POST", body: JSON.stringify(payload) }, token);
}

export function blockClientAccount(token: string, clientId: string) {
  return request<ClientAccount>(`/admin/clients/${clientId}/block`, { method: "PATCH" }, token);
}

export function unblockClientAccount(token: string, clientId: string) {
  return request<ClientAccount>(`/admin/clients/${clientId}/unblock`, { method: "PATCH" }, token);
}

export function deleteClientAccount(token: string, clientId: string) {
  return request<{ message: string }>(`/admin/clients/${clientId}`, { method: "DELETE" }, token);
}

// ---- Client Portal ----

export interface PortalEnquiry {
  id: string;
  full_name: string;
  email: string;
  category_name: string;
  form_type: string;
  brief: string;
  status: string;
  rejection_reason: string | null;
  generated_email: string | null;
  credentials_sent_at: string | null;
  created_at: string;
}

export interface PortalProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  portal_type: string;
  is_active: boolean;
  created_at: string;
  enquiry: PortalEnquiry | null;
}

export function getClientPortalProfile(token: string) {
  return request<PortalProfile>("/client/portal/me", { method: "GET" }, token);
}

export interface PortalServiceItem {
  id: string;
  portal_type: string;
  category_name: string;
  brief: string;
  status: string;
  is_primary: boolean;
  health_score: number | null;
  rejection_reason: string | null;
  created_at: string | null;
}

export function getClientPortalServices(token: string) {
  return request<PortalServiceItem[]>("/client/portal/services", { method: "GET" }, token);
}

export function applyPortalService(
  token: string,
  payload: { full_name: string; email: string; category_id: string; brief: string }
) {
  return request<ClientMessageRecord>("/client/portal/enquiry", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

// ---- Notifications (unified feed) ----

export type NotificationType = "general" | "message" | "enquiry";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  full_name: string;
  email: string;
  brief: string;
  is_unread: boolean;
  status: string | null;
  category: string | null;
  created_at: string;
}

export interface NotificationFeed {
  items: NotificationItem[];
  total_unread: number;
}

export function getNotifications(token: string, limit = 20) {
  return request<NotificationFeed>(`/admin/notifications?limit=${limit}`, { method: "GET" }, token);
}

export function getNotificationsUnreadCount(token: string) {
  return request<{ unread_count: number }>("/admin/notifications/unread-count", { method: "GET" }, token);
}

// ---- Executive Client Portal Dashboard ----

export interface PortalStageItem {
  key: string;
  label: string;
  status: "completed" | "in_progress" | "pending";
  date: string | null;
}

export interface PortalHealth {
  score: number;
  components: Record<string, number>;
}

export interface PortalAlertItem {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface PortalActionItem {
  id: string;
  title: string;
  assignee: string;
  column: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  sort_order: number;
}

export interface PortalDashboard {
  health: PortalHealth;
  timeline: PortalStageItem[];
  alerts: PortalAlertItem[];
  actions: PortalActionItem[];
  evaluation: {
    valuations: { method: string; label: string; low: number; high: number; mid: number }[];
    risk_metrics: { key: string; label: string; value: number; target: number; unit: string; status: string }[];
    data_room: {
      total: number;
      reviewed: number;
      missing: number;
      approved: number;
      documents: { name: string; category: string; status: "reviewed" | "missing" | "approved" }[];
    };
  };
  management: {
    kpis: { key: string; label: string; unit: string; current: number; target: number; series: { x: string; y: number }[] }[];
    advisory_notes: { id: string; title: string; content: string; author: string; created_at: string }[];
  };
  marketplace: {
    listings: { title: string; category: string; status: string; views: number; inquiries: number; engagement_rate: number; listed_at: string }[];
    traffic: { date: string; views: number; inquiries: number; engagement: number }[];
    pipeline: { stage: string; value: number; amount: number; color: string }[];
  };
  investment: {
    funding: { goal: number; raised: number; currency: string; milestones: { label: string; amount: number; reached: boolean }[] };
    investor_matches: { name: string; type: string; industry: string; tier: string; interest: string; views: number; last_viewed: string }[];
    term_sheets: { title: string; structure: string; offer_type: string; amount: number; status: string; due_diligence: { item: string; status: string }[] }[];
  };
}

export function getPortalDashboard(token: string, portalType?: string) {
  const qs = portalType ? `?portal_type=${portalType}` : "";
  return request<PortalDashboard>(`/client/portal/dashboard${qs}`, { method: "GET" }, token);
}

export function markPortalAlertRead(token: string, alertId: string) {
  return request<PortalAlertItem>(`/client/portal/alerts/${alertId}/read`, { method: "PATCH" }, token);
}

export function movePortalAction(token: string, actionId: string, column: string) {
  return request<PortalActionItem>(`/client/portal/actions/${actionId}/move`, { method: "PATCH", body: JSON.stringify({ column }) }, token);
}

export function seedPortalDashboard(token: string) {
  return request<{ message: string; dashboard_id: string }>("/client/portal/dashboard/seed", { method: "POST" }, token);
}

export interface PortalMessageItem {
  id: string;
  sender: "client" | "firm";
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export function getPortalMessages(token: string) {
  return request<PortalMessageItem[]>("/client/portal/messages", { method: "GET" }, token);
}

export function sendPortalMessage(token: string, subject: string, body: string) {
  return request<PortalMessageItem>("/client/portal/messages", { method: "POST", body: JSON.stringify({ subject, body }) }, token);
}

export function markPortalMessageRead(token: string, messageId: string) {
  return request<PortalMessageItem>(`/client/portal/messages/${messageId}/read`, { method: "PATCH" }, token);
}

export function updatePortalProfile(token: string, payload: { full_name?: string; password?: string }) {
  return request<{ full_name: string; email: string; role: string }>("/client/portal/me", { method: "PATCH", body: JSON.stringify(payload) }, token);
}

// ---- Admin: Client Portal Management (sync) ----

export interface AdminPortalDashboardItem {
  client_id: string;
  full_name: string;
  email: string;
  role: string;
  portal_type: string;
  is_active: boolean;
  health_score: number;
  health_components: Record<string, number>;
  updated_at: string | null;
}

export interface AdminPortalDashboardDetail {
  client: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    portal_type: string;
    is_active: boolean;
  };
  health: PortalHealth;
  timeline: PortalStageItem[];
  alerts: PortalAlertItem[];
  actions: PortalActionItem[];
  messages: PortalMessageItem[];
  evaluation: PortalDashboard["evaluation"];
  management: PortalDashboard["management"];
  marketplace: PortalDashboard["marketplace"];
  investment: PortalDashboard["investment"];
}

export function listAdminPortalDashboards(token: string, params: { portal_type?: string; search?: string; limit?: number; offset?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.portal_type) qs.append("portal_type", params.portal_type);
  if (params.search) qs.append("search", params.search);
  if (params.limit) qs.append("limit", String(params.limit));
  if (params.offset) qs.append("offset", String(params.offset));
  const query = qs.toString();
  return request<AdminPortalDashboardItem[]>(`/admin/portal/dashboards${query ? `?${query}` : ""}`, { method: "GET" }, token);
}

export function getAdminPortalDashboard(token: string, clientId: string) {
  return request<AdminPortalDashboardDetail>(`/admin/portal/dashboards/${clientId}`, { method: "GET" }, token);
}

export function sendAdminPortalMessage(token: string, clientId: string, subject: string, body: string) {
  return request<PortalMessageItem>(
    "/admin/portal/messages",
    { method: "POST", body: JSON.stringify({ client_id: clientId, subject, body }) },
    token
  );
}

export function updateAdminDashboardHealth(token: string, clientId: string, score: number, components?: Record<string, number>) {
  return request<{ client_id: string; health_score: number; health_components: Record<string, number> }>(
    `/admin/portal/dashboards/${clientId}/health`,
    { method: "PATCH", body: JSON.stringify({ score, components }) },
    token
  );
}

export function seedAdminPortalDashboard(token: string, clientId: string) {
  return request<{ message: string; client_id: string }>(`/admin/portal/dashboards/${clientId}/seed`, { method: "POST" }, token);
}

// ---- Admin: Dashboard content management (timeline / alerts / actions) ----

export function updateAdminTimeline(
  token: string,
  clientId: string,
  stages: { key: string; label: string; status: string; date: string | null }[]
) {
  return request<{ timeline: PortalStageItem[] }>(
    `/admin/portal/dashboards/${clientId}/timeline`,
    { method: "PUT", body: JSON.stringify(stages) },
    token
  );
}

export function updateAdminTimelineStage(
  token: string,
  clientId: string,
  stageKey: string,
  patch: { label?: string; status?: string; date?: string }
) {
  return request<{ timeline: PortalStageItem[] }>(
    `/admin/portal/dashboards/${clientId}/timeline/${stageKey}`,
    { method: "PATCH", body: JSON.stringify(patch) },
    token
  );
}

export function createAdminAlert(
  token: string,
  clientId: string,
  payload: { severity: string; title: string; message: string }
) {
  return request<PortalAlertItem>(`/admin/portal/dashboards/${clientId}/alerts`, { method: "POST", body: JSON.stringify(payload) }, token);
}

export function updateAdminAlert(
  token: string,
  clientId: string,
  alertId: string,
  patch: { severity?: string; title?: string; message?: string }
) {
  return request<PortalAlertItem>(
    `/admin/portal/dashboards/${clientId}/alerts/${alertId}`,
    { method: "PATCH", body: JSON.stringify(patch) },
    token
  );
}

export function deleteAdminAlert(token: string, clientId: string, alertId: string) {
  return request<{ message: string; alert_id: string }>(
    `/admin/portal/dashboards/${clientId}/alerts/${alertId}`,
    { method: "DELETE" },
    token
  );
}

export function createAdminAction(
  token: string,
  clientId: string,
  payload: { title: string; assignee: string; column: string; priority: string; due_date?: string | null }
) {
  return request<PortalActionItem>(`/admin/portal/dashboards/${clientId}/actions`, { method: "POST", body: JSON.stringify(payload) }, token);
}

export function updateAdminAction(
  token: string,
  clientId: string,
  actionId: string,
  patch: { title?: string; assignee?: string; column?: string; priority?: string; due_date?: string | null }
) {
  return request<PortalActionItem>(
    `/admin/portal/dashboards/${clientId}/actions/${actionId}`,
    { method: "PATCH", body: JSON.stringify(patch) },
    token
  );
}

export function deleteAdminAction(token: string, clientId: string, actionId: string) {
  return request<{ message: string; action_id: string }>(
    `/admin/portal/dashboards/${clientId}/actions/${actionId}`,
    { method: "DELETE" },
    token
  );
}

// ---- Admin: Dashboard Overview (live analytics) ----

export interface AdminDashboardOverview {
  clients: { total: number; active: number; blocked: number };
  enquiries: { total: number; pending: number; approved: number; rejected: number };
  by_portal: Record<string, { clients: number; services: number; avg_health: number }>;
  activity: {
    type: "enquiry" | "portal_message" | "log";
    title: string;
    detail: string;
    status: string;
    created_at: string | null;
  }[];
}

export function getAdminDashboardOverview(token: string) {
  return request<AdminDashboardOverview>("/admin/dashboard/overview", { method: "GET" }, token);
}

// ---- Admin: Client Service Management (multi-service) ----

export function listClientServices(token: string, clientId: string) {
  return request<PortalServiceItem[]>(`/admin/clients/${clientId}/services`, { method: "GET" }, token);
}

export function addClientService(token: string, clientId: string, clientMessageId: string) {
  return request<{ message: string; client_message_id: string }>(
    `/admin/clients/${clientId}/services`,
    { method: "POST", body: JSON.stringify({ client_message_id: clientMessageId }) },
    token
  );
}

export function removeClientService(token: string, clientId: string, enquiryId: string) {
  return request<{ message: string }>(
    `/admin/clients/${clientId}/services/${enquiryId}`,
    { method: "DELETE" },
    token
  );
}