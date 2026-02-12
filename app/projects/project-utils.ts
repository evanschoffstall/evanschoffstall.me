import type { Project } from "contentlayer/generated";

export const FEATURED_PROJECT_SLUGS = {
  featured: "librerss",
  top2: "example-traefik-multitenant-ssl",
  top3: "evanschoffstall.me",
} as const;

function dateToTime(date: string | null | undefined): number {
  if (!date) return 0;
  const time = new Date(date).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function pickFeaturedProjects(projects: Project[]) {
  const published = projects.filter((p) => p.published);

  const featured = published.find(
    (p) => p.slug === FEATURED_PROJECT_SLUGS.featured,
  );
  const top2 = published.find((p) => p.slug === FEATURED_PROJECT_SLUGS.top2);
  const top3 = published.find((p) => p.slug === FEATURED_PROJECT_SLUGS.top3);

  return { featured, top2, top3 };
}

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

  return { sorted, sortedLegacy, sortedContributions };
}
