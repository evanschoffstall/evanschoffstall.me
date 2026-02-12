import { redis } from "@/lib/redis";
import { allProjects } from "contentlayer/generated";
import { Eye, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card } from "../components/card";
import { Navigation } from "../components/nav";
import { Article } from "./article";

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
    : 0;

  const featured = allProjects.find((project) => project.slug === "librerss")!;
  const top2 = allProjects.find((project) => project.slug === "example-traefik-multitenant-ssl")!;
  const top3 = allProjects.find((project) => project.slug === "evanschoffstall.me")!;
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
    <div className="relative pb-16">
      <Navigation />
      <div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8 md:pt-24 lg:pt-32">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            Projects
          </h2>
          <p className="mt-4 text-zinc-400">
            Some of the projects are from work and some are on my own time.
          </p>
        </div>
        <div className="w-full h-px bg-zinc-800" />

        {/* Featured hero row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <Link href={`/projects/${featured.slug}`}>
              <article className="relative flex flex-col justify-between h-full p-4 md:p-6">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-md bg-zinc-800/50 px-2 py-0.5 text-[11px] font-medium text-zinc-500 ring-1 ring-inset ring-zinc-700/50 group-hover:text-zinc-400 group-hover:ring-zinc-600 transition-colors duration-300">
                      {featured.date ? (
                        <time dateTime={new Date(featured.date).toISOString()}>
                          {Intl.DateTimeFormat(undefined, {
                            dateStyle: "medium",
                          }).format(new Date(featured.date))}
                        </time>
                      ) : (
                        "SOON"
                      )}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-zinc-500 tabular-nums group-hover:text-zinc-400 transition-colors duration-300">
                      <Eye className="w-3.5 h-3.5" />{" "}
                      {Intl.NumberFormat("en-US", { notation: "compact" }).format(
                        views[featured.slug] ?? 0
                      )}
                    </span>
                  </div>

                  <h2
                    id="featured-post"
                    className="mt-3 text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white sm:text-2xl font-display"
                  >
                    {featured.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300 line-clamp-3 transition-colors duration-300">
                    {featured.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 mt-4 text-xs font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300">
                  <span>Read more</span>
                  <ArrowRight className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </article>
            </Link>
          </Card>
          {[top2, top3].map((project) => (
            <Card key={project.slug}>
              <Link href={`/projects/${project.slug}`}>
                <article className="relative flex flex-col justify-between h-full p-4 md:p-6">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-md bg-zinc-800/50 px-2 py-0.5 text-[11px] font-medium text-zinc-500 ring-1 ring-inset ring-zinc-700/50 group-hover:text-zinc-400 group-hover:ring-zinc-600 transition-colors duration-300">
                        {project.date ? (
                          <time dateTime={new Date(project.date).toISOString()}>
                            {Intl.DateTimeFormat(undefined, {
                              dateStyle: "medium",
                            }).format(new Date(project.date))}
                          </time>
                        ) : (
                          "SOON"
                        )}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-zinc-500 tabular-nums group-hover:text-zinc-400 transition-colors duration-300">
                        <Eye className="w-3.5 h-3.5" />{" "}
                        {Intl.NumberFormat("en-US", { notation: "compact" }).format(
                          views[project.slug] ?? 0
                        )}
                      </span>
                    </div>

                    <h2 className="mt-3 text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white sm:text-2xl font-display">
                      {project.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300 line-clamp-3 transition-colors duration-300">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 mt-4 text-xs font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300">
                    <span>Read more</span>
                    <ArrowRight className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </article>
              </Link>
            </Card>
          ))}
        </div>

        {/* Other projects — compact list */}
        {sorted.length > 0 && (
          <>
            <div className="w-full h-px bg-zinc-800" />
            <div className="space-y-2">
              {sorted.map((project) => (
                <Card key={project.slug}>
                  <Article project={project} views={views[project.slug] ?? 0} />
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Contributions — compact list */}
        {sortedContributions.length > 0 && (
          <>
            <div className="flex items-center gap-4 pt-4">
              <h3 className="text-lg font-semibold tracking-tight text-zinc-100 shrink-0">
                Contributions
              </h3>
              <div className="w-full h-px bg-zinc-800" />
            </div>
            <div className="space-y-2">
              {sortedContributions.map((project) => (
                <Card key={project.slug}>
                  <Article project={project} views={views[project.slug] ?? 0} />
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Legacy — compact list */}
        {sortedLegacy.length > 0 && (
          <>
            <div className="flex items-center gap-4 pt-4">
              <h3 className="text-lg font-semibold tracking-tight text-zinc-100 shrink-0">
                Legacy
              </h3>
              <div className="w-full h-px bg-zinc-800" />
            </div>
            <div className="space-y-2">
              {sortedLegacy.map((project) => (
                <Card key={project.slug}>
                  <Article project={project} views={views[project.slug] ?? 0} />
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
