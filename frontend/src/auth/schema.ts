import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(72, "Use at most 72 characters"),
  role: z.enum(["CUSTOMER", "PROVIDER"]),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
