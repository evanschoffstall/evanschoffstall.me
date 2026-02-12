import { getProjectViews } from "@/lib/pageviews";
import { allProjects } from "contentlayer/generated";
import { Navigation } from "../components/nav";
import { ParticlesBackground } from "../components/particles-background";
import { groupAndSortProjects, pickFeaturedProjects } from "./project-utils";
import { ProjectsContent } from "./projects-content";

export const revalidate = 60;
export default async function ProjectsPage() {
  const views = await getProjectViews(allProjects.map((p) => p.slug));

  const { featured, top2, top3 } = pickFeaturedProjects(allProjects);

  if (!featured || !top2 || !top3) {
    return (
      <div className="relative w-full min-h-screen pb-16 pt-16">
        <ParticlesBackground quantity={200} />
        <Navigation />
        <div className="px-6 mx-auto max-w-7xl lg:px-8 text-center py-20">
          <p className="text-zinc-400">Some featured projects are not available.</p>
        </div>
      </div>
    );
  }

  const { sorted, sortedLegacy, sortedContributions } = groupAndSortProjects(
    allProjects,
    [featured.slug, top2.slug, top3.slug],
  );

  return (
    <div className="relative w-full min-h-screen pb-16 pt-16">
      <ParticlesBackground quantity={200} />
      <Navigation />
      <ProjectsContent
        featured={featured}
        top2={top2}
        top3={top3}
        sorted={sorted}
        sortedContributions={sortedContributions}
        sortedLegacy={sortedLegacy}
        views={views}
      />
    </div>
  );
}
