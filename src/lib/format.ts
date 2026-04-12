const DEFAULT_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

const DEFAULT_COMPACT_NUMBER = new Intl.NumberFormat("en-US", {
  notation: "compact",
});

export function formatCompactNumber(value: number): string {
  return DEFAULT_COMPACT_NUMBER.format(value);
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const time = dateObj.getTime();
  if (Number.isNaN(time)) return "";
  return dateObj.toISOString();
}

export function formatMediumDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const time = dateObj.getTime();
  if (Number.isNaN(time)) return "";
  return DEFAULT_DATE_FORMATTER.format(dateObj);
}
