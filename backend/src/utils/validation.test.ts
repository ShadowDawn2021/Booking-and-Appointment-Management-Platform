// src/utils/validation.test.ts
import { describe, expect, it } from "vitest";
import { signupSchema } from "./validation.js";

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
