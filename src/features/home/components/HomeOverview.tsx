"use client";

import type { Project } from "contentlayer/generated";

import { ArrowRight, Layers, Star } from "lucide-react";
import Link from "next/link";

import {
  markInternalProjectNavigation,
  requestHomeIntroSkip,
} from "@/features/projects/browser";
import { ProjectActionLinks } from "@/features/projects/components";
import { resolveProjectExternalLinks } from "@/features/projects/model";
import {
  cn,
  formatCompactNumber,
  formatDateTime,
  formatMediumDate,
} from "@/shared";

/**
 * External links and project metadata needed to render the featured-project CTA row.
 */
interface HomeFeaturedProjectActionsProps {
  featuredLinks: ReturnType<typeof resolveProjectExternalLinks>;
  featuredProject: Project;
}

/**
 * Date and view metadata displayed at the top of the featured-project panel.
 */
interface HomeFeaturedProjectMetaProps {
  featuredDateTime: string;
  featuredProject: Project;
  featuredViews: number;
}

/**
 * Featured-project content and public view count shown in the home overview.
 */
interface HomeFeaturedProjectPanelProps {
  featuredProject: Project;
  featuredViews: number;
}

/**
 * Project identity used to render the featured-project title link.
 */
interface HomeFeaturedProjectTitleProps {
  featuredProject: Project;
}

/**
 * Featured-project data and CTA handlers rendered beneath the home hero.
 */
interface HomeOverviewProps {
  featuredProject?: Project;
  featuredViews?: number;
}

/** Display-ready stack badge definition for the home overview. */
interface HomeStackItem {
  label: string;
  tier: HomeStackTier;
}

/** Semantic group used to style core-stack items consistently. */
type HomeStackTier = "data" | "infra" | "lang" | "web";

const homeContextRows = [
  { label: "Experience", value: "gov, enterprise, startup" },
  { label: "Current", value: "State-level procurement" },
  { label: "Past", value: "Winery: zero → multimillion revenue" },
  { label: "Style", value: "IC through executive; hands-on throughout" },
] as const;

const homeStackItems: HomeStackItem[] = [
  { label: "TypeScript", tier: "lang" },
  { label: "Rust", tier: "lang" },
  { label: "Python", tier: "lang" },
  { label: "C#", tier: "lang" },
  { label: "React", tier: "web" },
  { label: "Next.js", tier: "web" },
  { label: "Node.js", tier: "web" },
  { label: ".NET", tier: "web" },
  { label: "Docker", tier: "infra" },
  { label: "Neon", tier: "infra" },
  { label: "Oracle", tier: "infra" },
  { label: "PostgreSQL", tier: "data" },
  { label: "Redis", tier: "data" },
];

const homeStackTierClassNames: Record<HomeStackTier, string> = {
  data: "bg-emerald-950/50 text-emerald-300 ring-emerald-700/40",
  infra: "bg-sky-950/50 text-sky-300 ring-sky-700/40",
  lang: "bg-violet-950/50 text-violet-300 ring-violet-700/40",
  web: "bg-blue-950/50 text-blue-300 ring-blue-700/40",
};

/**
 * Cardsless homepage body rendered beneath the animated hero name.
 *
 * Layout:
 *   - Bio (left) + Featured project (right) — two columns on lg+
 *   - "See all projects" slim row below both columns
 *   - Gradient rule
 *   - Context + Core Stack grid — technical depth as page anchor.
 *
 * Status badge and social links live in the nav bar (content.tsx).
 * @param props - Featured project data and navigation callbacks for the overview.
 * @returns The lower home-page overview content beneath the animated hero.
 */
export function HomeOverview(props: HomeOverviewProps) {
  const { featuredProject, featuredViews = 0 } = props;

  return (
    <div
      className="
      w-full space-y-6 pb-16
      sm:space-y-7 sm:pb-20
    "
    >
      <div
        className="
        grid grid-cols-1 gap-0
        lg:grid-cols-2 lg:items-start lg:gap-8
      "
      >
        <HomeBioPanel />
        {featuredProject ? (
          <HomeFeaturedProjectPanel
            featuredProject={featuredProject}
            featuredViews={featuredViews}
          />
        ) : null}
      </div>

      <HomeProjectsLink />

      <HomeGradientRule />

      <div
        className="
        grid grid-cols-1 gap-8
        sm:grid-cols-2 sm:gap-9
      "
      >
        <HomeContextSection />
        <div
          className="
          block
          sm:hidden
        "
        >
          <HomeGradientRule />
        </div>
        <HomeStackSection />
      </div>
    </div>
  );
}

/**
 * Introductory profile copy shown on the left side of the home overview.
 * @returns The profile copy block for the home overview layout.
 */
function HomeBioPanel() {
  return (
    <div className="space-y-3">
      <p
        className="
        text-[10px] font-semibold tracking-[0.3em] text-zinc-600 uppercase
      "
      >
        Technologist &middot; Engineer &middot; Business Officer
      </p>
      <p
        className="
        text-lg/7  font-medium text-zinc-200
        sm:text-xl/8 
        lg:text-2xl/9 
      "
      >
        I close the gap between engineering and outcome &mdash;{" "}
        <span className="text-zinc-400">
          writing code that ships, infrastructure that scales, and organizations
          that compound on both.
        </span>
      </p>
      <p className="text-sm/7  text-zinc-500">
        Experience across public sector, enterprise, and startups. Currently
        involved in state-level procurement; previously led a winery from
        inception to multimillion-dollar annual revenue.
      </p>
    </div>
  );
}

/**
 * Compact experience summary rendered in the lower home overview grid.
 * @returns The labeled context rows shown beside the core stack section.
 */
function HomeContextSection() {
  return (
    <div className="space-y-4">
      <p
        className="
        text-[10px] font-semibold tracking-[0.3em] text-zinc-600 uppercase
      "
      >
        Context
      </p>
      <dl className="space-y-2.5">
        {homeContextRows.map(({ label, value }) => (
          <div
            className="grid grid-cols-[6rem_1fr] gap-x-3 text-sm"
            key={label}
          >
            <dt className="text-zinc-600">{label}</dt>
            <dd className="text-zinc-400">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * Action row for the featured project card on the home overview.
 * @param props - The featured project's resolved external links and target project.
 * @returns The action row for reading notes or opening external destinations.
 */
function HomeFeaturedProjectActions(props: HomeFeaturedProjectActionsProps) {
  const { featuredLinks, featuredProject } = props;

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
        onClick={() => {
          markInternalProjectNavigation("featured");
        }}
      >
        Read notes <ArrowRight className="size-3" />
      </Link>
      <ProjectActionLinks links={featuredLinks} />
    </div>
  );
}

/**
 * Metadata row for the featured project preview on the home overview.
 * @param props - The formatted date, featured project, and current view count.
 * @returns The metadata strip shown above the featured project title.
 */
function HomeFeaturedProjectMeta(props: HomeFeaturedProjectMetaProps) {
  const { featuredDateTime, featuredProject, featuredViews } = props;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        className="
        inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5
        py-1 text-[11px] font-semibold text-amber-400 ring-1 ring-amber-500/20
        ring-inset
      "
      >
        <Star className="size-2.5 fill-current" />
        Featured
      </span>
      {featuredProject.date && featuredDateTime ? (
        <time className="text-xs text-zinc-600" dateTime={featuredDateTime}>
          {formatMediumDate(featuredProject.date)}
        </time>
      ) : null}
      {featuredViews > 0 ? (
        <>
          <span aria-hidden className="text-xs text-zinc-700 select-none">
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

/**
 * Featured-project summary shown beside the home profile copy.
 * @param props - The featured project content and current public view count.
 * @returns The featured project panel rendered in the home overview.
 */
function HomeFeaturedProjectPanel(props: HomeFeaturedProjectPanelProps) {
  const { featuredProject, featuredViews } = props;

  const featuredLinks = resolveProjectExternalLinks(featuredProject);
  const featuredDateTime = featuredProject.date
    ? formatDateTime(featuredProject.date)
    : "";

  return (
    <div
      className="
      space-y-4 pt-5
      lg:pt-0
    "
    >
      <div
        className="
        mb-1 block
        lg:hidden
      "
      >
        <HomeGradientRule />
      </div>
      <HomeFeaturedProjectMeta
        featuredDateTime={featuredDateTime}
        featuredProject={featuredProject}
        featuredViews={featuredViews}
      />
      <HomeFeaturedProjectTitle featuredProject={featuredProject} />
      <p
        className="
        text-sm/7  text-zinc-400
        sm:text-[15px] sm:leading-relaxed
      "
      >
        {featuredProject.description}
      </p>
      <HomeFeaturedProjectActions
        featuredLinks={featuredLinks}
        featuredProject={featuredProject}
      />
    </div>
  );
}

/**
 * Title link for the featured project preview on the home overview.
 * @param props - The featured project whose title links to the detail page.
 * @returns The heading link for the featured project card.
 */
function HomeFeaturedProjectTitle(props: HomeFeaturedProjectTitleProps) {
  const { featuredProject } = props;

  return (
    <div>
      <Link
        className="group inline-block"
        href={`/projects/${featuredProject.slug}`}
        onClick={() => {
          markInternalProjectNavigation("featured");
        }}
      >
        <h2
          className="
          inline-flex items-center gap-2.5 font-display text-2xl tracking-tight
          text-zinc-100 transition-colors duration-200
          group-hover:text-white
          sm:text-3xl
          lg:text-4xl
        "
        >
          {featuredProject.title}
          <ArrowRight
            className="
            size-6 shrink-0 text-zinc-600 transition-all duration-200
            group-hover:translate-x-1 group-hover:text-zinc-300
          "
          />
        </h2>
      </Link>
    </div>
  );
}

/**
 * Thin horizontal gradient rule used as a section separator.
 * @returns A decorative horizontal divider for home sections.
 */
function HomeGradientRule() {
  return (
    <div
      aria-hidden
      className="
        h-px w-full bg-linear-to-r from-transparent via-zinc-700/60
        to-transparent
      "
    />
  );
}

/**
 * Entry point from the home overview into the canonical projects route.
 * @returns The projects CTA link rendered beneath the overview content.
 */
function HomeProjectsLink() {
  return (
    <Link
      className="
        group flex w-full items-center justify-between rounded-lg border
        border-zinc-800/70 bg-zinc-900/30 px-3 py-2.5 text-left transition-all
        duration-200
        hover:border-zinc-700/80 hover:bg-zinc-800/40
      "
      href="/projects"
      onClick={requestHomeIntroSkip}
    >
      <span
        className="
        flex items-center gap-2 text-xs text-zinc-500 transition-colors
        duration-200
        group-hover:text-zinc-300
      "
      >
        <Layers className="size-3.5 shrink-0" />
        See all projects
      </span>
      <ArrowRight
        className="
        size-3.5 shrink-0 text-zinc-700 transition-all duration-200
        group-hover:translate-x-0.5 group-hover:text-zinc-400
      "
      />
    </Link>
  );
}

/**
 * Core stack badge grid rendered in the lower home overview grid.
 * @returns The badge list for the technologies highlighted on the home page.
 */
function HomeStackSection() {
  return (
    <div className="space-y-4">
      <p
        className="
        text-[10px] font-semibold tracking-[0.3em] text-zinc-600 uppercase
      "
      >
        Core Stack
      </p>
      <div className="flex flex-wrap gap-1.5">
        {homeStackItems.map(({ label, tier }) => (
          <span
            className={cn(
              `
                inline-flex items-center rounded-md px-2 py-0.5 text-[11px]
                font-medium ring-1 ring-inset
              `,
              homeStackTierClassNames[tier],
            )}
            key={label}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
