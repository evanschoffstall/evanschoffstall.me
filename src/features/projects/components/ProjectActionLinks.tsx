import Link from "next/link";

import type { ProjectExternalLinks } from "@/features/projects/model";

import { RepositoryIcon } from "@/components";

/** Project action metadata used to render sorted external links. */
interface ProjectActionLink {
  href: string;
  icon: React.ReactNode;
  label: string;
}

/**
 * Normalized external repository and live-site links for the current project.
 */
interface ProjectActionLinksProps {
  className?: string;
  linkClassName?: string;
  links: ProjectExternalLinks;
}

const defaultProjectActionLinkClassName = `
  inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/50
  bg-zinc-800/40 px-3 py-1.5 text-xs font-medium text-zinc-300
  transition-all duration-200
  hover:border-zinc-600 hover:bg-zinc-700/60 hover:text-white
`;

/**
 * Shared external project action row used by both home and detail surfaces.
 * @param props - The normalized external links available for the current project.
 * @returns The external action row, or `null` when the project has no safe links.
 */
export function ProjectActionLinks(props: ProjectActionLinksProps) {
  const {
    className = "flex flex-wrap items-center justify-center gap-2",
    linkClassName = defaultProjectActionLinkClassName,
    links,
  } = props;

  if (!links.repositoryHref && !links.liveHref) {
    return null;
  }

  const actionLinks = resolveProjectActionLinks(links);

  return (
    <div className={className}>
      {actionLinks.map((actionLink) => (
        <Link
          className={linkClassName}
          href={actionLink.href}
          key={actionLink.label}
          rel="noopener noreferrer"
          target="_blank"
        >
          {actionLink.label} {actionLink.icon}
        </Link>
      ))}
    </div>
  );
}

/**
 * Icon used for the live-site action button.
 * @returns The inline SVG external-link icon.
 */
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

/**
 * Resolves project action links ordered from widest label to narrowest label.
 * @param links - The normalized external links available for the current project.
 * @returns The project action links sorted by descending label length.
 */
function resolveProjectActionLinks(
  links: ProjectExternalLinks,
): ProjectActionLink[] {
  const actionLinks: ProjectActionLink[] = [];

  if (links.liveHref) {
    actionLinks.push({
      href: links.liveHref,
      icon: <ExternalLinkIcon />,
      label: "Live site",
    });
  }

  if (links.repositoryHref) {
    actionLinks.push({
      href: links.repositoryHref,
      icon: <RepositoryIcon className="size-3" />,
      label: "Repository",
    });
  }

  return actionLinks.sort((first, second) => {
    return second.label.length - first.label.length;
  });
}
