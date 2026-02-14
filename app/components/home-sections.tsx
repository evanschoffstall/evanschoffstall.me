"use client";

import type { Project } from "contentlayer/generated";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useLayoutEffect, useState } from "react";
import { ProjectsContent } from "../projects/projects-content";
import { HomeContent } from "./home-content";
import { Navigation } from "./nav";

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
  const [skipInitialProjectsEnter, setSkipInitialProjectsEnter] = useState(false);

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
    const syncFromHash = () => {
      const isProjectsHash = window.location.hash === "#projects";
      setSkipInitialProjectsEnter((previous) => previous || isProjectsHash);
      setShowProjects(isProjectsHash);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, []);

  return (
    <div className="relative">
      <motion.section
        animate={{ opacity: showProjects ? 0 : 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={showProjects ? "hidden" : "pointer-events-auto"}
      >
        <HomeContent onViewProjects={handleViewProjects} />
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
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
                <p className="text-zinc-400">Some featured projects are not available.</p>
              </div>
            )}
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
