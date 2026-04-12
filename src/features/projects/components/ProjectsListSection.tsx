"use client";

import type { Project } from "contentlayer/generated";

import { motion } from "framer-motion";

import { fadeInUp } from "@/lib";
import { Card, Glow } from "@/ui";

import { ProjectListItem } from "./ProjectListItem";
import { ProjectsDivider } from "./ProjectsDivider";

interface ProjectsListSectionProps {
  projects: Project[];
  title?: string;
  views: Record<string, number>;
}

/** Reusable titled list section for standard, contribution, and legacy projects. */
export function ProjectsListSection({
  projects,
  title,
  views,
}: ProjectsListSectionProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <motion.div animate="visible" initial="hidden" variants={fadeInUp}>
      {title ? (
        <div className="flex items-center gap-4 pt-4">
          <p className="
            shrink-0 text-[10px] font-semibold uppercase tracking-[0.3em]
            text-zinc-600
          ">
            {title}
          </p>
          <ProjectsDivider />
        </div>
      ) : (
        <ProjectsDivider />
      )}
      <ProjectsCardsList projects={projects} views={views} />
    </motion.div>
  );
}

/** Animated list of standard project cards. */
function ProjectsCardsList({
  projects,
  views,
}: Pick<ProjectsListSectionProps, "projects" | "views">) {
  return (
    <motion.div
      className="mt-8 space-y-2"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {projects.map((project) => (
        <motion.div
          className="
            relative [contain-intrinsic-size:196px] [content-visibility:auto]
          "
          key={project.slug}
          variants={fadeInUp}
        >
          <Glow />
          <Card>
            <ProjectListItem project={project} views={views[project.slug] ?? 0} />
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}