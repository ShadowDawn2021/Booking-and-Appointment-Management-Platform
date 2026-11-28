export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function getTimezoneOptions(): string[] {
  const zones = Intl.supportedValuesOf("timeZone");
  const browser = getBrowserTimezone();
  return zones.includes(browser) ? zones : [browser, ...zones];
}

export function isValidTimezone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}
