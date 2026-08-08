import { z } from "zod";

export const ClientMessageApproveSchema = z.object({
  send_credentials: z.boolean().default(true),
});
export type ClientMessageApprove = z.infer<typeof ClientMessageApproveSchema>;

export const ClientMessageRejectSchema = z.object({
  rejection_reason: z.string().min(5).max(500),
});
export type ClientMessageReject = z.infer<typeof ClientMessageRejectSchema>;

export const ClientMessageCredentialsUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).max(100).optional(),
});
export type ClientMessageCredentialsUpdate = z.infer<typeof ClientMessageCredentialsUpdateSchema>;
