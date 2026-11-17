import type {
  Availability,
  AvailabilityException,
} from "../generated/prisma/client.js";

import { dateToUtcMidnight } from "../utils/dates.js";
import { HttpError } from "../utils/httpError.js";
import { prisma } from "../utils/prismaClient.js";
import type {
  ExceptionInput,
  WeeklyAvailabilityInput,
} from "../utils/validation.js";

export interface AvailabilitySnapshot {
  windows: Availability[];
  exceptions: AvailabilityException[];
}

function listWindows(providerId: string): Promise<Availability[]> {
  return prisma.availability.findMany({
    where: { providerId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

export async function getAvailability(
  providerId: string,
): Promise<AvailabilitySnapshot> {
  const [windows, exceptions] = await Promise.all([
    listWindows(providerId),
    prisma.availabilityException.findMany({
      where: { providerId },
      orderBy: { date: "asc" },
    }),
  ]);
  return { windows, exceptions };
}

export async function replaceWeeklyAvailability(
  providerId: string,
  input: WeeklyAvailabilityInput,
): Promise<Availability[]> {
  await prisma.$transaction([
    prisma.availability.deleteMany({ where: { providerId } }),
    prisma.availability.createMany({
      data: input.windows.map((window) => ({
        providerId,
        dayOfWeek: window.dayOfWeek,
        startTime: window.startTime,
        endTime: window.endTime,
      })),
    }),
  ]);
  return listWindows(providerId);
}

export function upsertException(
  providerId: string,
  input: ExceptionInput,
): Promise<AvailabilityException> {
  const date = dateToUtcMidnight(input.date);
  const data = {
    isClosed: input.isClosed,
    startTime: input.isClosed ? null : (input.startTime ?? null),
    endTime: input.isClosed ? null : (input.endTime ?? null),
  };
  return prisma.availabilityException.upsert({
    where: { providerId_date: { providerId, date } },
    create: { providerId, date, ...data },
    update: data,
  });
}

export async function deleteException(
  providerId: string,
  exceptionId: string,
): Promise<void> {
  const exception = await prisma.availabilityException.findFirst({
    where: { id: exceptionId, providerId },
    select: { id: true },
  });
  if (!exception) {
    throw new HttpError(404, "Exception not found");
  }
  await prisma.availabilityException.delete({ where: { id: exceptionId } });
}
