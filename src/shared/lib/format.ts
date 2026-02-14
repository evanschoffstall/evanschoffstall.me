const DEFAULT_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

const DEFAULT_COMPACT_NUMBER = new Intl.NumberFormat("en-US", {
  notation: "compact",
});

export function formatMediumDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const time = dateObj.getTime();
  if (Number.isNaN(time)) return "";
  return DEFAULT_DATE_FORMATTER.format(dateObj);
}

export function formatCompactNumber(value: number): string {
  return DEFAULT_COMPACT_NUMBER.format(value);
}
