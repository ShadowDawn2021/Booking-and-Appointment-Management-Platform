import { describe, expect, it } from "vitest";
import { generateSlots, type Interval } from "./slotGenerator.js";
import {
  createProviderSchema,
  exceptionSchema,
  serviceSchema,
  signupSchema,
  updateProviderSchema,
  weeklyAvailabilitySchema,
} from "./validation.js";

const DATE = "2030-01-07";
const beginningOfTime = new Date(0);

function startsOf(slots: Interval[]): string[] {
  return slots.map((slot) => slot.start.toISOString());
}

function busyUtc(start: string, end: string): Interval {
  return {
    start: new Date(`${DATE}T${start}:00.000Z`),
    end: new Date(`${DATE}T${end}:00.000Z`),
  };
}

const base = {
  date: DATE,
  timezone: "UTC",
  windows: [{ startTime: "09:00", endTime: "17:00" }],
  durationMinutes: 60,
  stepMinutes: 60,
  busy: [] as Interval[],
  earliestStart: beginningOfTime,
};

describe("generateSlots", () => {
  it("fills a window with back-to-back slots", () => {
    const starts = startsOf(generateSlots(base));
    expect(starts).toHaveLength(8);
    expect(starts[0]).toBe("2030-01-07T09:00:00.000Z");
    expect(starts[7]).toBe("2030-01-07T16:00:00.000Z");
  });

  it("excludes every candidate that overlaps a booking", () => {
    const slots = generateSlots({
      ...base,
      windows: [{ startTime: "09:00", endTime: "12:00" }],
      stepMinutes: 30,
      busy: [busyUtc("10:00", "11:00")],
    });
    expect(startsOf(slots)).toEqual([
      "2030-01-07T09:00:00.000Z",
      "2030-01-07T11:00:00.000Z",
    ]);
  });

  it("treats touching intervals as non-overlapping", () => {
    const slots = generateSlots({
      ...base,
      windows: [{ startTime: "09:00", endTime: "11:00" }],
      busy: [busyUtc("09:00", "10:00")],
    });
    expect(startsOf(slots)).toEqual(["2030-01-07T10:00:00.000Z"]);
  });

  it("drops slots before earliestStart", () => {
    const slots = generateSlots({
      ...base,
      windows: [{ startTime: "09:00", endTime: "12:00" }],
      earliestStart: new Date("2030-01-07T10:00:00.000Z"),
    });
    expect(startsOf(slots)).toEqual([
      "2030-01-07T10:00:00.000Z",
      "2030-01-07T11:00:00.000Z",
    ]);
  });

  it("returns nothing for no windows or a window shorter than the service", () => {
    expect(generateSlots({ ...base, windows: [] })).toEqual([]);
    expect(
      generateSlots({
        ...base,
        windows: [{ startTime: "09:00", endTime: "09:30" }],
      }),
    ).toEqual([]);
  });

  it("supports split shifts and returns slots sorted", () => {
    const slots = generateSlots({
      ...base,
      windows: [
        { startTime: "13:00", endTime: "14:00" },
        { startTime: "09:00", endTime: "10:00" },
      ],
    });
    expect(startsOf(slots)).toEqual([
      "2030-01-07T09:00:00.000Z",
      "2030-01-07T13:00:00.000Z",
    ]);
  });

  it("converts provider-local hours to UTC, including across DST", () => {
    const winter = generateSlots({
      ...base,
      timezone: "America/New_York",
      windows: [{ startTime: "09:00", endTime: "10:00" }],
    });
    expect(startsOf(winter)).toEqual(["2030-01-07T14:00:00.000Z"]); // EST, UTC-5

    const afterSpringForward = generateSlots({
      ...base,
      date: "2030-03-10",
      timezone: "America/New_York",
      windows: [{ startTime: "09:00", endTime: "10:00" }],
    });
    expect(startsOf(afterSpringForward)).toEqual(["2030-03-10T13:00:00.000Z"]); // EDT, UTC-4
  });

  it("rejects invalid timezones and non-positive durations", () => {
    expect(() => generateSlots({ ...base, timezone: "Mars/Olympus" })).toThrow(
      RangeError,
    );
    expect(() => generateSlots({ ...base, durationMinutes: 0 })).toThrow(
      RangeError,
    );
  });

  describe("weeklyAvailabilitySchema", () => {
    it("accepts split shifts on one day", () => {
      const result = weeklyAvailabilitySchema.safeParse({
        windows: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
          { dayOfWeek: 1, startTime: "13:00", endTime: "17:00" },
        ],
      });
      expect(result.success).toBe(true);
    });
    it("rejects overlapping windows on the same day", () => {
      const result = weeklyAvailabilitySchema.safeParse({
        windows: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
          { dayOfWeek: 1, startTime: "11:00", endTime: "14:00" },
        ],
      });
      expect(result.success).toBe(false);
    });
    it("rejects reversed or malformed times", () => {
      expect(
        weeklyAvailabilitySchema.safeParse({
          windows: [{ dayOfWeek: 1, startTime: "17:00", endTime: "09:00" }],
        }).success,
      ).toBe(false);
      expect(
        weeklyAvailabilitySchema.safeParse({
          windows: [{ dayOfWeek: 1, startTime: "9am", endTime: "17:00" }],
        }).success,
      ).toBe(false);
    });
  });

  describe("exceptionSchema", () => {
    it("accepts a closed day and custom hours", () => {
      expect(
        exceptionSchema.safeParse({ date: "2030-12-25", isClosed: true })
          .success,
      ).toBe(true);
      expect(
        exceptionSchema.safeParse({
          date: "2030-12-24",
          isClosed: false,
          startTime: "10:00",
          endTime: "12:00",
        }).success,
      ).toBe(true);
    });
    it("rejects closed days with hours, open days without hours, and impossible dates", () => {
      expect(
        exceptionSchema.safeParse({
          date: "2030-12-25",
          isClosed: true,
          startTime: "10:00",
          endTime: "12:00",
        }).success,
      ).toBe(false);
      expect(
        exceptionSchema.safeParse({ date: "2030-12-25", isClosed: false })
          .success,
      ).toBe(false);
      expect(
        exceptionSchema.safeParse({ date: "2030-02-31", isClosed: true })
          .success,
      ).toBe(false);
    });
  });
});
