import { z } from "zod";

export const ContactSubmissionRequestSchema = z.object({
  full_name: z.string().min(5).max(50),
  email: z.string().email(),
  category_id: z.string().uuid(),
  brief: z.string().min(8).max(500),
});
export type ContactSubmissionRequest = z.infer<typeof ContactSubmissionRequestSchema>;

export const EnquirySubmissionRequestSchema = ContactSubmissionRequestSchema.extend({
  applicant_type: z.enum(["COMPANY", "INDIVIDUAL", "INVESTOR", "OTHER"]),
  related_category: z.string().min(1).max(100),
  company_name: z.string().min(1).max(150),
});
export type EnquirySubmissionRequest = z.infer<typeof EnquirySubmissionRequestSchema>;

export const GeneralContactSubmissionRequestSchema = z.object({
  full_name: z.string().min(5).max(50),
  email: z.string().email(),
  brief: z.string().min(8).max(500),
});
export type GeneralContactSubmissionRequest = z.infer<typeof GeneralContactSubmissionRequestSchema>;
