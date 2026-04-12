import type { Project } from "contentlayer/generated";

/** Aggregated project collections needed by the home projects panel. */
export interface HomeProjectData {
  featured: Project;
  second: Project;
  sorted: Project[];
  sortedContributions: Project[];
  sortedLegacy: Project[];
  third: Project;
  views: Record<string, number>;
}