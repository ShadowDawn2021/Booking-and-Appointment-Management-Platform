import {
  renderBookingEmail,
  type BookingEmailData,
  type BookingEmailKind,
  type CancelledBy,
} from "../email/bookingEmailTemplates.js";
import type { EmailMessage } from "../email/emailSender.js";
import { emailSender } from "../email/index.js";
import { prisma } from "../utils/prismaClient.js";

interface NotificationContext {
  data: BookingEmailData;
  customerEmail: string;
  providerEmail: string;
}

async function loadContext(bookingId: string): Promise<NotificationContext> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { name: true, durationMinutes: true } },
      customer: { select: { name: true, email: true } },
      provider: {
        select: {
          businessName: true,
          timezone: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found for notification`);
  }

  return {
    data: {
      businessName: booking.provider.businessName,
      providerName: booking.provider.user.name,
      customerName: booking.customer.name,
      serviceName: booking.service.name,
      durationMinutes: booking.service.durationMinutes,
      startTime: booking.startTime,
      timezone: booking.provider.timezone,
    },
    customerEmail: booking.customer.email,
    providerEmail: booking.provider.user.email,
  };
}

function buildMessages(
  kind: BookingEmailKind,
  context: NotificationContext,
  cancelledBy: CancelledBy = "CUSTOMER",
): EmailMessage[] {
  return [
    {
      to: context.customerEmail,
      ...renderBookingEmail(kind, "customer", context.data, cancelledBy),
    },
    {
      to: context.providerEmail,
      ...renderBookingEmail(kind, "provider", context.data, cancelledBy),
    },
  ];
}

async function deliver(messages: EmailMessage[]): Promise<void> {
  const results = await Promise.allSettled(
    messages.map((message) => emailSender.send(message)),
  );
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `[email] failed to send "${messages[index]?.subject ?? "unknown"}"`,
        result.reason,
      );
    }
  });
}

export async function notifyBookingCreated(bookingId: string): Promise<void> {
  await deliver(buildMessages("confirmed", await loadContext(bookingId)));
}

export async function notifyBookingCancelled(
  bookingId: string,
  cancelledBy: CancelledBy,
): Promise<void> {
  await deliver(
    buildMessages("cancelled", await loadContext(bookingId), cancelledBy),
  );
}
