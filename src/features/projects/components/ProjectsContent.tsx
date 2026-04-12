"use client";

import type { Project } from "contentlayer/generated";

import { motion } from "framer-motion";

import { fadeInUp } from "@/lib";

import { ProjectsDivider } from "./ProjectsDivider";
import { ProjectsHeroGrid } from "./ProjectsHeroGrid";
import { ProjectsIntro } from "./ProjectsIntro";
import { ProjectsListSection } from "./ProjectsListSection";

interface Props {
  featured: Project;
  second: Project;
  sorted: Project[];
  sortedContributions: Project[];
  sortedLegacy: Project[];
  third: Project;
  views: Record<string, number>;
}

export function ProjectsContent({
  featured,
  second,
  sorted,
  sortedContributions,
  sortedLegacy,
  third,
  views,
}: Props) {
  return (
    <div className="
      mx-auto max-w-5xl space-y-8 px-4 pb-16
      sm:px-6
    ">
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
