import { DateTime } from "luxon";
import type { AvailabilityException } from "../generated/prisma/client.js";
import { dateToUtcMidnight } from "../utils/dates.js";
import { HttpError } from "../utils/httpError.js";
import { prisma } from "../utils/prismaClient.js";
import { generateSlots, type TimeWindow } from "../utils/slotGenerator.js";
import type { SlotsQuery } from "../utils/validation.js";

const SLOT_STEP_MINUTES = 30;
const MIN_NOTICE_MINUTES = 60;
const MAX_ADVANCE_DAYS = 90;

export interface SlotsResponse {
  date: string;
  timezone: string;
  durationMinutes: number;
  slots: { start: string; end: string }[];
}

function exceptionWindows(exception: AvailabilityException): TimeWindow[] {
  if (exception.isClosed || !exception.startTime || !exception.endTime) {
    return [];
  }
  return [{ startTime: exception.startTime, endTime: exception.endTime }];
}

export async function getAvailableSlots(
  slug: string,
  query: SlotsQuery,
): Promise<SlotsResponse> {
  const provider = await prisma.provider.findUnique({
    where: { slug },
    select: { id: true, timezone: true },
  });
  if (!provider) {
    throw new HttpError(404, "Provider not found");
  }

  const service = await prisma.service.findFirst({
    where: { id: query.serviceId, providerId: provider.id },
    select: { durationMinutes: true },
  });
  if (!service) {
    throw new HttpError(404, "Service not found");
  }

  const dayStart = DateTime.fromISO(query.date, {
    zone: provider.timezone,
  }).startOf("day");
  if (!dayStart.isValid) {
    throw new HttpError(500, "Provider timezone is invalid");
  }
  const today = DateTime.now().setZone(provider.timezone).startOf("day");
  if (dayStart.toMillis() < today.toMillis()) {
    throw new HttpError(400, "Date is in the past");
  }
  if (dayStart.toMillis() > today.plus({ days: MAX_ADVANCE_DAYS }).toMillis()) {
    throw new HttpError(
      400,
      `Bookings open at most ${MAX_ADVANCE_DAYS} days ahead`,
    );
  }

  const dayEnd = dayStart.plus({ days: 1 }).startOf("day"); // DST-safe: 23h or 25h days work
  const dayOfWeek = dayStart.weekday % 7; // Luxon: Mon=1..Sun=7 -> schema: Sun=0..Sat=6

  const exception = await prisma.availabilityException.findUnique({
    where: {
      providerId_date: {
        providerId: provider.id,
        date: dateToUtcMidnight(query.date),
      },
    },
  });

  const [windows, bookings] = await Promise.all([
    exception
      ? Promise.resolve(exceptionWindows(exception))
      : prisma.availability.findMany({
          where: { providerId: provider.id, dayOfWeek },
          select: { startTime: true, endTime: true },
        }),
    prisma.booking.findMany({
      where: {
        providerId: provider.id,
        status: { not: "CANCELLED" },
        startTime: { lt: dayEnd.toJSDate() },
        endTime: { gt: dayStart.toJSDate() },
      },
      select: { startTime: true, endTime: true },
    }),
  ]);

  const slots = generateSlots({
    date: query.date,
    timezone: provider.timezone,
    windows,
    durationMinutes: service.durationMinutes,
    stepMinutes: SLOT_STEP_MINUTES,
    busy: bookings.map((booking) => ({
      start: booking.startTime,
      end: booking.endTime,
    })),
    earliestStart: new Date(Date.now() + MIN_NOTICE_MINUTES * 60_000),
  });

  return {
    date: query.date,
    timezone: provider.timezone,
    durationMinutes: service.durationMinutes,
    slots: slots.map((slot) => ({
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
    })),
  };
}
