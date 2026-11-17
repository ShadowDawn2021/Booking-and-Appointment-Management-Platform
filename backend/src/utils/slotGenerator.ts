import { DateTime } from "luxon";

export interface TimeWindow {
  startTime: string; // "HH:mm" in the provider's timezone
  endTime: string;
}

export interface Interval {
  start: Date;
  end: Date;
}

export interface GenerateSlotsParams {
  date: string; // "YYYY-MM-DD" in the provider's timezone
  timezone: string; // IANA zone
  windows: readonly TimeWindow[];
  durationMinutes: number;
  stepMinutes: number;
  busy: readonly Interval[];
  earliestStart: Date;
}

export function intervalsOverlap(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end; // touching intervals do not overlap
}

function toZoned(date: string, time: string, zone: string): DateTime {
  const value = DateTime.fromISO(`${date}T${time}`, { zone });
  if (!value.isValid) {
    throw new RangeError(`Invalid date/time/zone: ${date} ${time} ${zone}`);
  }
  return value;
}

export function generateSlots(params: GenerateSlotsParams): Interval[] {
  const {
    date,
    timezone,
    windows,
    durationMinutes,
    stepMinutes,
    busy,
    earliestStart,
  } = params;
  if (durationMinutes <= 0 || stepMinutes <= 0) {
    throw new RangeError("durationMinutes and stepMinutes must be positive");
  }

  const slotsByStart = new Map<number, Interval>();

  for (const window of windows) {
    const windowEnd = toZoned(date, window.endTime, timezone).toMillis();
    let cursor = toZoned(date, window.startTime, timezone);

    while (cursor.plus({ minutes: durationMinutes }).toMillis() <= windowEnd) {
      const slot: Interval = {
        start: cursor.toJSDate(),
        end: cursor.plus({ minutes: durationMinutes }).toJSDate(),
      };
      const isFutureEnough = slot.start >= earliestStart;
      if (
        isFutureEnough &&
        !busy.some((interval) => intervalsOverlap(slot, interval))
      ) {
        slotsByStart.set(slot.start.getTime(), slot);
      }
      cursor = cursor.plus({ minutes: stepMinutes });
    }
  }

  return [...slotsByStart.values()].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );
}
