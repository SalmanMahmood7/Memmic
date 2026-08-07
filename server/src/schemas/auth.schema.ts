import { z } from "zod";

export const RegisterRequestSchema = z.object({
  full_name: z.string().min(5).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(50),
  role_id: z.number().int(),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(72),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RefreshRequestSchema = z.object({
  refresh_token: z.string(),
});
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;
