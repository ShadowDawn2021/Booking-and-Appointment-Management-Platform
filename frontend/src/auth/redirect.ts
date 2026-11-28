/** Only same-site paths are honored, so a crafted state can't redirect users elsewhere. */
export function getRedirectTarget(
  locationState: unknown,
  fallback = "/",
): string {
  if (
    typeof locationState === "object" &&
    locationState !== null &&
    "from" in locationState
  ) {
    const from = locationState.from;
    const isSafePath =
      typeof from === "string" &&
      from.startsWith("/") &&
      !from.startsWith("//") &&
      !from.startsWith("/\\");
    if (isSafePath) {
      return from;
    }
  }
  return fallback;
}
