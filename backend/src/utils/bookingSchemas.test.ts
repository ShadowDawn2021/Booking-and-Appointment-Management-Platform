import { describe, expect, it } from "vitest";
import { createBookingSchema, listBookingsQuerySchema } from "./validation.js";

const validBooking = {
  providerSlug: "Coach-Mike",
  serviceId: "224af7eb-1f24-4d3e-8e20-54fe63149677",
  startTime: "2030-01-07T14:00:00.000Z",
};

describe("createBookingSchema", () => {
  it("accepts UTC and offset timestamps and lowercases the slug", () => {
    expect(createBookingSchema.parse(validBooking).providerSlug).toBe(
      "coach-mike",
    );
    expect(
      createBookingSchema.safeParse({
        ...validBooking,
        startTime: "2030-01-07T09:00:00-05:00",
      }).success,
    ).toBe(true);
  });

  it("rejects date-only, offset-less, and non-ISO start times", () => {
    for (const startTime of [
      "2030-01-07",
      "2030-01-07T09:00:00",
      "tomorrow at 9",
    ]) {
      expect(
        createBookingSchema.safeParse({ ...validBooking, startTime }).success,
      ).toBe(false);
    }
  });

  it("rejects a malformed service id", () => {
    expect(
      createBookingSchema.safeParse({ ...validBooking, serviceId: "123" })
        .success,
    ).toBe(false);
  });
});

describe("listBookingsQuerySchema", () => {
  it("defaults to upcoming and rejects unknown scopes", () => {
    expect(listBookingsQuerySchema.parse({}).scope).toBe("upcoming");
    expect(
      listBookingsQuerySchema.safeParse({ scope: "forever" }).success,
    ).toBe(false);
  });
});
