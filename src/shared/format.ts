const DEFAULT_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

const DEFAULT_COMPACT_NUMBER = new Intl.NumberFormat("en-US", {
  notation: "compact",
});

/**
 * Formats a number with the compact US locale formatter.
 * @param value - The numeric value to format.
 * @returns The compact number string.
 */
export function formatCompactNumber(value: number): string {
  return DEFAULT_COMPACT_NUMBER.format(value);
}

/**
 * Formats a `Date` or date string as an ISO timestamp.
 * @param date - The date value to normalize.
 * @returns An ISO timestamp, or an empty string when the input is invalid.
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const time = dateObj.getTime();
  if (Number.isNaN(time)) return "";
  return dateObj.toISOString();
}

/**
 * Formats a `Date` or date string using the medium locale formatter.
 * @param date - The date value to format.
 * @returns A medium-formatted date string, or an empty string when the input is invalid.
 */
export function formatMediumDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const time = dateObj.getTime();
  if (Number.isNaN(time)) return "";
  return DEFAULT_DATE_FORMATTER.format(dateObj);
}
