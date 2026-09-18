import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const googleSchema = z.object({
  name: z.string().min(2).default("Aaraav Sharma"),
  email: z.string().email().default("aaraav.sharma@example.com"),
});
export type GoogleInput = z.infer<typeof googleSchema>;

export const preferencesSchema = z.object({
  profession: z.string().min(1).optional(),
  niches: z.array(z.string()).optional(),
  voice: z.string().optional(),
});
export type PreferencesInput = z.infer<typeof preferencesSchema>;
