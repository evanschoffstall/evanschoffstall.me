import { allProjects } from "contentlayer/generated";

import { HomeSections } from "@/features/home";
import {
  getProjectViews,
  groupAndSortProjects,
  pickFeaturedProjects,
} from "@/features/projects";
import { ANIMATION } from "@/lib";
import { ParticlesBackground } from "@/ui";

export const revalidate = 60;

export default async function Home() {
  const views = await getProjectViews(
    allProjects.map((project) => project.slug),
  );
  const featuredSelection = pickFeaturedProjects(allProjects);

  const grouped = featuredSelection
    ? groupAndSortProjects(allProjects, [
        featuredSelection.featured.slug,
        featuredSelection.second.slug,
        featuredSelection.third.slug,
      ])
    : null;

  const projectData =
    featuredSelection && grouped
      ? {
          featured: featuredSelection.featured,
          second: featuredSelection.second,
          sorted: grouped.sorted,
          sortedContributions: grouped.sortedContributions,
          sortedLegacy: grouped.sortedLegacy,
          third: featuredSelection.third,
          views,
        }
      : null;

  return (
    <div className="relative w-full">
      <ParticlesBackground quantity={ANIMATION.DEFAULT_PARTICLE_QUANTITY} />
      <HomeSections projectData={projectData} />
    </div>
  );
}
