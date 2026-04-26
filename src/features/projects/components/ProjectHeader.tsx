"use client";

import { ArrowLeft, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

import { SocialIconLinks } from "@/components";
import {
  consumeInternalProjectNavigation,
  resolveProjectBackNavigation,
} from "@/features/projects/browser";
import { resolveProjectExternalLinks } from "@/features/projects/model";
import { formatCompactNumber } from "@/shared";

import { ProjectActionLinks } from "./ProjectActionLinks";

interface HeaderNavigationProps {
  onBack: () => void;
  views: number;
}

interface ProjectHeaderContentProps {
  hasReadme: boolean;
  links: ReturnType<typeof resolveProjectExternalLinks>;
  project: ProjectHeaderProps["project"];
}

interface ProjectHeaderProps {
  /**
   * When true the README takes over as the page title and description, so the
   * hero collapses to just the link buttons — no duplicate title/description.
   */
  hasReadme: boolean;
  project: {
    description: string;
    repository?: string;
    title: string;
    url?: string;
  };
  views: number;
}

/**
 * Project detail hero with back navigation, view count, and project actions.
 * @param props - README state, project metadata, and public view count for the page.
 * @returns The project detail header with navigation and action links.
 */
export function ProjectHeader(props: ProjectHeaderProps) {
  const { hasReadme, project, views } = props;

  const router = useRouter();
  const links = resolveProjectExternalLinks(project);

  /**
   * Resolves the correct back-navigation behavior for the current visit.
   */
  const handleBack = () => {
    const backNavigation = resolveProjectBackNavigation(
      window.location.pathname,
      document.referrer,
      consumeInternalProjectNavigation(),
    );

    if (backNavigation.kind === "history-back") {
      router.back();
      return;
    }

    router.push(backNavigation.href);
  };

  return (
    <header className="relative isolate overflow-hidden">
      <HeaderNavigation onBack={handleBack} views={views} />
      <ProjectHeaderContent
        hasReadme={hasReadme}
        links={links}
        project={project}
      />
    </header>
  );
}

/**
 * Renders the fixed navigation row shown at the top of a project page.
 * @param props - The back handler and public view count to display.
 * @returns The fixed header navigation row.
 */
function HeaderNavigation(props: HeaderNavigationProps) {
  const { onBack, views } = props;

  return (
    <div
      className="
      fixed inset-x-0 top-0 z-50 border-b border-transparent bg-zinc-900/0
      backdrop-blur
    "
    >
      <div
        className="
        flex flex-row items-center justify-between px-4 py-3
        sm:px-6
      "
      >
        <button
          aria-label="Go back"
          className="
            text-zinc-400 duration-200
            hover:text-zinc-100
          "
          onClick={onBack}
          type="button"
        >
          <ArrowLeft className="size-6" />
        </button>

        <div className="flex items-center gap-1">
          <span
            className="
            mr-1 flex items-center gap-1 text-xs tabular-nums text-zinc-600
          "
          >
            <Eye className="size-3" /> {formatCompactNumber(views)}
          </span>
          <SocialIconLinks />
        </div>
      </div>
    </div>
  );
}

/**
 * Renders the main content block inside the project header.
 * @param props - README state, normalized links, and project copy for the hero.
 * @returns The centered project header content block.
 */
function ProjectHeaderContent(props: ProjectHeaderContentProps) {
  const { hasReadme, links, project } = props;

  return (
    <div
      className={`
        container relative isolate mx-auto overflow-hidden
        ${
          hasReadme
            ? `pb-6 pt-20`
            : `
          py-16
          sm:py-20
        `
        }
      `}
    >
      <div
        className="
        mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 text-center
        lg:px-8
      "
      >
        {!hasReadme ? (
          <>
            <h1
              className="
              font-display text-4xl font-bold tracking-tight text-white
              sm:text-6xl
            "
            >
              {project.title}
            </h1>
            <p className="text-lg leading-8 text-zinc-400">
              {project.description}
            </p>
          </>
        ) : null}

        <ProjectActionLinks links={links} />
      </div>
    </div>
  );
}
