// src/utils/validation.ts
import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72), // bcrypt ignores bytes past 72
  name: z.string().trim().min(1).max(100),
  role: z.enum(["PROVIDER", "CUSTOMER"]),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isValidTimezone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function hasAtMostTwoDecimals(value: number): boolean {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;
}

export const createProviderSchema = z.object({
  businessName: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(50)
    .regex(slugPattern, "Use lowercase letters, numbers and single hyphens"),
  timezone: z.string().refine(isValidTimezone, "Invalid IANA timezone"),
});

export const updateProviderSchema = createProviderSchema
  .omit({ slug: true })
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

export const serviceSchema = z.object({
  name: z.string().trim().min(2).max(100),
  durationMinutes: z.number().int().min(5).max(480),
  price: z
    .number()
    .min(0)
    .max(100000)
    .refine(hasAtMostTwoDecimals, "Max 2 decimal places"),
});

export const updateServiceSchema = serviceSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

export const idParamSchema = z.object({ id: z.string().uuid() });
export const slugParamSchema = z.object({
  slug: z.string().trim().toLowerCase().min(1).max(50),
});

export type CreateProviderInput = z.infer<typeof createProviderSchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
