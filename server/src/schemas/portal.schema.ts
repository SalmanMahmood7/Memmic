import { z } from "zod";

export const PortalActionMoveSchema = z.object({
  column: z.string(),
});
export type PortalActionMove = z.infer<typeof PortalActionMoveSchema>;

export const PortalMessageCreateSchema = z.object({
  subject: z.string(),
  body: z.string(),
});
export type PortalMessageCreate = z.infer<typeof PortalMessageCreateSchema>;

export const PortalProfileUpdateSchema = z.object({
  full_name: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
});
export type PortalProfileUpdate = z.infer<typeof PortalProfileUpdateSchema>;

export const AdminProfileUpdateSchema = z.object({
  full_name: z.string().min(2).optional().nullable(),
  email: z.string().email().optional().nullable(),
  password: z.string().min(8).optional().nullable(),
});
export type AdminProfileUpdate = z.infer<typeof AdminProfileUpdateSchema>;

export const AdminPortalMessageCreateSchema = z.object({
  client_id: z.string().uuid(),
  subject: z.string(),
  body: z.string(),
});
export type AdminPortalMessageCreate = z.infer<typeof AdminPortalMessageCreateSchema>;

export const AdminDashboardHealthUpdateSchema = z.object({
  score: z.number().int(),
  components: z.record(z.string(), z.unknown()).optional().nullable(),
});
export type AdminDashboardHealthUpdate = z.infer<typeof AdminDashboardHealthUpdateSchema>;

export const PortalStageUpsertSchema = z.object({
  key: z.string(),
  label: z.string(),
  status: z.string().default("pending"),
  date: z.string().optional().nullable(),
});
export type PortalStageUpsert = z.infer<typeof PortalStageUpsertSchema>;
export const PortalStageUpsertListSchema = z.array(PortalStageUpsertSchema);

export const PortalStageUpdateSchema = z.object({
  label: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
});
export type PortalStageUpdate = z.infer<typeof PortalStageUpdateSchema>;

export const PortalAlertCreateSchema = z.object({
  severity: z.string().default("info"),
  title: z.string(),
  message: z.string().default(""),
});
export type PortalAlertCreate = z.infer<typeof PortalAlertCreateSchema>;

export const PortalAlertUpdateSchema = z.object({
  severity: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
});
export type PortalAlertUpdate = z.infer<typeof PortalAlertUpdateSchema>;

export const PortalActionCreateSchema = z.object({
  title: z.string(),
  assignee: z.string().default(""),
  column: z.string().default("todo"),
  priority: z.string().default("medium"),
  due_date: z.coerce.date().optional().nullable(),
});
export type PortalActionCreate = z.infer<typeof PortalActionCreateSchema>;

export const PortalActionUpdateSchema = z.object({
  title: z.string().optional().nullable(),
  assignee: z.string().optional().nullable(),
  column: z.string().optional().nullable(),
  priority: z.string().optional().nullable(),
  due_date: z.coerce.date().optional().nullable(),
});
export type PortalActionUpdate = z.infer<typeof PortalActionUpdateSchema>;
