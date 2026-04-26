import type { Project } from "contentlayer/generated";
import type { PropsWithChildren } from "react";

import Link from "next/link";

import {
  markInternalProjectNavigation,
  saveProjectsScrollPosition,
} from "@/features/projects/browser";

/**
 * Linked project slug and wrapped content for a card that preserves list scroll state.
 */
interface ProjectCardLinkProps extends PropsWithChildren {
  project: Pick<Project, "slug">;
}

/**
 * Shared link wrapper that preserves the projects list scroll position.
 * @param props - The linked project slug and wrapped card content.
 * @returns The project detail link wrapper that preserves list scroll state.
 */
export function ProjectCardLink(props: ProjectCardLinkProps) {
  const { children, project } = props;

  /**
   * Marks the visit as internal and persists the current projects scroll position.
   */
  const handleClick = () => {
    markInternalProjectNavigation();
    saveProjectsScrollPosition();
  };

  return (
    <Link href={`/projects/${project.slug}`} onClick={handleClick}>
      {children}
    </Link>
  );
}
