// src/utils/validation.ts
import { z } from "zod";
import { DateTime } from "luxon";

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

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm (24-hour)");

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .refine(
    (value) => DateTime.fromISO(value, { zone: "utc" }).isValid,
    "Invalid calendar date",
  );

const weeklyWindowSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6), // 0 = Sunday
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine((window) => window.startTime < window.endTime, {
    message: "startTime must be before endTime",
    path: ["endTime"],
  });

export const weeklyAvailabilitySchema = z
  .object({ windows: z.array(weeklyWindowSchema).max(70) })
  .superRefine((data, ctx) => {
    const sorted = data.windows
      .map((window, index) => ({ window, index }))
      .sort(
        (a, b) =>
          a.window.dayOfWeek - b.window.dayOfWeek ||
          a.window.startTime.localeCompare(b.window.startTime),
      );

    let previous: (typeof sorted)[number] | undefined;
    for (const current of sorted) {
      if (
        previous &&
        previous.window.dayOfWeek === current.window.dayOfWeek &&
        current.window.startTime < previous.window.endTime
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Windows on the same day must not overlap",
          path: ["windows", current.index, "startTime"],
        });
      }
      previous = current;
    }
  });

export const exceptionSchema = z
  .object({
    date: dateSchema,
    isClosed: z.boolean(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isClosed) {
      if (data.startTime !== undefined || data.endTime !== undefined) {
        ctx.addIssue({
          code: "custom",
          message: "Closed days cannot have custom hours",
          path: ["isClosed"],
        });
      }
      return;
    }
    if (data.startTime === undefined || data.endTime === undefined) {
      ctx.addIssue({
        code: "custom",
        message:
          "startTime and endTime are required when the day is not closed",
        path: ["startTime"],
      });
      return;
    }
    if (data.startTime >= data.endTime) {
      ctx.addIssue({
        code: "custom",
        message: "startTime must be before endTime",
        path: ["endTime"],
      });
    }
  });

export const slotsQuerySchema = z.object({
  date: dateSchema,
  serviceId: z.string().uuid(),
});

export type WeeklyAvailabilityInput = z.infer<typeof weeklyAvailabilitySchema>;
export type ExceptionInput = z.infer<typeof exceptionSchema>;
export type SlotsQuery = z.infer<typeof slotsQuerySchema>;

export const createBookingSchema = z.object({
  providerSlug: z.string().trim().toLowerCase().min(1).max(50),
  serviceId: z.string().uuid(),
  startTime: z.string().datetime({ offset: true }),
});

export const listBookingsQuerySchema = z.object({
  scope: z.enum(["upcoming", "past", "all"]).default("upcoming"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
