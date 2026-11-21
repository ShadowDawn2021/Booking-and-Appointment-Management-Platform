import { DateTime } from "luxon";
import type { Prisma } from "../generated/prisma/client.js";
import { isBookingOverlapError } from "../utils/dbErrors.js";
import { HttpError } from "../utils/httpError.js";
import { prisma } from "../utils/prismaClient.js";
import type {
  CreateBookingInput,
  ListBookingsQuery,
} from "../utils/validation.js";
import type { AuthTokenPayload } from "./authServices.js";
import { getAvailableSlots } from "./slotServices.js";

const bookingInclude = {
  service: {
    select: { id: true, name: true, durationMinutes: true, price: true },
  },
  provider: {
    select: { id: true, businessName: true, slug: true, timezone: true },
  },
  customer: { select: { id: true, name: true, email: true } },
} as const;

export type BookingView = Prisma.BookingGetPayload<{
  include: typeof bookingInclude;
}>;

export async function createBooking(
  customerId: string,
  input: CreateBookingInput,
): Promise<BookingView> {
  const provider = await prisma.provider.findUnique({
    where: { slug: input.providerSlug },
    select: { id: true, timezone: true },
  });
  if (!provider) {
    throw new HttpError(404, "Provider not found");
  }

  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, providerId: provider.id },
    select: { durationMinutes: true },
  });
  if (!service) {
    throw new HttpError(404, "Service not found");
  }

  const startTime = new Date(input.startTime);
  const localDate = DateTime.fromJSDate(startTime, {
    zone: provider.timezone,
  }).toISODate();
  if (!localDate) {
    throw new HttpError(400, "Invalid start time");
  }

  const { slots } = await getAvailableSlots(input.providerSlug, {
    date: localDate,
    serviceId: input.serviceId,
  });
  const isOfferedSlot = slots.some(
    (slot) => new Date(slot.start).getTime() === startTime.getTime(),
  );
  if (!isOfferedSlot) {
    throw new HttpError(
      409,
      "That time is not available. Please pick another slot.",
    );
  }

  const endTime = new Date(
    startTime.getTime() + service.durationMinutes * 60_000,
  );

  try {
    return await prisma.booking.create({
      data: {
        providerId: provider.id,
        serviceId: input.serviceId,
        customerId,
        startTime,
        endTime,
      },
      include: bookingInclude,
    });
  } catch (error) {
    if (isBookingOverlapError(error)) {
      throw new HttpError(
        409,
        "That time was just booked. Please pick another slot.",
      );
    }
    throw error;
  }
}

export function listBookings(
  auth: AuthTokenPayload,
  query: ListBookingsQuery,
): Promise<BookingView[]> {
  const ownerFilter: Prisma.BookingWhereInput =
    auth.role === "PROVIDER"
      ? { provider: { userId: auth.userId } }
      : { customerId: auth.userId };

  const now = new Date();
  const timeFilter: Prisma.BookingWhereInput =
    query.scope === "upcoming"
      ? { endTime: { gt: now } }
      : query.scope === "past"
        ? { endTime: { lte: now } }
        : {};

  return prisma.booking.findMany({
    where: { ...ownerFilter, ...timeFilter },
    include: bookingInclude,
    orderBy: { startTime: query.scope === "past" ? "desc" : "asc" },
    take: 200,
  });
}

export async function cancelBooking(
  auth: AuthTokenPayload,
  bookingId: string,
): Promise<BookingView> {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      OR: [{ customerId: auth.userId }, { provider: { userId: auth.userId } }],
    },
    select: { id: true, status: true, startTime: true },
  });
  if (!booking) {
    throw new HttpError(404, "Booking not found");
  }
  if (booking.status === "CANCELLED") {
    throw new HttpError(409, "Booking is already cancelled");
  }
  if (booking.startTime <= new Date()) {
    throw new HttpError(409, "Past bookings cannot be cancelled");
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
    include: bookingInclude,
  });
}
