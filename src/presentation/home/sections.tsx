"use client";

import { ANIMATION } from "@/shared/constants";
import {
  consumeProjectsScrollPosition,
  registerProjectsViewport,
} from "@/shared/projects-scroll";
import type { Project } from "contentlayer/generated";
import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ScrollArea } from "../common/scroll-area";
import { Navigation } from "../common/nav";
import { ProjectsContent } from "../projects/content";
import { HomeContent } from "./content";

type ProjectData = {
  featured: Project;
  second: Project;
  third: Project;
  sorted: Project[];
  sortedContributions: Project[];
  sortedLegacy: Project[];
  views: Record<string, number>;
};

type Props = {
  projectData: ProjectData | null;
};

export function HomeSections({ projectData }: Props) {
  const [showProjects, setShowProjects] = useState(false);
  const [skipInitialProjectsEnter, setSkipInitialProjectsEnter] =
    useState(false);
  /** Ref to the Radix ScrollArea Viewport inside the projects section. */
  const projectsViewportRef = useRef<HTMLDivElement>(null);

  const handleViewProjects = useCallback(() => {
    setSkipInitialProjectsEnter(false);
    setShowProjects(true);
    window.history.replaceState(null, "", "#projects");
  }, []);

  const handleBack = useCallback(() => {
    setShowProjects(false);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  useLayoutEffect(() => {
    const isProjectsHash = window.location.hash === "#projects";
    setSkipInitialProjectsEnter((previous) => previous || isProjectsHash);
    setShowProjects(isProjectsHash);
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      const isProjectsHash = window.location.hash === "#projects";
      setSkipInitialProjectsEnter((previous) => previous || isProjectsHash);
      setShowProjects(isProjectsHash);
    };

    window.addEventListener("hashchange", syncFromHash);

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, []);

  // Both home and projects views use ScrollArea — native body scroll is never needed.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Register the projects ScrollArea viewport for scroll-position tracking, and
  // restore the saved position when the projects view mounts (e.g. after back-nav).
  useEffect(() => {
    if (!showProjects) {
      registerProjectsViewport(null);
      return;
    }

    registerProjectsViewport(projectsViewportRef.current);

    const storedPosition = consumeProjectsScrollPosition();
    if (storedPosition === null) {
      return;
    }

    requestAnimationFrame(() => {
      if (projectsViewportRef.current) {
        projectsViewportRef.current.scrollTop = storedPosition;
      }
    });
  }, [showProjects]);

  return (
    <div className="relative">
      <motion.section
        animate={{ opacity: showProjects ? 0 : 1 }}
        transition={{ duration: ANIMATION.FADE_DURATION, ease: ANIMATION.EASE }}
        className={showProjects ? "hidden" : "pointer-events-auto"}
      >
        <HomeContent
          onViewProjects={handleViewProjects}
          featuredProject={projectData?.featured}
          featuredViews={
            projectData
              ? (projectData.views[projectData.featured.slug] ?? 0)
              : 0
          }
        />
      </motion.section>

      <AnimatePresence initial={false}>
        {showProjects ? (
          <motion.section
            id="projects"
            key="projects"
            className="h-screen overflow-hidden"
            initial={skipInitialProjectsEnter ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: ANIMATION.FADE_DURATION,
              ease: ANIMATION.EASE,
            }}
          >
            <ScrollArea
              className="h-full w-full"
              viewportRef={projectsViewportRef}
            >
              {/*
               * Zero-height Navigation placed at scroll-position 0 so the
               * IntersectionObserver can detect scroll and toggle the sticky
               * nav backdrop (transparent at top → blurred when scrolled away).
               * The inner fixed <div> overlays the viewport; the pt-20 wrapper
               * below clears the nav height for normal content flow.
               */}
              <Navigation onBack={handleBack} />
              <div className="pt-20 md:pt-24">
                {projectData ? (
                  <ProjectsContent
                    featured={projectData.featured}
                    second={projectData.second}
                    third={projectData.third}
                    sorted={projectData.sorted}
                    sortedContributions={projectData.sortedContributions}
                    sortedLegacy={projectData.sortedLegacy}
                    views={projectData.views}
                  />
                ) : (
                  <div className="px-6 mx-auto max-w-7xl lg:px-8 py-16 md:py-24">
                    <p className="text-zinc-400">
                      Some featured projects are not available.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
