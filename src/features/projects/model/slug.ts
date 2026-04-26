import { VALIDATION } from "@/shared";

/**
 * Result of slug validation.
 */
type SlugValidationResult =
  | { error: string; valid: false }
  | { slug: string; valid: true };

/**
 * Extracts slug from request body with validation.
 * Returns null if validation fails.
 *
 * @param body - Request body (unknown type).
 * @returns Validated slug or null.
 */
export function extractSlugFromBody(body: unknown): null | string {
  if (!body || typeof body !== "object") {
    return null;
  }

  if (!("slug" in body)) {
    return null;
  }

  const result = validateProjectSlug((body as { slug: unknown }).slug);
  return result.valid ? result.slug : null;
}

/**
 * Type guard to check if a value is a valid project slug string.
 *
 * @param input - Value to check.
 * @returns True if input is a valid slug string.
 */
export function isValidProjectSlug(input: unknown): input is string {
  const result = validateProjectSlug(input);
  return result.valid;
}

/**
 * Validates a project slug according to application rules.
 *
 * Rules:
 * - Must not be empty
 * - Must not exceed maximum length
 * - Must match allowed character pattern (alphanumeric, dots, hyphens, underscores).
 *
 * @param input - Raw slug input to validate.
 * @returns Validation result with normalized slug or error message.
 */
export function validateProjectSlug(input: unknown): SlugValidationResult {
  // Type guard
  if (typeof input !== "string") {
    return { error: "Slug must be a string", valid: false };
  }

  const slug = input.trim();

  // Empty check
  if (slug.length === 0) {
    return { error: "Slug cannot be empty", valid: false };
  }

  // Length check
  if (slug.length > VALIDATION.MAX_SLUG_LENGTH) {
    return {
      error: `Slug exceeds maximum length of ${VALIDATION.MAX_SLUG_LENGTH}`,
      valid: false,
    };
  }

  // Pattern check
  if (!VALIDATION.SLUG_PATTERN.test(slug)) {
    return {
      error:
        "Slug contains invalid characters (only letters, numbers, dots, hyphens, and underscores allowed)",
      valid: false,
    };
  }

  return { slug, valid: true };
}
