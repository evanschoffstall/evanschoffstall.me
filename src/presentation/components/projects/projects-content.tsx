"use client";

import { EASE_IN_OUT, fadeInUp } from "@/shared/lib/motion";
import type { Project } from "contentlayer/generated";
import { motion } from "framer-motion";
import { Card } from "../common/card";
import { Glow } from "../common/glow";
import { Article } from "./article";
import { ProjectHeroCard } from "./project-hero-card";

const DIVIDER_ANIMATION = {
  duration: 0.8,
  ease: EASE_IN_OUT,
} as const;

type Props = {
  featured: Project;
  top2: Project;
  top3: Project;
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
      className="w-full h-px bg-zinc-800"
      style={{ transformOrigin: "left" }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={DIVIDER_ANIMATION}
    />
  );
}

function ProjectCardsList({ projects, views }: Pick<ProjectListSectionProps, "projects" | "views">) {
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

function ProjectListSection({ projects, views, title }: ProjectListSectionProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      {title ? (
        <div className="flex items-center gap-4 pt-4">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-100 shrink-0">
            {title}
          </h3>
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
  top2,
  top3,
  sorted,
  sortedContributions,
  sortedLegacy,
  views,
}: Props) {
  return (
    <div className="px-6 mx-auto space-y-8 max-w-7xl lg:px-8">
      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          Projects
        </h2>
        <p className="mt-4 text-zinc-400">
          Some of the projects are from work and some are on my own time.
        </p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        <AnimatedDivider />
      </motion.div>

      {/* Featured hero row */}
      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
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
          />
        </motion.div>
        {[top2, top3].map((project) => (
          <motion.div key={project.slug} className="relative" variants={fadeInUp}>
            <ProjectHeroCard
              project={project}
              views={views[project.slug] ?? 0}
            />
          </motion.div>
        ))}
      </motion.div>

      <ProjectListSection projects={sorted} views={views} />
      <ProjectListSection
        projects={sortedContributions}
        views={views}
        title="Contributions"
      />
      <ProjectListSection projects={sortedLegacy} views={views} title="Legacy" />
    </div>
  );
}
