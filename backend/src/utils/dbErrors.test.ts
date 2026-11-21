import { describe, expect, it } from "vitest";
import { isBookingOverlapError } from "./dbErrors.js";

describe("isBookingOverlapError", () => {
  it("detects the constraint name in the message", () => {
    const error = new Error(
      'conflicting key value violates exclusion constraint "booking_no_overlap"',
    );
    expect(isBookingOverlapError(error)).toBe(true);
  });

  it("detects the Postgres code in a nested cause", () => {
    const error = new Error("query failed", { cause: new Error("code 23P01") });
    expect(isBookingOverlapError(error)).toBe(true);
  });

  it("detects the constraint name in Prisma-style meta", () => {
    const error = Object.assign(new Error("unknown request error"), {
      meta: {
        driverAdapterError: { cause: { constraint: "booking_no_overlap" } },
      },
    });
    expect(isBookingOverlapError(error)).toBe(true);
  });

  it("ignores unrelated errors and non-errors", () => {
    expect(isBookingOverlapError(new Error("connection refused"))).toBe(false);
    expect(isBookingOverlapError("booking_no_overlap")).toBe(false);
    expect(isBookingOverlapError(undefined)).toBe(false);
  });
});
