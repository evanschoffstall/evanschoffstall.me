import type { Project } from "contentlayer/generated";
import type { PropsWithChildren } from "react";

import Link from "next/link";

import {
  markInternalProjectNavigation,
  saveProjectsScrollPosition,
} from "@/features/projects/browser";

interface ProjectCardLinkProps extends PropsWithChildren {
  project: Pick<Project, "slug">;
}

/** Shared link wrapper that preserves the projects list scroll position. */
export function ProjectCardLink({
  children,
  project,
}: ProjectCardLinkProps) {
  const handleClick = () => {
    markInternalProjectNavigation();
    saveProjectsScrollPosition();
  };

  return (
    <Link
      href={`/projects/${project.slug}`}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}