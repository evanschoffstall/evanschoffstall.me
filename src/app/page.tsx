import { getProjectViews } from "@/application/services/pageviews";
import { groupAndSortProjects, pickFeaturedProjects } from "@/domain/projects/policies/project-selection";
import { HomeSections } from "@/presentation/components/home/home-sections";
import { ParticlesBackground } from "@/presentation/components/home/particles-background";
import { allProjects } from "contentlayer/generated";

export const revalidate = 60;

export default async function Home() {
  const views = await getProjectViews(allProjects.map((project) => project.slug));
  const { featured, top2, top3 } = pickFeaturedProjects(allProjects);

  const grouped = featured && top2 && top3
    ? groupAndSortProjects(allProjects, [featured.slug, top2.slug, top3.slug])
    : null;

  const projectData = featured && top2 && top3 && grouped
    ? {
      featured,
      top2,
      top3,
      sorted: grouped.sorted,
      sortedContributions: grouped.sortedContributions,
      sortedLegacy: grouped.sortedLegacy,
      views,
    }
    : null;

  return (
    <div className="relative w-full min-h-screen pb-16">
      <ParticlesBackground quantity={200} />
      <HomeSections projectData={projectData} />
    </div>
  );
}
