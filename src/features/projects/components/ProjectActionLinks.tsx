import Link from "next/link";

import type { ProjectExternalLinks } from "@/features/projects/model";

import { RepositoryIcon } from "@/ui";

interface ProjectActionLinksProps {
  links: ProjectExternalLinks;
}

/** Shared external project action row used by both home and detail surfaces. */
export function ProjectActionLinks({ links }: ProjectActionLinksProps) {
  if (!links.repositoryHref && !links.liveHref) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {links.liveHref ? (
        <Link
          className="
            inline-flex items-center gap-1.5 rounded-lg border
            border-zinc-700/50 bg-zinc-800/40 px-3 py-1.5 text-xs font-medium
            text-zinc-300 transition-all duration-200
            hover:border-zinc-600 hover:bg-zinc-700/60 hover:text-white
          "
          href={links.liveHref}
          rel="noopener noreferrer"
          target="_blank"
        >
          Live site <ExternalLinkIcon />
        </Link>
      ) : null}
      {links.repositoryHref ? (
        <Link
          className="
            inline-flex items-center gap-1.5 rounded-lg border
            border-zinc-700/50 bg-zinc-800/40 px-3 py-1.5 text-xs font-medium
            text-zinc-300 transition-all duration-200
            hover:border-zinc-600 hover:bg-zinc-700/60 hover:text-white
          "
          href={links.repositoryHref}
          rel="noopener noreferrer"
          target="_blank"
        >
          Repository <RepositoryIcon className="size-3" />
        </Link>
      ) : null}
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}