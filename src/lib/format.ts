/**
 * "Sun, 12 Apr" for an ISO date. Parsed as UTC on purpose: `2026-04-12` is a
 * calendar day, not an instant, and `new Date("2026-04-12")` is already UTC
 * midnight — formatting that in a timezone behind UTC would show the 11th.
 */
export function formatDay(isoDate: string, localeTag = "en-US"): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;

  try {
    return new Intl.DateTimeFormat(localeTag, {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return isoDate;
  }
}
