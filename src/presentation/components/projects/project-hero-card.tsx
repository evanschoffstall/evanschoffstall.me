import {
  formatCompactNumber,
  formatDateTime,
  formatMediumDate,
} from "@/shared/lib/format";
import { saveProjectsScrollPosition } from "@/shared/lib/projects-scroll";
import type { Project } from "contentlayer/generated";
import { ArrowRight, Eye, Star } from "lucide-react";
import Link from "next/link";
import { Card } from "../common/card";
import { FeaturedCard } from "../common/featured-card";
import { Glow } from "../common/glow";

type Props = {
  project: Project;
  views: number;
  headingId?: string;
  featured?: boolean;
};

export function ProjectHeroCard({
  project,
  views,
  headingId,
  featured = false,
}: Props) {
  const dateTime = project.date ? formatDateTime(project.date) : "";
  const Wrapper = featured ? FeaturedCard : Card;

  return (
    <>
      <Glow />
      <Wrapper>
        <Link
          href={`/projects/${project.slug}`}
          onClick={saveProjectsScrollPosition}
        >
          <article className="relative flex flex-col justify-between h-full p-4 md:p-6">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {featured && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-900/30 px-2 py-0.5 text-[11px] font-semibold text-amber-400 ring-1 ring-inset ring-amber-700/50 group-hover:ring-amber-600/60 group-hover:text-amber-300 transition-colors duration-300">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      Featured
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-md bg-zinc-800/50 px-2 py-0.5 text-[11px] font-medium text-zinc-500 ring-1 ring-inset ring-zinc-700/50 group-hover:text-zinc-400 group-hover:ring-zinc-600 transition-colors duration-300">
                    {project.date && dateTime ? (
                      <time dateTime={dateTime}>
                        {formatMediumDate(project.date)}
                      </time>
                    ) : (
                      "SOON"
                    )}
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-zinc-500 tabular-nums group-hover:text-zinc-400 transition-colors duration-300">
                  <Eye className="w-3.5 h-3.5" /> {formatCompactNumber(views)}
                </span>
              </div>

              <h2
                id={headingId}
                className={`mt-3 text-xl font-bold tracking-tight sm:text-2xl font-display transition-colors duration-300 ${
                  featured
                    ? "text-zinc-100 group-hover:text-amber-50"
                    : "text-zinc-100 group-hover:text-white"
                }`}
              >
                {project.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300 line-clamp-3 transition-colors duration-300">
                {project.description}
              </p>
            </div>
            <div
              className={`flex items-center gap-1 mt-4 text-xs font-medium transition-colors duration-300 ${
                featured
                  ? "text-amber-700/70 group-hover:text-amber-400"
                  : "text-zinc-500 group-hover:text-zinc-300"
              }`}
            >
              <span>Read more</span>
              <ArrowRight className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </article>
        </Link>
      </Wrapper>
    </>
  );
}
