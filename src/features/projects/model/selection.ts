import type { Project } from "contentlayer/generated";

const FEATURED_PROJECT_SLUGS = {
  featured: "librerss",
  second: "example-traefik-multitenant-ssl",
  third: "gitaicmt",
} as const;

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

function dateToTime(date: null | string | undefined): number {
  if (!date) return 0;
  const time = new Date(date).getTime();
  return Number.isNaN(time) ? 0 : time;
}
