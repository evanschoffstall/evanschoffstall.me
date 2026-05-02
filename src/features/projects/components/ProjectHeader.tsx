"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

import { SocialIconLinks } from "@/components";
import {
  consumeInternalProjectNavigation,
  requestHomeIntroSkip,
  resolveProjectBackNavigation,
} from "@/features/projects/browser";
import { resolveProjectExternalLinks } from "@/features/projects/model";
import { ANIMATION, formatCompactNumber } from "@/shared";

import { ProjectActionLinks } from "./ProjectActionLinks";

const headerChromeTransition = {
  duration: 0.5,
  ease: ANIMATION.EASE,
} as const;

const headerContentTransition = {
  delay: 0.04,
  duration: 0.76,
  ease: ANIMATION.EASE,
} as const;

/**
 * Back-navigation callback and current public view count shown in the fixed project header row.
 */
interface HeaderNavigationProps {
  links: ReturnType<typeof resolveProjectExternalLinks>;
  onBack: () => void;
  views: number;
}

/**
 * README state, outbound links, and project metadata needed by the main header content block.
 */
interface ProjectHeaderContentProps {
  hasReadme: boolean;
  project: ProjectHeaderProps["project"];
}

/**
 * Project detail header inputs, including hero copy, action links, and public view count.
 */
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

    if (backNavigation.skipHomeIntro) {
      requestHomeIntroSkip();
    }

    router.push(backNavigation.href);
  };

  return (
    <header className="relative isolate overflow-hidden">
      <HeaderNavigation links={links} onBack={handleBack} views={views} />
      <ProjectHeaderContent hasReadme={hasReadme} project={project} />
    </header>
  );
}

/**
 * Renders the fixed navigation row shown at the top of a project page.
 * @param props - The back handler and public view count to display.
 * @returns The fixed header navigation row.
 */
function HeaderNavigation(props: HeaderNavigationProps) {
  const { links, onBack, views } = props;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="
      fixed inset-x-0 top-0 z-50 border-b border-transparent bg-zinc-900/0
      backdrop-blur
    "
      initial={{ opacity: 0, y: -10 }}
      transition={headerChromeTransition}
    >
      <div
        className="
        flex flex-row items-center justify-between px-4 py-3
        sm:px-6
      "
      >
        <button
          aria-label="Back to project list"
          className="
            flex items-center gap-1.5 text-zinc-400 duration-200
            hover:text-zinc-100
          "
          onClick={onBack}
          type="button"
        >
          <ArrowLeft className="size-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div
          className="
          flex min-w-0 flex-1 items-center justify-end gap-1
        "
        >
          <ProjectActionLinks
            className="
              flex min-w-0 flex-nowrap items-center justify-end gap-1
            "
            linkClassName="
              inline-flex h-6 items-center justify-center gap-1 rounded-full
              border border-zinc-800 bg-zinc-900/40 px-2.5 text-[11px]
              font-medium text-zinc-500 transition-all duration-200
              hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200
              sm:h-7 sm:px-3 sm:text-xs
            "
            links={links}
          />
          <span
            className="
            inline-flex h-6 shrink-0 items-center justify-center gap-1
            rounded-full border border-zinc-800 bg-zinc-900/40 px-2
            text-[11px] font-medium tabular-nums text-zinc-500
            sm:h-7 sm:px-2.5 sm:text-xs
          "
          >
            <Eye className="size-3" />
            {formatCompactNumber(views)}
          </span>
          <SocialIconLinks />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Renders the main content block inside the project header.
 * @param props - README state, normalized links, and project copy for the hero.
 * @returns The centered project header content block.
 */
function ProjectHeaderContent(props: ProjectHeaderContentProps) {
  const { hasReadme, project } = props;

  if (hasReadme) {
    return <div className="pt-14" />;
  }

  return (
    <motion.div
      animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
      className="container relative isolate mx-auto overflow-hidden pb-4 pt-[5.75rem]"
      initial={{ filter: "blur(10px)", opacity: 0, y: 24 }}
      style={{ willChange: "opacity, transform, filter" }}
      transition={headerContentTransition}
    >
      <div
        className="
        mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 text-center
        lg:px-8
      "
      >
        <h1
          className="
              font-display text-4xl font-bold tracking-tight text-white
              sm:text-6xl
            "
        >
          {project.title}
        </h1>
        <p className="text-lg leading-8 text-zinc-400">{project.description}</p>
      </div>
    </motion.div>
  );
}
