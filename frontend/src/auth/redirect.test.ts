import { describe, expect, it } from "vitest";
import { getRedirectTarget } from "./redirect";

describe("getRedirectTarget", () => {
  it("returns a same-site path from location state", () => {
    expect(getRedirectTarget({ from: "/book/coach-mike" })).toBe(
      "/book/coach-mike",
    );
  });

  it("falls back to the home page for missing or malformed state", () => {
    expect(getRedirectTarget(null)).toBe("/");
    expect(getRedirectTarget({})).toBe("/");
    expect(getRedirectTarget({ from: 42 })).toBe("/");
  });

  it("refuses external or protocol-relative targets", () => {
    expect(getRedirectTarget({ from: "https://evil.example" })).toBe("/");
    expect(getRedirectTarget({ from: "//evil.example" })).toBe("/");
    expect(getRedirectTarget({ from: "/\\evil.example" })).toBe("/");
  });
});

describe("getRedirectTarget fallback", () => {
  it("uses the provided fallback when there is no safe target", () => {
    expect(getRedirectTarget(null, "/dashboard")).toBe("/dashboard");
    expect(getRedirectTarget({ from: "//evil.example" }, "/dashboard")).toBe(
      "/dashboard",
    );
  });

  it("still prefers a safe target over the fallback", () => {
    expect(getRedirectTarget({ from: "/book/coach-mike" }, "/dashboard")).toBe(
      "/book/coach-mike",
    );
  });
});
