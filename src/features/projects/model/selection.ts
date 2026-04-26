import type { Project } from "contentlayer/generated";

const FEATURED_PROJECT_SLUGS = {
  featured: "librerss",
  second: "example-traefik-multitenant-ssl",
  third: "gitaicmt",
} as const;

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

  const published = projects.filter((p) => p.published);

  const sorted = published
    .filter((p) => !p.contributor)
    .filter((p) => !p.legacy)
    .filter((p) => !exclude.has(p.slug))
    .sort((a, b) => dateToTime(b.date) - dateToTime(a.date));

  const sortedLegacy = published
    .filter((p) => p.legacy)
    .sort((a, b) => dateToTime(b.date) - dateToTime(a.date));

  const sortedContributions = published
    .filter((p) => p.contributor)
    .filter((p) => !exclude.has(p.slug))
    .sort((a, b) => dateToTime(b.date) - dateToTime(a.date));

  return { sorted, sortedContributions, sortedLegacy };
}

/**
 * Picks the three featured projects, preferring configured slugs when available.
 * @param projects - The project list loaded from content.
 * @returns The featured trio, or `null` when fewer than three published projects exist.
 */
export function pickFeaturedProjects(projects: Project[]) {
  const published = projects.filter((p) => p.published);
  if (published.length < 3) {
    return null;
  }

  const preferredOrder = [
    FEATURED_PROJECT_SLUGS.featured,
    FEATURED_PROJECT_SLUGS.second,
    FEATURED_PROJECT_SLUGS.third,
  ];

  const preferred = preferredOrder
    .map((slug) => published.find((p) => p.slug === slug))
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

  if (selected.length < 3) {
    return null;
  }

  const [featured, second, third] = selected;
  return { featured, second, third };
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
