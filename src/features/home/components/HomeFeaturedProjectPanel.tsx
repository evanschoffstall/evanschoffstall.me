import type { Project } from "contentlayer/generated";

import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";

import { markInternalProjectNavigation } from "@/features/projects/browser";
import { ProjectActionLinks } from "@/features/projects/components";
import { resolveProjectExternalLinks } from "@/features/projects/model";
import {
  formatCompactNumber,
  formatDateTime,
  formatMediumDate,
} from "@/lib";

import { HomeGradientRule } from "./HomeGradientRule";

interface HomeFeaturedProjectPanelProps {
  featuredProject: Project;
  featuredViews: number;
}

/** Featured-project summary shown beside the home profile copy. */
export function HomeFeaturedProjectPanel({
  featuredProject,
  featuredViews,
}: HomeFeaturedProjectPanelProps) {
  const featuredLinks = resolveProjectExternalLinks(featuredProject);
  const featuredDateTime = featuredProject.date
    ? formatDateTime(featuredProject.date)
    : "";

  return (
    <div className="
      space-y-4 pt-5
      lg:pt-0
    ">
      <div className="
        mb-1 block
        lg:hidden
      ">
        <HomeGradientRule />
      </div>
      <HomeFeaturedProjectMeta
        featuredDateTime={featuredDateTime}
        featuredProject={featuredProject}
        featuredViews={featuredViews}
      />
      <HomeFeaturedProjectTitle featuredProject={featuredProject} />
      <p className="
        text-sm leading-7 text-zinc-400
        sm:text-[15px] sm:leading-relaxed
      ">
        {featuredProject.description}
      </p>
      <HomeFeaturedProjectActions
        featuredLinks={featuredLinks}
        featuredProject={featuredProject}
      />
    </div>
  );
}

/** Action row for the featured project card on the home overview. */
function HomeFeaturedProjectActions({
  featuredLinks,
  featuredProject,
}: {
  featuredLinks: ReturnType<typeof resolveProjectExternalLinks>;
  featuredProject: Project;
}) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      <Link
        className="
          inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/50
          bg-zinc-800/40 px-3 py-1.5 text-xs font-medium text-zinc-300
          transition-all duration-200
          hover:border-zinc-600 hover:bg-zinc-700/60 hover:text-white
        "
        href={`/projects/${featuredProject.slug}`}
        onClick={markInternalProjectNavigation}
      >
        Read notes <ArrowRight className="size-3" />
      </Link>
      <ProjectActionLinks links={featuredLinks} />
    </div>
  );
}

/** Metadata row for the featured project preview on the home overview. */
function HomeFeaturedProjectMeta({
  featuredDateTime,
  featuredProject,
  featuredViews,
}: {
  featuredDateTime: string;
  featuredProject: Project;
  featuredViews: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="
        inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5
        py-1 text-[11px] font-semibold text-amber-400 ring-1 ring-inset
        ring-amber-500/20
      ">
        <Star className="size-2.5 fill-current" /> Featured
      </span>
      {featuredProject.date && featuredDateTime ? (
        <time className="text-xs text-zinc-600" dateTime={featuredDateTime}>
          {formatMediumDate(featuredProject.date)}
        </time>
      ) : null}
      {featuredViews > 0 ? (
        <>
          <span aria-hidden className="select-none text-xs text-zinc-700">
            &middot;
          </span>
          <span className="text-xs text-zinc-600">
            {formatCompactNumber(featuredViews)} views
          </span>
        </>
      ) : null}
    </div>
  );
}

/** Title link for the featured project preview on the home overview. */
function HomeFeaturedProjectTitle({
  featuredProject,
}: {
  featuredProject: Project;
}) {
  return (
    <div>
      <Link
        className="group inline-block"
        href={`/projects/${featuredProject.slug}`}
        onClick={markInternalProjectNavigation}
      >
        <h2 className="
          inline-flex items-center gap-2.5 font-display text-2xl tracking-tight
          text-zinc-100 transition-colors duration-200
          group-hover:text-white
          sm:text-3xl
          lg:text-4xl
        ">
          {featuredProject.title}
          <ArrowRight className="
            size-6 shrink-0 text-zinc-600 transition-all duration-200
            group-hover:translate-x-1 group-hover:text-zinc-300
          " />
        </h2>
      </Link>
    </div>
  );
}