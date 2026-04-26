"use client";

import type { Project } from "contentlayer/generated";

import { motion } from "framer-motion";

import { Card, Glow } from "@/components";
import { fadeInUp } from "@/shared";

import { ProjectListItem } from "./ProjectListItem";
import { ProjectsDivider } from "./ProjectsDivider";

/**
 * Minimal list data consumed by the animated card-list renderer inside a projects section.
 */
type ProjectsCardsListProps = Pick<
  ProjectsListSectionProps,
  "projects" | "views"
>;

/**
 * Title, project collection, and view-count map for one grouped section on the projects page.
 */
interface ProjectsListSectionProps {
  projects: Project[];
  title?: string;
  views: Record<string, number>;
}

/**
 * Reusable titled list section for standard, contribution, and legacy projects.
 * @param props - The project list, optional title, and public view counts.
 * @returns The animated project list section, or `null` when empty.
 */
export function ProjectsListSection(props: ProjectsListSectionProps) {
  const { projects, title, views } = props;

  if (projects.length === 0) {
    return null;
  }

  return (
    <motion.div animate="visible" initial="hidden" variants={fadeInUp}>
      {title ? (
        <div className="flex items-center gap-4 pt-4">
          <p
            className="
            shrink-0 text-[10px] font-semibold uppercase tracking-[0.3em]
            text-zinc-600
          "
          >
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

/**
 * Animated list of standard project cards.
 * @param props - The projects to render and their corresponding public view counts.
 * @returns The animated card list for a projects section.
 */
function ProjectsCardsList(props: ProjectsCardsListProps) {
  const { projects, views } = props;

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
            <ProjectListItem
              project={project}
              views={views[project.slug] ?? 0}
            />
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
