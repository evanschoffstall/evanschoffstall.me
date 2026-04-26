import type { Project } from "contentlayer/generated";

import { ArrowRight } from "lucide-react";

import { Card, FeaturedCard, Glow } from "@/components";

import { ProjectCardLink } from "./ProjectCardLink";
import {
  ProjectDateBadge,
  ProjectFeatureBadge,
  ProjectViewsBadge,
} from "./ProjectMeta";

/**
 * Accent mode for the card footer CTA row.
 */
interface HeroCardActionProps {
  featured: boolean;
}

/**
 * Project identity and display flags needed by the card body section.
 */
type HeroCardBodyProps = Pick<Props, "featured" | "headingId" | "project">;

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
interface Props {
  featured?: boolean;
  headingId?: string;
  project: Project;
  views: number;
}

/**
 * Renders a featured or standard project card within the projects surface.
 * @param props - Card display flags, project content, and public view count.
 * @returns The rendered project hero card.
 */
export function ProjectHeroCard(props: Props) {
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
