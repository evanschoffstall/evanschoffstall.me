"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

import type { HomeProjectData } from "@/features/home/model";

import { useProjectsSectionState } from "@/features/home/hooks";
import { ANIMATION } from "@/shared";

import { HomeContent } from "./HomeContent";
import { HomeProjectsPanel, preloadProjectsContent } from "./HomeProjectsPanel";

interface HomeSectionProps {
  hasResolvedInitialHash: boolean;
  onViewProjects: () => void;
  projectData: HomeProjectData | null;
  shouldSkipHomeAnimations: boolean;
}

interface Props {
  projectData: HomeProjectData | null;
}

/**
 * Coordinates the home and projects sections for the landing page shell.
 * @param props - The precomputed project data used by the home and projects surfaces.
 * @returns The home section or the projects overlay, depending on navigation state.
 */
export function HomeSections(props: Props) {
  const { projectData } = props;

  const {
    handleBack,
    handleViewProjects,
    hasResolvedInitialHash,
    projectsViewportRef,
    showProjects,
    skipHomeIntro,
    skipInitialProjectsEnter,
  } = useProjectsSectionState();
  usePreloadProjectsContent();

  const shouldSkipHomeAnimations = skipHomeIntro || !hasResolvedInitialHash;

  return (
    <div className="relative">
      {showProjects ? null : (
        <HomeSection
          hasResolvedInitialHash={hasResolvedInitialHash}
          onViewProjects={handleViewProjects}
          projectData={projectData}
          shouldSkipHomeAnimations={shouldSkipHomeAnimations}
        />
      )}

      <AnimatePresence initial={false}>
        {showProjects ? (
          <HomeProjectsPanel
            key="projects"
            onBack={handleBack}
            projectData={projectData}
            projectsViewportRef={projectsViewportRef}
            skipInitialProjectsEnter={skipInitialProjectsEnter}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * Checks whether the browser exposes `requestIdleCallback` before scheduling preload work.
 * @returns `true` when idle callbacks are available in the current browser.
 */
function hasRequestIdleCallback(): boolean {
  return typeof window.requestIdleCallback === "function";
}

/**
 * Renders the interactive home section while the projects panel is hidden.
 * @param props - Visibility state, project data, and callbacks required for the home view.
 * @returns The animated home section container.
 */
function HomeSection(props: HomeSectionProps) {
  const {
    hasResolvedInitialHash,
    onViewProjects,
    projectData,
    shouldSkipHomeAnimations,
  } = props;

  return (
    <motion.section
      animate={{ opacity: 1 }}
      className={
        hasResolvedInitialHash
          ? "pointer-events-auto"
          : "pointer-events-none invisible"
      }
      initial={shouldSkipHomeAnimations ? false : { opacity: 0 }}
      transition={
        shouldSkipHomeAnimations
          ? { duration: 0 }
          : { duration: ANIMATION.FADE_DURATION, ease: ANIMATION.EASE }
      }
    >
      <HomeContent
        featuredProject={projectData?.featured}
        featuredViews={
          projectData ? (projectData.views[projectData.featured.slug] ?? 0) : 0
        }
        key={shouldSkipHomeAnimations ? "home-settled" : "home-intro"}
        onViewProjects={onViewProjects}
        skipInitialAnimations={shouldSkipHomeAnimations}
      />
    </motion.section>
  );
}

/**
 * Preloads the projects bundle during idle time so opening the overlay stays responsive.
 */
function usePreloadProjectsContent(): void {
  useEffect(() => {
    /**
     * Triggers the projects chunk preload when the browser grants idle time.
     */
    const preload = () => {
      preloadProjectsContent();
    };

    if (hasRequestIdleCallback()) {
      const idleCallbackId = window.requestIdleCallback(preload, {
        timeout: 1000,
      });

      return () => {
        window.cancelIdleCallback(idleCallbackId);
      };
    }

    const timeoutId = window.setTimeout(preload, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);
}
