"use client";

import { ANIMATION } from "@/shared/constants";
import { consumeProjectsScrollPosition } from "@/shared/lib/projects-scroll";
import type { Project } from "contentlayer/generated";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Navigation } from "../common/nav";
import { ProjectsContent } from "../projects/projects-content";
import { HomeContent } from "./home-content";

type ProjectData = {
  featured: Project;
  top2: Project;
  top3: Project;
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

  const handleViewProjects = useCallback(() => {
    setSkipInitialProjectsEnter(false);
    setShowProjects(true);
    window.history.replaceState(null, "", "#projects");
  }, []);

  const handleBack = useCallback(() => {
    setShowProjects(false);
    window.history.replaceState(null, "", window.location.pathname);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
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

  useEffect(() => {
    if (!showProjects) {
      return;
    }

    const storedPosition = consumeProjectsScrollPosition();
    if (storedPosition === null) {
      return;
    }

    requestAnimationFrame(() => {
      window.scrollTo({ top: storedPosition, behavior: "auto" });
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
            className="pt-20 md:pt-24"
            initial={skipInitialProjectsEnter ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: ANIMATION.FADE_DURATION,
              ease: ANIMATION.EASE,
            }}
          >
            <Navigation onBack={handleBack} />
            {projectData ? (
              <ProjectsContent
                featured={projectData.featured}
                top2={projectData.top2}
                top3={projectData.top3}
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
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
