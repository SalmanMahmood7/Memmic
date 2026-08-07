import { z } from "zod";

export const ClientAccountCreateSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  portal_type: z.string(),
  client_message_id: z.string().uuid().optional().nullable(),
  send_welcome_email: z.boolean().default(false),
});
export type ClientAccountCreate = z.infer<typeof ClientAccountCreateSchema>;

export const ClientAccountUpdateSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).max(100).optional(),
  is_active: z.boolean().optional(),
});
export type ClientAccountUpdate = z.infer<typeof ClientAccountUpdateSchema>;
