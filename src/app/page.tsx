import { getProjectViews } from "@/application/pageviews";
import {
  groupAndSortProjects,
  pickFeaturedProjects,
} from "@/domain/projects/selection";
import { HomeSections } from "@/presentation/home/sections";
import { ParticlesBackground } from "@/presentation/home/particles-background";
import { ANIMATION } from "@/shared/constants";
import { allProjects } from "contentlayer/generated";

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
          third: featuredSelection.third,
          sorted: grouped.sorted,
          sortedContributions: grouped.sortedContributions,
          sortedLegacy: grouped.sortedLegacy,
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
