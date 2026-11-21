import { describe, expect, it } from "vitest";
import {
  escapeHtml,
  formatLocalTime,
  renderBookingEmail,
  type BookingEmailData,
} from "./bookingEmailTemplates.js";

const data: BookingEmailData = {
  businessName: "Coach Mike Fitness",
  providerName: "Coach",
  customerName: "Client",
  serviceName: "1-hour session",
  durationMinutes: 60,
  startTime: new Date("2030-01-07T14:00:00.000Z"),
  timezone: "America/New_York",
};

describe("formatLocalTime", () => {
  it("renders the time in the provider's timezone", () => {
    expect(formatLocalTime(data.startTime, data.timezone)).toBe(
      "Monday, January 7, 2030 at 9:00 AM EST",
    );
  });
  it("rejects invalid timezones", () => {
    expect(() => formatLocalTime(data.startTime, "Mars/Olympus")).toThrow(
      RangeError,
    );
  });
});

describe("renderBookingEmail", () => {
  it("addresses the customer and the provider differently on confirmation", () => {
    const customer = renderBookingEmail("confirmed", "customer", data);
    const provider = renderBookingEmail("confirmed", "provider", data);
    expect(customer.subject).toBe(
      "Booking confirmed: 1-hour session with Coach Mike Fitness",
    );
    expect(customer.text).toContain("Monday, January 7, 2030 at 9:00 AM EST");
    expect(provider.subject).toBe("New booking: Client - 1-hour session");
  });

  it("says who cancelled", () => {
    expect(
      renderBookingEmail("cancelled", "provider", data, "CUSTOMER").text,
    ).toContain("Client cancelled their booking.");
    expect(
      renderBookingEmail("cancelled", "customer", data, "PROVIDER").text,
    ).toContain("Coach Mike Fitness had to cancel your booking.");
  });

  it("escapes user-supplied names in the HTML body", () => {
    const hostile = { ...data, customerName: "<b>Eve</b>" };
    const { html } = renderBookingEmail("confirmed", "provider", hostile);
    expect(html).not.toContain("<b>Eve</b>");
    expect(html).toContain("&lt;b&gt;Eve&lt;/b&gt;");
  });

  it("keeps the subject on a single line", () => {
    const { subject } = renderBookingEmail("cancelled", "customer", {
      ...data,
      serviceName: "Line1\r\nBcc: x",
    });
    expect(subject).not.toMatch(/[\r\n]/);
  });
});

describe("escapeHtml", () => {
  it("escapes the five special characters", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });
});
