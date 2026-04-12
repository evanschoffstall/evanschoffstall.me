import type { Project } from "contentlayer/generated";

import { ArrowRight } from "lucide-react";

import { Card, FeaturedCard, Glow } from "@/ui";

import { ProjectCardLink } from "./ProjectCardLink";
import {
  ProjectDateBadge,
  ProjectFeatureBadge,
  ProjectViewsBadge,
} from "./ProjectMeta";

interface Props {
  featured?: boolean;
  headingId?: string;
  project: Project;
  views: number;
}

export function ProjectHeroCard({
  featured = false,
  headingId,
  project,
  views,
}: Props) {
  const Wrapper = featured ? FeaturedCard : Card;

  return (
    <>
      <Glow />
      <Wrapper className="h-full">
        <ProjectCardLink project={project}>
          <article className="
            relative flex h-full flex-col justify-between p-4
            md:p-6
          ">
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

function HeroCardAction({ featured }: { featured: boolean }) {
  return (
    <div
      className={`
        mt-4 flex items-center gap-1 text-xs font-medium transition-colors
        duration-300
        ${featured ? `
          text-amber-700/70
          group-hover:text-amber-400
        ` : `
          text-zinc-500
          group-hover:text-zinc-300
        `}
      `}
    >
      <span>Read more</span>
      <ArrowRight className="
        size-3.5 translate-x-0 transition-transform duration-300
        group-hover:translate-x-1
      " />
    </div>
  );
}

function HeroCardBody({
  featured,
  headingId,
  project,
}: Pick<Props, "featured" | "headingId" | "project">) {
  return (
    <>
      <h2
        className={`
          mt-3 font-display text-xl font-bold tracking-tight transition-colors
          duration-300
          sm:text-2xl
          ${featured ? `
            text-zinc-100
            group-hover:text-amber-50
          ` : `
            text-zinc-100
            group-hover:text-white
          `}
        `}
        id={headingId}
      >
        {project.title}
      </h2>
      <p className="
        mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-400
        transition-colors duration-300
        group-hover:text-zinc-300
      ">
        {project.description}
      </p>
    </>
  );
}

function HeroCardMeta({
  featured,
  project,
  views,
}: {
  featured: boolean;
  project: Project;
  views: number;
}) {
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
