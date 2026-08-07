import { z } from "zod";

export const SystemLogCreateSchema = z.object({
  level: z.string(),
  message: z.string(),
  source: z.string(),
  user_id: z.string().uuid().optional().nullable(),
  ip_address: z.string().optional().nullable(),
  user_agent: z.string().optional().nullable(),
  metadata: z.string().optional().nullable(),
});
export type SystemLogCreate = z.infer<typeof SystemLogCreateSchema>;
