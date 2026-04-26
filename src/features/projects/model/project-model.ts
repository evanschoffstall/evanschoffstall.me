import type { Project } from "contentlayer/generated";

import {
  getRedisClient,
  isSafeExternalUrl,
  normalizeExternalHref,
  normalizeRepoHref,
  RATE_LIMITING,
  VALIDATION,
} from "@/shared";

const FEATURED_PROJECT_SLUGS = {
  featured: "librerss",
  second: "example-traefik-multitenant-ssl",
  third: "gitaicmt",
} as const;

/** Safe, normalized external links derived from project content fields. */
export interface ProjectExternalLinks {
  liveHref: string;
  repositoryHref: string;
}

/** Minimal project link shape accepted by the shared project link resolver. */
interface ProjectLinkSource {
  repository?: string;
  url?: string;
}

/** Result of slug validation. */
type SlugValidationResult =
  | { error: string; valid: false }
  | { slug: string; valid: true };

/**
 * Extracts slug from request body with validation.
 * @param body - Request body to inspect.
 * @returns Validated slug or null.
 */
export function extractSlugFromBody(body: unknown): null | string {
  if (!body || typeof body !== "object") return null;
  if (!("slug" in body)) return null;

  const result = validateProjectSlug((body as { slug: unknown }).slug);
  return result.valid ? result.slug : null;
}

/**
 * Reads the current public view count for a single project.
 * @param slug - The validated project slug to look up.
 * @returns The project's public view count, or `0` when unavailable.
 */
export async function getProjectView(slug: string): Promise<number> {
  const redis = getRedisClient();
  if (!redis) return 0;
  try {
    return toSafeViewCount(await redis.get(projectPageviewsKey(slug)));
  } catch (error) {
    console.error("Failed to fetch project view count:", error);
    return 0;
  }
}

/**
 * Reads the current public view counts for multiple projects in one request.
 * @param slugs - The validated project slugs to look up.
 * @returns A map of project slugs to their public view counts.
 */
export async function getProjectViews(
  slugs: string[],
): Promise<Record<string, number>> {
  const redis = getRedisClient();
  if (!redis || slugs.length === 0) return {};

  try {
    const values = await redis.mget<unknown[]>(
      ...slugs.map((slug) => projectPageviewsKey(slug)),
    );

    const views: Record<string, number> = {};
    for (let i = 0; i < slugs.length; i++) {
      views[slugs[i]] = toSafeViewCount(values[i]);
    }
    return views;
  } catch (error) {
    console.error("Failed to fetch project view counts:", error);
    return {};
  }
}

/**
 * Groups published projects into primary, contribution, and legacy buckets.
 * @param projects - The project list loaded from content.
 * @param excludedSlugs - Slugs that should be excluded from the primary and contribution lists.
 * @returns Sorted project groups ready for the projects page.
 */
export function groupAndSortProjects(
  projects: Project[],
  excludedSlugs: string[],
) {
  const exclude = new Set(excludedSlugs);
  const published = projects.filter((project) => project.published);
  const sorted = published
    .filter((project) => !project.contributor)
    .filter((project) => !project.legacy)
    .filter((project) => !exclude.has(project.slug))
    .sort((a, b) => dateToTime(b.date) - dateToTime(a.date));
  const sortedLegacy = published
    .filter((project) => project.legacy)
    .sort((a, b) => dateToTime(b.date) - dateToTime(a.date));
  const sortedContributions = published
    .filter((project) => project.contributor)
    .filter((project) => !exclude.has(project.slug))
    .sort((a, b) => dateToTime(b.date) - dateToTime(a.date));

  return { sorted, sortedContributions, sortedLegacy };
}

/**
 * Increments the view count for a project, deduplicated by hashed IP.
 * @param slug - Validated project slug.
 * @param ip - Caller IP; null skips deduplication and always increments.
 */
export async function incrementProjectView(
  slug: string,
  ip: null | string,
): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  if (ip) {
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(ip),
    );
    const hash = Array.from(new Uint8Array(buf))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    const isNew = await redis.set(["deduplicate", hash, slug].join(":"), true, {
      ex: RATE_LIMITING.VIEW_DEDUP_WINDOW_SECONDS,
      nx: true,
    });
    if (!isNew) return;
  }

  await redis.incr(projectPageviewsKey(slug));
}

/**
 * Type guard to check if a value is a valid project slug string.
 * @param input - Value to check.
 * @returns True if input is a valid slug string.
 */
export function isValidProjectSlug(input: unknown): input is string {
  const result = validateProjectSlug(input);
  return result.valid;
}

/**
 * Picks the three featured projects, preferring configured slugs when available.
 * @param projects - The project list loaded from content.
 * @returns The featured trio, or `null` when fewer than three published projects exist.
 */
export function pickFeaturedProjects(projects: Project[]) {
  const published = projects.filter((project) => project.published);
  if (published.length < 3) return null;

  const preferredOrder = [
    FEATURED_PROJECT_SLUGS.featured,
    FEATURED_PROJECT_SLUGS.second,
    FEATURED_PROJECT_SLUGS.third,
  ];
  const preferred = preferredOrder
    .map((slug) => published.find((project) => project.slug === slug))
    .filter((project): project is Project => Boolean(project));
  const fallback = [...published].sort(
    (a, b) => dateToTime(b.date) - dateToTime(a.date),
  );
  const selected = [...preferred];

  for (const project of fallback) {
    if (selected.length >= 3) break;
    if (!selected.some((current) => current.slug === project.slug)) {
      selected.push(project);
    }
  }

  if (selected.length < 3) return null;

  const [featured, second, third] = selected;
  return { featured, second, third };
}

/**
 * Normalizes project URLs and drops unsafe values.
 * @param project - The project fields that may contain live and repository links.
 * @returns Safe, normalized link targets for the project surface.
 */
export function resolveProjectExternalLinks(
  project: ProjectLinkSource,
): ProjectExternalLinks {
  const repositoryHref = toSafeRepositoryHref(project.repository);
  const liveHref = toSafeExternalHref(project.url);

  return {
    liveHref,
    repositoryHref,
  };
}

/**
 * Validates a project slug according to application rules.
 * @param input - Raw slug input to validate.
 * @returns Validation result with normalized slug or error message.
 */
export function validateProjectSlug(input: unknown): SlugValidationResult {
  if (typeof input !== "string") {
    return { error: "Slug must be a string", valid: false };
  }

  const slug = input.trim();
  if (slug.length === 0) {
    return { error: "Slug cannot be empty", valid: false };
  }
  if (slug.length > VALIDATION.MAX_SLUG_LENGTH) {
    return {
      error: `Slug exceeds maximum length of ${VALIDATION.MAX_SLUG_LENGTH}`,
      valid: false,
    };
  }
  if (!VALIDATION.SLUG_PATTERN.test(slug)) {
    return {
      error:
        "Slug contains invalid characters (only letters, numbers, dots, hyphens, and underscores allowed)",
      valid: false,
    };
  }

  return { slug, valid: true };
}

/**
 * Converts a project date string into a sortable timestamp.
 * @param date - The optional project date string.
 * @returns A sortable numeric timestamp, or `0` when the date is invalid.
 */
function dateToTime(date: null | string | undefined): number {
  if (!date) return 0;
  const time = new Date(date).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/**
 * Rejects blocked schemes before normalization so invalid content stays inert.
 * @param value - The raw link candidate to inspect.
 * @returns `true` when the candidate uses a blocked URL scheme.
 */
function hasBlockedScheme(value: string): boolean {
  return /^(?:javascript|data|vbscript|file):/i.test(value.trim());
}

/**
 * Builds the Redis key used for a project's pageview counter.
 * @param slug - The validated project slug.
 * @returns The Redis key for the project's pageview counter.
 */
function projectPageviewsKey(slug: string): string {
  return ["pageviews", "projects", slug].join(":");
}

/**
 * Normalizes a project live URL only when the raw input is allowed.
 * @param url - The raw project live URL from content.
 * @returns A normalized safe live URL, or an empty string when invalid.
 */
function toSafeExternalHref(url?: string): string {
  if (!url || hasBlockedScheme(url)) return "";

  const normalizedUrl = normalizeExternalHref(url);
  return isSafeExternalUrl(normalizedUrl) ? normalizedUrl : "";
}

/**
 * Normalizes a repository reference only when the raw input is allowed.
 * @param repository - The raw repository reference from content.
 * @returns A normalized safe repository URL, or an empty string when invalid.
 */
function toSafeRepositoryHref(repository?: string): string {
  if (!repository || hasBlockedScheme(repository)) return "";

  const repositoryHref = normalizeRepoHref(repository);
  return isSafeExternalUrl(repositoryHref) ? repositoryHref : "";
}

/**
 * Normalizes Redis view-count values into a safe non-negative integer.
 * @param value - The raw value returned by Redis.
 * @returns A safe non-negative view count.
 */
function toSafeViewCount(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }
  return 0;
}
