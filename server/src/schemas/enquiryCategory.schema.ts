import { z } from "zod";

export const EnquiryCategoryCreateSchema = z.object({
  form_type: z.enum(["evaluation", "management", "marketplace", "investment"]),
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  is_active: z.number().int().default(1),
});
export type EnquiryCategoryCreate = z.infer<typeof EnquiryCategoryCreateSchema>;

export const EnquiryCategoryUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional().nullable(),
  is_active: z.number().int().optional(),
});
export type EnquiryCategoryUpdate = z.infer<typeof EnquiryCategoryUpdateSchema>;
