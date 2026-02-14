import { formatCompactNumber, formatDateTime, formatMediumDate } from "@/shared/lib/format";
import type { Project } from "contentlayer/generated";
import { ArrowRight, Eye } from "lucide-react";
import Link from "next/link";

type Props = {
  project: Project;
  views: number;
};

export function Article({ project, views }: Props) {
  const dateTime = project.date ? formatDateTime(project.date) : "";

  return (
    <Link href={`/projects/${project.slug}`}>
      <article className="flex items-center justify-between gap-4 p-4 md:px-6 md:py-5 h-full">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold tracking-tight text-zinc-100 group-hover:text-white font-display truncate transition-colors duration-300">
              {project.title}
            </h2>
            <span className="shrink-0 inline-flex items-center rounded-md bg-zinc-800/50 px-2 py-0.5 text-[11px] font-medium text-zinc-500 ring-1 ring-inset ring-zinc-700/50 group-hover:text-zinc-400 group-hover:ring-zinc-600 transition-colors duration-300">
              {project.date && dateTime ? (
                <time dateTime={dateTime}>{formatMediumDate(project.date)}</time>
              ) : (
                "SOON"
              )}
            </span>
          </div>
          <p className="text-sm text-zinc-400 group-hover:text-zinc-300 line-clamp-1 transition-colors duration-300">
            {project.description}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-4 text-zinc-500">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs tabular-nums group-hover:text-zinc-400 transition-colors duration-300">
            <Eye className="w-3.5 h-3.5" />
            {formatCompactNumber(views)}
          </span>
          <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 group-hover:text-zinc-300 transition-all duration-300" />
        </div>
      </article>
    </Link>
  );
}
