import { formatCompactNumber, formatMediumDate } from "@/lib/format";
import type { Project } from "contentlayer/generated";
import { ArrowRight, Eye } from "lucide-react";
import Link from "next/link";
import { Card } from "../components/card";
import { Glow } from "../components/glow";

type Props = {
  project: Project;
  views: number;
  headingId?: string;
};

export function ProjectHeroCard({ project, views, headingId }: Props) {
  const dateObj = project.date ? new Date(project.date) : null;
  const dateTime = dateObj && !Number.isNaN(dateObj.getTime()) ? dateObj.toISOString() : null;

  return (
    <>
      <Glow />
      <Card>
        <Link href={`/projects/${project.slug}`}>
          <article className="relative flex flex-col justify-between h-full p-4 md:p-6">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center rounded-md bg-zinc-800/50 px-2 py-0.5 text-[11px] font-medium text-zinc-500 ring-1 ring-inset ring-zinc-700/50 group-hover:text-zinc-400 group-hover:ring-zinc-600 transition-colors duration-300">
                  {project.date && dateTime ? (
                    <time dateTime={dateTime}>{formatMediumDate(project.date)}</time>
                  ) : (
                    "SOON"
                  )}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-zinc-500 tabular-nums group-hover:text-zinc-400 transition-colors duration-300">
                  <Eye className="w-3.5 h-3.5" /> {formatCompactNumber(views)}
                </span>
              </div>

              <h2
                id={headingId}
                className="mt-3 text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white sm:text-2xl font-display"
              >
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
    </>
  );
}
