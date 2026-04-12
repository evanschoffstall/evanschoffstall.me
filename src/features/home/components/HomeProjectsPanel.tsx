"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import type { HomeProjectData } from "@/features/home/model";

import { ANIMATION } from "@/lib";
import { Navigation, VirtualScrollArea } from "@/ui";

const loadProjectsContent = async () => {
  const module = await import("@/features/projects/components");

  return module.ProjectsContent;
};

const ProjectsContent = dynamic(loadProjectsContent, {
  loading: () => <div className="
    mx-auto max-w-5xl px-4 pb-16
    sm:px-6
  " />,
});

interface HomeProjectsPanelProps {
  onBack: () => void;
  projectData: HomeProjectData | null;
  projectsViewportRef: React.RefObject<HTMLDivElement | null>;
  skipInitialProjectsEnter: boolean;
}

/** Projects overlay shown when the home screen switches into projects mode. */
export function HomeProjectsPanel({
  onBack,
  projectData,
  projectsViewportRef,
  skipInitialProjectsEnter,
}: HomeProjectsPanelProps) {
  const scrollItems = useMemo(() => {
    return [
      {
        estimateSize: projectData ? 1600 : 260,
        key: "projects-content",
        node: (
          <div className="
            pt-20
            md:pt-24
          ">
            {projectData ? (
              <ProjectsContent
                featured={projectData.featured}
                second={projectData.second}
                sorted={projectData.sorted}
                sortedContributions={projectData.sortedContributions}
                sortedLegacy={projectData.sortedLegacy}
                third={projectData.third}
                views={projectData.views}
              />
            ) : (
              <div className="
                mx-auto max-w-7xl px-6 py-16
                md:py-24
                lg:px-8
              ">
                <p className="text-zinc-400">
                  Some featured projects are not available.
                </p>
              </div>
            )}
          </div>
        ),
      },
    ];
  }, [projectData]);

  return (
    <motion.section
      animate={{ opacity: 1 }}
      className="h-screen overflow-hidden"
      exit={{ opacity: 0 }}
      id="projects"
      initial={skipInitialProjectsEnter ? false : { opacity: 0 }}
      transition={{
        duration: ANIMATION.FADE_DURATION,
        ease: ANIMATION.EASE,
      }}
    >
      <Navigation label="Projects" onBack={onBack} />
      <VirtualScrollArea
        className="size-full"
        items={scrollItems}
        overscan={2}
        viewportRef={projectsViewportRef}
      />
    </motion.section>
  );
}

/** Warm the projects bundle so the overlay opens without a network-bound stall. */
export function preloadProjectsContent(): void {
  void loadProjectsContent();
}