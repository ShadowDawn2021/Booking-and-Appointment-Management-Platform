import { DateTime } from "luxon";
import type { EmailMessage } from "./emailSender.js";

export type BookingEmailKind = "confirmed" | "cancelled";
export type EmailAudience = "customer" | "provider";
export type CancelledBy = "CUSTOMER" | "PROVIDER";

export interface BookingEmailData {
  businessName: string;
  providerName: string;
  customerName: string;
  serviceName: string;
  durationMinutes: number;
  startTime: Date;
  timezone: string;
}

export type RenderedEmail = Pick<EmailMessage, "subject" | "text" | "html">;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export function formatLocalTime(date: Date, timezone: string): string {
  const local = DateTime.fromJSDate(date, { zone: timezone }).setLocale(
    "en-US",
  );
  if (!local.isValid) {
    throw new RangeError(`Invalid timezone: ${timezone}`);
  }
  return local.toFormat("cccc, LLLL d, yyyy 'at' h:mm a ZZZZ");
}

interface EmailCopy {
  subject: string;
  heading: string;
  intro: string;
}

function copyFor(
  kind: BookingEmailKind,
  audience: EmailAudience,
  data: BookingEmailData,
  cancelledBy: CancelledBy,
): EmailCopy {
  if (kind === "confirmed") {
    return audience === "customer"
      ? {
          subject: `Booking confirmed: ${data.serviceName} with ${data.businessName}`,
          heading: "Your booking is confirmed",
          intro: `Hi ${data.customerName}, you're all set.`,
        }
      : {
          subject: `New booking: ${data.customerName} - ${data.serviceName}`,
          heading: "You have a new booking",
          intro: `Hi ${data.providerName}, ${data.customerName} just booked a session.`,
        };
  }

  const intro =
    audience === "customer"
      ? cancelledBy === "CUSTOMER"
        ? `Hi ${data.customerName}, your booking has been cancelled.`
        : `Hi ${data.customerName}, ${data.businessName} had to cancel your booking.`
      : cancelledBy === "CUSTOMER"
        ? `Hi ${data.providerName}, ${data.customerName} cancelled their booking.`
        : `Hi ${data.providerName}, you cancelled this booking.`;

  return {
    subject: `Booking cancelled: ${data.serviceName}`,
    heading: "Booking cancelled",
    intro,
  };
}

export function renderBookingEmail(
  kind: BookingEmailKind,
  audience: EmailAudience,
  data: BookingEmailData,
  cancelledBy: CancelledBy = "CUSTOMER",
): RenderedEmail {
  const { subject, heading, intro } = copyFor(
    kind,
    audience,
    data,
    cancelledBy,
  );

  const details: [string, string][] = [
    ["Service", data.serviceName],
    ["When", formatLocalTime(data.startTime, data.timezone)],
    ["Duration", `${data.durationMinutes} minutes`],
    [
      audience === "customer" ? "With" : "Customer",
      audience === "customer" ? data.businessName : data.customerName,
    ],
  ];
  const timezoneNote = `Times are shown in the provider's timezone (${data.timezone}).`;

  const text = [
    heading,
    "",
    intro,
    "",
    ...details.map(([label, value]) => `${label}: ${value}`),
    "",
    timezoneNote,
  ].join("\n");

  const rows = details
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#555">${escapeHtml(label)}</td>` +
        `<td style="padding:4px 0"><strong>${escapeHtml(value)}</strong></td></tr>`,
    )
    .join("");
  const html =
    `<div style="font-family:Arial,sans-serif;max-width:480px">` +
    `<h2>${escapeHtml(heading)}</h2><p>${escapeHtml(intro)}</p>` +
    `<table>${rows}</table>` +
    `<p style="color:#777;font-size:12px">${escapeHtml(timezoneNote)}</p></div>`;

  return { subject: singleLine(subject), text, html };
}
