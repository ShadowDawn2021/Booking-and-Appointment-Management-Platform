import { describe, expect, it } from "vitest";
import { getBrowserTimezone, getTimezoneOptions } from "../lib/timezones";
import { providerProfileSchema, slugify } from "./schemas";

describe("slugify", () => {
  it("builds a URL-safe slug", () => {
    expect(slugify("Coach Mike's Fitness!")).toBe("coach-mike-s-fitness");
    expect(slugify("  Café  Niño ")).toBe("cafe-nino");
  });

  it("returns an empty string when nothing usable remains", () => {
    expect(slugify("---")).toBe("");
  });

  it("truncates without leaving a trailing hyphen", () => {
    const slug = slugify(`${"a".repeat(49)} bbbb`);
    expect(slug.length).toBeLessThanOrEqual(50);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("providerProfileSchema", () => {
  const valid = {
    businessName: "Coach Mike",
    slug: "Coach-Mike",
    timezone: "Asia/Manila",
  };

  it("normalizes the slug and accepts a valid profile", () => {
    expect(providerProfileSchema.parse(valid).slug).toBe("coach-mike");
  });

  it("rejects bad slugs and unknown timezones", () => {
    expect(
      providerProfileSchema.safeParse({ ...valid, slug: "bad slug" }).success,
    ).toBe(false);
    expect(
      providerProfileSchema.safeParse({ ...valid, slug: "ab" }).success,
    ).toBe(false);
    expect(
      providerProfileSchema.safeParse({ ...valid, timezone: "Mars/Olympus" })
        .success,
    ).toBe(false);
  });
});

describe("getTimezoneOptions", () => {
  it("includes the browser timezone and Manila", () => {
    const options = getTimezoneOptions();
    expect(options).toContain(getBrowserTimezone());
    expect(options).toContain("Asia/Manila");
  });
});
