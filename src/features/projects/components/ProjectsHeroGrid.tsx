"use client";

import type { Project } from "contentlayer/generated";

import { motion } from "framer-motion";

import { EASE_IN_OUT, fadeInUp } from "@/shared";

import { ProjectHeroCard } from "./ProjectHeroCard";

interface ProjectsHeroGridProps {
  featured: Project;
  second: Project;
  third: Project;
  views: Record<string, number>;
}

/**
 * Featured grid at the top of the projects surface.
 * @param props - The featured project trio and the current public view counts.
 * @returns The animated featured projects grid.
 */
export function ProjectsHeroGrid(props: ProjectsHeroGridProps) {
  const { featured, second, third, views } = props;

  return (
    <motion.div
      animate="visible"
      className="space-y-4"
      initial="hidden"
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
          featured
          headingId="featured-post"
          project={featured}
          views={views[featured.slug] ?? 0}
        />
      </motion.div>
      <div
        className="
        grid grid-cols-1 gap-4
        sm:grid-cols-2
      "
      >
        {[second, third].map((project, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative"
            initial={{ opacity: 0, y: 40 }}
            key={project.slug}
            transition={{
              delay: 0.15 + index * 0.1,
              duration: 0.9,
              ease: EASE_IN_OUT,
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
  );
}
