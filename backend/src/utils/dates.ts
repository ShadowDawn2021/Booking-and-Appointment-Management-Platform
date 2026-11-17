export function dateToUtcMidnight(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}
