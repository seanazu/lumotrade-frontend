/**
 * Time utilities (server-safe)
 */

/**
 * Returns YYYY-MM-DD in the requested IANA timezone.
 * Uses en-CA locale to produce ISO-like formatting.
 */
export function getDateStringInTimeZone(date: Date, timeZone: string): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return fmt.format(date); // YYYY-MM-DD
}

export function getEtDateString(date: Date = new Date()): string {
  return getDateStringInTimeZone(date, "America/New_York");
}

