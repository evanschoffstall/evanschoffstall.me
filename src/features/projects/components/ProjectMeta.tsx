import type { Project } from "contentlayer/generated";

import { Eye, Star } from "lucide-react";

import {
  formatCompactNumber,
  formatDateTime,
  formatMediumDate,
} from "@/lib";

interface ProjectDateBadgeProps {
  project: Pick<Project, "date">;
}

interface ProjectFeatureBadgeProps {
  featured: boolean;
}

interface ProjectViewsBadgeProps {
  className?: string;
  iconClassName?: string;
  views: number;
}

/** Shared date badge for project list and hero cards. */
export function ProjectDateBadge({ project }: ProjectDateBadgeProps) {
  const dateTime = project.date ? formatDateTime(project.date) : "";

  return (
    <span className="
      inline-flex items-center rounded-md bg-zinc-800/50 px-2 py-0.5 text-[11px]
      font-medium text-zinc-500 ring-1 ring-inset ring-zinc-700/50
      transition-colors duration-300
      group-hover:text-zinc-400 group-hover:ring-zinc-600
    ">
      {project.date && dateTime ? (
        <time dateTime={dateTime}>{formatMediumDate(project.date)}</time>
      ) : (
        "SOON"
      )}
    </span>
  );
}

/** Featured-project badge used only by the highlighted hero card. */
export function ProjectFeatureBadge({ featured }: ProjectFeatureBadgeProps) {
  if (!featured) {
    return null;
  }

  return (
    <span className="
      inline-flex items-center gap-1 rounded-md bg-amber-900/30 px-2 py-0.5
      text-[11px] font-semibold text-amber-400 ring-1 ring-inset
      ring-amber-700/50 transition-colors duration-300
      group-hover:text-amber-300 group-hover:ring-amber-600/60
    ">
      <Star className="size-2.5 fill-current" />
      Featured
    </span>
  );
}

/** Shared project views badge for list and hero cards. */
export function ProjectViewsBadge({
  className = "",
  iconClassName = "size-3.5",
  views,
}: ProjectViewsBadgeProps) {
  return (
    <span className={className}>
      <Eye className={iconClassName} />
      {formatCompactNumber(views)}
    </span>
  );
}