const MS_PER_DAY = 86_400_000;

/** Intl may emit narrow/no-break spaces (e.g. before "AM"); normalize to a plain space. */
function normalizeSpaces(value: string): string {
  return value.replace(/[\u202f\u00a0]/g, " ");
}

/** "YYYY-MM-DD" for the given instant as seen in the given IANA timezone. */
export function todayInTimezone(
  timezone: string,
  now: Date = new Date(),
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Calendar arithmetic on "YYYY-MM-DD" strings, done in UTC so DST never interferes. */
export function addDaysToDateString(date: string, days: number): string {
  const base = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(base.getTime())) {
    throw new RangeError(`Invalid date: ${date}`);
  }
  return new Date(base.getTime() + days * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
}

export function formatSlotTime(isoUtc: string, timezone: string): string {
  return normalizeSpaces(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(isoUtc)),
  );
}

export function formatSlotDateTime(isoUtc: string, timezone: string): string {
  return normalizeSpaces(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(isoUtc)),
  );
}
