"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

import type { HomeProjectData } from "@/features/home/model";

import { useProjectsSectionState } from "@/features/home/hooks";
import { ANIMATION } from "@/lib";

import { HomeContent } from "./HomeContent";
import {
  HomeProjectsPanel,
  preloadProjectsContent,
} from "./HomeProjectsPanel";

interface Props {
  projectData: HomeProjectData | null;
}

export function HomeSections({ projectData }: Props) {
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

function hasRequestIdleCallback(): boolean {
  return typeof window.requestIdleCallback === "function";
}

function HomeSection({
  hasResolvedInitialHash,
  onViewProjects,
  projectData,
  shouldSkipHomeAnimations,
}: {
  hasResolvedInitialHash: boolean;
  onViewProjects: () => void;
  projectData: HomeProjectData | null;
  shouldSkipHomeAnimations: boolean;
}) {
  return (
    <motion.section
      animate={{ opacity: 1 }}
      className={hasResolvedInitialHash
        ? "pointer-events-auto"
        : "pointer-events-none invisible"}
      initial={shouldSkipHomeAnimations ? false : { opacity: 0 }}
      transition={shouldSkipHomeAnimations
        ? { duration: 0 }
        : { duration: ANIMATION.FADE_DURATION, ease: ANIMATION.EASE }}
    >
      <HomeContent
        featuredProject={projectData?.featured}
        featuredViews={
          projectData
            ? (projectData.views[projectData.featured.slug] ?? 0)
            : 0
        }
        key={shouldSkipHomeAnimations ? "home-settled" : "home-intro"}
        onViewProjects={onViewProjects}
        skipInitialAnimations={shouldSkipHomeAnimations}
      />
    </motion.section>
  );
}

function usePreloadProjectsContent(): void {
  useEffect(() => {
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
