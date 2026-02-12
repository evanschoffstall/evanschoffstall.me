import { redis } from "@/lib/redis";
import { allProjects } from "contentlayer/generated";
import { Navigation } from "../components/nav";
import Particles from "../components/particles";
import { ProjectsContent } from "./projects-content";

export const revalidate = 60;
export default async function ProjectsPage() {
  const views = redis
    ? (
      await redis.mget<number[]>(
        ...allProjects.map((p) => ["pageviews", "projects", p.slug].join(":")),
      )
    ).reduce((acc, v, i) => {
      acc[allProjects[i].slug] = v ?? 0;
      return acc;
    }, {} as Record<string, number>)
    : {} as Record<string, number>;

  const featured = allProjects.find((project) => project.slug === "librerss" && project.published);
  const top2 = allProjects.find((project) => project.slug === "example-traefik-multitenant-ssl" && project.published);
  const top3 = allProjects.find((project) => project.slug === "evanschoffstall.me" && project.published);
  
  if (!featured || !top2 || !top3) {
    return (
      <div className="relative w-full min-h-screen pb-16 pt-16">
        <div className="fixed inset-0 -z-20 bg-gradient-to-tl from-black via-zinc-600/20 to-black" />
        <Particles className="fixed inset-0 -z-10 animate-fade-in" quantity={200} />
        <Navigation />
        <div className="px-6 mx-auto max-w-7xl lg:px-8 text-center py-20">
          <p className="text-zinc-400">Some featured projects are not available.</p>
        </div>
      </div>
    );
  }

  const sorted = allProjects
    .filter((p) => p.published)
    .filter((p) => !p.contributor)
    .filter((p) => !p.legacy)
    .filter(
      (project) => project.slug !== featured.slug &&
        project.slug !== top2.slug &&
        project.slug !== top3.slug
    )
    .sort(
      (a, b) =>
        new Date(b.date ?? Number.POSITIVE_INFINITY).getTime() -
        new Date(a.date ?? Number.POSITIVE_INFINITY).getTime()
    );

  const sortedLegacy = allProjects
    .filter((p) => p.published)
    .filter((p) => p.legacy)
    .sort(
      (a, b) =>
        new Date(b.date ?? Number.POSITIVE_INFINITY).getTime() -
        new Date(a.date ?? Number.POSITIVE_INFINITY).getTime()
    );

  const sortedContributions = allProjects
    .filter((p) => p.published)
    .filter((p) => p.contributor)
    .filter(
      (project) => project.slug !== featured.slug &&
        project.slug !== top2.slug &&
        project.slug !== top3.slug
    )
    .sort(
      (a, b) =>
        new Date(b.date ?? Number.POSITIVE_INFINITY).getTime() -
        new Date(a.date ?? Number.POSITIVE_INFINITY).getTime()
    );

  return (
    <div className="relative w-full min-h-screen pb-16 pt-16">
      <div className="fixed inset-0 -z-20 bg-gradient-to-tl from-black via-zinc-600/20 to-black" />
      <Particles className="fixed inset-0 -z-10 animate-fade-in" quantity={200} />
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
