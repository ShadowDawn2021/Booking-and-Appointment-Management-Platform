export function getRedirectTarget(locationState: unknown): string {
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
  return "/";
}
