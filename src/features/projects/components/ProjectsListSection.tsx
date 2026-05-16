"use client";

import type { Project } from "contentlayer/generated";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Card, Glow } from "@/components";
import { EASE_IN_OUT, fadeInUp } from "@/shared";

import { ProjectCardLink } from "./ProjectCardLink";
import { ProjectDateBadge, ProjectViewsBadge } from "./ProjectMeta";

const dividerTransition = {
  duration: 0.8,
  ease: EASE_IN_OUT,
} as const;

/**
 * Project content and view-count data for one row in the projects list.
 */
interface ProjectListItemProps {
  project: Project;
  views: number;
}

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
            shrink-0 text-[10px] font-semibold tracking-[0.3em] text-zinc-600
            uppercase
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
 * Renders a standard list-row card for a project in the projects index.
 * @param props - The project content and current public view count.
 * @returns The clickable list row for a project.
 */
function ProjectListItem(props: ProjectListItemProps) {
  const { project, views } = props;

  return (
    <ProjectCardLink project={project}>
      <article
        className="
        flex h-full items-center justify-between gap-4 p-4
        md:px-6 md:py-5
      "
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-3">
            <h2
              className="
              truncate font-display text-base font-semibold tracking-tight
              text-zinc-100 transition-colors duration-300
              group-hover:text-white
            "
            >
              {project.title}
            </h2>
            <ProjectDateBadge project={project} />
          </div>
          <p
            className="
            line-clamp-1 text-sm text-zinc-400 transition-colors duration-300
            group-hover:text-zinc-300
          "
          >
            {project.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4 text-zinc-500">
          <ProjectViewsBadge
            className="
              hidden items-center gap-1.5 text-xs tabular-nums transition-colors
              duration-300
              group-hover:text-zinc-400
              sm:inline-flex
            "
            views={views}
          />
          <ArrowRight
            className="
            size-4 translate-x-0 transition-all duration-300
            group-hover:translate-x-1 group-hover:text-zinc-300
          "
          />
        </div>
      </article>
    </ProjectCardLink>
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

/**
 * Animated horizontal divider used between projects sections.
 * @returns The animated projects section divider.
 */
function ProjectsDivider() {
  return (
    <motion.div
      animate={{ opacity: 1, scaleX: 1 }}
      className="
        h-px w-full bg-linear-to-r from-transparent via-zinc-700/60
        to-transparent
      "
      initial={{ opacity: 0, scaleX: 0 }}
      style={{ transformOrigin: "left" }}
      transition={dividerTransition}
    />
  );
}
