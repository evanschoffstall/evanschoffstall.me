"use client";

import type { Project } from "contentlayer/generated";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Card, FeaturedCard, Glow } from "@/components";
import { EASE_IN_OUT, fadeInUp } from "@/shared";

import { ProjectCardLink } from "./ProjectCardLink";
import {
  ProjectDateBadge,
  ProjectFeatureBadge,
  ProjectViewsBadge,
} from "./ProjectMeta";
import { ProjectsListSection } from "./ProjectsListSection";

/**
 * Accent mode for the card footer CTA row.
 */
interface HeroCardActionProps {
  featured: boolean;
}

/**
 * Project identity and display flags needed by the card body section.
 */
type HeroCardBodyProps = Pick<
  ProjectHeroCardProps,
  "featured" | "headingId" | "project"
>;

/**
 * Project metadata shown in the top badge row of a hero card.
 */
interface HeroCardMetaProps {
  featured: boolean;
  project: Project;
  views: number;
}

/**
 * Content, emphasis mode, and view-count inputs for a project hero card.
 */
interface ProjectHeroCardProps {
  featured?: boolean;
  headingId?: string;
  project: Project;
  views: number;
}

/**
 * The featured project trio and view counts rendered in the top projects grid.
 */
interface ProjectsHeroGridProps {
  featured: Project;
  second: Project;
  third: Project;
  views: Record<string, number>;
}

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

const dividerTransition = {
  duration: 0.8,
  ease: EASE_IN_OUT,
} as const;

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

/**
 * Renders the trailing action row for a project hero card.
 * @param props - The featured flag that controls the card accent styling.
 * @returns The call-to-action row for the card footer.
 */
function HeroCardAction(props: HeroCardActionProps) {
  const { featured } = props;

  return (
    <div
      className={`
        mt-4 flex items-center gap-1 text-xs font-medium transition-colors
        duration-300
        ${
          featured
            ? `
          text-amber-700/70
          group-hover:text-amber-400
        `
            : `
          text-zinc-500
          group-hover:text-zinc-300
        `
        }
      `}
    >
      <span>Read more</span>
      <ArrowRight
        className="
        size-3.5 translate-x-0 transition-transform duration-300
        group-hover:translate-x-1
      "
      />
    </div>
  );
}

/**
 * Renders the title and description block for a project hero card.
 * @param props - Featured styling, heading wiring, and the project content.
 * @returns The main body content for the hero card.
 */
function HeroCardBody(props: HeroCardBodyProps) {
  const { featured, headingId, project } = props;

  return (
    <>
      <h2
        className={`
          mt-3 font-display text-xl font-bold tracking-tight transition-colors
          duration-300
          sm:text-2xl
          ${
            featured
              ? `
            text-zinc-100
            group-hover:text-amber-50
          `
              : `
            text-zinc-100
            group-hover:text-white
          `
          }
        `}
        id={headingId}
      >
        {project.title}
      </h2>
      <p
        className="
        mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-400
        transition-colors duration-300
        group-hover:text-zinc-300
      "
      >
        {project.description}
      </p>
    </>
  );
}

/**
 * Renders the metadata strip at the top of a project hero card.
 * @param props - Featured styling, project metadata, and the current view count.
 * @returns The metadata row for the hero card.
 */
function HeroCardMeta(props: HeroCardMetaProps) {
  const { featured, project, views } = props;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <ProjectFeatureBadge featured={featured} />
        <ProjectDateBadge project={project} />
      </div>
      <ProjectViewsBadge
        className="
          flex items-center gap-1.5 text-xs tabular-nums text-zinc-500
          transition-colors duration-300
          group-hover:text-zinc-400
        "
        views={views}
      />
    </div>
  );
}

/**
 * Renders a featured or standard project card within the projects surface.
 * @param props - Card display flags, project content, and public view count.
 * @returns The rendered project hero card.
 */
function ProjectHeroCard(props: ProjectHeroCardProps) {
  const { featured = false, headingId, project, views } = props;

  const Wrapper = featured ? FeaturedCard : Card;

  return (
    <>
      <Glow />
      <Wrapper className="h-full">
        <ProjectCardLink project={project}>
          <article
            className="
            relative flex h-full flex-col justify-between p-4
            md:p-6
          "
          >
            <div>
              <HeroCardMeta
                featured={featured}
                project={project}
                views={views}
              />
              <HeroCardBody
                featured={featured}
                headingId={headingId}
                project={project}
              />
            </div>
            <HeroCardAction featured={featured} />
          </article>
        </ProjectCardLink>
      </Wrapper>
    </>
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
        h-px w-full bg-gradient-to-r from-transparent via-zinc-700/60
        to-transparent
      "
      initial={{ opacity: 0, scaleX: 0 }}
      style={{ transformOrigin: "left" }}
      transition={dividerTransition}
    />
  );
}

/**
 * Featured grid at the top of the projects surface.
 * @param props - The featured project trio and the current public view counts.
 * @returns The animated featured projects grid.
 */
function ProjectsHeroGrid(props: ProjectsHeroGridProps) {
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

/**
 * Intro copy shown above the projects grid.
 * @returns The projects intro copy block.
 */
function ProjectsIntro() {
  return (
    <motion.div
      animate="visible"
      className="space-y-2"
      initial="hidden"
      variants={fadeInUp}
    >
      <p
        className="
        text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600
      "
      >
        Projects
      </p>
      <p className="text-sm leading-7 text-zinc-500">
        Some of the projects are from work and some are on my own time.
      </p>
    </motion.div>
  );
}
