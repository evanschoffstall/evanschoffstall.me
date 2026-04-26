"use client";

import type { Project } from "contentlayer/generated";

import { motion } from "framer-motion";

import { fadeInUp } from "@/shared";

import { ProjectsDivider } from "./ProjectsDivider";
import { ProjectsHeroGrid } from "./ProjectsHeroGrid";
import { ProjectsIntro } from "./ProjectsIntro";
import { ProjectsListSection } from "./ProjectsListSection";

/**
 * Featured cards, grouped project lists, and per-project view counts for the full projects surface.
 */
interface Props {
  featured: Project;
  second: Project;
  sorted: Project[];
  sortedContributions: Project[];
  sortedLegacy: Project[];
  third: Project;
  views: Record<string, number>;
}

/**
 * Composes the full projects index content, including hero cards and grouped lists.
 * @param props - Featured cards, grouped project lists, and public view counts.
 * @returns The complete projects page content.
 */
export function ProjectsContent(props: Props) {
  const {
    featured,
    second,
    sorted,
    sortedContributions,
    sortedLegacy,
    third,
    views,
  } = props;

  return (
    <div
      className="
      mx-auto max-w-5xl space-y-8 px-4 pb-16
      sm:px-6
    "
    >
      <ProjectsIntro />

      <motion.div animate="visible" initial="hidden" variants={fadeInUp}>
        <ProjectsDivider />
      </motion.div>

      <ProjectsHeroGrid
        featured={featured}
        second={second}
        third={third}
        views={views}
      />

      <ProjectsListSection projects={sorted} views={views} />
      <ProjectsListSection
        projects={sortedContributions}
        title="Contributions"
        views={views}
      />
      <ProjectsListSection
        projects={sortedLegacy}
        title="Legacy"
        views={views}
      />
    </div>
  );
}
