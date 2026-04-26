import type { Project } from "contentlayer/generated";

import { Eye, Star } from "lucide-react";

import {
  formatCompactNumber,
  formatDateTime,
  formatMediumDate,
} from "@/shared";

/**
 * Project date input needed to render the normalized release-date badge.
 */
interface ProjectDateBadgeProps {
  project: Pick<Project, "date">;
}

/**
 * Flag that decides whether the featured badge should render.
 */
interface ProjectFeatureBadgeProps {
  featured: boolean;
}

/**
 * Display options and public view count for the shared views badge.
 */
interface ProjectViewsBadgeProps {
  className?: string;
  iconClassName?: string;
  views: number;
}

/**
 * Shared date badge for project list and hero cards.
 * @param props - The project date data used to render the badge.
 * @returns The normalized project date badge.
 */
export function ProjectDateBadge(props: ProjectDateBadgeProps) {
  const { project } = props;

  const dateTime = project.date ? formatDateTime(project.date) : "";

  return (
    <span
      className="
      inline-flex items-center rounded-md bg-zinc-800/50 px-2 py-0.5 text-[11px]
      font-medium text-zinc-500 ring-1 ring-inset ring-zinc-700/50
      transition-colors duration-300
      group-hover:text-zinc-400 group-hover:ring-zinc-600
    "
    >
      {project.date && dateTime ? (
        <time dateTime={dateTime}>{formatMediumDate(project.date)}</time>
      ) : (
        "SOON"
      )}
    </span>
  );
}

/**
 * Featured-project badge used only by the highlighted hero card.
 * @param props - The featured flag that determines whether the badge is rendered.
 * @returns The featured badge, or `null` when the card is not featured.
 */
export function ProjectFeatureBadge(props: ProjectFeatureBadgeProps) {
  const { featured } = props;

  if (!featured) {
    return null;
  }

  return (
    <span
      className="
      inline-flex items-center gap-1 rounded-md bg-amber-900/30 px-2 py-0.5
      text-[11px] font-semibold text-amber-400 ring-1 ring-inset
      ring-amber-700/50 transition-colors duration-300
      group-hover:text-amber-300 group-hover:ring-amber-600/60
    "
    >
      <Star className="size-2.5 fill-current" />
      Featured
    </span>
  );
}

/**
 * Shared project views badge for list and hero cards.
 * @param props - Presentation overrides and the current project view count.
 * @returns The formatted view-count badge.
 */
export function ProjectViewsBadge(props: ProjectViewsBadgeProps) {
  const { className = "", iconClassName = "size-3.5", views } = props;

  return (
    <span className={className}>
      <Eye className={iconClassName} />
      {formatCompactNumber(views)}
    </span>
  );
}
