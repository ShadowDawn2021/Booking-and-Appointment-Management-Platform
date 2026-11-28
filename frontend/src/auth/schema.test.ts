import { describe, expect, it } from "vitest";
import { loginSchema, signupSchema } from "./schema";

describe("loginSchema", () => {
  it("trims and lowercases the email", () => {
    expect(
      loginSchema.parse({ email: "  Client@Test.com ", password: "x" }).email,
    ).toBe("client@test.com");
  });

  it("rejects an invalid email or empty password", () => {
    expect(
      loginSchema.safeParse({ email: "nope", password: "x" }).success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "" }).success,
    ).toBe(false);
  });
});

describe("signupSchema", () => {
  const valid = {
    name: "Client",
    email: "client@test.com",
    password: "password123",
    role: "CUSTOMER",
  };

  it("accepts a valid signup", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("enforces the password length bounds the backend uses", () => {
    expect(
      signupSchema.safeParse({ ...valid, password: "short" }).success,
    ).toBe(false);
    expect(
      signupSchema.safeParse({ ...valid, password: "x".repeat(73) }).success,
    ).toBe(false);
  });

  it("rejects an unknown role and a blank name", () => {
    expect(signupSchema.safeParse({ ...valid, role: "ADMIN" }).success).toBe(
      false,
    );
    expect(signupSchema.safeParse({ ...valid, name: "   " }).success).toBe(
      false,
    );
  });
});
