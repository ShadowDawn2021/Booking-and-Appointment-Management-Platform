// src/utils/validation.test.ts
import { describe, expect, it } from "vitest";
import { signupSchema } from "./validation.js";
import {
  createProviderSchema,
  serviceSchema,
  updateProviderSchema,
} from "./validation.js";

const valid = {
  email: "Coach@Test.com",
  password: "password123",
  name: "Coach",
  role: "PROVIDER",
};

describe("signupSchema", () => {
  it("normalizes email casing", () => {
    expect(signupSchema.parse(valid).email).toBe("coach@test.com");
  });
  it("rejects short passwords", () => {
    expect(
      signupSchema.safeParse({ ...valid, password: "short" }).success,
    ).toBe(false);
  });
  it("rejects unknown roles", () => {
    expect(signupSchema.safeParse({ ...valid, role: "ADMIN" }).success).toBe(
      false,
    );
  });
});

describe("createProviderSchema", () => {
  const valid = {
    businessName: "Coach Mike",
    slug: "Coach-Mike",
    timezone: "America/New_York",
  };

  it("lowercases the slug", () => {
    expect(createProviderSchema.parse(valid).slug).toBe("coach-mike");
  });
  it("rejects slugs with spaces or double hyphens", () => {
    expect(
      createProviderSchema.safeParse({ ...valid, slug: "bad slug" }).success,
    ).toBe(false);
    expect(
      createProviderSchema.safeParse({ ...valid, slug: "bad--slug" }).success,
    ).toBe(false);
  });
  it("rejects invalid timezones", () => {
    expect(
      createProviderSchema.safeParse({ ...valid, timezone: "Mars/Olympus" })
        .success,
    ).toBe(false);
  });
});

describe("updateProviderSchema", () => {
  it("rejects an empty update", () => {
    expect(updateProviderSchema.safeParse({}).success).toBe(false);
  });
});

describe("serviceSchema", () => {
  const valid = { name: "1-hour session", durationMinutes: 60, price: 25 };

  it("accepts a valid service", () => {
    expect(serviceSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects fractional durations and excess price decimals", () => {
    expect(
      serviceSchema.safeParse({ ...valid, durationMinutes: 30.5 }).success,
    ).toBe(false);
    expect(serviceSchema.safeParse({ ...valid, price: 10.999 }).success).toBe(
      false,
    );
  });
});
