import { z } from "zod";

export const ClientMessageApproveSchema = z.object({
  send_credentials: z.boolean().default(true),
});
export type ClientMessageApprove = z.infer<typeof ClientMessageApproveSchema>;

export const ClientMessageRejectSchema = z.object({
  rejection_reason: z.string().min(5).max(500),
});
export type ClientMessageReject = z.infer<typeof ClientMessageRejectSchema>;
