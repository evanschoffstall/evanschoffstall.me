"use client";

import { EASE_IN_OUT, fadeInUp } from "@/shared/motion";
import type { Project } from "contentlayer/generated";
import { motion } from "framer-motion";
import { Card } from "../common/card";
import { Glow } from "../common/glow";
import { Article } from "./article";
import { ProjectHeroCard } from "./hero-card";

const DIVIDER_ANIMATION = {
  duration: 0.8,
  ease: EASE_IN_OUT,
} as const;

type Props = {
  featured: Project;
  second: Project;
  third: Project;
  sorted: Project[];
  sortedContributions: Project[];
  sortedLegacy: Project[];
  views: Record<string, number>;
};

type ProjectListSectionProps = {
  projects: Project[];
  views: Record<string, number>;
  title?: string;
};

function AnimatedDivider() {
  return (
    <motion.div
      className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent"
      style={{ transformOrigin: "left" }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={DIVIDER_ANIMATION}
    />
  );
}

function ProjectCardsList({
  projects,
  views,
}: Pick<ProjectListSectionProps, "projects" | "views">) {
  return (
    <motion.div
      className="space-y-2 mt-8"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {projects.map((project) => (
        <motion.div key={project.slug} className="relative" variants={fadeInUp}>
          <Glow />
          <Card>
            <Article project={project} views={views[project.slug] ?? 0} />
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

function ProjectListSection({
  projects,
  views,
  title,
}: ProjectListSectionProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      {title ? (
        <div className="flex items-center gap-4 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600 shrink-0">
            {title}
          </p>
          <AnimatedDivider />
        </div>
      ) : (
        <AnimatedDivider />
      )}
      <ProjectCardsList projects={projects} views={views} />
    </motion.div>
  );
}

export function ProjectsContent({
  featured,
  second,
  third,
  sorted,
  sortedContributions,
  sortedLegacy,
  views,
}: Props) {
  return (
    <div className="px-4 sm:px-6 mx-auto space-y-8 max-w-5xl pb-16">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="space-y-2"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600">
          Projects
        </p>
        <p className="text-sm leading-7 text-zinc-500">
          Some of the projects are from work and some are on my own time.
        </p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        <AnimatedDivider />
      </motion.div>

      {/* Featured hero — full-width amber card on top, second + third in a 2-col row below */}
      <motion.div
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <motion.div className="relative" variants={fadeInUp}>
          <ProjectHeroCard
            project={featured}
            views={views[featured.slug] ?? 0}
            headingId="featured-post"
            featured
          />
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[second, third].map((project, i) => (
            <motion.div
              key={project.slug}
              className="relative"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                ease: EASE_IN_OUT,
                delay: 0.15 + i * 0.1,
              }}
            >
              <ProjectHeroCard
                project={project}
                views={views[project.slug] ?? 0}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <ProjectListSection projects={sorted} views={views} />
      <ProjectListSection
        projects={sortedContributions}
        views={views}
        title="Contributions"
      />
      <ProjectListSection
        projects={sortedLegacy}
        views={views}
        title="Legacy"
      />
    </div>
  );
}
