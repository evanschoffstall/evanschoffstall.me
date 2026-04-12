import type { Project } from "contentlayer/generated";

import { ArrowRight } from "lucide-react";

import { ProjectCardLink } from "./ProjectCardLink";
import {
  ProjectDateBadge,
  ProjectViewsBadge,
} from "./ProjectMeta";

interface Props {
  project: Project;
  views: number;
}

export function ProjectListItem({ project, views }: Props) {
  return (
    <ProjectCardLink project={project}>
      <article className="
        flex h-full items-center justify-between gap-4 p-4
        md:px-6 md:py-5
      ">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="
              truncate font-display text-base font-semibold tracking-tight
              text-zinc-100 transition-colors duration-300
              group-hover:text-white
            ">
              {project.title}
            </h2>
            <ProjectDateBadge project={project} />
          </div>
          <p className="
            line-clamp-1 text-sm text-zinc-400 transition-colors duration-300
            group-hover:text-zinc-300
          ">
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
          <ArrowRight className="
            size-4 translate-x-0 transition-all duration-300
            group-hover:translate-x-1 group-hover:text-zinc-300
          " />
        </div>
      </article>
    </ProjectCardLink>
  );
}
