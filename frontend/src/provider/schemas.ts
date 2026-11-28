import { z } from "zod";
import { isValidTimezone } from "../lib/timezones";

export const providerProfileSchema = z.object({
  businessName: z.string().trim().min(2, "Use at least 2 characters").max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Use at least 3 characters")
    .max(50)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Lowercase letters, numbers, and single hyphens only",
    ),
  timezone: z.string().refine(isValidTimezone, "Pick a valid timezone"),
});

export type ProviderProfileForm = z.infer<typeof providerProfileSchema>;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, 50)
    .replace(/-+$/, "");
}
