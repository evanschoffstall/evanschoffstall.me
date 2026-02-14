import { getProjectViews } from "@/lib/pageviews";
import { allProjects } from "contentlayer/generated";
import { HomeSections } from "./components/home-sections";
import { ParticlesBackground } from "./components/particles-background";
import { groupAndSortProjects, pickFeaturedProjects } from "./projects/project-utils";

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
