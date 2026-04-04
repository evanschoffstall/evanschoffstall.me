/**
 * URL normalization and validation utilities
 */

/**
 * Normalizes a GitHub repository reference into a full HTTPS URL.
 *
 * Handles:
 * - Full URLs: https://github.com/user/repo
 * - Domain-prefixed: github.com/user/repo
 * - Short format: user/repo
 *
 * @param repository - The repository reference
 * @returns Normalized HTTPS URL or empty string if invalid
 */
export function normalizeRepoHref(repository: string): string {
  const trimmed = repository.trim().replace(/\/+$/g, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^github\.com\//i.test(trimmed)) return `https://${trimmed}`;
  return `https://github.com/${trimmed}`;
}

/**
 * Normalizes an external URL by ensuring it has a protocol.
 *
 * @param url - The URL to normalize
 * @returns Normalized HTTPS URL or empty string if invalid
 */
export function normalizeExternalHref(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Validates that a URL is safe for external use.
 * Prevents javascript:, data:, and other potentially dangerous protocols.
 *
 * @param url - The URL to validate
 * @returns True if the URL is safe
 */
export function isSafeExternalUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  if (!trimmed) return false;

  // Only allow http and https protocols
  if (trimmed.startsWith("javascript:")) return false;
  if (trimmed.startsWith("data:")) return false;
  if (trimmed.startsWith("vbscript:")) return false;
  if (trimmed.startsWith("file:")) return false;

  return /^(https?:\/\/|[a-z0-9-]+\.[a-z]{2,})/i.test(trimmed);
}
