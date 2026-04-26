/** Truthy-or-falsy class fragment accepted by the lightweight class-name joiner. */
type ClassValue = false | null | string | undefined;

const DEFAULT_COMPACT_NUMBER = new Intl.NumberFormat("en-US", {
  notation: "compact",
});

const DEFAULT_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

/** API validation constants. */
export const VALIDATION = {
  /** Maximum allowed length for a project slug. */
  MAX_SLUG_LENGTH: 128,
  /** Regex pattern for valid slug characters. */
  SLUG_PATTERN: /^[A-Za-z0-9._-]+$/,
} as const;

/** Rate limiting and deduplication constants. */
export const RATE_LIMITING = {
  /** View deduplication window in seconds (24 hours). */
  VIEW_DEDUP_WINDOW_SECONDS: 24 * 60 * 60,
} as const;

/** UI animation constants. */
export const ANIMATION = {
  /** Default particle quantity for background effects. */
  DEFAULT_PARTICLE_QUANTITY: 200,
  /** Easing function for animations. */
  EASE: [0.16, 1, 0.3, 1] as const,
  /** Standard fade transition duration in seconds. */
  FADE_DURATION: 0.35,
} as const;

/** Shared ease tuple used by motion variants. */
export const EASE_IN_OUT = [0.16, 1, 0.3, 1] as const;

/** Shared fade-only motion variant. */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: EASE_IN_OUT,
    },
  },
};

/** Shared fade-and-rise motion variant. */
export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.9,
      ease: EASE_IN_OUT,
    },
    y: 0,
  },
};

/**
 * Joins truthy class-name fragments into a single class string.
 * @param values - The class fragments to join.
 * @returns The joined class string.
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}

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

/**
 * Thin guard around the browser sessionStorage API.
 * @returns `true` when `sessionStorage` can be safely used in the current environment.
 */
export function hasSessionStorage(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const test = "__storage_test__";
    window.sessionStorage.setItem(test, test);
    window.sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates that a URL is safe for external use.
 * @param url - The URL to validate.
 * @returns True if the URL is safe.
 */
export function isSafeExternalUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  if (!trimmed) return false;
  if (trimmed.startsWith("javascript:")) return false;
  if (trimmed.startsWith("data:")) return false;
  if (trimmed.startsWith("vbscript:")) return false;
  if (trimmed.startsWith("file:")) return false;

  return /^(https?:\/\/|[a-z0-9-]+\.[a-z]{2,})/i.test(trimmed);
}

/**
 * Normalizes an external URL by ensuring it has a protocol.
 * @param url - The URL to normalize.
 * @returns Normalized HTTPS URL or empty string if invalid.
 */
export function normalizeExternalHref(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Normalizes a GitHub repository reference into a full HTTPS URL.
 * @param repository - The repository reference.
 * @returns Normalized HTTPS URL or empty string if invalid.
 */
export function normalizeRepoHref(repository: string): string {
  const trimmed = repository.trim().replace(/\/+$/g, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^github\.com\//i.test(trimmed)) return `https://${trimmed}`;
  return `https://github.com/${trimmed}`;
}
