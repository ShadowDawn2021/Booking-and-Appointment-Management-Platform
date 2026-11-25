import { describe, expect, it } from "vitest";
import {
  addDaysToDateString,
  formatSlotDateTime,
  formatSlotTime,
  todayInTimezone,
} from "./dateTime";

describe("todayInTimezone", () => {
  const instant = new Date("2030-01-07T03:00:00.000Z");

  it("uses the calendar date of the given timezone, not UTC", () => {
    expect(todayInTimezone("America/New_York", instant)).toBe("2030-01-06");
    expect(todayInTimezone("Pacific/Auckland", instant)).toBe("2030-01-07");
  });
});

describe("addDaysToDateString", () => {
  it("rolls over month, year, and leap-day boundaries", () => {
    expect(addDaysToDateString("2030-01-31", 1)).toBe("2030-02-01");
    expect(addDaysToDateString("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDaysToDateString("2030-12-31", 90)).toBe("2031-03-31");
  });

  it("rejects invalid dates", () => {
    expect(() => addDaysToDateString("not-a-date", 1)).toThrow(RangeError);
  });
});

describe("formatSlotTime", () => {
  it("renders the same instant in different timezones", () => {
    expect(formatSlotTime("2030-01-07T14:00:00.000Z", "America/New_York")).toBe("9:00 AM");
    expect(formatSlotTime("2030-01-07T14:00:00.000Z", "Asia/Manila")).toBe("10:00 PM");
  });

  it("follows daylight saving time", () => {
    expect(formatSlotTime("2030-03-10T13:00:00.000Z", "America/New_York")).toBe("9:00 AM");
  });
});

describe("formatSlotDateTime", () => {
  it("includes the weekday, date, time, and zone abbreviation", () => {
    const text = formatSlotDateTime("2030-01-07T14:00:00.000Z", "America/New_York");
    expect(text).toContain("Monday");
    expect(text).toContain("January 7, 2030");
    expect(text).toContain("9:00 AM");
    expect(text).toContain("EST");
  });
});