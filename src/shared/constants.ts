/**
 * Application-wide constants
 */

/** Revalidation intervals for Next.js ISR (in seconds) */
export const REVALIDATE = {
  /** Standard revalidation for most content */
  STANDARD: 60,
  /** Fast revalidation for frequently changing data */
  FAST: 30,
  /** Slow revalidation for mostly static content */
  SLOW: 300,
} as const;

/** API validation constants */
export const VALIDATION = {
  /** Maximum allowed length for project slug */
  MAX_SLUG_LENGTH: 128,
  /** Regex pattern for valid slug characters */
  SLUG_PATTERN: /^[A-Za-z0-9._-]+$/,
} as const;

/** Rate limiting and deduplication constants */
export const RATE_LIMITING = {
  /** View deduplication window in seconds (24 hours) */
  VIEW_DEDUP_WINDOW_SECONDS: 24 * 60 * 60,
} as const;

/** UI animation constants */
export const ANIMATION = {
  /** Default particle quantity for background effects */
  DEFAULT_PARTICLE_QUANTITY: 200,
  /** Standard fade transition duration in seconds */
  FADE_DURATION: 0.35,
  /** Easing function for animations */
  EASE: [0.16, 1, 0.3, 1] as const,
} as const;
