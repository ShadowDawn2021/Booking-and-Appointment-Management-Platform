const OVERLAP_CONSTRAINT_NAME = "booking_no_overlap";
const EXCLUSION_VIOLATION_CODE = "23P01";
const MAX_CAUSE_DEPTH = 5;

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value) ?? "";
  } catch {
    return "";
  }
}

function describeError(error: Error): string {
  return `${error.message} ${safeJson((error as { meta?: unknown }).meta)}`;
}

export function isBookingOverlapError(error: unknown): boolean {
  let current: unknown = error;
  for (
    let depth = 0;
    depth < MAX_CAUSE_DEPTH && current instanceof Error;
    depth += 1
  ) {
    const text = describeError(current);
    if (
      text.includes(OVERLAP_CONSTRAINT_NAME) ||
      text.includes(EXCLUSION_VIOLATION_CODE)
    ) {
      return true;
    }
    current = current.cause;
  }
  return false;
}
